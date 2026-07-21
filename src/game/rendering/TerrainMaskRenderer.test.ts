import { describe, expect, it } from "vitest";

import { cellRegionToPixelRegion } from "./TerrainMaskRenderer";

describe("cellRegionToPixelRegion", () => {
  it("expands mask cells to full-resolution render pixels", () => {
    expect(
      cellRegionToPixelRegion(
        { x: 10, y: 20, width: 30, height: 40 },
        2,
        3200,
        1800,
      ),
    ).toEqual({ x: 20, y: 40, width: 60, height: 80 });
  });

  it("clips the last partial cell to the world edge", () => {
    expect(
      cellRegionToPixelRegion(
        { x: 1599, y: 899, width: 2, height: 2 },
        2,
        3200,
        1800,
      ),
    ).toEqual({ x: 3198, y: 1798, width: 2, height: 2 });
  });
});
