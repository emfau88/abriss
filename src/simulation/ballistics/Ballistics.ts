export interface Vector2 {
  readonly x: number;
  readonly y: number;
}

export interface BallisticTerrain {
  readonly worldWidth: number;
  readonly worldHeight: number;
  readonly cellSize: number;
  isSolid(worldX: number, worldY: number): boolean;
  worldToCell(worldX: number, worldY: number): Vector2 | null;
}

export interface RocketTrajectoryInput {
  readonly startPosition: Vector2;
  readonly startVelocity: Vector2;
  readonly gravity: Vector2;
  readonly fixedStepSeconds: number;
  readonly maximumDurationSeconds: number;
  readonly explosionRadius: number;
  readonly collisionBehavior?: "explode" | "bounce";
  readonly fuseSeconds?: number;
  readonly maximumBounces?: number;
  readonly bounceRestitution?: number;
  readonly surfaceFriction?: number;
}

export interface TrajectorySample {
  readonly timeSeconds: number;
  readonly position: Vector2;
  readonly velocity: Vector2;
}

export interface TerrainImpact {
  readonly timeSeconds: number;
  readonly position: Vector2;
  readonly cell: Vector2;
}

export interface ExplosionPrediction {
  readonly center: Vector2;
  readonly radius: number;
}

export type TrajectoryOutcome =
  | "terrain-impact"
  | "fuse-expired"
  | "out-of-bounds"
  | "timeout";

export interface RocketTrajectoryResult {
  readonly outcome: TrajectoryOutcome;
  readonly samples: readonly TrajectorySample[];
  readonly impact: TerrainImpact | null;
  readonly bounces: readonly TerrainImpact[];
  readonly explosion: ExplosionPrediction | null;
  readonly fixedStepSeconds: number;
}

export interface TrajectoryPlaybackSample {
  readonly sample: TrajectorySample;
  readonly sampleIndex: number;
  readonly complete: boolean;
}

interface SegmentHit {
  readonly position: Vector2;
  readonly fraction: number;
}

export function simulateRocketTrajectory(
  input: RocketTrajectoryInput,
  terrain: BallisticTerrain,
): RocketTrajectoryResult {
  validateInput(input);

  if (input.collisionBehavior === "bounce") {
    return simulateFusedBouncingTrajectory(input, terrain);
  }

  const initialSample: TrajectorySample = {
    timeSeconds: 0,
    position: { ...input.startPosition },
    velocity: { ...input.startVelocity },
  };
  const samples: TrajectorySample[] = [initialSample];
  const initialCell = terrain.worldToCell(
    input.startPosition.x,
    input.startPosition.y,
  );

  if (
    initialCell &&
    terrain.isSolid(input.startPosition.x, input.startPosition.y)
  ) {
    const impact: TerrainImpact = {
      timeSeconds: 0,
      position: { ...input.startPosition },
      cell: initialCell,
    };

    return impactResult(samples, impact, input);
  }

  const maximumSteps = Math.ceil(
    input.maximumDurationSeconds / input.fixedStepSeconds,
  );

  for (let step = 1; step <= maximumSteps; step += 1) {
    const timeSeconds = step * input.fixedStepSeconds;
    const previous = samples[samples.length - 1];

    if (!previous) {
      throw new Error("A trajectory must always have an initial sample.");
    }

    const position = positionAtTime(input, timeSeconds);
    const velocity = velocityAtTime(input, timeSeconds);
    const segmentHit = findFirstTerrainHit(
      previous.position,
      position,
      terrain,
    );

    if (segmentHit) {
      const impactTime =
        previous.timeSeconds +
        (timeSeconds - previous.timeSeconds) * segmentHit.fraction;
      const impactCell = terrain.worldToCell(
        segmentHit.position.x,
        segmentHit.position.y,
      );

      if (!impactCell) {
        throw new Error("Terrain contact must resolve to a terrain cell.");
      }

      const impactSample: TrajectorySample = {
        timeSeconds: impactTime,
        position: segmentHit.position,
        velocity: velocityAtTime(input, impactTime),
      };
      samples.push(impactSample);

      return impactResult(
        samples,
        {
          timeSeconds: impactTime,
          position: segmentHit.position,
          cell: impactCell,
        },
        input,
      );
    }

    samples.push({ timeSeconds, position, velocity });

    if (isOutsideSimulationBounds(position, terrain)) {
      return {
        outcome: "out-of-bounds",
        samples,
        impact: null,
        bounces: [],
        explosion: null,
        fixedStepSeconds: input.fixedStepSeconds,
      };
    }
  }

  return {
    outcome: "timeout",
    samples,
    impact: null,
    bounces: [],
    explosion: null,
    fixedStepSeconds: input.fixedStepSeconds,
  };
}

function simulateFusedBouncingTrajectory(
  input: RocketTrajectoryInput,
  terrain: BallisticTerrain,
): RocketTrajectoryResult {
  const fuseSeconds = input.fuseSeconds ?? input.maximumDurationSeconds;
  const maximumBounces = input.maximumBounces ?? 2;
  const restitution = input.bounceRestitution ?? 0.46;
  const friction = input.surfaceFriction ?? 0.72;
  const samples: TrajectorySample[] = [
    {
      timeSeconds: 0,
      position: { ...input.startPosition },
      velocity: { ...input.startVelocity },
    },
  ];
  const bounces: TerrainImpact[] = [];
  let position = { ...input.startPosition };
  let velocity = { ...input.startVelocity };
  let timeSeconds = 0;
  let resting = false;

  if (terrain.isSolid(position.x, position.y)) {
    const cell = terrain.worldToCell(position.x, position.y);
    if (!cell) {
      throw new Error("Initial terrain contact must resolve to a terrain cell.");
    }
    const impact = { timeSeconds: 0, position: { ...position }, cell };
    return {
      outcome: "terrain-impact",
      samples,
      impact,
      bounces: [],
      explosion: { center: { ...position }, radius: input.explosionRadius },
      fixedStepSeconds: input.fixedStepSeconds,
    };
  }

  while (timeSeconds < input.maximumDurationSeconds) {
    const nextTime = Math.min(
      timeSeconds + input.fixedStepSeconds,
      fuseSeconds,
      input.maximumDurationSeconds,
    );
    const deltaSeconds = nextTime - timeSeconds;

    if (deltaSeconds <= 0) {
      break;
    }

    if (resting) {
      timeSeconds = nextTime;
      samples.push({
        timeSeconds,
        position: { ...position },
        velocity: { x: 0, y: 0 },
      });
    } else {
      const nextPosition = integratePosition(
        position,
        velocity,
        input.gravity,
        deltaSeconds,
      );
      const nextVelocity = integrateVelocity(
        velocity,
        input.gravity,
        deltaSeconds,
      );
      const hit = findFirstTerrainHit(position, nextPosition, terrain);

      if (hit) {
        const impactTime = timeSeconds + deltaSeconds * hit.fraction;
        const impactVelocity = integrateVelocity(
          velocity,
          input.gravity,
          deltaSeconds * hit.fraction,
        );
        const cell = terrain.worldToCell(hit.position.x, hit.position.y);
        if (!cell) {
          throw new Error("Terrain contact must resolve to a terrain cell.");
        }
        const impact: TerrainImpact = {
          timeSeconds: impactTime,
          position: hit.position,
          cell,
        };
        samples.push({
          timeSeconds: impactTime,
          position: hit.position,
          velocity: impactVelocity,
        });

        if (bounces.length >= maximumBounces) {
          position = moveOutsideTerrain(
            hit.position,
            estimateTerrainNormal(hit.position, impactVelocity, terrain),
            terrain,
          );
          velocity = { x: 0, y: 0 };
          timeSeconds = impactTime;
          resting = true;
          continue;
        }

        bounces.push(impact);
        const normal = estimateTerrainNormal(
          hit.position,
          impactVelocity,
          terrain,
        );
        velocity = reflectedVelocity(
          impactVelocity,
          normal,
          restitution,
          friction,
        );
        position = moveOutsideTerrain(hit.position, normal, terrain);
        timeSeconds = impactTime;
        resting = Math.hypot(velocity.x, velocity.y) < 46;
        samples.push({
          timeSeconds,
          position: { ...position },
          velocity: resting ? { x: 0, y: 0 } : { ...velocity },
        });
      } else {
        position = nextPosition;
        velocity = nextVelocity;
        timeSeconds = nextTime;
        samples.push({
          timeSeconds,
          position: { ...position },
          velocity: { ...velocity },
        });
      }
    }

    if (isOutsideSimulationBounds(position, terrain)) {
      return {
        outcome: "out-of-bounds",
        samples,
        impact: bounces[bounces.length - 1] ?? null,
        bounces,
        explosion: null,
        fixedStepSeconds: input.fixedStepSeconds,
      };
    }

    if (timeSeconds >= fuseSeconds) {
      return {
        outcome: "fuse-expired",
        samples,
        impact: bounces[bounces.length - 1] ?? null,
        bounces,
        explosion: {
          center: { ...position },
          radius: input.explosionRadius,
        },
        fixedStepSeconds: input.fixedStepSeconds,
      };
    }
  }

  return {
    outcome: "timeout",
    samples,
    impact: bounces[bounces.length - 1] ?? null,
    bounces,
    explosion: null,
    fixedStepSeconds: input.fixedStepSeconds,
  };
}

export function sampleTrajectoryAtElapsed(
  trajectory: RocketTrajectoryResult,
  elapsedSeconds: number,
): TrajectoryPlaybackSample {
  if (!Number.isFinite(elapsedSeconds) || elapsedSeconds < 0) {
    throw new Error("Trajectory playback time must be finite and non-negative.");
  }

  const lastIndex = trajectory.samples.length - 1;

  if (lastIndex < 0) {
    throw new Error("Cannot play an empty trajectory.");
  }

  let low = 0;
  let high = lastIndex;

  while (low < high) {
    const middle = Math.ceil((low + high) / 2);
    const middleSample = trajectory.samples[middle];

    if (middleSample && middleSample.timeSeconds <= elapsedSeconds) {
      low = middle;
    } else {
      high = middle - 1;
    }
  }

  const sample = trajectory.samples[low];

  if (!sample) {
    throw new Error("Trajectory playback could not resolve a sample.");
  }

  const lastSample = trajectory.samples[lastIndex];
  const complete = Boolean(
    lastSample && elapsedSeconds >= lastSample.timeSeconds,
  );

  return { sample, sampleIndex: low, complete };
}

function impactResult(
  samples: readonly TrajectorySample[],
  impact: TerrainImpact,
  input: RocketTrajectoryInput,
): RocketTrajectoryResult {
  return {
    outcome: "terrain-impact",
    samples,
    impact,
    bounces: [],
    explosion: {
      center: impact.position,
      radius: input.explosionRadius,
    },
    fixedStepSeconds: input.fixedStepSeconds,
  };
}

function positionAtTime(
  input: RocketTrajectoryInput,
  timeSeconds: number,
): Vector2 {
  return {
    x:
      input.startPosition.x +
      input.startVelocity.x * timeSeconds +
      0.5 * input.gravity.x * timeSeconds * timeSeconds,
    y:
      input.startPosition.y +
      input.startVelocity.y * timeSeconds +
      0.5 * input.gravity.y * timeSeconds * timeSeconds,
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

function velocityAtTime(
  input: RocketTrajectoryInput,
  timeSeconds: number,
): Vector2 {
  return {
    x: input.startVelocity.x + input.gravity.x * timeSeconds,
    y: input.startVelocity.y + input.gravity.y * timeSeconds,
  };
}

function findFirstTerrainHit(
  start: Vector2,
  end: Vector2,
  terrain: BallisticTerrain,
): SegmentHit | null {
  const deltaX = end.x - start.x;
  const deltaY = end.y - start.y;
  const distance = Math.hypot(deltaX, deltaY);
  const maximumSampleDistance = Math.max(0.5, terrain.cellSize / 2);
  const subdivisions = Math.max(1, Math.ceil(distance / maximumSampleDistance));

  for (let index = 1; index <= subdivisions; index += 1) {
    const fraction = index / subdivisions;
    const position = {
      x: start.x + deltaX * fraction,
      y: start.y + deltaY * fraction,
    };

    if (terrain.isSolid(position.x, position.y)) {
      return { position, fraction };
    }
  }

  return null;
}

function estimateTerrainNormal(
  position: Vector2,
  incomingVelocity: Vector2,
  terrain: BallisticTerrain,
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

function moveOutsideTerrain(
  impact: Vector2,
  normal: Vector2,
  terrain: BallisticTerrain,
): Vector2 {
  const increment = Math.max(1, terrain.cellSize / 2);
  for (let step = 1; step <= 12; step += 1) {
    const candidate = {
      x: impact.x + normal.x * increment * step,
      y: impact.y + normal.y * increment * step,
    };
    if (!terrain.isSolid(candidate.x, candidate.y)) {
      return candidate;
    }
  }
  return {
    x: impact.x + normal.x * terrain.cellSize * 6,
    y: impact.y + normal.y * terrain.cellSize * 6,
  };
}

function isOutsideSimulationBounds(
  position: Vector2,
  terrain: BallisticTerrain,
): boolean {
  return (
    position.x < 0 ||
    position.x >= terrain.worldWidth ||
    position.y >= terrain.worldHeight ||
    position.y < -terrain.worldHeight
  );
}

function validateInput(input: RocketTrajectoryInput): void {
  const numericValues = [
    input.startPosition.x,
    input.startPosition.y,
    input.startVelocity.x,
    input.startVelocity.y,
    input.gravity.x,
    input.gravity.y,
    input.fixedStepSeconds,
    input.maximumDurationSeconds,
    input.explosionRadius,
    input.fuseSeconds ?? 1,
    input.maximumBounces ?? 0,
    input.bounceRestitution ?? 0.46,
    input.surfaceFriction ?? 0.72,
  ];

  if (numericValues.some((value) => !Number.isFinite(value))) {
    throw new Error("Rocket trajectory values must be finite.");
  }

  if (
    input.fixedStepSeconds <= 0 ||
    input.maximumDurationSeconds <= 0 ||
    input.explosionRadius <= 0
  ) {
    throw new Error("Trajectory timing and explosion radius must be positive.");
  }

  if (
    (input.fuseSeconds !== undefined &&
      (input.fuseSeconds <= 0 ||
        input.fuseSeconds > input.maximumDurationSeconds)) ||
    (input.maximumBounces !== undefined &&
      (!Number.isSafeInteger(input.maximumBounces) || input.maximumBounces < 0)) ||
    (input.bounceRestitution !== undefined &&
      (input.bounceRestitution < 0 || input.bounceRestitution > 1)) ||
    (input.surfaceFriction !== undefined &&
      (input.surfaceFriction < 0 || input.surfaceFriction > 1))
  ) {
    throw new Error("Bounce and fuse settings are invalid.");
  }
}
