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

  it("requires a close, sufficiently fast head contact and devours a cart immediately", () => {
    const hunt = createHunt();
    const position = hunt.state.vehicle.position;

    expect(hunt.tryBite({ headPosition: position, speed: 169, burstActive: false })).toBeNull();
    expect(
      hunt.tryBite({ headPosition: { x: position.x + 80, y: position.y }, speed: 225, burstActive: false }),
    ).toBeNull();

    const bite = hunt.tryBite({ headPosition: position, speed: 225, burstActive: false });
    expect(bite).toEqual({ damage: 1, devoured: true, remainingHitPoints: 0 });
    expect(hunt.tryBite({ headPosition: position, speed: 370, burstActive: true })).toBeNull();
  });

  it("makes a burst bite stronger and awards biomass only when devouring", () => {
    const hunt = createHunt();
    const position = hunt.state.vehicle.position;

    const devour = hunt.tryBite({ headPosition: position, speed: 370, burstActive: true });

    expect(devour).toEqual({ damage: 2, devoured: true, remainingHitPoints: 0 });
    expect(hunt.state.biomass).toBe(1);
    expect(hunt.state.vehicle.active).toBe(false);
  });

  it("respawns one fresh vehicle while preserving the earned biomass", () => {
    const hunt = createHunt();
    const position = hunt.state.vehicle.position;
    hunt.tryBite({ headPosition: position, speed: 370, burstActive: true });

    let respawned = false;
    for (let step = 0; step < 210; step += 1) {
      respawned ||= hunt.step(FIXED_STEP).respawned;
    }

    expect(respawned).toBe(true);
    expect(hunt.state.vehicle.active).toBe(true);
    expect(hunt.state.vehicle.hitPoints).toBe(hunt.state.vehicle.maximumHitPoints);
    expect(hunt.state.biomass).toBe(1);
  });

  it("turns the existing cart into a non-respawning one-contact finale target", () => {
    const hunt = createHunt();
    hunt.beginFinale({ vehicleHitPoints: 1 });
    const position = hunt.state.vehicle.position;

    expect(hunt.state.vehicle).toMatchObject({ kind: "finale", hitPoints: 1, maximumHitPoints: 1 });
    hunt.tryBite({ headPosition: position, speed: 370, burstActive: true });
    expect(hunt.state.vehicle.active).toBe(false);
    for (let step = 0; step < 240; step += 1) hunt.step(FIXED_STEP);
    expect(hunt.state.vehicle.active).toBe(false);
  });

  it("lets Glutton reduce valid head contacts without widening the contact rule", () => {
    const hunt = createHunt();
    const position = hunt.state.vehicle.position;

    const gluttonBite = hunt.tryBite({
      headPosition: position,
      speed: 370,
      burstActive: true,
      damageBonus: 1,
    });

    expect(gluttonBite).toEqual({ damage: 3, devoured: true, remainingHitPoints: 0 });
    const distantHunt = createHunt();
    const distantPosition = distantHunt.state.vehicle.position;
    expect(distantHunt.tryBite({ headPosition: { x: distantPosition.x + 65, y: distantPosition.y }, speed: 370, burstActive: true, damageBonus: 1 })).toBeNull();
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
