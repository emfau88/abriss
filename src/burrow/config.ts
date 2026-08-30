import Phaser from "phaser";

import { BurrowGameScene } from "./scenes/BurrowGameScene";
import { DEFAULT_TERRAIN_VARIANT, type BurrowTerrainVariant } from "./simulation/BurrowTerrainVariant";

export const BURROW_LOGICAL_WIDTH = 1280;
export const BURROW_LOGICAL_HEIGHT = 720;

export function createBurrowGameConfig(terrainVariant: BurrowTerrainVariant = DEFAULT_TERRAIN_VARIANT): Phaser.Types.Core.GameConfig {
  return {
    type: Phaser.AUTO,
    parent: "burrow-game",
    width: BURROW_LOGICAL_WIDTH,
    height: BURROW_LOGICAL_HEIGHT,
    backgroundColor: "#17151c",
    render: {
      antialias: true,
      pixelArt: false,
      roundPixels: false,
    },
    input: {
      activePointers: 3,
    },
    scale: {
      // Die Spielfläche folgt dem verfügbaren Viewport statt ein starres
      // 16:9-Bild mit seitlichen Balken einzupassen. Die Scene legt ihr HUD
      // daraufhin responsiv aus; die Simulation bleibt weiterhin weltbasiert.
      mode: Phaser.Scale.RESIZE,
      autoCenter: Phaser.Scale.NO_CENTER,
    },
    scene: [new BurrowGameScene(terrainVariant)],
  };
}
