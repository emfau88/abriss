import Phaser from "phaser";

import {
  CREATURE_VISUALS,
} from "../../content/characters/creatureKits";
import { MAP_DEFINITIONS } from "../../content/maps/mapCatalog";
import {
  FEEDBACK_ICON_FRAME_HEIGHT,
  FEEDBACK_ICON_FRAME_WIDTH,
  FEEDBACK_ICON_SHEET_PATH,
  FEEDBACK_ICON_TEXTURE_KEY,
} from "../../content/ui/feedbackIconKit";
export class BootScene extends Phaser.Scene {
  public constructor() {
    super("BootScene");
  }

  public preload(): void {
    this.updateBootOverlay(0, "FIGUREN UND MENÜ WERDEN GELADEN");
    this.load.on(Phaser.Loader.Events.PROGRESS, (progress: number) => {
      this.updateBootOverlay(progress, "FIGUREN UND MENÜ WERDEN GELADEN");
    });
    this.load.on(Phaser.Loader.Events.FILE_LOAD_ERROR, () => {
      this.updateBootOverlay(0, "EIN ASSET KONNTE NICHT GELADEN WERDEN");
    });

    for (const visual of Object.values(CREATURE_VISUALS)) {
      this.load.spritesheet(visual.textureKey, visual.sheetPath, {
        frameWidth: visual.frameWidth,
        frameHeight: visual.frameHeight,
      });
    }
    for (const map of Object.values(MAP_DEFINITIONS)) {
      this.load.image(
        map.previewBackgroundTextureKey,
        map.previewBackgroundPath,
      );
      this.load.image(map.previewTerrainTextureKey, map.previewTerrainPath);
    }
    this.load.spritesheet(FEEDBACK_ICON_TEXTURE_KEY, FEEDBACK_ICON_SHEET_PATH, {
      frameWidth: FEEDBACK_ICON_FRAME_WIDTH,
      frameHeight: FEEDBACK_ICON_FRAME_HEIGHT,
    });
  }

  public create(): void {
    this.cameras.main.setBackgroundColor("#102a36");
    this.game.canvas.tabIndex = 0;
    this.game.canvas.setAttribute("aria-label", "Projekt Abriss Spielfläche");
    this.game.canvas.focus({ preventScroll: true });
    document.querySelector("#boot-loading")?.classList.add("is-hidden");
    this.scene.start("MainMenuScene");
  }

  private updateBootOverlay(progress: number, label: string): void {
    const progressElement = document.querySelector<HTMLElement>(
      "#boot-loading-progress",
    );
    const labelElement = document.querySelector<HTMLElement>(
      "#boot-loading-label",
    );
    const percentage = Math.round(progress * 100);
    progressElement?.style.setProperty("--boot-progress", `${percentage}%`);
    progressElement?.setAttribute("aria-valuenow", String(percentage));
    if (labelElement) {
      labelElement.textContent = `${label} · ${percentage}%`;
    }
  }
}
