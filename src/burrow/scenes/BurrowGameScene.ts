import Phaser from "phaser";

import {
  BURROW_HUT,
  BURROW_START,
  BURROW_VEHICLE_ROUTE,
  BURROW_WORLD_HEIGHT,
  BURROW_WORLD_WIDTH,
  createBurrowArena,
  createHutSupportPoints,
  surfaceYAt,
} from "../content/arena";
import { OneShotInputBuffer } from "../input/OneShotInputBuffer";
import { TiledTerrainRenderer } from "../rendering/TiledTerrainRenderer";
import { BurrowHunt, type BiteResult } from "../simulation/BurrowHunt";
import {
  BURROW_MOTION_CONSTANTS,
  BurrowMotion,
  type BurrowMovementMode,
} from "../simulation/BurrowMotion";
import { BurrowStructure } from "../simulation/BurrowStructure";
import type {
  CellRegion,
  Point,
  TerrainCarveResult,
} from "../simulation/BurrowTerrain";

const FIXED_STEP = 1 / 60;
const MAX_ACCUMULATED_TIME = 0.1;
const VIEW_WIDTH = 1280;
const VIEW_HEIGHT = 720;

interface DustParticle {
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
  life: number;
  radius: number;
}

export class BurrowGameScene extends Phaser.Scene {
  private motion!: BurrowMotion;
  private terrainRenderer!: TiledTerrainRenderer;
  private hunt!: BurrowHunt;
  private structure!: BurrowStructure;
  private wormGraphics!: Phaser.GameObjects.Graphics;
  private dustGraphics!: Phaser.GameObjects.Graphics;
  private hudText!: Phaser.GameObjects.Text;
  private hudPanel!: Phaser.GameObjects.Rectangle;
  private hudTitle!: Phaser.GameObjects.Text;
  private goalText!: Phaser.GameObjects.Text;
  private eventText!: Phaser.GameObjects.Text;
  private joystickBase!: Phaser.GameObjects.Arc;
  private joystickNub!: Phaser.GameObjects.Arc;
  private directionLabel!: Phaser.GameObjects.Text;
  private burstButton!: Phaser.GameObjects.Arc;
  private burstLabel!: Phaser.GameObjects.Text;
  private controlsHint!: Phaser.GameObjects.Text;
  private vehicleGraphics!: Phaser.GameObjects.Graphics;
  private vehicleLabel!: Phaser.GameObjects.Text;
  private structureGraphics!: Phaser.GameObjects.Graphics;
  private structureLabel!: Phaser.GameObjects.Text;
  private vehicleHitFlash = 0;
  private started = false;
  private steeringPointerId: number | null = null;
  private touchDirection: Point | null = null;
  private readonly burstInput = new OneShotInputBuffer();
  private accumulator = 0;
  private dustParticles: DustParticle[] = [];
  private uiScale = 1;
  private keyW?: Phaser.Input.Keyboard.Key;
  private keyA?: Phaser.Input.Keyboard.Key;
  private keyS?: Phaser.Input.Keyboard.Key;
  private keyD?: Phaser.Input.Keyboard.Key;
  private keyUp?: Phaser.Input.Keyboard.Key;
  private keyDown?: Phaser.Input.Keyboard.Key;
  private keyLeft?: Phaser.Input.Keyboard.Key;
  private keyRight?: Phaser.Input.Keyboard.Key;
  private keyBurst?: Phaser.Input.Keyboard.Key;
  private keyBurstAlternative?: Phaser.Input.Keyboard.Key;
  private keyRestart?: Phaser.Input.Keyboard.Key;
  private liveStatus?: HTMLOutputElement | null;

  public constructor() {
    super("BurrowGameScene");
  }

  public create(): void {
    const terrain = createBurrowArena();
    this.createWorldBackdrop();
    this.terrainRenderer = new TiledTerrainRenderer(this, terrain, "burrow-terrain");
    this.createSurfaceDetails();
    this.motion = new BurrowMotion(terrain, BURROW_START, -0.16);
    this.hunt = new BurrowHunt({ ...BURROW_VEHICLE_ROUTE, surfaceYAt });
    this.structure = new BurrowStructure(terrain, createHutSupportPoints());
    this.wormGraphics = this.add.graphics().setDepth(12);
    this.dustGraphics = this.add.graphics().setDepth(11);
    this.createVehicle();
    this.createStructure();
    this.createHud();
    this.resetTouchDirection();
    this.configureInput();
    this.configureCamera();
    this.burstInput.clear();
    this.liveStatus = document.querySelector<HTMLOutputElement>("#burrow-live-status");
    this.game.canvas.tabIndex = 0;
    this.game.canvas.setAttribute("aria-label", "Burrow Bewegungslabor");
    this.game.canvas.focus();

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.terrainRenderer.destroy();
      this.input.off("pointerdown", this.handlePointerDown, this);
      this.input.off("pointermove", this.handlePointerMove, this);
      this.input.off("pointerup", this.handlePointerUp, this);
      this.input.off("pointerupoutside", this.handlePointerUp, this);
      this.scale.off(Phaser.Scale.Events.RESIZE, this.layoutHud, this);
    });
  }

  public override update(_time: number, deltaMilliseconds: number): void {
    const direction = this.readDirection();
    this.captureBurstInput();
    if (!this.started) {
      if (!direction && !this.burstInput.hasPending) {
        this.renderWorm();
        this.updateCamera();
        this.updateHud();
        return;
      }
      this.started = true;
      this.showEvent("LOS!", "#fff0a1");
    }
    this.accumulator = Math.min(
      MAX_ACCUMULATED_TIME,
      this.accumulator + deltaMilliseconds / 1000,
    );
    let combinedMutation: TerrainCarveResult | null = null;

    while (this.accumulator >= FIXED_STEP) {
      const previousMode = this.motion.state.mode;
      const burstPressed = this.burstInput.consume();
      const result = this.motion.step(
        { direction, burstPressed },
        FIXED_STEP,
      );
      const huntResult = this.hunt.step(FIXED_STEP);
      const bite = this.hunt.tryBite({
        headPosition: this.motion.state.position,
        speed: this.motion.state.speed,
        burstActive: this.motion.state.burstRemaining > 0,
      });
      const structureResult = this.structure.step();
      combinedMutation = mergeMutations(combinedMutation, result.terrainMutation);
      if (result.terrainMutation?.removedCells) {
        this.spawnDigDust(this.motion.state.position, this.motion.state.angle, 2);
      }
      if (result.modeChanged) {
        this.announceModeChange(previousMode, this.motion.state.mode);
      }
      if (result.burstStarted) {
        this.spawnDigDust(this.motion.state.position, this.motion.state.angle, 14);
        this.cameras.main.shake(100, 0.0028);
      }
      if (bite) {
        this.announceBite(bite);
      }
      if (huntResult.respawned) {
        this.showEvent("NEUE KUTSCHE!", "#c7f279");
      }
      if (structureResult.collapsedNow) {
        this.announceStructureCollapse();
      } else if (structureResult.lostSupportIds.length > 0) {
        this.announceSupportLoss(structureResult.lostSupportIds.length);
      }
      this.accumulator -= FIXED_STEP;
    }

    this.terrainRenderer.applyMutation(combinedMutation);
    this.vehicleHitFlash = Math.max(0, this.vehicleHitFlash - deltaMilliseconds / 1000);
    this.renderVehicle();
    this.renderStructure();
    this.updateDust(deltaMilliseconds / 1000);
    this.renderWorm();
    this.updateCamera();
    this.updateHud();

    if (this.keyRestart && Phaser.Input.Keyboard.JustDown(this.keyRestart)) {
      this.scene.restart();
    }
  }

  private createWorldBackdrop(): void {
    const graphics = this.add.graphics().setDepth(0);
    graphics.fillStyle(0x86bfd0).fillRect(0, 0, BURROW_WORLD_WIDTH, 390);
    graphics.fillStyle(0xd3e7d5).fillCircle(220, 105, 74);
    graphics.fillCircle(300, 92, 52);
    graphics.fillCircle(1640, 116, 62);
    graphics.fillCircle(1720, 104, 46);
    graphics.fillStyle(0x17151c).fillRect(0, 300, BURROW_WORLD_WIDTH, BURROW_WORLD_HEIGHT - 300);
    graphics.fillStyle(0x211b23).fillCircle(1090, 940, 190);
    graphics.fillStyle(0x28202a).fillCircle(1210, 900, 150);

    const routeMarker = this.add.graphics().setDepth(1);
    routeMarker.lineStyle(5, 0x9fd064, 0.24);
    routeMarker.lineBetween(
      BURROW_VEHICLE_ROUTE.minimumX,
      surfaceYAt(BURROW_VEHICLE_ROUTE.minimumX) - 12,
      BURROW_VEHICLE_ROUTE.maximumX,
      surfaceYAt(BURROW_VEHICLE_ROUTE.maximumX) - 12,
    );
    routeMarker.fillStyle(0x9fd064, 0.14).fillCircle(BURROW_VEHICLE_ROUTE.startX, 800, 70);

    const structureMarker = this.add.graphics().setDepth(1);
    structureMarker.lineStyle(5, 0xffb95e, 0.26);
    structureMarker.lineBetween(
      BURROW_HUT.centerX,
      surfaceYAt(BURROW_HUT.centerX) - 210,
      BURROW_HUT.centerX,
      1040,
    );
    structureMarker.fillStyle(0xffb95e, 0.13).fillCircle(BURROW_HUT.centerX, 870, 80);
  }

  private createSurfaceDetails(): void {
    const details = this.add.graphics().setDepth(3);
    for (let x = 0; x < BURROW_WORLD_WIDTH; x += 32) {
      const y = surfaceYAt(x);
      details.lineStyle(3, x % 64 === 0 ? 0x9fbf45 : 0x728e38, 0.95);
      details.lineBetween(x, y + 2, x + 4, y - 11 - (x % 7));
      details.lineBetween(x + 6, y + 2, x + 12, y - 8);
    }

    details.fillStyle(0x435967).fillRect(1320, surfaceYAt(1320) - 13, 160, 13);
    details.fillStyle(0xd2c7a2).fillRect(1328, surfaceYAt(1320) - 20, 30, 7);
    details.fillRect(1415, surfaceYAt(1320) - 20, 56, 7);

    this.add
      .text(1100, surfaceYAt(1100) - 92, "OBERFLÄCHE", {
        fontFamily: "Arial Black, sans-serif",
        fontSize: "22px",
        color: "#29404b",
      })
      .setOrigin(0.5)
      .setDepth(4);
    this.add
      .text(1090, 940, "ALTE HÖHLE\nFLUGPHASE TESTEN", {
        align: "center",
        fontFamily: "Arial, sans-serif",
        fontSize: "19px",
        color: "#a9909f",
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setDepth(1);
  }

  private createVehicle(): void {
    this.vehicleGraphics = this.add.graphics().setDepth(8);
    this.vehicleLabel = this.add
      .text(0, 0, "", {
        fontFamily: "Arial Black, sans-serif",
        fontSize: "16px",
        color: "#e8f7bb",
        stroke: "#25331e",
        strokeThickness: 5,
      })
      .setOrigin(0.5)
      .setDepth(9);
    this.renderVehicle();
  }

  private createStructure(): void {
    this.structureGraphics = this.add.graphics().setDepth(7);
    this.structureLabel = this.add
      .text(0, 0, "", {
        align: "center",
        fontFamily: "Arial Black, sans-serif",
        fontSize: "16px",
        color: "#ffd88a",
        stroke: "#35241f",
        strokeThickness: 5,
      })
      .setOrigin(0.5)
      .setDepth(8);
    this.renderStructure();
  }

  private createHud(): void {
    this.hudPanel = this.add
      .rectangle(18, 18, 570, 170, 0x10151c, 0.88)
      .setOrigin(0)
      .setScrollFactor(0)
      .setDepth(100)
      .setStrokeStyle(2, 0xffbd50, 0.75);
    this.hudTitle = this.add
      .text(38, 32, "BURROW LAB · GATE 3", {
        fontFamily: "Arial Black, sans-serif",
        fontSize: "25px",
        color: "#ffd66d",
      })
      .setScrollFactor(0)
      .setDepth(101);
    this.hudText = this.add
      .text(38, 69, "", {
        fontFamily: "Consolas, monospace",
        fontSize: "16px",
        color: "#f6edda",
        lineSpacing: 5,
      })
      .setScrollFactor(0)
      .setDepth(101);
    this.goalText = this.add
      .text(VIEW_WIDTH - 22, 22, "", {
        align: "right",
        fontFamily: "Arial Black, sans-serif",
        fontSize: "18px",
        color: "#ffe084",
        stroke: "#201b1f",
        strokeThickness: 5,
      })
      .setOrigin(1, 0)
      .setScrollFactor(0)
      .setDepth(101);
    this.eventText = this.add
      .text(VIEW_WIDTH / 2, 125, "", {
        fontFamily: "Arial Black, sans-serif",
        fontSize: "34px",
        color: "#fff0a1",
        stroke: "#512c22",
        strokeThickness: 8,
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(110)
      .setAlpha(0);

    this.joystickBase = this.add
      .circle(116, VIEW_HEIGHT - 108, 66, 0x10151c, 0.48)
      .setScrollFactor(0)
      .setDepth(100)
      .setStrokeStyle(3, 0xf7e2b0, 0.52);
    this.joystickNub = this.add
      .circle(116, VIEW_HEIGHT - 108, 29, 0xd78843, 0.8)
      .setScrollFactor(0)
      .setDepth(101);
    this.directionLabel = this.add
      .text(116, VIEW_HEIGHT - 23, "RICHTUNG", {
        fontFamily: "Arial Black, sans-serif",
        fontSize: "13px",
        color: "#f7e2b0",
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(101);

    this.burstButton = this.add
      .circle(VIEW_WIDTH - 105, VIEW_HEIGHT - 106, 62, 0xb9472e, 0.84)
      .setScrollFactor(0)
      .setDepth(100)
      .setStrokeStyle(4, 0xffd66d, 0.78)
      .setInteractive({ useHandCursor: true });
    this.burstLabel = this.add
      .text(this.burstButton.x, this.burstButton.y, "BURST", {
        fontFamily: "Arial Black, sans-serif",
        fontSize: "21px",
        color: "#fff2c6",
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(101);
    this.controlsHint = this.add
      .text(VIEW_WIDTH / 2, VIEW_HEIGHT - 33, "WASD / PFEILE · SHIFT / LEERTASTE · R NEUSTART", {
        fontFamily: "Consolas, monospace",
        fontSize: "14px",
        color: "#efe5cd",
        backgroundColor: "#10151ccc",
        padding: { x: 10, y: 6 },
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(101);

    this.burstButton.on("pointerdown", () => {
      this.burstInput.queue();
    });
    this.scale.on(Phaser.Scale.Events.RESIZE, this.layoutHud, this);
    this.layoutHud();
  }

  private layoutHud(): void {
    const width = this.scale.width;
    const height = this.scale.height;
    const scale = Math.min(1, width / VIEW_WIDTH, height / VIEW_HEIGHT);
    const at = (value: number): number => value * scale;
    this.uiScale = scale;

    this.hudPanel.setPosition(at(18), at(18)).setSize(at(570), at(170));
    this.hudTitle.setPosition(at(38), at(32)).setScale(scale);
    this.hudText.setPosition(at(38), at(69)).setScale(scale);
    this.goalText.setPosition(width - at(22), at(22)).setScale(scale);
    this.eventText.setPosition(width / 2, at(125)).setScale(scale);

    const joystickX = at(116);
    const joystickY = height - at(108);
    this.joystickBase.setPosition(joystickX, joystickY).setRadius(at(66));
    this.joystickNub.setPosition(joystickX, joystickY).setRadius(at(29));
    this.directionLabel.setPosition(joystickX, height - at(23)).setScale(scale);

    const burstX = width - at(105);
    const burstY = height - at(106);
    this.burstButton.setPosition(burstX, burstY).setRadius(at(62));
    this.burstLabel.setPosition(burstX, burstY).setScale(scale);
    this.controlsHint.setPosition(width / 2, height - at(33)).setScale(scale);
  }

  private configureInput(): void {
    this.input.addPointer(2);
    const keyboard = this.input.keyboard;
    if (keyboard) {
      this.keyW = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
      this.keyA = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
      this.keyS = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
      this.keyD = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
      this.keyUp = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
      this.keyDown = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);
      this.keyLeft = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
      this.keyRight = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
      this.keyBurst = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
      this.keyBurstAlternative = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
      this.keyRestart = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
    }
    this.input.on("pointerdown", this.handlePointerDown, this);
    this.input.on("pointermove", this.handlePointerMove, this);
    this.input.on("pointerup", this.handlePointerUp, this);
    this.input.on("pointerupoutside", this.handlePointerUp, this);
  }

  private configureCamera(): void {
    const camera = this.cameras.main;
    camera.setBounds(0, 0, BURROW_WORLD_WIDTH, BURROW_WORLD_HEIGHT);
    camera.centerOn(BURROW_START.x, BURROW_START.y);
    camera.setBackgroundColor(0x17151c);
  }

  private handlePointerDown(pointer: Phaser.Input.Pointer): void {
    const joystickReach = 132 * this.uiScale;
    if (
      pointer.x > this.joystickBase.x + joystickReach ||
      pointer.y < this.joystickBase.y - joystickReach
    ) {
      return;
    }
    this.steeringPointerId = pointer.id;
    this.updateTouchDirection(pointer);
  }

  private handlePointerMove(pointer: Phaser.Input.Pointer): void {
    if (pointer.id !== this.steeringPointerId || !pointer.isDown) {
      return;
    }
    this.updateTouchDirection(pointer);
  }

  private handlePointerUp(pointer: Phaser.Input.Pointer): void {
    if (pointer.id !== this.steeringPointerId) {
      return;
    }
    this.steeringPointerId = null;
    this.resetTouchDirection();
  }

  private updateTouchDirection(pointer: Phaser.Input.Pointer): void {
    const deltaX = pointer.x - this.joystickBase.x;
    const deltaY = pointer.y - this.joystickBase.y;
    const distance = Math.hypot(deltaX, deltaY);
    if (distance < 2 * this.uiScale) {
      this.touchDirection = null;
      return;
    }
    this.touchDirection = { x: deltaX / distance, y: deltaY / distance };
    const visualDistance = Math.min(40 * this.uiScale, distance);
    this.joystickNub.setPosition(
      this.joystickBase.x + (deltaX / distance) * visualDistance,
      this.joystickBase.y + (deltaY / distance) * visualDistance,
    );
  }

  private resetTouchDirection(): void {
    this.steeringPointerId = null;
    this.touchDirection = null;
    if (this.joystickNub && this.joystickBase) {
      this.joystickNub.setPosition(this.joystickBase.x, this.joystickBase.y);
    }
  }

  private readDirection(): Point | null {
    let x = 0;
    let y = 0;
    if (this.keyA?.isDown || this.keyLeft?.isDown) x -= 1;
    if (this.keyD?.isDown || this.keyRight?.isDown) x += 1;
    if (this.keyW?.isDown || this.keyUp?.isDown) y -= 1;
    if (this.keyS?.isDown || this.keyDown?.isDown) y += 1;
    if (x !== 0 || y !== 0) {
      const length = Math.hypot(x, y);
      return { x: x / length, y: y / length };
    }
    return this.touchDirection;
  }

  private captureBurstInput(): void {
    const keyboardBurst =
      (this.keyBurst ? Phaser.Input.Keyboard.JustDown(this.keyBurst) : false) ||
      (this.keyBurstAlternative
        ? Phaser.Input.Keyboard.JustDown(this.keyBurstAlternative)
        : false);
    if (keyboardBurst) {
      this.burstInput.queue();
    }
  }

  private renderWorm(): void {
    const state = this.motion.state;
    const samples = this.motion.trail.sample(23, 18);
    const graphics = this.wormGraphics;
    graphics.clear();

    for (let index = samples.length - 1; index >= 1; index -= 1) {
      const point = samples[index]!;
      const bodyRatio = 1 - index / samples.length;
      const radius = 7 + bodyRatio * 13;
      graphics.fillStyle(0x2a1820, 1).fillCircle(point.x, point.y, radius + 4);
      graphics
        .fillStyle(index % 3 === 0 ? 0xc75a35 : 0xdf7840, 1)
        .fillCircle(point.x, point.y, radius);
      if (index % 4 === 0) {
        graphics.fillStyle(0xf2a34f, 0.75).fillCircle(
          point.x - radius * 0.2,
          point.y - radius * 0.35,
          Math.max(2, radius * 0.22),
        );
      }
    }

    const head = state.position;
    const forward = { x: Math.cos(state.angle), y: Math.sin(state.angle) };
    const side = { x: -forward.y, y: forward.x };
    graphics.fillStyle(0x24151c, 1).fillCircle(head.x, head.y, 29);
    graphics.fillStyle(state.burstRemaining > 0 ? 0xff9b3f : 0xd85f35, 1).fillCircle(head.x, head.y, 24);
    graphics.fillStyle(0xf2a34f, 1).fillTriangle(
      head.x + forward.x * 31,
      head.y + forward.y * 31,
      head.x + side.x * 17 - forward.x * 4,
      head.y + side.y * 17 - forward.y * 4,
      head.x - side.x * 17 - forward.x * 4,
      head.y - side.y * 17 - forward.y * 4,
    );
    for (const sideSign of [-1, 1]) {
      const eyeX = head.x + forward.x * 8 + side.x * 10 * sideSign;
      const eyeY = head.y + forward.y * 8 + side.y * 10 * sideSign;
      graphics.fillStyle(0xfff4d2, 1).fillCircle(eyeX, eyeY, 5);
      graphics.fillStyle(0x29171d, 1).fillCircle(
        eyeX + forward.x * 2,
        eyeY + forward.y * 2,
        2.5,
      );
    }
  }

  private renderVehicle(): void {
    const vehicle = this.hunt.state.vehicle;
    const graphics = this.vehicleGraphics;
    graphics.clear();
    this.vehicleLabel.setVisible(vehicle.active);
    if (!vehicle.active) {
      return;
    }

    const { x, y } = vehicle.position;
    const facing = vehicle.direction;
    const flash = this.vehicleHitFlash > 0;
    graphics.fillStyle(0x2d2824, 1).fillCircle(x - 22, y + 16, 10).fillCircle(x + 23, y + 16, 10);
    graphics.fillStyle(0x17161b, 1).fillCircle(x - 22, y + 16, 5).fillCircle(x + 23, y + 16, 5);
    graphics.fillStyle(flash ? 0xfff1b0 : 0x6d9f56, 1).fillRoundedRect(x - 38, y - 12, 76, 27, 6);
    graphics.lineStyle(4, 0x2d4734, 1).strokeRoundedRect(x - 38, y - 12, 76, 27, 6);
    graphics.fillStyle(flash ? 0xffdd7d : 0xb8d6a0, 1).fillRoundedRect(x - 8, y - 29, 34, 20, 5);
    graphics.lineStyle(3, 0x2d4734, 1).strokeRoundedRect(x - 8, y - 29, 34, 20, 5);
    graphics.fillStyle(0xf8e8a5, 1).fillCircle(x + facing * 38, y - 2, 5);
    graphics.fillStyle(0x4e2f24, 1).fillRect(x - 29, y - 3, 23, 5);

    const hitPointsRatio = vehicle.hitPoints / vehicle.maximumHitPoints;
    graphics.fillStyle(0x1a2020, 0.94).fillRoundedRect(x - 39, y - 52, 78, 12, 4);
    graphics.fillStyle(0x86cf65, 1).fillRoundedRect(x - 37, y - 50, 74 * hitPointsRatio, 8, 3);
    this.vehicleLabel.setPosition(x, y - 70).setText(`KUTSCHE · ${vehicle.hitPoints}/${vehicle.maximumHitPoints} HP`);
  }

  private renderStructure(): void {
    const structure = this.structure.state;
    const graphics = this.structureGraphics;
    const surfaceY = surfaceYAt(BURROW_HUT.centerX);
    const activeSupports = structure.supports.filter((support) => support.active).length;
    graphics.clear();

    if (structure.collapsed) {
      graphics.fillStyle(0x4e3027, 1).fillTriangle(
        BURROW_HUT.centerX - 118,
        surfaceY + 6,
        BURROW_HUT.centerX + 96,
        surfaceY + 6,
        BURROW_HUT.centerX + 38,
        surfaceY - 66,
      );
      graphics.fillStyle(0x96613d, 1).fillTriangle(
        BURROW_HUT.centerX - 88,
        surfaceY - 1,
        BURROW_HUT.centerX + 64,
        surfaceY - 1,
        BURROW_HUT.centerX + 22,
        surfaceY - 50,
      );
      graphics.lineStyle(5, 0x2f2422, 1).strokeTriangle(
        BURROW_HUT.centerX - 88,
        surfaceY - 1,
        BURROW_HUT.centerX + 64,
        surfaceY - 1,
        BURROW_HUT.centerX + 22,
        surfaceY - 50,
      );
      for (const offset of [-102, -68, 72, 108]) {
        graphics.fillStyle(0x745039, 1).fillCircle(BURROW_HUT.centerX + offset, surfaceY + 3, 9);
      }
      this.structureLabel
        .setPosition(BURROW_HUT.centerX, surfaceY - 104)
        .setText("HÜTTE EINGESTÜRZT!");
      return;
    }

    for (const support of structure.supports) {
      const topY = surfaceYAt(support.position.x) - 9;
      graphics.lineStyle(13, support.active ? 0xc98242 : 0x4f3940, 1).lineBetween(
        support.position.x,
        topY,
        support.position.x,
        support.position.y,
      );
      graphics.lineStyle(4, 0x3b2925, 1).lineBetween(
        support.position.x,
        topY,
        support.position.x,
        support.position.y,
      );
      if (!support.active) {
        graphics.lineStyle(5, 0xf0b24d, 1).lineBetween(
          support.position.x - 12,
          support.position.y - 12,
          support.position.x + 12,
          support.position.y + 12,
        );
      }
    }
    graphics.fillStyle(0x8e5a3d, 1).fillRoundedRect(
      BURROW_HUT.centerX - 112,
      surfaceY - 104,
      224,
      92,
      9,
    );
    graphics.lineStyle(6, 0x332521, 1).strokeRoundedRect(
      BURROW_HUT.centerX - 112,
      surfaceY - 104,
      224,
      92,
      9,
    );
    graphics.fillStyle(0xd7a24d, 1).fillTriangle(
      BURROW_HUT.centerX - 132,
      surfaceY - 102,
      BURROW_HUT.centerX + 132,
      surfaceY - 102,
      BURROW_HUT.centerX,
      surfaceY - 162,
    );
    graphics.lineStyle(6, 0x332521, 1).strokeTriangle(
      BURROW_HUT.centerX - 132,
      surfaceY - 102,
      BURROW_HUT.centerX + 132,
      surfaceY - 102,
      BURROW_HUT.centerX,
      surfaceY - 162,
    );
    graphics.fillStyle(0x263b44, 1).fillRoundedRect(BURROW_HUT.centerX - 25, surfaceY - 72, 50, 60, 5);
    graphics.fillStyle(0xf3d672, 0.82).fillCircle(BURROW_HUT.centerX + 58, surfaceY - 62, 16);
    this.structureLabel
      .setPosition(BURROW_HUT.centerX, surfaceY - 190)
      .setText(`STÜTZENHÜTTE · ${activeSupports}/3`);
  }

  private announceBite(bite: BiteResult): void {
    this.vehicleHitFlash = 0.18;
    this.spawnDigDust(this.motion.state.position, this.motion.state.angle, bite.devoured ? 32 : 16);
    this.cameras.main.shake(bite.devoured ? 230 : 120, bite.devoured ? 0.008 : 0.004);
    if (bite.devoured) {
      this.showEvent("VERSCHLUNGEN! +1 BIOMASSE", "#c7f279");
      return;
    }
    this.showEvent(
      bite.damage > 1 ? "BURST-BITE! −2 HP" : "BITE! −1 HP",
      bite.damage > 1 ? "#ffdf82" : "#fff0a1",
    );
  }

  private announceSupportLoss(count: number): void {
    this.showEvent(count > 1 ? "STÜTZEN WEG!" : "STÜTZE WEG!", "#ffd67a");
    this.cameras.main.shake(140, 0.004);
    for (const support of this.structure.state.supports) {
      if (!support.active) {
        this.spawnDigDust(support.position, Math.PI / 2, 10);
      }
    }
  }

  private announceStructureCollapse(): void {
    this.showEvent("HÜTTE EINGESTÜRZT!", "#ffcb71");
    this.cameras.main.shake(380, 0.011);
    this.spawnDigDust({ x: BURROW_HUT.centerX, y: surfaceYAt(BURROW_HUT.centerX) }, Math.PI / 2, 44);
  }

  private announceModeChange(
    previousMode: BurrowMovementMode,
    mode: BurrowMovementMode,
  ): void {
    if (mode === "airborne") {
      this.showEvent("DURCHBRUCH!", "#fff0a1");
      this.spawnDigDust(this.motion.state.position, this.motion.state.angle, 24);
      this.cameras.main.shake(180, 0.006);
    } else if (previousMode === "airborne" && mode === "digging") {
      this.showEvent("WIEDER UNTER ERDE", "#e69a59");
      this.spawnDigDust(this.motion.state.position, this.motion.state.angle, 18);
    }
  }

  private showEvent(message: string, color: string): void {
    const baseScale = this.uiScale;
    this.eventText
      .setText(message)
      .setColor(color)
      .setAlpha(1)
      .setScale(baseScale * 0.82);
    this.tweens.killTweensOf(this.eventText);
    this.tweens.add({
      targets: this.eventText,
      alpha: 0,
      scale: baseScale * 1.08,
      y: 105 * baseScale,
      duration: 950,
      ease: "Quad.easeOut",
      onComplete: () => this.eventText.setY(125 * baseScale),
    });
  }

  private spawnDigDust(position: Point, angle: number, count: number): void {
    const backward = angle + Math.PI;
    for (let index = 0; index < count; index += 1) {
      const spread = (Math.random() - 0.5) * 1.6;
      const speed = 25 + Math.random() * 75;
      this.dustParticles.push({
        x: position.x + (Math.random() - 0.5) * 24,
        y: position.y + (Math.random() - 0.5) * 24,
        velocityX: Math.cos(backward + spread) * speed,
        velocityY: Math.sin(backward + spread) * speed - 20,
        life: 0.35 + Math.random() * 0.4,
        radius: 2 + Math.random() * 5,
      });
    }
    if (this.dustParticles.length > 150) {
      this.dustParticles.splice(0, this.dustParticles.length - 150);
    }
  }

  private updateDust(deltaSeconds: number): void {
    const graphics = this.dustGraphics;
    graphics.clear();
    for (const particle of this.dustParticles) {
      particle.life -= deltaSeconds;
      particle.x += particle.velocityX * deltaSeconds;
      particle.y += particle.velocityY * deltaSeconds;
      particle.velocityY += 80 * deltaSeconds;
      if (particle.life <= 0) {
        continue;
      }
      graphics.fillStyle(0xd09357, Math.min(0.72, particle.life * 1.4));
      graphics.fillCircle(particle.x, particle.y, particle.radius);
    }
    this.dustParticles = this.dustParticles.filter((particle) => particle.life > 0);
  }

  private updateCamera(): void {
    const camera = this.cameras.main;
    const desiredScrollX = Phaser.Math.Clamp(
      this.motion.state.position.x - camera.width / 2,
      0,
      BURROW_WORLD_WIDTH - camera.width,
    );
    const desiredScrollY = Phaser.Math.Clamp(
      this.motion.state.position.y - camera.height / 2,
      0,
      BURROW_WORLD_HEIGHT - camera.height,
    );
    camera.scrollX = Phaser.Math.Linear(camera.scrollX, desiredScrollX, 0.075);
    camera.scrollY = Phaser.Math.Linear(camera.scrollY, desiredScrollY, 0.075);
  }

  private updateHud(): void {
    const state = this.motion.state;
    const modeLabel: Record<BurrowMovementMode, string> = {
      digging: "GRABEN",
      tunnel: "TUNNELGLEITEN",
      airborne: "FLUGPHASE",
    };
    this.hudText.setText([
      `MODUS  ${modeLabel[state.mode]}   TEMPO  ${Math.round(state.speed)}`,
      `TUNNEL  ${Math.round(state.excavatedCells * 0.016)} m²   UPDATE  ${this.terrainRenderer.lastUpdatedTileCount} KACHEL(N)`,
      `BEUTE  ${this.hunt.state.vehicle.active ? `${this.hunt.state.vehicle.hitPoints}/${this.hunt.state.vehicle.maximumHitPoints} HP` : "VERSCHLUNGEN"}   BIOMASSE  ${this.hunt.state.biomass}`,
      `HÜTTE  ${this.structure.state.collapsed ? "EINGESTÜRZT" : `${this.structure.state.supports.filter((support) => support.active).length}/3 STÜTZEN`}`,
    ]);
    const vehicle = this.hunt.state.vehicle;
    const vehicleDistance = Math.round(
      Phaser.Math.Distance.Between(
        state.position.x,
        state.position.y,
        vehicle.position.x,
        vehicle.position.y,
      ) / 10,
    );
    const structureDistance = Math.round(
      Phaser.Math.Distance.Between(
        state.position.x,
        state.position.y,
        BURROW_HUT.centerX,
        surfaceYAt(BURROW_HUT.centerX),
      ) / 10,
    );
    this.goalText.setText(
      !this.started
        ? "RICHTUNG HALTEN\nZUM STARTEN"
        : this.structure.state.collapsed
        ? "HÜTTE EINGESTÜRZT\nJAGD WEITER TESTEN"
        : !vehicle.active
        ? `BEUTE VERDAUT\nNEUE KUTSCHE IN ${Math.ceil(vehicle.respawnRemaining)} s`
        : `KUTSCHE ${vehicleDistance} m\nHÜTTE ${structureDistance} m · 2 STÜTZEN`,
    );
    const cooldownRatio = Phaser.Math.Clamp(
      state.burstCooldown / BURROW_MOTION_CONSTANTS.burstCooldown,
      0,
      1,
    );
    this.burstButton.setFillStyle(
      state.burstRemaining > 0 ? 0xf28a38 : cooldownRatio > 0 ? 0x6b4e49 : 0xb9472e,
      0.88,
    );
    this.burstLabel.setText(
      cooldownRatio > 0 && state.burstRemaining === 0
        ? `${Math.ceil(state.burstCooldown * 10) / 10}s`
        : "BURST",
    );
    if (this.liveStatus) {
      this.liveStatus.textContent = this.started
        ? `Modus ${modeLabel[state.mode]}, Tempo ${Math.round(state.speed)}, Position ${Math.round(state.position.x)} zu ${Math.round(state.position.y)}, ${vehicle.active ? `Kutsche ${vehicle.hitPoints} von ${vehicle.maximumHitPoints} HP` : "Kutsche verschlungen"}, Biomasse ${this.hunt.state.biomass}, ${this.structure.state.collapsed ? "Hütte eingestürzt" : `${this.structure.state.supports.filter((support) => support.active).length} Stützen aktiv`}.`
        : "Burrow wartet auf eine Richtung.";
    }
  }
}

function mergeMutations(
  first: TerrainCarveResult | null,
  second: TerrainCarveResult | null,
): TerrainCarveResult | null {
  if (!first) return second;
  if (!second) return first;
  return {
    removedCells: first.removedCells + second.removedCells,
    dirtyCells: mergeRegions(first.dirtyCells, second.dirtyCells),
    version: Math.max(first.version, second.version),
  };
}

function mergeRegions(first: CellRegion | null, second: CellRegion | null): CellRegion | null {
  if (!first) return second;
  if (!second) return first;
  const x = Math.min(first.x, second.x);
  const y = Math.min(first.y, second.y);
  const right = Math.max(first.x + first.width, second.x + second.width);
  const bottom = Math.max(first.y + first.height, second.y + second.height);
  return { x, y, width: right - x, height: bottom - y };
}
