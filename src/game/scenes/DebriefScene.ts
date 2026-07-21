import Phaser from "phaser";

import {
  completeMission,
  loadManagerState,
  saveManagerState,
} from "../../manager/managerState";
import { WEAPON_PROFILES } from "../../simulation/ai/RocketActionPlanner";
import { RENDER_HEIGHT, RENDER_WIDTH } from "../config";
import type { MatchReport } from "../session/matchSession";
import { createMenuButton, drawMenuBackdrop } from "../ui/menuUi";

interface DebriefSceneData {
  readonly report?: MatchReport;
}

export class DebriefScene extends Phaser.Scene {
  private report: MatchReport | undefined;

  public constructor() {
    super("DebriefScene");
  }

  public init(data: DebriefSceneData): void {
    this.report = data.report;
  }

  public create(): void {
    drawMenuBackdrop(this, RENDER_WIDTH, RENDER_HEIGHT);
    const report = this.report;

    if (!report) {
      this.scene.start("MainMenuScene");
      return;
    }

    const completion = completeMission(loadManagerState());
    saveManagerState(completion.state);
    const won = report.outcome === "crew";
    const result =
      report.outcome === "draw"
        ? "UNENTSCHIEDEN"
        : won
          ? "EINSATZ ERFOLGREICH"
          : "EINSATZ LEHRREICH";
    const remark = won
      ? "Die Crew meldet: alles exakt nach Plan. Die Karte widerspricht."
      : report.outcome === "draw"
        ? "Niemand gewinnt, aber alle haben eine sehr gute Ausrede."
        : "Der Krater war überzeugend. Die taktische Absicht weniger.";

    this.add
      .rectangle(RENDER_WIDTH / 2, RENDER_HEIGHT / 2, 880, 650, 0x102a36, 0.94)
      .setStrokeStyle(5, won ? 0x55d7c2 : 0xffcd5d, 0.95);
    this.add
      .text(RENDER_WIDTH / 2, 165, "EINSATZBERICHT", {
        fontFamily: "Consolas, ui-monospace, monospace",
        fontSize: "20px",
        fontStyle: "bold",
        color: "#ffcd5d",
      })
      .setOrigin(0.5);
    this.add
      .text(RENDER_WIDTH / 2, 235, result, {
        fontFamily: "Segoe UI, Arial, sans-serif",
        fontSize: "48px",
        fontStyle: "bold",
        color: "#fff5d6",
        align: "center",
      })
      .setOrigin(0.5);
    this.add
      .text(RENDER_WIDTH / 2, 325, remark, {
        fontFamily: "Segoe UI, Arial, sans-serif",
        fontSize: "20px",
        color: "#fff5d6",
        align: "center",
        wordWrap: { width: 700 },
      })
      .setOrigin(0.5);
    this.add
      .text(
        RENDER_WIDTH / 2,
        410,
        `ZÜGE ${report.turnNumber}   ·   CREW ÜBRIG ${report.survivingCrew}   ·   RIVALEN ÜBRIG ${report.survivingRivals}\nSEED ${report.seed}   ·   EINSATZ ${completion.state.completedMissions}`,
        {
          fontFamily: "Consolas, ui-monospace, monospace",
          fontSize: "17px",
          fontStyle: "bold",
          color: "#55d7c2",
          align: "center",
          lineSpacing: 10,
        },
      )
      .setOrigin(0.5);

    if (completion.newlyUnlockedWeaponId) {
      this.add
        .text(
          RENDER_WIDTH / 2,
          505,
          `NEU FREIGESCHALTET: ${WEAPON_PROFILES[completion.newlyUnlockedWeaponId].displayName}\nAb dem nächsten Einsatz als Waffenpräferenz verfügbar.`,
          {
            fontFamily: "Segoe UI, Arial, sans-serif",
            fontSize: "19px",
            fontStyle: "bold",
            color: "#142c33",
            backgroundColor: "#ffcd5d",
            padding: { x: 24, y: 14 },
            align: "center",
          },
        )
        .setOrigin(0.5);
    }

    createMenuButton(this, {
      x: 610,
      y: 685,
      width: 470,
      height: 70,
      label: "NÄCHSTEN EINSATZ PLANEN",
      onClick: () => this.scene.start("ManagerScene"),
    });
    createMenuButton(this, {
      x: 1100,
      y: 685,
      width: 310,
      height: 70,
      label: "HAUPTMENÜ",
      accent: 0xfff5d6,
      onClick: () => this.scene.start("MainMenuScene"),
    });

  }
}
