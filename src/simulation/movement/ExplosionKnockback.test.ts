import { describe, expect, it } from "vitest";

import { BinaryTerrainMask } from "../terrain/TerrainMask";
import {
  calculateExplosionImpulse,
  simulateExplosionKnockback,
} from "./ExplosionKnockback";

function flatTerrain(): BinaryTerrainMask {
  return BinaryTerrainMask.fromWorldPredicate(
    { worldWidth: 500, worldHeight: 320, cellSize: 2 },
    (_x, y) => y >= 240,
  );
}

describe("explosion knockback", () => {
  it("is deterministic and lands after one damped bounce", () => {
    const input = {
      terrain: flatTerrain(),
      startPosition: { x: 130, y: 240 },
      explosionCenter: { x: 92, y: 238 },
      explosionRadius: 100,
      maximumSpeed: 430,
    };
    const first = simulateExplosionKnbackWithFreshTerrain(input);
    const second = simulateExplosionKnbackWithFreshTerrain(input);

    expect(second).toEqual(first);
    expect(first.outcome).toBe("landed");
    expect(first.bounceCount).toBeLessThanOrEqual(1);
    expect(first.samples[first.samples.length - 1]?.position.x).toBeGreaterThan(130);
  });

  it("sweeps the body and does not tunnel through a vertical terrain wall", () => {
    const terrain = BinaryTerrainMask.fromWorldPredicate(
      { worldWidth: 500, worldHeight: 320, cellSize: 2 },
      (x, y) => y >= 250 || (x >= 205 && x <= 225 && y >= 70),
    );
    const result = simulateExplosionKnockback({
      terrain,
      startPosition: { x: 130, y: 250 },
      explosionCenter: { x: 82, y: 248 },
      explosionRadius: 120,
      maximumSpeed: 520,
    });

    expect(
      Math.max(...result.samples.map((sample) => sample.position.x)),
    ).toBeLessThan(205);
    expect(result.outcome).not.toBe("out-of-world");
  });

  it("reports out-of-world when the blast throws a unit beyond the map", () => {
    const result = simulateExplosionKnockback({
      terrain: flatTerrain(),
      startPosition: { x: 18, y: 240 },
      explosionCenter: { x: 58, y: 238 },
      explosionRadius: 100,
      maximumSpeed: 620,
    });

    expect(result.outcome).toBe("out-of-world");
  });

  it("returns an unaffected result outside the blast radius", () => {
    const velocity = calculateExplosionImpulse(
      { x: 300, y: 240 },
      { x: 80, y: 240 },
      60,
      430,
    );

    expect(velocity).toEqual({ x: 0, y: 0 });
  });
});

function simulateExplosionKnbackWithFreshTerrain(input: {
  readonly startPosition: { readonly x: number; readonly y: number };
  readonly explosionCenter: { readonly x: number; readonly y: number };
  readonly explosionRadius: number;
  readonly maximumSpeed: number;
}) {
  return simulateExplosionKnockback({
    ...input,
    terrain: flatTerrain(),
  });
}
