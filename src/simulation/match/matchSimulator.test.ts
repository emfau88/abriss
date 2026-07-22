import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { MAP_DEFINITIONS, MAP_IDS, type MapId } from "../../content/maps/mapCatalog";
import { buildMatchUnitDefinitions } from "../../game/session/matchSetup";
import {
  createQuickMatchConfig,
  type MatchLaunchConfig,
} from "../../game/session/matchSession";
import {
  FIGHTER_IDS,
  FIGHTER_ROSTER,
  type FighterId,
} from "../../manager/fighterRoster";
import { loadTerrainMaskForMap } from "../../testing/pngTerrain";
import {
  renderSimulationReport,
  simulateMatches,
  type DivergenceProbe,
  type SimulationScenario,
} from "./matchSimulator";
import {
  createMatchSimulation,
  type MatchSimulationState,
} from "./matchSimulationState";

/**
 * Kleine Standard-Matrix: 2 Karten × 3 Seeds (Manager-Progression). Mit
 * SIM_FULL=1 (z. B. `$env:SIM_FULL="1"; npm run simulate`) läuft zusätzlich
 * eine größere Matrix mit 10 Seeds pro Karte.
 */
const BASE_SEED = createQuickMatchConfig().seed;
const DEFAULT_SEED_COUNT = 3;
const FULL_SEED_COUNT = 10;
const SEED_STRIDE = 101;

function stateForConfig(config: MatchLaunchConfig): MatchSimulationState {
  return createMatchSimulation({
    seed: config.seed,
    terrain: loadTerrainMaskForMap(MAP_DEFINITIONS[config.mapId]),
    unitDefinitions: buildMatchUnitDefinitions(config),
  });
}

function buildScenarios(seedCount: number): SimulationScenario[] {
  const scenarios: SimulationScenario[] = [];

  for (const mapId of MAP_IDS) {
    for (let index = 0; index < seedCount; index += 1) {
      const seed = BASE_SEED + index * SEED_STRIDE;
      scenarios.push({
        mapId,
        seed,
        createState: () =>
          stateForConfig({ ...createQuickMatchConfig(mapId), seed }),
      });
    }
  }

  return scenarios;
}

function openingConfig(mapId: MapId, slot0: FighterId): MatchLaunchConfig {
  const others = FIGHTER_IDS.filter((fighterId) => fighterId !== slot0).slice(
    0,
    2,
  );

  return {
    mode: "quick",
    seed: BASE_SEED,
    mapId,
    crew: [slot0, ...others].map((fighterId) => ({
      fighterId,
      preferredWeaponId: FIGHTER_ROSTER[fighterId].preferredWeaponId,
    })),
  };
}

function buildDivergenceProbes(): DivergenceProbe[] {
  const probes: DivergenceProbe[] = [];

  for (const mapId of MAP_IDS) {
    for (const slot0 of FIGHTER_IDS) {
      probes.push({
        mapId,
        label: slot0,
        createState: () => stateForConfig(openingConfig(mapId, slot0)),
      });
    }
  }

  return probes;
}

describe("mass simulator (Task 022, Teil B)", () => {
  it("aggregates a deterministic report over the default matrix", () => {
    const report = simulateMatches(buildScenarios(DEFAULT_SEED_COUNT), {
      divergenceProbes: buildDivergenceProbes(),
    });

    expect(report.maps).toHaveLength(MAP_IDS.length);

    for (const map of report.maps) {
      expect(map.matches).toBe(DEFAULT_SEED_COUNT);
      expect(
        map.outcomes.crew + map.outcomes.rivals + map.outcomes.draw,
      ).toBe(map.matches);
      expect(map.turnStats.minimum).toBeGreaterThan(1);
      expect(map.turnStats.maximum).toBeGreaterThanOrEqual(
        map.turnStats.median,
      );

      const shareSum = map.weaponUsage.reduce(
        (sum, usage) => sum + usage.share,
        0,
      );
      expect(Math.abs(shareSum - 1)).toBeLessThan(0.001);
      expect(map.firstTurnDivergence?.probes).toBe(FIGHTER_IDS.length);
    }

    // Determinismus und bewusste Balance-Sichtbarkeit: Metrikänderungen
    // erfordern ein ausdrückliches Snapshot-Update.
    expect(report).toMatchSnapshot();

    const rendered = renderSimulationReport(report);
    mkdirSync(join(process.cwd(), "reports"), { recursive: true });
    writeFileSync(
      join(process.cwd(), "reports", "simulation-report.md"),
      rendered,
    );
    expect(rendered).toContain("## Karte `good-mood`");
    expect(rendered).toContain("## Karte `space-resort`");
  });

  it.skipIf(!process.env["SIM_FULL"])(
    "aggregates the extended matrix (SIM_FULL=1)",
    { timeout: 300_000 },
    () => {
      const report = simulateMatches(buildScenarios(FULL_SEED_COUNT), {
        divergenceProbes: buildDivergenceProbes(),
      });
      mkdirSync(join(process.cwd(), "reports"), { recursive: true });
      writeFileSync(
        join(process.cwd(), "reports", "simulation-report-full.md"),
        renderSimulationReport(report),
      );

      for (const map of report.maps) {
        expect(map.matches).toBe(FULL_SEED_COUNT);
      }
    },
  );
});
