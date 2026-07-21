export type TeamId = "crew" | "rivals";

export interface CombatantState {
  readonly id: string;
  readonly team: TeamId;
  readonly hitPoints: number;
}

export interface MatchState {
  readonly seed: number;
  readonly turnNumber: number;
  readonly activeCombatantId: string;
  readonly turnOrder: readonly string[];
  readonly combatants: Readonly<Record<string, CombatantState>>;
}

export interface InitialMatchOptions {
  readonly seed: number;
  readonly combatants: readonly CombatantState[];
}

export type MatchOutcome = TeamId | "draw" | null;

export function createInitialMatchState(options: InitialMatchOptions): MatchState {
  if (!Number.isSafeInteger(options.seed)) {
    throw new Error("Match seed must be a safe integer.");
  }

  if (options.combatants.length === 0) {
    throw new Error("A match requires at least one combatant.");
  }

  const combatants: Record<string, CombatantState> = {};

  for (const combatant of options.combatants) {
    if (combatant.id.trim().length === 0) {
      throw new Error("Combatant ids must not be empty.");
    }

    if (combatants[combatant.id]) {
      throw new Error(`Duplicate combatant id: ${combatant.id}`);
    }

    if (!Number.isFinite(combatant.hitPoints) || combatant.hitPoints < 0) {
      throw new Error(`Invalid hit points for combatant: ${combatant.id}`);
    }

    combatants[combatant.id] = { ...combatant };
  }

  const turnOrder = options.combatants.map((combatant) => combatant.id);
  const firstActive = options.combatants.find(
    (combatant) => combatant.hitPoints > 0,
  );

  if (!firstActive) {
    throw new Error("A match requires at least one active combatant.");
  }

  return {
    seed: options.seed,
    turnNumber: 1,
    activeCombatantId: firstActive.id,
    turnOrder,
    combatants,
  };
}

export function advanceTurn(state: MatchState): MatchState {
  const currentIndex = state.turnOrder.indexOf(state.activeCombatantId);

  if (currentIndex < 0) {
    throw new Error("Active combatant is missing from the turn order.");
  }

  for (let offset = 1; offset <= state.turnOrder.length; offset += 1) {
    const nextIndex = (currentIndex + offset) % state.turnOrder.length;
    const candidateId = state.turnOrder[nextIndex];

    if (!candidateId) {
      continue;
    }

    const candidate = state.combatants[candidateId];

    if (candidate && candidate.hitPoints > 0) {
      return {
        ...state,
        turnNumber: state.turnNumber + 1,
        activeCombatantId: candidateId,
      };
    }
  }

  throw new Error("Cannot advance a match without active combatants.");
}

export function updateCombatantHitPoints(
  state: MatchState,
  combatantId: string,
  hitPoints: number,
): MatchState {
  if (!Number.isFinite(hitPoints) || hitPoints < 0) {
    throw new Error(`Invalid hit points for combatant: ${combatantId}`);
  }

  const combatant = state.combatants[combatantId];

  if (!combatant) {
    throw new Error(`Unknown combatant: ${combatantId}`);
  }

  return {
    ...state,
    combatants: {
      ...state.combatants,
      [combatantId]: { ...combatant, hitPoints },
    },
  };
}

export function determineMatchOutcome(state: MatchState): MatchOutcome {
  const livingTeams = new Set<TeamId>();

  for (const combatant of Object.values(state.combatants)) {
    if (combatant.hitPoints > 0) {
      livingTeams.add(combatant.team);
    }
  }

  if (livingTeams.size === 0) {
    return "draw";
  }

  if (livingTeams.size === 1) {
    return livingTeams.values().next().value ?? null;
  }

  return null;
}

export function upcomingLivingCombatants(
  state: MatchState,
  limit = state.turnOrder.length,
): readonly string[] {
  if (!Number.isSafeInteger(limit) || limit < 0) {
    throw new Error("Upcoming combatant limit must be a non-negative integer.");
  }

  const activeIndex = state.turnOrder.indexOf(state.activeCombatantId);

  if (activeIndex < 0) {
    throw new Error("Active combatant is missing from the turn order.");
  }

  const upcoming: string[] = [];
  for (
    let offset = 0;
    offset < state.turnOrder.length && upcoming.length < limit;
    offset += 1
  ) {
    const candidateId =
      state.turnOrder[(activeIndex + offset) % state.turnOrder.length];
    const candidate = candidateId
      ? state.combatants[candidateId]
      : undefined;

    if (candidateId && candidate && candidate.hitPoints > 0) {
      upcoming.push(candidateId);
    }
  }

  return upcoming;
}
