import { type Personality, type RocketCandidate } from "../ai/RocketActionPlanner";
import { executionSpreadRadius } from "../ai/executionSpreadModel";
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
 * nur, dass Absicht und Ausführung ehrlich getrennt angekündigt werden. Der
 * Streuradius stammt seit Task 026 aus dem geteilten Modell in
 * `ai/executionSpreadModel.ts`, damit auch die KI ihn einplanen kann.
 */

export interface PlannedExecution {
  /** Angekündigter Streuradius in Weltpunkten. */
  readonly spreadRadius: number;
  /** Deterministisch gesampelte Abweichung des Zielpunkts. */
  readonly aimOffset: Vector2;
  /** Die tatsächlich auszuführende Flugbahn. */
  readonly trajectory: RocketTrajectoryResult;
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
