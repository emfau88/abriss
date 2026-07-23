import Phaser from "phaser";

import {
  CREATURE_VISUALS,
  creatureAnimationKey,
  registerCreatureAnimations,
} from "../../content/characters/creatureKits";
import {
  MAP_DEFINITIONS,
  MAP_IDS,
  type MapDefinition,
  type MapId,
} from "../../content/maps/mapCatalog";
import {
  FIGHTER_ROSTER,
  type FighterId,
} from "../../manager/fighterRoster";
import {
  loadManagerState,
  saveManagerState,
  withSelectedMap,
  type ManagerState,
} from "../../manager/managerState";
import { RENDER_HEIGHT, RENDER_WIDTH } from "../config";
import {
  createCharacterAssetTestConfig,
  type ControlMode,
} from "../session/matchSession";
import { FIGHTER_QUIPS, randomTagline } from "../ui/menuFlavor";
import { createMenuButton, drawMenuBackdrop } from "../ui/menuUi";

const MAP_CARD_CENTERS = [465, 1135] as const;
/** Bühne der anwesenden Crew im toten Raum zwischen Karten und Buttons. */
const CREW_STAGE_Y = 556;
const CREW_SPRITE_SIZE = 100;

export class MainMenuScene extends Phaser.Scene {
  private managerState!: ManagerState;
  private controlMode: ControlMode = "auto";
  private quipText!: Phaser.GameObjects.Text;
  private crewLabel!: Phaser.GameObjects.Text;
  private quipTimer?: Phaser.Time.TimerEvent;

  public constructor() {
    super("MainMenuScene");
  }

  public create(): void {
    this.managerState = loadManagerState();
    registerCreatureAnimations(this);
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
      .text(RENDER_WIDTH / 2, 121, randomTagline(), {
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

    this.createCrewStage();

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
      label: "ASSET-TEST · POP-DIVA + CHICKEN",
      accent: 0x55d7c2,
      onClick: () =>
        this.scene.start("MatchScene", {
          launchConfig: createCharacterAssetTestConfig(
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

  private createCrewStage(): void {
    const crew = this.managerState.selectedFighterIds;
    const spacing = 250;
    const startX = RENDER_WIDTH / 2 - ((crew.length - 1) * spacing) / 2;

    this.crewLabel = this.add
      .text(RENDER_WIDTH / 2, CREW_STAGE_Y - 62, "DEINE CREW WARTET", {
        fontFamily: "Consolas, ui-monospace, monospace",
        fontSize: "13px",
        fontStyle: "bold",
        color: "#55d7c2",
        letterSpacing: 2,
      })
      .setOrigin(0.5);

    // Sprechblase über der Crew-Reihe, mit eigenem dunklen Hintergrund, damit
    // sie über Wolken und Kartenkante immer lesbar bleibt. Sie verdeckt beim
    // Sprechen das statische Label.
    this.quipText = this.add
      .text(RENDER_WIDTH / 2, CREW_STAGE_Y - 62, "…", {
        fontFamily: "Segoe UI, Arial, sans-serif",
        fontSize: "17px",
        fontStyle: "italic",
        color: "#fff5d6",
        align: "center",
        backgroundColor: "#102a36",
        padding: { x: 14, y: 6 },
      })
      .setOrigin(0.5)
      .setAlpha(0)
      .setDepth(5);

    crew.forEach((fighterId, index) => {
      this.createCrewMember(fighterId, startX + index * spacing, index);
    });

    // Ein erster Spruch nach kurzer Verzögerung, dann rotierend – die Crew
    // meldet sich unaufgefordert zu Wort, ganz ohne Klick.
    this.quipTimer = this.time.addEvent({
      delay: 4200,
      startAt: 3200,
      loop: true,
      callback: () => {
        const speaker = crew[Math.floor(Math.random() * crew.length)];
        if (speaker) this.speakQuip(speaker);
      },
    });
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.quipTimer?.remove());
  }

  private createCrewMember(
    fighterId: FighterId,
    x: number,
    index: number,
  ): void {
    const fighter = FIGHTER_ROSTER[fighterId];
    const visual = CREATURE_VISUALS[fighter.visualId];

    const sprite = this.add
      .sprite(x, CREW_STAGE_Y, visual.textureKey, visual.poseFrames.ready)
      .setDisplaySize(CREW_SPRITE_SIZE, CREW_SPRITE_SIZE)
      .setInteractive({ useHandCursor: true });
    if ((visual.motionFrames.idle?.length ?? 0) > 1) {
      sprite.play(creatureAnimationKey(fighter.visualId, "idle"), true);
    }

    // Leichtes, versetztes Wippen, damit die Reihe atmet statt zu stehen.
    this.tweens.add({
      targets: sprite,
      y: CREW_STAGE_Y - 7,
      duration: 1500 + index * 130,
      delay: index * 220,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });

    this.add
      .text(x, CREW_STAGE_Y + 60, fighter.displayName, {
        fontFamily: "Segoe UI, Arial, sans-serif",
        fontSize: "15px",
        fontStyle: "bold",
        color: "#fff5d6",
      })
      .setOrigin(0.5)
      .setAlpha(0.85);

    sprite.on("pointerover", () =>
      sprite.setDisplaySize(CREW_SPRITE_SIZE * 1.1, CREW_SPRITE_SIZE * 1.1),
    );
    sprite.on("pointerout", () =>
      sprite.setDisplaySize(CREW_SPRITE_SIZE, CREW_SPRITE_SIZE),
    );
    sprite.on("pointerdown", () => {
      this.speakQuip(fighterId);
      // Kurzer Gruß aus einer vorhandenen Pose, wenn die Figur eine hat.
      const victoryKey = creatureAnimationKey(fighter.visualId, "victory");
      if (this.anims.exists(victoryKey)) {
        sprite.play(victoryKey, true);
        sprite.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
          if ((visual.motionFrames.idle?.length ?? 0) > 1) {
            sprite.play(creatureAnimationKey(fighter.visualId, "idle"), true);
          }
        });
      }
    });
  }

  private speakQuip(fighterId: FighterId): void {
    const fighter = FIGHTER_ROSTER[fighterId];
    this.quipText.setText(`${fighter.displayName}: ${FIGHTER_QUIPS[fighterId]}`);
    this.tweens.killTweensOf(this.quipText);
    this.quipText.setAlpha(0);
    this.crewLabel.setAlpha(0);
    this.tweens.add({
      targets: this.quipText,
      alpha: 1,
      duration: 220,
      yoyo: true,
      hold: 2600,
      ease: "Sine.easeInOut",
      onComplete: () => this.crewLabel.setAlpha(1),
    });
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
    const y = 300;
    const width = 590;
    const height = 320;
    const previewWidth = 558;
    const previewHeight = 250;

    this.add
      .rectangle(x, y, width, height, selected ? 0x163f45 : 0x102a36, 0.96)
      .setStrokeStyle(5, selected ? 0xffcd5d : 0xfff5d6, selected ? 1 : 0.48);
    this.add
      .image(x, y - 40, map.backgroundTextureKey)
      .setDisplaySize(previewWidth, previewHeight);
    this.add
      .image(x, y - 40, map.terrainTextureKey)
      .setDisplaySize(previewWidth, previewHeight);
    this.add.rectangle(x, y + 118, previewWidth, 66, 0x102a36, 0.93);
    this.add
      .text(x - 260, y + 100, map.displayName, {
        fontFamily: "Segoe UI, Arial, sans-serif",
        fontSize: "24px",
        fontStyle: "bold",
        color: selected ? "#ffcd5d" : "#fff5d6",
      })
      .setOrigin(0, 0.5);
    this.add
      .text(x - 260, y + 133, map.tagline, {
        fontFamily: "Segoe UI, Arial, sans-serif",
        fontSize: "14px",
        color: "#d9eee9",
      })
      .setOrigin(0, 0.5);
    this.add
      .text(x + 260, y + 101, selected ? "GEWÄHLT" : "WÄHLEN", {
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
