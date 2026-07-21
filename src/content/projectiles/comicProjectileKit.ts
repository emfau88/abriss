import { publicAssetPath } from "../publicAssetPath";

export const COMIC_PROJECTILE_TEXTURE_KEY = "comic-projectile-kit";
export const COMIC_PROJECTILE_SHEET_PATH = publicAssetPath(
  "assets/projectiles/comic-projectile-sheet.png",
);
export const COMIC_PROJECTILE_FRAME_WIDTH = 627;
export const COMIC_PROJECTILE_FRAME_HEIGHT = 627;

export type ComicProjectile = "rocket" | "grenade" | "breaker";

const PROJECTILE_FRAME: Record<ComicProjectile, number> = {
  rocket: 0,
  grenade: 1,
  breaker: 2,
};

const PROJECTILE_DISPLAY_SIZE: Record<ComicProjectile, number> = {
  rocket: 90,
  grenade: 64,
  breaker: 92,
};

export function comicProjectileFrame(
  projectile: ComicProjectile,
  brightFuse = false,
): number {
  return projectile === "grenade" && brightFuse
    ? 3
    : PROJECTILE_FRAME[projectile];
}

export function comicProjectileDisplaySize(
  projectile: ComicProjectile,
): number {
  return PROJECTILE_DISPLAY_SIZE[projectile];
}
