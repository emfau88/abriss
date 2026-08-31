import Phaser from "phaser";
import { BURROW_WORLD_HEIGHT, BURROW_WORLD_WIDTH, surfaceYAt } from "../content/arena";
import { OneShotInputBuffer } from "../input/OneShotInputBuffer";
import { creatureVisualForBiomass } from "../rendering/BurrowCreatureVisual";
import { BurrowHud } from "../rendering/BurrowHud";
import { BurrowTrailRenderer } from "../rendering/BurrowTrailRenderer";
import { TiledTerrainRenderer } from "../rendering/TiledTerrainRenderer";
import { BurrowFeedingSession } from "../simulation/BurrowFeedingSession";
import { BURROW_MUTATIONS, type BurrowMutation } from "../simulation/BurrowRun";
import type { Point } from "../simulation/BurrowTerrain";

export class BurrowGameScene extends Phaser.Scene {
  private session!: BurrowFeedingSession;
  private terrainRenderer!: TiledTerrainRenderer;
  private trailRenderer!: BurrowTrailRenderer;
  private hud!: BurrowHud;
  private foodGraphics!: Phaser.GameObjects.Graphics;
  private preyGraphics!: Phaser.GameObjects.Graphics;
  private effects!: Phaser.GameObjects.Graphics;
  private head!: Phaser.GameObjects.Image;
  private segments: Phaser.GameObjects.Image[] = [];
  private cart!: Phaser.GameObjects.Image;
  private cartLabel!: Phaser.GameObjects.Text;
  private preyLabels: Phaser.GameObjects.Text[] = [];
  private guide!: Phaser.GameObjects.Text;
  private joystick!: Phaser.GameObjects.Arc;
  private stick!: Phaser.GameObjects.Arc;
  private burstButton!: Phaser.GameObjects.Arc;
  private burstLabel!: Phaser.GameObjects.Text;
  private controlsHint!: Phaser.GameObjects.Text;
  private keys: Record<string, Phaser.Input.Keyboard.Key> = {};
  private steeringPointer: number | null = null;
  private touchDirection: Point | null = null;
  private readonly burst = new OneShotInputBuffer();
  private accumulator = 0;
  private growthPulse = 0;
  private blockedToastAt = -10000;
  private now = 0;

  public constructor() { super("BurrowGameScene"); }
  public preload(): void {
    this.load.image("burrow-head", "burrow/burrow-head-v1.png");
    this.load.image("burrow-body-segment", "burrow/burrow-body-segment-v1.png");
    this.load.image("burrow-earth", "burrow/burrow-earth-v1.png");
    this.load.image("burrow-cart", "burrow/burrow-cart-v1.png");
  }
  public create(): void {
    this.session = new BurrowFeedingSession();
    this.accumulator = 0;
    this.growthPulse = 0;
    this.blockedToastAt = -10000;
    this.now = 0;
    this.burst.clear();
    this.createBackdrop();
    this.terrainRenderer = new TiledTerrainRenderer(this, this.session.terrain, "burrow-terrain", "burrow-earth");
    this.trailRenderer = new BurrowTrailRenderer(this, this.session.terrain, this.session.motion.trailField);
    // Quiet earth behind bright edible objects; permanent holes and temporary trails remain distinct.
    this.add.rectangle(0, 360, BURROW_WORLD_WIDTH, BURROW_WORLD_HEIGHT - 360, 0x171420, 0.24)
      .setOrigin(0).setDepth(3.5);
    this.foodGraphics = this.add.graphics().setDepth(5);
    this.preyGraphics = this.add.graphics().setDepth(6);
    this.effects = this.add.graphics().setDepth(11);
    this.segments = Array.from({ length: 28 }, (_, index) =>
      this.add.image(0, 0, "burrow-body-segment").setDepth(12 + (28 - index) * 0.01));
    this.head = this.add.image(0, 0, "burrow-head").setDepth(13);
    this.cart = this.add.image(0, 0, "burrow-cart").setDepth(8);
    this.cartLabel = this.worldText("", 14).setDepth(9);
    this.preyLabels = this.session.feeding.content.prey.map((prey) =>
      this.worldText(prey.large ? "40 + BURST" : "+8", prey.large ? 13 : 11).setDepth(7));
    this.guide = this.worldText("", 14).setScrollFactor(0).setDepth(20);
    this.createControls();
    this.configureInput();
    this.cameras.main.setBounds(0, 0, BURROW_WORLD_WIDTH, BURROW_WORLD_HEIGHT);
    this.game.canvas.tabIndex = 0;
    this.hud = new BurrowHud(this.game.canvas, (mutation) => this.chooseMutation(mutation), () => this.scene.restart());
    this.layout();
    this.resetInput();
    this.game.canvas.focus();
    this.renderWorld(0);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.terrainRenderer.destroy();
      this.trailRenderer.destroy();
      this.hud.destroy();
      this.input.off("pointerdown", this.pointerDown, this);
      this.input.off("pointermove", this.pointerMove, this);
      this.input.off("pointerup", this.pointerUp, this);
      this.input.off("pointerupoutside", this.pointerUp, this);
      this.game.events.off(Phaser.Core.Events.BLUR, this.resetInput, this);
      this.scale.off(Phaser.Scale.Events.RESIZE, this.layout, this);
    });
  }
  public override update(time: number, delta: number): void {
    this.now = time;
    if (this.justDown("R")) { this.scene.restart(); return; }
    if (this.session.run.state.phase === "mutation") {
      for (let index = 0; index < 3; index += 1) {
        if (this.justDown(["ONE", "TWO", "THREE"][index]!)) this.chooseMutation(BURROW_MUTATIONS[index]!.id);
      }
    }
    const run = this.session.run;
    if (!run.active && run.state.phase !== "intro") {
      this.resetInput();
      this.renderWorld(delta);
      return;
    }
    if (this.justDown("SPACE") || this.justDown("SHIFT")) this.burst.queue();
    this.accumulator = Math.min(0.1, this.accumulator + delta / 1000);
    while (this.accumulator >= 1 / 60) {
      this.accumulator -= 1 / 60;
      const oldPower = run.build.power;
      const result = this.session.step({ direction: this.readDirection(), burstPressed: this.burst.consume() });
      if (!result) break;
      this.terrainRenderer.applyMutation(result.movement.terrainMutation);
      this.trailRenderer.apply(new Set(result.movement.trailDirtyTiles), result.movement.terrainMutation);
      if (result.meal.biomass > 0 || result.bite?.devoured) this.growthPulse = 1;
      if (run.build.power > oldPower) {
        this.hud.showToast(run.build.power === 1 ? "JÄGER! Schneller. Große Würmer mit Burst fressbar." :
          "GRÄBER! Noch schneller. Große Würmer jetzt auch ohne Burst.", time);
      } else if (result.meal.largePreyEaten > 0) this.hud.showToast("+20! Folge seiner Nahrungsspur.", time);
      else if (result.meal.preyEaten > 0) this.hud.showToast("+8 · WURM GEFRESSEN", time);
      if (result.meal.blockedPrey && time - this.blockedToastAt > 3500) {
        this.blockedToastAt = time;
        this.hud.showToast(run.build.power === 0 ? "Noch zu groß. Wachse auf 40 Biomasse." : "Den großen Wurm im Burst treffen!", time);
      }
      if (!run.active) { this.resetInput(); break; }
    }
    this.renderWorld(delta);
  }
  private createBackdrop(): void {
    const g = this.add.graphics().setDepth(0);
    g.fillStyle(0x80bac4).fillRect(0, 0, BURROW_WORLD_WIDTH, BURROW_WORLD_HEIGHT);
    g.fillStyle(0xc4ddd1).fillCircle(200, 105, 70).fillCircle(280, 95, 54).fillCircle(1670, 105, 65);
    g.fillStyle(0x211b2d).fillRect(0, 350, BURROW_WORLD_WIDTH, BURROW_WORLD_HEIGHT);
    const grass = this.add.graphics().setDepth(4);
    for (let x = 0; x < BURROW_WORLD_WIDTH; x += 28) {
      const y = surfaceYAt(x);
      grass.lineStyle(3, 0x9db65a, 0.9).lineBetween(x, y + 2, x + 4, y - 9);
    }
  }
  private worldText(text: string, size: number): Phaser.GameObjects.Text {
    return this.add.text(0, 0, text, { fontFamily: "Arial, sans-serif", fontSize: size + "px",
      fontStyle: "bold", color: "#fff4da", stroke: "#211a25", strokeThickness: 4, align: "center" }).setOrigin(0.5);
  }
  private createControls(): void {
    this.joystick = this.add.circle(0, 0, 48, 0x241c2c, 0.58).setStrokeStyle(2, 0xf2dab1, 0.45).setScrollFactor(0).setDepth(20);
    this.stick = this.add.circle(0, 0, 19, 0xf5d991, 0.72).setScrollFactor(0).setDepth(21);
    this.burstButton = this.add.circle(0, 0, 44, 0x76519e, 0.9)
      .setStrokeStyle(3, 0xe7c9ff, 0.9).setScrollFactor(0).setDepth(20).setInteractive();
    this.burstLabel = this.worldText("BURST", 14).setScrollFactor(0).setDepth(21);
    this.controlsHint = this.worldText("WASD / Pfeile · Leertaste: Burst", 12).setScrollFactor(0).setDepth(20);
    this.burstButton.on("pointerdown", () => {
      if (this.session.run.active || this.session.run.state.phase === "intro") this.burst.queue();
    });
    this.scale.on(Phaser.Scale.Events.RESIZE, this.layout, this);
  }
  private configureInput(): void {
    const keyboard = this.input.keyboard;
    this.keys = {};
    for (const name of ["W", "A", "S", "D", "UP", "DOWN", "LEFT", "RIGHT", "SHIFT", "SPACE", "R", "ONE", "TWO", "THREE"]) {
      if (keyboard) this.keys[name] = keyboard.addKey(name);
    }
    this.input.on("pointerdown", this.pointerDown, this);
    this.input.on("pointermove", this.pointerMove, this);
    this.input.on("pointerup", this.pointerUp, this);
    this.input.on("pointerupoutside", this.pointerUp, this);
    this.game.events.on(Phaser.Core.Events.BLUR, this.resetInput, this);
  }
  private layout(): void {
    const { width, height } = this.scale;
    const compact = height < 500 || width < 700;
    const radius = compact ? 40 : 48;
    this.joystick.setRadius(radius).setPosition(compact ? 68 : 92, height - (compact ? 67 : 90));
    this.stick.setPosition(this.joystick.x, this.joystick.y);
    this.burstButton.setRadius(compact ? 36 : 44).setPosition(width - (compact ? 65 : 88), this.joystick.y);
    this.burstLabel.setPosition(this.burstButton.x, this.burstButton.y);
    this.controlsHint.setPosition(width / 2, height - 20).setVisible(width >= 700 && height >= 500);
    this.resetInput();
    this.updateCamera();
  }
  private justDown(name: string): boolean {
    const key = this.keys[name];
    return key ? Phaser.Input.Keyboard.JustDown(key) : false;
  }
  private pointerDown(pointer: Phaser.Input.Pointer): void {
    if ((!this.session.run.active && this.session.run.state.phase !== "intro") || this.steeringPointer !== null) return;
    if (pointer.x > this.joystick.x + 110 || pointer.y < this.joystick.y - 110) return;
    this.steeringPointer = pointer.id;
    this.pointerMove(pointer);
  }
  private pointerMove(pointer: Phaser.Input.Pointer): void {
    if (pointer.id !== this.steeringPointer || !pointer.isDown) return;
    const x = pointer.x - this.joystick.x;
    const y = pointer.y - this.joystick.y;
    const length = Math.hypot(x, y);
    this.touchDirection = length > 5 ? { x: x / length, y: y / length } : null;
    const distance = Math.min(34, length);
    this.stick.setPosition(this.joystick.x + (this.touchDirection?.x ?? 0) * distance,
      this.joystick.y + (this.touchDirection?.y ?? 0) * distance);
  }
  private pointerUp(pointer: Phaser.Input.Pointer): void {
    if (pointer.id !== this.steeringPointer) return;
    this.steeringPointer = null;
    this.touchDirection = null;
    this.stick.setPosition(this.joystick.x, this.joystick.y);
  }
  private resetInput(): void {
    this.steeringPointer = null;
    this.touchDirection = null;
    this.burst.clear();
    this.accumulator = 0;
    this.input.keyboard?.resetKeys();
    if (this.stick) this.stick.setPosition(this.joystick.x, this.joystick.y);
  }
  private readDirection(): Point | null {
    const down = (a: string, b: string): number => this.keys[a]?.isDown || this.keys[b]?.isDown ? 1 : 0;
    const x = down("D", "RIGHT") - down("A", "LEFT");
    const y = down("S", "DOWN") - down("W", "UP");
    return x || y ? { x, y } : this.touchDirection;
  }
  private chooseMutation(mutation: BurrowMutation): void {
    if (!this.session.chooseMutation(mutation)) return;
    this.resetInput();
    this.game.canvas.focus();
    const name = BURROW_MUTATIONS.find((entry) => entry.id === mutation)!.name;
    this.hud.showToast(name + " · Jage weiter!", this.now);
  }
  private renderWorld(delta: number): void {
    const { run, motion, feeding, hunt } = this.session;
    this.updateCamera();
    const view = this.cameras.main.worldView;
    const visible = (p: Point): boolean => p.x >= view.x - 140 && p.x <= view.right + 140 &&
      p.y >= view.y - 140 && p.y <= view.bottom + 140;
    const food = this.foodGraphics;
    food.clear();
    for (const item of feeding.foods) {
      if (!item.active || !visible(item.position)) continue;
      const { x, y } = item.position;
      food.fillStyle(0xc5fa8b, 0.11).fillCircle(x, y, 14);
      food.fillStyle(0x283121, 1).fillCircle(x, y, 7);
      food.fillStyle(0xd3f697, 1).fillCircle(x, y, 5);
      food.fillStyle(0xffffff, 0.9).fillCircle(x - 1.5, y - 1.5, 1.8);
    }
    const preyGraphics = this.preyGraphics;
    preyGraphics.clear();
    feeding.content.prey.forEach((prey, index) => {
      const p = feeding.positionOf(prey);
      const show = !feeding.isEaten(prey.id) && visible(p);
      const label = this.preyLabels[index]!;
      label.setVisible(show);
      if (!show) return;
      const large = prey.large;
      const color = large ? 0xf3ba71 : 0x93d6ba;
      const radius = large ? 22 : 11;
      const edible = feeding.canEat(prey, run.build.power, motion.state.burstRemaining > 0);
      for (let segment = large ? 9 : 4; segment >= 0; segment -= 1) {
        const point = feeding.positionOf(prey, feeding.elapsedTicks - segment * (large ? 26 : 23));
        const size = radius * (1 - segment * 0.055);
        preyGraphics.fillStyle(0x342730, 1).fillCircle(point.x, point.y, size + 2);
        preyGraphics.fillStyle(color, 1).fillCircle(point.x, point.y, size);
      }
      const previous = feeding.positionOf(prey, feeding.elapsedTicks - 1);
      const angle = Math.atan2(p.y - previous.y, p.x - previous.x);
      for (const side of [-1, 1]) {
        const eyeX = p.x + Math.cos(angle) * radius * 0.4 + Math.sin(angle) * side * radius * 0.45;
        const eyeY = p.y + Math.sin(angle) * radius * 0.4 - Math.cos(angle) * side * radius * 0.45;
        preyGraphics.fillStyle(0xfff8de).fillCircle(eyeX, eyeY, large ? 5 : 4);
        preyGraphics.fillStyle(0x282032).fillCircle(eyeX + Math.cos(angle) * 1.5, eyeY + Math.sin(angle) * 1.5, 2);
      }
      if (large) {
        preyGraphics.lineStyle(2, edible ? 0xe3ffbc : 0xf3ba71, 0.85).strokeCircle(p.x, p.y, radius + 7);
        label.setText(run.build.power === 0 ? "40 + BURST" : run.build.power === 1 ? "BURST → +20" : "FRESSBAR · +20");
      }
      label.setPosition(p.x, p.y - radius - 17);
    });
    const vehicle = hunt.state.vehicle;
    this.cart.setVisible(vehicle.active).setPosition(vehicle.position.x, vehicle.position.y + 3)
      .setDisplaySize(100, 74).setFlipX(vehicle.direction < 0);
    this.cartLabel.setVisible(vehicle.active).setPosition(vehicle.position.x, vehicle.position.y - 57)
      .setText(vehicle.kind === "finale" ? "★ SCHLUSSKUTSCHE" : "OBERFLÄCHENBEUTE · +12");
    this.cart.setTint(vehicle.kind === "finale" ? 0xffe3a0 : 0xffffff);
    const visual = creatureVisualForBiomass(run.state.biomass);
    const samples = motion.trail.sample(visual.sampleCount + 1, visual.segmentSpacing);
    this.growthPulse = Math.max(0, this.growthPulse - delta / 650);
    for (let index = 0; index < this.segments.length; index += 1) {
      const sprite = this.segments[index]!;
      const p = samples[index + 1];
      if (!p || index >= visual.sampleCount) { sprite.setVisible(false); continue; }
      const next = samples[index]!;
      const ratio = 1 - (index + 1) / samples.length;
      const size = (46 + ratio * 15) * visual.bodyRadiusMultiplier;
      sprite.setVisible(true).setPosition(p.x, p.y).setRotation(Math.atan2(next.y - p.y, next.x - p.x))
        .setDisplaySize(size, size * 0.88).setTint(this.growthPulse > 0.2 ? 0xe1ffab : 0xffffff);
    }
    const head = motion.state;
    this.head.setPosition(head.position.x, head.position.y).setRotation(head.angle)
      .setDisplaySize(visual.headRadius * 3.25, visual.headRadius * 2.7);
    this.effects.clear();
    if (head.burstRemaining > 0) {
      const color = run.state.mutation === "trailrunner" && motion.onFastTrail ? 0x7fdbff : 0xd8a2ff;
      this.effects.lineStyle(3, color, 0.65).strokeCircle(head.position.x, head.position.y, visual.headRadius * 1.4);
      if (run.state.mutation === "vacuum") {
        this.effects.lineStyle(2, 0xd7a1ff, 0.6);
        this.effects.beginPath().arc(head.position.x, head.position.y, 100, head.angle - Math.PI / 3, head.angle + Math.PI / 3).strokePath();
      }
    }
    const cooldown = head.burstCooldown;
    this.burstLabel.setText(cooldown > 0 ? cooldown.toFixed(1) : "BURST");
    this.burstButton.setFillStyle(cooldown > 0 ? 0x3e304f : 0x76519e, 0.9);
    this.renderGuide();
    this.hud.update(run, motion, this.now);
  }
  private updateCamera(): void {
    const camera = this.cameras.main;
    // Fixed zoom preserves perceptible growth; framing depends on viewport, not biomass.
    camera.setZoom(1);
    camera.centerOn(this.session.motion.state.position.x, this.session.motion.state.position.y);
  }
  private renderGuide(): void {
    const { run, motion, feeding, hunt } = this.session;
    if (!run.active && run.state.phase !== "intro") { this.guide.setVisible(false); return; }
    let target: Point | null = null;
    let label = "NAHRUNG";
    const origin = motion.state.position;
    if (run.state.phase === "surface") {
      target = hunt.state.vehicle.position;
      label = "SCHLUSSKUTSCHE";
    } else {
      let distance = Number.POSITIVE_INFINITY;
      const consider = (p: Point, text: string): void => {
        const d = Math.hypot(p.x - origin.x, p.y - origin.y);
        if (d < distance) { target = p; distance = d; label = text; }
      };
      const seekLarge = run.build.power >= 1 && (run.state.largePreyEaten === 0 || run.state.biomass >= 180);
      if (run.build.power === 0) {
        for (const item of feeding.foods) if (item.active) consider(item.position, "NAHRUNG");
      }
      for (const prey of feeding.content.prey) {
        if (feeding.isEaten(prey.id) || (seekLarge ? !prey.large : prey.large)) continue;
        consider(feeding.positionOf(prey), prey.large ? (run.build.power >= 2 ? "GROSSER WURM" : "GROSSER WURM · BURST") : "KLEINER WURM");
      }
      if (!target) for (const item of feeding.foods) if (item.active) consider(item.position, "NAHRUNG");
    }
    const camera = this.cameras.main;
    const selected = target as Point | null;
    if (!selected) { this.guide.setVisible(false); return; }
    const sx = (selected.x - camera.scrollX - camera.width / 2) * camera.zoom + camera.width / 2;
    const sy = (selected.y - camera.scrollY - camera.height / 2) * camera.zoom + camera.height / 2;
    if (sx > 30 && sx < camera.width - 30 && sy > 110 && sy < camera.height - 20) {
      this.guide.setVisible(false); return;
    }
    const dx = selected.x - origin.x;
    const dy = selected.y - origin.y;
    const angle = Math.atan2(dy, dx);
    const arrow = ["→", "↘", "↓", "↙", "←", "↖", "↑", "↗"][(Math.round(angle / (Math.PI / 4)) + 8) % 8];
    this.guide.setVisible(true).setText(arrow + " " + label)
      .setPosition(Phaser.Math.Clamp(sx, 135, Math.max(135, camera.width - 135)),
        Phaser.Math.Clamp(sy, 132, Math.max(132, camera.height - 135)));
  }
}
