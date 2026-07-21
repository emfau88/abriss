import type { TerrainMask } from "../terrain/TerrainMask";

export type TerrainFallResolution =
  | { readonly state: "supported"; readonly landingY: number; readonly distance: 0 }
  | { readonly state: "fall"; readonly landingY: number; readonly distance: number }
  | { readonly state: "out-of-world"; readonly landingY: null; readonly distance: number };

export function resolveTerrainFall(
  terrain: TerrainMask,
  worldX: number,
  currentFeetY: number,
): TerrainFallResolution {
  if (!Number.isFinite(worldX) || !Number.isFinite(currentFeetY)) {
    throw new Error("Terrain fall queries require finite coordinates.");
  }

  const supportStart = Math.max(0, currentFeetY - terrain.cellSize);
  const nearbyGround = terrain.findGroundY(
    worldX,
    supportStart,
    Math.min(terrain.worldHeight, currentFeetY + terrain.cellSize),
  );

  if (
    nearbyGround !== null &&
    Math.abs(nearbyGround - currentFeetY) <= terrain.cellSize
  ) {
    return { state: "supported", landingY: nearbyGround, distance: 0 };
  }

  const landingY = terrain.findGroundY(
    worldX,
    currentFeetY + terrain.cellSize,
    terrain.worldHeight,
  );

  if (landingY === null) {
    return {
      state: "out-of-world",
      landingY: null,
      distance: Math.max(0, terrain.worldHeight - currentFeetY),
    };
  }

  return {
    state: "fall",
    landingY,
    distance: Math.max(0, landingY - currentFeetY),
  };
}
