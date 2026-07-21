import { publicAssetPath } from "../publicAssetPath";

export const FEEDBACK_ICON_TEXTURE_KEY = "feedback-icon-kit";
export const FEEDBACK_ICON_SHEET_PATH = publicAssetPath(
  "assets/ui/feedback-icon-sheet.png",
);
export const FEEDBACK_ICON_FRAME_WIDTH = 512;
export const FEEDBACK_ICON_FRAME_HEIGHT = 512;

export type FeedbackIcon =
  | "rocket"
  | "grenade"
  | "breaker"
  | "health"
  | "turn"
  | "manager";

const FEEDBACK_ICON_FRAME: Record<FeedbackIcon, number> = {
  rocket: 0,
  grenade: 1,
  breaker: 2,
  health: 3,
  turn: 4,
  manager: 5,
};

export function feedbackIconFrame(icon: FeedbackIcon): number {
  return FEEDBACK_ICON_FRAME[icon];
}
