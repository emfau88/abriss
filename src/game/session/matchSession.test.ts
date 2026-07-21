import { describe, expect, it } from "vitest";

import {
  createInitialManagerState,
  withSelectedMap,
} from "../../manager/managerState";
import {
  createManagerMatchConfig,
  createQuickMatchConfig,
} from "./matchSession";

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

  it("uses Ghost in the active quick crew", () => {
    expect(createQuickMatchConfig().crew.map((fighter) => fighter.fighterId)).toEqual([
      "slime",
      "moki",
      "ghost",
    ]);
  });
});
