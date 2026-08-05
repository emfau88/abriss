import Phaser from "phaser";

import {
  CREATURE_VISUALS,
  creatureAnimationKey,
  registerCreatureAnimations,
} from "../../content/characters/creatureKits";
import {
  ACTION_MAP_PLANS,
  applyActionMapEvent,
  beginActionMapPlan,
  createActionMapLabState,
  selectActionMapPlan,
  type ActionMapEventType,
  type ActionMapLabState,
  type ScheduledActionMapEvent,
} from "../../simulation/actionmap/actionMapLab";
import { simulateExplosionKnockback } from "../../simulation/movement/ExplosionKnockback";
import { BinaryTerrainMask } from "../../simulation/terrain/TerrainMask";
import { RENDER_HEIGHT, RENDER_WIDTH } from "../config";
import {
  createMenuButton,
  drawMenuBackdrop,
  type MenuButton,
} from "../ui/menuUi";

const FLOOR_Y = 690;
const INK = 0x142c33;
const YELLOW = 0xffcd5d;
const CORAL = 0xd95d4d;
const TEAL = 0x55d7c2;

interface CharacterView {
  readonly container: Phaser.GameObjects.Container;
  readonly sprite: Phaser.GameObjects.Sprite;
}

export class ActionMapScene extends Phaser.Scene {
  private labState: ActionMapLabState = createActionMapLabState();
  private sign!: Phaser.GameObjects.Container;
  private cart!: Phaser.GameObjects.Container;
  private thrusterBeam!: Phaser.GameObjects.Rectangle;
  private moki!: CharacterView;
  private planTitle!: Phaser.GameObjects.Text;
  private planSummary!: Phaser.GameObjects.Text;
  private planReason!: Phaser.GameObjects.Text;
  private planRisk!: Phaser.GameObjects.Text;
  private statusText!: Phaser.GameObjects.Text;
  private executeButton!: MenuButton;
  private alternativeButton!: MenuButton;

  public constructor() {
    super("ActionMapScene");
  }

  public create(): void {
    this.labState = createActionMapLabState();
    registerCreatureAnimations(this);
    drawMenuBackdrop(
      this,
      RENDER_WIDTH,
      RENDER_HEIGHT,
      "space-resort-background",
    );
    this.drawStage();
    this.createObjects();
    this.createCharacters();
    this.createPlanPanel();
    this.createControls();
    this.updatePlanPanel();
  }

  private drawStage(): void {
    this.add.rectangle(RENDER_WIDTH / 2, 38, RENDER_WIDTH, 76, INK, 0.94);
    this.add
      .text(34, 34, "ACTIONMAP-LABOR", {
        fontFamily: "Segoe UI, Arial, sans-serif",
        fontSize: "28px",
        fontStyle: "bold",
        color: "#fff5d6",
      })
      .setOrigin(0, 0.5);
    this.add
      .text(RENDER_WIDTH - 34, 34, "SCHILD → WAGEN → TRIEBWERK", {
        fontFamily: "Consolas, ui-monospace, monospace",
        fontSize: "16px",
        fontStyle: "bold",
        color: "#55d7c2",
      })
      .setOrigin(1, 0.5);

    const stage = this.add.graphics();
    stage.fillStyle(0x274c43, 1);
    stage.fillRect(0, FLOOR_Y, RENDER_WIDTH, RENDER_HEIGHT - FLOOR_Y);
    stage.fillStyle(0x6d5032, 1);
    stage.fillRect(0, FLOOR_Y + 20, RENDER_WIDTH, RENDER_HEIGHT - FLOOR_Y);
    stage.fillStyle(0x65b755, 1);
    stage.fillRect(0, FLOOR_Y - 12, RENDER_WIDTH, 32);
    stage.fillStyle(0x3f7952, 1);
    stage.fillTriangle(0, FLOOR_Y + 20, 290, FLOOR_Y + 20, 110, 820);
    stage.fillTriangle(640, FLOOR_Y + 20, 1_050, FLOOR_Y + 20, 820, 850);
    stage.fillTriangle(1_180, FLOOR_Y + 20, RENDER_WIDTH, FLOOR_Y + 20, 1_420, 850);

    this.add
      .rectangle(1_320, 545, 270, 24, 0x6d5032, 1)
      .setStrokeStyle(5, 0x65b755, 1);
    this.add
      .text(1_320, 510, "SICHERE WARTEPOSITION", {
        fontFamily: "Consolas, ui-monospace, monospace",
        fontSize: "12px",
        fontStyle: "bold",
        color: "#fff5d6",
        backgroundColor: "#142c33",
        padding: { x: 8, y: 4 },
      })
      .setOrigin(0.5);

    this.add
      .text(500, 420, "1  KIPPBARES SCHILD", this.objectLabelStyle())
      .setOrigin(0.5);
    this.add
      .text(760, 570, "2  ROLLENDER WAGEN", this.objectLabelStyle())
      .setOrigin(0.5);
    this.add
      .text(1_035, 548, "3  TRIEBWERK", this.objectLabelStyle())
      .setOrigin(0.5);
  }

  private objectLabelStyle(): Phaser.Types.GameObjects.Text.TextStyle {
    return {
      fontFamily: "Consolas, ui-monospace, monospace",
      fontSize: "14px",
      fontStyle: "bold",
      color: "#142c33",
      backgroundColor: "#ffcd5d",
      padding: { x: 8, y: 5 },
    };
  }

  private createObjects(): void {
    const signPole = this.add.rectangle(0, -55, 16, 150, 0x6b472a, 1);
    const signBoard = this.add
      .rectangle(0, -145, 210, 105, 0x46305e, 1)
      .setStrokeStyle(7, INK, 1);
    const signText = this.add
      .text(0, -145, "RÜLPS!\nLIVE", {
        fontFamily: "Segoe UI, Arial, sans-serif",
        fontSize: "25px",
        fontStyle: "bold",
        color: "#fff5d6",
        align: "center",
      })
      .setOrigin(0.5);
    this.sign = this.add.container(510, FLOOR_Y, [
      signPole,
      signBoard,
      signText,
    ]);

    const cartBody = this.add
      .rectangle(0, -42, 150, 76, 0x594334, 1)
      .setStrokeStyle(7, INK, 1);
    const cartRim = this.add.rectangle(0, -79, 162, 12, 0xd9843a, 1);
    const wheelLeft = this.add
      .circle(-52, 2, 22, 0x28333a, 1)
      .setStrokeStyle(6, INK, 1);
    const wheelRight = this.add
      .circle(52, 2, 22, 0x28333a, 1)
      .setStrokeStyle(6, INK, 1);
    const cartMark = this.add
      .text(0, -42, "☠", {
        fontFamily: "Segoe UI Symbol, Arial, sans-serif",
        fontSize: "32px",
        color: "#fff5d6",
      })
      .setOrigin(0.5);
    this.cart = this.add.container(710, FLOOR_Y - 4, [
      wheelLeft,
      wheelRight,
      cartBody,
      cartRim,
      cartMark,
    ]);

    const thruster = this.add.graphics();
    thruster.fillStyle(0x34434a, 1);
    thruster.fillRoundedRect(965, FLOOR_Y - 116, 150, 92, 28);
    thruster.lineStyle(7, INK, 1);
    thruster.strokeRoundedRect(965, FLOOR_Y - 116, 150, 92, 28);
    thruster.fillStyle(CORAL, 1);
    thruster.fillTriangle(1_000, FLOOR_Y - 89, 1_040, FLOOR_Y - 70, 1_000, FLOOR_Y - 51);
    thruster.fillStyle(0x59676d, 1);
    thruster.fillRect(1_110, FLOOR_Y - 101, 42, 62);
    thruster.lineStyle(6, INK, 1);
    thruster.strokeRect(1_110, FLOOR_Y - 101, 42, 62);

    this.thrusterBeam = this.add
      .rectangle(1_330, FLOOR_Y - 70, 360, 54, 0x78e8ff, 0)
      .setOrigin(0.5)
      .setStrokeStyle(5, 0xd8fbff, 0);
  }

  private createCharacters(): void {
    this.createCharacter("raccoon-bandit", "RINGO", 230, FLOOR_Y);
    this.createCharacter("slime", "GLIB", 395, FLOOR_Y);
    this.moki = this.createCharacter("moki", "MOKI", 1_285, FLOOR_Y);
  }

  private createCharacter(
    visualId: "raccoon-bandit" | "slime" | "moki",
    label: string,
    x: number,
    feetY: number,
  ): CharacterView {
    const visual = CREATURE_VISUALS[visualId];
    const sprite = this.add
      .sprite(0, -61, visual.textureKey, visual.poseFrames.ready)
      .setDisplaySize(122, 122);
    const name = this.add
      .text(0, 14, label, {
        fontFamily: "Segoe UI, Arial, sans-serif",
        fontSize: "16px",
        fontStyle: "bold",
        color: "#fff5d6",
        stroke: "#142c33",
        strokeThickness: 5,
      })
      .setOrigin(0.5);
    const container = this.add.container(x, feetY, [sprite, name]).setDepth(8);
    if ((visual.motionFrames.idle?.length ?? 0) > 1) {
      sprite.play(creatureAnimationKey(visualId, "idle"), true);
    }
    return { container, sprite };
  }

  private createPlanPanel(): void {
    this.add
      .rectangle(RENDER_WIDTH / 2, 166, 1_300, 164, INK, 0.94)
      .setStrokeStyle(4, YELLOW, 0.9);
    this.planTitle = this.add.text(180, 103, "", {
      fontFamily: "Segoe UI, Arial, sans-serif",
      fontSize: "24px",
      fontStyle: "bold",
      color: "#ffcd5d",
    });
    this.planSummary = this.add.text(180, 143, "", {
      fontFamily: "Consolas, ui-monospace, monospace",
      fontSize: "18px",
      fontStyle: "bold",
      color: "#fff5d6",
    });
    this.planReason = this.add.text(180, 183, "", {
      fontFamily: "Segoe UI, Arial, sans-serif",
      fontSize: "17px",
      color: "#d9eee9",
    });
    this.planRisk = this.add.text(180, 219, "", {
      fontFamily: "Segoe UI, Arial, sans-serif",
      fontSize: "17px",
      fontStyle: "bold",
      color: "#ff8f7f",
    });
  }

  private createControls(): void {
    this.statusText = this.add
      .text(RENDER_WIDTH / 2, 758, "Plan prüfen und dann bewusst entscheiden.", {
        fontFamily: "Consolas, ui-monospace, monospace",
        fontSize: "17px",
        fontStyle: "bold",
        color: "#fff5d6",
        backgroundColor: "#142c33",
        padding: { x: 14, y: 7 },
      })
      .setOrigin(0.5);

    this.executeButton = createMenuButton(this, {
      x: 355,
      y: 838,
      width: 300,
      height: 62,
      label: "PLAN AUSFÜHREN",
      accent: 0x77bf43,
      onClick: () => this.executePlan(),
    });
    this.alternativeButton = createMenuButton(this, {
      x: 685,
      y: 838,
      width: 300,
      height: 62,
      label: "ALTERNATIVE",
      accent: TEAL,
      onClick: () => this.togglePlan(),
    });
    createMenuButton(this, {
      x: 1_015,
      y: 838,
      width: 300,
      height: 62,
      label: "TEST NEU STARTEN",
      onClick: () => this.scene.restart(),
    });
    createMenuButton(this, {
      x: 1_345,
      y: 838,
      width: 300,
      height: 62,
      label: "ZURÜCK ZUM MENÜ",
      accent: 0xd9843a,
      onClick: () => this.scene.start("MainMenuScene"),
    });
  }

  private togglePlan(): void {
    const next =
      this.labState.planId === "risky-chain"
        ? "controlled-push"
        : "risky-chain";
    this.labState = selectActionMapPlan(this.labState, next);
    this.updatePlanPanel();
  }

  private updatePlanPanel(): void {
    const plan = ACTION_MAP_PLANS[this.labState.planId];
    this.planTitle.setText(plan.title);
    this.planSummary.setText(plan.summary);
    this.planReason.setText(`GRUND: ${plan.reason}`);
    this.planRisk.setText(`RISIKO: ${plan.risk}`);
    this.alternativeButton?.label.setText(
      this.labState.planId === "risky-chain"
        ? "ALTERNATIVE"
        : "RINGOS PLAN",
    );
  }

  private executePlan(): void {
    if (this.labState.phase !== "planning") {
      return;
    }

    this.labState = beginActionMapPlan(this.labState);
    this.executeButton.setEnabled(false);
    this.alternativeButton.setEnabled(false);
    this.statusText.setText("Plan läuft – Ursache und Wirkung bleiben nacheinander lesbar.");

    for (const event of ACTION_MAP_PLANS[this.labState.planId].events) {
      this.time.delayedCall(event.atMilliseconds, () => {
        this.labState = applyActionMapEvent(this.labState, event);
        this.presentEvent(event);
      });
    }
  }

  private presentEvent(event: ScheduledActionMapEvent): void {
    const status: Record<ActionMapEventType, string> = {
      "sign-falling": "1 · RINGO löst das Schild. Es kippt sichtbar.",
      "sign-landed": "Das Schild trifft die Bremse des Wagens.",
      "cart-rolling": "2 · Der Wagen rollt auf seiner festen Teststrecke.",
      "cart-stopped": "Der Wagen rammt den Triebwerkshebel.",
      "moki-evaded": "GLIB warnt Moki. Moki springt auf die sichere Plattform.",
      "thruster-fired": "3 · Das Triebwerk feuert nach rechts.",
      "moki-blasted": "Moki stand noch im Strahl. Die vorhandene Rückstoßphysik übernimmt.",
      "thruster-spent": "Das Triebwerk ist verbraucht; die Bühne bleibt verändert.",
      "sequence-complete":
        this.labState.mokiBlasted
          ? "TEST BEENDET · RINGO: „Genau so war das ungefähr geplant.“"
          : "TEST BEENDET · GLIB: „Weniger Flugzeit. Gleicher Effekt.“",
    };
    this.statusText.setText(status[event.type]);

    switch (event.type) {
      case "sign-falling":
        this.tweens.add({
          targets: this.sign,
          angle: 72,
          duration: 500,
          ease: "Quad.easeIn",
        });
        break;
      case "sign-landed":
        this.showImpact(this.sign.x + 120, FLOOR_Y - 4, YELLOW);
        break;
      case "cart-rolling":
        this.tweens.add({
          targets: this.cart,
          x: 920,
          angle: 7,
          duration: 680,
          ease: "Sine.easeIn",
        });
        break;
      case "cart-stopped":
        this.showImpact(950, FLOOR_Y - 42, CORAL);
        break;
      case "moki-evaded":
        this.moki.sprite.play(creatureAnimationKey("moki", "jump"), true);
        this.tweens.add({
          targets: this.moki.container,
          x: 1_320,
          y: 540,
          duration: 300,
          ease: "Quad.easeOut",
        });
        break;
      case "thruster-fired":
        this.thrusterBeam.setFillStyle(0x78e8ff, 0.88);
        this.thrusterBeam.setStrokeStyle(5, 0xd8fbff, 0.95);
        this.tweens.add({
          targets: this.thrusterBeam,
          scaleX: 1.08,
          alpha: 0.72,
          duration: 160,
          yoyo: true,
          repeat: 3,
        });
        break;
      case "moki-blasted":
        this.animateMokiKnockback();
        break;
      case "thruster-spent":
        this.tweens.killTweensOf(this.thrusterBeam);
        this.thrusterBeam.setAlpha(0.14).setFillStyle(0x75868d, 0.3);
        break;
      case "sequence-complete":
        this.executeButton.label.setText("TEST BEENDET");
        break;
    }
  }

  private animateMokiKnockback(): void {
    this.moki.sprite.play(creatureAnimationKey("moki", "startled"), true);
    const terrain = BinaryTerrainMask.fromWorldPredicate(
      {
        worldWidth: RENDER_WIDTH,
        worldHeight: RENDER_HEIGHT,
        cellSize: 4,
      },
      (_x, y) => y >= FLOOR_Y + 8,
    );
    const result = simulateExplosionKnockback({
      terrain,
      startPosition: {
        x: this.moki.container.x,
        y: this.moki.container.y,
      },
      explosionCenter: { x: 1_050, y: FLOOR_Y - 58 },
      explosionRadius: 520,
      maximumSpeed: 540,
      maximumBounces: 1,
    });

    result.samples.forEach((sample, index) => {
      if (index % 3 !== 0 && index !== result.samples.length - 1) {
        return;
      }
      this.time.delayedCall(sample.timeSeconds * 1_000, () => {
        this.moki.container.setPosition(sample.position.x, sample.position.y);
      });
    });
  }

  private showImpact(x: number, y: number, color: number): void {
    const ring = this.add
      .circle(x, y, 16, color, 0.25)
      .setStrokeStyle(7, color, 1)
      .setDepth(12);
    this.tweens.add({
      targets: ring,
      scale: 3,
      alpha: 0,
      duration: 340,
      ease: "Quad.easeOut",
      onComplete: () => ring.destroy(),
    });
  }
}
