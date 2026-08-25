import type { Point } from "./BurrowTerrain";

export class BodyTrail {
  private readonly points: Point[];

  public constructor(
    head: Point,
    angle: number,
    private readonly recordingSpacing = 4,
    initialLength = 460,
  ) {
    if (recordingSpacing <= 0 || initialLength <= 0) {
      throw new Error("Body trail spacing and length must be positive.");
    }
    const steps = Math.ceil(initialLength / recordingSpacing);
    this.points = [];
    for (let index = steps; index >= 0; index -= 1) {
      this.points.push({
        x: head.x - Math.cos(angle) * index * recordingSpacing,
        y: head.y - Math.sin(angle) * index * recordingSpacing,
      });
    }
  }

  public record(head: Point): void {
    const last = this.points.at(-1);
    if (!last) {
      this.points.push({ ...head });
      return;
    }
    const distance = Math.hypot(head.x - last.x, head.y - last.y);
    if (distance < this.recordingSpacing) {
      return;
    }
    const steps = Math.floor(distance / this.recordingSpacing);
    for (let step = 1; step <= steps; step += 1) {
      const ratio = (step * this.recordingSpacing) / distance;
      this.points.push({
        x: last.x + (head.x - last.x) * ratio,
        y: last.y + (head.y - last.y) * ratio,
      });
    }
    if (Math.hypot(head.x - this.points.at(-1)!.x, head.y - this.points.at(-1)!.y) > 0.1) {
      this.points.push({ ...head });
    }
    const maximumPoints = Math.ceil(720 / this.recordingSpacing);
    if (this.points.length > maximumPoints) {
      this.points.splice(0, this.points.length - maximumPoints);
    }
  }

  public sample(segmentCount: number, segmentSpacing: number): readonly Point[] {
    if (!Number.isSafeInteger(segmentCount) || segmentCount <= 0 || segmentSpacing <= 0) {
      throw new Error("Body samples require positive count and spacing.");
    }
    const samples: Point[] = [];
    for (let index = 0; index < segmentCount; index += 1) {
      samples.push(this.sampleBehind(index * segmentSpacing));
    }
    return samples;
  }

  private sampleBehind(targetDistance: number): Point {
    let remaining = targetDistance;
    for (let index = this.points.length - 1; index > 0; index -= 1) {
      const newer = this.points[index]!;
      const older = this.points[index - 1]!;
      const edgeLength = Math.hypot(newer.x - older.x, newer.y - older.y);
      if (remaining <= edgeLength) {
        const ratio = edgeLength === 0 ? 0 : remaining / edgeLength;
        return {
          x: newer.x + (older.x - newer.x) * ratio,
          y: newer.y + (older.y - newer.y) * ratio,
        };
      }
      remaining -= edgeLength;
    }
    return { ...this.points[0]! };
  }
}
