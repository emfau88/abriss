import type Phaser from "phaser";

import { publicAssetPath } from "../publicAssetPath";

import {
  BLUE_HORNLING_FRAME_HEIGHT,
  BLUE_HORNLING_FRAME_WIDTH,
  BLUE_HORNLING_SHEET_PATH,
  BLUE_HORNLING_TEXTURE_KEY,
} from "./blueHornlingKit";

export type CreatureVisualId =
  | "hornling"
  | "moki"
  | "ghost"
  | "slime"
  | "pop-diva"
  | "chicken"
  | "raccoon-bandit";
export type CreaturePose =
  | "ready"
  | "planning"
  | "action"
  | "grenade"
  | "startled"
  | "victory";
export type CreatureMotion = "idle" | "walk" | "jump";
export type CreatureAnimationId = CreatureMotion | CreaturePose;

export interface CreatureVisualSpec {
  readonly id: CreatureVisualId;
  readonly textureKey: string;
  readonly sheetPath: string;
  readonly frameWidth: number;
  readonly frameHeight: number;
  readonly displaySize: number;
  readonly poseFrames: Readonly<Record<CreaturePose, number>>;
  readonly motionFrames: Readonly<
    Partial<Record<CreatureMotion, readonly number[]>>
  >;
  readonly poseAnimationFrames?: Readonly<
    Partial<Record<CreaturePose, readonly number[]>>
  >;
  readonly animationFrameRates?: Readonly<
    Partial<Record<CreatureAnimationId, number>>
  >;
  readonly animationRepeats?: Readonly<
    Partial<Record<CreatureAnimationId, number>>
  >;
}

const STANDARD_FRAME_SIZE = 256;

export const CREATURE_VISUALS: Readonly<
  Record<CreatureVisualId, CreatureVisualSpec>
> = {
  hornling: {
    id: "hornling",
    textureKey: BLUE_HORNLING_TEXTURE_KEY,
    sheetPath: BLUE_HORNLING_SHEET_PATH,
    frameWidth: BLUE_HORNLING_FRAME_WIDTH,
    frameHeight: BLUE_HORNLING_FRAME_HEIGHT,
    displaySize: 93,
    poseFrames: {
      ready: 0,
      planning: 1,
      action: 2,
      grenade: 2,
      startled: 3,
      victory: 0,
    },
    motionFrames: {},
  },
  moki: {
    id: "moki",
    textureKey: "moki-mushroom-kit",
    sheetPath: publicAssetPath("assets/characters/moki-mushroom-sheet.png"),
    frameWidth: STANDARD_FRAME_SIZE,
    frameHeight: STANDARD_FRAME_SIZE,
    displaySize: 112,
    poseFrames: {
      ready: 0,
      planning: 2,
      action: 0,
      grenade: 0,
      startled: 12,
      victory: 3,
    },
    motionFrames: {
      idle: [0, 1, 2, 3],
      walk: [4, 5, 6, 7],
      jump: [8, 9, 10, 11],
    },
    poseAnimationFrames: {
      ready: [0, 1, 2, 3],
      planning: [1, 2, 3, 0],
      startled: [12, 13, 14, 15],
    },
    animationFrameRates: {
      idle: 8,
      ready: 8,
      planning: 8,
      walk: 12,
      jump: 11,
      startled: 10,
    },
    animationRepeats: {
      idle: -1,
      ready: -1,
      planning: -1,
      walk: -1,
      jump: 0,
      startled: 0,
    },
  },
  ghost: {
    id: "ghost",
    textureKey: "ghost-fluid-kit",
    sheetPath: publicAssetPath("assets/characters/ghost-fluid-sheet.png"),
    frameWidth: STANDARD_FRAME_SIZE,
    frameHeight: STANDARD_FRAME_SIZE,
    displaySize: 117,
    poseFrames: {
      ready: 0,
      planning: 2,
      action: 0,
      grenade: 0,
      startled: 12,
      victory: 3,
    },
    motionFrames: {
      idle: [0, 1, 2, 3],
      walk: [4, 5, 6, 7],
      jump: [8, 9, 10, 11],
    },
    poseAnimationFrames: {
      ready: [0, 1, 2, 3],
      planning: [1, 2, 3, 0],
      startled: [12, 13, 14, 15],
    },
    animationFrameRates: {
      idle: 8,
      ready: 8,
      planning: 8,
      walk: 12,
      jump: 11,
      startled: 10,
    },
    animationRepeats: {
      idle: -1,
      ready: -1,
      planning: -1,
      walk: -1,
      jump: 0,
      startled: 0,
    },
  },
  slime: {
    id: "slime",
    textureKey: "slime-fluid-kit",
    sheetPath: publicAssetPath("assets/characters/slime-fluid-sheet.png"),
    frameWidth: STANDARD_FRAME_SIZE,
    frameHeight: STANDARD_FRAME_SIZE,
    displaySize: 117,
    poseFrames: {
      ready: 0,
      planning: 2,
      action: 0,
      grenade: 0,
      startled: 12,
      victory: 3,
    },
    motionFrames: {
      idle: [0, 1, 2, 3],
      walk: [4, 5, 6, 7],
      jump: [8, 9, 10, 11],
    },
    poseAnimationFrames: {
      ready: [0, 1, 2, 3],
      planning: [1, 2, 3, 0],
      startled: [12, 13, 14, 15],
    },
    animationFrameRates: {
      idle: 8,
      ready: 8,
      planning: 8,
      walk: 12,
      jump: 11,
      startled: 10,
    },
    animationRepeats: {
      idle: -1,
      ready: -1,
      planning: -1,
      walk: -1,
      jump: 0,
      startled: 0,
    },
  },
  "pop-diva": {
    id: "pop-diva",
    textureKey: "pop-diva-kit",
    sheetPath: publicAssetPath("assets/characters/pop-diva-sheet.png"),
    frameWidth: STANDARD_FRAME_SIZE,
    frameHeight: STANDARD_FRAME_SIZE,
    displaySize: 117,
    poseFrames: {
      ready: 0,
      planning: 2,
      action: 0,
      grenade: 0,
      startled: 12,
      victory: 3,
    },
    motionFrames: {
      idle: [0, 1, 2, 3],
      walk: [4, 5, 6, 7],
      jump: [8, 9, 10, 11],
    },
    poseAnimationFrames: {
      ready: [0, 1, 2, 3],
      planning: [1, 2, 3, 0],
      startled: [12, 13, 14, 15],
    },
    animationFrameRates: {
      idle: 8,
      ready: 8,
      planning: 8,
      walk: 12,
      jump: 11,
      startled: 10,
    },
    animationRepeats: {
      idle: -1,
      ready: -1,
      planning: -1,
      walk: -1,
      jump: 0,
      startled: 0,
    },
  },
  chicken: {
    id: "chicken",
    textureKey: "chicken-kit",
    sheetPath: publicAssetPath("assets/characters/chicken-sheet.png"),
    frameWidth: STANDARD_FRAME_SIZE,
    frameHeight: STANDARD_FRAME_SIZE,
    displaySize: 117,
    poseFrames: {
      ready: 0,
      planning: 2,
      action: 0,
      grenade: 0,
      startled: 12,
      victory: 3,
    },
    motionFrames: {
      idle: [0, 1, 2, 3],
      walk: [4, 5, 6, 7],
      jump: [8, 9, 10, 11],
    },
    poseAnimationFrames: {
      ready: [0, 1, 2, 3],
      planning: [1, 2, 3, 0],
      startled: [12, 13, 14, 15],
    },
    animationFrameRates: {
      idle: 8,
      ready: 8,
      planning: 8,
      walk: 14,
      jump: 12,
      startled: 11,
    },
    animationRepeats: {
      idle: -1,
      ready: -1,
      planning: -1,
      walk: -1,
      jump: 0,
      startled: 0,
    },
  },
  "raccoon-bandit": {
    id: "raccoon-bandit",
    textureKey: "raccoon-bandit-kit",
    sheetPath: publicAssetPath("assets/characters/raccoon-bandit-sheet.png"),
    frameWidth: STANDARD_FRAME_SIZE,
    frameHeight: STANDARD_FRAME_SIZE,
    displaySize: 117,
    poseFrames: {
      ready: 0,
      planning: 2,
      action: 0,
      grenade: 0,
      startled: 12,
      victory: 3,
    },
    motionFrames: {
      idle: [0, 1, 2, 3],
      walk: [4, 5, 6, 7],
      jump: [8, 9, 10, 11],
    },
    poseAnimationFrames: {
      ready: [0, 1, 2, 3],
      planning: [1, 2, 3, 0],
      startled: [12, 13, 14, 15],
    },
    animationFrameRates: {
      idle: 8,
      ready: 8,
      planning: 8,
      walk: 13,
      jump: 12,
      startled: 10,
    },
    animationRepeats: {
      idle: -1,
      ready: -1,
      planning: -1,
      walk: -1,
      jump: 0,
      startled: 0,
    },
  },
};

export function creatureAnimationKey(
  visualId: CreatureVisualId,
  animation: CreatureAnimationId,
): string {
  return `${CREATURE_VISUALS[visualId].textureKey}:${animation}`;
}

export function registerCreatureAnimations(scene: Phaser.Scene): void {
  for (const visual of Object.values(CREATURE_VISUALS)) {
    const animations: Partial<Record<CreatureAnimationId, readonly number[]>> = {
      ...visual.motionFrames,
      ...visual.poseAnimationFrames,
    };

    for (const [animation, frames] of Object.entries(animations)) {
      if (!frames || frames.length < 2) {
        continue;
      }

      const key = creatureAnimationKey(
        visual.id,
        animation as CreatureAnimationId,
      );
      if (scene.anims.exists(key)) {
        continue;
      }

      scene.anims.create({
        key,
        frames: frames.map((frame) => ({
          key: visual.textureKey,
          frame,
        })),
        frameRate:
          visual.animationFrameRates?.[animation as CreatureAnimationId] ??
          (animation === "idle" ? 3.2 : animation === "walk" ? 8 : 7),
        repeat:
          visual.animationRepeats?.[animation as CreatureAnimationId] ??
          (animation === "jump" ? 0 : -1),
      });
    }
  }
}
