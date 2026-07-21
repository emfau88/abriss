import { describe, expect, it } from "vitest";

import { BinaryTerrainMask } from "../terrain/TerrainMask";
import { planLocalMovement } from "./LocalMovementPlanner";

describe("local movement planner", () => {
  it("keeps every candidate inside the movement budget", () => {
    const terrain = BinaryTerrainMask.fromWorldPredicate(
      { worldWidth: 420, worldHeight: 220, cellSize: 2 },
      (_x, y) => y >= 150,
    );
    const plans = planLocalMovement({
      terrain,
      units: [
        unit("active", "crew", 70, 150),
        unit("target", "rivals", 350, 150),
      ],
      activeUnitId: "active",
      personality: "explosive",
      seed: 5,
      maximumHorizontalDistance: 150,
    });

    expect(plans.length).toBeGreaterThan(1);
    expect(plans.every((plan) => plan.distance <= 150)).toBe(true);
    expect(plans.some((plan) => plan.kind === "walk")).toBe(true);
  });

  it("creates a collision-free jump onto a reachable ledge", () => {
    const terrain = BinaryTerrainMask.fromWorldPredicate(
      { worldWidth: 420, worldHeight: 240, cellSize: 2 },
      (x, y) => y >= 180 || (x >= 175 && x <= 255 && y >= 92),
    );
    const plans = planLocalMovement({
      terrain,
      units: [
        unit("active", "crew", 55, 180),
        unit("target", "rivals", 350, 180),
      ],
      activeUnitId: "active",
      personality: "showboat",
      seed: 8,
      maximumHorizontalDistance: 190,
    });
    const jump = plans.find(
      (plan) => plan.kind === "jump" && plan.destination.y < 180,
    );

    expect(jump).toBeDefined();
    expect(jump?.distance).toBeLessThanOrEqual(190);
    expect(
      jump?.samples.slice(1, -1).every(
        (sample) =>
          !terrain.isSolid(sample.x, sample.y - 24) &&
          !terrain.isSolid(sample.x, sample.y - 54),
      ),
    ).toBe(true);
  });
});

function unit(
  id: string,
  team: string,
  x: number,
  y: number,
) {
  return {
    id,
    displayName: id,
    team,
    position: { x, y },
    hitPoints: 100,
  };
}
