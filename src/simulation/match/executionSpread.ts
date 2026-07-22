import {
  type Personality,
  type RocketCandidate,
  type WeaponId,
} from "../ai/RocketActionPlanner";
import {
  simulateRocketTrajectory,
  type RocketTrajectoryResult,
  type Vector2,
} from "../ballistics/Ballistics";
import { keyedSignedVariation } from "../random/SeededRandom";
import type { BinaryTerrainMask } from "../terrain/TerrainMask";

/**
 * Streukegel der Ausführung (Task 024): Die Figur kündigt ihren Plan samt
 * ehrlicher Streuung an; die tatsächliche Ausführung ist EIN deterministisch
 * geseedetes Sample aus diesem Kegel und steht bereits zur Planungszeit
 * fest. D-011 bleibt gewahrt: Vorschau und Wiedergabe der ausgeführten
 * Flugbahn nutzen dasselbe unveränderliche Trajektorienresultat; neu ist
 * nur, dass Absicht und Ausführung ehrlich getrennt angekündigt werden.
 */

export interface PlannedExecution {
  /** Angekündigter Streuradius in Weltpunkten. */
  readonly spreadRadius: number;
  /** Deterministisch gesampelte Abweichung des Zielpunkts. */
  readonly aimOffset: Vector2;
  /** Die tatsächlich auszuführende Flugbahn. */
  readonly trajectory: RocketTrajectoryResult;
}

const PERSONALITY_SPREAD: Record<Personality, number> = {
  cautious: 9,
  explosive: 22,
  showboat: 16,
};

// Task 024: Der Streufaktor ist bewusst waffenneutral. Ein je Waffe
// unterschiedlicher Faktor verzerrt die Balance, weil die KI die Streuung
// nicht in die Kandidatenbewertung einrechnet (sie plant auf die perfekte
// Vorschau). Gleiche Faktoren halten die Waffenwahl aus Task 023 stabil und
// liefern trotzdem den sichtbaren Ausführungs-Wobble.
const WEAPON_SPREAD_FACTOR: Record<WeaponId, number> = {
  rocket: 1,
  grenade: 1,
  breaker: 1,
};

export function executionSpreadRadius(
  personality: Personality,
  weaponId: WeaponId,
): number {
  return Math.round(
    PERSONALITY_SPREAD[personality] * WEAPON_SPREAD_FACTOR[weaponId],
  );
}

export function planExecution(
  terrain: BinaryTerrainMask,
  candidate: RocketCandidate,
  personality: Personality,
  turnSeed: number,
): PlannedExecution {
  const spreadRadius = executionSpreadRadius(personality, candidate.weaponId);
  const aimOffset = {
    x:
      keyedSignedVariation(turnSeed, `spread:${candidate.id}:x`) * spreadRadius,
    y:
      keyedSignedVariation(turnSeed, `spread:${candidate.id}:y`) *
      spreadRadius *
      0.5,
  };
  const input = candidate.input;
  const flightTime = candidate.flightTimeSeconds;
  const gravity = input.gravity;
  // Der geplante Ankunftspunkt ergibt sich aus Startpunkt, Startgeschwindig-
  // keit und Flugzeit; die Ausführung zielt auf denselben Punkt plus Streuung.
  const intendedArrival = {
    x:
      input.startPosition.x +
      input.startVelocity.x * flightTime +
      0.5 * gravity.x * flightTime * flightTime,
    y:
      input.startPosition.y +
      input.startVelocity.y * flightTime +
      0.5 * gravity.y * flightTime * flightTime,
  };
  const executedTarget = {
    x: intendedArrival.x + aimOffset.x,
    y: intendedArrival.y + aimOffset.y,
  };
  const executedInput = {
    ...input,
    startVelocity: {
      x:
        (executedTarget.x -
          input.startPosition.x -
          0.5 * gravity.x * flightTime * flightTime) /
        flightTime,
      y:
        (executedTarget.y -
          input.startPosition.y -
          0.5 * gravity.y * flightTime * flightTime) /
        flightTime,
    },
  };

  return {
    spreadRadius,
    aimOffset,
    trajectory: simulateRocketTrajectory(executedInput, terrain),
  };
}
