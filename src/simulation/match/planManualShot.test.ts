import { describe, expect, it } from "vitest";

import { BinaryTerrainMask } from "../terrain/TerrainMask";
import {
  createMatchSimulation,
  type MatchSimulationState,
} from "./matchSimulationState";
import { planManualShot } from "./planManualShot";
import { resolveTurn } from "./resolveTurn";

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

describe("manual shot planning (Task 011)", () => {
  it("turns a player aim into an executable attack plan", () => {
    const state = createTestSimulation();
    const plan = planManualShot(state, {
      weaponId: "rocket",
      launchVelocity: { x: 360, y: -260 },
    });

    expect(plan.activeUnitId).toBe("crew-slime");
    expect(plan.kind).toBe("attack");
    expect(plan.action.selected).not.toBeNull();
    expect(plan.movement.kind).toBe("hold");
    // Kein Streukegel: Der Spieler hat selbst gezielt.
    expect(plan.execution?.spreadRadius).toBe(0);
    expect(plan.execution?.trajectory).toBe(plan.action.selected?.trajectory);
  });

  it("resolves a manual shot through the normal turn machinery", () => {
    const state = createTestSimulation();
    const plan = planManualShot(state, {
      weaponId: "rocket",
      launchVelocity: { x: 360, y: -260 },
    });
    const events = resolveTurn(state, plan);

    expect(events.some((event) => event.type === "projectile-resolved")).toBe(
      true,
    );
    expect(events.some((event) => event.type === "terrain-mutated")).toBe(true);
  });

  it("is deterministic for the same aim", () => {
    const first = planManualShot(createTestSimulation(), {
      weaponId: "grenade",
      launchVelocity: { x: 300, y: -300 },
    });
    const second = planManualShot(createTestSimulation(), {
      weaponId: "grenade",
      launchVelocity: { x: 300, y: -300 },
    });

    expect(JSON.stringify(second.action.selected?.trajectory)).toBe(
      JSON.stringify(first.action.selected?.trajectory),
    );
  });
});
