import {
  planRocketAction,
  type Personality,
  type RocketActionPlan,
  type WeaponId,
} from "../ai/RocketActionPlanner";
import {
  planLocalMovement,
  type LocalMovementPlan,
} from "../movement/LocalMovementPlanner";
import { planExecution, type PlannedExecution } from "./executionSpread";
import {
  activeSimulationUnit,
  plannerUnitsFromSimulation,
  type MatchSimulationState,
} from "./matchSimulationState";

/**
 * Zugplanung der Match-Engine – die frühere Logik aus MatchScene.replan(),
 * unverändert übernommen: Bewegungskandidaten, kombinierte Bewertung aus
 * Bewegung und Waffenplan, Loadout-Präferenz mit Fallback auf das freie
 * Arsenal sowie Waffenbefehl und „Lass das!“ über den Simulationszustand.
 */

/** Zugseed-Formel aus der Szene vor der Extraktion – nicht verändern. */
export const TURN_SEED_STRIDE = 9_973;

export type TurnPlanKind = "attack" | "reposition" | "skip";

export interface TurnPlan {
  readonly activeUnitId: string;
  readonly personality: Personality;
  readonly turnSeed: number;
  readonly movement: LocalMovementPlan;
  readonly action: RocketActionPlan;
  /**
   * attack: gültiger Waffenplan vorhanden. reposition: nur Positionszug.
   * skip: weder Waffenplan noch Bewegung – der Zug wird übersprungen.
   */
  readonly kind: TurnPlanKind;
  /** Loadout-Präferenz, die in diese Planung eingeflossen ist. */
  readonly usedPreferredWeaponId: WeaponId | null;
  /** Die Präferenz fand keinen Plan; es gilt das freie Arsenal. */
  readonly preferenceFellBack: boolean;
  /**
   * Streukegel-Ausführung des gewählten Kandidaten (Task 024): steht bereits
   * zur Planungszeit deterministisch fest; null bei reinen Positionszügen.
   */
  readonly execution: PlannedExecution | null;
}

export function turnSeedFor(state: MatchSimulationState): number {
  return state.seed + state.matchState.turnNumber * TURN_SEED_STRIDE;
}

export function planTurn(state: MatchSimulationState): TurnPlan {
  const active = activeSimulationUnit(state);
  const personality = active.personality;
  const plannerUnits = plannerUnitsFromSimulation(state);
  const turnSeed = turnSeedFor(state);
  const preferredWeaponId =
    active.team === "crew" &&
    !state.preferenceConsumedByUnitId.has(active.id) &&
    !state.forcedWeaponId
      ? state.preferredWeaponByUnitId.get(active.id)
      : undefined;
  const planningWeaponIds: readonly WeaponId[] = state.forcedWeaponId
    ? [state.forcedWeaponId]
    : preferredWeaponId
      ? [preferredWeaponId]
      : ["rocket", "grenade", "breaker"];
  const movementCandidates = planLocalMovement({
    terrain: state.terrain,
    units: plannerUnits,
    activeUnitId: active.id,
    personality,
    seed: turnSeed,
  });
  let best:
    | {
        movement: LocalMovementPlan;
        plan: RocketActionPlan;
        combinedScore: number;
      }
    | undefined;
  let fallbackPlan: RocketActionPlan | undefined;

  for (const movement of movementCandidates) {
    const movedUnits = plannerUnits.map((unit) =>
      unit.id === active.id
        ? { ...unit, position: { ...movement.destination } }
        : unit,
    );
    const weaponPlan = planRocketAction({
      terrain: state.terrain,
      units: movedUnits,
      activeUnitId: active.id,
      personality,
      seed: turnSeed,
      rejectedCandidateIds: state.rejectedCandidateIds,
      weaponIds: planningWeaponIds,
    });
    fallbackPlan ??= weaponPlan;

    if (!weaponPlan.selected) {
      continue;
    }

    const combinedScore = weaponPlan.selected.score + movement.score;
    if (
      !best ||
      combinedScore > best.combinedScore ||
      (combinedScore === best.combinedScore &&
        movement.id.localeCompare(best.movement.id) < 0)
    ) {
      best = { movement, plan: weaponPlan, combinedScore };
    }
  }

  if (preferredWeaponId && !best) {
    state.preferenceConsumedByUnitId.add(active.id);
    const freeArsenalPlan = planTurn(state);
    return {
      ...freeArsenalPlan,
      usedPreferredWeaponId: preferredWeaponId,
      preferenceFellBack: true,
    };
  }

  if (preferredWeaponId) {
    state.preferenceConsumedByUnitId.add(active.id);
  }

  const movement = best?.movement ?? movementCandidates[0];
  const action = best?.plan ?? fallbackPlan;

  if (!movement || !action) {
    throw new Error("Turn planning produced no movement or action plan.");
  }

  return {
    activeUnitId: active.id,
    personality,
    turnSeed,
    movement,
    action,
    kind: action.selected
      ? "attack"
      : movement.kind !== "hold"
        ? "reposition"
        : "skip",
    usedPreferredWeaponId: preferredWeaponId ?? null,
    preferenceFellBack: false,
    execution: action.selected
      ? planExecution(state.terrain, action.selected, personality, turnSeed)
      : null,
  };
}
