import { describe, expect, it } from "vitest";

import { MAP_DEFINITIONS, MAP_IDS } from "./mapCatalog";

describe("map catalog loading tiers", () => {
  it("provides lightweight preview assets separate from every HD match source", () => {
    for (const mapId of MAP_IDS) {
      const map = MAP_DEFINITIONS[mapId];

      expect(map.previewBackgroundTextureKey).not.toBe(
        map.backgroundTextureKey,
      );
      expect(map.previewTerrainTextureKey).not.toBe(map.terrainTextureKey);
      expect(map.previewBackgroundPath).toMatch(/-preview\.webp$/);
      expect(map.previewTerrainPath).toMatch(/-preview\.webp$/);
      expect(map.backgroundPath).toMatch(/-hd\.png$/);
      expect(map.terrainPath).toMatch(/-hd\.png$/);
    }
  });
});
