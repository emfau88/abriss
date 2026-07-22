import {
  topUtilityReasons,
  type Personality,
  type UtilityReasonCode,
  type WeaponId,
} from "../ai/RocketActionPlanner";
import type { TeamId } from "../state/matchState";
import {
  activeSimulationUnit,
  type MatchSimulationState,
} from "./matchSimulationState";
import type { TurnPlan, TurnPlanKind } from "./planTurn";

/**
 * Zugdiagnose der Match-Engine (Task 022, Review-Phase A): ein
 * serialisierbarer Datensatz pro Zug, der erklärt, was die aktive Figur
 * erwogen und warum sie sich entschieden hat. Reine Ableitung aus Zustand
 * und TurnPlan – verändert nichts und ist deterministisch.
 */

export interface UtilityFactorDiagnostic {
  readonly code: UtilityReasonCode;
  readonly contribution: number;
}

export interface CandidateDiagnostic {
  readonly id: string;
  readonly weaponId: WeaponId;
  readonly targetId: string;
  readonly score: number;
  readonly rank: number | null;
  readonly valid: boolean;
  readonly invalidReason: string | null;
  readonly topPositive: UtilityFactorDiagnostic | null;
  readonly topNegative: UtilityFactorDiagnostic | null;
}

export interface WeaponAvailabilityDiagnostic {
  readonly weaponId: WeaponId;
  readonly candidates: number;
  readonly valid: number;
  readonly bestScore: number | null;
  readonly invalidReasons: Readonly<Record<string, number>>;
}

export interface TurnDiagnostic {
  readonly turnNumber: number;
  readonly activeUnitId: string;
  readonly team: TeamId;
  readonly personality: Personality;
  readonly turnSeed: number;
  readonly kind: TurnPlanKind;
  readonly forcedWeaponId: WeaponId | null;
  readonly usedPreferredWeaponId: WeaponId | null;
  readonly preferenceFellBack: boolean;
  readonly rejectedCandidateIds: readonly string[];
  readonly movement: {
    readonly id: string;
    readonly kind: string;
    readonly score: number;
    readonly destination: { readonly x: number; readonly y: number };
  };
  readonly selectedCandidateId: string | null;
  readonly candidateCount: number;
  readonly invalidCandidateCount: number;
  /** Bestplatzierte Kandidaten, absteigend nach Rang. */
  readonly rankedCandidates: readonly CandidateDiagnostic[];
  /** Verfügbarkeit und Scheiterngründe pro erwogener Waffe (Task 023). */
  readonly weaponAvailability: readonly WeaponAvailabilityDiagnostic[];
  /** Streukegel der Ausführung (Task 024); null ohne Waffenplan. */
  readonly execution: {
    readonly spreadRadius: number;
    readonly aimOffsetX: number;
    readonly aimOffsetY: number;
  } | null;
}

const RANKED_CANDIDATE_LIMIT = 5;

function roundScore(value: number): number {
  return Math.round(value * 10_000) / 10_000;
}

export function diagnoseTurn(
  state: MatchSimulationState,
  turnPlan: TurnPlan,
): TurnDiagnostic {
  const active = activeSimulationUnit(state);
  const rankById = new Map(
    turnPlan.action.rankedCandidates.map(
      (candidate, index) => [candidate.id, index + 1] as const,
    ),
  );
  const rankedCandidates = turnPlan.action.rankedCandidates
    .slice(0, RANKED_CANDIDATE_LIMIT)
    .map((candidate): CandidateDiagnostic => {
      const reasons = topUtilityReasons(candidate);

      return {
        id: candidate.id,
        weaponId: candidate.weaponId,
        targetId: candidate.targetId,
        score: roundScore(candidate.score),
        rank: rankById.get(candidate.id) ?? null,
        valid: candidate.valid,
        invalidReason: candidate.invalidReason,
        topPositive: reasons.positive
          ? {
              code: reasons.positive.code,
              contribution: roundScore(reasons.positive.contribution),
            }
          : null,
        topNegative: reasons.negative
          ? {
              code: reasons.negative.code,
              contribution: roundScore(reasons.negative.contribution),
            }
          : null,
      };
    });

  return {
    turnNumber: state.matchState.turnNumber,
    activeUnitId: active.id,
    team: active.team,
    personality: turnPlan.personality,
    turnSeed: turnPlan.turnSeed,
    kind: turnPlan.kind,
    forcedWeaponId: state.forcedWeaponId,
    usedPreferredWeaponId: turnPlan.usedPreferredWeaponId,
    preferenceFellBack: turnPlan.preferenceFellBack,
    rejectedCandidateIds: [...state.rejectedCandidateIds],
    movement: {
      id: turnPlan.movement.id,
      kind: turnPlan.movement.kind,
      score: roundScore(turnPlan.movement.score),
      destination: {
        x: Math.round(turnPlan.movement.destination.x),
        y: Math.round(turnPlan.movement.destination.y),
      },
    },
    selectedCandidateId: turnPlan.action.selected?.id ?? null,
    candidateCount: turnPlan.action.candidates.length,
    invalidCandidateCount: turnPlan.action.candidates.filter(
      (candidate) => !candidate.valid,
    ).length,
    rankedCandidates,
    weaponAvailability: summarizeWeaponAvailability(turnPlan),
    execution: turnPlan.execution
      ? {
          spreadRadius: turnPlan.execution.spreadRadius,
          aimOffsetX: roundScore(turnPlan.execution.aimOffset.x),
          aimOffsetY: roundScore(turnPlan.execution.aimOffset.y),
        }
      : null,
  };
}

function summarizeWeaponAvailability(
  turnPlan: TurnPlan,
): WeaponAvailabilityDiagnostic[] {
  const byWeapon = new Map<
    WeaponId,
    {
      candidates: number;
      valid: number;
      bestScore: number | null;
      invalidReasons: Record<string, number>;
    }
  >();

  for (const candidate of turnPlan.action.candidates) {
    let entry = byWeapon.get(candidate.weaponId);

    if (!entry) {
      entry = { candidates: 0, valid: 0, bestScore: null, invalidReasons: {} };
      byWeapon.set(candidate.weaponId, entry);
    }

    entry.candidates += 1;

    if (candidate.valid) {
      entry.valid += 1;
      const score = roundScore(candidate.score);
      entry.bestScore =
        entry.bestScore === null ? score : Math.max(entry.bestScore, score);
    } else if (candidate.invalidReason) {
      entry.invalidReasons[candidate.invalidReason] =
        (entry.invalidReasons[candidate.invalidReason] ?? 0) + 1;
    }
  }

  return [...byWeapon.entries()].map(([weaponId, entry]) => ({
    weaponId,
    ...entry,
  }));
}
