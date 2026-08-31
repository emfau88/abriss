import { describe, expect, it } from "vitest";
import { BurrowFeeding, type FeedingHead, type PreyDefinition } from "./BurrowFeeding";
import { createFeedingContent } from "../content/feeding";
import { createBurrowArena } from "../content/arena";

const head: FeedingHead = { previous: { x: 100, y: 100 }, position: { x: 100, y: 100 },
  angle: 0, power: 0, burst: false, vacuum: false };
const prey: PreyDefinition = { id: "worm", large: false, center: { x: 100, y: 100 },
  radius: { x: 0, y: 0 }, period: 600, offset: 0 };

describe("Burrow feeding", () => {
  it("collects by swept head contact once, even at high speed, without a speed minimum", () => {
    const feeding = new BurrowFeeding({ food: [{ id: "food", position: { x: 100, y: 100 }, active: true }], prey: [prey] });
    expect(feeding.step({ ...head, previous: { x: 10, y: 100 }, position: { x: 190, y: 100 } }))
      .toMatchObject({ biomass: 9, preyEaten: 1 });
    expect(feeding.step(head).biomass).toBe(0);
    expect(feeding.foods[0]!.active).toBe(false);
  });
  it.each([
    [0, false, false], [0, true, false], [1, false, false], [1, true, true], [2, false, true],
  ] as const)("large prey power %i, burst %s → edible %s", (power, burst, edible) => {
    const feeding = new BurrowFeeding({ food: [], prey: [{ ...prey, large: true }] });
    const result = feeding.step({ ...head, power, burst });
    expect(result.biomass).toBe(edible ? 20 : 0);
    expect(result.largePreyEaten).toBe(edible ? 1 : 0);
    expect(result.blockedPrey).toBe(!edible);
    expect(feeding.foods.length).toBe(edible ? 10 : 0);
    if (edible) {
      expect(feeding.step(head).biomass).toBe(10);
      expect(feeding.step(head).biomass).toBe(0);
      expect(feeding.foods).toHaveLength(10);
    }
  });
  it("does not collect through distant body positions and does not attract enemies", () => {
    const feeding = new BurrowFeeding({ food: [], prey: [{ ...prey, center: { x: 180, y: 100 } }] });
    const before = feeding.positionOf(feeding.content.prey[0]!);
    for (let i = 0; i < 60; i += 1) feeding.step({ ...head, vacuum: true, burst: true, power: 2 });
    expect(feeding.positionOf(feeding.content.prey[0]!)).toEqual(before);
    expect(feeding.isEaten("worm")).toBe(false);
  });
  it("vacuum pulls only loose forward-cone food during a burst, within 100 pixels", () => {
    const points = [{ x: 175, y: 100 }, { x: 25, y: 100 }, { x: 100, y: 175 }, { x: 210, y: 100 }];
    const content = { food: points.map((position, i) => ({ id: String(i), position, active: true })), prey: [] };
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
    const terrain = createBurrowArena(false);
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
