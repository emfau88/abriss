import { publicAssetPath } from "../publicAssetPath";

export const BLUE_HORNLING_TEXTURE_KEY = "blue-hornling-kit";
export const BLUE_HORNLING_SHEET_PATH =
  publicAssetPath("assets/characters/blue-hornling-sheet.png");
export const BLUE_HORNLING_FRAME_WIDTH = 627;
export const BLUE_HORNLING_FRAME_HEIGHT = 627;

export type CreaturePose = "ready" | "planning" | "action" | "startled";

const POSE_FRAME: Record<CreaturePose, number> = {
  ready: 0,
  planning: 1,
  action: 2,
  startled: 3,
};

export function blueHornlingFrame(pose: CreaturePose): number {
  return POSE_FRAME[pose];
}
