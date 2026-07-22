import { describe, expect, it } from "vitest";

import { BinaryTerrainMask } from "../terrain/TerrainMask";
import {
  planRocketAction,
  scoreRocketMetrics,
  topUtilityReasons,
  type PlannerUnit,
  type RocketCandidateMetrics,
} from "./RocketActionPlanner";

const terrain = BinaryTerrainMask.fromWorldPredicate(
  { worldWidth: 800, worldHeight: 450, cellSize: 2 },
  (_x, y) => y >= 300,
);

const units: readonly PlannerUnit[] = [
  {
    id: "active",
    displayName: "Bruno",
    team: "crew",
    position: { x: 100, y: 300 },
    hitPoints: 100,
  },
  {
    id: "friend",
    displayName: "Mara",
    team: "crew",
    position: { x: 530, y: 300 },
    hitPoints: 100,
  },
  {
    id: "rival-near",
    displayName: "Rivale A",
    team: "rivals",
    position: { x: 550, y: 300 },
    hitPoints: 100,
  },
  {
    id: "rival-far",
    displayName: "Rivale B",
    team: "rivals",
    position: { x: 700, y: 300 },
    hitPoints: 100,
  },
];

describe("rocket action planner", () => {
  it("repeats candidate generation, ranking, and selection for one state and seed", () => {
    const input = {
      terrain,
      units,
      activeUnitId: "active",
      personality: "cautious" as const,
      seed: 21_072_026,
    };

    const first = planRocketAction(input);
    const second = planRocketAction(input);

    expect(second).toEqual(first);
    // Zwei lebende Ziele × vier Raketenbögen (Task 023: vierter steiler Bogen).
    expect(first.candidates).toHaveLength(8);
    expect(first.rankedCandidates.length).toBeGreaterThan(1);
    expect(first.selected?.trajectory.outcome).toBe("terrain-impact");
  });

  it("chooses a new valid candidate when the current plan is rejected", () => {
    const first = planRocketAction({
      terrain,
      units,
      activeUnitId: "active",
      personality: "cautious",
      seed: 91,
    });
    const rejectedId = first.selected?.id;

    expect(rejectedId).toBeTruthy();

    const alternative = planRocketAction({
      terrain,
      units,
      activeUnitId: "active",
      personality: "cautious",
      seed: 91,
      rejectedCandidateIds: rejectedId ? [rejectedId] : [],
    });

    expect(alternative.selected?.id).not.toBe(rejectedId);
    expect(alternative.selected?.valid).toBe(true);
    expect(alternative.rejectedCandidateIds).toEqual([rejectedId]);
  });

  it("evaluates all three weapon profiles without changing the legacy default", () => {
    const plan = planRocketAction({
      terrain,
      units,
      activeUnitId: "active",
      personality: "explosive",
      seed: 63,
      weaponIds: ["rocket", "grenade", "breaker"],
    });

    // Zwei Ziele × (4 Raketenbögen + 4 Granatenbögen × 2 Zielpunkte +
    // 3 Brecherbögen) – Task 023.
    expect(plan.candidates).toHaveLength(30);
    expect(new Set(plan.candidates.map((candidate) => candidate.weaponId))).toEqual(
      new Set(["rocket", "grenade", "breaker"]),
    );
    expect(plan.selected?.weaponName).toBeTruthy();
  });

  it("models grenades as fused projectiles that can bounce before exploding", () => {
    const plan = planRocketAction({
      terrain,
      units,
      activeUnitId: "active",
      personality: "showboat",
      seed: 63,
      weaponIds: ["grenade"],
    });

    // Zwei Ziele × (vier Granatenbögen + Showboat-Extrabogen, Task 024) ×
    // zwei Zielpunkte (direkt und kurz).
    expect(plan.candidates).toHaveLength(20);
    expect(
      plan.candidates.some(
        (candidate) => candidate.trajectory.outcome === "fuse-expired",
      ),
    ).toBe(true);
    expect(
      plan.candidates.some((candidate) => candidate.trajectory.bounces.length > 0),
    ).toBe(true);
  });

  it("uses the terrain breaker to open a fully blocked shot instead of stalling", () => {
    const blockedTerrain = BinaryTerrainMask.fromWorldPredicate(
      { worldWidth: 800, worldHeight: 450, cellSize: 2 },
      (x, y) => y >= 300 || (x >= 180 && x <= 480),
    );
    const plan = planRocketAction({
      terrain: blockedTerrain,
      units: [units[0]!, units[2]!],
      activeUnitId: "active",
      personality: "explosive",
      seed: 15,
      weaponIds: ["breaker"],
    });

    expect(plan.selected?.weaponId).toBe("breaker");
    expect(plan.selected?.metrics.targetDamage).toBe(0);
    expect(plan.selected?.metrics.terrainEffect).toBeGreaterThanOrEqual(8);
  });

  it("uses personality weights to make a risky blast and a showy arc matter differently", () => {
    const riskyBlast: RocketCandidateMetrics = {
      enemyDamage: 120,
      targetDamage: 80,
      friendlyDamage: 45,
      selfDamage: 0,
      terrainEffect: 85,
      showmanship: 30,
      aimError: 5,
    };
    const safeShow: RocketCandidateMetrics = {
      enemyDamage: 85,
      targetDamage: 80,
      friendlyDamage: 0,
      selfDamage: 0,
      terrainEffect: 35,
      showmanship: 95,
      aimError: 5,
    };
    const total = (metrics: RocketCandidateMetrics, personality: "cautious" | "explosive" | "showboat") =>
      scoreRocketMetrics(metrics, personality).reduce(
        (sum, component) => sum + component.contribution,
        0,
      );

    expect(total(safeShow, "cautious")).toBeGreaterThan(
      total(riskyBlast, "cautious"),
    );
    expect(total(riskyBlast, "explosive")).toBeGreaterThan(
      total(safeShow, "explosive"),
    );
    expect(total(safeShow, "showboat")).toBeGreaterThan(
      total(riskyBlast, "showboat"),
    );
  });

  it("changes the selected arc when cautious and showboat priorities conflict", () => {
    const cautious = planRocketAction({
      terrain,
      units,
      activeUnitId: "active",
      personality: "cautious",
      seed: 42,
    });
    const showboat = planRocketAction({
      terrain,
      units,
      activeUnitId: "active",
      personality: "showboat",
      seed: 42,
    });

    expect(cautious.selected?.flightTimeSeconds).toBeLessThan(
      showboat.selected?.flightTimeSeconds ?? 0,
    );
    expect(cautious.selected?.id).not.toBe(showboat.selected?.id);
  });

  it("exposes machine-readable positive and negative reasons", () => {
    const plan = planRocketAction({
      terrain,
      units,
      activeUnitId: "active",
      personality: "cautious",
      seed: 7,
    });
    const selected = plan.selected;

    expect(selected).not.toBeNull();

    if (!selected) {
      return;
    }

    expect(selected.components.map((component) => component.code)).toEqual([
      "enemy-effect",
      "friendly-risk",
      "self-risk",
      "demolition",
      "showmanship",
      "aim-error",
      "seed-variation",
    ]);
    expect(topUtilityReasons(selected).positive?.code).toBeTruthy();
    expect(topUtilityReasons(selected).negative?.code).toBeTruthy();
  });

  it("keeps candidate ordering stable when computed scores tie", () => {
    const zeroTerrain = BinaryTerrainMask.fromWorldPredicate(
      { worldWidth: 800, worldHeight: 450, cellSize: 2 },
      (_x, y) => y >= 300,
    );
    const plan = planRocketAction({
      terrain: zeroTerrain,
      units: [units[0]!, units[2]!, units[3]!],
      activeUnitId: "active",
      personality: "cautious",
      seed: 0,
      candidateFlightTimesSeconds: [1.4],
    });
    const ids = plan.rankedCandidates.map((candidate) => candidate.id);
    const scores = plan.rankedCandidates.map((candidate) => candidate.score);

    if (scores.length === 2 && Math.abs(scores[0]! - scores[1]!) < 1e-9) {
      expect(ids).toEqual([...ids].sort());
    } else {
      expect(ids).toEqual(
        [...plan.rankedCandidates]
          .sort((left, right) => right.score - left.score || left.id.localeCompare(right.id))
          .map((candidate) => candidate.id),
      );
    }
  });
});
