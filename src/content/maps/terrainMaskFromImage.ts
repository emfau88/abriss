import { BinaryTerrainMask } from "../../simulation/terrain/TerrainMask";

const SOLID_ALPHA_THRESHOLD = 72;

export function createTerrainMaskFromImage(
  sourceImage: CanvasImageSource,
  worldWidth: number,
  worldHeight: number,
  cellSize: number,
): BinaryTerrainMask {
  const cellWidth = Math.ceil(worldWidth / cellSize);
  const cellHeight = Math.ceil(worldHeight / cellSize);
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
    { worldWidth, worldHeight, cellSize },
    (worldX, worldY) => {
      const cellX = Math.floor(worldX / cellSize);
      const cellY = Math.floor(worldY / cellSize);
      return pixels[(cellY * cellWidth + cellX) * 4 + 3]! >= SOLID_ALPHA_THRESHOLD;
    },
  );
}
