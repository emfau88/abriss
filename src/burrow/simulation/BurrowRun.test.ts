import { describe, expect, it } from "vitest";

import { BurrowRun, LEVEL_1 } from "./BurrowRun";

describe("BurrowRun", () => {
  it("pauses the level clock outside active phases and awakens the shrine exactly once", () => {
    const run = new BurrowRun();

    run.advanceActiveStep();
    expect(run.state.activeSteps).toBe(0);
    run.start();
    run.advanceActiveStep();
    expect(run.state.activeSteps).toBe(1);
    expect(run.collectBiomass(4)).toBe(false);
    expect(run.collectBiomass()).toBe(true);
    expect(run.state.phase).toBe("shrine-ready");
    expect(run.state.totalBiomass).toBe(0);
    expect(run.collectBiomass()).toBe(false);
    expect(run.state.phase).toBe("shrine-ready");

    const beforePause = run.state.activeSteps;
    run.openUpgrade();
    run.advanceActiveStep();
    expect(run.state.activeSteps).toBe(beforePause);
  });

  it("applies exactly one documented rank-1 build and completes only after the finale", () => {
    const run = new BurrowRun();
    run.start();
    run.collectBiomass(LEVEL_1.shrineBiomass);
    run.openUpgrade();

    expect(run.chooseUpgrade("skystrider")).toBe(true);
    expect(run.state.build).toEqual({
      stage: "sprout",
      burstSpeedMultiplier: 1.12,
      biteDamageBonus: 0,
      impactRadiusMultiplier: 1,
    });
    expect(run.chooseUpgrade("ram")).toBe(false);
    expect(run.completeLevel()).toBe(true);
    expect(run.state.phase).toBe("level-complete");
    expect(run.state.totalBiomass).toBe(LEVEL_1.shrineBiomass);
    expect(run.state.build.stage).toBe("burrower");
  });

  it("fails after the fixed active-time limit and restores the entry checkpoint", () => {
    const run = new BurrowRun({ ...LEVEL_1, activeStepLimit: 2 });
    run.start();
    run.collectBiomass();
    run.advanceActiveStep();
    run.advanceActiveStep();

    expect(run.state.phase).toBe("failed");
    run.restartFromCheckpoint();
    expect(run.state).toMatchObject({
      phase: "intro",
      activeSteps: 0,
      levelBiomass: 0,
      totalBiomass: 0,
      shrineAwakened: false,
      selectedUpgrade: null,
      build: { stage: "sprout" },
    });
  });
});
