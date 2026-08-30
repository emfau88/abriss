import type { BurrowTerrain, Point } from "./BurrowTerrain";

export const TRAIL_LIFETIME_TICKS = 600;
export const TRAIL_TILE_SIZE = 256;

export interface TrailCell {
  readonly x: number;
  readonly y: number;
  readonly expiresAt: number;
}

/** A sparse speed field, never supporting soil. Time advances only at 60 Hz. */
export class BurrowTrailField {
  private readonly cells = new Map<number, number>();
  private readonly dirtyTiles = new Set<number>();
  private currentTick = 0;
  public readonly tileColumns: number;

  public constructor(private readonly terrain: BurrowTerrain) {
    this.tileColumns = Math.ceil(terrain.worldWidth / TRAIL_TILE_SIZE);
  }

  public get tick(): number { return this.currentTick; }
  public get activeCellCount(): number { return this.cells.size; }

  public advance(): void {
    this.currentTick += 1;
    for (const [index, expiry] of this.cells) {
      if (expiry <= this.currentTick) {
        this.cells.delete(index);
        this.markDirty(index);
      } else if (expiry - this.currentTick === 120) {
        // One warning phase, not a world redraw on every fade frame.
        this.markDirty(index);
      }
    }
  }

  public remainingTicksAtCell(x: number, y: number): number {
    if (x < 0 || y < 0 || x >= this.terrain.cellWidth || y >= this.terrain.cellHeight) return 0;
    return Math.max(0, (this.cells.get(y * this.terrain.cellWidth + x) ?? 0) - this.currentTick);
  }

  public isActiveWorld(x: number, y: number): boolean {
    return this.remainingTicksAtCell(Math.floor(x / this.terrain.cellSize), Math.floor(y / this.terrain.cellSize)) > 0;
  }

  public markCapsule(start: Point, end: Point, radius: number): void {
    if (![start.x, start.y, end.x, end.y, radius].every(Number.isFinite) || radius <= 0) {
      throw new Error("Trail capsules require finite coordinates and a positive radius.");
    }
    const size = this.terrain.cellSize;
    const minX = Math.max(0, Math.floor((Math.min(start.x, end.x) - radius) / size));
    const maxX = Math.min(this.terrain.cellWidth - 1, Math.floor((Math.max(start.x, end.x) + radius) / size));
    const minY = Math.max(0, Math.floor((Math.min(start.y, end.y) - radius) / size));
    const maxY = Math.min(this.terrain.cellHeight - 1, Math.floor((Math.max(start.y, end.y) + radius) / size));
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const lengthSquared = dx * dx + dy * dy;
    for (let y = minY; y <= maxY; y += 1) {
      for (let x = minX; x <= maxX; x += 1) {
        if (!this.terrain.isSolidCell(x, y)) continue;
        const px = (x + 0.5) * size;
        const py = (y + 0.5) * size;
        const t = lengthSquared === 0 ? 0 : Math.max(0, Math.min(1, ((px - start.x) * dx + (py - start.y) * dy) / lengthSquared));
        if ((px - start.x - t * dx) ** 2 + (py - start.y - t * dy) ** 2 > radius * radius) continue;
        const index = y * this.terrain.cellWidth + x;
        const previous = this.cells.get(index);
        this.cells.set(index, this.currentTick + TRAIL_LIFETIME_TICKS);
        if (previous === undefined || previous - this.currentTick <= 120) this.markDirty(index);
      }
    }
  }

  public takeDirtyTiles(): number[] {
    const result = [...this.dirtyTiles].sort((a, b) => a - b);
    this.dirtyTiles.clear();
    return result;
  }

  public snapshot(): { readonly tick: number; readonly cells: readonly TrailCell[] } {
    return {
      tick: this.currentTick,
      cells: [...this.cells].sort(([a], [b]) => a - b).map(([index, expiresAt]) => ({
        x: index % this.terrain.cellWidth,
        y: Math.floor(index / this.terrain.cellWidth),
        expiresAt,
      })),
    };
  }

  private markDirty(index: number): void {
    const x = (index % this.terrain.cellWidth) * this.terrain.cellSize;
    const y = Math.floor(index / this.terrain.cellWidth) * this.terrain.cellSize;
    this.dirtyTiles.add(Math.floor(y / TRAIL_TILE_SIZE) * this.tileColumns + Math.floor(x / TRAIL_TILE_SIZE));
  }
}
