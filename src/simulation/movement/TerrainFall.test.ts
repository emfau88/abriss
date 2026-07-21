import { describe, expect, it } from "vitest";

import { BinaryTerrainMask } from "../terrain/TerrainMask";
import { resolveTerrainFall } from "./TerrainFall";

describe("terrain fall resolution", () => {
  it("keeps a unit on unchanged support", () => {
    const terrain = BinaryTerrainMask.fromWorldPredicate(
      { worldWidth: 40, worldHeight: 60, cellSize: 2 },
      (_x, y) => y >= 20,
    );

    expect(resolveTerrainFall(terrain, 12, 20)).toEqual({
      state: "supported",
      landingY: 20,
      distance: 0,
    });
  });

  it("lands on the next solid layer after support is destroyed", () => {
    const terrain = BinaryTerrainMask.fromWorldPredicate(
      { worldWidth: 40, worldHeight: 80, cellSize: 2 },
      (_x, y) => (y >= 20 && y < 28) || y >= 52,
    );
    terrain.removeCircle(12, 20, 10);

    expect(resolveTerrainFall(terrain, 12, 20)).toEqual({
      state: "fall",
      landingY: 52,
      distance: 32,
    });
  });

  it("reports a fall out of the world when no lower terrain exists", () => {
    const terrain = BinaryTerrainMask.fromWorldPredicate(
      { worldWidth: 40, worldHeight: 80, cellSize: 2 },
      (_x, y) => y >= 20 && y < 28,
    );
    terrain.removeCircle(12, 20, 10);

    expect(resolveTerrainFall(terrain, 12, 20)).toEqual({
      state: "out-of-world",
      landingY: null,
      distance: 60,
    });
  });
});
