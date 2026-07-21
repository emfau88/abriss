import { describe, expect, it } from "vitest";

import { BinaryTerrainMask } from "./TerrainMask";

describe("BinaryTerrainMask", () => {
  it("maps world coordinates to cells and treats out-of-bounds space as air", () => {
    const mask = BinaryTerrainMask.filled({
      worldWidth: 20,
      worldHeight: 12,
      cellSize: 2,
    });

    expect(mask.worldToCell(0, 0)).toEqual({ x: 0, y: 0 });
    expect(mask.worldToCell(1.99, 1.99)).toEqual({ x: 0, y: 0 });
    expect(mask.worldToCell(2, 2)).toEqual({ x: 1, y: 1 });
    expect(mask.isSolid(19.99, 11.99)).toBe(true);
    expect(mask.isSolid(-0.01, 4)).toBe(false);
    expect(mask.isSolid(20, 4)).toBe(false);
  });

  it("removes a circle and reports only the changed dirty region", () => {
    const mask = BinaryTerrainMask.filled({
      worldWidth: 24,
      worldHeight: 24,
      cellSize: 2,
    });
    const before = mask.copyCellData();

    const mutation = mask.removeCircle(12, 12, 4);

    expect(mutation.removedCells).toBeGreaterThan(0);
    expect(mutation.dirtyCells).not.toBeNull();
    expect(mask.isSolid(12, 12)).toBe(false);
    expect(mask.isSolid(2, 2)).toBe(true);
    expect(mask.version).toBe(1);

    const dirty = mutation.dirtyCells;
    expect(dirty).not.toBeNull();

    if (!dirty) {
      throw new Error("Expected a dirty region.");
    }

    const after = mask.copyCellData();

    for (let y = 0; y < mask.cellHeight; y += 1) {
      for (let x = 0; x < mask.cellWidth; x += 1) {
        const insideDirty =
          x >= dirty.x &&
          x < dirty.x + dirty.width &&
          y >= dirty.y &&
          y < dirty.y + dirty.height;

        if (!insideDirty) {
          expect(after[y * mask.cellWidth + x]).toBe(
            before[y * mask.cellWidth + x],
          );
        }
      }
    }
  });

  it("clips edge explosions safely", () => {
    const mask = BinaryTerrainMask.filled({
      worldWidth: 20,
      worldHeight: 20,
      cellSize: 2,
    });

    const mutation = mask.removeCircle(0, 0, 6);

    expect(mutation.removedCells).toBeGreaterThan(0);
    expect(mutation.dirtyWorld?.x).toBe(0);
    expect(mutation.dirtyWorld?.y).toBe(0);
    expect(mask.isSolid(1, 1)).toBe(false);
    expect(mask.isSolid(19, 19)).toBe(true);
  });

  it("keeps overlapping removals idempotent", () => {
    const mask = BinaryTerrainMask.filled({
      worldWidth: 30,
      worldHeight: 30,
      cellSize: 1,
    });

    const first = mask.removeCircle(15, 15, 5);
    const solidAfterFirst = mask.countSolidCells();
    const second = mask.removeCircle(15, 15, 5);

    expect(first.removedCells).toBeGreaterThan(0);
    expect(second.removedCells).toBe(0);
    expect(second.dirtyCells).toBeNull();
    expect(second.version).toBe(first.version);
    expect(mask.countSolidCells()).toBe(solidAfterFirst);
  });

  it("finds the next solid ground after a crater", () => {
    const mask = BinaryTerrainMask.fromWorldPredicate(
      { worldWidth: 20, worldHeight: 20, cellSize: 1 },
      (_worldX, worldY) => worldY >= 8,
    );

    expect(mask.findGroundY(10)).toBe(8);

    mask.removeCircle(10, 8, 3);

    expect(mask.findGroundY(10)).toBe(11);
    expect(mask.findGroundY(-1)).toBeNull();
  });
});

