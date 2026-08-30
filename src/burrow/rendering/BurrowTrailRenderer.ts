import Phaser from "phaser";
import type { BurrowTerrain, TerrainCarveResult } from "../simulation/BurrowTerrain";
import { BurrowTrailField, TRAIL_TILE_SIZE } from "../simulation/BurrowTrailField";

interface TrailTile {
  readonly texture: Phaser.Textures.CanvasTexture;
  readonly image: Phaser.GameObjects.Image;
}

/** Separate, locally updated soil-overlay. No mask writes and no gameplay timers. */
export class BurrowTrailRenderer {
  private readonly tiles = new Map<number, TrailTile>();

  public constructor(
    private readonly scene: Phaser.Scene,
    private readonly terrain: BurrowTerrain,
    private readonly field: BurrowTrailField,
  ) {}

  public apply(dirty: ReadonlySet<number>, mutation: TerrainCarveResult | null): void {
    const ids = new Set(dirty);
    const region = mutation?.dirtyCells;
    if (region) {
      const size = this.terrain.cellSize;
      for (let y = Math.floor(region.y * size / TRAIL_TILE_SIZE); y <= Math.floor((region.y + region.height - 1) * size / TRAIL_TILE_SIZE); y += 1) {
        for (let x = Math.floor(region.x * size / TRAIL_TILE_SIZE); x <= Math.floor((region.x + region.width - 1) * size / TRAIL_TILE_SIZE); x += 1) {
          const id = y * this.field.tileColumns + x;
          if (this.tiles.has(id)) ids.add(id);
        }
      }
    }
    for (const id of ids) this.draw(id);
  }

  public destroy(): void {
    for (const tile of this.tiles.values()) {
      tile.image.destroy();
      tile.texture.destroy();
    }
    this.tiles.clear();
  }

  private draw(id: number): void {
    const worldX = (id % this.field.tileColumns) * TRAIL_TILE_SIZE;
    const worldY = Math.floor(id / this.field.tileColumns) * TRAIL_TILE_SIZE;
    let tile = this.tiles.get(id);
    if (!tile) {
      const key = `burrow-trail-${id}`;
      const texture = this.scene.textures.createCanvas(key, TRAIL_TILE_SIZE, TRAIL_TILE_SIZE);
      if (!texture) throw new Error(`Could not create trail tile ${id}.`);
      tile = { texture, image: this.scene.add.image(worldX, worldY, key).setOrigin(0).setDepth(3) };
      this.tiles.set(id, tile);
    }
    const ctx = tile.texture.getContext();
    ctx.clearRect(0, 0, TRAIL_TILE_SIZE, TRAIL_TILE_SIZE);
    const size = this.terrain.cellSize;
    let active = false;
    for (let y = 0; y < TRAIL_TILE_SIZE; y += size) {
      for (let x = 0; x < TRAIL_TILE_SIZE; x += size) {
        const cx = (worldX + x) / size;
        const cy = (worldY + y) / size;
        const remaining = this.field.remainingTicksAtCell(cx, cy);
        if (remaining === 0 || !this.terrain.isSolidCell(cx, cy)) continue;
        active = true;
        const warning = remaining <= 120;
        ctx.fillStyle = warning ? "rgba(166,119,77,0.24)" : "rgba(226,169,94,0.48)";
        ctx.fillRect(x, y, size, size);
        // A broken hatching distinguishes loose soil from black, permanent holes.
        if ((cx + cy * 3) % 11 === 0) {
          ctx.fillStyle = warning ? "rgba(75,44,35,0.25)" : "rgba(75,44,35,0.65)";
          ctx.fillRect(x, y, size, size / 2);
        }
      }
    }
    if (!active) {
      tile.image.destroy();
      tile.texture.destroy();
      this.tiles.delete(id);
    } else tile.texture.refresh();
  }
}
