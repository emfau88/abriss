import type { Point } from "./BurrowTerrain";

export type FoodKind = "spore" | "root" | "rootBite" | "brood" | "larva" | "mark";
export type PreyKind = "thread" | "runner" | "armored";
export interface Food {
  readonly id: string;
  readonly position: Point;
  readonly active: boolean;
  readonly kind: FoodKind;
  readonly value: number;
  readonly velocity?: Point;
}
export interface PreyDefinition {
  readonly id: string;
  readonly kind: PreyKind;
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
  readonly preyLead: readonly { readonly id: string; readonly ticks: number }[];
}
export interface FeedingHead {
  readonly previous: Point;
  readonly position: Point;
  readonly angle: number;
  readonly power: 0 | 1 | 2;
  readonly burst: boolean;
  readonly vacuum: boolean;
  readonly digging: boolean;
  readonly quakeRadius: number;
}
export interface FeedingResult {
  readonly biomass: number;
  readonly preyEaten: number;
  readonly largePreyEaten: number;
  readonly blockedPrey: boolean;
  readonly foodOpened: number;
  readonly vacuumPulled: number;
  readonly quakePushed: number;
  readonly preyKinds: readonly PreyKind[];
}

/** Fixed-step, renderer-free food and head-only prey contacts. No respawn or body damage. */
export class BurrowFeeding {
  private ticks = 0;
  private food: Food[];
  private eaten: Set<string>;
  private preyLead = new Map<string, number>();
  public constructor(public readonly content: FeedingContent, snapshot?: FeedingSnapshot) {
    const ids = [...content.food, ...content.prey].map((entry) => entry.id);
    if (new Set(ids).size !== ids.length) throw new Error("Feeding IDs must be unique.");
    this.food = (snapshot?.food ?? content.food).map((item) => ({ ...item, position: { ...item.position } }));
    this.eaten = new Set(snapshot?.eaten);
    this.preyLead = new Map(snapshot?.preyLead?.map((entry) => [entry.id, entry.ticks]));
    this.ticks = snapshot?.ticks ?? 0;
  }
  public get elapsedTicks(): number { return this.ticks; }
  public get foods(): readonly Food[] { return this.food; }
  public isEaten(id: string): boolean { return this.eaten.has(id); }
  public snapshot(): FeedingSnapshot {
    return { ticks: this.ticks, food: this.food.map((item) => ({ ...item, position: { ...item.position } })),
      eaten: [...this.eaten], preyLead: [...this.preyLead].map(([id, ticks]) => ({ id, ticks })) };
  }
  public positionOf(prey: PreyDefinition, ticks = this.ticks): Point {
    const angle = (ticks + (this.preyLead.get(prey.id) ?? 0) + prey.offset) / prey.period * Math.PI * 2;
    return { x: prey.center.x + Math.cos(angle) * prey.radius.x,
      y: prey.center.y + Math.sin(angle) * prey.radius.y };
  }
  public canEat(prey: PreyDefinition, power: number, burst: boolean, headPosition?: Point): boolean {
    if (prey.kind !== "armored") return true;
    if (power >= 2) return true;
    if (power < 1 || !burst) return false;
    if (!headPosition) return true;
    const position = this.positionOf(prey);
    const previous = this.positionOf(prey, this.ticks - 1);
    const travel = normalize({ x: position.x - previous.x, y: position.y - previous.y });
    const towardHead = normalize({ x: headPosition.x - position.x, y: headPosition.y - position.y });
    return travel.x * towardHead.x + travel.y * towardHead.y < 0.15;
  }
  public step(head: FeedingHead): FeedingResult {
    this.ticks += 1;
    let biomass = 0;
    let preyEaten = 0;
    let largePreyEaten = 0;
    let blockedPrey = false;
    let foodOpened = 0;
    let vacuumPulled = 0;
    let quakePushed = 0;
    const preyKinds: PreyKind[] = [];
    const spawned: Food[] = [];
    this.food = this.food.map((food) => {
      if (!food.active) return food;
      let position = food.velocity ? { x: food.position.x + food.velocity.x / 60,
        y: food.position.y + food.velocity.y / 60 } : food.position;
      const velocity = food.velocity ? { x: food.velocity.x * 0.975, y: food.velocity.y * 0.975 } : null;
      const sealed = food.kind === "root" || food.kind === "brood";
      const quakeOpened = sealed && head.quakeRadius > 0 && pointDistance(position, head.position) <= head.quakeRadius;
      const touched = pointSegmentDistance(position, head.previous, head.position) <= (sealed ? 38 : 30);
      const contactOpened = touched && ((food.kind === "root" && head.digging) || (food.kind === "brood" && head.burst));
      if (quakeOpened || contactOpened) {
        foodOpened += 1;
        spawned.push(...openFood(food, head.angle));
        return { ...food, position, ...(velocity ? { velocity } : {}), active: false };
      }
      if (sealed) return position === food.position ? food : { ...food, position, ...(velocity ? { velocity } : {}) };
      const dx = position.x - head.position.x;
      const dy = position.y - head.position.y;
      const distanceToFood = Math.hypot(dx, dy);
      if (head.vacuum && head.burst && distanceToFood <= 130 && distanceToFood > 0 &&
          (dx * Math.cos(head.angle) + dy * Math.sin(head.angle)) / distanceToFood >= 0.5) {
        const pull = Math.min(distanceToFood, 560 / 60);
        position = { x: position.x - dx / distanceToFood * pull, y: position.y - dy / distanceToFood * pull };
        vacuumPulled += 1;
      }
      if (pointSegmentDistance(position, head.previous, head.position) <= 30) {
        biomass += food.value;
        return { ...food, position, ...(velocity ? { velocity } : {}), active: false };
      }
      return position === food.position ? food : { ...food, position, ...(velocity ? { velocity } : {}) };
    });
    for (const prey of this.content.prey) {
      if (this.eaten.has(prey.id)) continue;
      const previous = this.positionOf(prey, this.ticks - 1);
      const beforeFlee = this.positionOf(prey);
      if (prey.kind === "runner" && pointDistance(beforeFlee, head.position) <= 210) {
        this.preyLead.set(prey.id, (this.preyLead.get(prey.id) ?? 0) + 2);
      }
      if (head.quakeRadius > 0 && pointDistance(this.positionOf(prey), head.position) <= head.quakeRadius) {
        this.preyLead.set(prey.id, (this.preyLead.get(prey.id) ?? 0) + 18);
        quakePushed += 1;
      }
      const position = this.positionOf(prey);
      const relativeStart = { x: head.previous.x - previous.x, y: head.previous.y - previous.y };
      const relativeEnd = { x: head.position.x - position.x, y: head.position.y - position.y };
      if (pointSegmentDistance({ x: 0, y: 0 }, relativeStart, relativeEnd) > preyContactRadius(prey.kind)) continue;
      if (!this.canEat(prey, head.power, head.burst, head.position)) { blockedPrey = true; continue; }
      this.eaten.add(prey.id);
      preyEaten += 1;
      preyKinds.push(prey.kind);
      biomass += preyBiomass(prey.kind);
      if (prey.kind === "armored") {
        largePreyEaten += 1;
        for (let index = 0; index < 5; index += 1) {
          spawned.push({ id: prey.id + "-drop-" + index, kind: "mark", value: 2,
            position: this.positionOf(prey, this.ticks - (index + 1) * 38), active: true });
        }
      }
    }
    this.food.push(...spawned);
    return { biomass, preyEaten, largePreyEaten, blockedPrey, foodOpened, vacuumPulled, quakePushed, preyKinds };
  }
}

function openFood(food: Food, angle: number): Food[] {
  if (food.kind === "root") return Array.from({ length: 4 }, (_, index) => {
    const direction = index / 4 * Math.PI * 2;
    return { id: food.id + "-bite-" + index, kind: "rootBite", value: 2, active: true,
      position: { x: food.position.x + Math.cos(direction) * 25, y: food.position.y + Math.sin(direction) * 25 } };
  });
  return Array.from({ length: 6 }, (_, index) => {
    const direction = angle - 1 + index * 0.4;
    return { id: food.id + "-larva-" + index, kind: "larva", value: 1, active: true,
      position: { x: food.position.x + Math.cos(direction) * 20, y: food.position.y + Math.sin(direction) * 20 },
      velocity: { x: Math.cos(direction) * 170, y: Math.sin(direction) * 170 } };
  });
}

export function preyBiomass(kind: PreyKind): number { return kind === "thread" ? 8 : kind === "runner" ? 14 : 22; }
export function preyContactRadius(kind: PreyKind): number { return kind === "thread" ? 34 : kind === "runner" ? 39 : 46; }
function pointDistance(a: Point, b: Point): number { return Math.hypot(a.x - b.x, a.y - b.y); }
function normalize(point: Point): Point {
  const length = Math.hypot(point.x, point.y);
  return length > 0 ? { x: point.x / length, y: point.y / length } : { x: 1, y: 0 };
}

function pointSegmentDistance(point: Point, start: Point, end: Point): number {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const lengthSquared = dx * dx + dy * dy;
  const t = lengthSquared === 0 ? 0 : Math.max(0, Math.min(1,
    ((point.x - start.x) * dx + (point.y - start.y) * dy) / lengthSquared));
  return Math.hypot(point.x - start.x - t * dx, point.y - start.y - t * dy);
}
