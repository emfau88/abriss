import { describe, expect, it } from "vitest";
import { BurrowFeedingSession } from "./BurrowFeedingSession";
import type { BurrowMutation } from "./BurrowRun";
import type { Point } from "./BurrowTerrain";

const idle = { direction: null, burstPressed: false };
const right = { direction: { x: 1, y: 0 }, burstPressed: false };
function snapshot(session: BurrowFeedingSession) {
  return { run: session.run.snapshot(), motion: session.motion.state,
    feeding: session.feeding.snapshot(), trails: session.motion.trailField.snapshot(), hunt: session.hunt.state,
    terrainVersion: session.terrain.version };
}

describe("feed–grow session integration", () => {
  it("keeps the whole world frozen before input and during choice and result", () => {
    const session = new BurrowFeedingSession();
    const intro = snapshot(session);
    for (let i = 0; i < 60; i += 1) session.step(idle);
    expect(snapshot(session)).toEqual(intro);
    session.step(right);
    session.run.feed(80);
    const paused = snapshot(session);
    for (let i = 0; i < 80; i += 1) session.step({ ...right, burstPressed: true });
    expect(snapshot(session)).toEqual(paused);
    session.chooseMutation("chain");
    session.run.feed(180, 1, 1);
    session.run.complete();
    const completed = snapshot(session);
    for (let i = 0; i < 80; i += 1) session.step(right);
    expect(snapshot(session)).toEqual(completed);
    expect(snapshot(new BurrowFeedingSession())).toEqual(intro);
  });
  it("collects the starting food at normal speed and grows within ten seconds", () => {
    const session = new BurrowFeedingSession();
    for (let i = 0; i < 240; i += 1) session.step({ direction: { x: 1, y: -0.1 }, burstPressed: false });
    expect(session.run.state.biomass).toBeGreaterThanOrEqual(14);
    expect(session.run.build.bodyCount).toBeGreaterThan(10);
    expect(session.run.state.activeSteps).toBeLessThan(600);
  });
  it.each(["trailrunner", "vacuum", "chain"] as const)(
    "can finish an actual movement/food/prey/cart run using %s without injected rewards", (mutation) => {
      const session = new BurrowFeedingSession();
      let mutationChoices = 0;
      let firstGrowthStep = 0;
      let firstLargeStep = 0;
      for (let tick = 0; tick < 24000 && session.run.state.phase !== "complete"; tick += 1) {
        if (session.run.state.phase === "mutation") {
          expect(session.chooseMutation(mutation)).toBe(true);
          mutationChoices += 1;
        }
        drive(session, mutation);
        if (!firstGrowthStep && session.run.build.bodyCount > 10) firstGrowthStep = tick;
        if (!firstLargeStep && session.run.state.largePreyEaten > 0) firstLargeStep = tick;
      }
      expect(session.run.state, JSON.stringify(session.run.state)).toMatchObject({ phase: "complete", mutation });
      expect(session.run.state.biomass).toBeGreaterThanOrEqual(240);
      expect(session.run.state.largePreyEaten).toBeGreaterThan(0);
      expect(mutationChoices).toBe(1);
      expect(firstGrowthStep).toBeLessThan(600);
      expect(firstLargeStep).toBeLessThan(3600);
      expect(session.hunt.state.vehicle).toMatchObject({ active: false, kind: "finale", hitPoints: 0 });
      const result = snapshot(session);
      expect(JSON.parse(JSON.stringify(result))).toEqual(result);
      for (let i = 0; i < 10; i += 1) session.step(right);
      expect(snapshot(session)).toEqual(result);
    }, 30000);
});

/** Test driver supplies only ordinary direction/burst/choice input; no teleport or awarded mass. */
function drive(session: BurrowFeedingSession, _mutation: BurrowMutation): void {
  const { motion, run, feeding, hunt } = session;
  const origin = motion.state.position;
  let target: Point = { x: 750, y: 790 };
  let nearest = Number.POSITIVE_INFINITY;
  const consider = (position: Point, weight = 1): void => {
    const distance = Math.hypot(position.x - origin.x, position.y - origin.y) / weight;
    if (distance < nearest) { target = position; nearest = distance; }
  };
  if (run.state.phase === "surface") {
    const cart = hunt.state.vehicle;
    target = { x: cart.position.x + cart.direction * 22, y: cart.position.y };
  } else if (run.build.power >= 1 && run.state.largePreyEaten === 0) {
    for (const prey of feeding.content.prey) {
      if (prey.large && !feeding.isEaten(prey.id)) consider(feeding.positionOf(prey, feeding.elapsedTicks + 12));
    }
  } else {
    for (const food of feeding.foods) if (food.active) consider(food.position);
    for (const prey of feeding.content.prey) {
      if (!prey.large && !feeding.isEaten(prey.id)) consider(feeding.positionOf(prey), 1.8);
    }
  }
  const dx = target.x - origin.x;
  const dy = target.y - origin.y;
  const distance = Math.hypot(dx, dy);
  const alignment = (dx * Math.cos(motion.state.angle) + dy * Math.sin(motion.state.angle)) / Math.max(1, distance);
  session.step({ direction: { x: dx, y: dy },
    burstPressed: motion.state.burstCooldown === 0 && alignment > 0.92 &&
      (run.state.phase === "surface" ? distance < 280 : run.build.power >= 1 && run.state.largePreyEaten === 0 && distance < 130) });
}
