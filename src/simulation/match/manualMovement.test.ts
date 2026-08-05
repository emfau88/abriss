import { describe, expect, it } from "vitest";

import { BinaryTerrainMask } from "../terrain/TerrainMask";
import {
  applyManualMovement,
  manualMovementTo,
  manualMovementOptions,
} from "./manualMovement";
import {
  createMatchSimulation,
  type MatchSimulationState,
} from "./matchSimulationState";

function createTestSimulation(): MatchSimulationState {
  const terrain = BinaryTerrainMask.fromWorldPredicate(
    { worldWidth: 1600, worldHeight: 600, cellSize: 2 },
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
        spawnX: 400,
        personality: "cautious",
        preferredWeaponId: "rocket",
      },
      {
        id: "rival-1",
        displayName: "RIVALE A",
        team: "rivals",
        spawnX: 1000,
        personality: "explosive",
      },
    ],
  });
}

describe("manual movement options (Task 011)", () => {
  it("always offers hold first plus valid moves", () => {
    const options = manualMovementOptions(createTestSimulation());

    expect(options[0]?.kind).toBe("hold");
    expect(options.length).toBeGreaterThan(1);
    // Alle Bewegungsziele bleiben im 190-Punkte-Limit.
    for (const option of options) {
      expect(option.distance).toBeLessThanOrEqual(190);
    }
  });

  it("applies a chosen move to the active unit position", () => {
    const state = createTestSimulation();
    const move = manualMovementOptions(state).find(
      (option) => option.kind !== "hold",
    );

    expect(move).toBeDefined();
    applyManualMovement(state, move!);
    const active = state.units.find((unit) => unit.id === "crew-slime");
    expect(active?.position.x).toBe(move!.destination.x);
    expect(active?.position.y).toBe(move!.destination.y);
  });

  it("leaves the position unchanged on hold", () => {
    const state = createTestSimulation();
    const before = { ...state.units[0]!.position };
    applyManualMovement(state, manualMovementOptions(state)[0]!);
    expect(state.units[0]!.position).toEqual(before);
  });

  it("accepts a freely chosen non-preset position", () => {
    const state = createTestSimulation();
    const move = manualMovementTo(state, { x: 487, y: 398 });

    expect(move).toMatchObject({
      kind: "walk",
      destination: { x: 487, y: 400 },
      distance: 87,
    });
    expect(
      manualMovementOptions(state).some(
        (option) => option.destination.x === move?.destination.x,
      ),
    ).toBe(false);
  });

  it("rejects points outside the movement budget and occupied landings", () => {
    const state = createTestSimulation();

    expect(manualMovementTo(state, { x: 591, y: 400 })).toBeNull();

    const occupiedState = createMatchSimulation({
      seed: 21_072_026,
      terrain: state.terrain,
      unitDefinitions: [
        {
          id: "crew-slime",
          displayName: "GLIB",
          team: "crew",
          spawnX: 400,
          personality: "cautious",
        },
        {
          id: "crew-blocker",
          displayName: "MOKI",
          team: "crew",
          spawnX: 500,
          personality: "showboat",
        },
        {
          id: "rival-1",
          displayName: "RIVALE A",
          team: "rivals",
          spawnX: 1000,
          personality: "explosive",
        },
      ],
    });

    expect(manualMovementTo(occupiedState, { x: 500, y: 400 })).toBeNull();
  });

  it("uses a jump for a freely selected reachable ledge", () => {
    const terrain = BinaryTerrainMask.fromWorldPredicate(
      { worldWidth: 1600, worldHeight: 650, cellSize: 2 },
      (x, y) => y >= 500 || (x >= 520 && x <= 640 && y >= 370),
    );
    const state = createMatchSimulation({
      seed: 21_072_026,
      terrain,
      unitDefinitions: [
        {
          id: "crew-slime",
          displayName: "GLIB",
          team: "crew",
          spawnX: 400,
          personality: "showboat",
        },
        {
          id: "rival-1",
          displayName: "RIVALE A",
          team: "rivals",
          spawnX: 1000,
          personality: "explosive",
        },
      ],
    });
    const move = manualMovementTo(state, { x: 550, y: 365 });

    expect(move).toMatchObject({
      kind: "jump",
      destination: { x: 550, y: 370 },
      distance: 150,
    });
    expect(move?.samples.length).toBeGreaterThan(20);
  });
});
