export type ActionMapPlanId = "risky-chain" | "controlled-push";
export type ActionMapPhase = "planning" | "executing" | "complete";
export type SignState = "upright" | "falling" | "fallen";
export type CartState = "braked" | "rolling" | "stopped";
export type ThrusterState = "idle" | "firing" | "spent";

export interface ActionMapLabState {
  readonly planId: ActionMapPlanId;
  readonly phase: ActionMapPhase;
  readonly sign: SignState;
  readonly cart: CartState;
  readonly thruster: ThrusterState;
  readonly mokiSafe: boolean;
  readonly mokiBlasted: boolean;
}

export type ActionMapEventType =
  | "sign-falling"
  | "sign-landed"
  | "cart-rolling"
  | "cart-stopped"
  | "moki-evaded"
  | "thruster-fired"
  | "moki-blasted"
  | "thruster-spent"
  | "sequence-complete";

export interface ScheduledActionMapEvent {
  readonly atMilliseconds: number;
  readonly type: ActionMapEventType;
}

export interface ActionMapPlan {
  readonly id: ActionMapPlanId;
  readonly title: string;
  readonly summary: string;
  readonly reason: string;
  readonly risk: string;
  readonly events: readonly ScheduledActionMapEvent[];
}

const RISKY_CHAIN_EVENTS: readonly ScheduledActionMapEvent[] = [
  { atMilliseconds: 0, type: "sign-falling" },
  { atMilliseconds: 520, type: "sign-landed" },
  { atMilliseconds: 600, type: "cart-rolling" },
  { atMilliseconds: 1_300, type: "cart-stopped" },
  { atMilliseconds: 1_420, type: "thruster-fired" },
  { atMilliseconds: 1_560, type: "moki-blasted" },
  { atMilliseconds: 2_200, type: "thruster-spent" },
  { atMilliseconds: 2_450, type: "sequence-complete" },
] as const;

const CONTROLLED_PUSH_EVENTS: readonly ScheduledActionMapEvent[] = [
  { atMilliseconds: 0, type: "moki-evaded" },
  { atMilliseconds: 320, type: "cart-rolling" },
  { atMilliseconds: 1_020, type: "cart-stopped" },
  { atMilliseconds: 1_140, type: "thruster-fired" },
  { atMilliseconds: 1_900, type: "thruster-spent" },
  { atMilliseconds: 2_150, type: "sequence-complete" },
] as const;

export const ACTION_MAP_PLANS: Readonly<Record<ActionMapPlanId, ActionMapPlan>> = {
  "risky-chain": {
    id: "risky-chain",
    title: "RINGOS GROSSER ABKÜRZUNGSPLAN",
    summary: "Schild kippen → Wagen rollt → Triebwerk startet.",
    reason: "Drei Reaktionen für einen einzigen kleinen Schubs. Effizient!",
    risk: "Moki steht noch im Triebwerksstrahl.",
    events: RISKY_CHAIN_EVENTS,
  },
  "controlled-push": {
    id: "controlled-push",
    title: "GLIBS KONTROLLIERTE ALTERNATIVE",
    summary: "Moki warnen → Wagen direkt lösen → Triebwerk startet.",
    reason: "Gleicher Bühneneffekt, aber erst wenn die Crew aus dem Weg ist.",
    risk: "Das Schild bleibt als spätere Chance stehen.",
    events: CONTROLLED_PUSH_EVENTS,
  },
};

export function createActionMapLabState(): ActionMapLabState {
  return {
    planId: "risky-chain",
    phase: "planning",
    sign: "upright",
    cart: "braked",
    thruster: "idle",
    mokiSafe: false,
    mokiBlasted: false,
  };
}

export function selectActionMapPlan(
  state: ActionMapLabState,
  planId: ActionMapPlanId,
): ActionMapLabState {
  if (state.phase !== "planning") {
    return state;
  }
  return { ...state, planId };
}

export function beginActionMapPlan(
  state: ActionMapLabState,
): ActionMapLabState {
  return state.phase === "planning" ? { ...state, phase: "executing" } : state;
}

export function applyActionMapEvent(
  state: ActionMapLabState,
  event: ScheduledActionMapEvent,
): ActionMapLabState {
  switch (event.type) {
    case "sign-falling":
      return { ...state, sign: "falling" };
    case "sign-landed":
      return { ...state, sign: "fallen" };
    case "cart-rolling":
      return { ...state, cart: "rolling" };
    case "cart-stopped":
      return { ...state, cart: "stopped" };
    case "moki-evaded":
      return { ...state, mokiSafe: true };
    case "thruster-fired":
      return { ...state, thruster: "firing" };
    case "moki-blasted":
      return { ...state, mokiBlasted: true };
    case "thruster-spent":
      return { ...state, thruster: "spent" };
    case "sequence-complete":
      return { ...state, phase: "complete" };
  }
}

export function resolveActionMapPlan(
  initialState: ActionMapLabState,
): ActionMapLabState {
  const started = beginActionMapPlan(initialState);
  return ACTION_MAP_PLANS[started.planId].events.reduce(
    applyActionMapEvent,
    started,
  );
}
