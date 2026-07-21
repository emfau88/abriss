import { describe, expect, it } from "vitest";

import {
  completeMission,
  createInitialManagerState,
  deserializeManagerState,
  serializeManagerState,
  withSelectedMap,
  withSelectedFighters,
  withWeaponPreference,
} from "./managerState";

describe("managerState", () => {
  it("round-trips a versioned state independently of Phaser", () => {
    const initial = createInitialManagerState();
    const changed = withSelectedMap(
      withWeaponPreference(
        withSelectedFighters(initial, ["slime", "hornling", "moki"]),
        "slime",
        "grenade",
      ),
      "space-resort",
    );

    expect(deserializeManagerState(serializeManagerState(changed))).toEqual(changed);
  });

  it("migrates the original local manager save and keeps its progress", () => {
    const migrated = deserializeManagerState(
      JSON.stringify({
        ...createInitialManagerState(),
        version: 1,
        selectedFighterIds: ["slime", "moki", "vela"],
        weaponPreferences: {
          slime: "rocket",
          hornling: "rocket",
          moki: "grenade",
          vela: "rocket",
        },
        selectedMapId: undefined,
        completedMissions: 4,
      }),
    );

    expect(migrated.version).toBe(2);
    expect(migrated.completedMissions).toBe(4);
    expect(migrated.selectedMapId).toBe("good-mood");
    expect(migrated.selectedFighterIds).toEqual(["slime", "moki", "ghost"]);
    expect(migrated.weaponPreferences.ghost).toBe("rocket");
  });

  it("recovers safely from invalid or future data", () => {
    expect(deserializeManagerState("not-json")).toEqual(createInitialManagerState());
    expect(deserializeManagerState('{"version":99}')).toEqual(
      createInitialManagerState(),
    );
  });

  it("unlocks the terrain breaker after the first completed mission only", () => {
    const first = completeMission(createInitialManagerState());
    const second = completeMission(first.state);

    expect(first.newlyUnlockedWeaponId).toBe("breaker");
    expect(first.state.unlockedWeaponIds).toContain("breaker");
    expect(second.newlyUnlockedWeaponId).toBeNull();
    expect(second.state.completedMissions).toBe(2);
  });
});
