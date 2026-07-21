import type Phaser from "phaser";

import { publicAssetPath } from "../publicAssetPath";

import {
  BLUE_HORNLING_FRAME_HEIGHT,
  BLUE_HORNLING_FRAME_WIDTH,
  BLUE_HORNLING_SHEET_PATH,
  BLUE_HORNLING_TEXTURE_KEY,
} from "./blueHornlingKit";

export type CreatureVisualId = "hornling" | "moki" | "vela";
export type CreaturePose =
  | "ready"
  | "planning"
  | "action"
  | "grenade"
  | "startled"
  | "victory";
export type CreatureMotion = "idle" | "walk" | "jump";

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
    displaySize: 116,
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
    displaySize: 140,
    poseFrames: {
      ready: 0,
      planning: 1,
      action: 12,
      grenade: 13,
      startled: 14,
      victory: 15,
    },
    motionFrames: {
      idle: [0, 1, 2, 3],
      walk: [4, 5, 6, 7],
      jump: [8, 9, 10, 11],
    },
  },
  vela: {
    id: "vela",
    textureKey: "vela-ghost-kit",
    sheetPath: publicAssetPath("assets/characters/vela-ghost-sheet.png"),
    frameWidth: STANDARD_FRAME_SIZE,
    frameHeight: STANDARD_FRAME_SIZE,
    displaySize: 148,
    poseFrames: {
      ready: 0,
      planning: 1,
      action: 12,
      grenade: 13,
      startled: 14,
      victory: 15,
    },
    motionFrames: {
      idle: [0, 1, 2, 3],
      walk: [4, 5, 6, 7],
      jump: [8, 9, 10, 11],
    },
  },
};

export function creatureAnimationKey(
  visualId: CreatureVisualId,
  motion: CreatureMotion,
): string {
  return `${CREATURE_VISUALS[visualId].textureKey}:${motion}`;
}

export function registerCreatureAnimations(scene: Phaser.Scene): void {
  for (const visual of Object.values(CREATURE_VISUALS)) {
    for (const [motion, frames] of Object.entries(visual.motionFrames)) {
      if (!frames || frames.length < 2) {
        continue;
      }

      const key = creatureAnimationKey(
        visual.id,
        motion as CreatureMotion,
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
        frameRate: motion === "idle" ? 3.2 : motion === "walk" ? 8 : 7,
        repeat: motion === "jump" ? 0 : -1,
      });
    }
  }
}
