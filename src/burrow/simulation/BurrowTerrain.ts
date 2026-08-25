export interface Point {
  readonly x: number;
  readonly y: number;
}

export interface CellRegion {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

export interface TerrainCarveResult {
  readonly removedCells: number;
  readonly dirtyCells: CellRegion | null;
  readonly version: number;
}

export interface BurrowTerrainOptions {
  readonly worldWidth: number;
  readonly worldHeight: number;
  readonly cellSize: number;
  readonly solidAt: (worldX: number, worldY: number) => boolean;
}

export class BurrowTerrain {
  public readonly worldWidth: number;
  public readonly worldHeight: number;
  public readonly cellSize: number;
  public readonly cellWidth: number;
  public readonly cellHeight: number;

  private readonly cells: Uint8Array;
  private currentVersion = 0;

  public constructor(options: BurrowTerrainOptions) {
    validateDimension(options.worldWidth, "worldWidth");
    validateDimension(options.worldHeight, "worldHeight");
    validateDimension(options.cellSize, "cellSize");

    this.worldWidth = options.worldWidth;
    this.worldHeight = options.worldHeight;
    this.cellSize = options.cellSize;
    this.cellWidth = Math.ceil(options.worldWidth / options.cellSize);
    this.cellHeight = Math.ceil(options.worldHeight / options.cellSize);
    this.cells = new Uint8Array(this.cellWidth * this.cellHeight);

    for (let cellY = 0; cellY < this.cellHeight; cellY += 1) {
      for (let cellX = 0; cellX < this.cellWidth; cellX += 1) {
        const worldX = (cellX + 0.5) * this.cellSize;
        const worldY = (cellY + 0.5) * this.cellSize;
        if (options.solidAt(worldX, worldY)) {
          this.cells[cellY * this.cellWidth + cellX] = 1;
        }
      }
    }
  }

  public get version(): number {
    return this.currentVersion;
  }

  public get byteLength(): number {
    return this.cells.byteLength;
  }

  public isSolidWorld(worldX: number, worldY: number): boolean {
    const cellX = Math.floor(worldX / this.cellSize);
    const cellY = Math.floor(worldY / this.cellSize);
    return this.isSolidCell(cellX, cellY);
  }

  public isSolidCell(cellX: number, cellY: number): boolean {
    if (
      !Number.isInteger(cellX) ||
      !Number.isInteger(cellY) ||
      cellX < 0 ||
      cellY < 0 ||
      cellX >= this.cellWidth ||
      cellY >= this.cellHeight
    ) {
      return false;
    }
    return this.cells[cellY * this.cellWidth + cellX] === 1;
  }

  public carveCircle(center: Point, radius: number): TerrainCarveResult {
    return this.carveCapsule(center, center, radius);
  }

  public carveCapsule(start: Point, end: Point, radius: number): TerrainCarveResult {
    validatePoint(start);
    validatePoint(end);
    if (!Number.isFinite(radius) || radius <= 0) {
      throw new Error("Carving requires a positive finite radius.");
    }

    const distance = Math.hypot(end.x - start.x, end.y - start.y);
    const sampleSpacing = Math.max(this.cellSize, radius * 0.42);
    const stepCount = Math.max(1, Math.ceil(distance / sampleSpacing));
    const dirty = new DirtyBounds(this.cellWidth, this.cellHeight);
    let removedCells = 0;

    for (let step = 0; step <= stepCount; step += 1) {
      const ratio = step / stepCount;
      const centerX = start.x + (end.x - start.x) * ratio;
      const centerY = start.y + (end.y - start.y) * ratio;
      removedCells += this.eraseCircle(centerX, centerY, radius, dirty);
    }

    if (removedCells === 0) {
      return { removedCells: 0, dirtyCells: null, version: this.currentVersion };
    }

    this.currentVersion += 1;
    return {
      removedCells,
      dirtyCells: dirty.toRegion(),
      version: this.currentVersion,
    };
  }

  public solidSampleCount(center: Point, radius: number, samples = 12): number {
    let solidSamples = 0;
    for (let index = 0; index < samples; index += 1) {
      const angle = (index / samples) * Math.PI * 2;
      if (
        this.isSolidWorld(
          center.x + Math.cos(angle) * radius,
          center.y + Math.sin(angle) * radius,
        )
      ) {
        solidSamples += 1;
      }
    }
    return solidSamples;
  }

  private eraseCircle(
    centerX: number,
    centerY: number,
    radius: number,
    dirty: DirtyBounds,
  ): number {
    const minimumCellX = clamp(
      Math.floor((centerX - radius) / this.cellSize),
      0,
      this.cellWidth - 1,
    );
    const maximumCellX = clamp(
      Math.floor((centerX + radius) / this.cellSize),
      0,
      this.cellWidth - 1,
    );
    const minimumCellY = clamp(
      Math.floor((centerY - radius) / this.cellSize),
      0,
      this.cellHeight - 1,
    );
    const maximumCellY = clamp(
      Math.floor((centerY + radius) / this.cellSize),
      0,
      this.cellHeight - 1,
    );
    const radiusSquared = radius * radius;
    let removedCells = 0;

    for (let cellY = minimumCellY; cellY <= maximumCellY; cellY += 1) {
      const sampleY = (cellY + 0.5) * this.cellSize;
      for (let cellX = minimumCellX; cellX <= maximumCellX; cellX += 1) {
        const index = cellY * this.cellWidth + cellX;
        if (this.cells[index] !== 1) {
          continue;
        }
        const sampleX = (cellX + 0.5) * this.cellSize;
        const deltaX = sampleX - centerX;
        const deltaY = sampleY - centerY;
        if (deltaX * deltaX + deltaY * deltaY > radiusSquared) {
          continue;
        }
        this.cells[index] = 0;
        removedCells += 1;
        dirty.include(cellX, cellY);
      }
    }

    return removedCells;
  }
}

class DirtyBounds {
  private minimumX: number;
  private minimumY: number;
  private maximumX = -1;
  private maximumY = -1;

  public constructor(cellWidth: number, cellHeight: number) {
    this.minimumX = cellWidth;
    this.minimumY = cellHeight;
  }

  public include(cellX: number, cellY: number): void {
    this.minimumX = Math.min(this.minimumX, cellX);
    this.minimumY = Math.min(this.minimumY, cellY);
    this.maximumX = Math.max(this.maximumX, cellX);
    this.maximumY = Math.max(this.maximumY, cellY);
  }

  public toRegion(): CellRegion | null {
    if (this.maximumX < this.minimumX || this.maximumY < this.minimumY) {
      return null;
    }
    return {
      x: this.minimumX,
      y: this.minimumY,
      width: this.maximumX - this.minimumX + 1,
      height: this.maximumY - this.minimumY + 1,
    };
  }
}

function validateDimension(value: number, name: string): void {
  if (!Number.isSafeInteger(value) || value <= 0) {
    throw new Error(`${name} must be a positive integer.`);
  }
}

function validatePoint(point: Point): void {
  if (!Number.isFinite(point.x) || !Number.isFinite(point.y)) {
    throw new Error("Terrain points require finite coordinates.");
  }
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.max(minimum, Math.min(maximum, value));
}
