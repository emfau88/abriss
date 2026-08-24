import type { Personality, WeaponId } from "../ai/RocketActionPlanner";
import { BinaryTerrainMask } from "../terrain/TerrainMask";
import { directActiveTarget, PERSONALITY_CYCLE } from "./commands";
import {
  activeSimulationUnit,
  createMatchSimulation,
  type MatchSimulationState,
  type MatchUnitDefinition,
} from "./matchSimulationState";
import { planFamilyKeyFor } from "./planFamily";
import { planTurn, type TurnPlanKind } from "./planTurn";
import { resolveTurn } from "./resolveTurn";

export type ConflictScenarioId =
  | "team-risk"
  | "barrel-chain"
  | "terrain-gate"
  | "ringout-edge";

export interface ConflictScenario {
  readonly id: ConflictScenarioId;
  readonly label: string;
  readonly purpose: string;
  createState(): MatchSimulationState;
}

export interface ConflictProbeResult {
  readonly scenarioId: ConflictScenarioId;
  readonly scenarioLabel: string;
  readonly personality: Personality;
  readonly guidance: "auto" | "target-order";
  readonly planKind: TurnPlanKind;
  readonly planFamilyKey: string | null;
  readonly weaponId: WeaponId | null;
  readonly targetName: string | null;
  readonly expectedFriendlyDamage: number;
  readonly expectedSelfDamage: number;
  readonly expectedChainEffect: number;
  readonly expectedTerrainEffect: number;
  readonly actualFriendlyDamage: number;
  readonly actualSelfDamage: number;
  readonly actualEnemyDamage: number;
  readonly triggeredInteractables: number;
  readonly removedTerrainCells: number;
  readonly outOfWorldKnockouts: number;
}

const WORLD_WIDTH = 1_200;
const WORLD_HEIGHT = 600;
const FLOOR_Y = 420;
const SEED = 24_082_026;

function flatTerrain(
  extraSolid: (x: number, y: number) => boolean = () => false,
): BinaryTerrainMask {
  return BinaryTerrainMask.fromWorldPredicate(
    { worldWidth: WORLD_WIDTH, worldHeight: WORLD_HEIGHT, cellSize: 2 },
    (x, y) => y >= FLOOR_Y || extraSolid(x, y),
  );
}

function platformTerrain(): BinaryTerrainMask {
  return BinaryTerrainMask.fromWorldPredicate(
    { worldWidth: WORLD_WIDTH, worldHeight: WORLD_HEIGHT, cellSize: 2 },
    (x, y) => x >= 90 && x <= 860 && y >= FLOOR_Y,
  );
}

function unit(
  id: string,
  displayName: string,
  team: "crew" | "rivals",
  spawnX: number,
  personality: Personality,
): MatchUnitDefinition {
  return { id, displayName, team, spawnX, personality };
}

function standardUnits(
  positions: readonly [number, number, number, number, number, number],
): readonly MatchUnitDefinition[] {
  return [
    unit("crew-active", "TESTFIGUR", "crew", positions[0], "cautious"),
    unit("rival-a", "RIVALE A", "rivals", positions[1], "explosive"),
    unit("crew-friend-a", "KUMPEL A", "crew", positions[2], "showboat"),
    unit("rival-b", "RIVALE B", "rivals", positions[3], "cautious"),
    unit("crew-friend-b", "KUMPEL B", "crew", positions[4], "explosive"),
    unit("rival-c", "RIVALE C", "rivals", positions[5], "showboat"),
  ];
}

export const CONFLICT_SCENARIOS: readonly ConflictScenario[] = [
  {
    id: "team-risk",
    label: "Teamrisiko",
    purpose: "Ein naher Rivale steht direkt neben einem Crewmitglied.",
    createState: () =>
      createMatchSimulation({
        seed: SEED,
        terrain: flatTerrain(),
        unitDefinitions: standardUnits([180, 760, 716, 970, 300, 1_080]),
      }),
  },
  {
    id: "barrel-chain",
    label: "Fasskette",
    purpose: "Ein gedeckter Rivale steht hinter einem relevanten Fasscluster.",
    createState: () =>
      createMatchSimulation({
        seed: SEED,
        terrain: flatTerrain((x, y) => x >= 770 && x <= 800 && y >= 245),
        unitDefinitions: standardUnits([180, 810, 300, 1_010, 380, 1_105]),
        interactableDefinitions: [
          { id: "probe-barrel-a", type: "explosive-barrel", spawnX: 720 },
          { id: "probe-barrel-b", type: "explosive-barrel", spawnX: 752 },
        ],
      }),
  },
  {
    id: "terrain-gate",
    label: "Geländetor",
    purpose: "Eine dicke Wand blockiert den direkten Gegnerkontakt.",
    createState: () =>
      createMatchSimulation({
        seed: SEED,
        terrain: flatTerrain((x, y) => x >= 570 && x <= 660 && y >= 205),
        unitDefinitions: standardUnits([175, 780, 270, 935, 355, 1_075]),
      }),
  },
  {
    id: "ringout-edge",
    label: "Ring-out-Kante",
    purpose: "Ein Rivale steht am rechten Rand einer schmalen Plattform.",
    createState: () =>
      createMatchSimulation({
        seed: SEED,
        terrain: platformTerrain(),
        unitDefinitions: standardUnits([170, 835, 300, 700, 390, 610]),
      }),
  },
];

export function evaluateConflictScenarios(
  scenarios: readonly ConflictScenario[] = CONFLICT_SCENARIOS,
): readonly ConflictProbeResult[] {
  const results: ConflictProbeResult[] = [];

  for (const scenario of scenarios) {
    for (const personality of PERSONALITY_CYCLE) {
      for (const guidance of ["auto", "target-order"] as const) {
      const state = scenario.createState();
      const active = activeSimulationUnit(state);
      active.personality = personality;
      if (guidance === "target-order") {
        const directed = directActiveTarget(state, "rival-a");
        if (!directed.accepted) {
          throw new Error(`Conflict scenario ${scenario.id} has no rival-a.`);
        }
      }
      const teamByUnitId = new Map(
        state.units.map((candidate) => [candidate.id, candidate.team] as const),
      );
      const plan = planTurn(state);
      const selected = plan.action.selected;
      const events = resolveTurn(state, plan);
      let actualFriendlyDamage = 0;
      let actualSelfDamage = 0;
      let actualEnemyDamage = 0;
      let triggeredInteractables = 0;
      let removedTerrainCells = 0;
      let outOfWorldKnockouts = 0;

      for (const event of events) {
        if (event.type === "damage-applied") {
          if (event.unitId === active.id) {
            actualSelfDamage += event.damage;
          } else if (teamByUnitId.get(event.unitId) === active.team) {
            actualFriendlyDamage += event.damage;
          } else {
            actualEnemyDamage += event.damage;
          }
        } else if (event.type === "interactable-triggered") {
          triggeredInteractables += 1;
        } else if (event.type === "terrain-mutated") {
          removedTerrainCells += event.mutation.removedCells;
        } else if (
          (event.type === "knockback-resolved" &&
            event.defeatedOutOfWorld) ||
          (event.type === "fall-resolved" && event.defeated)
        ) {
          outOfWorldKnockouts += 1;
        }
      }

      results.push({
        scenarioId: scenario.id,
        scenarioLabel: scenario.label,
        personality,
        guidance,
        planKind: plan.kind,
        planFamilyKey: selected
          ? planFamilyKeyFor(plan.movement, selected)
          : null,
        weaponId: selected?.weaponId ?? null,
        targetName: selected?.targetName ?? null,
        expectedFriendlyDamage: selected?.metrics.friendlyDamage ?? 0,
        expectedSelfDamage: selected?.metrics.selfDamage ?? 0,
        expectedChainEffect: selected?.metrics.chainEffect ?? 0,
        expectedTerrainEffect: selected?.metrics.terrainEffect ?? 0,
        actualFriendlyDamage,
        actualSelfDamage,
        actualEnemyDamage,
        triggeredInteractables,
        removedTerrainCells,
        outOfWorldKnockouts,
      });
      }
    }
  }

  return results;
}

const PERSONALITY_LABELS: Record<Personality, string> = {
  cautious: "Vorsichtig",
  explosive: "Sprengfreudig",
  showboat: "Angeberisch",
};

const WEAPON_LABELS: Record<WeaponId, string> = {
  rocket: "Panzerfaust",
  grenade: "Wurfgranate",
  breaker: "Geländebrecher",
};

export function renderConflictScenarioResults(
  results: readonly ConflictProbeResult[],
): string {
  const lines = [
    "",
    "## Gezielte Konfliktsonden",
    "",
    "Kleine rendererfreie Situationen aktivieren Risiken und Folgewirkungen,",
    "die in den normalen Eröffnungen meist null bleiben (Task 035).",
    "",
    "| Sonde | Steuerung | Persönlichkeit | Plan | erwartetes Risiko Team/Selbst | Kette | Terrain | echte Folgen |",
    "| --- | --- | --- | --- | ---: | ---: | ---: | --- |",
  ];

  for (const result of results) {
    const plan = result.weaponId
      ? `${WEAPON_LABELS[result.weaponId]} → ${result.targetName ?? "–"}`
      : result.planKind === "reposition"
        ? "Positionierung"
        : "Aussetzer";
    const consequences = [
      result.actualEnemyDamage > 0
        ? `${result.actualEnemyDamage} Gegnerschaden`
        : null,
      result.actualFriendlyDamage > 0
        ? `${result.actualFriendlyDamage} Teamschaden`
        : null,
      result.actualSelfDamage > 0 ? `${result.actualSelfDamage} Eigenschaden` : null,
      result.triggeredInteractables > 0
        ? `${result.triggeredInteractables} Fass/Fässer`
        : null,
      result.outOfWorldKnockouts > 0
        ? `${result.outOfWorldKnockouts} Ring-out`
        : null,
      `${result.removedTerrainCells} Zellen entfernt`,
    ]
      .filter((value): value is string => Boolean(value))
      .join(" · ");
    lines.push(
      `| ${result.scenarioLabel} | ${result.guidance === "auto" ? "Auto" : "Zielauftrag A"} | ${PERSONALITY_LABELS[result.personality]} | ${plan} | ${Math.round(result.expectedFriendlyDamage)} / ${Math.round(result.expectedSelfDamage)} | ${Math.round(result.expectedChainEffect)} | ${Math.round(result.expectedTerrainEffect)} % | ${consequences} |`,
    );
  }

  lines.push("");
  return lines.join("\n");
}
