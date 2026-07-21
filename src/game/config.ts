import Phaser from "phaser";

import { BootScene } from "./scenes/BootScene";
import { MatchScene } from "./scenes/MatchScene";

export const LOGICAL_WIDTH = 1280;
export const LOGICAL_HEIGHT = 720;
export const RENDER_SCALE = 1.25;
export const RENDER_WIDTH = LOGICAL_WIDTH * RENDER_SCALE;
export const RENDER_HEIGHT = LOGICAL_HEIGHT * RENDER_SCALE;
export const WORLD_WIDTH = 3200;
export const WORLD_HEIGHT = 1800;

export function createGameConfig(): Phaser.Types.Core.GameConfig {
  return {
    type: Phaser.AUTO,
    parent: "game",
    width: RENDER_WIDTH,
    height: RENDER_HEIGHT,
    backgroundColor: "#102a36",
    render: {
      antialias: true,
      pixelArt: false,
      roundPixels: false,
    },
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    scene: [BootScene, MatchScene],
  };
}
