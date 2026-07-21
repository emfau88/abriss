import type { WeaponId } from "../../simulation/ai/RocketActionPlanner";
import type { TeamId } from "../../simulation/state/matchState";
import { FIGHTER_ROSTER, type FighterId } from "../../manager/fighterRoster";
import type { ManagerState } from "../../manager/managerState";
import type { MapId } from "../../content/maps/mapCatalog";

export type MatchMode = "manager" | "quick";

export interface FighterLoadout {
  readonly fighterId: FighterId;
  readonly preferredWeaponId: WeaponId;
}
export interface MatchLaunchConfig {
  readonly mode: MatchMode;
  readonly seed: number;
  readonly mapId: MapId;
  readonly crew: readonly FighterLoadout[];
}

export interface MatchReport {
  readonly mode: MatchMode;
  readonly outcome: TeamId | "draw";
  readonly seed: number;
  readonly mapId: MapId;
  readonly turnNumber: number;
  readonly survivingCrew: number;
  readonly survivingRivals: number;
}

const DEFAULT_SEED = 21_072_026;

export function createManagerMatchConfig(state: ManagerState): MatchLaunchConfig {
  if (state.selectedFighterIds.length !== 3) {
    throw new Error("Vor dem Einsatz müssen genau drei Crewmitglieder gewählt sein.");
  }

  return {
    mode: "manager",
    seed: DEFAULT_SEED + state.completedMissions * 101,
    mapId: state.selectedMapId,
    crew: state.selectedFighterIds.map((fighterId) => ({
      fighterId,
      preferredWeaponId:
        state.weaponPreferences[fighterId] ??
        FIGHTER_ROSTER[fighterId].preferredWeaponId,
    })),
  };
}

export function createQuickMatchConfig(
  mapId: MapId = "good-mood",
): MatchLaunchConfig {
  return {
    mode: "quick",
    seed: DEFAULT_SEED,
    mapId,
    crew: [
      { fighterId: "slime", preferredWeaponId: "rocket" },
      { fighterId: "moki", preferredWeaponId: "grenade" },
      { fighterId: "ghost", preferredWeaponId: "grenade" },
    ],
  };
}
