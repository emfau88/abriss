import type {
  Personality,
  PlannerUnit,
  WeaponId,
} from "../ai/RocketActionPlanner";
import {
  EXPLOSIVE_BARREL_DEFAULTS,
  type InteractableDefinition,
  type InteractableObject,
} from "../interactables/interactables";
import {
  createInitialMatchState,
  type MatchState,
  type TeamId,
} from "../state/matchState";
import type { BinaryTerrainMask } from "../terrain/TerrainMask";

/**
 * Fachlicher Zustand eines laufenden Matches, unabhängig von Phaser, DOM und
 * Systemzeit. Dieses Modul ist die einzige Autorität über Figurenpositionen,
 * Trefferpunkte, Persönlichkeiten und Managerkommandos; die Szene liest diesen
 * Zustand und stellt ihn nur noch dar (Task 021).
 */

export interface MatchUnitDefinition {
  readonly id: string;
  readonly displayName: string;
  readonly team: TeamId;
  readonly spawnX: number;
  readonly personality: Personality;
  readonly preferredWeaponId?: WeaponId;
}

export interface SimulationUnit {
  readonly id: string;
  readonly displayName: string;
  readonly team: TeamId;
  readonly maximumHitPoints: number;
  readonly position: { x: number; y: number };
  hitPoints: number;
  personality: Personality;
}

export interface MatchSimulationState {
  readonly seed: number;
  readonly terrain: BinaryTerrainMask;
  readonly units: readonly SimulationUnit[];
  /** Interaktive Map-Objekte (Task 028); ihr Zustand ändert sich im Match. */
  readonly interactables: readonly InteractableObject[];
  matchState: MatchState;
  /** Vom Manager per „Lass das!“ verworfene Kandidaten des laufenden Zugs. */
  rejectedCandidateIds: readonly string[];
  /** Einmalige Manager-Intervention „Lass das!“ bereits verbraucht? */
  interventionUsed: boolean;
  /** Einmaliger Manager-Waffenbefehl bereits verbraucht? */
  weaponCommandUsed: boolean;
  /** Für den laufenden Zug erzwungene Waffe (Waffenbefehl). */
  forcedWeaponId: WeaponId | null;
  readonly preferredWeaponByUnitId: ReadonlyMap<string, WeaponId>;
  readonly preferenceConsumedByUnitId: Set<string>;
}

export interface MatchSimulationOptions {
  readonly seed: number;
  readonly terrain: BinaryTerrainMask;
  readonly unitDefinitions: readonly MatchUnitDefinition[];
  /** Optionale interaktive Objekte der Karte (Task 028). */
  readonly interactableDefinitions?: readonly InteractableDefinition[];
}

const UNIT_HIT_POINTS = 140;
const SPAWN_PROBE_TOP = 80;
const SPAWN_PROBE_BOTTOM_INSET = 20;

export function createMatchSimulation(
  options: MatchSimulationOptions,
): MatchSimulationState {
  const preferredWeaponByUnitId = new Map<string, WeaponId>();
  const units: SimulationUnit[] = options.unitDefinitions.map((definition) => {
    const groundY = options.terrain.findGroundY(
      definition.spawnX,
      SPAWN_PROBE_TOP,
      options.terrain.worldHeight - SPAWN_PROBE_BOTTOM_INSET,
    );

    if (groundY === null) {
      throw new Error(`No terrain below unit ${definition.id}.`);
    }

    if (definition.preferredWeaponId) {
      preferredWeaponByUnitId.set(definition.id, definition.preferredWeaponId);
    }

    return {
      id: definition.id,
      displayName: definition.displayName,
      team: definition.team,
      maximumHitPoints: UNIT_HIT_POINTS,
      position: { x: definition.spawnX, y: groundY },
      hitPoints: UNIT_HIT_POINTS,
      personality: definition.personality,
    };
  });

  const interactables: InteractableObject[] = (
    options.interactableDefinitions ?? []
  ).map((definition) => {
    const groundY = options.terrain.findGroundY(
      definition.spawnX,
      SPAWN_PROBE_TOP,
      options.terrain.worldHeight - SPAWN_PROBE_BOTTOM_INSET,
    );

    if (groundY === null) {
      throw new Error(`No terrain below interactable ${definition.id}.`);
    }

    // Erster und bislang einziger Typ: explosives Fass (Task 028).
    return {
      id: definition.id,
      type: definition.type,
      position: { x: definition.spawnX, y: groundY },
      state: "intact" as const,
      explosionRadius: EXPLOSIVE_BARREL_DEFAULTS.explosionRadius,
      maximumDamage: EXPLOSIVE_BARREL_DEFAULTS.maximumDamage,
      maximumKnockbackSpeed: EXPLOSIVE_BARREL_DEFAULTS.maximumKnockbackSpeed,
    };
  });

  return {
    seed: options.seed,
    terrain: options.terrain,
    units,
    interactables,
    matchState: createInitialMatchState({
      seed: options.seed,
      combatants: units.map((unit) => ({
        id: unit.id,
        team: unit.team,
        hitPoints: unit.hitPoints,
      })),
    }),
    rejectedCandidateIds: [],
    interventionUsed: false,
    weaponCommandUsed: false,
    forcedWeaponId: null,
    preferredWeaponByUnitId,
    preferenceConsumedByUnitId: new Set(),
  };
}

export function activeSimulationUnit(
  state: MatchSimulationState,
): SimulationUnit {
  const active = state.units.find(
    (unit) => unit.id === state.matchState.activeCombatantId,
  );

  if (!active) {
    throw new Error(
      `Active unit ${state.matchState.activeCombatantId} is missing from the simulation.`,
    );
  }

  return active;
}

export function plannerUnitsFromSimulation(
  state: MatchSimulationState,
): PlannerUnit[] {
  return state.units.map((unit) => ({
    id: unit.id,
    displayName: unit.displayName,
    team: unit.team,
    position: { ...unit.position },
    hitPoints: unit.hitPoints,
  }));
}

/** JSON-fähiger Schnappschuss für Tests, Diagnose und Protokolle. */
export function serializeMatchSimulation(state: MatchSimulationState): object {
  return {
    seed: state.seed,
    terrainVersion: state.terrain.version,
    matchState: state.matchState,
    rejectedCandidateIds: [...state.rejectedCandidateIds],
    interventionUsed: state.interventionUsed,
    weaponCommandUsed: state.weaponCommandUsed,
    forcedWeaponId: state.forcedWeaponId,
    preferenceConsumedUnitIds: [...state.preferenceConsumedByUnitId].sort(),
    interactables: state.interactables.map((object) => ({
      id: object.id,
      type: object.type,
      state: object.state,
      position: {
        x: Math.round(object.position.x * 100) / 100,
        y: Math.round(object.position.y * 100) / 100,
      },
    })),
    units: state.units.map((unit) => ({
      id: unit.id,
      team: unit.team,
      personality: unit.personality,
      hitPoints: unit.hitPoints,
      position: {
        x: Math.round(unit.position.x * 100) / 100,
        y: Math.round(unit.position.y * 100) / 100,
      },
    })),
  };
}
