import Phaser from "phaser";

import { loadManagerState } from "../../manager/managerState";
import { RENDER_HEIGHT, RENDER_WIDTH } from "../config";
import { createQuickMatchConfig } from "../session/matchSession";
import { createMenuButton, drawMenuBackdrop } from "../ui/menuUi";

export class MainMenuScene extends Phaser.Scene {
  public constructor() {
    super("MainMenuScene");
  }

  public create(): void {
    drawMenuBackdrop(this, RENDER_WIDTH, RENDER_HEIGHT);
    const managerState = loadManagerState();

    this.add
      .text(RENDER_WIDTH / 2, 145, "PROJEKT ABRISS", {
        fontFamily: "Segoe UI, Arial, sans-serif",
        fontSize: "70px",
        fontStyle: "bold",
        color: "#fff5d6",
        stroke: "#142c33",
        strokeThickness: 10,
      })
      .setOrigin(0.5);
    this.add
      .text(
        RENDER_WIDTH / 2,
        225,
        "DEINE CREW. IHR PLAN. DEIN LETZTES WORT.",
        {
          fontFamily: "Consolas, ui-monospace, monospace",
          fontSize: "20px",
          fontStyle: "bold",
          color: "#ffcd5d",
          letterSpacing: 2,
        },
      )
      .setOrigin(0.5);

    const panel = this.add
      .rectangle(RENDER_WIDTH / 2, 515, 570, 410, 0x102a36, 0.91)
      .setStrokeStyle(4, 0xfff5d6, 0.72);
    panel.setData("menu-panel", true);

    createMenuButton(this, {
      x: RENDER_WIDTH / 2,
      y: 410,
      width: 430,
      height: 78,
      label: "EINSATZ PLANEN",
      onClick: () => this.scene.start("ManagerScene"),
    });
    createMenuButton(this, {
      x: RENDER_WIDTH / 2,
      y: 515,
      width: 430,
      height: 64,
      label: "SCHNELLES TESTMATCH",
      accent: 0x55d7c2,
      onClick: () =>
        this.scene.start("MatchScene", {
          launchConfig: createQuickMatchConfig(),
        }),
    });

    this.add
      .text(
        RENDER_WIDTH / 2,
        625,
        `EINSÄTZE ${managerState.completedMissions}   ·   ARSENAL ${managerState.unlockedWeaponIds.length}/3`,
        {
          fontFamily: "Consolas, ui-monospace, monospace",
          fontSize: "17px",
          fontStyle: "bold",
          color: "#fff5d6",
        },
      )
      .setOrigin(0.5);
    this.add
      .text(
        RENDER_WIDTH / 2,
        735,
        "Im Testmatch startest du direkt. Die Einsatzplanung speichert deinen kleinen Manager-Fortschritt lokal.",
        {
          fontFamily: "Segoe UI, Arial, sans-serif",
          fontSize: "16px",
          color: "#fff5d6",
          align: "center",
          wordWrap: { width: 760 },
        },
      )
      .setOrigin(0.5);
  }
}
