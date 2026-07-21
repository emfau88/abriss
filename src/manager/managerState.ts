import type { WeaponId } from "../simulation/ai/RocketActionPlanner";
import {
  FIGHTER_IDS,
  FIGHTER_ROSTER,
  type FighterId,
} from "./fighterRoster";

export const MANAGER_STATE_VERSION = 1 as const;
export const MANAGER_STORAGE_KEY = "projekt-abriss.manager.v1";
export const WEAPON_IDS: readonly WeaponId[] = [
  "rocket",
  "grenade",
  "breaker",
];

export interface ManagerState {
  readonly version: typeof MANAGER_STATE_VERSION;
  readonly selectedFighterIds: readonly FighterId[];
  readonly weaponPreferences: Readonly<Record<FighterId, WeaponId>>;
  readonly unlockedWeaponIds: readonly WeaponId[];
  readonly completedMissions: number;
}
export interface MissionCompletion {
  readonly state: ManagerState;
  readonly newlyUnlockedWeaponId: WeaponId | null;
}

export function createInitialManagerState(): ManagerState {
  return {
    version: MANAGER_STATE_VERSION,
    selectedFighterIds: ["slime", "moki", "vela"],
    weaponPreferences: {
      slime: FIGHTER_ROSTER.slime.preferredWeaponId,
      hornling: FIGHTER_ROSTER.hornling.preferredWeaponId,
      moki: FIGHTER_ROSTER.moki.preferredWeaponId,
      vela: FIGHTER_ROSTER.vela.preferredWeaponId,
    },
    unlockedWeaponIds: ["rocket", "grenade"],
    completedMissions: 0,
  };
}

export function withSelectedFighters(
  state: ManagerState,
  fighterIds: readonly FighterId[],
): ManagerState {
  const unique = [...new Set(fighterIds)];

  if (unique.length > 3) {
    throw new Error("Die Crew darf höchstens drei unterschiedliche Wesen enthalten.");
  }

  return { ...state, selectedFighterIds: unique };
}

export function withWeaponPreference(
  state: ManagerState,
  fighterId: FighterId,
  weaponId: WeaponId,
): ManagerState {
  if (!state.unlockedWeaponIds.includes(weaponId)) {
    throw new Error(`Waffe ist noch nicht freigeschaltet: ${weaponId}`);
  }

  return {
    ...state,
    weaponPreferences: {
      ...state.weaponPreferences,
      [fighterId]: weaponId,
    },
  };
}

export function completeMission(state: ManagerState): MissionCompletion {
  const unlocksBreaker = !state.unlockedWeaponIds.includes("breaker");

  return {
    state: {
      ...state,
      completedMissions: state.completedMissions + 1,
      unlockedWeaponIds: unlocksBreaker
        ? [...state.unlockedWeaponIds, "breaker"]
        : state.unlockedWeaponIds,
    },
    newlyUnlockedWeaponId: unlocksBreaker ? "breaker" : null,
  };
}

export function serializeManagerState(state: ManagerState): string {
  return JSON.stringify(normalizeManagerState(state));
}

export function deserializeManagerState(serialized: string | null): ManagerState {
  if (!serialized) {
    return createInitialManagerState();
  }

  try {
    return normalizeManagerState(JSON.parse(serialized) as unknown);
  } catch {
    return createInitialManagerState();
  }
}

export function loadManagerState(): ManagerState {
  try {
    return deserializeManagerState(globalThis.localStorage?.getItem(MANAGER_STORAGE_KEY));
  } catch {
    return createInitialManagerState();
  }
}

export function saveManagerState(state: ManagerState): void {
  try {
    globalThis.localStorage?.setItem(MANAGER_STORAGE_KEY, serializeManagerState(state));
  } catch {
    // Private browsing or storage policy must not block a playable match.
  }
}

function normalizeManagerState(value: unknown): ManagerState {
  const fallback = createInitialManagerState();

  if (!isRecord(value) || value.version !== MANAGER_STATE_VERSION) {
    return fallback;
  }

  const selected = Array.isArray(value.selectedFighterIds)
    ? value.selectedFighterIds.filter(isFighterId)
    : fallback.selectedFighterIds;
  const uniqueSelected = [...new Set(selected)].slice(0, 3);
  const preferences = { ...fallback.weaponPreferences };

  if (isRecord(value.weaponPreferences)) {
    for (const fighterId of FIGHTER_IDS) {
      const weaponId = value.weaponPreferences[fighterId];
      if (isWeaponId(weaponId)) {
        preferences[fighterId] = weaponId;
      }
    }
  }

  const unlocked = Array.isArray(value.unlockedWeaponIds)
    ? [...new Set(value.unlockedWeaponIds.filter(isWeaponId))]
    : [...fallback.unlockedWeaponIds];
  for (const required of ["rocket", "grenade"] as const) {
    if (!unlocked.includes(required)) {
      unlocked.push(required);
    }
  }

  for (const fighterId of FIGHTER_IDS) {
    if (!unlocked.includes(preferences[fighterId])) {
      preferences[fighterId] = FIGHTER_ROSTER[fighterId].preferredWeaponId;
    }
  }

  const completedMissions =
    typeof value.completedMissions === "number" &&
    Number.isSafeInteger(value.completedMissions) &&
    value.completedMissions >= 0
      ? value.completedMissions
      : 0;

  return {
    version: MANAGER_STATE_VERSION,
    selectedFighterIds:
      uniqueSelected.length > 0 ? uniqueSelected : fallback.selectedFighterIds,
    weaponPreferences: preferences,
    unlockedWeaponIds: unlocked,
    completedMissions,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isFighterId(value: unknown): value is FighterId {
  return typeof value === "string" && FIGHTER_IDS.includes(value as FighterId);
}

function isWeaponId(value: unknown): value is WeaponId {
  return typeof value === "string" && WEAPON_IDS.includes(value as WeaponId);
}
