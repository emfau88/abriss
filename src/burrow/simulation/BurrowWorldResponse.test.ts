import { describe, expect, it } from "vitest";

import { BurrowWorldResponse } from "./BurrowWorldResponse";

const createWorld = () => new BurrowWorldResponse({
  animalStart: { x: 500, y: 297 },
  shrinePosition: { x: 900, y: 700 },
  surfaceYAt: () => 300,
  minimumX: 80,
  maximumX: 1100,
});

describe("BurrowWorldResponse", () => {
  it("starts the animal fleeing away from a nearby breach", () => {
    const world = createWorld();
    const result = world.step({ headPosition: { x: 410, y: 300 }, breachOccurred: true, deltaSeconds: 1 / 60 });

    expect(result).toEqual({ animalFledNow: true, shrineActivatedNow: false });
    expect(world.state.animal.fleeing).toBe(true);
    expect(world.state.animal.direction).toBe(1);
    expect(world.state.animal.position.x).toBeGreaterThan(500);
  });

  it("does not flee from a distant breach", () => {
    const world = createWorld();

    expect(world.step({ headPosition: { x: 100, y: 300 }, breachOccurred: true, deltaSeconds: 1 / 60 }))
      .toEqual({ animalFledNow: false, shrineActivatedNow: false });
    expect(world.state.animal.position.x).toBe(500);
  });

  it("activates the shrine exactly once on head contact", () => {
    const world = createWorld();

    expect(world.step({ headPosition: { x: 900, y: 700 }, breachOccurred: false, deltaSeconds: 1 / 60 }))
      .toEqual({ animalFledNow: false, shrineActivatedNow: true });
    expect(world.step({ headPosition: { x: 900, y: 700 }, breachOccurred: false, deltaSeconds: 1 / 60 }))
      .toEqual({ animalFledNow: false, shrineActivatedNow: false });
    expect(world.state.shrine.activated).toBe(true);
  });

  it("keeps the shrine dormant until the run allows its contact and permits one animal devour", () => {
    const world = createWorld();

    expect(world.step({ headPosition: { x: 900, y: 700 }, breachOccurred: false, shrineEnabled: false, deltaSeconds: 1 / 60 }))
      .toEqual({ animalFledNow: false, shrineActivatedNow: false });
    expect(world.tryDevourAnimal({ headPosition: { x: 500, y: 297 }, speed: 225 })).toBe(true);
    expect(world.tryDevourAnimal({ headPosition: { x: 500, y: 297 }, speed: 225 })).toBe(false);
    expect(world.state.animal.active).toBe(false);
  });
});
