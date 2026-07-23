import type { WeaponId } from "../../simulation/ai/RocketActionPlanner";
import type { TeamId } from "../../simulation/state/matchState";
import type { ChronicleMoment } from "../../simulation/match/matchChronicle";
import { FIGHTER_ROSTER, type FighterId } from "../../manager/fighterRoster";
import type { ManagerState } from "../../manager/managerState";
import type { MapId } from "../../content/maps/mapCatalog";

export type MatchMode = "manager" | "quick";

/**
 * Steuerungsmodus des Spielerteams (Task 011): `auto` = Autobattler wie
 * bisher (KI plant, Manager greift nur ein); `manual` = der Spieler zielt
 * die Crew-Züge selbst per Maus. Der Rivalen-Zug bleibt in beiden Modi
 * autonom.
 */
export type ControlMode = "auto" | "manual";

export interface FighterLoadout {
  readonly fighterId: FighterId;
  readonly preferredWeaponId: WeaponId;
}
export interface MatchLaunchConfig {
  readonly mode: MatchMode;
  readonly seed: number;
  readonly mapId: MapId;
  readonly crew: readonly FighterLoadout[];
  readonly controlMode: ControlMode;
}

export interface MatchReport {
  readonly mode: MatchMode;
  readonly outcome: TeamId | "draw";
  readonly seed: number;
  readonly mapId: MapId;
  readonly turnNumber: number;
  readonly survivingCrew: number;
  readonly survivingRivals: number;
  /**
   * Task 027: Die 2–3 markantesten, bereits erzählten Momente dieses Matches.
   * Von der reinen Chronik-Funktion aus dem Ereignisprotokoll abgeleitet;
   * jeder Eintrag trägt seinen fertig gerenderten Text mit Figurennamen.
   */
  readonly chronicle: readonly ChronicleReportMoment[];
}

/** Ein Chronik-Moment mit bereits eingesetzten Figurennamen (siehe Task 027). */
export interface ChronicleReportMoment {
  readonly type: ChronicleMoment["type"];
  readonly turnNumber: number;
  readonly text: string;
}

const DEFAULT_SEED = 21_072_026;

export function createManagerMatchConfig(
  state: ManagerState,
  controlMode: ControlMode = "auto",
): MatchLaunchConfig {
  if (state.selectedFighterIds.length !== 3) {
    throw new Error("Vor dem Einsatz müssen genau drei Crewmitglieder gewählt sein.");
  }

  return {
    mode: "manager",
    seed: DEFAULT_SEED + state.completedMissions * 101,
    mapId: state.selectedMapId,
    controlMode,
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
  controlMode: ControlMode = "auto",
): MatchLaunchConfig {
  return {
    mode: "quick",
    seed: DEFAULT_SEED,
    mapId,
    controlMode,
    crew: [
      { fighterId: "slime", preferredWeaponId: "rocket" },
      { fighterId: "moki", preferredWeaponId: "grenade" },
      { fighterId: "ghost", preferredWeaponId: "grenade" },
    ],
  };
}

/**
 * Isolierter Ingame-Test für neue Character-Sheets. Der normale Schnellmatch
 * und damit die Balancematrix bleiben unverändert.
 */
export function createCharacterAssetTestConfig(
  mapId: MapId = "good-mood",
  controlMode: ControlMode = "auto",
): MatchLaunchConfig {
  return {
    mode: "quick",
    seed: DEFAULT_SEED,
    mapId,
    controlMode,
    crew: [
      { fighterId: "pop-diva", preferredWeaponId: "rocket" },
      { fighterId: "chicken", preferredWeaponId: "grenade" },
      { fighterId: "ghost", preferredWeaponId: "grenade" },
    ],
  };
}
