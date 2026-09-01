import { describe, expect, it } from "vitest";
import { BurrowMotion } from "./BurrowMotion";
import { BurrowTerrain } from "./BurrowTerrain";
import { buildForBiomass, type BurrowMutation } from "./BurrowRun";

const right = { direction: { x: 1, y: 0 }, burstPressed: false };
function create(mass = 0, mutation: BurrowMutation | null = null) {
  const terrain = new BurrowTerrain({ worldWidth: 2400, worldHeight: 900, cellSize: 4, solidAt: () => true });
  return { terrain, motion: new BurrowMotion(terrain, { x: 100, y: 400 }, 0, "recovering", buildForBiomass(mass, mutation)) };
}

describe("growth and mutation motion", () => {
  it("increases real digging speed at the two power gates", () => {
    const speeds = [0, 40, 180].map((mass) => {
      const { motion } = create(mass);
      for (let i = 0; i < 60; i += 1) motion.step(right, 1 / 60);
      return motion.state.speed;
    });
    expect(speeds[0]).toBe(145);
    expect(speeds[1]).toBeCloseTo(145 * 1.075);
    expect(speeds[2]).toBeCloseTo(145 * 1.15);
  });
  it("extends one active Donnerrachen burst at most three times", () => {
    const { motion } = create(80, "thunderjaw");
    motion.step({ ...right, burstPressed: true }, 1 / 60);
    const before = motion.state.burstRemaining;
    expect(motion.extendBurstForPrey(1)).toBe(1);
    expect(motion.state.burstRemaining).toBeCloseTo(before + 0.24);
    expect(motion.extendBurstForPrey(4)).toBe(2);
    expect(motion.state.burstChain).toBe(3);
    expect(motion.extendBurstForPrey(1)).toBe(0);
  });
  it.each(["vacuum", "thunderjaw", "quakeheart"] as const)("keeps permanent B soil intact with %s at full growth", (mutation) => {
    const { motion, terrain } = create(240, mutation);
    for (let i = 0; i < 180; i += 1) motion.step({ ...right, burstPressed: i % 100 === 0 }, 1 / 60);
    expect(terrain.version).toBe(0);
  });
});
