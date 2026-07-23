import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  footLineDrift,
  maxLoopBaseJump,
  measureFrameAnchor,
} from "../../testing/sheetMetrics";
import { decodeRgbaPng } from "../../testing/pngTerrain";
import { CREATURE_VISUALS } from "./creatureKits";

const SIMPLE_SHEETS = [
  { visualId: "moki", file: "moki-mushroom-sheet.png" },
  { visualId: "pop-diva", file: "pop-diva-sheet.png" },
  { visualId: "chicken", file: "chicken-sheet.png" },
  { visualId: "raccoon-bandit", file: "raccoon-bandit-sheet.png" },
] as const;

describe("simple character-sheet stability", () => {
  for (const sheet of SIMPLE_SHEETS) {
    it(`keeps ${sheet.visualId} idle anchored for the game camera`, () => {
      const visual = CREATURE_VISUALS[sheet.visualId];
      const png = decodeRgbaPng(
        readFileSync(
          join(process.cwd(), "public", "assets", "characters", sheet.file),
        ),
      );
      const anchors = visual.motionFrames.idle!.map((frame) =>
        measureFrameAnchor(png, frame, visual.frameWidth),
      );

      expect(maxLoopBaseJump(anchors)).toBeLessThanOrEqual(4);
      expect(footLineDrift(anchors)).toBeLessThanOrEqual(3);
    });
  }
});
