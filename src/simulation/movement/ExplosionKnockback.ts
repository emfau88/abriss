import type { Vector2 } from "../ballistics/Ballistics";
import type { TerrainMask } from "../terrain/TerrainMask";

export interface KnockbackSample {
  readonly timeSeconds: number;
  readonly position: Vector2;
  readonly velocity: Vector2;
}

export type KnockbackOutcome =
  | "unaffected"
  | "landed"
  | "out-of-world"
  | "timeout";

export interface ExplosionKnockbackInput {
  readonly terrain: TerrainMask;
  readonly startPosition: Vector2;
  readonly explosionCenter: Vector2;
  readonly explosionRadius: number;
  readonly maximumSpeed: number;
  readonly gravity?: Vector2;
  readonly fixedStepSeconds?: number;
  readonly maximumDurationSeconds?: number;
  readonly maximumBounces?: number;
  readonly bounceRestitution?: number;
  readonly surfaceFriction?: number;
  readonly bodyRadius?: number;
  readonly bodyHeight?: number;
}

export interface ExplosionKnockbackResult {
  readonly outcome: KnockbackOutcome;
  readonly samples: readonly KnockbackSample[];
  readonly initialVelocity: Vector2;
  readonly bounceCount: number;
}

interface BodyCollision {
  readonly safePosition: Vector2;
  readonly collisionPoint: Vector2;
  readonly fraction: number;
}

const DEFAULT_GRAVITY = { x: 0, y: 940 } as const;

export function simulateExplosionKnockback(
  input: ExplosionKnockbackInput,
): ExplosionKnockbackResult {
  validateInput(input);
  const initialVelocity = calculateExplosionImpulse(
    input.startPosition,
    input.explosionCenter,
    input.explosionRadius,
    input.maximumSpeed,
  );
  const samples: KnockbackSample[] = [
    {
      timeSeconds: 0,
      position: { ...input.startPosition },
      velocity: initialVelocity,
    },
  ];

  if (Math.hypot(initialVelocity.x, initialVelocity.y) < 1) {
    return {
      outcome: "unaffected",
      samples,
      initialVelocity,
      bounceCount: 0,
    };
  }

  const gravity = input.gravity ?? DEFAULT_GRAVITY;
  const fixedStepSeconds = input.fixedStepSeconds ?? 1 / 60;
  const maximumDurationSeconds = input.maximumDurationSeconds ?? 2.8;
  const maximumBounces = input.maximumBounces ?? 1;
  const restitution = input.bounceRestitution ?? 0.3;
  const friction = input.surfaceFriction ?? 0.68;
  const bodyRadius = input.bodyRadius ?? 14;
  const bodyHeight = input.bodyHeight ?? 54;
  let position = { ...input.startPosition };
  let velocity = { ...initialVelocity };
  let timeSeconds = 0;
  let bounceCount = 0;

  while (timeSeconds < maximumDurationSeconds) {
    const deltaSeconds = Math.min(
      fixedStepSeconds,
      maximumDurationSeconds - timeSeconds,
    );
    const nextPosition = integratePosition(
      position,
      velocity,
      gravity,
      deltaSeconds,
    );
    const nextVelocity = integrateVelocity(velocity, gravity, deltaSeconds);

    if (isOutsideWorld(nextPosition, input.terrain, bodyRadius, bodyHeight)) {
      timeSeconds += deltaSeconds;
      samples.push({
        timeSeconds,
        position: nextPosition,
        velocity: nextVelocity,
      });
      return {
        outcome: "out-of-world",
        samples,
        initialVelocity,
        bounceCount,
      };
    }

    const collision = findFirstBodyCollision(
      position,
      nextPosition,
      input.terrain,
      bodyRadius,
      bodyHeight,
    );

    if (!collision) {
      timeSeconds += deltaSeconds;
      position = nextPosition;
      velocity = nextVelocity;
      samples.push({
        timeSeconds,
        position: { ...position },
        velocity: { ...velocity },
      });
      continue;
    }

    const impactDelta = deltaSeconds * collision.fraction;
    timeSeconds += Math.max(impactDelta, fixedStepSeconds / 12);
    const impactVelocity = integrateVelocity(velocity, gravity, impactDelta);
    const normal = estimateTerrainNormal(
      collision.collisionPoint,
      impactVelocity,
      input.terrain,
    );
    position = collision.safePosition;

    if (normal.y < -0.45 && impactVelocity.y > 0) {
      const impactSpeed = Math.hypot(impactVelocity.x, impactVelocity.y);
      if (bounceCount < maximumBounces && impactSpeed > 155) {
        velocity = reflectedVelocity(
          impactVelocity,
          normal,
          restitution,
          friction,
        );
        bounceCount += 1;
        samples.push({
          timeSeconds,
          position: { ...position },
          velocity: { ...velocity },
        });
        continue;
      }

      const groundY = input.terrain.findGroundY(
        position.x,
        Math.max(0, position.y - input.terrain.cellSize * 2),
        Math.min(
          input.terrain.worldHeight - 1,
          nextPosition.y + input.terrain.cellSize * 3,
        ),
      );
      const landingPosition = {
        x: position.x,
        y: groundY ?? position.y,
      };
      samples.push({
        timeSeconds,
        position: landingPosition,
        velocity: { x: 0, y: 0 },
      });
      return {
        outcome: "landed",
        samples,
        initialVelocity,
        bounceCount,
      };
    }

    if (bounceCount < maximumBounces) {
      velocity = reflectedVelocity(
        impactVelocity,
        normal,
        restitution,
        friction,
      );
      bounceCount += 1;
    } else {
      const normalSpeed =
        impactVelocity.x * normal.x + impactVelocity.y * normal.y;
      velocity = {
        x: (impactVelocity.x - normal.x * normalSpeed) * friction,
        y: (impactVelocity.y - normal.y * normalSpeed) * friction,
      };
      if (Math.abs(normal.x) > 0.55) {
        velocity.x = 0;
      }
      if (normal.y > 0.55 && velocity.y < 0) {
        velocity.y = 0;
      }
    }
    samples.push({
      timeSeconds,
      position: { ...position },
      velocity: { ...velocity },
    });
  }

  return {
    outcome: "timeout",
    samples,
    initialVelocity,
    bounceCount,
  };
}

export function calculateExplosionImpulse(
  unitPosition: Vector2,
  explosionCenter: Vector2,
  explosionRadius: number,
  maximumSpeed: number,
): Vector2 {
  const deltaX = unitPosition.x - explosionCenter.x;
  const deltaY = unitPosition.y - explosionCenter.y;
  const distance = Math.hypot(deltaX, deltaY);
  const falloff = Math.max(0, 1 - distance / explosionRadius);

  if (falloff <= 0) {
    return { x: 0, y: 0 };
  }

  const directionLength = Math.max(1, distance);
  const directionX = distance < 1 ? 1 : deltaX / directionLength;
  const directionY = distance < 1 ? 0 : deltaY / directionLength;
  const speed = maximumSpeed * falloff;
  return {
    x: directionX * speed,
    y: Math.min(directionY * speed, -speed * 0.62),
  };
}

function findFirstBodyCollision(
  start: Vector2,
  end: Vector2,
  terrain: TerrainMask,
  bodyRadius: number,
  bodyHeight: number,
): BodyCollision | null {
  const distance = Math.hypot(end.x - start.x, end.y - start.y);
  const subdivisions = Math.max(
    1,
    Math.ceil(distance / Math.max(0.5, terrain.cellSize / 2)),
  );
  let safePosition = { ...start };

  for (let index = 1; index <= subdivisions; index += 1) {
    const fraction = index / subdivisions;
    const candidate = {
      x: start.x + (end.x - start.x) * fraction,
      y: start.y + (end.y - start.y) * fraction,
    };
    const collisionPoint = firstSolidBodyProbe(
      candidate,
      terrain,
      bodyRadius,
      bodyHeight,
    );
    if (collisionPoint) {
      return { safePosition, collisionPoint, fraction };
    }
    safePosition = candidate;
  }

  return null;
}

function firstSolidBodyProbe(
  feet: Vector2,
  terrain: TerrainMask,
  bodyRadius: number,
  bodyHeight: number,
): Vector2 | null {
  const probes: readonly Vector2[] = [
    { x: feet.x - bodyRadius, y: feet.y - 2 },
    { x: feet.x, y: feet.y - 2 },
    { x: feet.x + bodyRadius, y: feet.y - 2 },
    { x: feet.x - bodyRadius, y: feet.y - bodyHeight * 0.48 },
    { x: feet.x + bodyRadius, y: feet.y - bodyHeight * 0.48 },
    { x: feet.x - bodyRadius * 0.7, y: feet.y - bodyHeight },
    { x: feet.x, y: feet.y - bodyHeight },
    { x: feet.x + bodyRadius * 0.7, y: feet.y - bodyHeight },
  ];
  return probes.find((probe) => terrain.isSolid(probe.x, probe.y)) ?? null;
}

function estimateTerrainNormal(
  position: Vector2,
  incomingVelocity: Vector2,
  terrain: TerrainMask,
): Vector2 {
  const probe = Math.max(2, terrain.cellSize * 1.5);
  let normalX =
    Number(terrain.isSolid(position.x - probe, position.y)) -
    Number(terrain.isSolid(position.x + probe, position.y));
  let normalY =
    Number(terrain.isSolid(position.x, position.y - probe)) -
    Number(terrain.isSolid(position.x, position.y + probe));
  let length = Math.hypot(normalX, normalY);

  if (length < 1e-6) {
    normalX = -incomingVelocity.x;
    normalY = -incomingVelocity.y;
    length = Math.max(1, Math.hypot(normalX, normalY));
  }
  normalX /= length;
  normalY /= length;
  if (incomingVelocity.x * normalX + incomingVelocity.y * normalY > 0) {
    normalX *= -1;
    normalY *= -1;
  }
  return { x: normalX, y: normalY };
}

function reflectedVelocity(
  incoming: Vector2,
  normal: Vector2,
  restitution: number,
  friction: number,
): Vector2 {
  const normalSpeed = incoming.x * normal.x + incoming.y * normal.y;
  const tangent = {
    x: incoming.x - normal.x * normalSpeed,
    y: incoming.y - normal.y * normalSpeed,
  };
  return {
    x: tangent.x * friction - normal.x * normalSpeed * restitution,
    y: tangent.y * friction - normal.y * normalSpeed * restitution,
  };
}

function integratePosition(
  position: Vector2,
  velocity: Vector2,
  gravity: Vector2,
  deltaSeconds: number,
): Vector2 {
  return {
    x:
      position.x +
      velocity.x * deltaSeconds +
      0.5 * gravity.x * deltaSeconds * deltaSeconds,
    y:
      position.y +
      velocity.y * deltaSeconds +
      0.5 * gravity.y * deltaSeconds * deltaSeconds,
  };
}

function integrateVelocity(
  velocity: Vector2,
  gravity: Vector2,
  deltaSeconds: number,
): Vector2 {
  return {
    x: velocity.x + gravity.x * deltaSeconds,
    y: velocity.y + gravity.y * deltaSeconds,
  };
}

function isOutsideWorld(
  position: Vector2,
  terrain: TerrainMask,
  bodyRadius: number,
  bodyHeight: number,
): boolean {
  return (
    position.x < -bodyRadius ||
    position.x > terrain.worldWidth + bodyRadius ||
    position.y - bodyHeight > terrain.worldHeight ||
    position.y < -terrain.worldHeight
  );
}

function validateInput(input: ExplosionKnockbackInput): void {
  const values = [
    input.startPosition.x,
    input.startPosition.y,
    input.explosionCenter.x,
    input.explosionCenter.y,
    input.explosionRadius,
    input.maximumSpeed,
    input.fixedStepSeconds ?? 1 / 60,
    input.maximumDurationSeconds ?? 2.8,
    input.bodyRadius ?? 14,
    input.bodyHeight ?? 54,
  ];
  if (values.some((value) => !Number.isFinite(value))) {
    throw new Error("Knockback values must be finite.");
  }
  if (
    input.explosionRadius <= 0 ||
    input.maximumSpeed < 0 ||
    (input.fixedStepSeconds ?? 1 / 60) <= 0 ||
    (input.maximumDurationSeconds ?? 2.8) <= 0 ||
    (input.bodyRadius ?? 14) <= 0 ||
    (input.bodyHeight ?? 54) <= 0
  ) {
    throw new Error("Knockback dimensions and timing must be positive.");
  }
}
