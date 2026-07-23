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
  const definitions: MatchSetupUnit[] = [];

  config.crew.forEach((loadout, index) => {
    const fighter = FIGHTER_ROSTER[loadout.fighterId];
    const rival =
      FIGHTER_ROSTER[RIVAL_FIGHTER_IDS[index] ?? RIVAL_FIGHTER_IDS[0]];
    definitions.push({
      id: `crew-${fighter.id}`,
      displayName: fighter.displayName,
      team: "crew",
      spawnX: map.crewSpawnXs[index] ?? map.crewSpawnXs[0],
      personality: fighter.personality,
      visualId: fighter.visualId,
      preferredWeaponId: loadout.preferredWeaponId,
    });
    definitions.push({
      id: `rival-${index + 1}`,
      displayName: `RIVALE ${String.fromCharCode(65 + index)}`,
      team: "rivals",
      spawnX: map.rivalSpawnXs[index] ?? map.rivalSpawnXs[0],
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
  return MAP_DEFINITIONS[config.mapId].interactables ?? [];
}
