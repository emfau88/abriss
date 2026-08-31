import type { Point } from "./BurrowTerrain";

export interface Food {
  readonly id: string;
  readonly position: Point;
  readonly active: boolean;
}
export interface PreyDefinition {
  readonly id: string;
  readonly large: boolean;
  readonly center: Point;
  readonly radius: Point;
  readonly period: number;
  readonly offset: number;
}
export interface FeedingContent {
  readonly food: readonly Food[];
  readonly prey: readonly PreyDefinition[];
}
export interface FeedingSnapshot {
  readonly ticks: number;
  readonly food: readonly Food[];
  readonly eaten: readonly string[];
}
export interface FeedingHead {
  readonly previous: Point;
  readonly position: Point;
  readonly angle: number;
  readonly power: 0 | 1 | 2;
  readonly burst: boolean;
  readonly vacuum: boolean;
}
export interface FeedingResult {
  readonly biomass: number;
  readonly preyEaten: number;
  readonly largePreyEaten: number;
  readonly blockedPrey: boolean;
}

/** Fixed-step, renderer-free food and head-only prey contacts. No respawn or body damage. */
export class BurrowFeeding {
  private ticks = 0;
  private food: Food[];
  private eaten: Set<string>;
  public constructor(public readonly content: FeedingContent, snapshot?: FeedingSnapshot) {
    const ids = [...content.food, ...content.prey].map((entry) => entry.id);
    if (new Set(ids).size !== ids.length) throw new Error("Feeding IDs must be unique.");
    this.food = (snapshot?.food ?? content.food).map((item) => ({ ...item, position: { ...item.position } }));
    this.eaten = new Set(snapshot?.eaten);
    this.ticks = snapshot?.ticks ?? 0;
  }
  public get elapsedTicks(): number { return this.ticks; }
  public get foods(): readonly Food[] { return this.food; }
  public isEaten(id: string): boolean { return this.eaten.has(id); }
  public snapshot(): FeedingSnapshot {
    return { ticks: this.ticks, food: this.food.map((item) => ({ ...item, position: { ...item.position } })),
      eaten: [...this.eaten] };
  }
  public positionOf(prey: PreyDefinition, ticks = this.ticks): Point {
    const angle = (ticks + prey.offset) / prey.period * Math.PI * 2;
    return { x: prey.center.x + Math.cos(angle) * prey.radius.x,
      y: prey.center.y + Math.sin(angle) * prey.radius.y };
  }
  public canEat(prey: PreyDefinition, power: number, burst: boolean): boolean {
    return !prey.large || power >= 2 || (power >= 1 && burst);
  }
  public step(head: FeedingHead): FeedingResult {
    this.ticks += 1;
    let biomass = 0;
    let preyEaten = 0;
    let largePreyEaten = 0;
    let blockedPrey = false;
    this.food = this.food.map((food) => {
      if (!food.active) return food;
      let position = food.position;
      const dx = position.x - head.position.x;
      const dy = position.y - head.position.y;
      const distance = Math.hypot(dx, dy);
      if (head.vacuum && head.burst && distance <= 100 && distance > 0 &&
          (dx * Math.cos(head.angle) + dy * Math.sin(head.angle)) / distance >= 0.5) {
        const pull = Math.min(distance, 420 / 60);
        position = { x: position.x - dx / distance * pull, y: position.y - dy / distance * pull };
      }
      if (pointSegmentDistance(position, head.previous, head.position) <= 30) {
        biomass += 1;
        return { ...food, position, active: false };
      }
      return position === food.position ? food : { ...food, position };
    });
    for (const prey of this.content.prey) {
      if (this.eaten.has(prey.id)) continue;
      const previous = this.positionOf(prey, this.ticks - 1);
      const position = this.positionOf(prey);
      const relativeStart = { x: head.previous.x - previous.x, y: head.previous.y - previous.y };
      const relativeEnd = { x: head.position.x - position.x, y: head.position.y - position.y };
      if (pointSegmentDistance({ x: 0, y: 0 }, relativeStart, relativeEnd) > (prey.large ? 43 : 35)) continue;
      if (!this.canEat(prey, head.power, head.burst)) { blockedPrey = true; continue; }
      this.eaten.add(prey.id);
      preyEaten += 1;
      biomass += prey.large ? 20 : 8;
      if (prey.large) {
        largePreyEaten += 1;
        // Loot is placed along its past route; each drop exists and pays out only once.
        for (let index = 0; index < 10; index += 1) {
          this.food.push({ id: prey.id + "-drop-" + index,
            position: this.positionOf(prey, this.ticks - (index + 1) * 28), active: true });
        }
      }
    }
    return { biomass, preyEaten, largePreyEaten, blockedPrey };
  }
}

function pointSegmentDistance(point: Point, start: Point, end: Point): number {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const lengthSquared = dx * dx + dy * dy;
  const t = lengthSquared === 0 ? 0 : Math.max(0, Math.min(1,
    ((point.x - start.x) * dx + (point.y - start.y) * dy) / lengthSquared));
  return Math.hypot(point.x - start.x - t * dx, point.y - start.y - t * dy);
}
