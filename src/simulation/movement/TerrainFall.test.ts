import { describe, expect, it } from "vitest";

import { BinaryTerrainMask } from "../terrain/TerrainMask";
import {
  FALL_DAMAGE_MAXIMUM,
  FALL_DAMAGE_MIN_DROP,
  fallDamageForDrop,
  resolveTerrainFall,
} from "./TerrainFall";

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

describe("fall damage", () => {
  it("lässt kleine Stürze (Stolperer) folgenlos", () => {
    expect(fallDamageForDrop(0)).toBe(0);
    expect(fallDamageForDrop(60)).toBe(0);
    expect(fallDamageForDrop(FALL_DAMAGE_MIN_DROP)).toBe(0);
  });

  it("verursacht ab der Schwelle wachsenden Schaden", () => {
    const small = fallDamageForDrop(FALL_DAMAGE_MIN_DROP + 50);
    const large = fallDamageForDrop(FALL_DAMAGE_MIN_DROP + 200);
    expect(small).toBeGreaterThan(0);
    expect(large).toBeGreaterThan(small);
  });

  it("deckelt sehr tiefe Stürze", () => {
    expect(fallDamageForDrop(10_000)).toBe(FALL_DAMAGE_MAXIMUM);
  });

  it("ist deterministisch für dieselbe Höhe", () => {
    expect(fallDamageForDrop(305)).toBe(fallDamageForDrop(305));
  });

  it("behandelt ungültige Eingaben als schadensfrei", () => {
    expect(fallDamageForDrop(Number.NaN)).toBe(0);
    expect(fallDamageForDrop(-50)).toBe(0);
  });
});
