import {
  planLocalMovement,
  type LocalMovementPlan,
} from "../movement/LocalMovementPlanner";
import {
  activeSimulationUnit,
  plannerUnitsFromSimulation,
  type MatchSimulationState,
} from "./matchSimulationState";
import { turnSeedFor } from "./planTurn";

/**
 * Manuelle Bewegungsoptionen (Task 011, Ausbau): Der Spieler wählt selbst ein
 * Laufziel oder einen Sprung. Die Auswahl stammt aus demselben
 * deterministischen, terrain-sicheren `planLocalMovement`, das die KI nutzt –
 * so bleibt Bewegung ohne neue Physik gültig und begrenzt (190 Weltpunkte).
 * Zusätzlich steht immer die „hier bleiben“-Option zur Verfügung.
 */

export function manualMovementOptions(
  state: MatchSimulationState,
): readonly LocalMovementPlan[] {
  const active = activeSimulationUnit(state);
  const plans = planLocalMovement({
    terrain: state.terrain,
    units: plannerUnitsFromSimulation(state),
    activeUnitId: active.id,
    personality: active.personality,
    seed: turnSeedFor(state),
  });
  const holdPlan: LocalMovementPlan = {
    id: "manual-hold",
    kind: "hold",
    start: { ...active.position },
    destination: { ...active.position },
    samples: [{ ...active.position }],
    distance: 0,
    durationSeconds: 0,
    score: 0,
    reason: "bleibt stehen",
  };
  const moves = plans.filter((plan) => plan.kind !== "hold");

  return [holdPlan, ...moves];
}

/** Wendet ein gewähltes Bewegungsziel auf den Simulationszustand an. */
export function applyManualMovement(
  state: MatchSimulationState,
  movement: LocalMovementPlan,
): void {
  if (movement.kind === "hold") {
    return;
  }

  const active = activeSimulationUnit(state);
  active.position.x = movement.destination.x;
  active.position.y = movement.destination.y;
}
