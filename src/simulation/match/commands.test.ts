import { describe, expect, it } from "vitest";

import { BinaryTerrainMask } from "../terrain/TerrainMask";
import {
  commandWeapon,
  cycleActivePersonality,
  rejectActivePlan,
} from "./commands";
import {
  createMatchSimulation,
  type MatchSimulationState,
} from "./matchSimulationState";
import { planTurn } from "./planTurn";

function createTestSimulation(): MatchSimulationState {
  const terrain = BinaryTerrainMask.fromWorldPredicate(
    { worldWidth: 1200, worldHeight: 600, cellSize: 2 },
    (_x, y) => y >= 400,
  );

  return createMatchSimulation({
    seed: 21_072_026,
    terrain,
    unitDefinitions: [
      {
        id: "crew-slime",
        displayName: "GLIB",
        team: "crew",
        spawnX: 200,
        personality: "cautious",
        preferredWeaponId: "rocket",
      },
      {
        id: "rival-1",
        displayName: "RIVALE A",
        team: "rivals",
        spawnX: 700,
        personality: "cautious",
      },
    ],
  });
}

describe("match engine commands (Task 021, Schritt 4)", () => {
  it("rejects the announced plan exactly once per match", () => {
    const state = createTestSimulation();
    const turnPlan = planTurn(state);

    expect(turnPlan.action.selected).not.toBeNull();

    const first = rejectActivePlan(state, turnPlan);
    expect(first.accepted).toBe(true);
    expect(first.rejectedCandidateId).toBe(turnPlan.action.selected?.id);
    expect(state.rejectedCandidateIds).toEqual([first.rejectedCandidateId]);
    expect(state.interventionUsed).toBe(true);

    const replanned = planTurn(state);
    expect(replanned.action.selected?.id).not.toBe(first.rejectedCandidateId);

    const second = rejectActivePlan(state, replanned);
    expect(second.accepted).toBe(false);
  });

  it("forces a weapon exactly once and clears rejected candidates", () => {
    const state = createTestSimulation();
    state.rejectedCandidateIds = ["rocket:rival-1:arc-1"];

    const first = commandWeapon(state, "breaker");
    expect(first.accepted).toBe(true);
    expect(state.forcedWeaponId).toBe("breaker");
    expect(state.rejectedCandidateIds).toEqual([]);

    const plan = planTurn(state);
    expect(plan.action.selected?.weaponId).toBe("breaker");

    const second = commandWeapon(state, "rocket");
    expect(second.accepted).toBe(false);
    expect(state.forcedWeaponId).toBe("breaker");
  });

  it("cycles the personality of the active crew figure", () => {
    const state = createTestSimulation();

    expect(cycleActivePersonality(state)).toEqual({
      accepted: true,
      personality: "explosive",
    });
    expect(cycleActivePersonality(state)).toEqual({
      accepted: true,
      personality: "showboat",
    });
    expect(cycleActivePersonality(state)).toEqual({
      accepted: true,
      personality: "cautious",
    });
  });

  it("refuses every command while a rival is active", () => {
    const state = createTestSimulation();
    const crewPlan = planTurn(state);
    state.matchState = {
      ...state.matchState,
      activeCombatantId: "rival-1",
    };

    expect(rejectActivePlan(state, crewPlan).accepted).toBe(false);
    expect(commandWeapon(state, "rocket").accepted).toBe(false);
    expect(cycleActivePersonality(state).accepted).toBe(false);
    expect(state.interventionUsed).toBe(false);
    expect(state.weaponCommandUsed).toBe(false);
  });
});
