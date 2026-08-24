import { describe, expect, it } from "vitest";

import {
  CONFLICT_SCENARIOS,
  evaluateConflictScenarios,
  renderConflictScenarioResults,
} from "./conflictScenarios";

describe("targeted conflict probes", () => {
  it("evaluates every scenario for every personality deterministically", () => {
    const first = evaluateConflictScenarios();
    const second = evaluateConflictScenarios();
    expect(first).toEqual(second);
    expect(first).toHaveLength(CONFLICT_SCENARIOS.length * 3 * 2);
    expect(first.every((result) => result.planKind !== "skip")).toBe(true);
  });

  it("activates risk or chain metrics that normal openings rarely expose", () => {
    const results = evaluateConflictScenarios();
    const activatedScenarios = new Set(
      results
        .filter(
          (result) =>
            result.guidance === "target-order" &&
            (result.expectedFriendlyDamage > 0 ||
              result.expectedSelfDamage > 0 ||
              result.expectedChainEffect > 0 ||
              result.triggeredInteractables > 0),
        )
        .map((result) => result.scenarioId),
    );

    expect(activatedScenarios.size).toBeGreaterThanOrEqual(2);
  });

  it("renders a stable, readable report section", () => {
    const rendered = renderConflictScenarioResults(
      evaluateConflictScenarios(),
    );

    expect(rendered).toContain("## Gezielte Konfliktsonden");
    expect(rendered).toContain("Teamrisiko");
    expect(rendered).toContain("Fasskette");
    expect(rendered).toContain("Ring-out-Kante");
  });
});
