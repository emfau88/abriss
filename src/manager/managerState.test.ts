import { describe, expect, it } from "vitest";

import {
  completeMission,
  createInitialManagerState,
  deserializeManagerState,
  serializeManagerState,
  withSelectedFighters,
  withWeaponPreference,
} from "./managerState";

describe("managerState", () => {
  it("round-trips a versioned state independently of Phaser", () => {
    const initial = createInitialManagerState();
    const changed = withWeaponPreference(
      withSelectedFighters(initial, ["slime", "hornling", "moki"]),
      "slime",
      "grenade",
    );

    expect(deserializeManagerState(serializeManagerState(changed))).toEqual(changed);
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
