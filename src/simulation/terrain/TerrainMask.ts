export interface CellPoint {
  readonly x: number;
  readonly y: number;
}

export interface CellRegion {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

export interface WorldRegion {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

export interface TerrainMutation {
  readonly removedCells: number;
  readonly dirtyCells: CellRegion | null;
  readonly dirtyWorld: WorldRegion | null;
  readonly version: number;
}

export interface TerrainMask {
  readonly worldWidth: number;
  readonly worldHeight: number;
  readonly cellSize: number;
  readonly cellWidth: number;
  readonly cellHeight: number;
  readonly byteLength: number;
  readonly version: number;

  worldToCell(worldX: number, worldY: number): CellPoint | null;
  isSolid(worldX: number, worldY: number): boolean;
  isSolidCell(cellX: number, cellY: number): boolean;
  removeCircle(centerX: number, centerY: number, radius: number): TerrainMutation;
  findGroundY(worldX: number, startY?: number, maxY?: number): number | null;
  countSolidCells(region?: CellRegion): number;
  copyCellData(): Uint8Array;
}

export interface TerrainMaskOptions {
  readonly worldWidth: number;
  readonly worldHeight: number;
  readonly cellSize: number;
}

type WorldPredicate = (worldX: number, worldY: number) => boolean;

export class BinaryTerrainMask implements TerrainMask {
  public readonly worldWidth: number;
  public readonly worldHeight: number;
  public readonly cellSize: number;
  public readonly cellWidth: number;
  public readonly cellHeight: number;

  private readonly cells: Uint8Array;
  private currentVersion = 0;

  private constructor(options: TerrainMaskOptions, cells: Uint8Array) {
    this.worldWidth = options.worldWidth;
    this.worldHeight = options.worldHeight;
    this.cellSize = options.cellSize;
    this.cellWidth = Math.ceil(options.worldWidth / options.cellSize);
    this.cellHeight = Math.ceil(options.worldHeight / options.cellSize);
    this.cells = cells;
  }

  public static fromWorldPredicate(
    options: TerrainMaskOptions,
    predicate: WorldPredicate,
  ): BinaryTerrainMask {
    validateOptions(options);

    const cellWidth = Math.ceil(options.worldWidth / options.cellSize);
    const cellHeight = Math.ceil(options.worldHeight / options.cellSize);
    const cells = new Uint8Array(cellWidth * cellHeight);

    for (let cellY = 0; cellY < cellHeight; cellY += 1) {
      for (let cellX = 0; cellX < cellWidth; cellX += 1) {
        const worldX = (cellX + 0.5) * options.cellSize;
        const worldY = (cellY + 0.5) * options.cellSize;

        if (predicate(worldX, worldY)) {
          cells[cellY * cellWidth + cellX] = 1;
        }
      }
    }

    return new BinaryTerrainMask(options, cells);
  }

  public static filled(options: TerrainMaskOptions): BinaryTerrainMask {
    validateOptions(options);

    const cellWidth = Math.ceil(options.worldWidth / options.cellSize);
    const cellHeight = Math.ceil(options.worldHeight / options.cellSize);
    const cells = new Uint8Array(cellWidth * cellHeight);
    cells.fill(1);
    return new BinaryTerrainMask(options, cells);
  }

  public get byteLength(): number {
    return this.cells.byteLength;
  }

  public get version(): number {
    return this.currentVersion;
  }

  public worldToCell(worldX: number, worldY: number): CellPoint | null {
    if (
      !Number.isFinite(worldX) ||
      !Number.isFinite(worldY) ||
      worldX < 0 ||
      worldY < 0 ||
      worldX >= this.worldWidth ||
      worldY >= this.worldHeight
    ) {
      return null;
    }

    return {
      x: Math.floor(worldX / this.cellSize),
      y: Math.floor(worldY / this.cellSize),
    };
  }

  public isSolid(worldX: number, worldY: number): boolean {
    const cell = this.worldToCell(worldX, worldY);
    return cell ? this.isSolidCell(cell.x, cell.y) : false;
  }

  public isSolidCell(cellX: number, cellY: number): boolean {
    if (!this.containsCell(cellX, cellY)) {
      return false;
    }

    return this.cells[cellY * this.cellWidth + cellX] === 1;
  }

  public removeCircle(
    centerX: number,
    centerY: number,
    radius: number,
  ): TerrainMutation {
    if (
      !Number.isFinite(centerX) ||
      !Number.isFinite(centerY) ||
      !Number.isFinite(radius) ||
      radius <= 0
    ) {
      throw new Error("Terrain circles require finite coordinates and a positive radius.");
    }

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

    if (
      centerX + radius < 0 ||
      centerY + radius < 0 ||
      centerX - radius >= this.worldWidth ||
      centerY - radius >= this.worldHeight
    ) {
      return this.emptyMutation();
    }

    const radiusSquared = radius * radius;
    let dirtyMinimumX = this.cellWidth;
    let dirtyMinimumY = this.cellHeight;
    let dirtyMaximumX = -1;
    let dirtyMaximumY = -1;
    let removedCells = 0;

    for (let cellY = minimumCellY; cellY <= maximumCellY; cellY += 1) {
      const sampleY = (cellY + 0.5) * this.cellSize;
      const deltaY = sampleY - centerY;

      for (let cellX = minimumCellX; cellX <= maximumCellX; cellX += 1) {
        const index = cellY * this.cellWidth + cellX;

        if (this.cells[index] !== 1) {
          continue;
        }

        const sampleX = (cellX + 0.5) * this.cellSize;
        const deltaX = sampleX - centerX;

        if (deltaX * deltaX + deltaY * deltaY > radiusSquared) {
          continue;
        }

        this.cells[index] = 0;
        removedCells += 1;
        dirtyMinimumX = Math.min(dirtyMinimumX, cellX);
        dirtyMinimumY = Math.min(dirtyMinimumY, cellY);
        dirtyMaximumX = Math.max(dirtyMaximumX, cellX);
        dirtyMaximumY = Math.max(dirtyMaximumY, cellY);
      }
    }

    if (removedCells === 0) {
      return this.emptyMutation();
    }

    this.currentVersion += 1;

    const dirtyCells: CellRegion = {
      x: dirtyMinimumX,
      y: dirtyMinimumY,
      width: dirtyMaximumX - dirtyMinimumX + 1,
      height: dirtyMaximumY - dirtyMinimumY + 1,
    };

    return {
      removedCells,
      dirtyCells,
      dirtyWorld: this.cellRegionToWorld(dirtyCells),
      version: this.currentVersion,
    };
  }

  public findGroundY(
    worldX: number,
    startY = 0,
    maxY = this.worldHeight,
  ): number | null {
    if (!Number.isFinite(startY) || !Number.isFinite(maxY) || maxY < startY) {
      throw new Error("Ground queries require a valid vertical range.");
    }

    const startCell = this.worldToCell(worldX, clamp(startY, 0, this.worldHeight - 1));

    if (!startCell || worldX < 0 || worldX >= this.worldWidth) {
      return null;
    }

    const lastCellY = Math.min(
      this.cellHeight - 1,
      Math.floor(Math.min(maxY, this.worldHeight - 1) / this.cellSize),
    );

    for (let cellY = startCell.y; cellY <= lastCellY; cellY += 1) {
      if (this.isSolidCell(startCell.x, cellY)) {
        return cellY * this.cellSize;
      }
    }

    return null;
  }

  public countSolidCells(region?: CellRegion): number {
    const boundedRegion = region
      ? this.clampCellRegion(region)
      : { x: 0, y: 0, width: this.cellWidth, height: this.cellHeight };
    let count = 0;

    for (
      let cellY = boundedRegion.y;
      cellY < boundedRegion.y + boundedRegion.height;
      cellY += 1
    ) {
      for (
        let cellX = boundedRegion.x;
        cellX < boundedRegion.x + boundedRegion.width;
        cellX += 1
      ) {
        if (this.isSolidCell(cellX, cellY)) {
          count += 1;
        }
      }
    }

    return count;
  }

  public copyCellData(): Uint8Array {
    return this.cells.slice();
  }

  private containsCell(cellX: number, cellY: number): boolean {
    return (
      Number.isInteger(cellX) &&
      Number.isInteger(cellY) &&
      cellX >= 0 &&
      cellY >= 0 &&
      cellX < this.cellWidth &&
      cellY < this.cellHeight
    );
  }

  private clampCellRegion(region: CellRegion): CellRegion {
    if (
      !Number.isInteger(region.x) ||
      !Number.isInteger(region.y) ||
      !Number.isInteger(region.width) ||
      !Number.isInteger(region.height) ||
      region.width < 0 ||
      region.height < 0
    ) {
      throw new Error("Cell regions require integer coordinates and non-negative sizes.");
    }

    const startX = clamp(region.x, 0, this.cellWidth);
    const startY = clamp(region.y, 0, this.cellHeight);
    const endX = clamp(region.x + region.width, 0, this.cellWidth);
    const endY = clamp(region.y + region.height, 0, this.cellHeight);

    return {
      x: startX,
      y: startY,
      width: Math.max(0, endX - startX),
      height: Math.max(0, endY - startY),
    };
  }

  private cellRegionToWorld(region: CellRegion): WorldRegion {
    const x = region.x * this.cellSize;
    const y = region.y * this.cellSize;
    const right = Math.min(this.worldWidth, (region.x + region.width) * this.cellSize);
    const bottom = Math.min(
      this.worldHeight,
      (region.y + region.height) * this.cellSize,
    );

    return {
      x,
      y,
      width: right - x,
      height: bottom - y,
    };
  }

  private emptyMutation(): TerrainMutation {
    return {
      removedCells: 0,
      dirtyCells: null,
      dirtyWorld: null,
      version: this.currentVersion,
    };
  }
}

function validateOptions(options: TerrainMaskOptions): void {
  if (
    !Number.isSafeInteger(options.worldWidth) ||
    !Number.isSafeInteger(options.worldHeight) ||
    !Number.isSafeInteger(options.cellSize) ||
    options.worldWidth <= 0 ||
    options.worldHeight <= 0 ||
    options.cellSize <= 0
  ) {
    throw new Error("Terrain mask dimensions and cell size must be positive integers.");
  }
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, value));
}

