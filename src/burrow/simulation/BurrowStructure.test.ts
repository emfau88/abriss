import { describe, expect, it } from "vitest";

import { BurrowStructure } from "./BurrowStructure";
import { BurrowTerrain } from "./BurrowTerrain";

describe("BurrowStructure", () => {
  it("reports a terrain-lost support once without collapsing the first time", () => {
    const { terrain, structure, supports } = createStructure();

    terrain.carveCircle(supports[0]!.position, 14);
    const result = structure.step();

    expect(result).toEqual({ lostSupportIds: ["links"], collapsedNow: false });
    expect(structure.state.collapsed).toBe(false);
    expect(structure.step()).toEqual({ lostSupportIds: [], collapsedNow: false });
  });

  it("collapses exactly once when the second terrain anchor is lost", () => {
    const { terrain, structure, supports } = createStructure();
    terrain.carveCircle(supports[0]!.position, 14);
    structure.step();
    terrain.carveCircle(supports[1]!.position, 14);

    const collapse = structure.step();

    expect(collapse).toEqual({ lostSupportIds: ["mitte"], collapsedNow: true });
    expect(structure.state.collapsed).toBe(true);
    expect(structure.step()).toEqual({ lostSupportIds: [], collapsedNow: false });
  });

  it("does not react while every anchor remains in solid terrain", () => {
    const { structure } = createStructure();

    expect(structure.step()).toEqual({ lostSupportIds: [], collapsedNow: false });
    expect(structure.state.supports.every((support) => support.active)).toBe(true);
  });
});

function createStructure(): {
  terrain: BurrowTerrain;
  structure: BurrowStructure;
  supports: readonly { readonly id: string; readonly position: { readonly x: number; readonly y: number } }[];
} {
  const terrain = new BurrowTerrain({
    worldWidth: 700,
    worldHeight: 500,
    cellSize: 4,
    solidAt: () => true,
  });
  const supports = [
    { id: "links", position: { x: 260, y: 280 } },
    { id: "mitte", position: { x: 320, y: 280 } },
    { id: "rechts", position: { x: 380, y: 280 } },
  ] as const;
  return { terrain, structure: new BurrowStructure(terrain, supports), supports };
}
