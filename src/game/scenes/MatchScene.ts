import Phaser from "phaser";

import {
  CREATURE_VISUALS,
  creatureAnimationKey,
  registerCreatureAnimations,
  type CreatureMotion,
  type CreaturePose,
  type CreatureVisualId,
} from "../../content/characters/creatureKits";
import { MAP_DEFINITIONS } from "../../content/maps/mapCatalog";
import { createTerrainMaskFromImage } from "../../content/maps/terrainMaskFromImage";
import {
  COMIC_PROJECTILE_TEXTURE_KEY,
  comicProjectileDisplaySize,
  comicProjectileFrame,
} from "../../content/projectiles/comicProjectileKit";
import {
  FEEDBACK_ICON_TEXTURE_KEY,
  feedbackIconFrame,
} from "../../content/ui/feedbackIconKit";
import {
  COMIC_VFX_TEXTURE_KEY,
  comicVfxFrame,
} from "../../content/vfx/comicVfxKit";
import {
  SECONDARY_VFX_TEXTURE_KEY,
  secondaryVfxFrames,
  type SecondaryVfx,
} from "../../content/vfx/secondaryVfxKit";
import {
  PERSONALITY_PERCEPTION_NOTES,
  topUtilityReasons,
  WEAPON_PROFILES,
  type Personality,
  type RocketActionPlan,
  type RocketCandidate,
  type WeaponId,
} from "../../simulation/ai/RocketActionPlanner";
import {
  createMatchSimulation,
  type MatchSimulationState,
  type SimulationUnit,
} from "../../simulation/match/matchSimulationState";
import {
  commandWeapon,
  cycleActivePersonality,
  rejectActivePlan,
} from "../../simulation/match/commands";
import { planTurn, type TurnPlan } from "../../simulation/match/planTurn";
import {
  concludeTurn,
  resolveTurn,
  type MatchTurnEvent,
} from "../../simulation/match/resolveTurn";
import {
  sampleTrajectoryAtElapsed,
  type Vector2,
} from "../../simulation/ballistics/Ballistics";
import type { LocalMovementPlan } from "../../simulation/movement/LocalMovementPlanner";
import type { ExplosionKnockbackResult } from "../../simulation/movement/ExplosionKnockback";
import {
  upcomingLivingCombatants,
  type MatchState,
  type TeamId,
} from "../../simulation/state/matchState";
import type { BinaryTerrainMask } from "../../simulation/terrain/TerrainMask";
import {
  frameCameraPoints,
  overviewCameraFrame,
  type CameraFrame,
  type CameraPoint,
} from "../camera/CameraFraming";
import {
  LOGICAL_HEIGHT,
  LOGICAL_WIDTH,
  RENDER_HEIGHT,
  RENDER_SCALE,
  RENDER_WIDTH,
  WORLD_HEIGHT,
  WORLD_WIDTH,
} from "../config";
import {
  cameraCenterForGestureAnchor,
  nextPinchZoom,
  touchDistance,
  touchMidpoint,
  type TouchPoint,
} from "../input/TouchCameraGesture";
import { summarizeTeamStatus } from "../hud/TeamStatus";
import { TerrainMaskRenderer } from "../rendering/TerrainMaskRenderer";
import {
  createQuickMatchConfig,
  type MatchLaunchConfig,
  type MatchReport,
} from "../session/matchSession";
import {
  buildMatchUnitDefinitions,
  type MatchSetupUnit,
} from "../session/matchSetup";

const TERRAIN_TEXTURE_KEY = "autonomous-action-terrain";
const CAMERA_SAFE_INSETS = {
  left: 24,
  right: 320,
  top: 88,
  bottom: 54,
} as const;
const PERSONALITY_LABELS: Record<Personality, string> = {
  cautious: "VORSICHTIG",
  explosive: "SPRENGFREUDIG",
  showboat: "ANGEBERISCH",
};

const COLORS = {
  night: 0x132d35,
  ink: "#142c33",
  cream: "#fff5d6",
  teal: 0x176f6b,
  tealBright: 0x55d7c2,
  coral: 0xd95d4d,
  yellow: 0xffcd5d,
  paper: 0xfff5d6,
} as const;

interface UnitView {
  /** Fachliche Wahrheit der Figur – gehört der Match-Engine, nicht der Szene. */
  readonly unit: SimulationUnit;
  readonly container: Phaser.GameObjects.Container;
  readonly healthText: Phaser.GameObjects.Text;
  readonly healthBarFill: Phaser.GameObjects.Rectangle;
  readonly nameText: Phaser.GameObjects.Text;
  readonly activeRing: Phaser.GameObjects.Arc;
  readonly sprite: Phaser.GameObjects.Sprite;
  readonly visualId: CreatureVisualId;
  readonly baseSpriteScaleX: number;
  readonly baseSpriteScaleY: number;
  readonly baseSpriteY: number;
}

interface CameraKeys {
  readonly left: Phaser.Input.Keyboard.Key;
  readonly right: Phaser.Input.Keyboard.Key;
  readonly up: Phaser.Input.Keyboard.Key;
  readonly down: Phaser.Input.Keyboard.Key;
}

interface KnockbackAnimation {
  readonly view: UnitView;
  readonly result: ExplosionKnockbackResult;
}

type ActionState =
  | "planning"
  | "moving"
  | "executing"
  | "resolving"
  | "match-over";

export class MatchScene extends Phaser.Scene {
  private terrainMask!: BinaryTerrainMask;
  private terrainRenderer!: TerrainMaskRenderer;
  private pathGraphics!: Phaser.GameObjects.Graphics;
  private effectGraphics!: Phaser.GameObjects.Graphics;
  private cameraDebugGraphics!: Phaser.GameObjects.Graphics;
  private debugText!: Phaser.GameObjects.Text;
  private teamHudGraphics!: Phaser.GameObjects.Graphics;
  private teamHudTitleTexts = new Map<TeamId, Phaser.GameObjects.Text>();
  private teamHudTotalTexts = new Map<TeamId, Phaser.GameObjects.Text>();
  private teamHudUnitTexts = new Map<string, Phaser.GameObjects.Text>();
  private headlineText!: Phaser.GameObjects.Text;
  private turnQueueText!: Phaser.GameObjects.Text;
  private intentHeaderText!: Phaser.GameObjects.Text;
  private intentText!: Phaser.GameObjects.Text;
  private statusText!: Phaser.GameObjects.Text;
  private interventionText!: Phaser.GameObjects.Text;
  private executeButton!: Phaser.GameObjects.Rectangle;
  private executeButtonText!: Phaser.GameObjects.Text;
  private rejectButton!: Phaser.GameObjects.Rectangle;
  private rejectButtonText!: Phaser.GameObjects.Text;
  private weaponCommandButtons = new Map<
    WeaponId,
    {
      readonly background: Phaser.GameObjects.Rectangle;
      readonly text: Phaser.GameObjects.Text;
      readonly icon: Phaser.GameObjects.Sprite;
    }
  >();
  private helpButton!: Phaser.GameObjects.Rectangle;
  private helpButtonText!: Phaser.GameObjects.Text;
  private helpOverlayObjects: (
    | Phaser.GameObjects.Graphics
    | Phaser.GameObjects.Text
  )[] = [];
  private helpVisible = false;
  private projectile!: Phaser.GameObjects.Sprite;
  private nextGrenadeBounceIndex = 0;
  private uiCamera?: Phaser.Cameras.Scene2D.Camera;
  private cameraKeys?: CameraKeys;
  private cameraTarget: CameraFrame = {
    centerX: WORLD_WIDTH / 2,
    centerY: WORLD_HEIGHT / 2,
    zoom: 0.4,
  };
  private units: UnitView[] = [];
  private simulation!: MatchSimulationState;
  private setupUnits: readonly MatchSetupUnit[] = [];
  private turnPlan!: TurnPlan;
  private pendingEvents: readonly MatchTurnEvent[] = [];
  private plan!: RocketActionPlan;
  private movementPlan!: LocalMovementPlan;
  private personality: Personality = "cautious";
  private debugEnabled = false;
  private cameraMovementReduced = false;
  private actionState: ActionState = "planning";
  private executionElapsedSeconds = 0;
  private lastPlaybackSampleIndex = -1;
  private lastDirtyRegionCells = "–";
  private lastDirtyUpdateMilliseconds = 0;
  private autoActionTimer: Phaser.Time.TimerEvent | undefined;
  private opponentAutoReady = false;
  private launchConfig: MatchLaunchConfig = createQuickMatchConfig();
  private touchPointers = new Map<number, TouchPoint>();
  private touchGestureMidpoint: TouchPoint | null = null;
  private touchGestureDistance = 0;
  private touchGesturePointerCount = 0;

  public constructor() {
    super("MatchScene");
  }

  /** Fachliche Wahrheit liegt in der Match-Engine; die Szene liest nur. */
  private get matchState(): MatchState {
    return this.simulation.matchState;
  }

  public init(data: { readonly launchConfig?: MatchLaunchConfig }): void {
    this.launchConfig = data.launchConfig ?? createQuickMatchConfig();
  }

  public create(): void {
    const map = MAP_DEFINITIONS[this.launchConfig.mapId];
    const terrainSource = this.textures
      .get(map.terrainTextureKey)
      .getSourceImage() as CanvasImageSource;
    this.terrainMask = createTerrainMaskFromImage(
      terrainSource,
      WORLD_WIDTH,
      WORLD_HEIGHT,
      map.terrainCellSize,
    );
    this.personality = "cautious";
    this.setupUnits = buildMatchUnitDefinitions(this.launchConfig);
    this.simulation = createMatchSimulation({
      seed: this.launchConfig.seed,
      terrain: this.terrainMask,
      unitDefinitions: this.setupUnits,
    });
    this.debugEnabled = false;
    this.cameraMovementReduced = false;
    this.actionState = "planning";
    this.executionElapsedSeconds = 0;
    this.lastPlaybackSampleIndex = -1;
    this.lastDirtyRegionCells = "–";
    this.lastDirtyUpdateMilliseconds = 0;
    this.autoActionTimer = undefined;
    this.opponentAutoReady = false;
    this.units = [];
    this.teamHudTitleTexts = new Map();
    this.teamHudTotalTexts = new Map();
    this.teamHudUnitTexts = new Map();
    this.helpOverlayObjects = [];
    this.weaponCommandButtons = new Map();
    this.helpVisible = false;
    this.nextGrenadeBounceIndex = 0;
    this.touchPointers = new Map();
    this.touchGestureMidpoint = null;
    this.touchGestureDistance = 0;
    this.touchGesturePointerCount = 0;

    this.configureWorldCamera();
    this.drawBackdrop();
    this.terrainRenderer = new TerrainMaskRenderer(
      this,
      this.terrainMask,
      `${TERRAIN_TEXTURE_KEY}:${map.id}`,
      map.terrainTextureKey,
    );
    this.terrainRenderer.image.setDepth(10);
    this.pathGraphics = this.add.graphics().setDepth(26);
    this.effectGraphics = this.add.graphics().setDepth(27);
    this.cameraDebugGraphics = this.add.graphics().setDepth(95).setVisible(false);
    registerCreatureAnimations(this);
    this.createUnits();
    this.createProjectile();

    const worldObjects = [...this.children.list];
    this.drawHeader();
    this.createTeamHud();
    this.createIntentPanel();
    this.createStatusBar();
    this.createHelpOverlay();
    this.createUiCamera(worldObjects);
    this.bindControls();
    this.showOverview(false);
    this.replan(
      `${this.activeUnit().unit.displayName} prüft den ersten Plan in der großen Welt.`,
    );
  }

  public override update(_time: number, deltaMilliseconds: number): void {
    if (this.actionState === "moving") {
      this.updateCameraDebug();
      return;
    }

    if (this.actionState !== "executing") {
      this.updateManualCamera(deltaMilliseconds);
      this.updateCameraDebug();
      return;
    }

    if (!this.plan.selected) {
      return;
    }

    this.executionElapsedSeconds += deltaMilliseconds / 1000;
    const selected = this.plan.selected;
    // Task 024: Wiedergegeben wird die ausgeführte Flugbahn aus dem
    // Streukegel, nicht die angekündigte Absicht.
    const executedTrajectory =
      this.turnPlan.execution?.trajectory ?? selected.trajectory;
    const playback = sampleTrajectoryAtElapsed(
      executedTrajectory,
      this.executionElapsedSeconds,
    );

    if (selected.weaponId === "grenade") {
      this.projectile.setFrame(
        comicProjectileFrame(
          "grenade",
          Math.floor(this.executionElapsedSeconds * 10) % 2 === 1,
        ),
      );
      while (
        this.nextGrenadeBounceIndex < executedTrajectory.bounces.length &&
        (executedTrajectory.bounces[this.nextGrenadeBounceIndex]?.timeSeconds ??
          Number.POSITIVE_INFINITY) <= this.executionElapsedSeconds
      ) {
        const bounce = executedTrajectory.bounces[this.nextGrenadeBounceIndex];
        if (bounce) {
          this.showSecondaryVfx(
            "bounce",
            bounce.position.x,
            bounce.position.y,
          );
        }
        this.nextGrenadeBounceIndex += 1;
      }
    }

    if (playback.sampleIndex !== this.lastPlaybackSampleIndex) {
      this.lastPlaybackSampleIndex = playback.sampleIndex;
      this.projectile.setPosition(
        playback.sample.position.x,
        playback.sample.position.y,
      );
      this.projectile.setRotation(
        Math.atan2(playback.sample.velocity.y, playback.sample.velocity.x),
      );
    }

    this.followProjectile(playback.sample.position, deltaMilliseconds);
    this.updateCameraDebug();

    if (playback.complete) {
      this.completeAction();
    }
  }

  private configureWorldCamera(): void {
    this.cameras.main
      .setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT)
      .setBackgroundColor("#102a36")
      .setRoundPixels(false);
  }

  private createUiCamera(
    worldObjects: readonly Phaser.GameObjects.GameObject[],
  ): void {
    const uiObjects = this.children.list.filter(
      (gameObject) => !worldObjects.includes(gameObject),
    );
    this.uiCamera = this.cameras.add(
      0,
      0,
      RENDER_WIDTH,
      RENDER_HEIGHT,
      false,
      "hud-camera",
    );
    this.uiCamera
      .setZoom(RENDER_SCALE)
      .centerOn(LOGICAL_WIDTH / 2, LOGICAL_HEIGHT / 2);
    this.cameras.main.ignore(uiObjects);
    this.uiCamera.ignore([...worldObjects]);
  }

  private drawBackdrop(): void {
    const map = MAP_DEFINITIONS[this.launchConfig.mapId];
    this.add
      .image(0, 0, map.backgroundTextureKey)
      .setOrigin(0, 0)
      .setDisplaySize(WORLD_WIDTH, WORLD_HEIGHT)
      .setDepth(0);
  }

  private drawHeader(): void {
    const turnBackground = this.add.graphics().setDepth(99);
    turnBackground.fillStyle(COLORS.night, 0.94);
    turnBackground.fillRoundedRect(424, 10, 432, 68, 13);
    turnBackground.lineStyle(1, 0xfff5d6, 0.24);
    turnBackground.strokeRoundedRect(424, 10, 432, 68, 13);

    this.add
      .sprite(446, 32, FEEDBACK_ICON_TEXTURE_KEY, feedbackIconFrame("turn"))
      .setDisplaySize(28, 28)
      .setDepth(100);
    this.headlineText = this.add
      .text(468, 19, "ZUG 1  ·  BRUNO", {
        fontFamily: "Segoe UI, Arial, sans-serif",
        fontSize: "17px",
        fontStyle: "bold",
        color: COLORS.cream,
      })
      .setDepth(100);

    this.turnQueueText = this.add
      .text(468, 48, "", {
        fontFamily: "Consolas, ui-monospace, monospace",
        fontSize: "11px",
        fontStyle: "bold",
        color: "#b9d3ce",
      })
      .setDepth(100);
    this.updateTurnHud();
  }

  private updateTurnHud(): void {
    const upcoming = upcomingLivingCombatants(this.matchState, 4)
      .map((id) => this.units.find((unit) => unit.unit.id === id))
      .filter((unit): unit is UnitView => Boolean(unit));
    const current = upcoming[0];

    if (!current) {
      this.headlineText.setText(`ZUG ${this.matchState.turnNumber}`);
      this.turnQueueText.setText("KEINE KAMPFFÄHIGE FIGUR");
      return;
    }

    this.headlineText.setText(
      `ZUG ${this.matchState.turnNumber}  ·  ${current.unit.displayName}`,
    );
    const following = upcoming
      .slice(1)
      .map((unit) => unit.unit.displayName)
      .join("  ›  ");
    this.turnQueueText.setText(
      following.length > 0 ? `DANACH  ${following}` : "LETZTE FIGUR IM MATCH",
    );
  }

  private createTeamHud(): void {
    this.teamHudGraphics = this.add.graphics().setDepth(98);
    const layouts: readonly {
      team: TeamId;
      title: string;
      x: number;
    }[] = [
      { team: "crew", title: "DEINE CREW", x: 18 },
      { team: "rivals", title: "RIVALEN", x: 874 },
    ];

    for (const layout of layouts) {
      const titleText = this.add
        .text(layout.x + 12, 18, layout.title, {
          fontFamily: "Segoe UI, Arial, sans-serif",
          fontSize: "12px",
          fontStyle: "bold",
          color: COLORS.cream,
        })
        .setDepth(100);
      const totalText = this.add
        .text(layout.x + 376, 18, "", {
          fontFamily: "Consolas, ui-monospace, monospace",
          fontSize: "10px",
          fontStyle: "bold",
          color: COLORS.cream,
        })
        .setOrigin(1, 0)
        .setDepth(100);
      this.add
        .sprite(
          layout.x + 286,
          27,
          FEEDBACK_ICON_TEXTURE_KEY,
          feedbackIconFrame("health"),
        )
        .setDisplaySize(20, 20)
        .setDepth(100);
      this.teamHudTitleTexts.set(layout.team, titleText);
      this.teamHudTotalTexts.set(layout.team, totalText);

      const teamUnits = this.units.filter(
        (unit) => unit.unit.team === layout.team,
      );
      for (const [index, unit] of teamUnits.entries()) {
        const unitText = this.add
          .text(layout.x + 12 + index * 120, 42, "", {
            fontFamily: "Consolas, ui-monospace, monospace",
            fontSize: "9px",
            fontStyle: "bold",
            color: COLORS.cream,
          })
          .setDepth(100);
        this.teamHudUnitTexts.set(unit.unit.id, unitText);
      }
    }

    this.updateTeamHud();
  }

  private updateTeamHud(): void {
    const layouts: readonly {
      team: TeamId;
      title: string;
      x: number;
      background: number;
      accent: number;
    }[] = [
      {
        team: "crew",
        title: "DEINE CREW",
        x: 18,
        background: 0x124e4c,
        accent: COLORS.tealBright,
      },
      {
        team: "rivals",
        title: "RIVALEN",
        x: 874,
        background: 0x713d39,
        accent: COLORS.yellow,
      },
    ];
    const status = summarizeTeamStatus(
      this.units.map((unit) => ({
        id: unit.unit.id,
        displayName: unit.unit.displayName,
        team: unit.unit.team,
        hitPoints: unit.unit.hitPoints,
        maximumHitPoints: unit.unit.maximumHitPoints,
      })),
    );
    const showActive = this.actionState !== "match-over";
    this.teamHudGraphics.clear();

    for (const layout of layouts) {
      const teamStatus = status[layout.team];
      const activeTeam =
        showActive && this.activeUnit().unit.team === layout.team;
      this.teamHudGraphics.fillStyle(layout.background, 0.94);
      this.teamHudGraphics.fillRoundedRect(layout.x, 10, 388, 68, 13);
      this.teamHudGraphics.lineStyle(
        activeTeam ? 3 : 1,
        activeTeam ? COLORS.yellow : 0xfff5d6,
        activeTeam ? 1 : 0.28,
      );
      this.teamHudGraphics.strokeRoundedRect(layout.x, 10, 388, 68, 13);

      this.teamHudTitleTexts
        .get(layout.team)
        ?.setText(`${layout.title}${activeTeam ? "  ·  AM ZUG" : ""}`);
      this.teamHudTotalTexts
        .get(layout.team)
        ?.setText(`${teamStatus.hitPoints} / ${teamStatus.maximumHitPoints}`);

      for (const [index, member] of teamStatus.members.entries()) {
        const activeUnit =
          showActive && member.id === this.matchState.activeCombatantId;
        this.teamHudUnitTexts
          .get(member.id)
          ?.setText(
            `${activeUnit ? "▶ " : ""}${member.displayName}  ·  ${member.hitPoints} HP`,
          )
          .setColor(activeUnit ? "#ffcd5d" : COLORS.cream)
          .setAlpha(member.defeated ? 0.46 : 1);

        const barX = layout.x + 12 + index * 120;
        const barWidth = 104;
        const ratio = member.hitPoints / member.maximumHitPoints;
        this.teamHudGraphics.fillStyle(0x0c2429, 0.72);
        this.teamHudGraphics.fillRoundedRect(barX, 62, barWidth, 6, 3);
        if (ratio > 0) {
          this.teamHudGraphics.fillStyle(
            ratio <= 0.34 ? COLORS.coral : layout.accent,
            1,
          );
          this.teamHudGraphics.fillRoundedRect(
            barX,
            62,
            Math.max(5, barWidth * ratio),
            6,
            3,
          );
        }
      }
    }
  }

  private createUnits(): void {
    for (const [index, unit] of this.simulation.units.entries()) {
      const setup = this.setupUnits[index];

      if (!setup || setup.id !== unit.id) {
        throw new Error(`Setup definition mismatch for unit ${unit.id}.`);
      }

      this.units.push(this.drawUnit(unit, index === 0, setup.visualId));
    }
  }

  private drawUnit(
    unit: SimulationUnit,
    active: boolean,
    visualId: CreatureVisualId,
  ): UnitView {
    const visual = CREATURE_VISUALS[visualId];
    const shadow = this.add.ellipse(0, -3, 64, 14, 0x10242a, 0.26);
    const activeRing = this.add.circle(0, -47, 48, 0xffffff, 0);
    activeRing.setStrokeStyle(active ? 3 : 0, COLORS.yellow, active ? 0.9 : 0);
    const sprite = this.add
      .sprite(
        0,
        7,
        visual.textureKey,
        visual.poseFrames[active ? "planning" : "ready"],
      )
      .setOrigin(0.5, 1)
      .setDisplaySize(visual.displaySize, visual.displaySize);

    const name = this.add
      .text(0, -133, unit.displayName, {
        fontFamily: "Consolas, ui-monospace, monospace",
        fontSize: active ? "13px" : "11px",
        fontStyle: "bold",
        color: active ? "#16343b" : COLORS.cream,
        backgroundColor:
          active ? "#ffcd5d" : unit.team === "crew" ? "#176f6b" : "#b8463c",
        padding: { x: 7, y: 4 },
      })
      .setOrigin(0.5);
    const healthBarBackground = this.add.rectangle(
      0,
      -108,
      82,
      14,
      0x10242a,
      0.9,
    );
    healthBarBackground.setStrokeStyle(2, 0xfff5d6, 0.72);
    const healthBarFill = this.add
      .rectangle(
        -38,
        -108,
        76,
        8,
        unit.team === "crew" ? COLORS.tealBright : COLORS.coral,
        1,
      )
      .setOrigin(0, 0.5);
    const healthText = this.add
      .text(0, -109, String(unit.hitPoints), {
        fontFamily: "Consolas, ui-monospace, monospace",
        fontSize: "8px",
        fontStyle: "bold",
        color: COLORS.cream,
      })
      .setOrigin(0.5);

    const container = this.add
      .container(unit.position.x, unit.position.y, [
        shadow,
        activeRing,
        sprite,
        name,
        healthBarBackground,
        healthBarFill,
        healthText,
      ])
      .setDepth(32);

    this.tweens.add({
      targets: activeRing,
      alpha: { from: 0.45, to: 1 },
      scale: { from: 0.92, to: 1.08 },
      duration: 850,
      yoyo: true,
      repeat: -1,
    });

    return {
      unit,
      container,
      healthText,
      healthBarFill,
      nameText: name,
      activeRing,
      sprite,
      visualId,
      baseSpriteScaleX: sprite.scaleX,
      baseSpriteScaleY: sprite.scaleY,
      baseSpriteY: sprite.y,
    };
  }

  private createProjectile(): void {
    this.projectile = this.add
      .sprite(
        -100,
        -100,
        COMIC_PROJECTILE_TEXTURE_KEY,
        comicProjectileFrame("rocket"),
      )
      .setDisplaySize(
        comicProjectileDisplaySize("rocket"),
        comicProjectileDisplaySize("rocket"),
      )
      .setDepth(70)
      .setVisible(false);
    this.setProjectileAppearance("rocket");
  }

  private setProjectileAppearance(weaponId: WeaponId): void {
    const displaySize = comicProjectileDisplaySize(weaponId);
    this.projectile
      .setFrame(comicProjectileFrame(weaponId))
      .setDisplaySize(displaySize, displaySize);
  }

  private createIntentPanel(): void {
    const panel = this.add.graphics().setDepth(80);
    panel.fillStyle(COLORS.night, 0.95);
    panel.fillRoundedRect(974, 96, 288, 406, 17);
    panel.lineStyle(2, 0xfff5d6, 0.16);
    panel.strokeRoundedRect(974, 96, 288, 406, 17);
    panel.fillStyle(COLORS.yellow, 1);
    panel.fillRoundedRect(988, 110, 260, 34, 9);

    this.add
      .sprite(
        1005,
        127,
        FEEDBACK_ICON_TEXTURE_KEY,
        feedbackIconFrame("manager"),
      )
      .setDisplaySize(26, 26)
      .setDepth(82);

    this.intentHeaderText = this.add
      .text(1024, 118, "PLAN VON BRUNO", {
        fontFamily: "Segoe UI, Arial, sans-serif",
        fontSize: "15px",
        fontStyle: "bold",
        color: COLORS.ink,
      })
      .setDepth(82);

    this.intentText = this.add
      .text(992, 157, "", {
        fontFamily: "Segoe UI, Arial, sans-serif",
        fontSize: "11px",
        color: COLORS.cream,
        lineSpacing: 2,
        wordWrap: { width: 252 },
      })
      .setDepth(82);

    this.interventionText = this.add
      .text(992, 367, "", {
        fontFamily: "Consolas, ui-monospace, monospace",
        fontSize: "8px",
        fontStyle: "bold",
        color: "#a6bab5",
        wordWrap: { width: 252 },
      })
      .setDepth(82);

    this.executeButton = this.add
      .rectangle(1040, 425, 120, 36, COLORS.teal, 1)
      .setInteractive({ useHandCursor: true })
      .setDepth(82);
    this.executeButtonText = this.add
      .text(1040, 425, "▶ AUSFÜHREN", {
        fontFamily: "Consolas, ui-monospace, monospace",
        fontSize: "10px",
        fontStyle: "bold",
        color: COLORS.cream,
      })
      .setOrigin(0.5)
      .setDepth(83);
    this.rejectButton = this.add
      .rectangle(1180, 425, 120, 36, COLORS.coral, 1)
      .setInteractive({ useHandCursor: true })
      .setDepth(82);
    this.rejectButtonText = this.add
      .text(1180, 425, "✕ LASS DAS!", {
        fontFamily: "Consolas, ui-monospace, monospace",
        fontSize: "10px",
        fontStyle: "bold",
        color: COLORS.cream,
      })
      .setOrigin(0.5)
      .setDepth(83);
    this.executeButton.on("pointerdown", this.executeSelected, this);
    this.rejectButton.on("pointerdown", this.rejectCurrentPlan, this);

    const weaponButtonDefinitions: readonly {
      id: WeaponId;
      label: string;
      x: number;
    }[] = [
      { id: "rocket", label: "1 RAKETE", x: 1029 },
      { id: "grenade", label: "2 GRANATE", x: 1118 },
      { id: "breaker", label: "3 BRECHER", x: 1207 },
    ];
    for (const definition of weaponButtonDefinitions) {
      const background = this.add
        .rectangle(definition.x, 482, 82, 24, 0x36565a, 1)
        .setStrokeStyle(1, COLORS.paper, 0.35)
        .setInteractive({ useHandCursor: true })
        .setDepth(82);
      const text = this.add
        .text(definition.x + 8, 482, definition.label, {
          fontFamily: "Consolas, ui-monospace, monospace",
          fontSize: "8px",
          fontStyle: "bold",
          color: COLORS.cream,
        })
        .setOrigin(0.5)
        .setDepth(83);
      const icon = this.add
        .sprite(
          definition.x - 27,
          482,
          FEEDBACK_ICON_TEXTURE_KEY,
          feedbackIconFrame(definition.id),
        )
        .setDisplaySize(18, 18)
        .setDepth(83);
      background.on("pointerdown", () =>
        this.chooseManagerWeapon(definition.id),
      );
      this.weaponCommandButtons.set(definition.id, {
        background,
        text,
        icon,
      });
    }

    const debugBackground = this.add.graphics().setDepth(75);
    debugBackground.fillStyle(0x102a30, 0.94);
    debugBackground.fillRoundedRect(24, 204, 430, 282, 13);
    this.debugText = this.add
      .text(40, 220, "", {
        fontFamily: "Consolas, ui-monospace, monospace",
        fontSize: "11px",
        color: COLORS.cream,
        lineSpacing: 5,
      })
      .setDepth(76);
    debugBackground.setVisible(false);
    this.debugText.setVisible(false);
    this.debugText.setData("background", debugBackground);
  }

  private createStatusBar(): void {
    const bar = this.add.graphics().setDepth(80);
    bar.fillStyle(COLORS.paper, 0.96);
    bar.fillRoundedRect(18, 676, 930, 31, 10);
    this.statusText = this.add
      .text(34, 684, "", {
        fontFamily: "Segoe UI, Arial, sans-serif",
        fontSize: "12px",
        fontStyle: "bold",
        color: COLORS.ink,
      })
      .setDepth(81);
  }

  private createHelpOverlay(): void {
    this.helpButton = this.add
      .rectangle(1208, 691, 108, 30, COLORS.night, 0.94)
      .setStrokeStyle(1, COLORS.paper, 0.45)
      .setInteractive({ useHandCursor: true })
      .setDepth(101);
    this.helpButtonText = this.add
      .text(1208, 691, "?  HILFE  [H]", {
        fontFamily: "Consolas, ui-monospace, monospace",
        fontSize: "10px",
        fontStyle: "bold",
        color: COLORS.cream,
      })
      .setOrigin(0.5)
      .setDepth(102);
    this.helpButton.on("pointerdown", this.toggleHelp, this);

    const background = this.add.graphics().setDepth(118);
    background.fillStyle(0x0c2429, 0.98);
    background.fillRoundedRect(352, 154, 576, 352, 20);
    background.lineStyle(3, COLORS.yellow, 0.9);
    background.strokeRoundedRect(352, 154, 576, 352, 20);
    const title = this.add
      .text(384, 181, "STEUERUNG", {
        fontFamily: "Segoe UI, Arial, sans-serif",
        fontSize: "24px",
        fontStyle: "bold",
        color: COLORS.cream,
      })
      .setDepth(120);
    const controls = this.add
      .text(
        384,
        231,
        [
          "AKTION",
          "Leertaste   angekündigten Plan ausführen",
          "X            einmalig: ‚Lass das!‘",
          "1 / 2 / 3    einmalig Waffe vorgeben",
          "P            Persönlichkeit im Prototyp wechseln",
          "",
          "KAMERA",
          "Pfeile / 1 Finger   Ausschnitt verschieben",
          "Q / E / 2 Finger   heraus- / hineinzoomen",
          "O            Weltübersicht",
          "C            sanfte Kamera / direkte Schnitte",
          "",
          "SYSTEM",
          "D            Debugansicht     R   Match neu starten",
        ].join("\n"),
        {
          fontFamily: "Consolas, ui-monospace, monospace",
          fontSize: "13px",
          color: COLORS.cream,
          lineSpacing: 6,
        },
      )
      .setDepth(120);
    const closeHint = this.add
      .text(896, 476, "H  SCHLIESSEN", {
        fontFamily: "Consolas, ui-monospace, monospace",
        fontSize: "11px",
        fontStyle: "bold",
        color: "#ffcd5d",
      })
      .setOrigin(1, 0)
      .setDepth(120);

    this.helpOverlayObjects = [background, title, controls, closeHint];
    for (const gameObject of this.helpOverlayObjects) {
      gameObject.setVisible(false);
    }
  }

  private toggleHelp(): void {
    this.helpVisible = !this.helpVisible;
    for (const gameObject of this.helpOverlayObjects) {
      gameObject.setVisible(this.helpVisible);
    }
    this.helpButtonText.setText(
      this.helpVisible ? "SCHLIESSEN  [H]" : "?  HILFE  [H]",
    );
  }

  private bindControls(): void {
    const keyboard = this.input.keyboard;

    if (keyboard) {
      this.cameraKeys = keyboard.createCursorKeys();
      keyboard.on("keydown-SPACE", this.executeSelected, this);
      keyboard.on("keydown-X", this.rejectCurrentPlan, this);
      keyboard.on("keydown-ONE", this.chooseRocketWeapon, this);
      keyboard.on("keydown-TWO", this.chooseGrenadeWeapon, this);
      keyboard.on("keydown-THREE", this.chooseBreakerWeapon, this);
      keyboard.on("keydown-P", this.cyclePersonality, this);
      keyboard.on("keydown-D", this.toggleDebug, this);
      keyboard.on("keydown-R", this.resetScene, this);
      keyboard.on("keydown-O", this.showOverview, this);
      keyboard.on("keydown-C", this.toggleReducedCameraMovement, this);
      keyboard.on("keydown-Q", this.zoomOut, this);
      keyboard.on("keydown-E", this.zoomIn, this);
      keyboard.on("keydown-H", this.toggleHelp, this);
    }

    this.input.on("wheel", this.handleMouseWheel, this);
    this.input.on("pointerdown", this.handleTouchPointerDown, this);
    this.input.on("pointermove", this.handleTouchPointerMove, this);
    this.input.on("pointerup", this.handleTouchPointerUp, this);
    this.input.on("pointerupoutside", this.handleTouchPointerUp, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      keyboard?.off("keydown-SPACE", this.executeSelected, this);
      keyboard?.off("keydown-X", this.rejectCurrentPlan, this);
      keyboard?.off("keydown-ONE", this.chooseRocketWeapon, this);
      keyboard?.off("keydown-TWO", this.chooseGrenadeWeapon, this);
      keyboard?.off("keydown-THREE", this.chooseBreakerWeapon, this);
      keyboard?.off("keydown-P", this.cyclePersonality, this);
      keyboard?.off("keydown-D", this.toggleDebug, this);
      keyboard?.off("keydown-R", this.resetScene, this);
      keyboard?.off("keydown-O", this.showOverview, this);
      keyboard?.off("keydown-C", this.toggleReducedCameraMovement, this);
      keyboard?.off("keydown-Q", this.zoomOut, this);
      keyboard?.off("keydown-E", this.zoomIn, this);
      keyboard?.off("keydown-H", this.toggleHelp, this);
      this.input.off("wheel", this.handleMouseWheel, this);
      this.input.off("pointerdown", this.handleTouchPointerDown, this);
      this.input.off("pointermove", this.handleTouchPointerMove, this);
      this.input.off("pointerup", this.handleTouchPointerUp, this);
      this.input.off("pointerupoutside", this.handleTouchPointerUp, this);
      this.clearTouchGesture();
      this.autoActionTimer?.remove(false);
      this.autoActionTimer = undefined;
    });
  }

  private replan(status: string): void {
    const active = this.activeUnit();
    this.opponentAutoReady = false;
    const turnPlan = planTurn(this.simulation);
    this.personality = turnPlan.personality;

    if (turnPlan.preferenceFellBack && turnPlan.usedPreferredWeaponId) {
      status = `${active.unit.displayName} findet mit ${WEAPON_PROFILES[turnPlan.usedPreferredWeaponId].displayName} keinen sicheren Plan und weicht auf das freie Arsenal aus.`;
    } else if (turnPlan.usedPreferredWeaponId) {
      status = `${status} Loadout-Präferenz: ${WEAPON_PROFILES[turnPlan.usedPreferredWeaponId].displayName}.`;
    }

    this.turnPlan = turnPlan;
    this.movementPlan = turnPlan.movement;
    this.plan = turnPlan.action;
    this.pendingEvents = [];

    this.updateActiveUnitPresentation();
    this.renderPlan();
    this.framePlanningCamera();
    this.updateStatus(status);

    if (active.unit.team === "rivals") {
      this.scheduleOpponentAction();
    } else if (!this.plan.selected && this.movementPlan.kind === "hold") {
      this.scheduleTurnAdvance(1_000, "Kein gültiger Plan – Zug wird übersprungen.");
    }
  }

  private renderPlan(): void {
    this.pathGraphics.clear();
    this.effectGraphics.clear();
    const selected = this.plan.selected;

    if (this.debugEnabled) {
      for (const candidate of this.plan.candidates) {
        this.drawTrajectory(
          candidate,
          candidate.valid ? 0xb9d3ce : 0xd95d4d,
          candidate.valid ? 0.25 : 0.18,
          1,
        );
      }
    }

    this.drawMovementPlan();

    if (selected) {
      this.drawTrajectory(selected, COLORS.yellow, 0.96, 3);
      const explosion = selected.trajectory.explosion;

      // Task 024: ehrlicher Streukegel – der tatsächliche Einschlag weicht
      // deterministisch bis zu diesem Radius vom angekündigten Punkt ab.
      if (explosion && this.turnPlan.execution) {
        const spread = this.turnPlan.execution.spreadRadius;
        this.effectGraphics.lineStyle(2, COLORS.yellow, 0.5);
        this.effectGraphics.strokeCircle(
          explosion.center.x,
          explosion.center.y,
          spread,
        );
        this.effectGraphics.lineStyle(1, COLORS.coral, 0.3);
        this.effectGraphics.strokeCircle(
          explosion.center.x,
          explosion.center.y,
          explosion.radius + spread,
        );
      }

      if (explosion) {
        this.effectGraphics.lineStyle(3, COLORS.coral, 0.92);
        this.effectGraphics.strokeCircle(
          explosion.center.x,
          explosion.center.y,
          explosion.radius,
        );
        this.effectGraphics.fillStyle(COLORS.coral, 0.07);
        this.effectGraphics.fillCircle(
          explosion.center.x,
          explosion.center.y,
          explosion.radius,
        );
      }
      if (selected.weaponId === "grenade") {
        this.effectGraphics.lineStyle(3, COLORS.tealBright, 0.95);
        for (const bounce of selected.trajectory.bounces) {
          this.effectGraphics.strokeCircle(
            bounce.position.x,
            bounce.position.y,
            12,
          );
        }
      }
    }

    this.updateIntentText();
    this.updateDebugText();
    this.updateButtons();
  }

  private drawMovementPlan(): void {
    const movement = this.movementPlan;

    if (movement.kind === "hold" || movement.samples.length < 2) {
      return;
    }

    this.pathGraphics.lineStyle(5, COLORS.tealBright, 0.92);
    this.pathGraphics.beginPath();
    this.pathGraphics.moveTo(movement.samples[0]!.x, movement.samples[0]!.y - 8);
    for (const sample of movement.samples.slice(1)) {
      this.pathGraphics.lineTo(sample.x, sample.y - 8);
    }
    this.pathGraphics.strokePath();
    this.pathGraphics.fillStyle(COLORS.tealBright, 1);
    for (let index = 0; index < movement.samples.length; index += 4) {
      const sample = movement.samples[index];
      if (sample) {
        this.pathGraphics.fillCircle(sample.x, sample.y - 8, 4);
      }
    }
  }

  private drawTrajectory(
    candidate: RocketCandidate,
    color: number,
    alpha: number,
    width: number,
  ): void {
    const samples = candidate.trajectory.samples;

    if (samples.length < 2) {
      return;
    }

    this.pathGraphics.lineStyle(width, color, alpha);
    this.pathGraphics.beginPath();
    this.pathGraphics.moveTo(samples[0]!.position.x, samples[0]!.position.y);

    for (let index = 1; index < samples.length; index += 1) {
      const sample = samples[index];

      if (sample) {
        this.pathGraphics.lineTo(sample.position.x, sample.position.y);
      }
    }

    this.pathGraphics.strokePath();

    if (candidate === this.plan.selected) {
      this.pathGraphics.fillStyle(COLORS.yellow, 0.96);
      for (let index = 0; index < samples.length; index += 10) {
        const sample = samples[index];
        if (sample) {
          this.pathGraphics.fillCircle(sample.position.x, sample.position.y, 4);
        }
      }
    }
  }

  private updateIntentText(): void {
    const selected = this.plan.selected;

    if (!selected) {
      this.intentText.setText(
        this.movementPlan.kind === "hold"
          ? "KEIN GÜLTIGER PLAN\n\nKeine sichere Bewegung oder Flugbahn gefunden."
          : `POSITIONIERUNGSZUG\n\nPOSITION  ${movementLabel(this.movementPlan)}\n\nKein freier Schuss. Die Figur verbessert zuerst ihre Position und versucht es in ihrem nächsten Zug erneut.`,
      );
      this.interventionText.setText(
        this.activeUnit().unit.team === "rivals"
          ? "GEGNERAKTION  ·  Positionierung läuft nach der Ankündigung automatisch"
          : this.managerStatusText(),
      );
      return;
    }

    const reasons = topUtilityReasons(selected);
    const positive = reasons.positive
      ? `+ ${reasons.positive.label}  ${Math.abs(reasons.positive.contribution).toFixed(1)}`
      : "+ keine positive Wirkung";
    const negative = reasons.negative
      ? `− ${reasons.negative.label}  ${Math.abs(reasons.negative.contribution).toFixed(1)}`
      : "− kein erkanntes Risiko";
    const targetRank = this.plan.rankedCandidates.findIndex(
      (candidate) => candidate.id === selected.id,
    ) + 1;
    const lastTrajectorySample =
      selected.trajectory.samples[selected.trajectory.samples.length - 1];
    const trajectoryDetail =
      selected.weaponId === "grenade"
        ? `ZÜNDER  ${lastTrajectorySample?.timeSeconds.toFixed(2) ?? "–"} s · ${selected.trajectory.bounces.length} PRALLER`
        : `BOGEN  ${arcLabel(selected.flightTimeSeconds)} · ${selected.flightTimeSeconds.toFixed(2)} s`;
    const spreadDetail = this.turnPlan.execution
      ? `\nSTREUUNG  ±${this.turnPlan.execution.spreadRadius} Punkte (${PERSONALITY_PERCEPTION_NOTES[this.personality]})`
      : "";

    this.intentText.setText(
      `${PERSONALITY_LABELS[this.personality]}\n` +
        `„${personalityQuote(this.personality)}“\n\n` +
        `POSITION  ${movementLabel(this.movementPlan)}\n` +
        `WAFFE  ${selected.weaponName}\n` +
        `ZIEL  ${selected.targetName}\n` +
        `${trajectoryDetail}${spreadDetail}\n` +
        `${Math.round(selected.metrics.enemyDamage)} SCHADEN  ·  ${Math.round(selected.metrics.terrainEffect)}% TERRAIN\n` +
        `RISIKO  ${Math.round(selected.metrics.friendlyDamage)} TEAM  ·  ${Math.round(selected.metrics.selfDamage)} SELBST\n\n` +
        `WARUM?  ${positive}\n` +
        `ABZUG  ${negative}\n` +
        `NUTZEN ${selected.score.toFixed(1)}  ·  RANG ${targetRank}/${this.plan.rankedCandidates.length}`,
    );

    const active = this.activeUnit();
    this.interventionText.setText(
      active.unit.team === "rivals"
        ? "GEGNERAKTION  ·  wird nach der Ankündigung automatisch ausgeführt"
        : this.managerStatusText(),
    );
  }

  private managerStatusText(): string {
    const rejectStatus = this.simulation.interventionUsed
      ? "LASS DAS VERBRAUCHT"
      : "LASS DAS BEREIT";
    const weaponStatus = this.simulation.forcedWeaponId
      ? `WAFFENBEFEHL  ${WEAPON_PROFILES[this.simulation.forcedWeaponId].displayName}`
      : this.simulation.weaponCommandUsed
        ? "WAFFENBEFEHL VERBRAUCHT"
        : "WAFFENBEFEHL BEREIT  ·  unten 1 / 2 / 3 wählen";
    return `${rejectStatus}\n${weaponStatus}`;
  }

  private updateDebugText(): void {
    if (!this.plan) {
      return;
    }

    const rankedIds = new Map(
      this.plan.rankedCandidates.map((candidate, index) => [candidate.id, index + 1]),
    );
    const camera = this.cameras.main;
    const canvasBytes = WORLD_WIDTH * WORLD_HEIGHT * 4;
    const lines = [
      `DEBUG · SEED ${this.plan.seed} · MASKE v${this.terrainMask.version}`,
      `WELT ${WORLD_WIDTH}×${WORLD_HEIGHT} · MASKE ${formatBytes(this.terrainMask.byteLength)}`,
      `CANVAS RGBA ${formatBytes(canvasBytes)} · ZOOM ${(camera.zoom / RENDER_SCALE).toFixed(2)}`,
      `DIRTY ${this.lastDirtyRegionCells} MASKENZELLEN · ${this.lastDirtyUpdateMilliseconds.toFixed(2)} ms`,
      `KAMERA ${Math.round(camera.midPoint.x)},${Math.round(camera.midPoint.y)} → ${Math.round(this.cameraTarget.centerX)},${Math.round(this.cameraTarget.centerY)}`,
      `BEWEGUNG ${this.cameraMovementReduced ? "DIREKTE SCHNITTE" : "SANFT"}`,
      `POSITION ${this.movementPlan.id} · ${this.movementPlan.score.toFixed(1)}`,
      `PERSÖNLICHKEIT ${PERSONALITY_LABELS[this.personality]}`,
      "",
      ...this.plan.candidates.map((candidate) => {
        const rank = rankedIds.get(candidate.id);
        const marker = candidate.id === this.plan.selected?.id ? "▶" : " ";
        const state = candidate.valid ? `#${rank ?? "X"}` : "UNGÜLTIG";
        return `${marker} ${state.padEnd(8)} ${candidate.id.padEnd(17)} ${candidate.score.toFixed(1).padStart(6)}`;
      }),
    ];
    this.debugText.setText(lines.join("\n"));
  }

  private executeSelected(): void {
    if (
      this.actionState !== "planning" ||
      (!this.plan.selected && this.movementPlan.kind === "hold")
    ) {
      return;
    }

    this.clearTouchGesture();

    const active = this.activeUnit();

    if (active.unit.team === "rivals" && !this.opponentAutoReady) {
      return;
    }

    this.autoActionTimer?.remove(false);
    this.autoActionTimer = undefined;

    // Die Engine löst den gesamten Zug sofort fachlich auf; die Szene spielt
    // anschließend nur noch das Ereignisprotokoll als Animation ab.
    this.pendingEvents = resolveTurn(this.simulation, this.turnPlan);

    if (this.movementPlan.kind !== "hold") {
      this.executeMovementThenProjectile(active, this.movementPlan);
      return;
    }

    this.startProjectileExecution(active);
  }

  private executeMovementThenProjectile(
    active: UnitView,
    movement: LocalMovementPlan,
  ): void {
    this.actionState = "moving";
    this.updateButtons();
    this.playCreatureMotion(active, movement.kind === "jump" ? "jump" : "walk");
    active.sprite.setFlipX(movement.destination.x < movement.start.x);
    this.frameMovementCamera(movement);
    this.updateStatus(
      `${active.unit.displayName} ${movement.reason}. Limit: ${Math.round(movement.distance)} von 190 Weltpunkten in diesem Zug.`,
    );

    this.tweens.addCounter({
      from: 0,
      to: movement.samples.length - 1,
      duration: movement.durationSeconds * 1_000,
      ease: movement.kind === "jump" ? "Sine.easeInOut" : "Linear",
      onUpdate: (tween) => {
        const index = Phaser.Math.Clamp(
          Math.round(tween.getValue() ?? 0),
          0,
          movement.samples.length - 1,
        );
        const sample = movement.samples[index];
        if (!sample) {
          return;
        }
        active.container.setPosition(sample.x, sample.y);
      },
      onComplete: () => {
        active.container.setPosition(
          movement.destination.x,
          movement.destination.y,
        );
        if (movement.kind === "jump") {
          this.showSecondaryVfx(
            "landing",
            movement.destination.x,
            movement.destination.y,
          );
        }
        active.sprite.setFlipX(false);
        this.time.delayedCall(140, () => {
          if (this.plan.selected) {
            this.startProjectileExecution(active);
          } else {
            this.actionState = "resolving";
            this.setCreaturePose(active.unit.id, "ready");
            this.updateButtons();
            this.scheduleTurnAdvance(
              500,
              `${active.unit.displayName} hat die Position verbessert und beendet den Zug ohne Schuss.`,
            );
          }
        });
      },
    });
  }

  private startProjectileExecution(active: UnitView): void {
    const selected = this.plan.selected;

    if (
      !selected ||
      (this.actionState !== "planning" && this.actionState !== "moving")
    ) {
      return;
    }

    const firstSample = (this.turnPlan.execution?.trajectory ??
      selected.trajectory).samples[0];

    if (!firstSample) {
      return;
    }

    this.actionState = "executing";
    this.executionElapsedSeconds = 0;
    this.lastPlaybackSampleIndex = 0;
    this.nextGrenadeBounceIndex = 0;
    this.projectile
      .setPosition(firstSample.position.x, firstSample.position.y)
      .setRotation(
        Math.atan2(firstSample.velocity.y, firstSample.velocity.x),
      )
      .setVisible(true);
    this.setProjectileAppearance(selected.weaponId);
    this.showLaunchExhaust(firstSample.position, firstSample.velocity);
    this.setCreaturePose(
      active.unit.id,
      selected.weaponId === "grenade" ? "grenade" : "action",
    );
    this.updateButtons();
    this.updateStatus(
      `${active.unit.displayName} setzt ${selected.weaponName} ein. Die Kamera folgt denselben ${selected.trajectory.samples.length} Ballistik-Samples wie die Vorschau.`,
    );
  }

  private completeAction(): void {
    if (this.actionState !== "executing") {
      return;
    }

    this.actionState = "resolving";
    this.projectile.setVisible(false);
    this.pathGraphics.clear();
    this.effectGraphics.clear();
    const explosionEvent = this.pendingEvents.find(
      (event): event is Extract<MatchTurnEvent, { type: "terrain-mutated" }> =>
        event.type === "terrain-mutated",
    );

    if (!explosionEvent) {
      this.scheduleTurnAdvance(700, "Aktion beendet, aber ohne Explosion.");
      this.updateButtons();
      return;
    }

    const mutation = explosionEvent.mutation;
    const explosion = {
      center: explosionEvent.center,
      radius: explosionEvent.radius,
    };
    const dirtyUpdateStart = performance.now();
    this.terrainRenderer.applyMutation(mutation);
    this.lastDirtyUpdateMilliseconds = performance.now() - dirtyUpdateStart;
    this.lastDirtyRegionCells = mutation.dirtyCells
      ? `${mutation.dirtyCells.width}×${mutation.dirtyCells.height}`
      : "0×0";
    this.showExplosion(explosion.center.x, explosion.center.y, explosion.radius);
    this.presentDamageEvents();
    const knockbackAnimations = this.knockbackAnimationsFromEvents();
    const knockbackPoints = knockbackAnimations.flatMap((animation) =>
      animation.result.samples
        .filter((_sample, index) => index % 8 === 0)
        .map((sample) => ({ ...sample.position })),
    );
    this.frameImpactCamera(explosion.center, knockbackPoints);
    this.updateButtons();
    this.updateDebugText();
    this.updateStatus(
      `Einschlag ${Math.round(explosion.center.x)},${Math.round(explosion.center.y)} · ${mutation.removedCells} Zellen entfernt` +
        (knockbackAnimations.length > 0
          ? ` · Rückstoß für ${knockbackAnimations.length} Figur${knockbackAnimations.length === 1 ? "" : "en"}.`
          : "."),
    );
    this.animateKnockback(knockbackAnimations, () => {
      const fallPoints = this.presentFallEvents();
      this.updateTurnHud();
      this.updateTeamHud();
      const knockbackEndPoints = knockbackAnimations
        .map((animation) =>
          animation.result.samples[animation.result.samples.length - 1],
        )
        .filter((sample): sample is NonNullable<typeof sample> => Boolean(sample))
        .map((sample) => ({ ...sample.position }));
      this.frameImpactCamera(explosion.center, [
        ...knockbackEndPoints,
        ...fallPoints,
      ]);
      this.updateStatus(
        `Rückstoß aufgelöst · ${knockbackAnimations.reduce((sum, animation) => sum + animation.result.bounceCount, 0)} Abpraller · ${fallPoints.length} zusätzliche Fallbewegungen.`,
      );
      this.scheduleTurnAdvance(1_350);
    });
  }

  /**
   * Zeigt die von der Engine gemeldeten Schadensereignisse an. Die Position
   * stammt vom Container (visueller Ist-Stand), weil die Engine die
   * Figurenpositionen bereits auf das Zug-Ende gesetzt hat.
   */
  private presentDamageEvents(): void {
    for (const event of this.pendingEvents) {
      if (event.type !== "damage-applied") {
        continue;
      }

      const view = this.findUnitView(event.unitId);
      this.updateUnitHealthBar(view);
      this.setCreaturePose(view.unit.id, "startled");
      const damageText = this.registerWorldObject(
        this.add
          .text(
            view.container.x,
            view.container.y - 125,
            `−${event.damage}`,
            {
              fontFamily: "Segoe UI, Arial, sans-serif",
              fontSize: "24px",
              fontStyle: "bold",
              color: "#fff5d6",
              stroke: "#b8463c",
              strokeThickness: 6,
            },
          )
          .setOrigin(0.5)
          .setDepth(90),
      );
      this.tweens.add({
        targets: damageText,
        y: damageText.y - 35,
        alpha: 0,
        duration: 950,
        onComplete: () => damageText.destroy(),
      });
    }
  }

  private knockbackAnimationsFromEvents(): KnockbackAnimation[] {
    const animations: KnockbackAnimation[] = [];

    for (const event of this.pendingEvents) {
      if (event.type !== "knockback-resolved") {
        continue;
      }

      animations.push({
        view: this.findUnitView(event.unitId),
        result: event.result,
      });
    }

    return animations;
  }

  private animateKnockback(
    animations: readonly KnockbackAnimation[],
    onComplete: () => void,
  ): void {
    if (animations.length === 0) {
      this.time.delayedCall(120, onComplete);
      return;
    }

    let remaining = animations.length;
    const finishOne = (): void => {
      remaining -= 1;
      if (remaining === 0) {
        onComplete();
      }
    };

    for (const animation of animations) {
      const { view, result } = animation;
      const lastSample = result.samples[result.samples.length - 1];

      if (!lastSample) {
        finishOne();
        continue;
      }

      this.playCreatureMotion(view, "jump");
      this.tweens.addCounter({
        from: 0,
        to: result.samples.length - 1,
        duration: Math.max(240, lastSample.timeSeconds * 1_000),
        ease: "Linear",
        onUpdate: (tween) => {
          const index = Phaser.Math.Clamp(
            Math.round(tween.getValue() ?? 0),
            0,
            result.samples.length - 1,
          );
          const sample = result.samples[index];
          if (!sample) {
            return;
          }
          view.container
            .setPosition(sample.position.x, sample.position.y)
            .setAngle(Phaser.Math.Clamp(sample.velocity.x * 0.035, -18, 18));
        },
        onComplete: () => {
          view.container
            .setPosition(lastSample.position.x, lastSample.position.y)
            .setAngle(0);
          if (result.outcome === "out-of-world") {
            this.updateUnitHealthBar(view);
            view.container.setVisible(false);
          } else {
            if (result.outcome === "landed") {
              this.showSecondaryVfx(
                "landing",
                lastSample.position.x,
                lastSample.position.y,
              );
            }
            this.setCreaturePose(view.unit.id, "startled");
          }
          finishOne();
        },
      });
    }
  }

  /** Spielt die von der Engine gemeldeten Fallereignisse als Animation ab. */
  private presentFallEvents(): CameraPoint[] {
    const fallPoints: CameraPoint[] = [];

    for (const event of this.pendingEvents) {
      if (event.type !== "fall-resolved") {
        continue;
      }

      const view = this.findUnitView(event.unitId);

      if (event.state === "supported") {
        view.container.y = event.toY;
        continue;
      }

      this.setCreaturePose(view.unit.id, "startled");
      const destinationY = event.toY;
      fallPoints.push({ x: view.unit.position.x, y: destinationY });

      if (event.defeated) {
        this.updateUnitHealthBar(view);
      }

      const duration = Phaser.Math.Clamp(
        Math.sqrt((2 * Math.max(1, destinationY - event.fromY)) / 1100) * 1000,
        260,
        1200,
      );
      this.tweens.add({
        targets: view.container,
        y: destinationY,
        angle: event.state === "fall" ? 8 : 42,
        duration,
        ease: "Quad.easeIn",
        onComplete: () => {
          if (event.state === "fall") {
            this.showSecondaryVfx(
              "landing",
              view.unit.position.x,
              destinationY,
            );
            this.tweens.add({
              targets: view.container,
              y: destinationY - 7,
              duration: 75,
              yoyo: true,
            });
          } else {
            view.container.setVisible(false);
          }
        },
      });
    }

    return fallPoints;
  }

  private findUnitView(unitId: string): UnitView {
    const view = this.units.find((unit) => unit.unit.id === unitId);

    if (!view) {
      throw new Error(`Unit view ${unitId} is missing from the scene.`);
    }

    return view;
  }

  private activeUnit(): UnitView {
    const active = this.units.find(
      (unit) => unit.unit.id === this.matchState.activeCombatantId,
    );

    if (!active) {
      throw new Error(
        `Active unit ${this.matchState.activeCombatantId} is missing from the scene.`,
      );
    }

    return active;
  }

  private updateActiveUnitPresentation(): void {
    const activeId = this.matchState.activeCombatantId;

    for (const view of this.units) {
      const living = view.unit.hitPoints > 0;
      const active = living && view.unit.id === activeId;
      view.activeRing.setStrokeStyle(
        active ? 3 : 0,
        COLORS.yellow,
        active ? 0.9 : 0,
      );
      view.nameText
        .setFontSize(active ? 13 : 11)
        .setBackgroundColor(
          active
            ? "#ffcd5d"
            : view.unit.team === "crew"
              ? "#176f6b"
              : "#b8463c",
        )
        .setColor(active ? COLORS.ink : COLORS.cream);
      view.container.setAlpha(living ? 1 : 0.42).setAngle(0);

      if (living) {
        view.container.setVisible(true);
        if (active) {
          this.setCreaturePose(view.unit.id, "planning");
        } else {
          this.playCreatureMotion(view, "idle");
        }
      }
    }

    const active = this.activeUnit();
    this.intentHeaderText.setText(`PLAN VON ${active.unit.displayName}`);
    this.updateTurnHud();
    this.updateTeamHud();
  }

  private scheduleOpponentAction(): void {
    const activeId = this.matchState.activeCombatantId;

    if (!this.plan.selected && this.movementPlan.kind === "hold") {
      this.scheduleTurnAdvance(
        1_000,
        `${this.activeUnit().unit.displayName} findet keinen gültigen Plan – Zug wird übersprungen.`,
      );
      return;
    }

    this.autoActionTimer?.remove(false);
    this.autoActionTimer = this.time.delayedCall(1_500, () => {
      if (
        this.actionState !== "planning" ||
        this.matchState.activeCombatantId !== activeId
      ) {
        return;
      }

      this.opponentAutoReady = true;
      this.executeSelected();
    });
  }

  private scheduleTurnAdvance(delayMilliseconds: number, status?: string): void {
    if (status) {
      this.updateStatus(status);
    }

    this.autoActionTimer?.remove(false);
    this.autoActionTimer = this.time.delayedCall(delayMilliseconds, () => {
      this.autoActionTimer = undefined;
      const conclusion = concludeTurn(this.simulation);

      if (conclusion.kind === "match-ended") {
        this.finishMatch(conclusion.outcome);
        return;
      }

      this.actionState = "planning";
      this.pendingEvents = [];
      const next = this.activeUnit();
      this.replan(
        `Zug ${conclusion.turnNumber}: ${next.unit.displayName} ist am Zug.`,
      );
    });
  }

  private finishMatch(outcome: TeamId | "draw"): void {
    this.actionState = "match-over";
    this.pathGraphics.clear();
    this.effectGraphics.clear();
    this.projectile.setVisible(false);

    for (const view of this.units) {
      view.activeRing.setStrokeStyle(0, COLORS.yellow, 0);
      if (view.unit.hitPoints > 0) {
        this.setCreaturePose(
          view.unit.id,
          outcome !== "draw" && view.unit.team === outcome
            ? "victory"
            : "ready",
        );
      }
    }

    const result =
      outcome === "crew"
        ? "DEINE CREW GEWINNT."
        : outcome === "rivals"
          ? "DIE RIVALEN GEWINNEN."
          : "UNENTSCHIEDEN.";
    this.headlineText.setText(result);
    this.turnQueueText.setText(
      this.launchConfig.mode === "manager"
        ? "EINSATZBERICHT BEREIT"
        : "R  ·  MATCH NEU STARTEN",
    );
    this.intentHeaderText.setText("MATCH BEENDET");
    this.intentText.setText(
      `${result}\n\nR startet dieselbe deterministische Begegnung neu.`,
    );
    this.interventionText.setText("ALLE AKTIONEN UND TERRAINFOLGEN SIND AUFGELÖST");
    this.updateTeamHud();
    this.updateStatus(
      this.launchConfig.mode === "manager"
        ? "Match beendet. Der Einsatzbericht fasst Ergebnis und Freischaltungen zusammen."
        : "Match beendet. Mit R kannst du die Begegnung neu starten.",
    );
    this.updateButtons();
    this.createMatchEndButton(outcome);
  }

  private createMatchEndButton(outcome: TeamId | "draw"): void {
    const managerMode = this.launchConfig.mode === "manager";
    const background = this.add
      .rectangle(640, 623, managerMode ? 320 : 250, 50, COLORS.yellow, 1)
      .setStrokeStyle(3, COLORS.night, 0.9)
      .setInteractive({ useHandCursor: true })
      .setDepth(135);
    const label = this.add
      .text(640, 623, managerMode ? "EINSATZBERICHT" : "HAUPTMENÜ", {
        fontFamily: "Segoe UI, Arial, sans-serif",
        fontSize: "17px",
        fontStyle: "bold",
        color: COLORS.ink,
      })
      .setOrigin(0.5)
      .setDepth(136);
    this.cameras.main.ignore([background, label]);
    background.on("pointerdown", () => {
      if (!managerMode) {
        this.scene.start("MainMenuScene");
        return;
      }

      const report: MatchReport = {
        mode: this.launchConfig.mode,
        outcome,
        seed: this.launchConfig.seed,
        mapId: this.launchConfig.mapId,
        turnNumber: this.matchState.turnNumber,
        survivingCrew: this.units.filter(
          (view) => view.unit.team === "crew" && view.unit.hitPoints > 0,
        ).length,
        survivingRivals: this.units.filter(
          (view) => view.unit.team === "rivals" && view.unit.hitPoints > 0,
        ).length,
      };
      this.scene.start("DebriefScene", { report });
    });
  }

  private rejectCurrentPlan(): void {
    if (this.actionState !== "planning") {
      return;
    }

    const active = this.activeUnit();
    const result = rejectActivePlan(this.simulation, this.turnPlan);

    if (!result.accepted) {
      return;
    }

    this.replan(
      `„Lass das!“: ${result.rejectedCandidateId} verworfen. ${active.unit.displayName} erklärt jetzt den nächstbesten gültigen Plan.`,
    );
  }

  private chooseRocketWeapon(): void {
    this.chooseManagerWeapon("rocket");
  }

  private chooseGrenadeWeapon(): void {
    this.chooseManagerWeapon("grenade");
  }

  private chooseBreakerWeapon(): void {
    this.chooseManagerWeapon("breaker");
  }

  private chooseManagerWeapon(weaponId: WeaponId): void {
    if (this.actionState !== "planning") {
      return;
    }

    const active = this.activeUnit();
    const result = commandWeapon(this.simulation, weaponId);

    if (!result.accepted) {
      return;
    }

    this.replan(
      `Managerkommando: ${active.unit.displayName} muss den nächsten Plan mit ${WEAPON_PROFILES[weaponId].displayName} aufstellen.`,
    );
  }

  private cyclePersonality(): void {
    if (this.actionState !== "planning") {
      return;
    }

    const result = cycleActivePersonality(this.simulation);

    if (!result.accepted || !result.personality) {
      return;
    }

    this.personality = result.personality;
    this.replan(
      `Persönlichkeit gewechselt: ${PERSONALITY_LABELS[this.personality]}. Alle Kandidaten wurden neu gewichtet.`,
    );
  }

  private toggleDebug(): void {
    this.debugEnabled = !this.debugEnabled;
    const background = this.debugText.getData(
      "background",
    ) as Phaser.GameObjects.Graphics;
    background.setVisible(this.debugEnabled);
    this.debugText.setVisible(this.debugEnabled);
    this.cameraDebugGraphics.setVisible(this.debugEnabled);
    this.terrainRenderer.setDebugEnabled(this.debugEnabled);
    this.renderPlan();
    this.updateCameraDebug();
    this.updateStatus(
      this.debugEnabled
        ? "Debug aktiv: Kandidaten, Weltgrenzen, Sichtausschnitt, Kameraziel und Speicherwerte sind sichtbar."
        : "Debug ausgeblendet: nur der angekündigte Plan bleibt sichtbar.",
    );
  }

  private resetScene(): void {
    this.terrainRenderer.destroy();
    this.scene.restart({ launchConfig: this.launchConfig });
  }

  private updateButtons(): void {
    const planning = this.actionState === "planning";
    const playerTurn = planning && this.activeUnit().unit.team === "crew";
    const canReject =
      playerTurn && !this.simulation.interventionUsed && Boolean(this.plan.selected);
    const canExecute =
      playerTurn &&
      (Boolean(this.plan.selected) || this.movementPlan.kind !== "hold");
    this.executeButton.setFillStyle(canExecute ? COLORS.teal : 0x4d6465, 1);
    this.executeButtonText.setAlpha(canExecute ? 1 : 0.55);
    this.rejectButton.setFillStyle(canReject ? COLORS.coral : 0x4d6465, 1);
    this.rejectButtonText.setAlpha(canReject ? 1 : 0.55);
    const canChooseWeapon = playerTurn && !this.simulation.weaponCommandUsed;
    for (const [weaponId, button] of this.weaponCommandButtons) {
      const selected = this.simulation.forcedWeaponId === weaponId;
      button.background
        .setFillStyle(
          selected ? COLORS.yellow : canChooseWeapon ? 0x36565a : 0x4d6465,
          1,
        )
        .setStrokeStyle(
          selected ? 2 : 1,
          selected ? COLORS.yellow : COLORS.paper,
          selected ? 1 : 0.35,
        );
      button.text
        .setColor(selected ? COLORS.ink : COLORS.cream)
        .setAlpha(selected || canChooseWeapon ? 1 : 0.46);
      button.icon.setAlpha(selected || canChooseWeapon ? 1 : 0.38);
    }

    if (this.actionState === "moving") {
      this.executeButtonText.setText("POSITIONIERT …");
    } else if (this.actionState === "executing") {
      this.executeButtonText.setText("FLIEGT …");
    } else if (this.actionState === "resolving") {
      this.executeButtonText.setText("FOLGEN …");
    } else if (this.actionState === "match-over") {
      this.executeButtonText.setText("MATCH ENDE");
    } else if (!playerTurn) {
      this.executeButtonText.setText("AUTO IN KÜRZE");
    } else {
      this.executeButtonText.setText("▶ AUSFÜHREN");
    }
  }

  private showExplosion(
    worldX: number,
    worldY: number,
    radius: number,
  ): void {
    const impact = this.registerWorldObject(
      this.add
        .sprite(
          worldX,
          worldY,
          COMIC_VFX_TEXTURE_KEY,
          comicVfxFrame("impact"),
        )
        .setDepth(76),
    );
    const impactScale = (radius * 2.7) / 627;
    impact.setScale(impactScale * 0.25);
    const smoke = this.registerWorldObject(
      this.add
        .sprite(
          worldX,
          worldY - radius * 0.15,
          COMIC_VFX_TEXTURE_KEY,
          comicVfxFrame("smoke"),
        )
        .setScale((radius * 2.25) / 627)
        .setAlpha(0)
        .setDepth(74),
    );
    const debrisCluster = this.registerWorldObject(
      this.add
        .sprite(
          worldX,
          worldY,
          COMIC_VFX_TEXTURE_KEY,
          comicVfxFrame("debris"),
        )
        .setScale((radius * 1.75) / 627)
        .setDepth(75),
    );
    const flash = this.registerWorldObject(
      this.add
        .circle(worldX, worldY, radius * 0.35, COLORS.yellow, 0.95)
        .setDepth(72),
    );
    const ring = this.registerWorldObject(
      this.add
        .circle(worldX, worldY, radius, COLORS.coral, 0.12)
        .setStrokeStyle(6, COLORS.yellow, 1)
        .setDepth(71),
    );

    this.tweens.add({
      targets: impact,
      scaleX: impactScale * 1.12,
      scaleY: impactScale * 1.12,
      alpha: 0,
      angle: 7,
      duration: 420,
      ease: "Back.easeOut",
      onComplete: () => impact.destroy(),
    });
    this.tweens.add({
      targets: smoke,
      y: smoke.y - radius * 0.72,
      scaleX: smoke.scaleX * 1.18,
      scaleY: smoke.scaleY * 1.18,
      alpha: { from: 0.84, to: 0 },
      delay: 90,
      duration: 820,
      ease: "Sine.easeOut",
      onComplete: () => smoke.destroy(),
    });
    this.tweens.add({
      targets: debrisCluster,
      x: debrisCluster.x + radius * 0.22,
      y: debrisCluster.y - radius * 0.62,
      angle: 18,
      alpha: 0,
      duration: 650,
      ease: "Quad.easeOut",
      onComplete: () => debrisCluster.destroy(),
    });
    this.tweens.add({
      targets: flash,
      scale: 2.5,
      alpha: 0,
      duration: 360,
      onComplete: () => flash.destroy(),
    });
    this.tweens.add({
      targets: ring,
      scale: 1.4,
      alpha: 0,
      duration: 650,
      onComplete: () => ring.destroy(),
    });

    for (let index = 0; index < 10; index += 1) {
      const angle = (Math.PI * 2 * index) / 10;
      const debris = this.registerWorldObject(
        this.add
          .circle(
            worldX,
            worldY,
            4,
            index % 2 === 0 ? COLORS.yellow : COLORS.coral,
            1,
          )
          .setDepth(73),
      );
      this.tweens.add({
        targets: debris,
        x: worldX + Math.cos(angle) * radius * 1.15,
        y: worldY + Math.sin(angle) * radius * 0.85,
        alpha: 0,
        duration: 520,
        onComplete: () => debris.destroy(),
      });
    }
  }

  private showLaunchExhaust(position: Vector2, velocity: Vector2): void {
    const angle = Math.atan2(velocity.y, velocity.x);
    const exhaust = this.registerWorldObject(
      this.add
        .sprite(
          position.x - Math.cos(angle) * 24,
          position.y - Math.sin(angle) * 24,
          COMIC_VFX_TEXTURE_KEY,
          comicVfxFrame("exhaust"),
        )
        .setDisplaySize(62, 62)
        .setRotation(angle)
        .setAlpha(0.92)
        .setDepth(69),
    );
    this.tweens.add({
      targets: exhaust,
      scaleX: exhaust.scaleX * 1.24,
      scaleY: exhaust.scaleY * 1.24,
      alpha: 0,
      duration: 250,
      ease: "Quad.easeOut",
      onComplete: () => exhaust.destroy(),
    });
  }

  private showSecondaryVfx(
    effect: SecondaryVfx,
    worldX: number,
    worldY: number,
  ): void {
    const [firstFrame, secondFrame] = secondaryVfxFrames(effect);
    const displaySize = effect === "bounce" ? 70 : 92;
    const sprite = this.registerWorldObject(
      this.add
        .sprite(worldX, worldY, SECONDARY_VFX_TEXTURE_KEY, firstFrame)
        .setDisplaySize(displaySize, displaySize)
        .setOrigin(0.5, effect === "landing" ? 0.66 : 0.58)
        .setDepth(75),
    );
    this.time.delayedCall(70, () => sprite.setFrame(secondFrame));
    this.tweens.add({
      targets: sprite,
      y: worldY - (effect === "landing" ? 8 : 4),
      scaleX: sprite.scaleX * 1.14,
      scaleY: sprite.scaleY * 1.14,
      alpha: 0,
      delay: 80,
      duration: 260,
      ease: "Sine.easeOut",
      onComplete: () => sprite.destroy(),
    });
  }

  private framePlanningCamera(): void {
    const selected = this.plan.selected;

    if (!selected) {
      if (this.movementPlan.kind === "hold") {
        this.showOverview(false);
      } else {
        this.frameMovementCamera(this.movementPlan);
      }
      return;
    }

    const actor = this.units.find(
      (unit) => unit.unit.id === this.matchState.activeCombatantId,
    );
    const target = this.units.find(
      (unit) => unit.unit.id === selected.targetId,
    );
    const points: CameraPoint[] = selected.trajectory.samples.map(
      (sample) => sample.position,
    );
    points.push(...this.movementPlan.samples.map((sample) => ({ ...sample })));

    if (actor) {
      points.push({ ...actor.unit.position });
    }
    if (target) {
      points.push({ ...target.unit.position });
    }
    if (selected.trajectory.explosion) {
      points.push(selected.trajectory.explosion.center);
    }

    const frame = frameCameraPoints(
      points,
      { width: LOGICAL_WIDTH, height: LOGICAL_HEIGHT },
      { width: WORLD_WIDTH, height: WORLD_HEIGHT },
      {
        padding: 86,
        minimumZoom: 0.4,
        maximumZoom: 0.74,
        safeInsets: CAMERA_SAFE_INSETS,
      },
    );
    this.moveCamera(frame, 620);
  }

  private frameMovementCamera(movement: LocalMovementPlan): void {
    const frame = frameCameraPoints(
      movement.samples.map((sample) => ({ ...sample })),
      { width: LOGICAL_WIDTH, height: LOGICAL_HEIGHT },
      { width: WORLD_WIDTH, height: WORLD_HEIGHT },
      {
        padding: 150,
        minimumZoom: 0.72,
        maximumZoom: 0.9,
        safeInsets: CAMERA_SAFE_INSETS,
      },
    );
    this.moveCamera(frame, 220);
  }

  private frameImpactCamera(
    impact: CameraPoint,
    fallPoints: readonly CameraPoint[],
  ): void {
    const nearbyUnits = this.units
      .filter(
        (view) =>
          Math.hypot(
            view.unit.position.x - impact.x,
            view.unit.position.y - impact.y,
          ) < 260,
      )
      .map((view) => ({ ...view.unit.position }));
    const frame = frameCameraPoints(
      [impact, ...nearbyUnits, ...fallPoints],
      { width: LOGICAL_WIDTH, height: LOGICAL_HEIGHT },
      { width: WORLD_WIDTH, height: WORLD_HEIGHT },
      {
        padding: 140,
        minimumZoom: 0.58,
        maximumZoom: 0.88,
        safeInsets: CAMERA_SAFE_INSETS,
      },
    );
    this.moveCamera(frame, 300);
  }

  private followProjectile(
    projectilePosition: CameraPoint,
    deltaMilliseconds: number,
  ): void {
    const frame = frameCameraPoints(
      [projectilePosition],
      { width: LOGICAL_WIDTH, height: LOGICAL_HEIGHT },
      { width: WORLD_WIDTH, height: WORLD_HEIGHT },
      {
        padding: 120,
        minimumZoom: 0.86,
        maximumZoom: 0.86,
        safeInsets: CAMERA_SAFE_INSETS,
      },
    );
    this.cameraTarget = frame;
    const camera = this.cameras.main;

    if (this.cameraMovementReduced) {
      camera
        .setZoom(frame.zoom * RENDER_SCALE)
        .centerOn(frame.centerX, frame.centerY);
      return;
    }

    camera.panEffect.reset();
    camera.zoomEffect.reset();
    const blend = 1 - Math.exp(-deltaMilliseconds / 135);
    camera.setZoom(
      Phaser.Math.Linear(camera.zoom, frame.zoom * RENDER_SCALE, blend),
    );
    camera.centerOn(
      Phaser.Math.Linear(camera.midPoint.x, frame.centerX, blend),
      Phaser.Math.Linear(camera.midPoint.y, frame.centerY, blend),
    );
  }

  private showOverview(announce = true): void {
    if (this.actionState === "executing" || this.actionState === "moving") {
      return;
    }

    const frame = overviewCameraFrame(
      { width: LOGICAL_WIDTH, height: LOGICAL_HEIGHT },
      { width: WORLD_WIDTH, height: WORLD_HEIGHT },
    );
    this.moveCamera(frame, 520);

    if (announce && this.statusText) {
      this.updateStatus(
        "Übersicht: Die 3200×1800-Welt passt bei Zoom 0,40 vollständig ins Sichtfenster.",
      );
    }
  }

  private moveCamera(frame: CameraFrame, duration: number): void {
    this.cameraTarget = frame;
    const camera = this.cameras.main;

    if (this.cameraMovementReduced || duration === 0) {
      camera
        .setZoom(frame.zoom * RENDER_SCALE)
        .centerOn(frame.centerX, frame.centerY);
      return;
    }

    camera.pan(frame.centerX, frame.centerY, duration, "Sine.easeInOut", true);
    camera.zoomTo(
      frame.zoom * RENDER_SCALE,
      duration,
      "Sine.easeInOut",
      true,
    );
  }

  private updateManualCamera(deltaMilliseconds: number): void {
    if (!this.cameraKeys) {
      return;
    }

    const horizontal =
      Number(this.cameraKeys.right.isDown) - Number(this.cameraKeys.left.isDown);
    const vertical =
      Number(this.cameraKeys.down.isDown) - Number(this.cameraKeys.up.isDown);

    if (horizontal === 0 && vertical === 0) {
      return;
    }

    const camera = this.cameras.main;
    camera.panEffect.reset();
    camera.zoomEffect.reset();
    const logicalZoom = camera.zoom / RENDER_SCALE;
    const distance = (deltaMilliseconds * 0.72) / logicalZoom;
    this.setManualCamera(
      camera.midPoint.x + horizontal * distance,
      camera.midPoint.y + vertical * distance,
      logicalZoom,
    );
  }

  private setManualCamera(centerX: number, centerY: number, zoom: number): void {
    const boundedZoom = Phaser.Math.Clamp(zoom, 0.4, 1.05);
    const halfWidth = LOGICAL_WIDTH / (2 * boundedZoom);
    const halfHeight = LOGICAL_HEIGHT / (2 * boundedZoom);
    const boundedCenterX = Phaser.Math.Clamp(
      centerX,
      halfWidth,
      WORLD_WIDTH - halfWidth,
    );
    const boundedCenterY = Phaser.Math.Clamp(
      centerY,
      halfHeight,
      WORLD_HEIGHT - halfHeight,
    );
    this.cameraTarget = {
      centerX: boundedCenterX,
      centerY: boundedCenterY,
      zoom: boundedZoom,
    };
    this.cameras.main
      .setZoom(boundedZoom * RENDER_SCALE)
      .centerOn(boundedCenterX, boundedCenterY);
  }

  private zoomOut(): void {
    this.adjustManualZoom(-0.1);
  }

  private zoomIn(): void {
    this.adjustManualZoom(0.1);
  }

  private adjustManualZoom(delta: number): void {
    if (this.actionState === "executing" || this.actionState === "moving") {
      return;
    }

    const camera = this.cameras.main;
    camera.panEffect.reset();
    camera.zoomEffect.reset();
    this.setManualCamera(
      camera.midPoint.x,
      camera.midPoint.y,
      camera.zoom / RENDER_SCALE + delta,
    );
    this.updateStatus(
      `Manuelle Kamera: Zoom ${(this.cameras.main.zoom / RENDER_SCALE).toFixed(2)} · Pfeiltasten schwenken · O zeigt Übersicht.`,
    );
  }

  private handleMouseWheel(
    _pointer: Phaser.Input.Pointer,
    _currentlyOver: Phaser.GameObjects.GameObject[],
    _deltaX: number,
    deltaY: number,
  ): void {
    this.adjustManualZoom(deltaY > 0 ? -0.08 : 0.08);
  }

  private handleTouchPointerDown(
    pointer: Phaser.Input.Pointer,
    currentlyOver: Phaser.GameObjects.GameObject[],
  ): void {
    if (
      !pointer.wasTouch ||
      this.actionState !== "planning" ||
      this.helpVisible ||
      currentlyOver.length > 0 ||
      this.isTouchHudRegion(pointer)
    ) {
      return;
    }

    this.touchPointers.set(pointer.id, { x: pointer.x, y: pointer.y });
    this.resetTouchGestureBaseline();
  }

  private handleTouchPointerMove(pointer: Phaser.Input.Pointer): void {
    if (!pointer.wasTouch || !this.touchPointers.has(pointer.id)) {
      return;
    }
    if (this.actionState !== "planning" || this.helpVisible) {
      this.clearTouchGesture();
      return;
    }

    this.touchPointers.set(pointer.id, { x: pointer.x, y: pointer.y });
    const points = [...this.touchPointers.entries()]
      .sort(([leftId], [rightId]) => leftId - rightId)
      .slice(0, 2)
      .map(([, point]) => point);

    if (
      points.length === 0 ||
      !this.touchGestureMidpoint ||
      this.touchGesturePointerCount !== points.length
    ) {
      this.resetTouchGestureBaseline();
      return;
    }

    const camera = this.cameras.main;
    camera.panEffect.reset();
    camera.zoomEffect.reset();

    if (points.length === 1) {
      const current = points[0]!;
      this.setManualCamera(
        camera.midPoint.x -
          (current.x - this.touchGestureMidpoint.x) / camera.zoom,
        camera.midPoint.y -
          (current.y - this.touchGestureMidpoint.y) / camera.zoom,
        camera.zoom / RENDER_SCALE,
      );
      this.touchGestureMidpoint = current;
      return;
    }

    const currentMidpoint = touchMidpoint(points[0]!, points[1]!);
    const currentDistance = touchDistance(points[0]!, points[1]!);
    const nextLogicalZoom = nextPinchZoom(
      camera.zoom / RENDER_SCALE,
      this.touchGestureDistance,
      currentDistance,
      0.4,
      1.05,
    );
    const nextRenderZoom = nextLogicalZoom * RENDER_SCALE;
    const nextCenter = cameraCenterForGestureAnchor({
      previousMidpoint: this.touchGestureMidpoint,
      currentMidpoint,
      previousCameraCenter: {
        x: camera.midPoint.x,
        y: camera.midPoint.y,
      },
      previousRenderZoom: camera.zoom,
      nextRenderZoom,
      viewportWidth: RENDER_WIDTH,
      viewportHeight: RENDER_HEIGHT,
    });

    this.setManualCamera(nextCenter.x, nextCenter.y, nextLogicalZoom);
    this.touchGestureMidpoint = currentMidpoint;
    this.touchGestureDistance = currentDistance;
  }

  private handleTouchPointerUp(pointer: Phaser.Input.Pointer): void {
    if (!pointer.wasTouch) {
      return;
    }

    this.touchPointers.delete(pointer.id);
    this.resetTouchGestureBaseline();
  }

  private isTouchHudRegion(pointer: Phaser.Input.Pointer): boolean {
    const logicalX = pointer.x / RENDER_SCALE;
    const logicalY = pointer.y / RENDER_SCALE;

    return (
      logicalY <= 88 ||
      logicalY >= 668 ||
      (logicalX >= 958 && logicalY >= 90 && logicalY <= 520)
    );
  }

  private resetTouchGestureBaseline(): void {
    const points = [...this.touchPointers.entries()]
      .sort(([leftId], [rightId]) => leftId - rightId)
      .slice(0, 2)
      .map(([, point]) => point);
    this.touchGesturePointerCount = points.length;

    if (points.length === 0) {
      this.touchGestureMidpoint = null;
      this.touchGestureDistance = 0;
      return;
    }

    if (points.length === 1) {
      this.touchGestureMidpoint = points[0]!;
      this.touchGestureDistance = 0;
      return;
    }

    this.touchGestureMidpoint = touchMidpoint(points[0]!, points[1]!);
    this.touchGestureDistance = touchDistance(points[0]!, points[1]!);
  }

  private clearTouchGesture(): void {
    this.touchPointers.clear();
    this.touchGestureMidpoint = null;
    this.touchGestureDistance = 0;
    this.touchGesturePointerCount = 0;
  }

  private toggleReducedCameraMovement(): void {
    this.cameraMovementReduced = !this.cameraMovementReduced;
    this.updateDebugText();
    this.updateStatus(
      this.cameraMovementReduced
        ? "Reduzierte Kamerabewegung: automatische Wechsel erfolgen jetzt als direkte Schnitte."
        : "Sanfte Kamerabewegung: Planung, Projektil und Einschlag werden weich gerahmt.",
    );
  }

  private updateCameraDebug(): void {
    if (!this.debugEnabled) {
      return;
    }

    const camera = this.cameras.main;
    const view = camera.worldView;
    this.cameraDebugGraphics.clear();
    this.cameraDebugGraphics.lineStyle(7, COLORS.tealBright, 0.85);
    this.cameraDebugGraphics.strokeRect(3, 3, WORLD_WIDTH - 6, WORLD_HEIGHT - 6);
    this.cameraDebugGraphics.lineStyle(3, COLORS.yellow, 0.82);
    this.cameraDebugGraphics.strokeRect(view.x, view.y, view.width, view.height);
    this.cameraDebugGraphics.lineBetween(
      this.cameraTarget.centerX - 28,
      this.cameraTarget.centerY,
      this.cameraTarget.centerX + 28,
      this.cameraTarget.centerY,
    );
    this.cameraDebugGraphics.lineBetween(
      this.cameraTarget.centerX,
      this.cameraTarget.centerY - 28,
      this.cameraTarget.centerX,
      this.cameraTarget.centerY + 28,
    );
    this.updateDebugText();
  }

  private registerWorldObject<T extends Phaser.GameObjects.GameObject>(
    gameObject: T,
  ): T {
    this.uiCamera?.ignore(gameObject);
    return gameObject;
  }

  private updateStatus(message: string): void {
    this.statusText.setText(message);
  }

  private updateUnitHealthBar(view: UnitView): void {
    const ratio = Phaser.Math.Clamp(
      view.unit.hitPoints / view.unit.maximumHitPoints,
      0,
      1,
    );
    view.healthText.setText(String(view.unit.hitPoints));
    view.healthBarFill
      .setVisible(ratio > 0)
      .setDisplaySize(Math.max(1, 76 * ratio), 8)
      .setFillStyle(
        ratio <= 0.34
          ? COLORS.coral
          : view.unit.team === "crew"
            ? COLORS.tealBright
            : COLORS.yellow,
        1,
      );
  }

  private setCreaturePose(unitId: string, pose: CreaturePose): void {
    const view = this.units.find((unit) => unit.unit.id === unitId);

    if (!view) {
      return;
    }

    const visual = CREATURE_VISUALS[view.visualId];
    const frames = visual.poseAnimationFrames?.[pose];

    if (frames && frames.length > 1) {
      view.sprite.play(creatureAnimationKey(view.visualId, pose), true);
    } else {
      view.sprite.stop().setFrame(visual.poseFrames[pose]);
    }

    this.animateCreatureTransition(view, pose);
  }

  private playCreatureMotion(view: UnitView, motion: CreatureMotion): void {
    const visual = CREATURE_VISUALS[view.visualId];
    const frames = visual.motionFrames[motion];

    if (!frames || frames.length < 2) {
      this.setCreaturePose(
        view.unit.id,
        motion === "jump" ? "startled" : "planning",
      );
      return;
    }

    view.sprite.play(creatureAnimationKey(view.visualId, motion), true);
    this.animateCreatureTransition(view, motion);
  }

  private animateCreatureTransition(
    view: UnitView,
    animation: CreatureMotion | CreaturePose,
  ): void {
    if (view.visualId !== "slime" && view.visualId !== "ghost") {
      return;
    }

    this.tweens.killTweensOf(view.sprite);
    view.sprite
      .setScale(view.baseSpriteScaleX, view.baseSpriteScaleY)
      .setAngle(0)
      .setY(view.baseSpriteY);

    const isLooping =
      animation === "idle" ||
      animation === "ready" ||
      animation === "planning" ||
      animation === "walk" ||
      animation === "jump" ||
      animation === "victory";

    if (view.visualId === "ghost") {
      const lift =
        animation === "jump"
          ? 7
          : animation === "walk"
            ? 4
            : animation === "action" || animation === "grenade"
              ? 3
              : 2.5;
      const duration =
        animation === "jump"
          ? 180
          : animation === "walk"
            ? 150
            : animation === "victory"
              ? 240
              : 340;

      // Task 025: Loop-Zustände schweben nur noch vertikal – dauerhafte
      // Scale-Tweens auf dem verkleinerten Sheet erzeugten Kantenflimmern.
      this.tweens.add({
        targets: view.sprite,
        y: view.baseSpriteY - lift,
        ...(isLooping
          ? {}
          : {
              scaleX: view.baseSpriteScaleX * 1.018,
              scaleY: view.baseSpriteScaleY * 0.988,
            }),
        duration,
        ease: "Sine.easeInOut",
        yoyo: true,
        repeat: isLooping ? -1 : 0,
      });
      return;
    }

    // Task 025: Das Slime-Sheet atmet selbst; Loop-Zustände erhalten keinen
    // zusätzlichen Endlos-Scale-Tween mehr.
    if (isLooping) {
      return;
    }

    const stretch =
      animation === "startled"
        ? { x: 1.16, y: 0.74, duration: 85 }
        : { x: 1.09, y: 0.9, duration: 95 };

    this.tweens.add({
      targets: view.sprite,
      scaleX: view.baseSpriteScaleX * stretch.x,
      scaleY: view.baseSpriteScaleY * stretch.y,
      duration: stretch.duration,
      ease: "Sine.easeInOut",
      yoyo: true,
      repeat: 0,
    });
  }
}

function arcLabel(flightTimeSeconds: number): string {
  if (flightTimeSeconds < 2.15) {
    return "direkter Bogen";
  }

  if (flightTimeSeconds < 2.75) {
    return "kontrollierter Bogen";
  }

  return "hoher Showbogen";
}

function personalityQuote(personality: Personality): string {
  switch (personality) {
    case "cautious":
      return "Kurz, sauber, niemand Eigenes im Radius.";
    case "explosive":
      return "Wenn schon, dann mit ordentlich Wumms.";
    case "showboat":
      return "Hauptsache, alle schauen beim Einschlag hin.";
  }
}

function movementLabel(plan: LocalMovementPlan): string {
  if (plan.kind === "hold") {
    return "BLEIBT STEHEN";
  }

  return `${plan.kind === "jump" ? "SPRUNG" : "LAUF"} · ${Math.round(plan.distance)} / 190`;
}

function formatBytes(bytes: number): string {
  return bytes >= 1024 * 1024
    ? `${(bytes / (1024 * 1024)).toFixed(2)} MiB`
    : `${(bytes / 1024).toFixed(0)} KiB`;
}
