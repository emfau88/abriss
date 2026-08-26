import { describe, expect, it } from "vitest";

import { creatureVisualForBiomass } from "./BurrowCreatureVisual";

describe("Burrow creature visual", () => {
  it("uses three visual-only growth silhouettes without changing gameplay data", () => {
    const sprout = creatureVisualForBiomass(0);
    const burrower = creatureVisualForBiomass(1);
    const colossus = creatureVisualForBiomass(3);

    expect([sprout.stage, burrower.stage, colossus.stage]).toEqual(["sprout", "burrower", "colossus"]);
    expect(burrower.headRadius).toBeGreaterThan(sprout.headRadius);
    expect(colossus.sampleCount).toBeGreaterThan(burrower.sampleCount);
    expect(colossus.plateEvery).toBeLessThan(burrower.plateEvery);
  });
});
