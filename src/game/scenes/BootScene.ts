import Phaser from "phaser";

import {
  CREATURE_VISUALS,
} from "../../content/characters/creatureKits";
import {
  GOOD_MOOD_BACKGROUND_PATH,
  GOOD_MOOD_BACKGROUND_TEXTURE_KEY,
  GOOD_MOOD_TERRAIN_PATH,
  GOOD_MOOD_TERRAIN_SOURCE_TEXTURE_KEY,
} from "../../content/maps/goodMoodMap";
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
    this.load.image(
      GOOD_MOOD_BACKGROUND_TEXTURE_KEY,
      GOOD_MOOD_BACKGROUND_PATH,
    );
    this.load.image(
      GOOD_MOOD_TERRAIN_SOURCE_TEXTURE_KEY,
      GOOD_MOOD_TERRAIN_PATH,
    );
    this.load.spritesheet(COMIC_VFX_TEXTURE_KEY, COMIC_VFX_SHEET_PATH, {
      frameWidth: COMIC_VFX_FRAME_WIDTH,
      frameHeight: COMIC_VFX_FRAME_HEIGHT,
    });
  }

  public create(): void {
    this.cameras.main.setBackgroundColor("#102a36");
    this.scene.start("MatchScene");
  }
}
