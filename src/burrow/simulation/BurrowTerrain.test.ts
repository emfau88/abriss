import { describe, expect, it } from "vitest";

import { BurrowTerrain } from "./BurrowTerrain";

describe("BurrowTerrain", () => {
  it("carves a continuous capsule even across a long burst step", () => {
    const terrain = new BurrowTerrain({
      worldWidth: 500,
      worldHeight: 240,
      cellSize: 4,
      solidAt: () => true,
    });

    const mutation = terrain.carveCapsule({ x: 40, y: 120 }, { x: 410, y: 120 }, 20);

    expect(mutation.removedCells).toBeGreaterThan(800);
    expect(mutation.dirtyCells).not.toBeNull();
    for (let x = 40; x <= 410; x += 4) {
      expect(terrain.isSolidWorld(x, 120)).toBe(false);
    }
  });

  it("does not increment the version when a tunnel is carved twice", () => {
    const terrain = new BurrowTerrain({
      worldWidth: 200,
      worldHeight: 200,
      cellSize: 4,
      solidAt: () => true,
    });
    terrain.carveCircle({ x: 100, y: 100 }, 30);
    const version = terrain.version;

    const repeated = terrain.carveCircle({ x: 100, y: 100 }, 20);

    expect(repeated.removedCells).toBe(0);
    expect(repeated.version).toBe(version);
  });
});
