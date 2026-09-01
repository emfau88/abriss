import Phaser from "phaser";
import { BURROW_WORLD_HEIGHT, BURROW_WORLD_WIDTH, surfaceYAt } from "../content/arena";
import { OneShotInputBuffer } from "../input/OneShotInputBuffer";
import { creatureVisualForBiomass } from "../rendering/BurrowCreatureVisual";
import { BurrowHud } from "../rendering/BurrowHud";
import { BurrowTrailRenderer } from "../rendering/BurrowTrailRenderer";
import { TiledTerrainRenderer } from "../rendering/TiledTerrainRenderer";
import { BurrowFeedingSession } from "../simulation/BurrowFeedingSession";
import type { FoodKind, PreyKind } from "../simulation/BurrowFeeding";
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
  private jawPulse = 0;
  private quakePulse = 0;
  private quakeOrigin: Point = { x: 0, y: 0 };
  private quakeStrength = 0;
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
    this.jawPulse = 0;
    this.quakePulse = 0;
    this.quakeStrength = 0;
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
    this.effects = this.add.graphics().setDepth(14);
    this.segments = Array.from({ length: 28 }, (_, index) =>
      this.add.image(0, 0, "burrow-body-segment").setDepth(12 + (28 - index) * 0.01));
    this.head = this.add.image(0, 0, "burrow-head").setDepth(13);
    this.cart = this.add.image(0, 0, "burrow-cart").setDepth(8);
    this.cartLabel = this.worldText("", 14).setDepth(9);
    this.preyLabels = this.session.feeding.content.prey.map((prey) =>
      this.worldText(prey.kind === "armored" ? "PANZERWURM" : prey.kind === "runner" ? "RENNWURM" : "+8",
        prey.kind === "armored" ? 13 : 11).setDepth(7));
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
      if (result.mutation.thunderChain > 0) {
        this.jawPulse = 1;
        this.cameras.main.shake(90, 0.004 + result.mutation.thunderChain * 0.002);
        this.hud.showToast("DONNERRACHEN ×" + this.session.motion.state.burstChain + " · BURST VERLÄNGERT", time);
      }
      if (result.mutation.quakeReleased > 0) {
        this.quakePulse = 1;
        this.quakeOrigin = { ...this.session.motion.state.position };
        this.quakeStrength = result.mutation.quakeReleased;
        this.cameras.main.shake(130, 0.004 + result.mutation.quakeReleased * 0.002);
        this.hud.showToast("BEBENHERZ · " + result.mutation.quakeReleased + " PLATTEN ENTLADEN", time);
      }
      if (run.build.power > oldPower) {
        this.hud.showToast(run.build.power === 1 ? "JÄGER! Schneller. Panzerwürmer seitlich im Burst angreifen." :
          "GRÄBER! Noch schneller. Panzerwürmer jetzt frontal überwältigen.", time);
      } else if (result.meal.largePreyEaten > 0) {
        this.jawPulse = 1;
        this.cameras.main.shake(120, 0.008);
        this.hud.showToast("+22 PANZERWURM! Folge seiner Markspur.", time);
      } else if (result.meal.preyKinds.includes("runner")) this.hud.showToast("+14 · RENNWURM ABGEFANGEN", time);
      else if (result.meal.preyEaten > 0) this.hud.showToast("+8 · FADENWURM GEFRESSEN", time);
      else if (result.meal.foodOpened > 0) this.hud.showToast(
        result.mutation.quakeReleased > 0 ? "BODENWELLE BRICHT NAHRUNG AUF" :
          this.session.motion.state.burstRemaining > 0 ? "BRUTKAPSEL GEKNACKT" : "WURZELKNOLLE AUFGEBROCHEN", time);
      if (result.meal.blockedPrey && time - this.blockedToastAt > 3500) {
        this.blockedToastAt = time;
        this.hud.showToast(run.build.power === 0 ? "Panzer zu stark. Wachse auf 40 Biomasse." :
          "Stirnplatte! Im Burst von Seite oder hinten angreifen.", time);
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
      this.drawFood(food, item.kind, item.position, feeding.elapsedTicks);
    }
    const preyGraphics = this.preyGraphics;
    preyGraphics.clear();
    feeding.content.prey.forEach((prey, index) => {
      const p = feeding.positionOf(prey);
      const show = !feeding.isEaten(prey.id) && visible(p);
      const label = this.preyLabels[index]!;
      const labelRange = prey.kind === "armored" ? 380 : 250;
      label.setVisible(show && Math.hypot(p.x - motion.state.position.x, p.y - motion.state.position.y) <= labelRange);
      if (!show) return;
      const style = preyStyle(prey.kind);
      const { color, radius, segments, spacing } = style;
      const edible = feeding.canEat(prey, run.build.power, motion.state.burstRemaining > 0, motion.state.position);
      for (let segment = segments - 1; segment >= 0; segment -= 1) {
        const point = feeding.positionOf(prey, feeding.elapsedTicks - segment * spacing);
        const size = radius * (1 - segment * 0.055);
        preyGraphics.fillStyle(0x342730, 1).fillCircle(point.x, point.y, size + 2);
        preyGraphics.fillStyle(color, 1).fillCircle(point.x, point.y, size);
      }
      const previous = feeding.positionOf(prey, feeding.elapsedTicks - 1);
      const angle = Math.atan2(p.y - previous.y, p.x - previous.x);
      for (const side of [-1, 1]) {
        const eyeX = p.x + Math.cos(angle) * radius * 0.4 + Math.sin(angle) * side * radius * 0.45;
        const eyeY = p.y + Math.sin(angle) * radius * 0.4 - Math.cos(angle) * side * radius * 0.45;
        preyGraphics.fillStyle(0xfff8de).fillCircle(eyeX, eyeY, prey.kind === "armored" ? 5 : 4);
        preyGraphics.fillStyle(0x282032).fillCircle(eyeX + Math.cos(angle) * 1.5, eyeY + Math.sin(angle) * 1.5, 2);
      }
      if (prey.kind === "runner") {
        preyGraphics.lineStyle(3, 0x8deaff, 0.55);
        preyGraphics.lineBetween(p.x - Math.cos(angle) * 28, p.y - Math.sin(angle) * 28,
          p.x - Math.cos(angle) * 48, p.y - Math.sin(angle) * 48);
        label.setText("RENNWURM · +14");
      } else if (prey.kind === "armored") {
        const tip = { x: p.x + Math.cos(angle) * (radius + 11), y: p.y + Math.sin(angle) * (radius + 11) };
        const left = { x: p.x + Math.cos(angle + 2.2) * (radius + 5), y: p.y + Math.sin(angle + 2.2) * (radius + 5) };
        const right = { x: p.x + Math.cos(angle - 2.2) * (radius + 5), y: p.y + Math.sin(angle - 2.2) * (radius + 5) };
        preyGraphics.fillStyle(0x8e543d, 1).fillTriangle(tip.x, tip.y, left.x, left.y, right.x, right.y);
        preyGraphics.lineStyle(2, edible ? 0xe3ffbc : 0xf3ba71, 0.85).strokeCircle(p.x, p.y, radius + 7);
        label.setText(run.build.power === 0 ? "PANZER · ERST AB 40" : run.build.power === 1 ? "SEITE + BURST · +22" : "ÜBERMÄCHTIG · +22");
      } else label.setText("FADENWURM · +8");
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
    this.jawPulse = Math.max(0, this.jawPulse - delta / 340);
    this.quakePulse = Math.max(0, this.quakePulse - delta / 620);
    const lightWave = (1 - this.growthPulse) * Math.max(1, visual.sampleCount);
    for (let index = 0; index < this.segments.length; index += 1) {
      const sprite = this.segments[index]!;
      const p = samples[index + 1];
      if (!p || index >= visual.sampleCount) { sprite.setVisible(false); continue; }
      const next = samples[index]!;
      const ratio = 1 - (index + 1) / samples.length;
      const size = (46 + ratio * 15) * visual.bodyRadiusMultiplier;
      const lit = this.growthPulse > 0 && Math.abs(index - lightWave) < 2.5;
      sprite.setVisible(true).setPosition(p.x, p.y).setRotation(Math.atan2(next.y - p.y, next.x - p.x))
        .setDisplaySize(size, size * 0.88).setTint(lit ? 0xe1ffab : 0xffffff);
    }
    const head = motion.state;
    this.head.setPosition(head.position.x, head.position.y).setRotation(head.angle)
      .setDisplaySize(visual.headRadius * 3.25, visual.headRadius * 2.7);
    this.effects.clear();
    this.drawPowerSilhouette(head.position, head.angle, visual.headRadius, run.build.power);
    if (head.burstRemaining > 0) {
      const color = run.state.mutation === "thunderjaw" ? 0xffc45e :
        run.state.mutation === "quakeheart" ? 0xff7a5c : 0xd8a2ff;
      this.effects.lineStyle(3, color, 0.65).strokeCircle(head.position.x, head.position.y, visual.headRadius * 1.4);
      if (run.state.mutation === "vacuum") {
        this.drawVacuum(head.position, head.angle, feeding.elapsedTicks);
      }
    }
    if (run.state.mutation === "thunderjaw" && (head.burstRemaining > 0 || this.jawPulse > 0)) {
      this.drawThunderJaw(head.position, head.angle, visual.headRadius, Math.max(0.35, this.jawPulse));
    }
    if (run.state.mutation === "quakeheart") this.drawQuakePlates(samples, run.state.quakeCharge);
    if (this.quakePulse > 0) this.drawQuakeWave();
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
        for (const item of feeding.foods) if (item.active) consider(item.position, foodGuideLabel(item.kind));
      }
      for (const prey of feeding.content.prey) {
        if (feeding.isEaten(prey.id) || (seekLarge ? !prey.large : prey.large)) continue;
        consider(feeding.positionOf(prey), prey.kind === "armored" ?
          (run.build.power >= 2 ? "PANZERWURM" : "PANZERWURM · SEITE + BURST") :
          prey.kind === "runner" ? "RENNWURM" : "FADENWURM");
      }
      if (!target) for (const item of feeding.foods) if (item.active) consider(item.position, foodGuideLabel(item.kind));
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
  private drawFood(graphics: Phaser.GameObjects.Graphics, kind: FoodKind, position: Point, ticks: number): void {
    const { x, y } = position;
    if (kind === "spore") {
      graphics.fillStyle(0xc5fa8b, 0.12).fillCircle(x, y, 14);
      graphics.fillStyle(0x283121, 1).fillCircle(x, y, 7);
      graphics.fillStyle(0xd3f697, 1).fillCircle(x, y, 5);
      graphics.fillStyle(0xffffff, 0.9).fillCircle(x - 1.5, y - 1.5, 1.8);
    } else if (kind === "root") {
      graphics.lineStyle(3, 0x9e633e, 0.9).strokeCircle(x, y, 19);
      graphics.fillStyle(0x442c2b, 1).fillCircle(x, y, 15);
      graphics.fillStyle(0xf0a65f, 1).fillCircle(x, y, 10);
      for (let i = 0; i < 4; i += 1) graphics.lineBetween(x + Math.cos(i * 1.57) * 16, y + Math.sin(i * 1.57) * 16,
        x + Math.cos(i * 1.57) * 27, y + Math.sin(i * 1.57) * 27);
    } else if (kind === "brood") {
      const pulse = 1 + Math.sin(ticks * 0.08) * 0.08;
      graphics.fillStyle(0x3b2442, 1).fillEllipse(x, y, 30 * pulse, 42 * pulse);
      graphics.lineStyle(3, 0xff8ec8, 0.9).strokeEllipse(x, y, 30 * pulse, 42 * pulse);
      graphics.fillStyle(0xffd37d, 1).fillCircle(x - 5, y - 7, 3).fillCircle(x + 6, y + 4, 3).fillCircle(x - 3, y + 10, 2);
    } else if (kind === "rootBite") {
      graphics.fillStyle(0x4a2b25, 1).fillCircle(x, y, 9);
      graphics.fillStyle(0xffb663, 1).fillCircle(x, y, 6);
    } else if (kind === "larva") {
      graphics.fillStyle(0x2e2337, 1).fillEllipse(x, y, 15, 8);
      graphics.fillStyle(0xffd6ec, 1).fillEllipse(x, y, 11, 5);
    } else {
      graphics.fillStyle(0xff9f5a, 0.18).fillCircle(x, y, 15);
      graphics.fillStyle(0xffc46e, 1).fillCircle(x, y, 7);
      graphics.fillStyle(0xffffff, 0.75).fillCircle(x - 2, y - 2, 2);
    }
  }
  private drawVacuum(position: Point, angle: number, ticks: number): void {
    this.effects.lineStyle(2, 0xd7a1ff, 0.65);
    for (const offset of [-0.72, -0.36, 0, 0.36, 0.72]) {
      const outer = angle + offset;
      const wave = 92 + ((ticks * 5 + Math.round(offset * 50)) % 35);
      this.effects.beginPath().moveTo(position.x + Math.cos(outer) * 125, position.y + Math.sin(outer) * 125)
        .lineTo(position.x + Math.cos(angle + offset * 0.55) * 72, position.y + Math.sin(angle + offset * 0.55) * 72)
        .lineTo(position.x + Math.cos(angle) * 34, position.y + Math.sin(angle) * 34).strokePath();
      this.effects.fillStyle(0xf4dcff, 0.85).fillCircle(position.x + Math.cos(outer) * wave,
        position.y + Math.sin(outer) * wave, 3);
    }
  }
  private drawThunderJaw(position: Point, angle: number, radius: number, alpha: number): void {
    const front = { x: position.x + Math.cos(angle) * (radius + 26), y: position.y + Math.sin(angle) * (radius + 26) };
    this.effects.lineStyle(5, 0xffd16c, alpha);
    for (const side of [-1, 1]) {
      const jawAngle = angle + side * 0.72;
      this.effects.lineBetween(position.x + Math.cos(jawAngle) * radius, position.y + Math.sin(jawAngle) * radius,
        front.x, front.y);
      for (let tooth = 0; tooth < 3; tooth += 1) {
        const t = 0.25 + tooth * 0.23;
        const x = position.x + (front.x - position.x) * t + Math.sin(angle) * side * (19 - tooth * 4);
        const y = position.y + (front.y - position.y) * t - Math.cos(angle) * side * (19 - tooth * 4);
        this.effects.fillStyle(0xfff1b5, alpha).fillTriangle(x, y, x + Math.cos(angle + side * 1.8) * 11,
          y + Math.sin(angle + side * 1.8) * 11, x + Math.cos(angle) * 7, y + Math.sin(angle) * 7);
      }
    }
  }
  private drawQuakePlates(samples: readonly Point[], charge: number): void {
    for (let index = 0; index < 3; index += 1) {
      const point = samples[index + 2];
      const next = samples[index + 1];
      if (!point || !next) continue;
      const angle = Math.atan2(next.y - point.y, next.x - point.x);
      const lit = index < charge;
      const x = point.x + Math.sin(angle) * 20;
      const y = point.y - Math.cos(angle) * 20;
      this.effects.fillStyle(lit ? 0xff7a5c : 0x543842, lit ? 1 : 0.8)
        .fillTriangle(x + Math.cos(angle) * 10, y + Math.sin(angle) * 10,
          x + Math.cos(angle + 2.35) * 13, y + Math.sin(angle + 2.35) * 13,
          x + Math.cos(angle - 2.35) * 13, y + Math.sin(angle - 2.35) * 13);
    }
  }
  private drawQuakeWave(): void {
    const progress = 1 - this.quakePulse;
    const maximum = 70 + this.quakeStrength * 38;
    this.effects.lineStyle(7, 0xff7a5c, this.quakePulse * 0.8).strokeCircle(
      this.quakeOrigin.x, this.quakeOrigin.y, 18 + maximum * progress);
    this.effects.lineStyle(3, 0xffc078, this.quakePulse * 0.65).strokeCircle(
      this.quakeOrigin.x, this.quakeOrigin.y, 8 + maximum * progress * 0.72);
    for (let index = 0; index < 8; index += 1) {
      const angle = index / 8 * Math.PI * 2;
      const inner = 24 + progress * maximum * 0.35;
      const outer = inner + 18 + this.quakeStrength * 4;
      this.effects.lineBetween(this.quakeOrigin.x + Math.cos(angle) * inner, this.quakeOrigin.y + Math.sin(angle) * inner,
        this.quakeOrigin.x + Math.cos(angle + 0.12) * outer, this.quakeOrigin.y + Math.sin(angle + 0.12) * outer);
    }
  }
  private drawPowerSilhouette(position: Point, angle: number, radius: number, power: number): void {
    if (power === 0) return;
    for (const side of [-1, 1]) {
      const baseAngle = angle + side * 0.72;
      const x = position.x + Math.cos(baseAngle) * radius * 0.9;
      const y = position.y + Math.sin(baseAngle) * radius * 0.9;
      this.effects.fillStyle(power === 2 ? 0xffe2a3 : 0xe6f3b5, 0.92).fillTriangle(x, y,
        x + Math.cos(angle + side * 1.45) * (8 + power * 4), y + Math.sin(angle + side * 1.45) * (8 + power * 4),
        x + Math.cos(angle) * 10, y + Math.sin(angle) * 10);
    }
  }
}

function preyStyle(kind: PreyKind): { color: number; radius: number; segments: number; spacing: number } {
  return kind === "thread" ? { color: 0x93d6a2, radius: 10, segments: 4, spacing: 23 } :
    kind === "runner" ? { color: 0x6fd5e8, radius: 15, segments: 7, spacing: 20 } :
      { color: 0xf3a45f, radius: 23, segments: 10, spacing: 26 };
}

function foodGuideLabel(kind: FoodKind): string {
  return kind === "root" ? "WURZELKNOLLE · GRABEN" : kind === "brood" ? "BRUTKAPSEL · BURST" :
    kind === "larva" ? "FLIEHENDE LARVEN" : kind === "mark" ? "MARKSPUR" : "NAHRUNG";
}
