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
 * Regressionstest aus Task 025: Die Idle-Loops der flüssigen 32-Frame-Wesen
 * müssen zyklisch stabil sein. Vor der Neuausrichtung ruckte GLIB beim
 * Loop-Wrap um ~22 px und GHOST um ~28 px Basis-Schwerpunkt – „jitterfrei“
 * ist seitdem eine Testaussage, keine Behauptung.
 */

const FLUID_SHEETS = [
  { visualId: "slime", file: "slime-fluid-sheet.png" },
  { visualId: "ghost", file: "ghost-fluid-sheet.png" },
] as const;

const MAX_IDLE_BASE_JUMP = 4;
const MAX_IDLE_FOOT_DRIFT = 3;

describe("fluid sheet idle stability (Task 025)", () => {
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
