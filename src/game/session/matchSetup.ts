import type { CreatureVisualId } from "../../content/characters/creatureKits";
import { MAP_DEFINITIONS } from "../../content/maps/mapCatalog";
import { FIGHTER_ROSTER } from "../../manager/fighterRoster";
import type { InteractableDefinition } from "../../simulation/interactables/interactables";
import type { MatchUnitDefinition } from "../../simulation/match/matchSimulationState";
import type { MatchLaunchConfig } from "./matchSession";

/**
 * Übersetzt eine MatchLaunchConfig in die fachlichen Figurendefinitionen der
 * Match-Engine plus die Darstellungszuordnung (visualId) für die Szene.
 * Reine Funktion ohne Phaser; identisch zur früheren Logik in
 * MatchScene.createUnits().
 */

export interface MatchSetupUnit extends MatchUnitDefinition {
  readonly visualId: CreatureVisualId;
}

const RIVAL_FIGHTER_IDS = ["hornling", "slime", "ghost"] as const;

export function buildMatchUnitDefinitions(
  config: MatchLaunchConfig,
): readonly MatchSetupUnit[] {
  const map = MAP_DEFINITIONS[config.mapId];
  const crewSpawnXs =
    config.validationScenarioId === "comedy-pocket"
      ? ([1_180, 1_420, 2_600] as const)
      : map.crewSpawnXs;
  const rivalSpawnXs =
    config.validationScenarioId === "comedy-pocket"
      ? ([1_480, 2_100, 700] as const)
      : map.rivalSpawnXs;
  const definitions: MatchSetupUnit[] = [];

  config.crew.forEach((loadout, index) => {
    const fighter = FIGHTER_ROSTER[loadout.fighterId];
    const rival =
      FIGHTER_ROSTER[RIVAL_FIGHTER_IDS[index] ?? RIVAL_FIGHTER_IDS[0]];
    definitions.push({
      id: `crew-${fighter.id}`,
      displayName: fighter.displayName,
      team: "crew",
      spawnX: crewSpawnXs[index] ?? crewSpawnXs[0],
      personality: fighter.personality,
      visualId: fighter.visualId,
      preferredWeaponId: loadout.preferredWeaponId,
    });
    definitions.push({
      id: `rival-${index + 1}`,
      displayName: `RIVALE ${String.fromCharCode(65 + index)}`,
      team: "rivals",
      spawnX: rivalSpawnXs[index] ?? rivalSpawnXs[0],
      personality: rival.personality,
      visualId: rival.visualId,
    });
  });

  return definitions;
}

/**
 * Task 028: Die interaktiven Objekte der gewählten Karte. Reine Weitergabe der
 * Kartendaten; die Höhe wird beim Erzeugen der Simulation aus dem Terrain
 * bestimmt.
 */
export function buildMatchInteractableDefinitions(
  config: MatchLaunchConfig,
): readonly InteractableDefinition[] {
  if (config.validationScenarioId === "comedy-pocket") {
    return [
      { id: "validation-barrel-1", type: "explosive-barrel", spawnX: 1_525 },
      { id: "validation-barrel-2", type: "explosive-barrel", spawnX: 1_570 },
      { id: "validation-barrel-3", type: "explosive-barrel", spawnX: 1_615 },
    ];
  }
  return MAP_DEFINITIONS[config.mapId].interactables ?? [];
}
