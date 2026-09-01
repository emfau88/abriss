import { describe, expect, it } from "vitest";
import { BurrowFeeding, type FeedingHead, type PreyDefinition } from "./BurrowFeeding";
import { createFeedingContent } from "../content/feeding";
import { createBurrowArena } from "../content/arena";

const head: FeedingHead = { previous: { x: 100, y: 100 }, position: { x: 100, y: 100 },
  angle: 0, power: 0, burst: false, vacuum: false, digging: true, quakeRadius: 0 };
const prey: PreyDefinition = { id: "worm", kind: "thread", large: false, center: { x: 100, y: 100 },
  radius: { x: 0, y: 0 }, period: 600, offset: 0 };

describe("Burrow feeding", () => {
  it("collects by swept head contact once, even at high speed, without a speed minimum", () => {
    const feeding = new BurrowFeeding({ food: [{ id: "food", kind: "spore", value: 1,
      position: { x: 100, y: 100 }, active: true }], prey: [prey] });
    expect(feeding.step({ ...head, previous: { x: 10, y: 100 }, position: { x: 190, y: 100 } }))
      .toMatchObject({ biomass: 9, preyEaten: 1 });
    expect(feeding.step(head).biomass).toBe(0);
    expect(feeding.foods[0]!.active).toBe(false);
  });
  it.each([
    [0, false, false], [0, true, false], [1, false, false], [1, true, false], [2, false, true],
  ] as const)("frontal armor contact at power %i, burst %s → edible %s", (power, burst, edible) => {
    const feeding = new BurrowFeeding({ food: [], prey: [{ ...prey, kind: "armored", large: true }] });
    const result = feeding.step({ ...head, power, burst });
    expect(result.biomass).toBe(edible ? 22 : 0);
    expect(result.largePreyEaten).toBe(edible ? 1 : 0);
    expect(result.blockedPrey).toBe(!edible);
    expect(feeding.foods.length).toBe(edible ? 5 : 0);
    if (edible) {
      expect(feeding.step(head).biomass).toBe(10);
      expect(feeding.step(head).biomass).toBe(0);
      expect(feeding.foods).toHaveLength(5);
    }
  });
  it("does not collect through distant body positions and does not attract enemies", () => {
    const feeding = new BurrowFeeding({ food: [], prey: [{ ...prey, center: { x: 180, y: 100 } }] });
    const before = feeding.positionOf(feeding.content.prey[0]!);
    for (let i = 0; i < 60; i += 1) feeding.step({ ...head, vacuum: true, burst: true, power: 2 });
    expect(feeding.positionOf(feeding.content.prey[0]!)).toEqual(before);
    expect(feeding.isEaten("worm")).toBe(false);
  });
  it("vacuum pulls only loose forward-cone food during a burst, within 130 pixels", () => {
    const points = [{ x: 175, y: 100 }, { x: 25, y: 100 }, { x: 100, y: 175 }, { x: 240, y: 100 }];
    const content = { food: points.map((position, i) => ({ id: String(i), kind: "spore" as const,
      value: 1, position, active: true })), prey: [] };
    const normal = new BurrowFeeding(content);
    const vacuum = new BurrowFeeding(content);
    for (let i = 0; i < 12; i += 1) {
      normal.step({ ...head, vacuum: true });
      vacuum.step({ ...head, vacuum: true, burst: true });
    }
    expect(normal.foods.every((food) => food.active)).toBe(true);
    expect(vacuum.foods.map((food) => food.active)).toEqual([false, true, true, true]);
    expect(vacuum.foods.slice(1).map((food) => food.position)).toEqual(points.slice(1));
  });
  it("opens roots by digging and brood capsules by burst into distinct food", () => {
    const content = { food: [
      { id: "root", kind: "root" as const, value: 0, position: { x: 100, y: 100 }, active: true },
      { id: "brood", kind: "brood" as const, value: 0, position: { x: 200, y: 100 }, active: true },
    ], prey: [] };
    const feeding = new BurrowFeeding(content);
    expect(feeding.step(head).foodOpened).toBe(1);
    expect(feeding.foods.filter((food) => food.kind === "rootBite")).toHaveLength(4);
    expect(feeding.step({ ...head, previous: { x: 170, y: 100 }, position: { x: 230, y: 100 },
      digging: false }).foodOpened).toBe(0);
    expect(feeding.step({ ...head, previous: { x: 170, y: 100 }, position: { x: 230, y: 100 },
      digging: false, burst: true }).foodOpened).toBe(1);
    expect(feeding.foods.filter((food) => food.kind === "larva")).toHaveLength(6);
  });
  it("opens sealed food and advances nearby prey with a deterministic quake", () => {
    const runner = { ...prey, id: "runner", kind: "runner" as const, center: { x: 210, y: 100 },
      radius: { x: 20, y: 10 } };
    const feeding = new BurrowFeeding({ food: [
      { id: "root", kind: "root", value: 0, position: { x: 130, y: 100 }, active: true },
      { id: "brood", kind: "brood", value: 0, position: { x: 160, y: 100 }, active: true },
    ], prey: [runner] });
    const result = feeding.step({ ...head, digging: false, quakeRadius: 190 });
    expect(result).toMatchObject({ foodOpened: 2, quakePushed: 1 });
    expect(feeding.foods.filter((food) => food.kind === "rootBite")).toHaveLength(4);
    expect(feeding.foods.filter((food) => food.kind === "larva")).toHaveLength(6);
    expect(feeding.snapshot().preyLead).toEqual([{ id: "runner", ticks: 20 }]);
  });
  it("makes runners accelerate on their authored route near the head", () => {
    const runner = { ...prey, id: "runner", kind: "runner" as const, center: { x: 180, y: 100 },
      radius: { x: 60, y: 20 } };
    const near = new BurrowFeeding({ food: [], prey: [runner] });
    const far = new BurrowFeeding({ food: [], prey: [runner] });
    for (let i = 0; i < 20; i += 1) {
      near.step(head);
      far.step({ ...head, previous: { x: 1000, y: 1000 }, position: { x: 1000, y: 1000 } });
    }
    expect(near.positionOf(runner)).not.toEqual(far.positionOf(runner));
    expect(near.snapshot().preyLead).toEqual([{ id: "runner", ticks: 40 }]);
  });
  it("lets a hunter burst bite armored prey from the side but not through its forehead", () => {
    const armor = { ...prey, kind: "armored" as const, large: true, radius: { x: 70, y: 25 } };
    const feeding = new BurrowFeeding({ food: [], prey: [armor] });
    const position = feeding.positionOf(armor, 1);
    expect(feeding.canEat(armor, 1, true, { x: position.x + 30, y: position.y })).toBe(true);
    expect(feeding.canEat(armor, 1, true, { x: position.x, y: position.y + 30 })).toBe(false);
  });
  it("replays food positions, drops and prey routes after a JSON snapshot", () => {
    const original = new BurrowFeeding(createFeedingContent());
    for (let i = 0; i < 80; i += 1) original.step(head);
    const restored = new BurrowFeeding(original.content, JSON.parse(JSON.stringify(original.snapshot())));
    for (let i = 0; i < 80; i += 1) expect(original.step(head)).toEqual(restored.step(head));
    expect(original.snapshot()).toEqual(restored.snapshot());
    expect(original.positionOf(original.content.prey[0]!)).toEqual(restored.positionOf(restored.content.prey[0]!));
  });
  it("authored food has reserve and all moving prey routes stay underground and in bounds", () => {
    const content = createFeedingContent();
    const terrain = createBurrowArena({ guideTunnel: false, shrineCave: false });
    expect(content.food.length).toBeGreaterThan(260);
    expect(new Set(content.food.map((food) => food.id)).size).toBe(content.food.length);
    for (const food of content.food) expect(food.position.y).toBeGreaterThan(420);
    const feeding = new BurrowFeeding(content);
    for (const worm of content.prey) for (let tick = 0; tick < worm.period; tick += 10) {
      const p = feeding.positionOf(worm, tick);
      expect(p.x).toBeGreaterThan(50);
      expect(p.x).toBeLessThan(2510);
      expect(p.y).toBeLessThan(1230);
      expect(p.y).toBeGreaterThan(420);
      // Guide tunnel may be empty but lies within opposing soil walls.
      expect(terrain.isSolidWorld(p.x, p.y) ||
        (terrain.isSolidWorld(p.x, p.y + 80) && terrain.isSolidWorld(p.x, p.y - 80))).toBe(true);
    }
  });
});
