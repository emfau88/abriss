import {
  calculateBlastDamage,
  type RocketCandidate,
} from "../ai/RocketActionPlanner";
import type {
  RocketTrajectoryResult,
  Vector2,
} from "../ballistics/Ballistics";
import {
  simulateExplosionKnockback,
  type ExplosionKnockbackResult,
} from "../movement/ExplosionKnockback";
import type { LocalMovementPlan } from "../movement/LocalMovementPlanner";
import { fallDamageForDrop, resolveTerrainFall } from "../movement/TerrainFall";
import {
  resolveReactionChain,
  type InteractableObject,
} from "../interactables/interactables";
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
      /** Ausgeführte Flugbahn aus dem Streukegel (Task 024). */
      readonly executedTrajectory: RocketTrajectoryResult;
    }
  | {
      readonly type: "terrain-mutated";
      readonly mutation: TerrainMutation;
      readonly center: Vector2;
      readonly radius: number;
    }
  | {
      // Task 028: Ein interaktives Objekt (Fass) detoniert als Teil der
      // Reaktionskette. Die eigentlichen Folgen (Terrain, Schaden, Rückstoß)
      // erscheinen als die üblichen Folge-Events – so sehen Chronik,
      // Präsentation und Tests die Kette ohne Sonderfall.
      readonly type: "interactable-triggered";
      readonly interactableId: string;
      readonly center: Vector2;
      readonly radius: number;
      /** Kettentiefe: 1 = direkt vom Schuss, 2 = von einem anderen Fass usw. */
      readonly depth: number;
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
      /**
       * Fall-Schaden aus der Sturzhöhe (0 bei kleinen Stürzen unter der
       * Schwelle bzw. bei „supported"/„out-of-world"). Wird direkt hier
       * verrechnet, nicht als separates damage-applied, damit ein Sturz nicht
       * fälschlich als Treffer gewertet wird.
       */
      readonly damage: number;
      readonly remainingHitPoints: number;
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

  // Task 024: Fachlich zählt die ausgeführte Flugbahn aus dem Streukegel,
  // nicht die angekündigte Absicht.
  const executedTrajectory =
    turnPlan.execution?.trajectory ?? candidate.trajectory;

  events.push({
    type: "projectile-resolved",
    unitId: active.id,
    candidate,
    executedTrajectory,
  });

  const explosion = executedTrajectory.explosion;

  if (!explosion) {
    return events;
  }

  // Primärexplosion des Projektils (unverändertes Verhalten für Karten ohne
  // interaktive Objekte – der Golden Master bleibt dadurch stabil).
  applyExplosionEffects(
    state,
    {
      center: explosion.center,
      radius: explosion.radius,
      maximumDamage: candidate.maximumDamage,
      maximumKnockbackSpeed: candidate.maximumKnockbackSpeed,
    },
    events,
  );

  // Task 028: Reaktionskette – im Radius liegende Fässer detonieren und
  // erzeugen ihre eigenen Explosionen (deterministisch, tiefenbegrenzt). Jede
  // Fass-Detonation läuft durch dieselbe Effektlogik wie die Primärexplosion.
  resolveInteractableChain(state, explosion, events);

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
          damage: 0,
          remainingHitPoints: unit.hitPoints,
        });
      }
      continue;
    }

    const toY =
      resolution.state === "fall"
        ? resolution.landingY
        : state.terrain.worldHeight + WORLD_EXIT_FALL_MARGIN;
    unit.position.y = toY;

    // Fall-Schaden nur bei echtem Sturz auf Boden; ein Sturz aus der Welt tötet
    // ohnehin komplett und braucht keinen zusätzlichen Höhenschaden.
    const fallDamage =
      resolution.state === "fall" ? fallDamageForDrop(resolution.distance) : 0;

    if (fallDamage > 0) {
      unit.hitPoints = Math.max(0, unit.hitPoints - fallDamage);
    }

    const defeated =
      resolution.state === "out-of-world" || unit.hitPoints <= 0;

    if (resolution.state === "out-of-world") {
      unit.hitPoints = 0;
    }

    events.push({
      type: "fall-resolved",
      unitId: unit.id,
      state: resolution.state,
      fromY,
      toY,
      defeated,
      damage: fallDamage,
      remainingHitPoints: unit.hitPoints,
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

interface ExplosionEffect {
  readonly center: Vector2;
  readonly radius: number;
  readonly maximumDamage: number;
  readonly maximumKnockbackSpeed: number;
}

/**
 * Task 028: Wendet eine einzelne Explosion auf Terrain und Figuren an –
 * Terrain entfernen, Schaden (vor Rückstoß), dann Rückstoß. Diese Reihenfolge
 * ist exakt die frühere Inline-Logik der Primärexplosion, jetzt geteilt von
 * Projektil- und Fass-Explosionen. Fall-Auflösung läuft bewusst NICHT hier,
 * sondern einmal am Ende des Zuges, damit mehrere Explosionen dieselbe
 * abschließende Sturzprüfung teilen.
 */
function applyExplosionEffects(
  state: MatchSimulationState,
  explosion: ExplosionEffect,
  events: MatchTurnEvent[],
): void {
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
        explosion.maximumDamage,
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
      maximumSpeed: explosion.maximumKnockbackSpeed,
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
}

/**
 * Task 028: Löst die Fass-Kette einer Primärexplosion auf und wendet jede
 * Fass-Detonation an. `resolveReactionChain` bestimmt deterministisch, welche
 * Fässer in welcher Reihenfolge und Tiefe detonieren; hier werden ihre
 * Zustände gesetzt und ihre Explosionen wie Primärexplosionen ausgeführt.
 */
function resolveInteractableChain(
  state: MatchSimulationState,
  primary: { center: Vector2; radius: number },
  events: MatchTurnEvent[],
): void {
  if (state.interactables.length === 0) {
    return;
  }

  const chain = resolveReactionChain({
    trigger: { center: primary.center, radius: primary.radius },
    interactables: state.interactables,
  });

  if (chain.explosions.length === 0) {
    return;
  }

  const byId = new Map<string, InteractableObject>();
  for (const object of state.interactables) {
    byId.set(object.id, object);
  }

  for (const explosion of chain.explosions) {
    // `explosions` enthält ausschließlich Fass-Detonationen, die Quelle ist
    // daher immer ein bekanntes Fass.
    const barrel = byId.get(explosion.sourceInteractableId);

    if (barrel) {
      barrel.state = "destroyed";
    }

    events.push({
      type: "interactable-triggered",
      interactableId: explosion.sourceInteractableId,
      center: { ...explosion.center },
      radius: explosion.radius,
      depth: explosion.depth,
    });

    applyExplosionEffects(
      state,
      {
        center: explosion.center,
        radius: explosion.radius,
        maximumDamage: explosion.maximumDamage,
        maximumKnockbackSpeed: explosion.maximumKnockbackSpeed,
      },
      events,
    );
  }
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
