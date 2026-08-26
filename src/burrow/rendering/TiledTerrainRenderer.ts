import Phaser from "phaser";

import type { CellRegion, TerrainCarveResult } from "../simulation/BurrowTerrain";
import { BurrowTerrain } from "../simulation/BurrowTerrain";

const TILE_WORLD_SIZE = 256;

interface TerrainTile {
  readonly cellX: number;
  readonly cellY: number;
  readonly cellWidth: number;
  readonly cellHeight: number;
  readonly textureKey: string;
  readonly texture: Phaser.Textures.CanvasTexture;
  readonly image: Phaser.GameObjects.Image;
}

export class TiledTerrainRenderer {
  private readonly tiles: TerrainTile[] = [];
  private readonly earthTexture: CanvasImageSource;
  public lastUpdatedTileCount = 0;

  public constructor(
    scene: Phaser.Scene,
    private readonly terrain: BurrowTerrain,
    texturePrefix: string,
    earthTextureKey: string,
  ) {
    this.earthTexture = scene.textures.get(earthTextureKey).getSourceImage() as CanvasImageSource;
    const tileCellSize = TILE_WORLD_SIZE / terrain.cellSize;
    const columns = Math.ceil(terrain.worldWidth / TILE_WORLD_SIZE);
    const rows = Math.ceil(terrain.worldHeight / TILE_WORLD_SIZE);

    for (let row = 0; row < rows; row += 1) {
      for (let column = 0; column < columns; column += 1) {
        const worldX = column * TILE_WORLD_SIZE;
        const worldY = row * TILE_WORLD_SIZE;
        const pixelWidth = Math.min(TILE_WORLD_SIZE, terrain.worldWidth - worldX);
        const pixelHeight = Math.min(TILE_WORLD_SIZE, terrain.worldHeight - worldY);
        const textureKey = `${texturePrefix}-${column}-${row}`;
        const texture = scene.textures.createCanvas(textureKey, pixelWidth, pixelHeight);
        if (!texture) {
          throw new Error(`Could not create Burrow terrain tile ${textureKey}.`);
        }
        const tile: TerrainTile = {
          cellX: column * tileCellSize,
          cellY: row * tileCellSize,
          cellWidth: Math.ceil(pixelWidth / terrain.cellSize),
          cellHeight: Math.ceil(pixelHeight / terrain.cellSize),
          textureKey,
          texture,
          image: scene.add
            .image(worldX, worldY, textureKey)
            .setOrigin(0, 0)
            .setDepth(2),
        };
        this.tiles.push(tile);
        this.renderTile(tile);
      }
    }
  }

  public applyMutation(mutation: TerrainCarveResult | null): void {
    if (!mutation?.dirtyCells) {
      return;
    }
    const expanded = expandRegion(mutation.dirtyCells, 1, this.terrain);
    let updated = 0;
    for (const tile of this.tiles) {
      if (!regionsOverlap(expanded, tile)) {
        continue;
      }
      this.renderTile(tile);
      updated += 1;
    }
    this.lastUpdatedTileCount = updated;
  }

  public destroy(): void {
    for (const tile of this.tiles) {
      tile.image.destroy();
      tile.texture.destroy();
    }
    this.tiles.length = 0;
  }

  private renderTile(tile: TerrainTile): void {
    const context = tile.texture.getContext();
    context.clearRect(0, 0, tile.texture.width, tile.texture.height);
    context.imageSmoothingEnabled = true;

    const earthPattern = context.createPattern(this.earthTexture, "repeat");
    if (!earthPattern) {
      throw new Error("Could not create the Burrow earth texture pattern.");
    }
    context.save();
    context.translate(
      -tile.cellX * this.terrain.cellSize,
      -tile.cellY * this.terrain.cellSize,
    );
    context.fillStyle = earthPattern;
    context.fillRect(
      tile.cellX * this.terrain.cellSize,
      tile.cellY * this.terrain.cellSize,
      tile.texture.width,
      tile.texture.height,
    );
    context.restore();

    for (let localCellY = 0; localCellY < tile.cellHeight; localCellY += 1) {
      const cellY = tile.cellY + localCellY;
      for (let localCellX = 0; localCellX < tile.cellWidth; localCellX += 1) {
        const cellX = tile.cellX + localCellX;
        if (!this.terrain.isSolidCell(cellX, cellY)) {
          context.clearRect(
            localCellX * this.terrain.cellSize,
            localCellY * this.terrain.cellSize,
            this.terrain.cellSize,
            this.terrain.cellSize,
          );
          continue;
        }
        const edgeColor = edgeColorForCell(this.terrain, cellX, cellY);
        if (edgeColor) {
          context.fillStyle = edgeColor;
          context.fillRect(
            localCellX * this.terrain.cellSize,
            localCellY * this.terrain.cellSize,
            this.terrain.cellSize,
            this.terrain.cellSize,
          );
        }
      }
    }
    tile.texture.refresh();
  }
}

function edgeColorForCell(terrain: BurrowTerrain, cellX: number, cellY: number): string | null {
  const touchesAir =
    !terrain.isSolidCell(cellX - 1, cellY) ||
    !terrain.isSolidCell(cellX + 1, cellY) ||
    !terrain.isSolidCell(cellX, cellY - 1) ||
    !terrain.isSolidCell(cellX, cellY + 1);
  const worldY = cellY * terrain.cellSize;
  if (!touchesAir) return null;
  if (worldY < 410) return "#9dcb53";
  return worldY > 900 ? "#33243d" : "#4b3044";
}

function expandRegion(
  region: CellRegion,
  padding: number,
  terrain: BurrowTerrain,
): CellRegion {
  const x = Math.max(0, region.x - padding);
  const y = Math.max(0, region.y - padding);
  const right = Math.min(terrain.cellWidth, region.x + region.width + padding);
  const bottom = Math.min(terrain.cellHeight, region.y + region.height + padding);
  return { x, y, width: right - x, height: bottom - y };
}

function regionsOverlap(region: CellRegion, tile: TerrainTile): boolean {
  return (
    region.x < tile.cellX + tile.cellWidth &&
    region.x + region.width > tile.cellX &&
    region.y < tile.cellY + tile.cellHeight &&
    region.y + region.height > tile.cellY
  );
}

export const BURROW_TERRAIN_TILE_WORLD_SIZE = TILE_WORLD_SIZE;
