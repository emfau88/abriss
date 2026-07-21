import { describe, expect, it } from "vitest";

import {
  advanceTurn,
  createInitialMatchState,
  determineMatchOutcome,
  upcomingLivingCombatants,
  updateCombatantHitPoints,
} from "./matchState";

describe("match state", () => {
  it("creates a deterministic initial turn order", () => {
    const state = createInitialMatchState({
      seed: 42,
      combatants: [
        { id: "crew-a", team: "crew", hitPoints: 100 },
        { id: "rival-a", team: "rivals", hitPoints: 100 },
      ],
    });

    expect(state.seed).toBe(42);
    expect(state.activeCombatantId).toBe("crew-a");
    expect(state.turnOrder).toEqual(["crew-a", "rival-a"]);
  });

  it("skips incapacitated combatants without mutating the prior state", () => {
    const state = createInitialMatchState({
      seed: 7,
      combatants: [
        { id: "crew-a", team: "crew", hitPoints: 100 },
        { id: "rival-a", team: "rivals", hitPoints: 0 },
        { id: "rival-b", team: "rivals", hitPoints: 50 },
      ],
    });

    const advanced = advanceTurn(state);

    expect(advanced.activeCombatantId).toBe("rival-b");
    expect(advanced.turnNumber).toBe(2);
    expect(state.activeCombatantId).toBe("crew-a");
    expect(state.turnNumber).toBe(1);
  });

  it("updates hit points immutably and skips a newly incapacitated unit", () => {
    const state = createInitialMatchState({
      seed: 9,
      combatants: [
        { id: "crew-a", team: "crew", hitPoints: 140 },
        { id: "rival-a", team: "rivals", hitPoints: 140 },
        { id: "crew-b", team: "crew", hitPoints: 140 },
      ],
    });
    const damaged = updateCombatantHitPoints(state, "rival-a", 0);
    const advanced = advanceTurn(damaged);

    expect(damaged.combatants["rival-a"]?.hitPoints).toBe(0);
    expect(state.combatants["rival-a"]?.hitPoints).toBe(140);
    expect(advanced.activeCombatantId).toBe("crew-b");
  });

  it("reports the surviving team or a draw", () => {
    const state = createInitialMatchState({
      seed: 11,
      combatants: [
        { id: "crew-a", team: "crew", hitPoints: 100 },
        { id: "rival-a", team: "rivals", hitPoints: 0 },
      ],
    });

    expect(determineMatchOutcome(state)).toBe("crew");
    expect(
      determineMatchOutcome(updateCombatantHitPoints(state, "crew-a", 0)),
    ).toBe("draw");
  });

  it("lists the current and next living combatants for the HUD", () => {
    const state = createInitialMatchState({
      seed: 12,
      combatants: [
        { id: "bruno", team: "crew", hitPoints: 100 },
        { id: "rival-a", team: "rivals", hitPoints: 0 },
        { id: "mara", team: "crew", hitPoints: 80 },
        { id: "rival-b", team: "rivals", hitPoints: 70 },
      ],
    });

    expect(upcomingLivingCombatants(state)).toEqual([
      "bruno",
      "mara",
      "rival-b",
    ]);
    expect(upcomingLivingCombatants(state, 2)).toEqual(["bruno", "mara"]);
  });
});
