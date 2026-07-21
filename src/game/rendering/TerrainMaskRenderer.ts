import Phaser from "phaser";

import type {
  CellRegion,
  TerrainMask,
  TerrainMutation,
} from "../../simulation/terrain/TerrainMask";

const NORMAL_EDGE = [139, 211, 110, 255] as const;
const NORMAL_GROUND = [47, 98, 79, 255] as const;
const NORMAL_DEEP = [31, 68, 57, 255] as const;
const DEBUG_SOLID = [255, 87, 171, 220] as const;
const CRATER_EDGE = [28, 48, 58] as const;

type PixelColor = readonly [number, number, number, number];

export function cellRegionToPixelRegion(
  region: CellRegion,
  cellSize: number,
  worldWidth: number,
  worldHeight: number,
): CellRegion {
  const x = region.x * cellSize;
  const y = region.y * cellSize;
  const right = Math.min(worldWidth, (region.x + region.width) * cellSize);
  const bottom = Math.min(worldHeight, (region.y + region.height) * cellSize);

  return {
    x,
    y,
    width: Math.max(0, right - x),
    height: Math.max(0, bottom - y),
  };
}

export class TerrainMaskRenderer {
  public readonly image: Phaser.GameObjects.Image;

  private readonly texture: Phaser.Textures.CanvasTexture;
  private readonly sourcePixels: Uint8ClampedArray | null;
  private debugEnabled = false;

  public constructor(
    scene: Phaser.Scene,
    private readonly mask: TerrainMask,
    textureKey: string,
    sourceTextureKey?: string,
  ) {
    const texture = scene.textures.createCanvas(
      textureKey,
      mask.worldWidth,
      mask.worldHeight,
    );

    if (!texture) {
      throw new Error(`Could not create terrain texture: ${textureKey}`);
    }

    this.texture = texture;
    this.sourcePixels = sourceTextureKey
      ? this.readSourcePixels(scene, sourceTextureKey)
      : null;
    this.image = scene.add
      .image(0, 0, textureKey)
      .setOrigin(0, 0)
      .setDisplaySize(mask.worldWidth, mask.worldHeight);

    this.renderAll();
  }

  public applyMutation(mutation: TerrainMutation): void {
    if (!mutation.dirtyCells) {
      return;
    }

    this.renderRegion(this.expandRegion(mutation.dirtyCells, 1));
  }

  public setDebugEnabled(enabled: boolean): void {
    if (this.debugEnabled === enabled) {
      return;
    }

    this.debugEnabled = enabled;
    this.renderAll();
  }

  public destroy(): void {
    this.image.destroy();
    this.texture.destroy();
  }

  private renderAll(): void {
    this.renderRegion({
      x: 0,
      y: 0,
      width: this.mask.cellWidth,
      height: this.mask.cellHeight,
    });
  }

  private renderRegion(region: CellRegion): void {
    const pixelRegion = cellRegionToPixelRegion(
      region,
      this.mask.cellSize,
      this.mask.worldWidth,
      this.mask.worldHeight,
    );

    if (pixelRegion.width === 0 || pixelRegion.height === 0) {
      return;
    }

    const context = this.texture.getContext();
    const imageData = context.createImageData(
      pixelRegion.width,
      pixelRegion.height,
    );

    for (let localY = 0; localY < pixelRegion.height; localY += 1) {
      const worldY = pixelRegion.y + localY;
      const cellY = Math.floor(worldY / this.mask.cellSize);

      for (let localX = 0; localX < pixelRegion.width; localX += 1) {
        const worldX = pixelRegion.x + localX;
        const cellX = Math.floor(worldX / this.mask.cellSize);
        const pixelIndex = (localY * pixelRegion.width + localX) * 4;

        if (!this.mask.isSolidCell(cellX, cellY)) {
          continue;
        }

        const color = this.colorForPixel(worldX, worldY, cellX, cellY);
        imageData.data[pixelIndex] = color[0];
        imageData.data[pixelIndex + 1] = color[1];
        imageData.data[pixelIndex + 2] = color[2];
        imageData.data[pixelIndex + 3] = color[3];
      }
    }

    context.putImageData(imageData, pixelRegion.x, pixelRegion.y);
    this.texture.refresh();
  }

  private colorForPixel(
    worldX: number,
    worldY: number,
    cellX: number,
    cellY: number,
  ): PixelColor {
    if (this.debugEnabled) {
      return DEBUG_SOLID;
    }

    if (this.sourcePixels) {
      const source = this.sourceColorForPixel(worldX, worldY);

      if (this.touchesAir(cellX, cellY)) {
        return [
          blend(source[0], CRATER_EDGE[0], 0.55),
          blend(source[1], CRATER_EDGE[1], 0.55),
          blend(source[2], CRATER_EDGE[2], 0.55),
          source[3],
        ];
      }

      return source;
    }

    if (!this.mask.isSolidCell(cellX, cellY - 1)) {
      return NORMAL_EDGE;
    }

    return worldY > this.mask.worldHeight * 0.85 ? NORMAL_DEEP : NORMAL_GROUND;
  }

  private readSourcePixels(
    scene: Phaser.Scene,
    sourceTextureKey: string,
  ): Uint8ClampedArray {
    const sourceImage = scene.textures
      .get(sourceTextureKey)
      .getSourceImage() as CanvasImageSource;
    const canvas = document.createElement("canvas");
    canvas.width = this.mask.worldWidth;
    canvas.height = this.mask.worldHeight;
    const context = canvas.getContext("2d", { willReadFrequently: true });

    if (!context) {
      throw new Error("Could not sample the terrain source texture.");
    }

    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(sourceImage, 0, 0, canvas.width, canvas.height);
    return context.getImageData(0, 0, canvas.width, canvas.height).data;
  }

  private sourceColorForPixel(worldX: number, worldY: number): PixelColor {
    if (!this.sourcePixels) {
      throw new Error("Source terrain colors are unavailable.");
    }

    const index = (worldY * this.mask.worldWidth + worldX) * 4;
    return [
      this.sourcePixels[index] ?? 0,
      this.sourcePixels[index + 1] ?? 0,
      this.sourcePixels[index + 2] ?? 0,
      this.sourcePixels[index + 3] ?? 0,
    ];
  }

  private touchesAir(cellX: number, cellY: number): boolean {
    return (
      !this.mask.isSolidCell(cellX - 1, cellY) ||
      !this.mask.isSolidCell(cellX + 1, cellY) ||
      !this.mask.isSolidCell(cellX, cellY - 1) ||
      !this.mask.isSolidCell(cellX, cellY + 1)
    );
  }

  private expandRegion(region: CellRegion, padding: number): CellRegion {
    const x = Math.max(0, region.x - padding);
    const y = Math.max(0, region.y - padding);
    const right = Math.min(
      this.mask.cellWidth,
      region.x + region.width + padding,
    );
    const bottom = Math.min(
      this.mask.cellHeight,
      region.y + region.height + padding,
    );

    return {
      x,
      y,
      width: right - x,
      height: bottom - y,
    };
  }
}

function blend(source: number, target: number, targetWeight: number): number {
  return Math.round(source * (1 - targetWeight) + target * targetWeight);
}
