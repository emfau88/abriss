import {
  simulateRocketTrajectory,
  type BallisticTerrain,
  type RocketTrajectoryInput,
  type RocketTrajectoryResult,
  type Vector2,
} from "../ballistics/Ballistics";
import {
  resolveReactionChain,
  type ChainExplosion,
  type InteractableObject,
} from "../interactables/interactables";
import { keyedSignedVariation } from "../random/SeededRandom";
import {
  expectedSpreadDamageLoss,
  perceivedSpreadRadius,
} from "./executionSpreadModel";

export type Personality = "cautious" | "explosive" | "showboat";
export type WeaponId = "rocket" | "grenade" | "breaker";

export interface WeaponProfile {
  readonly id: WeaponId;
  readonly displayName: string;
  readonly flightTimesSeconds: readonly number[];
  readonly explosionRadius: number;
  readonly maximumDamage: number;
  readonly maximumKnockbackSpeed: number;
}

export const WEAPON_PROFILES: Readonly<Record<WeaponId, WeaponProfile>> = {
  rocket: {
    id: "rocket",
    displayName: "PANZERFAUST",
    // Task 023: steile Zusatzbögen überwinden Terrain-Deckung, an der
    // die flachen Bögen zuvor in ~70 % der Züge scheiterten.
    flightTimesSeconds: [1.6, 1.8, 2.0, 2.5],
    explosionRadius: 62,
    maximumDamage: 100,
    maximumKnockbackSpeed: 430,
  },
  grenade: {
    id: "grenade",
    displayName: "WURFGRANATE",
    flightTimesSeconds: [2.25, 2.55, 2.85, 3.4],
    // Task 023: Radius auf Raketen-Niveau und höherer Maximalschaden als
    // Ausgleich für die schwerer kontrollierbare Abpraller-Flugbahn – die
    // Granaten-Identität sind Abpraller und Zeitzünder.
    explosionRadius: 62,
    maximumDamage: 96,
    maximumKnockbackSpeed: 390,
  },
  breaker: {
    id: "breaker",
    displayName: "GELÄNDEBRECHER",
    flightTimesSeconds: [1.7, 2.0, 2.3],
    explosionRadius: 82,
    maximumDamage: 70,
    maximumKnockbackSpeed: 480,
  },
};

export interface PlannerUnit {
  readonly id: string;
  readonly displayName: string;
  readonly team: string;
  readonly position: Vector2;
  readonly hitPoints: number;
}

export interface RocketPlannerTerrain extends BallisticTerrain {
  isSolidCell(cellX: number, cellY: number): boolean;
}

export interface RocketCandidateMetrics {
  readonly enemyDamage: number;
  readonly targetDamage: number;
  readonly friendlyDamage: number;
  readonly selfDamage: number;
  readonly terrainEffect: number;
  readonly showmanship: number;
  readonly aimError: number;
  /**
   * Task 028: Erwarteter Zusatzschaden an Gegnern durch ausgelöste Fässer
   * (Reaktionskette). 0, wenn kein Fass in Reichweite des Einschlags liegt.
   */
  readonly chainEffect: number;
}

export type UtilityReasonCode =
  | "enemy-effect"
  | "friendly-risk"
  | "self-risk"
  | "demolition"
  | "showmanship"
  | "aim-error"
  | "chain-effect"
  | "seed-variation";

export interface UtilityComponent {
  readonly code: UtilityReasonCode;
  readonly label: string;
  readonly rawValue: number;
  readonly weight: number;
  readonly contribution: number;
}

export interface RocketCandidate {
  readonly id: string;
  readonly weaponId: WeaponId;
  readonly weaponName: string;
  readonly maximumDamage: number;
  readonly maximumKnockbackSpeed: number;
  readonly targetId: string;
  readonly targetName: string;
  readonly flightTimeSeconds: number;
  readonly input: RocketTrajectoryInput;
  readonly trajectory: RocketTrajectoryResult;
  readonly valid: boolean;
  readonly invalidReason: string | null;
  readonly metrics: RocketCandidateMetrics;
  readonly components: readonly UtilityComponent[];
  readonly score: number;
}

export interface RocketActionPlan {
  readonly seed: number;
  readonly personality: Personality;
  readonly candidates: readonly RocketCandidate[];
  readonly rankedCandidates: readonly RocketCandidate[];
  readonly selected: RocketCandidate | null;
  readonly rejectedCandidateIds: readonly string[];
}

export interface RocketPlannerInput {
  readonly terrain: RocketPlannerTerrain;
  readonly units: readonly PlannerUnit[];
  readonly activeUnitId: string;
  readonly personality: Personality;
  readonly seed: number;
  readonly rejectedCandidateIds?: readonly string[];
  readonly candidateFlightTimesSeconds?: readonly number[];
  readonly gravity?: Vector2;
  readonly fixedStepSeconds?: number;
  readonly maximumDurationSeconds?: number;
  readonly explosionRadius?: number;
  readonly weaponIds?: readonly WeaponId[];
  /**
   * Task 028: Interaktive Objekte (Fässer). Wenn gesetzt, erzeugt der Planner
   * zusätzlich Kandidaten, die auf Fässer in Gegnernähe zielen, und bewertet
   * deren Kettenschaden.
   */
  readonly interactables?: readonly InteractableObject[];
}

interface PersonalityWeights {
  readonly enemyEffect: number;
  readonly friendlyRisk: number;
  readonly selfRisk: number;
  readonly demolition: number;
  readonly showmanship: number;
  readonly aimError: number;
  /** Task 028: Gewicht des erwarteten Kettenschadens durch Fässer. */
  readonly chainEffect: number;
}

const PERSONALITY_WEIGHTS: Record<Personality, PersonalityWeights> = {
  cautious: {
    enemyEffect: 1,
    friendlyRisk: -2.2,
    selfRisk: -2.8,
    demolition: 0.08,
    showmanship: -0.1,
    aimError: -0.22,
    // Vorsichtig nutzt Ketten nüchtern: als Wirkung willkommen, aber ohne
    // Begeisterung – das Kettenrisiko in Kameradennähe wiegt über die
    // Risiko-Komponenten ohnehin schwer.
    chainEffect: 0.9,
  },
  explosive: {
    enemyEffect: 0.9,
    friendlyRisk: -0.9,
    selfRisk: -1.2,
    demolition: 0.62,
    showmanship: 0.1,
    aimError: -0.15,
    // Sprengfreudig liebt Ketten – höchstes Gewicht.
    chainEffect: 1.35,
  },
  showboat: {
    enemyEffect: 0.8,
    friendlyRisk: -1.15,
    selfRisk: -1.35,
    demolition: 0.12,
    showmanship: 0.9,
    aimError: -0.18,
    // Angeberisch findet die Kette spektakulär und bewertet sie überdurchschnittlich.
    chainEffect: 1.15,
  },
};

/**
 * Task 024: Persönlichkeits-Blindflecken. Persönlichkeiten nehmen einzelne
 * Metriken systematisch verzerrt wahr – Explosiv redet Risiken klein,
 * Vorsichtig übertreibt sie, Showboat überschätzt den Showfaktor. Die
 * Verzerrung fließt in die Bewertung ein und ist in den Komponenten (und
 * damit in Diagnose und Intent-Panel) sichtbar.
 */
export interface PersonalityPerception {
  readonly selfRisk: number;
  readonly friendlyRisk: number;
  readonly showmanship: number;
  readonly aimError: number;
}

export const PERSONALITY_PERCEPTION: Record<Personality, PersonalityPerception> = {
  // Task 026: Die Streuungs-Wahrnehmung liegt jetzt im geteilten Streumodell
  // (perceivedSpreadRadius); der aimError-Faktor bleibt neutral, damit die
  // Streuung nicht doppelt gewichtet wird.
  cautious: { selfRisk: 1.45, friendlyRisk: 1.3, showmanship: 1, aimError: 1 },
  explosive: { selfRisk: 0.4, friendlyRisk: 0.55, showmanship: 1, aimError: 1 },
  showboat: { selfRisk: 0.8, friendlyRisk: 0.85, showmanship: 1.75, aimError: 1 },
};

export const PERSONALITY_PERCEPTION_NOTES: Record<Personality, string> = {
  cautious: "übertreibt Eigen- und Teamrisiko",
  explosive: "unterschätzt Eigen- und Teamrisiko deutlich",
  showboat: "überschätzt den Showfaktor",
};

const REASON_LABELS: Record<UtilityReasonCode, string> = {
  "enemy-effect": "Trefferwirkung",
  "friendly-risk": "Kameradenrisiko",
  "self-risk": "Eigenrisiko",
  demolition: "Geländewirkung",
  showmanship: "Showfaktor",
  "aim-error": "Zielabweichung",
  "chain-effect": "Kettenwirkung",
  "seed-variation": "Spontaneität",
};

const DEFAULT_GRAVITY = { x: 0, y: 510 } as const;
const MINIMUM_TARGET_DAMAGE = 8;
const VARIATION_MAGNITUDE = 1.25;

export function planRocketAction(input: RocketPlannerInput): RocketActionPlan {
  validatePlannerInput(input);

  const activeUnit = input.units.find((unit) => unit.id === input.activeUnitId);

  if (!activeUnit) {
    throw new Error(`Unknown active unit: ${input.activeUnitId}`);
  }

  const targets = input.units.filter(
    (unit) => unit.team !== activeUnit.team && unit.hitPoints > 0,
  );
  const gravity = input.gravity ?? DEFAULT_GRAVITY;
  const weaponIds = input.weaponIds ?? ["rocket"];
  const rejected = new Set(input.rejectedCandidateIds ?? []);
  const barrels = (input.interactables ?? []).filter(
    (object) => object.type === "explosive-barrel" && object.state === "intact",
  );
  const aimTargets = buildAimTargets(targets, barrels);
  const candidates: RocketCandidate[] = [];

  for (const aimTarget of aimTargets) {
    const target = aimTarget.referenceEnemy;
    for (const weaponId of weaponIds) {
      const weapon = WEAPON_PROFILES[weaponId];
      const baseFlightTimes =
        weaponId === "rocket" && input.candidateFlightTimesSeconds
          ? input.candidateFlightTimesSeconds
          : weapon.flightTimesSeconds;
      // Task 024: Showboat erwägt pro Waffe zusätzlich einen besonders
      // hohen Showbogen – eigene Optionsmenge statt nur anderer Gewichte.
      const flightTimes =
        input.personality === "showboat"
          ? [...baseFlightTimes, Math.max(...baseFlightTimes) + 0.6]
          : baseFlightTimes;
      const explosionRadius =
        weaponId === "rocket" && input.explosionRadius
          ? input.explosionRadius
          : weapon.explosionRadius;

      // Task 028: Der Zielbasis-Punkt ist entweder der Gegner selbst oder ein
      // Fass in Gegnernähe (dann läuft die Wirkung über die Kette).
      const aimBase = aimTarget.aimBase;
      // Task 023: Granaten zielen zusätzlich bewusst kurz, damit die
      // Abpraller zum Ziel rollen statt darüber hinaus.
      const aimSign = Math.sign(aimBase.x - activeUnit.position.x) || 1;
      const aimOffsets: readonly number[] =
        weaponId === "grenade" ? [0, -110 * aimSign] : [0];

      for (let index = 0; index < flightTimes.length; index += 1) {
        const flightTime = flightTimes[index];

        if (flightTime === undefined || flightTime <= 0) {
          throw new Error("Candidate flight times must be positive.");
        }

        for (const aimOffset of aimOffsets) {
        const id =
          `${weapon.id}:${aimTarget.idKey}:arc-${index + 1}` +
          (aimOffset !== 0 ? ":kurz" : "");
        const aimPoint = {
          x: aimBase.x + aimOffset,
          y: aimBase.y,
        };
        const launchPosition = {
          x: activeUnit.position.x + aimSign * 18,
          y: activeUnit.position.y - 46,
        };
        const trajectoryInput: RocketTrajectoryInput = {
          startPosition: launchPosition,
          startVelocity: velocityForArrival(
            launchPosition,
            aimPoint,
            gravity,
            flightTime,
          ),
          gravity,
          fixedStepSeconds: input.fixedStepSeconds ?? 1 / 60,
          maximumDurationSeconds:
            input.maximumDurationSeconds ?? Math.max(4, flightTime + 1.1),
          explosionRadius,
          ...(weaponId === "grenade"
            ? {
                collisionBehavior: "bounce" as const,
                // Task 023: kürzerer Zünder und stumpferer Abpraller halten
                // die Explosion näher am Zielpunkt; zuvor war die Granate
                // nur in ~15 % der Züge überhaupt gültig.
                fuseSeconds: flightTime + 0.35,
                maximumBounces: 2,
                bounceRestitution: 0.34,
                surfaceFriction: 0.58,
              }
            : {}),
        };
        const trajectory = simulateRocketTrajectory(
          trajectoryInput,
          input.terrain,
        );
        // Task 026: erwarteter Streuverlust aus der wahrgenommenen Streuung
        // dieser Persönlichkeit und dem Explosionsradius der Waffe.
        const perceivedSpread = perceivedSpreadRadius(
          input.personality,
          weapon.id,
        );
        const spreadDamageFactor =
          1 - expectedSpreadDamageLoss(perceivedSpread, explosionRadius);
        const metrics = measureCandidate(
          trajectory,
          target,
          activeUnit,
          input.units,
          input.terrain,
          explosionRadius,
          weapon.maximumDamage,
          spreadDamageFactor,
          barrels,
          aimBase,
        );
        const invalidReason = candidateInvalidReason(
          trajectory,
          metrics,
          weapon.id,
          aimTarget.isBarrel,
        );
        // Task 023: Geländewirkung zählt nur als Fallback-Nutzen, wenn der
        // Kandidat selbst keinen wirksamen Schadensschuss darstellt (D-020).
        // Task 028: Ein wirksamer Kettenschuss (Fass) zählt hier ebenfalls als
        // „wirksam", damit ein Fass-Schuss keine zusätzliche Geländegutschrift
        // erhält.
        const effectiveDirectDamage = Math.max(
          metrics.targetDamage,
          metrics.chainEffect,
        );
        const scoringMetrics =
          effectiveDirectDamage >= MINIMUM_TARGET_DAMAGE
            ? { ...metrics, terrainEffect: 0 }
            : metrics;
        const components = scoreRocketMetrics(
          scoringMetrics,
          input.personality,
          keyedSignedVariation(input.seed, id) * VARIATION_MAGNITUDE,
        );

        candidates.push({
          id,
          weaponId: weapon.id,
          weaponName: weapon.displayName,
          maximumDamage: weapon.maximumDamage,
          maximumKnockbackSpeed: weapon.maximumKnockbackSpeed,
          targetId: aimTarget.isBarrel ? aimTarget.idKey : target.id,
          targetName: aimTarget.isBarrel
            ? `FASS (→ ${target.displayName})`
            : target.displayName,
          flightTimeSeconds: flightTime,
          input: trajectoryInput,
          trajectory,
          valid: invalidReason === null,
          invalidReason,
          metrics,
          components,
          score: sumContributions(components),
        });
        }
      }
    }
  }

  const rankedCandidates = candidates
    .filter((candidate) => candidate.valid && !rejected.has(candidate.id))
    .sort(compareCandidates);

  return {
    seed: input.seed,
    personality: input.personality,
    candidates,
    rankedCandidates,
    selected: rankedCandidates[0] ?? null,
    rejectedCandidateIds: [...rejected],
  };
}

export function scoreRocketMetrics(
  metrics: RocketCandidateMetrics,
  personality: Personality,
  seedVariation = 0,
): readonly UtilityComponent[] {
  const weights = PERSONALITY_WEIGHTS[personality];
  const perception = PERSONALITY_PERCEPTION[personality];
  const values: readonly [UtilityReasonCode, number, number][] = [
    ["enemy-effect", metrics.enemyDamage, weights.enemyEffect],
    [
      "friendly-risk",
      metrics.friendlyDamage * perception.friendlyRisk,
      weights.friendlyRisk,
    ],
    ["self-risk", metrics.selfDamage * perception.selfRisk, weights.selfRisk],
    ["demolition", metrics.terrainEffect, weights.demolition],
    [
      "showmanship",
      metrics.showmanship * perception.showmanship,
      weights.showmanship,
    ],
    ["aim-error", metrics.aimError * perception.aimError, weights.aimError],
    ["chain-effect", metrics.chainEffect, weights.chainEffect],
    ["seed-variation", 1, seedVariation],
  ];

  return values.map(([code, rawValue, weight]) => ({
    code,
    label: REASON_LABELS[code],
    rawValue,
    weight,
    contribution: rawValue * weight,
  }));
}

export function topUtilityReasons(
  candidate: RocketCandidate,
): { positive: UtilityComponent | null; negative: UtilityComponent | null } {
  const meaningful = candidate.components.filter(
    (component) => component.code !== "seed-variation",
  );
  const positive = meaningful
    .filter((component) => component.weight > 0)
    .sort((left, right) => right.contribution - left.contribution)[0] ?? null;
  const negative = meaningful
    .filter((component) => component.weight < 0)
    .sort((left, right) => left.contribution - right.contribution)[0] ?? null;

  return { positive, negative };
}

/** Ein Zielpunkt der Kandidatenerzeugung: entweder ein Gegner oder ein Fass. */
interface AimTarget {
  /** ID-Fragment für stabile, eindeutige Kandidaten-IDs. */
  readonly idKey: string;
  /** Punkt, auf den gezielt wird (Gegner- oder Fassposition). */
  readonly aimBase: Vector2;
  /** Gegner, auf den sich Schaden/Zielabweichung beziehen. */
  readonly referenceEnemy: PlannerUnit;
  readonly isBarrel: boolean;
}

/**
 * Task 028: Nur Fässer „in Gegnernähe" sind lohnende Zielpunkte – ein Fass weit
 * weg von jedem Gegner würde die Kandidatenmenge nur aufblähen. Ein Fass gilt
 * als relevant, wenn ein Gegner innerhalb dieses Radius steht (etwas mehr als
 * der Fass-Explosionsradius, damit auch knappe Ketten erwogen werden).
 */
const BARREL_RELEVANCE_RADIUS = 150;

function buildAimTargets(
  enemies: readonly PlannerUnit[],
  barrels: readonly InteractableObject[],
): readonly AimTarget[] {
  const aimTargets: AimTarget[] = [];

  for (const enemy of enemies) {
    aimTargets.push({
      idKey: enemy.id,
      aimBase: enemy.position,
      referenceEnemy: enemy,
      isBarrel: false,
    });
  }

  for (const barrel of barrels) {
    let nearest: PlannerUnit | undefined;
    let nearestDistance = Number.POSITIVE_INFINITY;

    for (const enemy of enemies) {
      const distance = Math.hypot(
        barrel.position.x - enemy.position.x,
        barrel.position.y - enemy.position.y,
      );
      if (distance < nearestDistance) {
        nearest = enemy;
        nearestDistance = distance;
      }
    }

    if (nearest && nearestDistance <= BARREL_RELEVANCE_RADIUS) {
      aimTargets.push({
        idKey: `barrel-${barrel.id}`,
        aimBase: barrel.position,
        referenceEnemy: nearest,
        isBarrel: true,
      });
    }
  }

  return aimTargets;
}

function velocityForArrival(
  start: Vector2,
  destination: Vector2,
  gravity: Vector2,
  durationSeconds: number,
): Vector2 {
  return {
    x:
      (destination.x - start.x -
        0.5 * gravity.x * durationSeconds * durationSeconds) /
      durationSeconds,
    y:
      (destination.y - start.y -
        0.5 * gravity.y * durationSeconds * durationSeconds) /
      durationSeconds,
  };
}

function measureCandidate(
  trajectory: RocketTrajectoryResult,
  target: PlannerUnit,
  activeUnit: PlannerUnit,
  units: readonly PlannerUnit[],
  terrain: RocketPlannerTerrain,
  explosionRadius: number,
  maximumDamage: number,
  spreadDamageFactor: number,
  barrels: readonly InteractableObject[],
  aimReference: Vector2,
): RocketCandidateMetrics {
  const center = trajectory.explosion?.center;

  if (!center) {
    return {
      enemyDamage: 0,
      targetDamage: 0,
      friendlyDamage: 0,
      selfDamage: 0,
      terrainEffect: 0,
      showmanship: trajectory.samples.length,
      aimError: terrain.worldWidth,
      chainEffect: 0,
    };
  }

  // Task 028: Die Fass-Kette hängt nur vom Einschlag (center/radius) und den
  // Fässern ab – einmal pro Kandidat auflösen, nicht je Gegner.
  const chainExplosions =
    barrels.length > 0
      ? resolveReactionChain({
          trigger: { center, radius: explosionRadius },
          interactables: barrels,
        }).explosions
      : [];

  let enemyDamage = 0;
  let targetDamage = 0;
  let friendlyDamage = 0;
  let selfDamage = 0;
  let chainEffect = 0;

  for (const unit of units) {
    if (unit.hitPoints <= 0) {
      continue;
    }

    // Task 026: Der erwartete Schaden wird um den Streuverlust gedämpft.
    // Kurzreichweitige Waffen (kleiner Radius) verlieren dabei anteilig
    // mehr, sodass die KI die Streuung realistisch einplant.
    const damage =
      calculateBlastDamage(center, unit.position, explosionRadius, maximumDamage) *
      spreadDamageFactor;

    if (unit.id === target.id) {
      targetDamage = damage;
    }

    if (unit.team !== activeUnit.team) {
      enemyDamage += damage;
      // Task 028: Kettenschaden dieser (bereits aufgelösten) Fass-Explosionen
      // an Gegnern – im selben Durchlauf, ohne zweite Gegnerschleife.
      chainEffect +=
        chainDamageToPoint(chainExplosions, unit.position) * spreadDamageFactor;
    } else if (unit.id === activeUnit.id) {
      selfDamage += damage;
    } else {
      friendlyDamage += damage;
    }
  }

  const lastSample = trajectory.samples[trajectory.samples.length - 1];
  const maximumArcHeight = trajectory.samples.reduce(
    (minimumY, sample) => Math.min(minimumY, sample.position.y),
    activeUnit.position.y,
  );
  const arcRise = Math.max(0, activeUnit.position.y - maximumArcHeight);
  const duration = lastSample?.timeSeconds ?? 0;

  return {
    enemyDamage,
    targetDamage,
    friendlyDamage,
    selfDamage,
    terrainEffect: estimateTerrainEffect(center, explosionRadius, terrain),
    showmanship: Math.min(100, duration * 26 + arcRise * 0.16),
    // Task 028: Zielgenauigkeit relativ zu dem, worauf tatsächlich gezielt
    // wird (Fass oder Gegner), nicht immer zum Gegner.
    aimError: Math.hypot(center.x - aimReference.x, center.y - aimReference.y),
    chainEffect,
  };
}

/**
 * Task 028: Summiert den Explosionsschaden bereits aufgelöster Fass-Detonationen
 * an einem Punkt. Nutzt dieselbe Falloff-Formel wie die tatsächliche Auflösung
 * (`calculateBlastDamage`), damit KI-Vorschau und Ausführung im Gleichschritt
 * bleiben.
 */
function chainDamageToPoint(
  explosions: readonly ChainExplosion[],
  point: Vector2,
): number {
  let total = 0;
  for (const explosion of explosions) {
    total += calculateBlastDamage(
      explosion.center,
      point,
      explosion.radius,
      explosion.maximumDamage,
    );
  }
  return total;
}

export function calculateBlastDamage(
  center: Vector2,
  unitPosition: Vector2,
  radius: number,
  maximumDamage = 100,
): number {
  const distance = Math.hypot(
    center.x - unitPosition.x,
    center.y - unitPosition.y,
  );
  return Math.max(0, maximumDamage * (1 - distance / radius));
}

function estimateTerrainEffect(
  center: Vector2,
  radius: number,
  terrain: RocketPlannerTerrain,
): number {
  const minimumCellX = Math.max(0, Math.floor((center.x - radius) / terrain.cellSize));
  const maximumCellX = Math.min(
    Math.ceil(terrain.worldWidth / terrain.cellSize) - 1,
    Math.floor((center.x + radius) / terrain.cellSize),
  );
  const minimumCellY = Math.max(0, Math.floor((center.y - radius) / terrain.cellSize));
  const maximumCellY = Math.min(
    Math.ceil(terrain.worldHeight / terrain.cellSize) - 1,
    Math.floor((center.y + radius) / terrain.cellSize),
  );
  let solidCells = 0;

  for (let cellY = minimumCellY; cellY <= maximumCellY; cellY += 1) {
    const worldY = (cellY + 0.5) * terrain.cellSize;
    const deltaY = worldY - center.y;

    for (let cellX = minimumCellX; cellX <= maximumCellX; cellX += 1) {
      if (!terrain.isSolidCell(cellX, cellY)) {
        continue;
      }

      const worldX = (cellX + 0.5) * terrain.cellSize;
      const deltaX = worldX - center.x;

      if (deltaX * deltaX + deltaY * deltaY <= radius * radius) {
        solidCells += 1;
      }
    }
  }

  const area = solidCells * terrain.cellSize * terrain.cellSize;
  return Math.min(100, (area / (Math.PI * radius * radius)) * 100);
}

function candidateInvalidReason(
  trajectory: RocketTrajectoryResult,
  metrics: RocketCandidateMetrics,
  weaponId: WeaponId,
  isBarrelShot: boolean,
): string | null {
  const expectedImpact =
    trajectory.outcome === "terrain-impact" ||
    (weaponId === "grenade" && trajectory.outcome === "fuse-expired");

  if (!expectedImpact) {
    return trajectory.outcome === "out-of-bounds"
      ? "Flugbahn verlässt das Einsatzgebiet"
      : "Flugbahn endet ohne Einschlag";
  }

  if (metrics.targetDamage < MINIMUM_TARGET_DAMAGE) {
    // Task 028: Ein Schuss auf ein Fass ist gültig, wenn die ausgelöste Kette
    // nennenswerten Gegnerschaden erwarten lässt – auch ohne Direkttreffer.
    if (isBarrelShot && metrics.chainEffect >= MINIMUM_TARGET_DAMAGE) {
      return null;
    }
    // Task 023: Die Fallback-Ausnahme des Geländebrechers verlangt jetzt
    // nennenswerte Terrainwirkung statt beliebiger Kratzer – zuvor war er
    // dadurch in praktisch jedem Zug die gültige Standardwahl.
    if (weaponId === "breaker" && metrics.terrainEffect >= 45) {
      return null;
    }
    return "Ziel liegt außerhalb wirksamer Reichweite";
  }

  return null;
}

function sumContributions(components: readonly UtilityComponent[]): number {
  return components.reduce(
    (total, component) => total + component.contribution,
    0,
  );
}

function compareCandidates(left: RocketCandidate, right: RocketCandidate): number {
  const scoreDifference = right.score - left.score;

  if (Math.abs(scoreDifference) > 1e-9) {
    return scoreDifference;
  }

  return left.id.localeCompare(right.id);
}

function validatePlannerInput(input: RocketPlannerInput): void {
  if (!Number.isSafeInteger(input.seed)) {
    throw new Error("Rocket planning requires an integer seed.");
  }

  const ids = new Set<string>();

  for (const unit of input.units) {
    if (ids.has(unit.id)) {
      throw new Error(`Duplicate unit id: ${unit.id}`);
    }

    ids.add(unit.id);
  }
}
