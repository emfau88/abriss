import Phaser from "phaser";

import {
  MAP_DEFINITIONS,
  MAP_IDS,
  type MapDefinition,
  type MapId,
} from "../../content/maps/mapCatalog";
import {
  loadManagerState,
  saveManagerState,
  withSelectedMap,
  type ManagerState,
} from "../../manager/managerState";
import { RENDER_HEIGHT, RENDER_WIDTH } from "../config";
import {
  createQuickMatchConfig,
  type ControlMode,
} from "../session/matchSession";
import { createMenuButton, drawMenuBackdrop } from "../ui/menuUi";

const MAP_CARD_CENTERS = [465, 1135] as const;

export class MainMenuScene extends Phaser.Scene {
  private managerState!: ManagerState;
  private controlMode: ControlMode = "auto";

  public constructor() {
    super("MainMenuScene");
  }

  public create(): void {
    this.managerState = loadManagerState();
    // Über die Registry, damit die Wahl scene.restart() (Kartenwechsel) übersteht.
    this.controlMode =
      (this.registry.get("controlMode") as ControlMode | undefined) ?? "auto";
    const selectedMap = MAP_DEFINITIONS[this.managerState.selectedMapId];
    drawMenuBackdrop(
      this,
      RENDER_WIDTH,
      RENDER_HEIGHT,
      selectedMap.backgroundTextureKey,
    );

    this.add
      .text(RENDER_WIDTH / 2, 66, "PROJEKT ABRISS", {
        fontFamily: "Segoe UI, Arial, sans-serif",
        fontSize: "58px",
        fontStyle: "bold",
        color: "#fff5d6",
        stroke: "#142c33",
        strokeThickness: 10,
      })
      .setOrigin(0.5);
    this.add
      .text(RENDER_WIDTH / 2, 121, "WO SOLL ES HEUTE KRATERN?", {
        fontFamily: "Consolas, ui-monospace, monospace",
        fontSize: "18px",
        fontStyle: "bold",
        color: "#ffcd5d",
        letterSpacing: 2,
      })
      .setOrigin(0.5);

    MAP_IDS.forEach((mapId, index) => {
      this.createMapCard(
        MAP_DEFINITIONS[mapId],
        MAP_CARD_CENTERS[index] ?? MAP_CARD_CENTERS[0],
      );
    });

    createMenuButton(this, {
      x: RENDER_WIDTH / 2,
      y: 661,
      width: 520,
      height: 72,
      label: "EINSATZ PLANEN",
      onClick: () => this.scene.start("ManagerScene"),
    });
    createMenuButton(this, {
      x: RENDER_WIDTH / 2,
      y: 751,
      width: 520,
      height: 60,
      label: `TESTMATCH · ${selectedMap.displayName}`,
      accent: 0x55d7c2,
      onClick: () =>
        this.scene.start("MatchScene", {
          launchConfig: createQuickMatchConfig(
            this.managerState.selectedMapId,
            this.controlMode,
          ),
        }),
    });

    this.createControlModeToggle();

    this.add
      .text(
        RENDER_WIDTH / 2,
        868,
        `EINSÄTZE ${this.managerState.completedMissions}   ·   ARSENAL ${this.managerState.unlockedWeaponIds.length}/3   ·   KARTE ${selectedMap.settingLabel}`,
        {
          fontFamily: "Consolas, ui-monospace, monospace",
          fontSize: "16px",
          fontStyle: "bold",
          color: "#fff5d6",
        },
      )
      .setOrigin(0.5);
  }

  private createControlModeToggle(): void {
    const y = 820;
    const auto = this.controlMode === "auto";
    const label = this.add
      .text(RENDER_WIDTH / 2 - 168, y, "CREW-STEUERUNG:", {
        fontFamily: "Consolas, ui-monospace, monospace",
        fontSize: "15px",
        fontStyle: "bold",
        color: "#d9eee9",
      })
      .setOrigin(0, 0.5);

    const button = this.add
      .rectangle(
        RENDER_WIDTH / 2 + 120,
        y,
        280,
        40,
        auto ? 0x176f6b : 0xd9843a,
        1,
      )
      .setStrokeStyle(2, 0xfff5d6, 0.5)
      .setInteractive({ useHandCursor: true });
    const buttonText = this.add
      .text(
        button.x,
        y,
        auto ? "⚙ AUTOBATTLE  (klicken)" : "🎯 SELBST ZIELEN  (klicken)",
        {
          fontFamily: "Consolas, ui-monospace, monospace",
          fontSize: "14px",
          fontStyle: "bold",
          color: "#fff5d6",
        },
      )
      .setOrigin(0.5);

    void label;
    void buttonText;
    button.on("pointerdown", () => {
      const next: ControlMode = this.controlMode === "auto" ? "manual" : "auto";
      this.registry.set("controlMode", next);
      this.scene.restart();
    });
  }

  private createMapCard(map: MapDefinition, x: number): void {
    const selected = map.id === this.managerState.selectedMapId;
    const y = 345;
    const width = 590;
    const height = 390;
    const previewWidth = 558;
    const previewHeight = 314;

    this.add
      .rectangle(x, y, width, height, selected ? 0x163f45 : 0x102a36, 0.96)
      .setStrokeStyle(5, selected ? 0xffcd5d : 0xfff5d6, selected ? 1 : 0.48);
    this.add
      .image(x, y - 22, map.backgroundTextureKey)
      .setDisplaySize(previewWidth, previewHeight);
    this.add
      .image(x, y - 22, map.terrainTextureKey)
      .setDisplaySize(previewWidth, previewHeight);
    this.add.rectangle(x, y + 135, previewWidth, 70, 0x102a36, 0.93);
    this.add
      .text(x - 260, y + 115, map.displayName, {
        fontFamily: "Segoe UI, Arial, sans-serif",
        fontSize: "25px",
        fontStyle: "bold",
        color: selected ? "#ffcd5d" : "#fff5d6",
      })
      .setOrigin(0, 0.5);
    this.add
      .text(x - 260, y + 151, map.tagline, {
        fontFamily: "Segoe UI, Arial, sans-serif",
        fontSize: "14px",
        color: "#d9eee9",
      })
      .setOrigin(0, 0.5);
    this.add
      .text(x + 260, y + 116, selected ? "GEWÄHLT" : "WÄHLEN", {
        fontFamily: "Consolas, ui-monospace, monospace",
        fontSize: "13px",
        fontStyle: "bold",
        color: selected ? "#142c33" : "#fff5d6",
        backgroundColor: selected ? "#ffcd5d" : "#176f6b",
        padding: { x: 11, y: 7 },
      })
      .setOrigin(1, 0.5);

    const hitArea = this.add
      .rectangle(x, y, width, height, 0xffffff, 0.001)
      .setInteractive({ useHandCursor: true });
    hitArea.on("pointerover", () => {
      if (!selected) hitArea.setAlpha(0.055);
    });
    hitArea.on("pointerout", () => hitArea.setAlpha(0.001));
    hitArea.on("pointerdown", () => this.selectMap(map.id));
  }

  private selectMap(mapId: MapId): void {
    if (this.managerState.selectedMapId === mapId) {
      return;
    }

    this.managerState = withSelectedMap(this.managerState, mapId);
    saveManagerState(this.managerState);
    this.scene.restart();
  }
}
