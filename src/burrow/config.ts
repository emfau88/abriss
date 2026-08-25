import Phaser from "phaser";

import { BurrowGameScene } from "./scenes/BurrowGameScene";

export const BURROW_LOGICAL_WIDTH = 1280;
export const BURROW_LOGICAL_HEIGHT = 720;

export function createBurrowGameConfig(): Phaser.Types.Core.GameConfig {
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
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    scene: [BurrowGameScene],
  };
}
