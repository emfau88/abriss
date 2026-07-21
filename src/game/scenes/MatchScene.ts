import Phaser from "phaser";

import {
  CREATURE_VISUALS,
  creatureAnimationKey,
  registerCreatureAnimations,
  type CreatureMotion,
  type CreaturePose,
  type CreatureVisualId,
} from "../../content/characters/creatureKits";
import {
  createGoodMoodTerrainMask,
  GOOD_MOOD_BACKGROUND_TEXTURE_KEY,
  GOOD_MOOD_TERRAIN_SOURCE_TEXTURE_KEY,
} from "../../content/maps/goodMoodMap";
import {
  COMIC_VFX_TEXTURE_KEY,
  comicVfxFrame,
} from "../../content/vfx/comicVfxKit";
import {
  calculateBlastDamage,
  planRocketAction,
  topUtilityReasons,
  WEAPON_PROFILES,
  type Personality,
  type PlannerUnit,
  type RocketActionPlan,
  type RocketCandidate,
  type WeaponId,
} from "../../simulation/ai/RocketActionPlanner";
import { sampleTrajectoryAtElapsed } from "../../simulation/ballistics/Ballistics";
import {
  planLocalMovement,
  type LocalMovementPlan,
} from "../../simulation/movement/LocalMovementPlanner";
import {
  simulateExplosionKnockback,
  type ExplosionKnockbackResult,
} from "../../simulation/movement/ExplosionKnockback";
import { resolveTerrainFall } from "../../simulation/movement/TerrainFall";
import {
  advanceTurn,
  createInitialMatchState,
  determineMatchOutcome,
  upcomingLivingCombatants,
  updateCombatantHitPoints,
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
import { summarizeTeamStatus } from "../hud/TeamStatus";
import { TerrainMaskRenderer } from "../rendering/TerrainMaskRenderer";

const TERRAIN_TEXTURE_KEY = "autonomous-action-terrain";
const PLAN_SEED = 21_072_026;
const CAMERA_SAFE_INSETS = {
  left: 24,
  right: 320,
  top: 88,
  bottom: 54,
} as const;
const PERSONALITIES: readonly Personality[] = [
  "cautious",
  "explosive",
  "showboat",
];

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

interface MutablePosition {
  x: number;
  y: number;
}

interface UnitView {
  readonly data: PlannerUnit;
  readonly worldPosition: MutablePosition;
  readonly container: Phaser.GameObjects.Container;
  readonly healthText: Phaser.GameObjects.Text;
  readonly healthBarFill: Phaser.GameObjects.Rectangle;
  readonly nameText: Phaser.GameObjects.Text;
  readonly activeRing: Phaser.GameObjects.Arc;
  readonly sprite: Phaser.GameObjects.Sprite;
  readonly visualId: CreatureVisualId;
  personality: Personality;
  hitPoints: number;
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
    }
  >();
  private helpButton!: Phaser.GameObjects.Rectangle;
  private helpButtonText!: Phaser.GameObjects.Text;
  private helpOverlayObjects: (
    | Phaser.GameObjects.Graphics
    | Phaser.GameObjects.Text
  )[] = [];
  private helpVisible = false;
  private projectile!: Phaser.GameObjects.Container;
  private projectileParts = new Map<
    WeaponId,
    { setVisible(value: boolean): unknown }[]
  >();
  private uiCamera?: Phaser.Cameras.Scene2D.Camera;
  private cameraKeys?: CameraKeys;
  private cameraTarget: CameraFrame = {
    centerX: WORLD_WIDTH / 2,
    centerY: WORLD_HEIGHT / 2,
    zoom: 0.4,
  };
  private units: UnitView[] = [];
  private matchState!: MatchState;
  private plan!: RocketActionPlan;
  private movementPlan!: LocalMovementPlan;
  private personality: Personality = "cautious";
  private rejectedCandidateIds: string[] = [];
  private interventionUsed = false;
  private weaponCommandUsed = false;
  private forcedWeaponId: WeaponId | null = null;
  private debugEnabled = false;
  private cameraMovementReduced = false;
  private actionState: ActionState = "planning";
  private executionElapsedSeconds = 0;
  private lastPlaybackSampleIndex = -1;
  private lastDirtyRegionCells = "–";
  private lastDirtyUpdateMilliseconds = 0;
  private autoActionTimer: Phaser.Time.TimerEvent | undefined;
  private opponentAutoReady = false;

  public constructor() {
    super("MatchScene");
  }

  public create(): void {
    const terrainSource = this.textures
      .get(GOOD_MOOD_TERRAIN_SOURCE_TEXTURE_KEY)
      .getSourceImage() as CanvasImageSource;
    this.terrainMask = createGoodMoodTerrainMask(
      terrainSource,
      WORLD_WIDTH,
      WORLD_HEIGHT,
    );
    this.personality = "cautious";
    this.rejectedCandidateIds = [];
    this.interventionUsed = false;
    this.weaponCommandUsed = false;
    this.forcedWeaponId = null;
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
    this.projectileParts = new Map();

    this.configureWorldCamera();
    this.drawBackdrop();
    this.terrainRenderer = new TerrainMaskRenderer(
      this,
      this.terrainMask,
      TERRAIN_TEXTURE_KEY,
      GOOD_MOOD_TERRAIN_SOURCE_TEXTURE_KEY,
    );
    this.terrainRenderer.image.setDepth(10);
    this.pathGraphics = this.add.graphics().setDepth(26);
    this.effectGraphics = this.add.graphics().setDepth(27);
    this.cameraDebugGraphics = this.add.graphics().setDepth(95).setVisible(false);
    registerCreatureAnimations(this);
    this.createUnits();
    this.matchState = createInitialMatchState({
      seed: PLAN_SEED,
      combatants: this.units.map((unit) => ({
        id: unit.data.id,
        team: unit.data.team as TeamId,
        hitPoints: unit.hitPoints,
      })),
    });
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
    this.replan("Bruno prüft reproduzierbare Raketenpläne in der großen Welt.");
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
    const playback = sampleTrajectoryAtElapsed(
      this.plan.selected.trajectory,
      this.executionElapsedSeconds,
    );

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
      this.completeAction(this.plan.selected);
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
    this.add
      .image(0, 0, GOOD_MOOD_BACKGROUND_TEXTURE_KEY)
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

    this.headlineText = this.add
      .text(442, 19, "ZUG 1  ·  BRUNO", {
        fontFamily: "Segoe UI, Arial, sans-serif",
        fontSize: "17px",
        fontStyle: "bold",
        color: COLORS.cream,
      })
      .setDepth(100);

    this.turnQueueText = this.add
      .text(442, 48, "", {
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
      .map((id) => this.units.find((unit) => unit.data.id === id))
      .filter((unit): unit is UnitView => Boolean(unit));
    const current = upcoming[0];

    if (!current) {
      this.headlineText.setText(`ZUG ${this.matchState.turnNumber}`);
      this.turnQueueText.setText("KEINE KAMPFFÄHIGE FIGUR");
      return;
    }

    this.headlineText.setText(
      `ZUG ${this.matchState.turnNumber}  ·  ${current.data.displayName}`,
    );
    const following = upcoming
      .slice(1)
      .map((unit) => unit.data.displayName)
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
      this.teamHudTitleTexts.set(layout.team, titleText);
      this.teamHudTotalTexts.set(layout.team, totalText);

      const teamUnits = this.units.filter(
        (unit) => unit.data.team === layout.team,
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
        this.teamHudUnitTexts.set(unit.data.id, unitText);
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
        id: unit.data.id,
        displayName: unit.data.displayName,
        team: unit.data.team as TeamId,
        hitPoints: unit.hitPoints,
        maximumHitPoints: unit.data.hitPoints,
      })),
    );
    const showActive = this.actionState !== "match-over";
    this.teamHudGraphics.clear();

    for (const layout of layouts) {
      const teamStatus = status[layout.team];
      const activeTeam =
        showActive && this.activeUnit().data.team === layout.team;
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
        ?.setText(
          `TEAM-HP  ${teamStatus.hitPoints} / ${teamStatus.maximumHitPoints}`,
        );

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
    const definitions = [
      {
        id: "bruno",
        displayName: "BRUNO",
        team: "crew",
        x: 420,
        personality: "cautious",
        visualId: "hornling",
      },
      {
        id: "rival-a",
        displayName: "RIVALE A",
        team: "rivals",
        x: 1480,
        personality: "explosive",
        visualId: "hornling",
      },
      {
        id: "mara",
        displayName: "MARA",
        team: "crew",
        x: 930,
        personality: "showboat",
        visualId: "hornling",
      },
      {
        id: "rival-b",
        displayName: "RIVALE B",
        team: "rivals",
        x: 2100,
        personality: "cautious",
        visualId: "hornling",
      },
      {
        id: "moki",
        displayName: "MOKI",
        team: "crew",
        x: 2700,
        personality: "explosive",
        visualId: "moki",
      },
      {
        id: "vela",
        displayName: "VELA",
        team: "rivals",
        x: 700,
        personality: "showboat",
        visualId: "vela",
      },
    ] as const;

    for (const definition of definitions) {
      const groundY = this.terrainMask.findGroundY(
        definition.x,
        80,
        WORLD_HEIGHT - 20,
      );

      if (groundY === null) {
        throw new Error(`No terrain below unit ${definition.id}.`);
      }

      const position = { x: definition.x, y: groundY };
      const data: PlannerUnit = {
        id: definition.id,
        displayName: definition.displayName,
        team: definition.team,
        position,
        hitPoints: 140,
      };
      this.units.push(
        this.drawUnit(
          data,
          position,
          definition.id === "bruno",
          definition.personality,
          definition.visualId,
        ),
      );
    }
  }

  private drawUnit(
    data: PlannerUnit,
    worldPosition: MutablePosition,
    active: boolean,
    personality: Personality,
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
      .text(0, -133, data.displayName, {
        fontFamily: "Consolas, ui-monospace, monospace",
        fontSize: active ? "13px" : "11px",
        fontStyle: "bold",
        color: active ? "#16343b" : COLORS.cream,
        backgroundColor:
          active ? "#ffcd5d" : data.team === "crew" ? "#176f6b" : "#b8463c",
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
        data.team === "crew" ? COLORS.tealBright : COLORS.coral,
        1,
      )
      .setOrigin(0, 0.5);
    const healthText = this.add
      .text(0, -109, String(data.hitPoints), {
        fontFamily: "Consolas, ui-monospace, monospace",
        fontSize: "8px",
        fontStyle: "bold",
        color: COLORS.cream,
      })
      .setOrigin(0.5);

    const container = this.add
      .container(worldPosition.x, worldPosition.y, [
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
      data,
      worldPosition,
      container,
      healthText,
      healthBarFill,
      nameText: name,
      activeRing,
      sprite,
      visualId,
      personality,
      hitPoints: data.hitPoints,
    };
  }

  private createProjectile(): void {
    const flame = this.add
      .sprite(-22, 0, COMIC_VFX_TEXTURE_KEY, comicVfxFrame("exhaust"))
      .setDisplaySize(54, 54);
    const body = this.add.rectangle(0, 0, 26, 10, COLORS.paper, 1);
    body.setStrokeStyle(3, COLORS.night, 1);
    const nose = this.add.triangle(17, 0, 0, -5, 0, 5, 9, 0, COLORS.coral, 1);

    const grenadeBody = this.add.circle(0, 0, 11, 0x36565a, 1);
    grenadeBody.setStrokeStyle(3, COLORS.night, 1);
    const grenadeBand = this.add.rectangle(0, 0, 4, 19, COLORS.yellow, 0.9);
    const grenadeFuse = this.add.line(8, -10, 0, 0, 7, -8, COLORS.paper, 1);
    grenadeFuse.setLineWidth(3, 3);
    const grenadeSpark = this.add.circle(15, -18, 4, COLORS.yellow, 1);

    const breakerExhaust = this.add
      .sprite(-21, 0, COMIC_VFX_TEXTURE_KEY, comicVfxFrame("exhaust"))
      .setDisplaySize(48, 48);
    const breakerBody = this.add.rectangle(0, 0, 25, 14, COLORS.yellow, 1);
    breakerBody.setStrokeStyle(3, COLORS.night, 1);
    const breakerTip = this.add.triangle(20, 0, 0, -9, 0, 9, 13, 0, COLORS.tealBright, 1);
    const breakerFin = this.add.triangle(-10, 0, 0, 0, 13, -10, 13, 10, COLORS.coral, 1);

    this.projectile = this.add
      .container(-100, -100, [
        flame,
        body,
        nose,
        grenadeBody,
        grenadeBand,
        grenadeFuse,
        grenadeSpark,
        breakerExhaust,
        breakerBody,
        breakerTip,
        breakerFin,
      ])
      .setDepth(70)
      .setVisible(false);
    this.projectileParts.set("rocket", [flame, body, nose]);
    this.projectileParts.set("grenade", [
      grenadeBody,
      grenadeBand,
      grenadeFuse,
      grenadeSpark,
    ]);
    this.projectileParts.set("breaker", [
      breakerExhaust,
      breakerBody,
      breakerTip,
      breakerFin,
    ]);
    this.setProjectileAppearance("rocket");
  }

  private setProjectileAppearance(weaponId: WeaponId): void {
    for (const [id, parts] of this.projectileParts) {
      for (const part of parts) {
        part.setVisible(id === weaponId);
      }
    }
  }

  private createIntentPanel(): void {
    const panel = this.add.graphics().setDepth(80);
    panel.fillStyle(COLORS.night, 0.95);
    panel.fillRoundedRect(974, 96, 288, 406, 17);
    panel.lineStyle(2, 0xfff5d6, 0.16);
    panel.strokeRoundedRect(974, 96, 288, 406, 17);
    panel.fillStyle(COLORS.yellow, 1);
    panel.fillRoundedRect(988, 110, 260, 34, 9);

    this.intentHeaderText = this.add
      .text(1001, 118, "PLAN VON BRUNO", {
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
        .text(definition.x, 482, definition.label, {
          fontFamily: "Consolas, ui-monospace, monospace",
          fontSize: "8px",
          fontStyle: "bold",
          color: COLORS.cream,
        })
        .setOrigin(0.5)
        .setDepth(83);
      background.on("pointerdown", () =>
        this.chooseManagerWeapon(definition.id),
      );
      this.weaponCommandButtons.set(definition.id, { background, text });
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
          "Pfeile       Ausschnitt verschieben",
          "Q / E        heraus- / hineinzoomen",
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
      this.autoActionTimer?.remove(false);
      this.autoActionTimer = undefined;
    });
  }

  private replan(status: string): void {
    const active = this.activeUnit();
    this.personality = active.personality;
    this.opponentAutoReady = false;
    const plannerUnits = this.units.map((view) => ({
        ...view.data,
        position: { ...view.worldPosition },
        hitPoints: view.hitPoints,
      }));
    const turnSeed = PLAN_SEED + this.matchState.turnNumber * 9_973;
    const movementCandidates = planLocalMovement({
      terrain: this.terrainMask,
      units: plannerUnits,
      activeUnitId: active.data.id,
      personality: this.personality,
      seed: turnSeed,
    });
    let best:
      | {
          movement: LocalMovementPlan;
          plan: RocketActionPlan;
          combinedScore: number;
        }
      | undefined;
    let fallbackPlan: RocketActionPlan | undefined;

    for (const movement of movementCandidates) {
      const movedUnits = plannerUnits.map((unit) =>
        unit.id === active.data.id
          ? { ...unit, position: { ...movement.destination } }
          : unit,
      );
      const weaponPlan = planRocketAction({
        terrain: this.terrainMask,
        units: movedUnits,
        activeUnitId: active.data.id,
        personality: this.personality,
        seed: turnSeed,
        rejectedCandidateIds: this.rejectedCandidateIds,
        weaponIds: this.forcedWeaponId
          ? [this.forcedWeaponId]
          : ["rocket", "grenade", "breaker"],
      });
      fallbackPlan ??= weaponPlan;

      if (!weaponPlan.selected) {
        continue;
      }

      const combinedScore = weaponPlan.selected.score + movement.score;
      if (
        !best ||
        combinedScore > best.combinedScore ||
        (combinedScore === best.combinedScore &&
          movement.id.localeCompare(best.movement.id) < 0)
      ) {
        best = { movement, plan: weaponPlan, combinedScore };
      }
    }

    this.movementPlan = best?.movement ?? movementCandidates[0]!;
    this.plan = best?.plan ?? fallbackPlan!;

    this.updateActiveUnitPresentation();
    this.renderPlan();
    this.framePlanningCamera();
    this.updateStatus(status);

    if (active.data.team === "rivals") {
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
        this.activeUnit().data.team === "rivals"
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

    this.intentText.setText(
      `${PERSONALITY_LABELS[this.personality]}\n` +
        `„${personalityQuote(this.personality)}“\n\n` +
        `POSITION  ${movementLabel(this.movementPlan)}\n` +
        `WAFFE  ${selected.weaponName}\n` +
        `ZIEL  ${selected.targetName}\n` +
        `${trajectoryDetail}\n` +
        `${Math.round(selected.metrics.enemyDamage)} SCHADEN  ·  ${Math.round(selected.metrics.terrainEffect)}% TERRAIN\n` +
        `RISIKO  ${Math.round(selected.metrics.friendlyDamage)} TEAM  ·  ${Math.round(selected.metrics.selfDamage)} SELBST\n\n` +
        `WARUM?  ${positive}\n` +
        `ABZUG  ${negative}\n` +
        `NUTZEN ${selected.score.toFixed(1)}  ·  RANG ${targetRank}/${this.plan.rankedCandidates.length}`,
    );

    const active = this.activeUnit();
    this.interventionText.setText(
      active.data.team === "rivals"
        ? "GEGNERAKTION  ·  wird nach der Ankündigung automatisch ausgeführt"
        : this.managerStatusText(),
    );
  }

  private managerStatusText(): string {
    const rejectStatus = this.interventionUsed
      ? "LASS DAS VERBRAUCHT"
      : "LASS DAS BEREIT";
    const weaponStatus = this.forcedWeaponId
      ? `WAFFENBEFEHL  ${WEAPON_PROFILES[this.forcedWeaponId].displayName}`
      : this.weaponCommandUsed
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

    const active = this.activeUnit();

    if (active.data.team === "rivals" && !this.opponentAutoReady) {
      return;
    }

    this.autoActionTimer?.remove(false);
    this.autoActionTimer = undefined;

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
      `${active.data.displayName} ${movement.reason}. Limit: ${Math.round(movement.distance)} von 190 Weltpunkten in diesem Zug.`,
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
        active.worldPosition.x = sample.x;
        active.worldPosition.y = sample.y;
        active.container.setPosition(sample.x, sample.y);
      },
      onComplete: () => {
        active.worldPosition.x = movement.destination.x;
        active.worldPosition.y = movement.destination.y;
        active.container.setPosition(
          movement.destination.x,
          movement.destination.y,
        );
        active.sprite.setFlipX(false);
        this.time.delayedCall(140, () => {
          if (this.plan.selected) {
            this.startProjectileExecution(active);
          } else {
            this.actionState = "resolving";
            this.setCreaturePose(active.data.id, "ready");
            this.updateButtons();
            this.scheduleTurnAdvance(
              500,
              `${active.data.displayName} hat die Position verbessert und beendet den Zug ohne Schuss.`,
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

    const firstSample = selected.trajectory.samples[0];

    if (!firstSample) {
      return;
    }

    this.actionState = "executing";
    this.executionElapsedSeconds = 0;
    this.lastPlaybackSampleIndex = 0;
    this.projectile
      .setPosition(firstSample.position.x, firstSample.position.y)
      .setVisible(true);
    this.setProjectileAppearance(selected.weaponId);
    this.setCreaturePose(
      active.data.id,
      selected.weaponId === "grenade" ? "grenade" : "action",
    );
    this.updateButtons();
    this.updateStatus(
      `${active.data.displayName} setzt ${selected.weaponName} ein. Die Kamera folgt denselben ${selected.trajectory.samples.length} Ballistik-Samples wie die Vorschau.`,
    );
  }

  private completeAction(candidate: RocketCandidate): void {
    if (this.actionState !== "executing") {
      return;
    }

    this.actionState = "resolving";
    this.projectile.setVisible(false);
    this.pathGraphics.clear();
    this.effectGraphics.clear();
    const explosion = candidate.trajectory.explosion;

    if (!explosion) {
      this.scheduleTurnAdvance(700, "Aktion beendet, aber ohne Explosion.");
      this.updateButtons();
      return;
    }

    const mutation = this.terrainMask.removeCircle(
      explosion.center.x,
      explosion.center.y,
      explosion.radius,
    );
    const dirtyUpdateStart = performance.now();
    this.terrainRenderer.applyMutation(mutation);
    this.lastDirtyUpdateMilliseconds = performance.now() - dirtyUpdateStart;
    this.lastDirtyRegionCells = mutation.dirtyCells
      ? `${mutation.dirtyCells.width}×${mutation.dirtyCells.height}`
      : "0×0";
    this.showExplosion(explosion.center.x, explosion.center.y, explosion.radius);
    const affectedViews = this.applyPredictedDamage(candidate);
    const knockbackAnimations = this.createKnockbackAnimations(
      candidate,
      affectedViews,
    );
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
      const fallPoints = this.resolveFallsAfterTerrainChange();
      this.synchronizeMatchHitPoints();
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

  private applyPredictedDamage(candidate: RocketCandidate): UnitView[] {
    const explosion = candidate.trajectory.explosion;

    if (!explosion) {
      return [];
    }

    const affectedViews: UnitView[] = [];

    for (const view of this.units) {
      if (view.hitPoints <= 0) {
        continue;
      }

      const damage = Math.round(
        calculateBlastDamage(
          explosion.center,
          view.worldPosition,
          explosion.radius,
          candidate.maximumDamage,
        ),
      );

      if (damage <= 0) {
        continue;
      }

      affectedViews.push(view);
      view.hitPoints = Math.max(0, view.hitPoints - damage);
      this.updateUnitHealthBar(view);
      this.setCreaturePose(view.data.id, "startled");
      const damageText = this.registerWorldObject(
        this.add
          .text(
            view.worldPosition.x,
            view.worldPosition.y - 125,
            `−${damage}`,
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

    return affectedViews;
  }

  private createKnockbackAnimations(
    candidate: RocketCandidate,
    affectedViews: readonly UnitView[],
  ): KnockbackAnimation[] {
    const explosion = candidate.trajectory.explosion;

    if (!explosion) {
      return [];
    }

    return affectedViews
      .map((view) => ({
        view,
        result: simulateExplosionKnockback({
          terrain: this.terrainMask,
          startPosition: { ...view.worldPosition },
          explosionCenter: explosion.center,
          explosionRadius: explosion.radius,
          maximumSpeed: candidate.maximumKnockbackSpeed,
        }),
      }))
      .filter((animation) => animation.result.outcome !== "unaffected");
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
          view.worldPosition.x = sample.position.x;
          view.worldPosition.y = sample.position.y;
          view.container
            .setPosition(sample.position.x, sample.position.y)
            .setAngle(Phaser.Math.Clamp(sample.velocity.x * 0.035, -18, 18));
        },
        onComplete: () => {
          view.worldPosition.x = lastSample.position.x;
          view.worldPosition.y = lastSample.position.y;
          view.container
            .setPosition(lastSample.position.x, lastSample.position.y)
            .setAngle(0);
          if (result.outcome === "out-of-world") {
            view.hitPoints = 0;
            this.updateUnitHealthBar(view);
            view.container.setVisible(false);
          } else {
            this.setCreaturePose(view.data.id, "startled");
          }
          finishOne();
        },
      });
    }
  }

  private resolveFallsAfterTerrainChange(): CameraPoint[] {
    const fallPoints: CameraPoint[] = [];

    for (const view of this.units) {
      const resolution = resolveTerrainFall(
        this.terrainMask,
        view.worldPosition.x,
        view.worldPosition.y,
      );

      if (resolution.state === "supported") {
        view.worldPosition.y = resolution.landingY;
        view.container.y = resolution.landingY;
        continue;
      }

      this.setCreaturePose(view.data.id, "startled");
      const startY = view.worldPosition.y;
      const destinationY =
        resolution.state === "fall"
          ? resolution.landingY
          : WORLD_HEIGHT + 150;
      view.worldPosition.y = destinationY;
      fallPoints.push({ x: view.worldPosition.x, y: destinationY });

      if (resolution.state === "out-of-world") {
        view.hitPoints = 0;
        this.updateUnitHealthBar(view);
      }

      const duration = Phaser.Math.Clamp(
        Math.sqrt((2 * Math.max(1, destinationY - startY)) / 1100) * 1000,
        260,
        1200,
      );
      this.tweens.add({
        targets: view.container,
        y: destinationY,
        angle: resolution.state === "fall" ? 8 : 42,
        duration,
        ease: "Quad.easeIn",
        onComplete: () => {
          if (resolution.state === "fall") {
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

  private activeUnit(): UnitView {
    const active = this.units.find(
      (unit) => unit.data.id === this.matchState.activeCombatantId,
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
      const living = view.hitPoints > 0;
      const active = living && view.data.id === activeId;
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
            : view.data.team === "crew"
              ? "#176f6b"
              : "#b8463c",
        )
        .setColor(active ? COLORS.ink : COLORS.cream);
      view.container.setAlpha(living ? 1 : 0.42).setAngle(0);

      if (living) {
        view.container.setVisible(true);
        if (active) {
          this.setCreaturePose(view.data.id, "planning");
        } else {
          this.playCreatureMotion(view, "idle");
        }
      }
    }

    const active = this.activeUnit();
    this.intentHeaderText.setText(`PLAN VON ${active.data.displayName}`);
    this.updateTurnHud();
    this.updateTeamHud();
  }

  private synchronizeMatchHitPoints(): void {
    for (const view of this.units) {
      this.matchState = updateCombatantHitPoints(
        this.matchState,
        view.data.id,
        view.hitPoints,
      );
    }
  }

  private scheduleOpponentAction(): void {
    const activeId = this.matchState.activeCombatantId;

    if (!this.plan.selected && this.movementPlan.kind === "hold") {
      this.scheduleTurnAdvance(
        1_000,
        `${this.activeUnit().data.displayName} findet keinen gültigen Plan – Zug wird übersprungen.`,
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
      const outcome = determineMatchOutcome(this.matchState);

      if (outcome) {
        this.finishMatch(outcome);
        return;
      }

      this.matchState = advanceTurn(this.matchState);
      this.rejectedCandidateIds = [];
      this.forcedWeaponId = null;
      this.actionState = "planning";
      const next = this.activeUnit();
      this.replan(
        `Zug ${this.matchState.turnNumber}: ${next.data.displayName} ist am Zug.`,
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
      if (view.hitPoints > 0) {
        this.setCreaturePose(
          view.data.id,
          outcome !== "draw" && view.data.team === outcome
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
    this.turnQueueText.setText("R  ·  MATCH NEU STARTEN");
    this.intentHeaderText.setText("MATCH BEENDET");
    this.intentText.setText(
      `${result}\n\nR startet dieselbe deterministische Begegnung neu.`,
    );
    this.interventionText.setText("ALLE AKTIONEN UND TERRAINFOLGEN SIND AUFGELÖST");
    this.updateTeamHud();
    this.updateStatus("Match beendet. Mit R kannst du die Begegnung neu starten.");
    this.updateButtons();
  }

  private rejectCurrentPlan(): void {
    const active = this.activeUnit();

    if (
      this.actionState !== "planning" ||
      active.data.team !== "crew" ||
      this.interventionUsed ||
      !this.plan.selected
    ) {
      return;
    }

    const rejected = this.plan.selected;
    this.rejectedCandidateIds = [rejected.id];
    this.interventionUsed = true;
    this.replan(
      `„Lass das!“: ${rejected.id} verworfen. ${active.data.displayName} erklärt jetzt den nächstbesten gültigen Plan.`,
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
    const active = this.activeUnit();

    if (
      this.actionState !== "planning" ||
      active.data.team !== "crew" ||
      this.weaponCommandUsed
    ) {
      return;
    }

    this.weaponCommandUsed = true;
    this.forcedWeaponId = weaponId;
    this.rejectedCandidateIds = [];
    this.replan(
      `Managerkommando: ${active.data.displayName} muss den nächsten Plan mit ${WEAPON_PROFILES[weaponId].displayName} aufstellen.`,
    );
  }

  private cyclePersonality(): void {
    const active = this.activeUnit();

    if (this.actionState !== "planning" || active.data.team !== "crew") {
      return;
    }

    const currentIndex = PERSONALITIES.indexOf(this.personality);
    this.personality =
      PERSONALITIES[(currentIndex + 1) % PERSONALITIES.length] ?? "cautious";
    active.personality = this.personality;
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
    this.scene.restart();
  }

  private updateButtons(): void {
    const planning = this.actionState === "planning";
    const playerTurn = planning && this.activeUnit().data.team === "crew";
    const canReject =
      playerTurn && !this.interventionUsed && Boolean(this.plan.selected);
    const canExecute =
      playerTurn &&
      (Boolean(this.plan.selected) || this.movementPlan.kind !== "hold");
    this.executeButton.setFillStyle(canExecute ? COLORS.teal : 0x4d6465, 1);
    this.executeButtonText.setAlpha(canExecute ? 1 : 0.55);
    this.rejectButton.setFillStyle(canReject ? COLORS.coral : 0x4d6465, 1);
    this.rejectButtonText.setAlpha(canReject ? 1 : 0.55);
    const canChooseWeapon = playerTurn && !this.weaponCommandUsed;
    for (const [weaponId, button] of this.weaponCommandButtons) {
      const selected = this.forcedWeaponId === weaponId;
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
      (unit) => unit.data.id === this.matchState.activeCombatantId,
    );
    const target = this.units.find(
      (unit) => unit.data.id === selected.targetId,
    );
    const points: CameraPoint[] = selected.trajectory.samples.map(
      (sample) => sample.position,
    );
    points.push(...this.movementPlan.samples.map((sample) => ({ ...sample })));

    if (actor) {
      points.push({ ...actor.worldPosition });
    }
    if (target) {
      points.push({ ...target.worldPosition });
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
            view.worldPosition.x - impact.x,
            view.worldPosition.y - impact.y,
          ) < 260,
      )
      .map((view) => ({ ...view.worldPosition }));
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
      view.hitPoints / view.data.hitPoints,
      0,
      1,
    );
    view.healthText.setText(String(view.hitPoints));
    view.healthBarFill
      .setVisible(ratio > 0)
      .setDisplaySize(Math.max(1, 76 * ratio), 8)
      .setFillStyle(
        ratio <= 0.34
          ? COLORS.coral
          : view.data.team === "crew"
            ? COLORS.tealBright
            : COLORS.yellow,
        1,
      );
  }

  private setCreaturePose(unitId: string, pose: CreaturePose): void {
    const view = this.units.find((unit) => unit.data.id === unitId);

    if (!view) {
      return;
    }

    const visual = CREATURE_VISUALS[view.visualId];
    view.sprite.stop().setFrame(visual.poseFrames[pose]);
  }

  private playCreatureMotion(view: UnitView, motion: CreatureMotion): void {
    const visual = CREATURE_VISUALS[view.visualId];
    const frames = visual.motionFrames[motion];

    if (!frames || frames.length < 2) {
      this.setCreaturePose(
        view.data.id,
        motion === "jump" ? "startled" : "planning",
      );
      return;
    }

    view.sprite.play(creatureAnimationKey(view.visualId, motion), true);
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
