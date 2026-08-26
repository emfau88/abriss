import { BodyTrail } from "./BodyTrail";
import type { Point, TerrainCarveResult } from "./BurrowTerrain";
import { BurrowTerrain } from "./BurrowTerrain";

export type BurrowMovementMode = "digging" | "tunnel" | "airborne";

export interface BurrowMotionState {
  readonly position: Point;
  readonly angle: number;
  readonly velocity: Point;
  readonly speed: number;
  readonly mode: BurrowMovementMode;
  readonly burstRemaining: number;
  readonly burstCooldown: number;
  readonly traveledDistance: number;
  readonly excavatedCells: number;
}

export interface BurrowInput {
  readonly direction: Point | null;
  readonly burstPressed: boolean;
}

export interface BurrowStepResult {
  readonly terrainMutation: TerrainCarveResult | null;
  readonly burstStarted: boolean;
  readonly modeChanged: boolean;
}

const HEAD_RADIUS = 23;
const TUNNEL_RADIUS = 31;
const DIG_SPEED = 145;
const TUNNEL_SPEED = 225;
const BURST_SPEED = 370;
const TURN_RATE = 7.2;
const AIR_TURN_RATE = 2.8;
const GRAVITY = 520;
const BURST_DURATION = 0.68;
const BURST_COOLDOWN = 1.65;

export class BurrowMotion {
  public readonly trail: BodyTrail;
  private mutableState: BurrowMotionState;

  public constructor(
    private readonly terrain: BurrowTerrain,
    start: Point,
    startAngle = 0,
  ) {
    const initialMutation = terrain.carveCircle(start, TUNNEL_RADIUS + 8);
    this.mutableState = {
      position: { ...start },
      angle: startAngle,
      velocity: { x: Math.cos(startAngle) * TUNNEL_SPEED, y: Math.sin(startAngle) * TUNNEL_SPEED },
      speed: TUNNEL_SPEED,
      mode: "tunnel",
      burstRemaining: 0,
      burstCooldown: 0,
      traveledDistance: 0,
      excavatedCells: initialMutation.removedCells,
    };
    this.trail = new BodyTrail(start, startAngle);
  }

  public get state(): BurrowMotionState {
    return this.mutableState;
  }

  public step(input: BurrowInput, deltaSeconds: number): BurrowStepResult {
    if (!Number.isFinite(deltaSeconds) || deltaSeconds <= 0 || deltaSeconds > 0.1) {
      throw new Error("Burrow motion requires a positive fixed step up to 100 ms.");
    }

    const previousMode = this.mutableState.mode;
    let burstRemaining = Math.max(0, this.mutableState.burstRemaining - deltaSeconds);
    let burstCooldown = Math.max(0, this.mutableState.burstCooldown - deltaSeconds);
    let burstStarted = false;
    if (input.burstPressed && burstCooldown === 0) {
      burstRemaining = BURST_DURATION;
      burstCooldown = BURST_COOLDOWN;
      burstStarted = true;
    }

    const normalizedInput = normalizeOrNull(input.direction);
    const turnRate = this.mutableState.mode === "airborne" ? AIR_TURN_RATE : TURN_RATE;
    const angle = normalizedInput
      ? turnTowards(
          this.mutableState.angle,
          Math.atan2(normalizedInput.y, normalizedInput.x),
          turnRate * deltaSeconds,
        )
      : this.mutableState.angle;

    // Unter Erde ist der Stick eine direkte Kursvorgabe, keine dauerhafte
    // Beschleunigung. Ohne Richtung bleibt der Wurm stehen und gräbt nicht
    // unbeabsichtigt weiter. Ein aktiver Burst läuft als bereits ausgelöste
    // Aktion weiter; in der Luft gelten weiterhin Flugbahn und Schwerkraft.
    if (!normalizedInput && burstRemaining === 0 && this.mutableState.mode !== "airborne") {
      this.mutableState = {
        ...this.mutableState,
        velocity: { x: 0, y: 0 },
        speed: 0,
        burstRemaining,
        burstCooldown,
      };
      return {
        terrainMutation: null,
        burstStarted,
        modeChanged: false,
      };
    }

    if (this.mutableState.mode === "airborne") {
      return this.stepAirborne(
        normalizedInput,
        angle,
        burstRemaining,
        burstCooldown,
        burstStarted,
        previousMode,
        deltaSeconds,
      );
    }

    const direction = { x: Math.cos(angle), y: Math.sin(angle) };
    const probe = {
      x: this.mutableState.position.x + direction.x * (HEAD_RADIUS + 9),
      y: this.mutableState.position.y + direction.y * (HEAD_RADIUS + 9),
    };
    const solidAhead = this.terrain.isSolidWorld(probe.x, probe.y);
    const surrounded = hasOpposingWalls(
      this.terrain,
      this.mutableState.position,
      angle,
      TUNNEL_RADIUS * 2.1,
    );

    if (!solidAhead && !surrounded) {
      const launchSpeed = burstRemaining > 0 ? BURST_SPEED : this.mutableState.speed;
      this.mutableState = {
        ...this.mutableState,
        angle,
        velocity: { x: direction.x * launchSpeed, y: direction.y * launchSpeed },
        speed: launchSpeed,
        mode: "airborne",
        burstRemaining,
        burstCooldown,
      };
      return this.stepAirborne(
        normalizedInput,
        angle,
        burstRemaining,
        burstCooldown,
        burstStarted,
        previousMode,
        deltaSeconds,
      );
    }

    const targetSpeed = burstRemaining > 0
      ? BURST_SPEED
      : solidAhead
        ? DIG_SPEED
        : TUNNEL_SPEED;
    const speed = approach(this.mutableState.speed, targetSpeed, 780 * deltaSeconds);
    const constrained = constrainUndergroundMovement(
      {
        x: this.mutableState.position.x + direction.x * speed * deltaSeconds,
        y: this.mutableState.position.y + direction.y * speed * deltaSeconds,
      },
      angle,
      this.terrain,
      HEAD_RADIUS,
    );
    const next = constrained.position;
    const terrainMutation = solidAhead || this.terrain.isSolidWorld(next.x, next.y)
      ? this.terrain.carveCapsule(this.mutableState.position, next, TUNNEL_RADIUS)
      : null;
    const traveledDistance = Math.hypot(
      next.x - this.mutableState.position.x,
      next.y - this.mutableState.position.y,
    );
    this.mutableState = {
      position: next,
      angle: constrained.angle,
      velocity: {
        x: Math.cos(constrained.angle) * speed,
        y: Math.sin(constrained.angle) * speed,
      },
      speed,
      mode: solidAhead ? "digging" : "tunnel",
      burstRemaining,
      burstCooldown,
      traveledDistance: this.mutableState.traveledDistance + traveledDistance,
      excavatedCells:
        this.mutableState.excavatedCells + (terrainMutation?.removedCells ?? 0),
    };
    this.trail.record(next);

    return {
      terrainMutation,
      burstStarted,
      modeChanged: previousMode !== this.mutableState.mode,
    };
  }

  private stepAirborne(
    input: Point | null,
    angle: number,
    burstRemaining: number,
    burstCooldown: number,
    burstStarted: boolean,
    previousMode: BurrowMovementMode,
    deltaSeconds: number,
  ): BurrowStepResult {
    let velocity = { ...this.mutableState.velocity };
    if (burstStarted) {
      velocity = { x: Math.cos(angle) * BURST_SPEED, y: Math.sin(angle) * BURST_SPEED };
    } else {
      const airControl = burstRemaining > 0 ? 170 : 90;
      velocity.x += (input?.x ?? 0) * airControl * deltaSeconds;
      velocity.y += (input?.y ?? 0) * airControl * 0.35 * deltaSeconds;
    }
    velocity.y += GRAVITY * deltaSeconds;
    const maximumAirSpeed = burstRemaining > 0 ? BURST_SPEED * 1.15 : 330;
    velocity = limitMagnitude(velocity, maximumAirSpeed);

    const rawNext = {
      x: this.mutableState.position.x + velocity.x * deltaSeconds,
      y: this.mutableState.position.y + velocity.y * deltaSeconds,
    };
    const next = keepInsideWorld(rawNext, this.terrain, HEAD_RADIUS);
    if (next.x !== rawNext.x) velocity.x *= -0.55;
    if (next.y !== rawNext.y) velocity.y *= -0.55;
    const enteringTerrain =
      this.terrain.isSolidWorld(next.x, next.y) ||
      this.terrain.isSolidWorld(
        next.x + normalize(velocity).x * HEAD_RADIUS,
        next.y + normalize(velocity).y * HEAD_RADIUS,
      );
    let terrainMutation: TerrainCarveResult | null = null;
    let mode: BurrowMovementMode = "airborne";
    let speed = Math.hypot(velocity.x, velocity.y);
    let nextAngle = speed > 0.1 ? Math.atan2(velocity.y, velocity.x) : angle;

    if (enteringTerrain) {
      terrainMutation = this.terrain.carveCapsule(
        this.mutableState.position,
        next,
        TUNNEL_RADIUS,
      );
      mode = "digging";
      speed = Math.max(DIG_SPEED, Math.min(speed, BURST_SPEED));
      nextAngle = Math.atan2(velocity.y, velocity.x);
    }

    const traveledDistance = Math.hypot(
      next.x - this.mutableState.position.x,
      next.y - this.mutableState.position.y,
    );
    this.mutableState = {
      position: next,
      angle: nextAngle,
      velocity,
      speed,
      mode,
      burstRemaining,
      burstCooldown,
      traveledDistance: this.mutableState.traveledDistance + traveledDistance,
      excavatedCells:
        this.mutableState.excavatedCells + (terrainMutation?.removedCells ?? 0),
    };
    this.trail.record(next);

    return {
      terrainMutation,
      burstStarted,
      modeChanged: previousMode !== mode,
    };
  }
}

export const BURROW_MOTION_CONSTANTS = {
  headRadius: HEAD_RADIUS,
  tunnelRadius: TUNNEL_RADIUS,
  digSpeed: DIG_SPEED,
  tunnelSpeed: TUNNEL_SPEED,
  burstSpeed: BURST_SPEED,
  burstCooldown: BURST_COOLDOWN,
} as const;

function normalizeOrNull(point: Point | null): Point | null {
  if (!point) {
    return null;
  }
  const length = Math.hypot(point.x, point.y);
  if (length < 0.08) {
    return null;
  }
  return { x: point.x / length, y: point.y / length };
}

function normalize(point: Point): Point {
  const length = Math.hypot(point.x, point.y);
  return length > 0 ? { x: point.x / length, y: point.y / length } : { x: 1, y: 0 };
}

function limitMagnitude(point: Point, maximum: number): Point {
  const length = Math.hypot(point.x, point.y);
  if (length <= maximum || length === 0) {
    return point;
  }
  return { x: (point.x / length) * maximum, y: (point.y / length) * maximum };
}

function turnTowards(current: number, target: number, maximumDelta: number): number {
  const difference = Math.atan2(Math.sin(target - current), Math.cos(target - current));
  return current + clamp(difference, -maximumDelta, maximumDelta);
}

function approach(current: number, target: number, maximumDelta: number): number {
  if (Math.abs(target - current) <= maximumDelta) {
    return target;
  }
  return current + Math.sign(target - current) * maximumDelta;
}

function keepInsideWorld(
  point: Point,
  terrain: BurrowTerrain,
  margin: number,
): Point {
  return {
    x: clamp(point.x, margin, terrain.worldWidth - margin),
    y: clamp(point.y, margin, terrain.worldHeight - margin),
  };
}

function constrainUndergroundMovement(
  point: Point,
  angle: number,
  terrain: BurrowTerrain,
  margin: number,
): { readonly position: Point; readonly angle: number } {
  const position = keepInsideWorld(point, terrain, margin);
  let constrainedAngle = angle;
  if (position.x !== point.x) {
    constrainedAngle = Math.PI - constrainedAngle;
  }
  if (position.y !== point.y) {
    constrainedAngle = -constrainedAngle;
  }
  return { position, angle: constrainedAngle };
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.max(minimum, Math.min(maximum, value));
}

function hasOpposingWalls(
  terrain: BurrowTerrain,
  center: Point,
  travelAngle: number,
  radius: number,
): boolean {
  const offsets = [Math.PI / 3, Math.PI / 2, (Math.PI * 2) / 3];
  const hasLeftWall = offsets.some((offset) =>
    isSolidOrBoundary(
      terrain,
      {
        x: center.x + Math.cos(travelAngle + offset) * radius,
        y: center.y + Math.sin(travelAngle + offset) * radius,
      },
    ),
  );
  const hasRightWall = offsets.some((offset) =>
    isSolidOrBoundary(
      terrain,
      {
        x: center.x + Math.cos(travelAngle - offset) * radius,
        y: center.y + Math.sin(travelAngle - offset) * radius,
      },
    ),
  );
  return hasLeftWall && hasRightWall;
}

function isSolidOrBoundary(terrain: BurrowTerrain, point: Point): boolean {
  if (
    point.x < 0 ||
    point.y < 0 ||
    point.x >= terrain.worldWidth ||
    point.y >= terrain.worldHeight
  ) {
    return true;
  }
  return terrain.isSolidWorld(point.x, point.y);
}
