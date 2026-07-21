import { describe, expect, it } from "vitest";

import {
  comicProjectileDisplaySize,
  comicProjectileFrame,
} from "./projectiles/comicProjectileKit";
import { feedbackIconFrame } from "./ui/feedbackIconKit";
import { secondaryVfxFrames } from "./vfx/secondaryVfxKit";

describe("feedback asset atlases", () => {
  it("maps projectile visuals and the grenade fuse variant to stable frames", () => {
    expect(comicProjectileFrame("rocket")).toBe(0);
    expect(comicProjectileFrame("grenade")).toBe(1);
    expect(comicProjectileFrame("breaker")).toBe(2);
    expect(comicProjectileFrame("grenade", true)).toBe(3);
    expect(comicProjectileDisplaySize("breaker")).toBeGreaterThan(
      comicProjectileDisplaySize("grenade"),
    );
  });

  it("keeps the six small feedback icons in their documented order", () => {
    expect(
      ["rocket", "grenade", "breaker", "health", "turn", "manager"].map(
        (icon) => feedbackIconFrame(icon as Parameters<typeof feedbackIconFrame>[0]),
      ),
    ).toEqual([0, 1, 2, 3, 4, 5]);
  });

  it("assigns two consecutive frames to each secondary effect", () => {
    expect(secondaryVfxFrames("bounce")).toEqual([0, 1]);
    expect(secondaryVfxFrames("landing")).toEqual([2, 3]);
  });
});
