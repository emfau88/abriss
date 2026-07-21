import { describe, expect, it } from "vitest";

import { publicAssetPath } from "./publicAssetPath";

describe("publicAssetPath", () => {
  it("resolves assets relative to a portable production build", () => {
    expect(publicAssetPath("/assets/maps/world.png", "./")).toBe(
      "./assets/maps/world.png",
    );
  });

  it("normalizes an explicit project-pages base path", () => {
    expect(publicAssetPath("assets/vfx/hit.png", "/abriss")).toBe(
      "/abriss/assets/vfx/hit.png",
    );
  });
});
