import type {
  RocketActionPlan,
  RocketCandidate,
  WeaponId,
} from "../ai/RocketActionPlanner";
import type {
  LocalMovementKind,
  LocalMovementPlan,
  LocalMovementSample,
} from "../movement/LocalMovementPlanner";

/**
 * Kleine, absichtlich grobe Raster statt allgemeinem Ähnlichkeits-Clustering:
 * Unterschiede unterhalb dieser Größen wirken im aktuellen Kameramaßstab wie
 * Varianten desselben Plans.
 */
export const PLAN_FAMILY_MOVEMENT_BUCKET_SIZE = 120;
export const PLAN_FAMILY_IMPACT_BUCKET_SIZE = 120;

export interface PlanFamilyInput {
  readonly targetId: string;
  readonly weaponId: WeaponId;
  readonly movementKind: LocalMovementKind;
  readonly movementDestination: LocalMovementSample;
  readonly impactPoint: LocalMovementSample;
}

/** Deterministische, serialisierbare Kennung einer sichtbar gleichen Idee. */
export function planFamilyKey(input: PlanFamilyInput): string {
  return [
    input.targetId,
    input.weaponId,
    input.movementKind,
    bucket(input.movementDestination.x, PLAN_FAMILY_MOVEMENT_BUCKET_SIZE),
    bucket(input.movementDestination.y, PLAN_FAMILY_MOVEMENT_BUCKET_SIZE),
    bucket(input.impactPoint.x, PLAN_FAMILY_IMPACT_BUCKET_SIZE),
    bucket(input.impactPoint.y, PLAN_FAMILY_IMPACT_BUCKET_SIZE),
  ].join("|");
}

export function planFamilyKeyFor(
  movement: LocalMovementPlan,
  candidate: RocketCandidate,
): string {
  const finalSample = candidate.trajectory.samples.at(-1)?.position;
  const impactPoint =
    candidate.trajectory.explosion?.center ?? finalSample ?? candidate.input.startPosition;

  return planFamilyKey({
    targetId: candidate.targetId,
    weaponId: candidate.weaponId,
    movementKind: movement.kind,
    movementDestination: movement.destination,
    impactPoint,
  });
}

/**
 * Filtert erst auf der kombinierten Bewegungs-/Aktionsstufe. Nur dort ist der
 * Bewegungsbereich bekannt; der Ballistikplaner selbst bleibt unverändert.
 */
export function withoutRejectedPlanFamilies(
  plan: RocketActionPlan,
  movement: LocalMovementPlan,
  rejectedFamilyKeys: readonly string[],
): RocketActionPlan {
  if (rejectedFamilyKeys.length === 0) {
    return plan;
  }

  const rejected = new Set(rejectedFamilyKeys);
  const rankedCandidates = plan.rankedCandidates.filter(
    (candidate) => !rejected.has(planFamilyKeyFor(movement, candidate)),
  );

  return {
    ...plan,
    rankedCandidates,
    selected: rankedCandidates[0] ?? null,
  };
}

export function describePlanFamily(candidate: RocketCandidate): string {
  return `${candidate.weaponName} gegen ${candidate.targetName} aus diesem Positions- und Einschlagsbereich`;
}

function bucket(value: number, size: number): number {
  return Math.round(value / size);
}
