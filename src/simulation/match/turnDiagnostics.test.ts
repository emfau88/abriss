import { describe, expect, it } from "vitest";

import { BinaryTerrainMask } from "../terrain/TerrainMask";
import {
  createMatchSimulation,
  type MatchSimulationState,
} from "./matchSimulationState";
import { planTurn } from "./planTurn";
import { runMatch } from "./runMatch";
import { diagnoseTurn } from "./turnDiagnostics";

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
        personality: "explosive",
      },
    ],
  });
}

describe("turn diagnostics (Task 022, Teil A)", () => {
  it("explains the announced plan with ranked, reasoned candidates", () => {
    const state = createTestSimulation();
    const plan = planTurn(state);
    const diagnostic = diagnoseTurn(state, plan);

    expect(diagnostic.turnNumber).toBe(1);
    expect(diagnostic.activeUnitId).toBe("crew-slime");
    expect(diagnostic.team).toBe("crew");
    expect(diagnostic.kind).toBe("attack");
    expect(diagnostic.usedPreferredWeaponId).toBe("rocket");
    expect(diagnostic.selectedCandidateId).toBe(plan.action.selected?.id);
    expect(diagnostic.candidateCount).toBeGreaterThan(0);
    expect(diagnostic.rankedCandidates.length).toBeGreaterThan(0);
    expect(diagnostic.rankedCandidates[0]?.rank).toBe(1);
    expect(diagnostic.rankedCandidates[0]?.id).toBe(
      diagnostic.selectedCandidateId,
    );
    expect(diagnostic.rankedCandidates[0]?.topPositive).not.toBeNull();
    // Diagnose ist reine Ableitung und muss JSON-serialisierbar sein.
    expect(JSON.parse(JSON.stringify(diagnostic))).toEqual(diagnostic);
  });

  it("collects one deterministic diagnostic per turn in runMatch", () => {
    const first = runMatch(createTestSimulation(), {
      collectDiagnostics: true,
    });
    const second = runMatch(createTestSimulation(), {
      collectDiagnostics: true,
    });

    expect(first.diagnostics).toBeDefined();
    expect(first.diagnostics).toHaveLength(first.turnCount);
    expect(JSON.stringify(second.diagnostics)).toBe(
      JSON.stringify(first.diagnostics),
    );

    // Ohne Option bleibt das Resultat unverändert schlank.
    const plain = runMatch(createTestSimulation());
    expect(plain.diagnostics).toBeUndefined();
    expect(JSON.stringify(plain.turns)).toBe(JSON.stringify(first.turns));
  });
});
