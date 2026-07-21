import Phaser from "phaser";

import {
  CREATURE_VISUALS,
} from "../../content/characters/creatureKits";
import { MAP_DEFINITIONS } from "../../content/maps/mapCatalog";
import {
  COMIC_VFX_FRAME_HEIGHT,
  COMIC_VFX_FRAME_WIDTH,
  COMIC_VFX_SHEET_PATH,
  COMIC_VFX_TEXTURE_KEY,
} from "../../content/vfx/comicVfxKit";

export class BootScene extends Phaser.Scene {
  public constructor() {
    super("BootScene");
  }

  public preload(): void {
    for (const visual of Object.values(CREATURE_VISUALS)) {
      this.load.spritesheet(visual.textureKey, visual.sheetPath, {
        frameWidth: visual.frameWidth,
        frameHeight: visual.frameHeight,
      });
    }
    for (const map of Object.values(MAP_DEFINITIONS)) {
      this.load.image(map.backgroundTextureKey, map.backgroundPath);
      this.load.image(map.terrainTextureKey, map.terrainPath);
    }
    this.load.spritesheet(COMIC_VFX_TEXTURE_KEY, COMIC_VFX_SHEET_PATH, {
      frameWidth: COMIC_VFX_FRAME_WIDTH,
      frameHeight: COMIC_VFX_FRAME_HEIGHT,
    });
  }

  public create(): void {
    this.cameras.main.setBackgroundColor("#102a36");
    this.scene.start("MainMenuScene");
  }
}
