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

/**
 * Regressionstest aus Task 025: Auch die reduzierten Vier-Frame-Loops müssen
 * zyklisch stabil bleiben. Eine feste Fußlinie und eine ruhige Basisachse
 * machen „jitterfrei“ zu einer prüfbaren Qualitätsschranke.
 */

const FLUID_SHEETS = [
  { visualId: "slime", file: "slime-fluid-sheet.png" },
  { visualId: "ghost", file: "ghost-fluid-sheet.png" },
] as const;

const MAX_IDLE_BASE_JUMP = 4;
const MAX_IDLE_FOOT_DRIFT = 3;

describe("ghost and slime sheet idle stability (Task 025)", () => {
  for (const sheet of FLUID_SHEETS) {
    it(`keeps the ${sheet.visualId} idle loop cyclic`, () => {
      const visual = CREATURE_VISUALS[sheet.visualId];
      const idleFrames = visual.motionFrames.idle;

      expect(idleFrames).toBeDefined();

      const png = decodeRgbaPng(
        readFileSync(
          join(process.cwd(), "public", "assets", "characters", sheet.file),
        ),
      );
      const anchors = (idleFrames ?? []).map((frame) =>
        measureFrameAnchor(png, frame, visual.frameWidth),
      );

      expect(maxLoopBaseJump(anchors)).toBeLessThanOrEqual(MAX_IDLE_BASE_JUMP);
      expect(footLineDrift(anchors)).toBeLessThanOrEqual(MAX_IDLE_FOOT_DRIFT);
    });
  }
});
