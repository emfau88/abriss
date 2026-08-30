import type { BurrowTerrain, Point } from "./BurrowTerrain";

export type SurfaceStatus = "grounded" | "blocked" | "falling" | "stranded";
export interface SurfacePlacement {
  readonly position: Point;
  readonly status: SurfaceStatus;
}

/** Bounded surface movement, not navigation or rigid-body physics. */
export class BurrowSurfaceSupport {
  public constructor(private readonly terrain: BurrowTerrain) {}

  public groundYAt(x: number): number | null {
    const cellX = Math.floor(x / this.terrain.cellSize);
    for (let y = 0; y < this.terrain.cellHeight; y += 1) {
      if (this.terrain.isSolidCell(cellX, y)) return y * this.terrain.cellSize;
    }
    return null;
  }

  public advance(position: Point, proposedX: number, footOffset: number, previous: SurfaceStatus, dt: number): SurfacePlacement {
    const groundHere = this.groundYAt(position.x);
    const feet = position.y + footOffset;
    // A crater under the actor must never leave it floating at an old height.
    if (groundHere === null || groundHere > feet + 12 || previous === "falling") {
      const targetFeet = groundHere ?? this.terrain.worldHeight + footOffset + 100;
      const nextFeet = Math.min(targetFeet, feet + 180 * dt);
      return {
        position: { x: position.x, y: nextFeet - footOffset },
        status: nextFeet >= targetFeet ? "stranded" : "falling",
      };
    }
    if (previous === "stranded") return { position, status: "stranded" };
    const nextGround = this.groundYAt(proposedX);
    if (nextGround === null || Math.abs(nextGround - groundHere) > 12) {
      return { position: { x: position.x, y: groundHere - footOffset }, status: "blocked" };
    }
    return { position: { x: proposedX, y: nextGround - footOffset }, status: "grounded" };
  }
}
