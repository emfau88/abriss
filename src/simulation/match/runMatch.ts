import type { TeamId } from "../state/matchState";
import {
  serializeMatchSimulation,
  type MatchSimulationState,
} from "./matchSimulationState";
import { planTurn, type TurnPlanKind } from "./planTurn";
import { concludeTurn, resolveTurn, type MatchTurnEvent } from "./resolveTurn";

/**
 * Headless-Matchschleife: führt planTurn/resolveTurn/concludeTurn ohne
 * Browser bis zum Matchausgang aus – derselbe Code, den auch die Szene
 * konsumiert. Grundlage für Determinismus-, Eröffnungs- und Balancetests
 * (Task 021, Schritt 5).
 */

export interface MatchTurnRecord {
  readonly turnNumber: number;
  readonly activeUnitId: string;
  readonly planKind: TurnPlanKind;
  readonly selectedCandidateId: string | null;
  readonly events: readonly MatchTurnEvent[];
}

export interface MatchRunResult {
  readonly outcome: TeamId | "draw";
  readonly turnCount: number;
  readonly turns: readonly MatchTurnRecord[];
  readonly finalState: object;
}

export interface RunMatchOptions {
  /** Sicherheitsgrenze gegen endlose Matches; danach schlägt der Lauf fehl. */
  readonly maximumTurns?: number;
}

const DEFAULT_MAXIMUM_TURNS = 200;

export function runMatch(
  state: MatchSimulationState,
  options: RunMatchOptions = {},
): MatchRunResult {
  const maximumTurns = options.maximumTurns ?? DEFAULT_MAXIMUM_TURNS;
  const turns: MatchTurnRecord[] = [];

  for (let turnIndex = 0; turnIndex < maximumTurns; turnIndex += 1) {
    const turnNumber = state.matchState.turnNumber;
    const turnPlan = planTurn(state);
    const events = resolveTurn(state, turnPlan);
    turns.push({
      turnNumber,
      activeUnitId: turnPlan.activeUnitId,
      planKind: turnPlan.kind,
      selectedCandidateId: turnPlan.action.selected?.id ?? null,
      events,
    });

    const conclusion = concludeTurn(state);

    if (conclusion.kind === "match-ended") {
      return {
        outcome: conclusion.outcome,
        turnCount: turns.length,
        turns,
        finalState: serializeMatchSimulation(state),
      };
    }
  }

  throw new Error(
    `Match did not finish within ${maximumTurns} turns (seed ${state.seed}).`,
  );
}
