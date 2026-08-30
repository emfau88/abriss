import type { Point } from "./BurrowTerrain";
import type { BurrowSurfaceSupport, SurfaceStatus } from "./BurrowSurfaceSupport";

export interface VehicleRoute {
  readonly minimumX: number;
  readonly maximumX: number;
  readonly startX: number;
  readonly surfaceYAt: (worldX: number) => number;
}

export interface BurrowVehicleState {
  readonly position: Point;
  readonly direction: -1 | 1;
  readonly hitPoints: number;
  readonly maximumHitPoints: number;
  readonly active: boolean;
  readonly respawnRemaining: number;
  readonly surfaceStatus: SurfaceStatus;
  readonly kind: "patrol" | "finale";
}

export interface BurrowHuntState {
  readonly vehicle: BurrowVehicleState;
  readonly biomass: number;
  readonly biteCooldown: number;
}

export interface BiteAttempt {
  readonly headPosition: Point;
  readonly speed: number;
  readonly burstActive: boolean;
  readonly damageBonus?: number;
}

export interface BiteResult {
  readonly damage: number;
  readonly devoured: boolean;
  readonly remainingHitPoints: number;
}

export interface HuntStepResult {
  readonly respawned: boolean;
}

export interface BurrowHuntTuning {
  readonly vehicleSpeed: number;
  readonly vehicleContactRadius: number;
  readonly minimumBiteSpeed: number;
  readonly heavyBiteSpeed: number;
  readonly biteCooldown: number;
  readonly biteCooldownMultiplier: number;
  readonly respawnSeconds: number;
  readonly vehicleHitPoints: number;
  readonly kind: "patrol" | "finale";
}

const VEHICLE_SPEED = 48;
const VEHICLE_HEIGHT_ABOVE_SURFACE = 31;
const VEHICLE_CONTACT_RADIUS = 64;
const MINIMUM_BITE_SPEED = 170;
const HEAVY_BITE_SPEED = 300;
const BITE_COOLDOWN = 0.58;
const RESPAWN_SECONDS = 3.2;
const VEHICLE_HIT_POINTS = 3;
const DEFAULT_TUNING: BurrowHuntTuning = {
  vehicleSpeed: VEHICLE_SPEED,
  vehicleContactRadius: VEHICLE_CONTACT_RADIUS,
  minimumBiteSpeed: MINIMUM_BITE_SPEED,
  heavyBiteSpeed: HEAVY_BITE_SPEED,
  biteCooldown: BITE_COOLDOWN,
  biteCooldownMultiplier: 1,
  respawnSeconds: RESPAWN_SECONDS,
  vehicleHitPoints: VEHICLE_HIT_POINTS,
  kind: "patrol",
};

/**
 * Rendererfreie Jagdschleife für Gate 2. Das Fahrzeug folgt bewusst nur einer
 * festen Oberflächenroute: Es ist Beute und kein allgemeines Physikobjekt.
 */
export class BurrowHunt {
  private mutableState: BurrowHuntState;
  private tuning: BurrowHuntTuning;

  public constructor(
    private readonly route: VehicleRoute,
    private readonly surface?: BurrowSurfaceSupport,
    tuning: Partial<BurrowHuntTuning> = {},
  ) {
    if (route.minimumX >= route.maximumX) {
      throw new Error("A vehicle route needs a positive horizontal span.");
    }
    if (route.startX < route.minimumX || route.startX > route.maximumX) {
      throw new Error("The vehicle start must be inside its patrol route.");
    }
    this.tuning = { ...DEFAULT_TUNING, ...tuning };
    this.mutableState = {
      vehicle: this.createVehicle(route.startX, 1),
      biomass: 0,
      biteCooldown: 0,
    };
  }

  public get state(): BurrowHuntState {
    return this.mutableState;
  }

  public beginFinale(tuning: Pick<BurrowHuntTuning, "vehicleHitPoints">): void {
    this.tuning = {
      ...this.tuning,
      ...tuning,
      kind: "finale",
      respawnSeconds: Number.POSITIVE_INFINITY,
    };
    this.mutableState = {
      ...this.mutableState,
      biteCooldown: 0,
      vehicle: this.createVehicle(this.route.startX, 1),
    };
  }

  public step(deltaSeconds: number): HuntStepResult {
    if (!Number.isFinite(deltaSeconds) || deltaSeconds <= 0 || deltaSeconds > 0.1) {
      throw new Error("Burrow hunt requires a positive fixed step up to 100 ms.");
    }

    const biteCooldown = Math.max(0, this.mutableState.biteCooldown - deltaSeconds);
    const vehicle = this.mutableState.vehicle;
    if (!vehicle.active) {
      const respawnRemaining = Math.max(0, vehicle.respawnRemaining - deltaSeconds);
      if (respawnRemaining > 0) {
        this.mutableState = {
          ...this.mutableState,
          biteCooldown,
          vehicle: { ...vehicle, respawnRemaining },
        };
        return { respawned: false };
      }
      this.mutableState = {
        ...this.mutableState,
        biteCooldown,
        vehicle: this.createVehicle(this.route.startX, 1),
      };
      return { respawned: true };
    }

    const patrol = advancePatrol(
      vehicle.position.x,
      vehicle.direction,
      this.tuning.vehicleSpeed * deltaSeconds,
      this.route.minimumX,
      this.route.maximumX,
    );
    const placement = this.surface?.advance(vehicle.position, patrol.x, VEHICLE_HEIGHT_ABOVE_SURFACE, vehicle.surfaceStatus, deltaSeconds);
    this.mutableState = {
      ...this.mutableState,
      biteCooldown,
      vehicle: {
        ...vehicle,
        position: placement?.position ?? this.vehiclePosition(patrol.x),
        surfaceStatus: placement?.status ?? "grounded",
        direction: patrol.direction,
      },
    };
    return { respawned: false };
  }

  public tryBite(attempt: BiteAttempt): BiteResult | null {
    const vehicle = this.mutableState.vehicle;
    if (
      !vehicle.active ||
      this.mutableState.biteCooldown > 0 ||
      attempt.speed < this.tuning.minimumBiteSpeed ||
      distance(attempt.headPosition, vehicle.position) > this.tuning.vehicleContactRadius
    ) {
      return null;
    }

    const damage = (attempt.burstActive || attempt.speed >= this.tuning.heavyBiteSpeed ? 2 : 1) + (attempt.damageBonus ?? 0);
    const remainingHitPoints = Math.max(0, vehicle.hitPoints - damage);
    const devoured = remainingHitPoints === 0;
    this.mutableState = {
      ...this.mutableState,
      biomass: this.mutableState.biomass + (devoured ? 1 : 0),
      biteCooldown: this.tuning.biteCooldown * this.tuning.biteCooldownMultiplier,
      vehicle: devoured
        ? {
            ...vehicle,
            hitPoints: 0,
            active: false,
            respawnRemaining: this.tuning.respawnSeconds,
          }
        : { ...vehicle, hitPoints: remainingHitPoints },
    };
    return { damage, devoured, remainingHitPoints };
  }

  private createVehicle(x: number, direction: -1 | 1): BurrowVehicleState {
    return {
      position: this.vehiclePosition(x),
      direction,
      hitPoints: this.tuning.vehicleHitPoints,
      maximumHitPoints: this.tuning.vehicleHitPoints,
      active: true,
      respawnRemaining: 0,
      surfaceStatus: "grounded",
      kind: this.tuning.kind,
    };
  }

  private vehiclePosition(x: number): Point {
    return { x, y: this.route.surfaceYAt(x) - VEHICLE_HEIGHT_ABOVE_SURFACE };
  }
}

export const BURROW_HUNT_CONSTANTS = {
  vehicleSpeed: VEHICLE_SPEED,
  vehicleContactRadius: VEHICLE_CONTACT_RADIUS,
  minimumBiteSpeed: MINIMUM_BITE_SPEED,
  heavyBiteSpeed: HEAVY_BITE_SPEED,
  biteCooldown: BITE_COOLDOWN,
  respawnSeconds: RESPAWN_SECONDS,
  vehicleHitPoints: VEHICLE_HIT_POINTS,
} as const;

function advancePatrol(
  x: number,
  direction: -1 | 1,
  distanceToTravel: number,
  minimumX: number,
  maximumX: number,
): { readonly x: number; readonly direction: -1 | 1 } {
  let nextX = x + direction * distanceToTravel;
  let nextDirection = direction;
  while (nextX < minimumX || nextX > maximumX) {
    if (nextX > maximumX) {
      nextX = maximumX - (nextX - maximumX);
      nextDirection = -1;
    } else {
      nextX = minimumX + (minimumX - nextX);
      nextDirection = 1;
    }
  }
  return { x: nextX, direction: nextDirection };
}

function distance(first: Point, second: Point): number {
  return Math.hypot(first.x - second.x, first.y - second.y);
}
