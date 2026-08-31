import { describe, expect, it } from "vitest";
import { creatureVisualForBiomass } from "./BurrowCreatureVisual";
import { BURROW_MOTION_CONSTANTS } from "../simulation/BurrowMotion";

describe("Burrow creature growth visual", () => {
  it("grows length and width immediately, without enlarging the collision head", () => {
    const start = creatureVisualForBiomass(0);
    const snack = creatureVisualForBiomass(8);
    const grown = creatureVisualForBiomass(240);
    expect(snack.headRadius).toBeGreaterThan(start.headRadius);
    expect(snack.bodyRadiusMultiplier).toBeGreaterThan(start.bodyRadiusMultiplier);
    expect(start.sampleCount).toBe(10);
    expect(grown.sampleCount).toBe(28);
    expect(grown.headRadius / start.headRadius).toBeLessThan(1.5);
    expect(BURROW_MOTION_CONSTANTS.headRadius).toBe(23);
    expect(creatureVisualForBiomass(999).sampleCount).toBe(28);
  });
});
