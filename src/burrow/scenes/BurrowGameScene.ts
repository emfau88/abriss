import Phaser from "phaser";

import {
  BURROW_START,
  BURROW_TARGET_X,
  BURROW_WORLD_HEIGHT,
  BURROW_WORLD_WIDTH,
  createBurrowArena,
  surfaceYAt,
} from "../content/arena";
import { TiledTerrainRenderer } from "../rendering/TiledTerrainRenderer";
import {
  BURROW_MOTION_CONSTANTS,
  BurrowMotion,
  type BurrowMovementMode,
} from "../simulation/BurrowMotion";
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
  private wormGraphics!: Phaser.GameObjects.Graphics;
  private dustGraphics!: Phaser.GameObjects.Graphics;
  private hudText!: Phaser.GameObjects.Text;
  private goalText!: Phaser.GameObjects.Text;
  private eventText!: Phaser.GameObjects.Text;
  private joystickBase!: Phaser.GameObjects.Arc;
  private joystickNub!: Phaser.GameObjects.Arc;
  private burstButton!: Phaser.GameObjects.Arc;
  private burstLabel!: Phaser.GameObjects.Text;
  private targetContainer!: Phaser.GameObjects.Container;
  private targetBroken = false;
  private started = false;
  private steeringPointerId: number | null = null;
  private touchDirection: Point | null = null;
  private burstQueued = false;
  private accumulator = 0;
  private dustParticles: DustParticle[] = [];
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
    this.wormGraphics = this.add.graphics().setDepth(12);
    this.dustGraphics = this.add.graphics().setDepth(11);
    this.createTarget();
    this.createHud();
    this.configureInput();
    this.configureCamera();
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
    });
  }

  public override update(_time: number, deltaMilliseconds: number): void {
    const direction = this.readDirection();
    let burstPressed = this.consumeBurstInput();
    if (!this.started) {
      if (!direction && !burstPressed) {
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
      const result = this.motion.step(
        { direction, burstPressed },
        FIXED_STEP,
      );
      burstPressed = false;
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
      this.accumulator -= FIXED_STEP;
    }

    this.terrainRenderer.applyMutation(combinedMutation);
    this.updateTarget();
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

    const beacon = this.add.graphics().setDepth(1);
    beacon.lineStyle(5, 0xffd15a, 0.2);
    beacon.lineBetween(
      BURROW_TARGET_X,
      surfaceYAt(BURROW_TARGET_X),
      BURROW_TARGET_X,
      1120,
    );
    beacon.fillStyle(0xffd15a, 0.14).fillCircle(BURROW_TARGET_X, 800, 70);
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

  private createTarget(): void {
    const targetY = surfaceYAt(BURROW_TARGET_X) - 45;
    const targetGraphics = this.add.graphics();
    targetGraphics.lineStyle(8, 0x3b2a25).lineBetween(0, 10, 0, 65);
    targetGraphics.lineStyle(6, 0x3b2a25).lineBetween(-24, 30, 24, 30);
    targetGraphics.fillStyle(0xffcf58).fillCircle(0, 0, 24);
    targetGraphics.lineStyle(5, 0x5b3827).strokeCircle(0, 0, 24);
    targetGraphics.lineStyle(4, 0xd85438).lineBetween(-11, -7, 11, 7);
    targetGraphics.lineBetween(-11, 7, 11, -7);
    const label = this.add
      .text(0, -50, "BREACH-ZIEL", {
        fontFamily: "Arial Black, sans-serif",
        fontSize: "17px",
        color: "#fff1b8",
        stroke: "#3b2a25",
        strokeThickness: 5,
      })
      .setOrigin(0.5);
    this.targetContainer = this.add
      .container(BURROW_TARGET_X, targetY, [targetGraphics, label])
      .setDepth(8);
  }

  private createHud(): void {
    const panel = this.add
      .rectangle(18, 18, 570, 126, 0x10151c, 0.88)
      .setOrigin(0)
      .setScrollFactor(0)
      .setDepth(100)
      .setStrokeStyle(2, 0xffbd50, 0.75);
    this.add
      .text(panel.x + 20, panel.y + 14, "BURROW LAB · GATE 1", {
        fontFamily: "Arial Black, sans-serif",
        fontSize: "25px",
        color: "#ffd66d",
      })
      .setScrollFactor(0)
      .setDepth(101);
    this.hudText = this.add
      .text(panel.x + 20, panel.y + 51, "", {
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
    this.add
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
    this.add
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
      this.burstQueued = true;
    });
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
    if (pointer.x > 250 || pointer.y < VIEW_HEIGHT - 230) {
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
  }

  private updateTouchDirection(pointer: Phaser.Input.Pointer): void {
    const deltaX = pointer.x - this.joystickBase.x;
    const deltaY = pointer.y - this.joystickBase.y;
    const distance = Math.hypot(deltaX, deltaY);
    if (distance < 5) {
      this.touchDirection = null;
      return;
    }
    this.touchDirection = { x: deltaX / distance, y: deltaY / distance };
    const visualDistance = Math.min(37, distance);
    this.joystickNub.setPosition(
      this.joystickBase.x + (deltaX / distance) * visualDistance,
      this.joystickBase.y + (deltaY / distance) * visualDistance,
    );
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

  private consumeBurstInput(): boolean {
    const keyboardBurst =
      (this.keyBurst ? Phaser.Input.Keyboard.JustDown(this.keyBurst) : false) ||
      (this.keyBurstAlternative
        ? Phaser.Input.Keyboard.JustDown(this.keyBurstAlternative)
        : false);
    const pressed = this.burstQueued || keyboardBurst;
    this.burstQueued = false;
    return pressed;
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

  private updateTarget(): void {
    if (this.targetBroken) {
      return;
    }
    const distance = Phaser.Math.Distance.Between(
      this.motion.state.position.x,
      this.motion.state.position.y,
      this.targetContainer.x,
      this.targetContainer.y,
    );
    if (distance > 62) {
      return;
    }
    this.targetBroken = true;
    this.showEvent("VOLLTREFFER!", "#fff0a1");
    this.spawnDigDust(this.motion.state.position, this.motion.state.angle, 28);
    this.cameras.main.shake(260, 0.009);
    this.tweens.add({
      targets: this.targetContainer,
      y: this.targetContainer.y - 90,
      angle: 95,
      alpha: 0,
      duration: 650,
      ease: "Quad.easeOut",
    });
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
    this.eventText.setText(message).setColor(color).setAlpha(1).setScale(0.82);
    this.tweens.killTweensOf(this.eventText);
    this.tweens.add({
      targets: this.eventText,
      alpha: 0,
      scale: 1.08,
      y: 105,
      duration: 950,
      ease: "Quad.easeOut",
      onComplete: () => this.eventText.setY(125),
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
    ]);
    const targetDistance = Math.round(
      Phaser.Math.Distance.Between(
        state.position.x,
        state.position.y,
        BURROW_TARGET_X,
        surfaceYAt(BURROW_TARGET_X),
      ) / 10,
    );
    this.goalText.setText(
      !this.started
        ? "RICHTUNG HALTEN\nZUM STARTEN"
        : this.targetBroken
        ? "BREACH-ZIEL GETROFFEN\nR: NOCHMAL"
        : `GELBER PEILSTRAHL\nBREACH-ZIEL ${targetDistance} m`,
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
        ? `Modus ${modeLabel[state.mode]}, Tempo ${Math.round(state.speed)}, Position ${Math.round(state.position.x)} zu ${Math.round(state.position.y)}, ${this.targetBroken ? "Breach-Ziel getroffen" : "Breach-Ziel offen"}.`
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
