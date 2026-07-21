import { BinaryTerrainMask } from "../../simulation/terrain/TerrainMask";
import { publicAssetPath } from "../publicAssetPath";

export const GOOD_MOOD_BACKGROUND_TEXTURE_KEY = "good-mood-background";
export const GOOD_MOOD_BACKGROUND_PATH =
  publicAssetPath("assets/maps/sunny-sky-background-hd.png");
export const GOOD_MOOD_TERRAIN_SOURCE_TEXTURE_KEY = "good-mood-terrain-source";
export const GOOD_MOOD_TERRAIN_PATH = publicAssetPath(
  "assets/maps/good-mood-terrain-hd.png",
);
export const GOOD_MOOD_TERRAIN_CELL_SIZE = 2;

const SOLID_ALPHA_THRESHOLD = 72;

export function createGoodMoodTerrainMask(
  sourceImage: CanvasImageSource,
  worldWidth: number,
  worldHeight: number,
): BinaryTerrainMask {
  const cellWidth = Math.ceil(worldWidth / GOOD_MOOD_TERRAIN_CELL_SIZE);
  const cellHeight = Math.ceil(worldHeight / GOOD_MOOD_TERRAIN_CELL_SIZE);
  const canvas = document.createElement("canvas");
  canvas.width = cellWidth;
  canvas.height = cellHeight;
  const context = canvas.getContext("2d", { willReadFrequently: true });

  if (!context) {
    throw new Error("Could not sample the terrain artwork.");
  }

  context.clearRect(0, 0, cellWidth, cellHeight);
  context.drawImage(sourceImage, 0, 0, cellWidth, cellHeight);
  const pixels = context.getImageData(0, 0, cellWidth, cellHeight).data;

  return BinaryTerrainMask.fromWorldPredicate(
    {
      worldWidth,
      worldHeight,
      cellSize: GOOD_MOOD_TERRAIN_CELL_SIZE,
    },
    (worldX, worldY) => {
      const cellX = Math.floor(worldX / GOOD_MOOD_TERRAIN_CELL_SIZE);
      const cellY = Math.floor(worldY / GOOD_MOOD_TERRAIN_CELL_SIZE);
      return pixels[(cellY * cellWidth + cellX) * 4 + 3]! >= SOLID_ALPHA_THRESHOLD;
    },
  );
}
