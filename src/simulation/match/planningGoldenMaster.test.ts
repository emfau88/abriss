import { describe, expect, it } from "vitest";

import { MAP_DEFINITIONS, MAP_IDS } from "../../content/maps/mapCatalog";
import {
  FIGHTER_IDS,
  FIGHTER_ROSTER,
  type FighterId,
} from "../../manager/fighterRoster";
import {
  planRocketAction,
  type Personality,
  type PlannerUnit,
  type RocketActionPlan,
  type WeaponId,
} from "../ai/RocketActionPlanner";
import {
  planLocalMovement,
  type LocalMovementPlan,
} from "../movement/LocalMovementPlanner";
import type { TeamId } from "../state/matchState";
import type { BinaryTerrainMask } from "../../simulation/terrain/TerrainMask";
import { loadTerrainMaskForMap } from "../../testing/pngTerrain";
import {
  createMatchSimulation,
  type MatchSimulationState,
  type MatchUnitDefinition,
} from "./matchSimulationState";
import { planTurn, type TurnPlan } from "./planTurn";

/**
 * Golden Master für Task 021, Schritt 0.
 *
 * Dieser Test friert das Planungsverhalten ein, das `MatchScene.replan()`
 * vor der Extraktion der headless Match-Engine gezeigt hat. Die Funktion
 * `frozenScenePlanning` ist eine bewusst eingefrorene Kopie der Szenenlogik
 * (inklusive Zugseed-Formel, Waffenpräferenz mit Fallback, Waffenbefehl,
 * „Lass das!“ und kombinierter Bewegungs-/Waffenbewertung) und darf bei
 * späteren Refactorings NICHT angepasst werden – sie ist die Referenz.
 */

const DEFAULT_SEED = 21_072_026;
const SEEDS = [DEFAULT_SEED, DEFAULT_SEED + 101] as const;
const TURN_SEED_STRIDE = 9_973;
const RIVAL_FIGHTERS = ["hornling", "slime", "ghost"] as const;

interface ScenarioUnit {
  readonly id: string;
  readonly displayName: string;
  readonly team: TeamId;
  readonly position: { readonly x: number; readonly y: number };
  readonly hitPoints: number;
  readonly personality: Personality;
  readonly preferredWeaponId?: WeaponId;
}

interface Scenario {
  readonly terrain: BinaryTerrainMask;
  readonly units: readonly ScenarioUnit[];
  /** Für den Vergleich mit der Engine ab Schritt 2. */
  readonly definitions: readonly MatchUnitDefinition[];
}

interface FrozenPlanningOptions {
  readonly rejectedCandidateIds?: readonly string[];
  readonly forcedWeaponId?: WeaponId | null;
  readonly preferenceConsumed?: boolean;
}

interface FrozenPlanningResult {
  readonly movementId: string;
  readonly movementKind: LocalMovementPlan["kind"];
  readonly destination: { readonly x: number; readonly y: number };
  readonly movementScore: string;
  readonly selectedCandidateId: string | null;
  readonly weaponId: WeaponId | null;
  readonly targetId: string | null;
  readonly candidateScore: string | null;
  readonly preferenceFellBack: boolean;
}

function buildScenario(mapId: (typeof MAP_IDS)[number], slot0: FighterId): Scenario {
  const map = MAP_DEFINITIONS[mapId];
  const terrain = loadTerrainMaskForMap(map);
  const crewFighters: readonly FighterId[] = [
    slot0,
    ...FIGHTER_IDS.filter((fighterId) => fighterId !== slot0).slice(0, 2),
  ];
  const units: ScenarioUnit[] = [];
  const definitions: MatchUnitDefinition[] = [];

  crewFighters.forEach((fighterId, index) => {
    const fighter = FIGHTER_ROSTER[fighterId];
    const rival = FIGHTER_ROSTER[RIVAL_FIGHTERS[index] ?? RIVAL_FIGHTERS[0]];
    const crewX = map.crewSpawnXs[index] ?? map.crewSpawnXs[0];
    const rivalX = map.rivalSpawnXs[index] ?? map.rivalSpawnXs[0];
    const crewY = terrain.findGroundY(crewX, 80, terrain.worldHeight - 20);
    const rivalY = terrain.findGroundY(rivalX, 80, terrain.worldHeight - 20);

    if (crewY === null || rivalY === null) {
      throw new Error(`No spawn ground on map ${mapId}.`);
    }

    units.push({
      id: `crew-${fighter.id}`,
      displayName: fighter.displayName,
      team: "crew",
      position: { x: crewX, y: crewY },
      hitPoints: 140,
      personality: fighter.personality,
      preferredWeaponId: fighter.preferredWeaponId,
    });
    units.push({
      id: `rival-${index + 1}`,
      displayName: `RIVALE ${String.fromCharCode(65 + index)}`,
      team: "rivals",
      position: { x: rivalX, y: rivalY },
      hitPoints: 140,
      personality: rival.personality,
    });
    definitions.push({
      id: `crew-${fighter.id}`,
      displayName: fighter.displayName,
      team: "crew",
      spawnX: crewX,
      personality: fighter.personality,
      preferredWeaponId: fighter.preferredWeaponId,
    });
    definitions.push({
      id: `rival-${index + 1}`,
      displayName: `RIVALE ${String.fromCharCode(65 + index)}`,
      team: "rivals",
      spawnX: rivalX,
      personality: rival.personality,
    });
  });

  return { terrain, units, definitions };
}

/** Eingefrorene Kopie von MatchScene.replan() – nicht verändern. */
function frozenScenePlanning(
  scenario: Scenario,
  activeUnitId: string,
  seed: number,
  turnNumber: number,
  options: FrozenPlanningOptions = {},
): FrozenPlanningResult {
  const active = scenario.units.find((unit) => unit.id === activeUnitId);

  if (!active) {
    throw new Error(`Unknown active unit: ${activeUnitId}`);
  }

  const personality = active.personality;
  const plannerUnits: PlannerUnit[] = scenario.units.map((unit) => ({
    id: unit.id,
    displayName: unit.displayName,
    team: unit.team,
    position: { ...unit.position },
    hitPoints: unit.hitPoints,
  }));
  const turnSeed = seed + turnNumber * TURN_SEED_STRIDE;
  const forcedWeaponId = options.forcedWeaponId ?? null;
  const preferredWeaponId =
    active.team === "crew" && !options.preferenceConsumed && !forcedWeaponId
      ? active.preferredWeaponId
      : undefined;
  const planningWeaponIds: readonly WeaponId[] = forcedWeaponId
    ? [forcedWeaponId]
    : preferredWeaponId
      ? [preferredWeaponId]
      : ["rocket", "grenade", "breaker"];
  const movementCandidates = planLocalMovement({
    terrain: scenario.terrain,
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
      terrain: scenario.terrain,
      units: movedUnits,
      activeUnitId: active.id,
      personality,
      seed: turnSeed,
      rejectedCandidateIds: options.rejectedCandidateIds ?? [],
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
    const fallback = frozenScenePlanning(scenario, activeUnitId, seed, turnNumber, {
      ...options,
      preferenceConsumed: true,
    });
    return { ...fallback, preferenceFellBack: true };
  }

  const movement = best?.movement ?? movementCandidates[0]!;
  const plan = best?.plan ?? fallbackPlan!;

  return {
    movementId: movement.id,
    movementKind: movement.kind,
    destination: {
      x: Math.round(movement.destination.x),
      y: Math.round(movement.destination.y),
    },
    movementScore: movement.score.toFixed(4),
    selectedCandidateId: plan.selected?.id ?? null,
    weaponId: plan.selected?.weaponId ?? null,
    targetId: plan.selected?.targetId ?? null,
    candidateScore: plan.selected ? plan.selected.score.toFixed(4) : null,
    preferenceFellBack: false,
  };
}

describe("planning golden master (Task 021, Schritt 0)", () => {
  for (const mapId of MAP_IDS) {
    it(`freezes first-turn planning on ${mapId}`, () => {
      const snapshot: Record<string, FrozenPlanningResult> = {};

      for (const slot0 of FIGHTER_IDS) {
        const scenario = buildScenario(mapId, slot0);
        const crewId = `crew-${slot0}`;

        for (const seed of SEEDS) {
          const withPreference = frozenScenePlanning(scenario, crewId, seed, 1);
          snapshot[`${slot0}:${seed}:preference`] = withPreference;
          snapshot[`${slot0}:${seed}:forced-breaker`] = frozenScenePlanning(
            scenario,
            crewId,
            seed,
            1,
            { forcedWeaponId: "breaker" },
          );

          if (withPreference.selectedCandidateId) {
            snapshot[`${slot0}:${seed}:rejected`] = frozenScenePlanning(
              scenario,
              crewId,
              seed,
              1,
              {
                rejectedCandidateIds: [withPreference.selectedCandidateId],
                // Nach dem ersten Plan ist die Loadout-Präferenz immer
                // verbraucht – exakt wie in der Szene vor der Extraktion.
                preferenceConsumed: true,
              },
            );
          }

          snapshot[`${slot0}:${seed}:rival`] = frozenScenePlanning(
            scenario,
            "rival-1",
            seed,
            1,
          );
        }
      }

      expect(snapshot).toMatchSnapshot();
    }, 20_000);
  }
});

function freshSimulation(scenario: Scenario, seed: number): MatchSimulationState {
  return createMatchSimulation({
    seed,
    terrain: scenario.terrain,
    unitDefinitions: scenario.definitions,
  });
}

function summarizeTurnPlan(plan: TurnPlan): FrozenPlanningResult {
  return {
    movementId: plan.movement.id,
    movementKind: plan.movement.kind,
    destination: {
      x: Math.round(plan.movement.destination.x),
      y: Math.round(plan.movement.destination.y),
    },
    movementScore: plan.movement.score.toFixed(4),
    selectedCandidateId: plan.action.selected?.id ?? null,
    weaponId: plan.action.selected?.weaponId ?? null,
    targetId: plan.action.selected?.targetId ?? null,
    candidateScore: plan.action.selected
      ? plan.action.selected.score.toFixed(4)
      : null,
    preferenceFellBack: plan.preferenceFellBack,
  };
}

describe("planTurn matches the frozen golden master (Task 021, Schritt 2)", () => {
  for (const mapId of MAP_IDS) {
    it(`reproduces every frozen case on ${mapId}`, () => {
      for (const slot0 of FIGHTER_IDS) {
        const scenario = buildScenario(mapId, slot0);
        const crewId = `crew-${slot0}`;

        for (const seed of SEEDS) {
          const preferenceState = freshSimulation(scenario, seed);
          const preferencePlan = planTurn(preferenceState);
          const frozenPreference = frozenScenePlanning(scenario, crewId, seed, 1);
          expect(summarizeTurnPlan(preferencePlan)).toEqual(frozenPreference);

          const forcedState = freshSimulation(scenario, seed);
          forcedState.forcedWeaponId = "breaker";
          expect(summarizeTurnPlan(planTurn(forcedState))).toEqual(
            frozenScenePlanning(scenario, crewId, seed, 1, {
              forcedWeaponId: "breaker",
            }),
          );

          if (frozenPreference.selectedCandidateId) {
            const rejectedState = freshSimulation(scenario, seed);
            rejectedState.rejectedCandidateIds = [
              frozenPreference.selectedCandidateId,
            ];
            rejectedState.preferenceConsumedByUnitId.add(crewId);
            expect(summarizeTurnPlan(planTurn(rejectedState))).toEqual(
              frozenScenePlanning(scenario, crewId, seed, 1, {
                rejectedCandidateIds: [frozenPreference.selectedCandidateId],
                preferenceConsumed: true,
              }),
            );
          }

          const rivalState = freshSimulation(scenario, seed);
          rivalState.matchState = {
            ...rivalState.matchState,
            activeCombatantId: "rival-1",
          };
          expect(summarizeTurnPlan(planTurn(rivalState))).toEqual(
            frozenScenePlanning(scenario, "rival-1", seed, 1),
          );
        }
      }
    }, 20_000);
  }
});
