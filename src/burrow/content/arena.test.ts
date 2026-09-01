import { describe, expect, it } from "vitest";

import { BURROW_SHRINE_POSITION, BURROW_START, createBurrowArena } from "./arena";

describe("Burrow arena", () => {
  it("anchors the shrine at the floor of its prepared cave", () => {
    const terrain = createBurrowArena();

    expect(terrain.isSolidWorld(BURROW_SHRINE_POSITION.x, BURROW_SHRINE_POSITION.y - 4)).toBe(false);
    expect(terrain.isSolidWorld(BURROW_SHRINE_POSITION.x, BURROW_SHRINE_POSITION.y + 8)).toBe(true);
  });

  it("starts the current feed-grow habitat in untouched solid soil", () => {
    const terrain = createBurrowArena({ guideTunnel: false, shrineCave: false });

    expect(terrain.version).toBe(0);
    for (const point of [
      BURROW_START,
      { x: 260, y: 850 },
      { x: 520, y: 835 },
      { x: 770, y: 760 },
      { x: 1090, y: 940 },
    ]) {
      expect(terrain.isSolidWorld(point.x, point.y)).toBe(true);
    }
  });
});
