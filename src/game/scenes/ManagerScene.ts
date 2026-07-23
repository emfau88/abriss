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
import { WEAPON_FLAVOR } from "../ui/menuFlavor";
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
      readonly tag: Phaser.GameObjects.Text;
    }
  >;
}
// Task „6er-Kader": Auswahl in zwei Reihen à drei Karten (Fenster 1600×900).
// Drei Spalten geben jeder Karte Breite; zwei Reihen passen zwischen Kopf- und
// Fußzeile.
const CARD_COLUMN_X = [428, 800, 1172] as const;
const CARD_ROW_Y = [272, 636] as const;
const CARD_WIDTH = 360;
const CARD_HEIGHT = 330;

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
      const column = index % CARD_COLUMN_X.length;
      const row = Math.floor(index / CARD_COLUMN_X.length);
      const x = CARD_COLUMN_X[column] ?? CARD_COLUMN_X[0];
      const y = CARD_ROW_Y[row] ?? CARD_ROW_Y[0];
      this.cards.push(this.createFighterCard(fighterId, x, y));
    });

    this.statusText = this.add
      .text(RENDER_WIDTH / 2, 826, "", {
        fontFamily: "Segoe UI, Arial, sans-serif",
        fontSize: "16px",
        fontStyle: "bold",
        color: "#fff5d6",
        align: "center",
      })
      .setOrigin(0.5);

    createMenuButton(this, {
      x: 165,
      y: 866,
      width: 220,
      height: 54,
      label: "HAUPTMENÜ",
      accent: 0xfff5d6,
      onClick: () => this.scene.start("MainMenuScene"),
    });
    this.deployButton = createMenuButton(this, {
      x: 1260,
      y: 866,
      width: 520,
      height: 60,
      label: "CREW IN DEN EINSATZ SCHICKEN",
      onClick: () => this.launchMatch(),
    });

    this.renderState("Klicke eine Karte zum Ein- oder Auswechseln.");
  }

  private createFighterCard(
    fighterId: FighterId,
    x: number,
    centerY: number,
  ): FighterCard {
    const fighter = FIGHTER_ROSTER[fighterId];
    const visual = CREATURE_VISUALS[fighter.visualId];
    // Alle Elemente relativ zur Kartenmitte, damit dieselbe Karte in Reihe 1
    // und Reihe 2 (unterschiedliches centerY) identisch aussieht.
    const top = centerY - CARD_HEIGHT / 2;
    const background = this.add
      .rectangle(x, centerY, CARD_WIDTH, CARD_HEIGHT, 0x102a36, 0.94)
      .setStrokeStyle(4, 0xfff5d6, 0.52)
      .setInteractive({ useHandCursor: true });
    background.on("pointerdown", () => this.toggleFighter(fighterId));

    // Sprite links, Kopfzeile rechts daneben – spart Höhe für zwei Reihen.
    const sprite = this.add
      .sprite(x - 118, top + 78, visual.textureKey, visual.poseFrames.ready)
      .setDisplaySize(120, 120);
    if ((visual.motionFrames.idle?.length ?? 0) > 1) {
      sprite.play(creatureAnimationKey(fighter.visualId, "idle"), true);
    }

    this.add
      .text(x - 44, top + 34, fighter.displayName, {
        fontFamily: "Segoe UI, Arial, sans-serif",
        fontSize: "28px",
        fontStyle: "bold",
        color: "#fff5d6",
      })
      .setOrigin(0, 0.5);
    this.add
      .text(x - 44, top + 62, fighter.species, {
        fontFamily: "Consolas, ui-monospace, monospace",
        fontSize: "12px",
        fontStyle: "bold",
        color: "#55d7c2",
      })
      .setOrigin(0, 0.5);
    this.createTraitRow(x - 44, top + 92, "#8fe6c8", "KANN GUT", fighter.strength);
    this.createTraitRow(
      x - 44,
      top + 122,
      "#ffb199",
      "KANN NICHT",
      fighter.weakness,
    );

    // „Berüchtigt für" quer unter Sprite und Kopf, volle Kartenbreite.
    this.createTraitRow(
      x,
      top + 176,
      "#ffcd5d",
      "BERÜCHTIGT FÜR",
      fighter.knownFor,
      CARD_WIDTH - 40,
    );

    this.add
      .text(x, top + 214, "WAFFENPRÄFERENZ", {
        fontFamily: "Consolas, ui-monospace, monospace",
        fontSize: "11px",
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
        tag: Phaser.GameObjects.Text;
      }
    >();
    WEAPON_IDS.forEach((weaponId, index) => {
      const y = top + 240 + index * 30;
      const weaponBackground = this.add
        .rectangle(x, y, CARD_WIDTH - 44, 26, 0x23454d, 1)
        .setStrokeStyle(2, 0xfff5d6, 0.35)
        .setInteractive({ useHandCursor: true });
      const weaponLabel = this.add
        .text(x - 6, y, WEAPON_PROFILES[weaponId].displayName, {
          fontFamily: "Consolas, ui-monospace, monospace",
          fontSize: "12px",
          fontStyle: "bold",
          color: "#fff5d6",
        })
        .setOrigin(0.5);
      const weaponIcon = this.add
        .sprite(
          x - CARD_WIDTH / 2 + 40,
          y,
          FEEDBACK_ICON_TEXTURE_KEY,
          feedbackIconFrame(weaponId),
        )
        .setDisplaySize(22, 22);
      // Tag als kleiner Chip rechts im Button.
      const weaponTag = this.add
        .text(x + CARD_WIDTH / 2 - 36, y, WEAPON_FLAVOR[weaponId].tag, {
          fontFamily: "Consolas, ui-monospace, monospace",
          fontSize: "9px",
          fontStyle: "bold",
          color: "#0d2027",
          backgroundColor: "#8fe6c8",
          padding: { x: 5, y: 2 },
        })
        .setOrigin(1, 0.5)
        .setDepth(2);
      weaponBackground.on("pointerdown", () =>
        this.chooseWeapon(fighterId, weaponId),
      );
      // Beim Überfahren erklärt die Waffe sich selbst in der Statuszeile.
      weaponBackground.on("pointerover", () =>
        this.statusText.setText(
          `${WEAPON_PROFILES[weaponId].displayName}: ${WEAPON_FLAVOR[weaponId].quip}`,
        ),
      );
      weaponButtons.set(weaponId, {
        background: weaponBackground,
        label: weaponLabel,
        icon: weaponIcon,
        tag: weaponTag,
      });
    });

    const selectionText = this.add
      .text(x + CARD_WIDTH / 2 - 12, top + 20, "", {
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

  /**
   * Eine kompakte Merkmalszeile: kleines farbiges Label, darunter kurzer
   * Charaktertext. Rein kosmetisch. `originX` steuert Ausrichtung (links für
   * die Spaltentexte neben dem Sprite, zentriert für die Querzeile);
   * `wrapWidth` begrenzt den Umbruch. Verändert kein Verhalten.
   */
  private createTraitRow(
    x: number,
    y: number,
    accentHex: string,
    label: string,
    text: string,
    wrapWidth = 210,
  ): void {
    const centered = wrapWidth > 260;
    const originX = centered ? 0.5 : 0;
    this.add
      .text(x, y, label, {
        fontFamily: "Consolas, ui-monospace, monospace",
        fontSize: "10px",
        fontStyle: "bold",
        color: accentHex,
        letterSpacing: 1,
      })
      .setOrigin(originX, 0.5);
    this.add
      .text(x, y + 14, text, {
        fontFamily: "Segoe UI, Arial, sans-serif",
        fontSize: "12px",
        color: "#fff5d6",
        align: centered ? "center" : "left",
        wordWrap: { width: wrapWidth },
      })
      .setOrigin(originX, 0.5);
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
        // Der Tag tritt zurück, wenn die Waffe gewählt ist (der Goldton reicht).
        button.tag.setAlpha(
          preferred ? 0 : selected ? (unlocked ? 0.9 : 0.4) : 0.22,
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
