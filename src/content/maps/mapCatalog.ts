import { publicAssetPath } from "../publicAssetPath";
import {
  GOOD_MOOD_BACKGROUND_PATH,
  GOOD_MOOD_BACKGROUND_TEXTURE_KEY,
  GOOD_MOOD_TERRAIN_CELL_SIZE,
  GOOD_MOOD_TERRAIN_PATH,
  GOOD_MOOD_TERRAIN_SOURCE_TEXTURE_KEY,
} from "./goodMoodMap";

export type MapId = "good-mood" | "space-resort";

export interface MapDefinition {
  readonly id: MapId;
  readonly displayName: string;
  readonly settingLabel: string;
  readonly tagline: string;
  readonly backgroundTextureKey: string;
  readonly backgroundPath: string;
  readonly terrainTextureKey: string;
  readonly terrainPath: string;
  readonly terrainCellSize: number;
  readonly crewSpawnXs: readonly [number, number, number];
  readonly rivalSpawnXs: readonly [number, number, number];
}

export const MAP_IDS: readonly MapId[] = ["good-mood", "space-resort"];

export const MAP_DEFINITIONS: Readonly<Record<MapId, MapDefinition>> = {
  "good-mood": {
    id: "good-mood",
    displayName: "SONNENINSELN",
    settingLabel: "GUTE-LAUNE-WELT",
    tagline: "Blumen, Felsen und erstaunlich viele Krater.",
    backgroundTextureKey: GOOD_MOOD_BACKGROUND_TEXTURE_KEY,
    backgroundPath: GOOD_MOOD_BACKGROUND_PATH,
    terrainTextureKey: GOOD_MOOD_TERRAIN_SOURCE_TEXTURE_KEY,
    terrainPath: GOOD_MOOD_TERRAIN_PATH,
    terrainCellSize: GOOD_MOOD_TERRAIN_CELL_SIZE,
    crewSpawnXs: [420, 930, 2700],
    rivalSpawnXs: [1480, 2100, 700],
  },
  "space-resort": {
    id: "space-resort",
    displayName: "ORBITALER URLAUB",
    settingLabel: "SPACE-RESORT",
    tagline: "All-inclusive. Sauerstoff vermutlich extra.",
    backgroundTextureKey: "space-resort-background",
    backgroundPath: publicAssetPath("assets/maps/space-resort-background-hd.png"),
    terrainTextureKey: "space-resort-terrain-source",
    terrainPath: publicAssetPath("assets/maps/space-resort-terrain-hd.png"),
    terrainCellSize: 2,
    crewSpawnXs: [520, 1650, 2620],
    rivalSpawnXs: [250, 1100, 2420],
  },
};

export function isMapId(value: unknown): value is MapId {
  return typeof value === "string" && MAP_IDS.includes(value as MapId);
}
