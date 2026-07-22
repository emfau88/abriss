import {
  calculateBlastDamage,
  type RocketCandidate,
} from "../ai/RocketActionPlanner";
import type { Vector2 } from "../ballistics/Ballistics";
import {
  simulateExplosionKnockback,
  type ExplosionKnockbackResult,
} from "../movement/ExplosionKnockback";
import type { LocalMovementPlan } from "../movement/LocalMovementPlanner";
import { resolveTerrainFall } from "../movement/TerrainFall";
import {
  advanceTurn,
  determineMatchOutcome,
  updateCombatantHitPoints,
  type TeamId,
} from "../state/matchState";
import type { TerrainMutation } from "../terrain/TerrainMask";
import {
  activeSimulationUnit,
  type MatchSimulationState,
} from "./matchSimulationState";
import type { TurnPlan } from "./planTurn";

/**
 * Zugauflösung der Match-Engine – die frühere fachliche Logik aus
 * MatchScene.completeAction(), applyPredictedDamage(),
 * createKnockbackAnimations() und resolveFallsAfterTerrainChange().
 * resolveTurn() mutiert den Simulationszustand und liefert ein
 * deterministisches Ereignisprotokoll; die Szene spielt daraus nur noch
 * Animationen ab. concludeTurn() bildet den früheren Zugwechsel aus
 * scheduleTurnAdvance() ab und wird von der Szene erst nach Abschluss der
 * Präsentation aufgerufen, damit HUD und Kamera dieselbe Reihenfolge sehen
 * wie vor der Extraktion.
 */

/** Sturz aus der Welt endet wie zuvor 150 Weltpunkte unter dem Weltrand. */
export const WORLD_EXIT_FALL_MARGIN = 150;

export type MatchTurnEvent =
  | {
      readonly type: "turn-skipped";
      readonly unitId: string;
    }
  | {
      readonly type: "movement-resolved";
      readonly unitId: string;
      readonly movement: LocalMovementPlan;
    }
  | {
      readonly type: "projectile-resolved";
      readonly unitId: string;
      readonly candidate: RocketCandidate;
    }
  | {
      readonly type: "terrain-mutated";
      readonly mutation: TerrainMutation;
      readonly center: Vector2;
      readonly radius: number;
    }
  | {
      readonly type: "damage-applied";
      readonly unitId: string;
      readonly damage: number;
      readonly remainingHitPoints: number;
    }
  | {
      readonly type: "knockback-resolved";
      readonly unitId: string;
      readonly result: ExplosionKnockbackResult;
      readonly defeatedOutOfWorld: boolean;
    }
  | {
      readonly type: "fall-resolved";
      readonly unitId: string;
      readonly state: "supported" | "fall" | "out-of-world";
      readonly fromY: number;
      readonly toY: number;
      readonly defeated: boolean;
    };

export type TurnConclusion =
  | { readonly kind: "match-ended"; readonly outcome: TeamId | "draw" }
  | {
      readonly kind: "next-turn";
      readonly turnNumber: number;
      readonly activeUnitId: string;
    };

export function resolveTurn(
  state: MatchSimulationState,
  turnPlan: TurnPlan,
): readonly MatchTurnEvent[] {
  const active = activeSimulationUnit(state);

  if (active.id !== turnPlan.activeUnitId) {
    throw new Error(
      `Turn plan belongs to ${turnPlan.activeUnitId}, but ${active.id} is active.`,
    );
  }

  const events: MatchTurnEvent[] = [];

  if (turnPlan.kind === "skip") {
    events.push({ type: "turn-skipped", unitId: active.id });
    return events;
  }

  if (turnPlan.movement.kind !== "hold") {
    active.position.x = turnPlan.movement.destination.x;
    active.position.y = turnPlan.movement.destination.y;
    events.push({
      type: "movement-resolved",
      unitId: active.id,
      movement: turnPlan.movement,
    });
  }

  const candidate = turnPlan.action.selected;

  if (!candidate) {
    return events;
  }

  events.push({
    type: "projectile-resolved",
    unitId: active.id,
    candidate,
  });

  const explosion = candidate.trajectory.explosion;

  if (!explosion) {
    return events;
  }

  const mutation = state.terrain.removeCircle(
    explosion.center.x,
    explosion.center.y,
    explosion.radius,
  );
  events.push({
    type: "terrain-mutated",
    mutation,
    center: { ...explosion.center },
    radius: explosion.radius,
  });

  // Schaden vor Rückstoß, auf den Positionen zum Explosionszeitpunkt –
  // identisch zur früheren Reihenfolge in completeAction().
  const affectedUnits = [];

  for (const unit of state.units) {
    if (unit.hitPoints <= 0) {
      continue;
    }

    const damage = Math.round(
      calculateBlastDamage(
        explosion.center,
        unit.position,
        explosion.radius,
        candidate.maximumDamage,
      ),
    );

    if (damage <= 0) {
      continue;
    }

    unit.hitPoints = Math.max(0, unit.hitPoints - damage);
    affectedUnits.push(unit);
    events.push({
      type: "damage-applied",
      unitId: unit.id,
      damage,
      remainingHitPoints: unit.hitPoints,
    });
  }

  for (const unit of affectedUnits) {
    const result = simulateExplosionKnockback({
      terrain: state.terrain,
      startPosition: { ...unit.position },
      explosionCenter: explosion.center,
      explosionRadius: explosion.radius,
      maximumSpeed: candidate.maximumKnockbackSpeed,
    });

    if (result.outcome === "unaffected") {
      continue;
    }

    const lastSample = result.samples[result.samples.length - 1];

    if (lastSample) {
      unit.position.x = lastSample.position.x;
      unit.position.y = lastSample.position.y;
    }

    const defeatedOutOfWorld = result.outcome === "out-of-world";

    if (defeatedOutOfWorld) {
      unit.hitPoints = 0;
    }

    events.push({
      type: "knockback-resolved",
      unitId: unit.id,
      result,
      defeatedOutOfWorld,
    });
  }

  for (const unit of state.units) {
    // Figuren, die bereits außerhalb der Welt liegen, können nicht erneut
    // fallen; die frühere Szene hätte hier eine Exception aus findGroundY
    // ausgelöst (latenter Absturz, bewusst behoben in Task 021).
    if (
      unit.position.x < 0 ||
      unit.position.x >= state.terrain.worldWidth ||
      unit.position.y + state.terrain.cellSize > state.terrain.worldHeight
    ) {
      continue;
    }

    const resolution = resolveTerrainFall(
      state.terrain,
      unit.position.x,
      unit.position.y,
    );
    const fromY = unit.position.y;

    if (resolution.state === "supported") {
      if (resolution.landingY !== fromY) {
        unit.position.y = resolution.landingY;
        events.push({
          type: "fall-resolved",
          unitId: unit.id,
          state: "supported",
          fromY,
          toY: resolution.landingY,
          defeated: false,
        });
      }
      continue;
    }

    const toY =
      resolution.state === "fall"
        ? resolution.landingY
        : state.terrain.worldHeight + WORLD_EXIT_FALL_MARGIN;
    unit.position.y = toY;
    const defeated = resolution.state === "out-of-world";

    if (defeated) {
      unit.hitPoints = 0;
    }

    events.push({
      type: "fall-resolved",
      unitId: unit.id,
      state: resolution.state,
      fromY,
      toY,
      defeated,
    });
  }

  for (const unit of state.units) {
    state.matchState = updateCombatantHitPoints(
      state.matchState,
      unit.id,
      unit.hitPoints,
    );
  }

  return events;
}

export function concludeTurn(state: MatchSimulationState): TurnConclusion {
  const outcome = determineMatchOutcome(state.matchState);

  if (outcome) {
    return { kind: "match-ended", outcome };
  }

  state.matchState = advanceTurn(state.matchState);
  state.rejectedCandidateIds = [];
  state.forcedWeaponId = null;

  return {
    kind: "next-turn",
    turnNumber: state.matchState.turnNumber,
    activeUnitId: state.matchState.activeCombatantId,
  };
}
