import type { BinaryTerrainMask } from "../../simulation/terrain/TerrainMask";
import { publicAssetPath } from "../publicAssetPath";
import { createTerrainMaskFromImage } from "./terrainMaskFromImage";

export const GOOD_MOOD_BACKGROUND_TEXTURE_KEY = "good-mood-background";
export const GOOD_MOOD_BACKGROUND_PATH =
  publicAssetPath("assets/maps/sunny-sky-background-hd.png");
export const GOOD_MOOD_TERRAIN_SOURCE_TEXTURE_KEY = "good-mood-terrain-source";
export const GOOD_MOOD_TERRAIN_PATH = publicAssetPath(
  "assets/maps/good-mood-terrain-hd.png",
);
export const GOOD_MOOD_TERRAIN_CELL_SIZE = 2;

export function createGoodMoodTerrainMask(
  sourceImage: CanvasImageSource,
  worldWidth: number,
  worldHeight: number,
): BinaryTerrainMask {
  return createTerrainMaskFromImage(
    sourceImage,
    worldWidth,
    worldHeight,
    GOOD_MOOD_TERRAIN_CELL_SIZE,
  );
}
