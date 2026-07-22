import {
  WEAPON_PROFILES,
  type RocketCandidate,
  type WeaponId,
} from "../ai/RocketActionPlanner";
import {
  simulateRocketTrajectory,
  type RocketTrajectoryInput,
  type Vector2,
} from "../ballistics/Ballistics";
import {
  activeSimulationUnit,
  type MatchSimulationState,
} from "./matchSimulationState";
import { turnSeedFor, type TurnPlan } from "./planTurn";

/**
 * Manueller Schuss (Task 011): Der Spieler zielt selbst per Maus. Aus der
 * gewählten Waffe und der Startgeschwindigkeit entsteht ein vollständiger
 * TurnPlan mit einem gültigen RocketCandidate, der danach durch dieselbe
 * resolveTurn-Maschinerie läuft wie ein KI-Zug – inklusive Streukegel,
 * Schaden, Rückstoß und Fallauflösung. Im ersten Wurf schießt der Spieler
 * vom Stand (keine manuelle Bewegung); die Ausführung bleibt deterministisch.
 */

export interface ManualShotInput {
  readonly weaponId: WeaponId;
  /** Startgeschwindigkeit des Projektils (aus Winkel × Kraft der Maus). */
  readonly launchVelocity: Vector2;
}

const LAUNCH_HEIGHT_OFFSET = 46;

export function planManualShot(
  state: MatchSimulationState,
  input: ManualShotInput,
): TurnPlan {
  const active = activeSimulationUnit(state);
  const weapon = WEAPON_PROFILES[input.weaponId];
  const turnSeed = turnSeedFor(state);
  const gravity = { x: 0, y: 510 } as const;
  const launchPosition = {
    x: active.position.x + Math.sign(input.launchVelocity.x || 1) * 18,
    y: active.position.y - LAUNCH_HEIGHT_OFFSET,
  };
  const trajectoryInput: RocketTrajectoryInput = {
    startPosition: launchPosition,
    startVelocity: input.launchVelocity,
    gravity,
    fixedStepSeconds: 1 / 60,
    maximumDurationSeconds: 6,
    explosionRadius: weapon.explosionRadius,
    ...(input.weaponId === "grenade"
      ? {
          collisionBehavior: "bounce" as const,
          fuseSeconds: 3,
          maximumBounces: 2,
          bounceRestitution: 0.34,
          surfaceFriction: 0.58,
        }
      : {}),
  };
  const trajectory = simulateRocketTrajectory(trajectoryInput, state.terrain);
  const candidate: RocketCandidate = {
    id: `manual:${input.weaponId}:${active.id}`,
    weaponId: weapon.id,
    weaponName: weapon.displayName,
    maximumDamage: weapon.maximumDamage,
    maximumKnockbackSpeed: weapon.maximumKnockbackSpeed,
    targetId: "manual",
    targetName: "SPIELERZIEL",
    flightTimeSeconds:
      trajectory.samples[trajectory.samples.length - 1]?.timeSeconds ?? 0,
    input: trajectoryInput,
    trajectory,
    valid: trajectory.explosion !== null,
    invalidReason: trajectory.explosion ? null : "Kein Einschlag",
    metrics: {
      enemyDamage: 0,
      targetDamage: 0,
      friendlyDamage: 0,
      selfDamage: 0,
      terrainEffect: 0,
      showmanship: 0,
      aimError: 0,
    },
    components: [],
    score: 0,
  };
  const action = {
    seed: turnSeed,
    personality: active.personality,
    candidates: [candidate],
    rankedCandidates: candidate.valid ? [candidate] : [],
    selected: candidate.valid ? candidate : null,
    rejectedCandidateIds: [],
  };
  const holdMovement = {
    id: "manual-hold",
    kind: "hold" as const,
    start: { ...active.position },
    destination: { ...active.position },
    samples: [{ ...active.position }],
    distance: 0,
    durationSeconds: 0,
    score: 0,
    reason: "zielt selbst",
  };

  return {
    activeUnitId: active.id,
    personality: active.personality,
    turnSeed,
    movement: holdMovement,
    action,
    kind: candidate.valid ? "attack" : "skip",
    usedPreferredWeaponId: null,
    preferenceFellBack: false,
    // Kein Streukegel bei manuellem Zielen: Der Spieler hat selbst gezielt,
    // ausgeführt wird exakt die anvisierte Flugbahn.
    execution: candidate.valid
      ? {
          spreadRadius: 0,
          aimOffset: { x: 0, y: 0 },
          trajectory,
        }
      : null,
  };
}
