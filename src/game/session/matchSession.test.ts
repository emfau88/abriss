import { describe, expect, it } from "vitest";

import { MAP_DEFINITIONS } from "../../content/maps/mapCatalog";
import {
  createInitialManagerState,
  withSelectedMap,
} from "../../manager/managerState";
import {
  createManagerMatchConfig,
  createCharacterAssetTestConfig,
  createConflictValidationConfig,
  createQuickMatchConfig,
} from "./matchSession";
import {
  buildMatchInteractableDefinitions,
  buildMatchUnitDefinitions,
} from "./matchSetup";

describe("matchSession", () => {
  it("passes the persisted map explicitly into a manager match", () => {
    const state = withSelectedMap(
      createInitialManagerState(),
      "space-resort",
    );

    expect(createManagerMatchConfig(state).mapId).toBe("space-resort");
  });

  it("keeps the quick-match map selectable without hidden menu state", () => {
    expect(createQuickMatchConfig("space-resort").mapId).toBe("space-resort");
    expect(createQuickMatchConfig().mapId).toBe("good-mood");
  });

  it("passes every comparison mode into manager and quick matches", () => {
    const state = createInitialManagerState();

    expect(createManagerMatchConfig(state, "hybrid").controlMode).toBe(
      "hybrid",
    );
    expect(createQuickMatchConfig("good-mood", "manual").controlMode).toBe(
      "manual",
    );
  });

  it("keeps Ghost in the active default quick crew", () => {
    expect(createQuickMatchConfig().crew.map((fighter) => fighter.fighterId)).toEqual([
      "slime",
      "moki",
      "ghost",
    ]);
  });

  it("exposes the reduced character trio in the dedicated asset test", () => {
    expect(
      createCharacterAssetTestConfig().crew.map((fighter) => fighter.fighterId),
    ).toEqual(["pop-diva", "chicken", "raccoon-bandit"]);
  });

  it("creates an isolated conflict match without changing quick-match defaults", () => {
    const conflict = createConflictValidationConfig("hybrid");

    expect(conflict.validationScenarioId).toBe("comedy-pocket");
    expect(conflict.controlMode).toBe("hybrid");
    expect(createQuickMatchConfig().validationScenarioId).toBeUndefined();
    expect(
      buildMatchUnitDefinitions(conflict)
        .filter((unit) => unit.team === "crew")
        .map((unit) => unit.spawnX),
    ).toEqual([1_180, 1_420, 2_600]);
    expect(buildMatchInteractableDefinitions(conflict)).toHaveLength(3);
    expect(buildMatchInteractableDefinitions(createQuickMatchConfig())).toEqual(
      MAP_DEFINITIONS["good-mood"].interactables,
    );
  });
});
