import Phaser from "phaser";

import {
  CREATURE_VISUALS,
} from "../../content/characters/creatureKits";
import { MAP_DEFINITIONS } from "../../content/maps/mapCatalog";
import {
  COMIC_PROJECTILE_FRAME_HEIGHT,
  COMIC_PROJECTILE_FRAME_WIDTH,
  COMIC_PROJECTILE_SHEET_PATH,
  COMIC_PROJECTILE_TEXTURE_KEY,
} from "../../content/projectiles/comicProjectileKit";
import {
  FEEDBACK_ICON_FRAME_HEIGHT,
  FEEDBACK_ICON_FRAME_WIDTH,
  FEEDBACK_ICON_SHEET_PATH,
  FEEDBACK_ICON_TEXTURE_KEY,
} from "../../content/ui/feedbackIconKit";
import {
  COMIC_VFX_FRAME_HEIGHT,
  COMIC_VFX_FRAME_WIDTH,
  COMIC_VFX_SHEET_PATH,
  COMIC_VFX_TEXTURE_KEY,
} from "../../content/vfx/comicVfxKit";
import {
  SECONDARY_VFX_FRAME_HEIGHT,
  SECONDARY_VFX_FRAME_WIDTH,
  SECONDARY_VFX_SHEET_PATH,
  SECONDARY_VFX_TEXTURE_KEY,
} from "../../content/vfx/secondaryVfxKit";

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
    this.load.spritesheet(
      COMIC_PROJECTILE_TEXTURE_KEY,
      COMIC_PROJECTILE_SHEET_PATH,
      {
        frameWidth: COMIC_PROJECTILE_FRAME_WIDTH,
        frameHeight: COMIC_PROJECTILE_FRAME_HEIGHT,
      },
    );
    this.load.spritesheet(
      SECONDARY_VFX_TEXTURE_KEY,
      SECONDARY_VFX_SHEET_PATH,
      {
        frameWidth: SECONDARY_VFX_FRAME_WIDTH,
        frameHeight: SECONDARY_VFX_FRAME_HEIGHT,
      },
    );
    this.load.spritesheet(FEEDBACK_ICON_TEXTURE_KEY, FEEDBACK_ICON_SHEET_PATH, {
      frameWidth: FEEDBACK_ICON_FRAME_WIDTH,
      frameHeight: FEEDBACK_ICON_FRAME_HEIGHT,
    });
  }

  public create(): void {
    this.cameras.main.setBackgroundColor("#102a36");
    this.scene.start("MainMenuScene");
  }
}
