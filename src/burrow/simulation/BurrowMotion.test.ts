import { describe, expect, it } from "vitest";

import { BurrowMotion } from "./BurrowMotion";
import { BurrowTerrain } from "./BurrowTerrain";

const FIXED_STEP = 1 / 60;

describe("BurrowMotion", () => {
  it("moves faster through an existing tunnel than through solid terrain", () => {
    const solidTerrain = filledTerrain();
    const tunnelTerrain = filledTerrain();
    tunnelTerrain.carveCapsule({ x: 100, y: 220 }, { x: 700, y: 220 }, 40);
    const digger = new BurrowMotion(solidTerrain, { x: 100, y: 220 });
    const glider = new BurrowMotion(tunnelTerrain, { x: 100, y: 220 });

    for (let step = 0; step < 90; step += 1) {
      digger.step({ direction: { x: 1, y: 0 }, burstPressed: false }, FIXED_STEP);
      glider.step({ direction: { x: 1, y: 0 }, burstPressed: false }, FIXED_STEP);
    }

    expect(glider.state.position.x).toBeGreaterThan(digger.state.position.x + 40);
    expect(glider.state.mode).toBe("tunnel");
    expect(digger.state.mode).toBe("digging");
  });

  it("keeps a burst tunnel continuous", () => {
    const terrain = filledTerrain();
    const motion = new BurrowMotion(terrain, { x: 100, y: 220 });
    motion.step({ direction: { x: 1, y: 0 }, burstPressed: true }, FIXED_STEP);
    for (let step = 0; step < 60; step += 1) {
      motion.step({ direction: { x: 1, y: 0 }, burstPressed: false }, FIXED_STEP);
    }

    for (let x = 100; x <= motion.state.position.x; x += terrain.cellSize) {
      expect(terrain.isSolidWorld(x, 220)).toBe(false);
    }
  });

  it("stops underground immediately when the steering direction is released", () => {
    const terrain = filledTerrain();
    const motion = new BurrowMotion(terrain, { x: 180, y: 220 });
    motion.step({ direction: { x: 1, y: 0 }, burstPressed: false }, FIXED_STEP);
    const releasedPosition = motion.state.position;

    motion.step({ direction: null, burstPressed: false }, FIXED_STEP);

    expect(motion.state.position).toEqual(releasedPosition);
    expect(motion.state.speed).toBe(0);
    expect(motion.state.velocity).toEqual({ x: 0, y: 0 });
  });

  it("takes a strong new course within a few fixed steering steps", () => {
    const terrain = filledTerrain();
    const motion = new BurrowMotion(terrain, { x: 300, y: 220 });

    for (let step = 0; step < 12; step += 1) {
      motion.step({ direction: { x: 0, y: -1 }, burstPressed: false }, FIXED_STEP);
    }

    expect(motion.state.angle).toBeLessThan(-1.35);
  });

  it("switches to flight above the surface and can re-enter terrain", () => {
    const terrain = new BurrowTerrain({
      worldWidth: 700,
      worldHeight: 500,
      cellSize: 4,
      solidAt: (_x, y) => y >= 210,
    });
    const motion = new BurrowMotion(terrain, { x: 250, y: 290 }, -Math.PI / 2);
    let sawAirborne = false;
    let reentered = false;

    for (let step = 0; step < 300; step += 1) {
      motion.step(
        { direction: step < 80 ? { x: 0, y: -1 } : { x: 1, y: 0 }, burstPressed: false },
        FIXED_STEP,
      );
      if (motion.state.mode === "airborne") sawAirborne = true;
      if (sawAirborne && motion.state.mode === "digging") {
        reentered = true;
        break;
      }
    }

    expect(sawAirborne).toBe(true);
    expect(reentered).toBe(true);
  });

  it("turns back into the world instead of escaping along a carved boundary", () => {
    const terrain = filledTerrain();
    const motion = new BurrowMotion(terrain, { x: 860, y: 220 }, 0);

    for (let step = 0; step < 180; step += 1) {
      motion.step({ direction: null, burstPressed: step === 0 }, FIXED_STEP);
    }

    expect(motion.state.position.x).toBeLessThan(840);
    expect(motion.state.mode).not.toBe("airborne");
  });
});

function filledTerrain(): BurrowTerrain {
  return new BurrowTerrain({
    worldWidth: 900,
    worldHeight: 440,
    cellSize: 4,
    solidAt: () => true,
  });
}
