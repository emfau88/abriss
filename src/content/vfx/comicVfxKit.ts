import { publicAssetPath } from "../publicAssetPath";

export const COMIC_VFX_TEXTURE_KEY = "comic-vfx-kit";
export const COMIC_VFX_SHEET_PATH = publicAssetPath(
  "assets/vfx/comic-vfx-sheet.png",
);
export const COMIC_VFX_FRAME_WIDTH = 627;
export const COMIC_VFX_FRAME_HEIGHT = 627;

export type ComicVfx = "exhaust" | "impact" | "smoke" | "debris";

const VFX_FRAME: Record<ComicVfx, number> = {
  exhaust: 0,
  impact: 1,
  smoke: 2,
  debris: 3,
};

export function comicVfxFrame(effect: ComicVfx): number {
  return VFX_FRAME[effect];
}
