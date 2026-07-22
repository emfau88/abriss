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
  createMatchSimulation,
  type MatchSimulationState,
} from "./matchSimulationState";
import { planTurn } from "./planTurn";
import { runMatch } from "./runMatch";

function simulationForConfig(config: MatchLaunchConfig): MatchSimulationState {
  return createMatchSimulation({
    seed: config.seed,
    terrain: loadTerrainMaskForMap(MAP_DEFINITIONS[config.mapId]),
    unitDefinitions: buildMatchUnitDefinitions(config),
  });
}

function configWithOpeningFighter(
  mapId: MapId,
  slot0: FighterId,
): MatchLaunchConfig {
  const others = FIGHTER_IDS.filter((fighterId) => fighterId !== slot0).slice(
    0,
    2,
  );

  return {
    mode: "quick",
    seed: createQuickMatchConfig(mapId).seed,
    mapId,
    controlMode: "auto",
    crew: [slot0, ...others].map((fighterId) => ({
      fighterId,
      preferredWeaponId: FIGHTER_ROSTER[fighterId].preferredWeaponId,
    })),
  };
}

describe("headless match runs (Task 021, Schritt 5)", () => {
  for (const mapId of MAP_IDS) {
    it(`completes a full deterministic match on ${mapId}`, () => {
      const first = runMatch(
        simulationForConfig(createQuickMatchConfig(mapId)),
      );
      const second = runMatch(
        simulationForConfig(createQuickMatchConfig(mapId)),
      );

      expect(first.outcome).toMatch(/^(crew|rivals|draw)$/);
      expect(first.turnCount).toBeGreaterThan(1);
      // Identischer Seed ⇒ identisches Ereignisprotokoll und Endzustand.
      expect(JSON.stringify(second.turns)).toBe(JSON.stringify(first.turns));
      expect(second.finalState).toEqual(first.finalState);
      expect(second.outcome).toBe(first.outcome);
    });

    it(`gives every opening fighter a playable first turn on ${mapId}`, () => {
      for (const slot0 of FIGHTER_IDS) {
        const state = simulationForConfig(
          configWithOpeningFighter(mapId, slot0),
        );
        const opening = planTurn(state);

        // Regressionsfall aus docs/07: Moki fand auf den Sonneninseln
        // keinen Eröffnungszug. Jede Figur muss angreifen oder ihre
        // Position begründet verbessern – nie tatenlos aussetzen.
        expect(
          { slot0, mapId, kind: opening.kind },
          `${slot0} braucht einen spielbaren Eröffnungszug auf ${mapId}`,
        ).not.toEqual({ slot0, mapId, kind: "skip" });
      }
    });
  }
});
