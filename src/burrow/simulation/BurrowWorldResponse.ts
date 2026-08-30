import type { Point } from "./BurrowTerrain";
import type { BurrowSurfaceSupport, SurfaceStatus } from "./BurrowSurfaceSupport";

export interface BurrowWorldResponseConfig {
  readonly animalStart: Point;
  readonly shrinePosition: Point;
  readonly surfaceYAt: (worldX: number) => number;
  readonly minimumX: number;
  readonly maximumX: number;
}

export interface BurrowAnimalState {
  readonly position: Point;
  readonly direction: -1 | 1;
  readonly fleeing: boolean;
  readonly surfaceStatus: SurfaceStatus;
  readonly active: boolean;
}

export interface BurrowShrineState {
  readonly position: Point;
  readonly activated: boolean;
}

export interface BurrowWorldResponseState {
  readonly animal: BurrowAnimalState;
  readonly shrine: BurrowShrineState;
}

export interface WorldResponseInput {
  readonly headPosition: Point;
  readonly breachOccurred: boolean;
  readonly deltaSeconds: number;
  readonly shrineEnabled?: boolean;
}

export interface WorldResponseResult {
  readonly animalFledNow: boolean;
  readonly shrineActivatedNow: boolean;
}

export interface AnimalDevourAttempt {
  readonly headPosition: Point;
  readonly speed: number;
}

const ANIMAL_ALERT_RADIUS = 285;
const ANIMAL_FLEE_SPEED = 128;
const SHRINE_CONTACT_RADIUS = 68;
const ANIMAL_CONTACT_RADIUS = 52;
const ANIMAL_MINIMUM_BITE_SPEED = 170;

/**
 * Kleine, rein fachliche Weltreaktionen. Sie kennen keine Phaser-Sprites und
 * keine echte Physik; die Oberfläche bleibt deterministisch und testbar.
 */
export class BurrowWorldResponse {
  private mutableState: BurrowWorldResponseState;

  public constructor(private readonly config: BurrowWorldResponseConfig, private readonly surface?: BurrowSurfaceSupport) {
    this.mutableState = {
      animal: {
        position: { ...config.animalStart },
        direction: 1,
        fleeing: false,
        surfaceStatus: "grounded",
        active: true,
      },
      shrine: { position: { ...config.shrinePosition }, activated: false },
    };
  }

  public get state(): BurrowWorldResponseState {
    return this.mutableState;
  }

  public step(input: WorldResponseInput): WorldResponseResult {
    if (!Number.isFinite(input.deltaSeconds) || input.deltaSeconds <= 0 || input.deltaSeconds > 0.1) {
      throw new Error("World response requires a positive fixed step up to 100 ms.");
    }
    const animal = this.mutableState.animal;
    const shouldFlee = animal.active && (animal.fleeing || (
      input.breachOccurred && distance(input.headPosition, animal.position) <= ANIMAL_ALERT_RADIUS
    ));
    const direction: -1 | 1 = input.headPosition.x <= animal.position.x ? 1 : -1;
    const nextX = shouldFlee
      ? clamp(animal.position.x + direction * ANIMAL_FLEE_SPEED * input.deltaSeconds, this.config.minimumX, this.config.maximumX)
      : animal.position.x;
    const placement = this.surface?.advance(animal.position, nextX, 3, animal.surfaceStatus, input.deltaSeconds);
    const nextAnimal: BurrowAnimalState = {
      position: placement?.position ?? { x: nextX, y: this.config.surfaceYAt(nextX) - 3 },
      surfaceStatus: placement?.status ?? "grounded",
      direction: shouldFlee ? direction : animal.direction,
      fleeing: shouldFlee,
      active: animal.active,
    };
    const shrine = this.mutableState.shrine;
    const shrineActivatedNow = (input.shrineEnabled ?? true) && !shrine.activated && distance(input.headPosition, shrine.position) <= SHRINE_CONTACT_RADIUS;
    this.mutableState = {
      animal: nextAnimal,
      shrine: shrineActivatedNow ? { ...shrine, activated: true } : shrine,
    };
    return { animalFledNow: !animal.fleeing && nextAnimal.fleeing, shrineActivatedNow };
  }

  public tryDevourAnimal(attempt: AnimalDevourAttempt): boolean {
    const animal = this.mutableState.animal;
    if (
      !animal.active ||
      attempt.speed < ANIMAL_MINIMUM_BITE_SPEED ||
      distance(attempt.headPosition, animal.position) > ANIMAL_CONTACT_RADIUS
    ) {
      return false;
    }
    this.mutableState = {
      ...this.mutableState,
      animal: { ...animal, active: false, fleeing: false },
    };
    return true;
  }
}

export const BURROW_WORLD_RESPONSE_CONSTANTS = {
  animalAlertRadius: ANIMAL_ALERT_RADIUS,
  animalFleeSpeed: ANIMAL_FLEE_SPEED,
  shrineContactRadius: SHRINE_CONTACT_RADIUS,
  animalContactRadius: ANIMAL_CONTACT_RADIUS,
  animalMinimumBiteSpeed: ANIMAL_MINIMUM_BITE_SPEED,
} as const;

function distance(first: Point, second: Point): number {
  return Math.hypot(first.x - second.x, first.y - second.y);
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.max(minimum, Math.min(maximum, value));
}
