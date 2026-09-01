import { describe, expect, it } from "vitest";
import { BurrowRun, buildForBiomass } from "./BurrowRun";

describe("Burrow feed–grow run", () => {
  it("grows continuously before the first stage and has exact power thresholds", () => {
    expect(buildForBiomass(14).bodyCount).toBeGreaterThan(buildForBiomass(0).bodyCount);
    expect([0, 39, 40, 179, 180].map((mass) => buildForBiomass(mass).power)).toEqual([0, 0, 1, 1, 2]);
    const final = buildForBiomass(240);
    expect(final).toMatchObject({ bodyCount: 28, movementSpeedMultiplier: 1.15,
      burstSpeedMultiplier: 1.22, impactRadiusMultiplier: 1.2 });
    expect(buildForBiomass(999).bodyCount).toBe(28);
  });
  it("pauses for exactly one mutation, retaining threshold overshoot", () => {
    const run = new BurrowRun();
    expect(run.feed(1)).toBe(false);
    expect(run.chooseMutation("thunderjaw")).toBe(false);
    run.start();
    run.feed(79);
    run.feed(20, 1, 1);
    expect(run.state).toMatchObject({ phase: "mutation", biomass: 99, preyEaten: 1 });
    const paused = run.snapshot();
    run.advanceActiveStep();
    expect(run.feed(8, 1)).toBe(false);
    expect(run.snapshot()).toEqual(paused);
    expect(run.chooseMutation("thunderjaw")).toBe(true);
    expect(run.chooseMutation("vacuum")).toBe(false);
    expect(run.state).toMatchObject({ phase: "feeding", biomass: 99, mutation: "thunderjaw" });
  });
  it("requires mass AND a large prey AND mutation before a real final contact can complete", () => {
    const run = new BurrowRun();
    run.start();
    run.feed(240);
    expect(run.complete()).toBe(false);
    run.chooseMutation("vacuum");
    expect(run.state.phase).toBe("feeding");
    expect(run.complete()).toBe(false);
    run.feed(20, 1, 1);
    expect(run.state.phase).toBe("surface");
    expect(run.complete()).toBe(true);
    const result = run.snapshot();
    run.advanceActiveStep();
    expect(run.feed(10)).toBe(false);
    expect(run.complete()).toBe(false);
    expect(run.snapshot()).toEqual(result);
  });
  it("rejects invalid rewards, has no timeout, and snapshots round-trip", () => {
    const run = new BurrowRun();
    run.start();
    for (const amount of [0, -1, 0.5, Infinity, NaN]) expect(run.feed(amount)).toBe(false);
    expect(run.feed(8, 0, 1)).toBe(false);
    for (let i = 0; i < 36000; i += 1) run.advanceActiveStep();
    expect(run.state.phase).toBe("feeding");
    const snapshot = run.snapshot();
    expect(new BurrowRun(JSON.parse(JSON.stringify(snapshot))).snapshot()).toEqual(snapshot);
  });
  it("charges and releases at most three Bebenherz plates from real digging distance", () => {
    const run = new BurrowRun();
    run.start();
    run.feed(80);
    run.chooseMutation("quakeheart");
    run.advanceQuakeDig(71);
    expect(run.state.quakeCharge).toBe(0);
    run.advanceQuakeDig(217);
    expect(run.state.quakeCharge).toBe(3);
    expect(run.releaseQuake()).toBe(3);
    expect(run.releaseQuake()).toBe(0);
  });
  it.each(["vacuum", "thunderjaw", "quakeheart"] as const)("keeps %s independent of automatic power growth", (mutation) => {
    expect(buildForBiomass(80, mutation).power).toBe(1);
    expect(buildForBiomass(180, mutation).power).toBe(2);
    expect(buildForBiomass(180, mutation).mutation).toBe(mutation);
  });
});
