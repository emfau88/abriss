import { describe, expect, it } from "vitest";

import { BurrowHunt } from "./BurrowHunt";

const FIXED_STEP = 1 / 60;

describe("BurrowHunt", () => {
  it("patrols inside the fixed route and reverses at its edge", () => {
    const hunt = createHunt({ startX: 199.5 });

    hunt.step(FIXED_STEP);

    expect(hunt.state.vehicle.position.x).toBeLessThan(200);
    expect(hunt.state.vehicle.position.x).toBeGreaterThanOrEqual(100);
    expect(hunt.state.vehicle.direction).toBe(-1);
  });

  it("requires a close, sufficiently fast head contact for a bite", () => {
    const hunt = createHunt();
    const position = hunt.state.vehicle.position;

    expect(hunt.tryBite({ headPosition: position, speed: 169, burstActive: false })).toBeNull();
    expect(
      hunt.tryBite({ headPosition: { x: position.x + 80, y: position.y }, speed: 225, burstActive: false }),
    ).toBeNull();

    const bite = hunt.tryBite({ headPosition: position, speed: 225, burstActive: false });
    expect(bite).toEqual({ damage: 1, devoured: false, remainingHitPoints: 2 });
    expect(hunt.tryBite({ headPosition: position, speed: 370, burstActive: true })).toBeNull();
  });

  it("makes a burst bite stronger and awards biomass only when devouring", () => {
    const hunt = createHunt();
    const position = hunt.state.vehicle.position;

    const firstBite = hunt.tryBite({ headPosition: position, speed: 225, burstActive: false });
    expect(firstBite?.damage).toBe(1);
    advancePastBiteCooldown(hunt);
    const devour = hunt.tryBite({ headPosition: hunt.state.vehicle.position, speed: 370, burstActive: true });

    expect(devour).toEqual({ damage: 2, devoured: true, remainingHitPoints: 0 });
    expect(hunt.state.biomass).toBe(1);
    expect(hunt.state.vehicle.active).toBe(false);
  });

  it("respawns one fresh vehicle while preserving the earned biomass", () => {
    const hunt = createHunt();
    const position = hunt.state.vehicle.position;
    hunt.tryBite({ headPosition: position, speed: 370, burstActive: true });
    advancePastBiteCooldown(hunt);
    hunt.tryBite({ headPosition: hunt.state.vehicle.position, speed: 370, burstActive: true });

    let respawned = false;
    for (let step = 0; step < 210; step += 1) {
      respawned ||= hunt.step(FIXED_STEP).respawned;
    }

    expect(respawned).toBe(true);
    expect(hunt.state.vehicle.active).toBe(true);
    expect(hunt.state.vehicle.hitPoints).toBe(hunt.state.vehicle.maximumHitPoints);
    expect(hunt.state.biomass).toBe(1);
  });
});

function createHunt(overrides: Partial<{ startX: number }> = {}): BurrowHunt {
  return new BurrowHunt({
    minimumX: 100,
    maximumX: 200,
    startX: overrides.startX ?? 150,
    surfaceYAt: () => 300,
  });
}

function advancePastBiteCooldown(hunt: BurrowHunt): void {
  for (let step = 0; step < 36; step += 1) {
    hunt.step(FIXED_STEP);
  }
}
