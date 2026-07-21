import type { Personality, PlannerUnit } from "../ai/RocketActionPlanner";
import { keyedSignedVariation } from "../random/SeededRandom";
import type { TerrainMask } from "../terrain/TerrainMask";

export type LocalMovementKind = "hold" | "walk" | "jump";

export interface LocalMovementSample {
  readonly x: number;
  readonly y: number;
}

export interface LocalMovementPlan {
  readonly id: string;
  readonly kind: LocalMovementKind;
  readonly start: LocalMovementSample;
  readonly destination: LocalMovementSample;
  readonly samples: readonly LocalMovementSample[];
  readonly distance: number;
  readonly durationSeconds: number;
  readonly score: number;
  readonly reason: string;
}

export interface LocalMovementPlannerInput {
  readonly terrain: TerrainMask;
  readonly units: readonly PlannerUnit[];
  readonly activeUnitId: string;
  readonly personality: Personality;
  readonly seed: number;
  readonly maximumHorizontalDistance?: number;
  readonly maximumRise?: number;
  readonly maximumDrop?: number;
}

const DEFAULT_MAXIMUM_HORIZONTAL_DISTANCE = 190;
const DEFAULT_MAXIMUM_RISE = 138;
const DEFAULT_MAXIMUM_DROP = 220;
const UNIT_CLEARANCE = 72;

export function planLocalMovement(
  input: LocalMovementPlannerInput,
): readonly LocalMovementPlan[] {
  const active = input.units.find((unit) => unit.id === input.activeUnitId);

  if (!active) {
    throw new Error(`Unknown active unit: ${input.activeUnitId}`);
  }

  const target = input.units
    .filter((unit) => unit.team !== active.team && unit.hitPoints > 0)
    .sort(
      (left, right) =>
        distance(active.position, left.position) -
        distance(active.position, right.position),
    )[0];
  const maximumHorizontalDistance =
    input.maximumHorizontalDistance ?? DEFAULT_MAXIMUM_HORIZONTAL_DISTANCE;
  const maximumRise = input.maximumRise ?? DEFAULT_MAXIMUM_RISE;
  const maximumDrop = input.maximumDrop ?? DEFAULT_MAXIMUM_DROP;
  const direction = target
    ? Math.sign(target.position.x - active.position.x) || 1
    : 1;
  const offsets = uniqueNumbers([
    0,
    direction * 70,
    direction * 125,
    direction * maximumHorizontalDistance,
    -direction * 70,
    -direction * 125,
  ]);
  const plans: LocalMovementPlan[] = [];

  for (const offset of offsets) {
    const destinationX = clamp(
      active.position.x + offset,
      28,
      input.terrain.worldWidth - 28,
    );

    if (Math.abs(destinationX - active.position.x) < 1) {
      plans.push(
        createHoldPlan(active, target, input.personality, input.seed),
      );
      continue;
    }

    const destinationY = input.terrain.findGroundY(
      destinationX,
      Math.max(0, active.position.y - maximumRise - 20),
      Math.min(
        input.terrain.worldHeight - 1,
        active.position.y + maximumDrop,
      ),
    );

    if (
      destinationY === null ||
      active.position.y - destinationY > maximumRise ||
      destinationY - active.position.y > maximumDrop ||
      !hasStandingClearance(input.terrain, destinationX, destinationY) ||
      !hasUnitClearance(input.units, active.id, destinationX, destinationY)
    ) {
      continue;
    }

    const walkSamples = sampleWalkPath(
      input.terrain,
      active.position,
      { x: destinationX, y: destinationY },
    );
    const jumpSamples = sampleJumpPath(
      input.terrain,
      active.position,
      { x: destinationX, y: destinationY },
    );
    const variants: readonly {
      kind: Exclude<LocalMovementKind, "hold">;
      samples: readonly LocalMovementSample[];
    }[] = [
      ...(walkSamples ? [{ kind: "walk" as const, samples: walkSamples }] : []),
      ...(jumpSamples ? [{ kind: "jump" as const, samples: jumpSamples }] : []),
    ];

    for (const variant of variants) {
      const travelled = Math.abs(destinationX - active.position.x);
      const score = scoreMovement(
        variant.kind,
        active.position,
        { x: destinationX, y: destinationY },
        target?.position,
        input.personality,
        keyedSignedVariation(
          input.seed,
          `${active.id}:${variant.kind}:${Math.round(destinationX)}`,
        ),
      );
      plans.push({
        id: `${variant.kind}:${Math.round(destinationX)}:${Math.round(destinationY)}`,
        kind: variant.kind,
        start: { ...active.position },
        destination: { x: destinationX, y: destinationY },
        samples: variant.samples,
        distance: travelled,
        durationSeconds:
          variant.kind === "walk"
            ? clamp(travelled / 105, 0.85, 1.8)
            : clamp(0.82 + travelled / 300, 1, 1.55),
        score,
        reason:
          variant.kind === "jump"
            ? "springt auf eine bessere Schussposition"
            : "läuft in eine bessere Schussposition",
      });
    }
  }

  return plans.sort(
    (left, right) => right.score - left.score || left.id.localeCompare(right.id),
  );
}

function createHoldPlan(
  active: PlannerUnit,
  target: PlannerUnit | undefined,
  personality: Personality,
  seed: number,
): LocalMovementPlan {
  return {
    id: "hold",
    kind: "hold",
    start: { ...active.position },
    destination: { ...active.position },
    samples: [{ ...active.position }],
    distance: 0,
    durationSeconds: 0,
    score:
      scoreMovement(
        "hold",
        active.position,
        active.position,
        target?.position,
        personality,
        keyedSignedVariation(seed, `${active.id}:hold`),
      ) + 3,
    reason: "hält die aktuelle Position",
  };
}

function sampleWalkPath(
  terrain: TerrainMask,
  start: LocalMovementSample,
  destination: LocalMovementSample,
): readonly LocalMovementSample[] | null {
  const steps = Math.max(2, Math.ceil(Math.abs(destination.x - start.x) / 10));
  const samples: LocalMovementSample[] = [{ ...start }];
  let previousY = start.y;

  for (let index = 1; index <= steps; index += 1) {
    const progress = index / steps;
    const x = lerp(start.x, destination.x, progress);
    const y = terrain.findGroundY(x, previousY - 16, previousY + 22);

    if (
      y === null ||
      Math.abs(y - previousY) > 16 ||
      !hasStandingClearance(terrain, x, y)
    ) {
      return null;
    }

    samples.push({ x, y });
    previousY = y;
  }

  if (Math.abs(previousY - destination.y) > 18) {
    return null;
  }

  return samples;
}

function sampleJumpPath(
  terrain: TerrainMask,
  start: LocalMovementSample,
  destination: LocalMovementSample,
): readonly LocalMovementSample[] | null {
  const steps = 28;
  const rise = Math.max(82, start.y - destination.y + 54);
  const samples: LocalMovementSample[] = [];

  for (let index = 0; index <= steps; index += 1) {
    const progress = index / steps;
    const x = lerp(start.x, destination.x, progress);
    const y =
      lerp(start.y, destination.y, progress) -
      Math.sin(progress * Math.PI) * rise;

    if (
      index > 0 &&
      index < steps &&
      (terrain.isSolid(x, y - 24) || terrain.isSolid(x, y - 54))
    ) {
      return null;
    }

    samples.push({ x, y });
  }

  return samples;
}

function hasStandingClearance(
  terrain: TerrainMask,
  x: number,
  groundY: number,
): boolean {
  return !terrain.isSolid(x, groundY - 24) && !terrain.isSolid(x, groundY - 58);
}

function hasUnitClearance(
  units: readonly PlannerUnit[],
  activeUnitId: string,
  x: number,
  y: number,
): boolean {
  return units.every(
    (unit) =>
      unit.id === activeUnitId ||
      unit.hitPoints <= 0 ||
      Math.hypot(unit.position.x - x, unit.position.y - y) >= UNIT_CLEARANCE,
  );
}

function scoreMovement(
  kind: LocalMovementKind,
  start: LocalMovementSample,
  destination: LocalMovementSample,
  target: LocalMovementSample | undefined,
  personality: Personality,
  variation: number,
): number {
  const travelled = Math.abs(destination.x - start.x);
  const heightGain = start.y - destination.y;
  const currentTargetDistance = target ? distance(start, target) : 0;
  const destinationTargetDistance = target ? distance(destination, target) : 0;
  const approachGain = currentTargetDistance - destinationTargetDistance;
  let score = kind === "hold" ? 0 : 11;
  score += heightGain * 0.12 + approachGain * 0.035 - travelled * 0.018;

  if (personality === "cautious") {
    score += kind === "walk" ? 5 : kind === "jump" ? -2 : 4;
    score -= Math.max(0, 430 - destinationTargetDistance) * 0.06;
  } else if (personality === "explosive") {
    score += approachGain * 0.055 + (kind === "hold" ? -4 : 3);
  } else {
    score += kind === "jump" ? 18 : kind === "walk" ? 4 : -3;
    score += Math.max(0, heightGain) * 0.12;
  }

  return score + variation * 1.5;
}

function uniqueNumbers(values: readonly number[]): readonly number[] {
  return [...new Set(values.map((value) => Math.round(value * 1000) / 1000))];
}

function distance(left: LocalMovementSample, right: LocalMovementSample): number {
  return Math.hypot(left.x - right.x, left.y - right.y);
}

function lerp(start: number, end: number, progress: number): number {
  return start + (end - start) * progress;
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, value));
}
