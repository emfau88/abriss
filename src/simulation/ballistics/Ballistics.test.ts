import { describe, expect, it } from "vitest";

import { BinaryTerrainMask } from "../terrain/TerrainMask";
import {
  sampleTrajectoryAtElapsed,
  simulateRocketTrajectory,
  type RocketTrajectoryInput,
} from "./Ballistics";

const BASE_INPUT: RocketTrajectoryInput = {
  startPosition: { x: 40, y: 140 },
  startVelocity: { x: 120, y: -55 },
  gravity: { x: 0, y: 240 },
  fixedStepSeconds: 1 / 60,
  maximumDurationSeconds: 4,
  explosionRadius: 24,
};

function createFlatTerrain(): BinaryTerrainMask {
  return BinaryTerrainMask.fromWorldPredicate(
    { worldWidth: 400, worldHeight: 300, cellSize: 2 },
    (_worldX, worldY) => worldY >= 210,
  );
}

describe("rocket ballistics", () => {
  it("produces the same samples and impact for the same input", () => {
    const first = simulateRocketTrajectory(BASE_INPUT, createFlatTerrain());
    const second = simulateRocketTrajectory(BASE_INPUT, createFlatTerrain());

    expect(first).toEqual(second);
    expect(first.outcome).toBe("terrain-impact");
    expect(first.impact?.position.y).toBeGreaterThanOrEqual(210);
  });

  it("uses the final simulated sample as the visible impact", () => {
    const trajectory = simulateRocketTrajectory(BASE_INPUT, createFlatTerrain());
    const lastSample = trajectory.samples[trajectory.samples.length - 1];

    expect(lastSample?.position).toEqual(trajectory.impact?.position);

    const playback = sampleTrajectoryAtElapsed(
      trajectory,
      lastSample?.timeSeconds ?? 0,
    );

    expect(playback.complete).toBe(true);
    expect(playback.sample.position).toEqual(trajectory.impact?.position);
  });

  it("collides with the current terrain after a crater changes it", () => {
    const terrain = createFlatTerrain();
    const verticalInput: RocketTrajectoryInput = {
      startPosition: { x: 100, y: 100 },
      startVelocity: { x: 0, y: 0 },
      gravity: { x: 0, y: 200 },
      fixedStepSeconds: 1 / 60,
      maximumDurationSeconds: 3,
      explosionRadius: 24,
    };
    const first = simulateRocketTrajectory(verticalInput, terrain);

    if (!first.impact) {
      throw new Error("Expected an initial terrain impact.");
    }

    terrain.removeCircle(
      first.impact.position.x,
      first.impact.position.y,
      first.explosion?.radius ?? 24,
    );

    const second = simulateRocketTrajectory(verticalInput, terrain);

    expect(second.outcome).toBe("terrain-impact");
    expect(second.impact?.position.y).toBeGreaterThan(first.impact.position.y);
  });

  it("reports a safe out-of-bounds result", () => {
    const trajectory = simulateRocketTrajectory(
      {
        ...BASE_INPUT,
        startPosition: { x: 5, y: 50 },
        startVelocity: { x: -200, y: -10 },
      },
      createFlatTerrain(),
    );

    expect(trajectory.outcome).toBe("out-of-bounds");
    expect(trajectory.impact).toBeNull();
    expect(trajectory.explosion).toBeNull();
  });

  it("bounces a grenade and explodes when its deterministic fuse expires", () => {
    const input: RocketTrajectoryInput = {
      ...BASE_INPUT,
      startPosition: { x: 70, y: 120 },
      startVelocity: { x: 105, y: -25 },
      collisionBehavior: "bounce",
      fuseSeconds: 2.2,
      maximumBounces: 2,
      bounceRestitution: 0.45,
      surfaceFriction: 0.7,
    };
    const first = simulateRocketTrajectory(input, createFlatTerrain());
    const second = simulateRocketTrajectory(input, createFlatTerrain());
    const lastSample = first.samples[first.samples.length - 1];

    expect(second).toEqual(first);
    expect(first.outcome).toBe("fuse-expired");
    expect(first.bounces.length).toBeGreaterThan(0);
    expect(first.bounces.length).toBeLessThanOrEqual(2);
    expect(first.explosion).not.toBeNull();
    expect(lastSample?.timeSeconds).toBeCloseTo(2.2, 8);
  });

  it("rejects an invalid grenade fuse configuration", () => {
    expect(() =>
      simulateRocketTrajectory(
        {
          ...BASE_INPUT,
          collisionBehavior: "bounce",
          fuseSeconds: BASE_INPUT.maximumDurationSeconds + 1,
        },
        createFlatTerrain(),
      ),
    ).toThrow("Bounce and fuse settings");
  });

  it("rejects invalid playback times", () => {
    const trajectory = simulateRocketTrajectory(BASE_INPUT, createFlatTerrain());

    expect(() => sampleTrajectoryAtElapsed(trajectory, -0.01)).toThrow(
      "Trajectory playback time",
    );
  });
});
