import { publicAssetPath } from "../publicAssetPath";

export const SECONDARY_VFX_TEXTURE_KEY = "secondary-vfx-kit";
export const SECONDARY_VFX_SHEET_PATH = publicAssetPath(
  "assets/vfx/secondary-vfx-sheet.png",
);
export const SECONDARY_VFX_FRAME_WIDTH = 627;
export const SECONDARY_VFX_FRAME_HEIGHT = 627;

export type SecondaryVfx = "bounce" | "landing";

const SECONDARY_VFX_FRAMES: Record<SecondaryVfx, readonly [number, number]> = {
  bounce: [0, 1],
  landing: [2, 3],
};

export function secondaryVfxFrames(
  effect: SecondaryVfx,
): readonly [number, number] {
  return SECONDARY_VFX_FRAMES[effect];
}
