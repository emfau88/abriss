import { describe, expect, it } from "vitest";
import { BurrowSurfaceSupport } from "./BurrowSurfaceSupport";
import { BurrowTerrain } from "./BurrowTerrain";
import { BurrowHunt } from "./BurrowHunt";
import { BurrowWorldResponse } from "./BurrowWorldResponse";

const DT = 1 / 60;
const create = () => {
  const terrain = new BurrowTerrain({ worldWidth: 1200, worldHeight: 800, cellSize: 4, solidAt: (_x, y) => y >= 300 });
  return { terrain, surface: new BurrowSurfaceSupport(terrain) };
};

describe("Burrow surface support", () => {
  it("finds actual soil and rejects a large step without walking into it", () => {
    const { terrain, surface } = create();
    terrain.carveCircle({ x: 540, y: 300 }, 30);
    expect(surface.groundYAt(540)).toBe(328);
    const blocked = surface.advance({ x: 500, y: 297 }, 540, 3, "grounded", DT);
    expect(blocked).toEqual({ position: { x: 500, y: 297 }, status: "blocked" });
  });

  it("sinks a cart into a crater, stops it and does not teleport up on the next patrol tick", () => {
    const { terrain, surface } = create();
    const hunt = new BurrowHunt({ minimumX: 100, maximumX: 1000, startX: 500, surfaceYAt: () => 300 }, surface);
    terrain.carveCircle({ x: 500, y: 300 }, 60);
    hunt.step(DT);
    expect(hunt.state.vehicle.surfaceStatus).toBe("falling");
    expect(hunt.state.vehicle.position.x).toBe(500);
    expect(hunt.state.vehicle.position.y).toBe(272);
    for (let i = 0; i < 120; i += 1) hunt.step(DT);
    expect(hunt.state.vehicle.surfaceStatus).toBe("stranded");
    expect(hunt.state.vehicle.position.y + 31).toBe(surface.groundYAt(500));
    const position = hunt.state.vehicle.position;
    for (let i = 0; i < 120; i += 1) hunt.step(DT);
    expect(hunt.state.vehicle.position).toEqual(position);
  });

  it("grounds the animal from the same mask while keeping the shrine one-shot", () => {
    const { terrain, surface } = create();
    const world = new BurrowWorldResponse({ animalStart: { x: 500, y: 297 }, shrinePosition: { x: 800, y: 700 }, surfaceYAt: () => 300, minimumX: 100, maximumX: 1000 }, surface);
    terrain.carveCircle({ x: 500, y: 300 }, 50);
    for (let i = 0; i < 120; i += 1) world.step({ headPosition: { x: 450, y: 300 }, breachOccurred: i === 0, deltaSeconds: DT });
    expect(world.state.animal.surfaceStatus).toBe("stranded");
    expect(world.state.animal.position.x).toBe(500);
    expect(world.state.animal.position.y + 3).toBe(surface.groundYAt(500));
    expect(world.step({ headPosition: { x: 800, y: 700 }, breachOccurred: false, deltaSeconds: DT }).shrineActivatedNow).toBe(true);
    expect(world.step({ headPosition: { x: 800, y: 700 }, breachOccurred: false, deltaSeconds: DT }).shrineActivatedNow).toBe(false);
  });
});
