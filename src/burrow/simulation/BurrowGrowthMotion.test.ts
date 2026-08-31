import { describe, expect, it } from "vitest";
import { BurrowMotion } from "./BurrowMotion";
import { BurrowTerrain } from "./BurrowTerrain";
import { buildForBiomass } from "./BurrowRun";

const right = { direction: { x: 1, y: 0 }, burstPressed: false };
function create(mass = 0, mutation: "trailrunner" | "vacuum" | "chain" | null = null) {
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
  it("gives Spurflitzer its extra burst only on old trails, never on fresh soil", () => {
    const normal = create(80).motion;
    const fresh = create(80, "trailrunner").motion;
    const old = create(80, "trailrunner").motion;
    old.trailField.markCapsule({ x: 90, y: 400 }, { x: 900, y: 400 }, 31);
    for (let i = 0; i < 40; i += 1) {
      for (const motion of [normal, fresh, old]) motion.step({ ...right, burstPressed: i === 0 }, 1 / 60);
    }
    expect(fresh.state.speed).toBeCloseTo(normal.state.speed);
    expect(old.state.speed).toBeCloseTo(normal.state.speed * 1.25);
    expect(fresh.onFastTrail).toBe(false);
    expect(old.onFastTrail).toBe(true);
  });
  it("improves course changes on previous trails", () => {
    const normal = create(80).motion;
    const upgraded = create(80, "trailrunner").motion;
    for (const motion of [normal, upgraded]) {
      motion.trailField.markCapsule({ x: 50, y: 400 }, { x: 900, y: 400 }, 80);
      motion.step({ direction: { x: 0, y: 1 }, burstPressed: false }, 1 / 60);
    }
    expect(upgraded.state.angle).toBeCloseTo(normal.state.angle * 1.25);
  });
  it("refunds actual prey cooldown by 0.7 seconds each and clamps at zero", () => {
    const { motion } = create(80, "chain");
    motion.step({ ...right, burstPressed: true }, 1 / 60);
    motion.rewardPrey(1);
    expect(motion.state.burstCooldown).toBeCloseTo(0.95);
    motion.rewardPrey(0);
    motion.rewardPrey(-1);
    expect(motion.state.burstCooldown).toBeCloseTo(0.95);
    motion.rewardPrey(2);
    expect(motion.state.burstCooldown).toBe(0);
  });
  it.each(["trailrunner", "vacuum", "chain"] as const)("keeps permanent B soil intact with %s at full growth", (mutation) => {
    const { motion, terrain } = create(240, mutation);
    for (let i = 0; i < 180; i += 1) motion.step({ ...right, burstPressed: i % 100 === 0 }, 1 / 60);
    expect(terrain.version).toBe(0);
  });
});
