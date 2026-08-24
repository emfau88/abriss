import type { Personality, WeaponId } from "../ai/RocketActionPlanner";
import {
  activeSimulationUnit,
  type MatchSimulationState,
} from "./matchSimulationState";
import type { TurnPlan } from "./planTurn";
import {
  describePlanFamily,
  planFamilyKeyFor,
} from "./planFamily";

/**
 * Managerkommandos der Match-Engine – die fachlichen Anteile der früheren
 * Szenenmethoden rejectCurrentPlan(), chooseManagerWeapon() und
 * cyclePersonality(). Die Szene prüft weiterhin nur ihren Ablaufzustand
 * (Planungsphase) und reicht Eingaben durch; alle fachlichen Guards und
 * Zustandsänderungen passieren hier.
 */

export const PERSONALITY_CYCLE: readonly Personality[] = [
  "cautious",
  "explosive",
  "showboat",
];

export interface RejectPlanResult {
  readonly accepted: boolean;
  readonly rejectedCandidateId: string | null;
  readonly rejectedPlanFamilyKey: string | null;
  readonly rejectedPlanFamilyDescription: string | null;
}

/** Einmalige Intervention „Lass das!“: verwirft den angekündigten Plan. */
export function rejectActivePlan(
  state: MatchSimulationState,
  turnPlan: TurnPlan,
): RejectPlanResult {
  const active = activeSimulationUnit(state);
  const selected = turnPlan.action.selected;

  if (active.team !== "crew" || state.interventionUsed || !selected) {
    return {
      accepted: false,
      rejectedCandidateId: null,
      rejectedPlanFamilyKey: null,
      rejectedPlanFamilyDescription: null,
    };
  }

  const rejectedPlanFamilyKey = planFamilyKeyFor(turnPlan.movement, selected);
  state.rejectedCandidateIds = [selected.id];
  state.rejectedPlanFamilyKeys = [rejectedPlanFamilyKey];
  state.interventionUsed = true;
  return {
    accepted: true,
    rejectedCandidateId: selected.id,
    rejectedPlanFamilyKey,
    rejectedPlanFamilyDescription: describePlanFamily(selected),
  };
}

export interface CommandWeaponResult {
  readonly accepted: boolean;
}

export interface DirectTargetResult {
  readonly accepted: boolean;
  readonly targetId: string | null;
}

/**
 * Hybridmodus: delegiert nur das gegnerische Ziel. Bewegung, Waffenwahl,
 * Flugbahn und Ausführung bleiben vollständig beim Planner.
 */
export function directActiveTarget(
  state: MatchSimulationState,
  targetId: string,
): DirectTargetResult {
  const active = activeSimulationUnit(state);
  const target = state.units.find((unit) => unit.id === targetId);

  if (
    active.team !== "crew" ||
    !target ||
    target.team === active.team ||
    target.hitPoints <= 0
  ) {
    return { accepted: false, targetId: null };
  }

  state.directedTargetId = target.id;
  state.rejectedCandidateIds = [];
  state.rejectedPlanFamilyKeys = [];
  return { accepted: true, targetId: target.id };
}

/** Einmaliger Waffenbefehl: erzwingt die Waffe für die nächste Planung. */
export function commandWeapon(
  state: MatchSimulationState,
  weaponId: WeaponId,
): CommandWeaponResult {
  const active = activeSimulationUnit(state);

  if (active.team !== "crew" || state.weaponCommandUsed) {
    return { accepted: false };
  }

  state.weaponCommandUsed = true;
  state.forcedWeaponId = weaponId;
  state.rejectedCandidateIds = [];
  state.rejectedPlanFamilyKeys = [];
  return { accepted: true };
}

export interface CyclePersonalityResult {
  readonly accepted: boolean;
  readonly personality: Personality | null;
}

/** Prototyp-Kommando: wechselt die Persönlichkeit der aktiven Crew-Figur. */
export function cycleActivePersonality(
  state: MatchSimulationState,
): CyclePersonalityResult {
  const active = activeSimulationUnit(state);

  if (active.team !== "crew") {
    return { accepted: false, personality: null };
  }

  const currentIndex = PERSONALITY_CYCLE.indexOf(active.personality);
  active.personality =
    PERSONALITY_CYCLE[(currentIndex + 1) % PERSONALITY_CYCLE.length] ??
    "cautious";
  return { accepted: true, personality: active.personality };
}
