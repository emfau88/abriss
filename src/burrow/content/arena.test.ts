import { describe, expect, it } from "vitest";

import { BURROW_SHRINE_POSITION, createBurrowArena } from "./arena";

describe("Burrow arena", () => {
  it("anchors the shrine at the floor of its prepared cave", () => {
    const terrain = createBurrowArena();

    expect(terrain.isSolidWorld(BURROW_SHRINE_POSITION.x, BURROW_SHRINE_POSITION.y - 4)).toBe(false);
    expect(terrain.isSolidWorld(BURROW_SHRINE_POSITION.x, BURROW_SHRINE_POSITION.y + 8)).toBe(true);
  });
});
