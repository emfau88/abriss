import Phaser from "phaser";

import {
  CREATURE_VISUALS,
  creatureAnimationKey,
  registerCreatureAnimations,
} from "../../content/characters/creatureKits";
import { MAP_DEFINITIONS } from "../../content/maps/mapCatalog";
import {
  FEEDBACK_ICON_TEXTURE_KEY,
  feedbackIconFrame,
} from "../../content/ui/feedbackIconKit";
import {
  FIGHTER_IDS,
  FIGHTER_ROSTER,
  type FighterId,
} from "../../manager/fighterRoster";
import {
  loadManagerState,
  saveManagerState,
  WEAPON_IDS,
  withSelectedFighters,
  withWeaponPreference,
  type ManagerState,
} from "../../manager/managerState";
import {
  WEAPON_PROFILES,
  type WeaponId,
} from "../../simulation/ai/RocketActionPlanner";
import { RENDER_HEIGHT, RENDER_WIDTH } from "../config";
import { createManagerMatchConfig } from "../session/matchSession";
import { createMenuButton, drawMenuBackdrop, type MenuButton } from "../ui/menuUi";

interface FighterCard {
  readonly fighterId: FighterId;
  readonly background: Phaser.GameObjects.Rectangle;
  readonly selectionText: Phaser.GameObjects.Text;
  readonly weaponButtons: ReadonlyMap<
    WeaponId,
    {
      readonly background: Phaser.GameObjects.Rectangle;
      readonly label: Phaser.GameObjects.Text;
      readonly icon: Phaser.GameObjects.Sprite;
    }
  >;
}
const CARD_X = [220, 607, 993, 1380] as const;

export class ManagerScene extends Phaser.Scene {
  private managerState!: ManagerState;
  private cards: FighterCard[] = [];
  private statusText!: Phaser.GameObjects.Text;
  private selectionCountText!: Phaser.GameObjects.Text;
  private deployButton!: MenuButton;

  public constructor() {
    super("ManagerScene");
  }

  public create(): void {
    this.managerState = loadManagerState();
    drawMenuBackdrop(
      this,
      RENDER_WIDTH,
      RENDER_HEIGHT,
      MAP_DEFINITIONS[this.managerState.selectedMapId].backgroundTextureKey,
    );
    registerCreatureAnimations(this);
    this.cards = [];

    this.add
      .text(62, 42, "EINSATZPLANUNG", {
        fontFamily: "Segoe UI, Arial, sans-serif",
        fontSize: "42px",
        fontStyle: "bold",
        color: "#fff5d6",
        stroke: "#142c33",
        strokeThickness: 7,
      })
      .setOrigin(0, 0.5);
    this.add
      .text(62, 91, "WÄHLE 3 WESEN UND IHRE WAFFENPRÄFERENZ", {
        fontFamily: "Consolas, ui-monospace, monospace",
        fontSize: "16px",
        fontStyle: "bold",
        color: "#ffcd5d",
      })
      .setOrigin(0, 0.5);

    this.selectionCountText = this.add
      .text(1530, 60, "", {
        fontFamily: "Segoe UI, Arial, sans-serif",
        fontSize: "28px",
        fontStyle: "bold",
        color: "#fff5d6",
      })
      .setOrigin(1, 0.5);

    FIGHTER_IDS.forEach((fighterId, index) => {
      const x = CARD_X[index] ?? CARD_X[0];
      this.cards.push(this.createFighterCard(fighterId, x));
    });

    this.statusText = this.add
      .text(RENDER_WIDTH / 2, 734, "", {
        fontFamily: "Segoe UI, Arial, sans-serif",
        fontSize: "17px",
        fontStyle: "bold",
        color: "#fff5d6",
        align: "center",
      })
      .setOrigin(0.5);

    createMenuButton(this, {
      x: 165,
      y: 832,
      width: 220,
      height: 58,
      label: "HAUPTMENÜ",
      accent: 0xfff5d6,
      onClick: () => this.scene.start("MainMenuScene"),
    });
    this.deployButton = createMenuButton(this, {
      x: 1260,
      y: 832,
      width: 520,
      height: 66,
      label: "CREW IN DEN EINSATZ SCHICKEN",
      onClick: () => this.launchMatch(),
    });

    this.renderState("Klicke eine Karte zum Ein- oder Auswechseln.");
  }

  private createFighterCard(fighterId: FighterId, x: number): FighterCard {
    const fighter = FIGHTER_ROSTER[fighterId];
    const visual = CREATURE_VISUALS[fighter.visualId];
    const background = this.add
      .rectangle(x, 400, 344, 548, 0x102a36, 0.94)
      .setStrokeStyle(4, 0xfff5d6, 0.52)
      .setInteractive({ useHandCursor: true });
    background.on("pointerdown", () => this.toggleFighter(fighterId));

    const sprite = this.add
      .sprite(x, 285, visual.textureKey, visual.poseFrames.ready)
      .setDisplaySize(192, 192);
    if ((visual.motionFrames.idle?.length ?? 0) > 1) {
      sprite.play(creatureAnimationKey(fighter.visualId, "idle"), true);
    }

    this.add
      .text(x, 151, fighter.displayName, {
        fontFamily: "Segoe UI, Arial, sans-serif",
        fontSize: "31px",
        fontStyle: "bold",
        color: "#fff5d6",
      })
      .setOrigin(0.5);
    this.add
      .text(x, 190, fighter.species, {
        fontFamily: "Consolas, ui-monospace, monospace",
        fontSize: "13px",
        fontStyle: "bold",
        color: "#55d7c2",
      })
      .setOrigin(0.5);
    this.add
      .text(x, 397, fighter.description, {
        fontFamily: "Segoe UI, Arial, sans-serif",
        fontSize: "15px",
        color: "#fff5d6",
        align: "center",
        wordWrap: { width: 278 },
      })
      .setOrigin(0.5);
    this.add
      .text(x, 448, "WAFFENPRÄFERENZ", {
        fontFamily: "Consolas, ui-monospace, monospace",
        fontSize: "12px",
        fontStyle: "bold",
        color: "#ffcd5d",
      })
      .setOrigin(0.5);

    const weaponButtons = new Map<
      WeaponId,
      {
        background: Phaser.GameObjects.Rectangle;
        label: Phaser.GameObjects.Text;
        icon: Phaser.GameObjects.Sprite;
      }
    >();
    WEAPON_IDS.forEach((weaponId, index) => {
      const y = 492 + index * 54;
      const weaponBackground = this.add
        .rectangle(x, y, 282, 42, 0x23454d, 1)
        .setStrokeStyle(2, 0xfff5d6, 0.35)
        .setInteractive({ useHandCursor: true });
      const weaponLabel = this.add
        .text(x + 16, y, WEAPON_PROFILES[weaponId].displayName, {
          fontFamily: "Consolas, ui-monospace, monospace",
          fontSize: "12px",
          fontStyle: "bold",
          color: "#fff5d6",
        })
        .setOrigin(0.5);
      const weaponIcon = this.add
        .sprite(
          x - 108,
          y,
          FEEDBACK_ICON_TEXTURE_KEY,
          feedbackIconFrame(weaponId),
        )
        .setDisplaySize(30, 30);
      weaponBackground.on("pointerdown", () =>
        this.chooseWeapon(fighterId, weaponId),
      );
      weaponButtons.set(weaponId, {
        background: weaponBackground,
        label: weaponLabel,
        icon: weaponIcon,
      });
    });

    const selectionText = this.add
      .text(x + 142, 148, "", {
        fontFamily: "Segoe UI, Arial, sans-serif",
        fontSize: "18px",
        fontStyle: "bold",
        color: "#142c33",
        backgroundColor: "#ffcd5d",
        padding: { x: 8, y: 5 },
      })
      .setOrigin(1, 0.5);

    return { fighterId, background, selectionText, weaponButtons };
  }

  private toggleFighter(fighterId: FighterId): void {
    const selected = [...this.managerState.selectedFighterIds];
    const index = selected.indexOf(fighterId);

    if (index >= 0) {
      selected.splice(index, 1);
    } else if (selected.length < 3) {
      selected.push(fighterId);
    } else {
      this.renderState("Die Crew ist voll. Wechsle zuerst ein Wesen aus.");
      return;
    }

    this.managerState = withSelectedFighters(this.managerState, selected);
    saveManagerState(this.managerState);
    this.renderState(
      selected.length === 3
        ? "Crew vollständig. Lege noch die bevorzugten Waffen fest."
        : `Noch ${3 - selected.length} Platz frei.`,
    );
  }

  private chooseWeapon(fighterId: FighterId, weaponId: WeaponId): void {
    if (!this.managerState.selectedFighterIds.includes(fighterId)) {
      this.renderState("Wähle das Wesen zuerst für die Crew aus.");
      return;
    }
    if (!this.managerState.unlockedWeaponIds.includes(weaponId)) {
      this.renderState("Der Geländebrecher wird nach dem ersten Einsatz freigeschaltet.");
      return;
    }

    this.managerState = withWeaponPreference(
      this.managerState,
      fighterId,
      weaponId,
    );
    saveManagerState(this.managerState);
    this.renderState(
      `${FIGHTER_ROSTER[fighterId].displayName} bevorzugt jetzt ${WEAPON_PROFILES[weaponId].displayName}.`,
    );
  }

  private renderState(status: string): void {
    const selectedIds = this.managerState.selectedFighterIds;
    this.selectionCountText.setText(`CREW ${selectedIds.length}/3`);

    for (const card of this.cards) {
      const selectedIndex = selectedIds.indexOf(card.fighterId);
      const selected = selectedIndex >= 0;
      card.background
        .setFillStyle(selected ? 0x163f45 : 0x102a36, selected ? 0.98 : 0.9)
        .setStrokeStyle(4, selected ? 0xffcd5d : 0xfff5d6, selected ? 1 : 0.42);
      card.selectionText
        .setVisible(selected)
        .setText(selected ? `#${selectedIndex + 1}` : "");

      for (const [weaponId, button] of card.weaponButtons) {
        const unlocked = this.managerState.unlockedWeaponIds.includes(weaponId);
        const preferred =
          selected && this.managerState.weaponPreferences[card.fighterId] === weaponId;
        button.background
          .setAlpha(selected ? 1 : 0.36)
          .setFillStyle(preferred ? 0xffcd5d : 0x23454d, 1)
          .setStrokeStyle(2, preferred ? 0x142c33 : 0xfff5d6, preferred ? 0.9 : 0.3);
        button.label
          .setAlpha(selected ? (unlocked ? 1 : 0.52) : 0.36)
          .setColor(preferred ? "#142c33" : "#fff5d6")
          .setText(
            unlocked
              ? WEAPON_PROFILES[weaponId].displayName
              : `${WEAPON_PROFILES[weaponId].displayName} · GESPERRT`,
          );
        button.icon.setAlpha(
          selected ? (unlocked ? 1 : 0.4) : 0.25,
        );
      }
    }

    this.deployButton.setEnabled(selectedIds.length === 3);
    this.statusText.setText(status);
  }

  private launchMatch(): void {
    if (this.managerState.selectedFighterIds.length !== 3) {
      this.renderState("Für einen Einsatz brauchst du genau drei Wesen.");
      return;
    }

    saveManagerState(this.managerState);
    this.scene.start("MatchScene", {
      launchConfig: createManagerMatchConfig(this.managerState),
    });
  }
}
