import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { CREATURE_VISUALS } from "../content/characters/creatureKits";
import { decodeRgbaPng } from "./pngTerrain";
import { encodeRgbaPng } from "./pngWrite";
import {
  measureFrameAnchor,
  medianBaseCentroid,
} from "./sheetMetrics";

/**
 * Einmal-Werkzeug aus Task 025: richtet die Idle-Frames der flüssigen
 * Sheets horizontal auf den Median ihres Basis-Schwerpunkts aus und
 * überschreibt die PNGs. Nur mit ALIGN_SHEETS=1 aktiv; das Ergebnis wird
 * committet und vom Regressionstest sheetStability.test.ts überwacht.
 */

const FLUID_SHEETS = [
  { visualId: "slime", file: "slime-fluid-sheet.png" },
  { visualId: "ghost", file: "ghost-fluid-sheet.png" },
] as const;

const EDGE_MARGIN = 2;

describe("align fluid idle frames (Werkzeug, ALIGN_SHEETS=1)", () => {
  it.skipIf(!process.env["ALIGN_SHEETS"])("realigns and rewrites the sheets", () => {
    for (const sheet of FLUID_SHEETS) {
      const visual = CREATURE_VISUALS[sheet.visualId];
      const idleFrames = visual.motionFrames.idle ?? [];
      const path = join(
        process.cwd(),
        "public",
        "assets",
        "characters",
        sheet.file,
      );
      const png = decodeRgbaPng(readFileSync(path));
      const anchors = idleFrames.map((frame) =>
        measureFrameAnchor(png, frame, visual.frameWidth),
      );
      const target = Math.round(medianBaseCentroid(anchors));
      const rgba = new Uint8Array(png.rgba);
      const frameSize = visual.frameWidth;
      const columns = Math.floor(png.width / frameSize);

      for (const anchor of anchors) {
        const shift = Math.round(target - anchor.baseCentroidX);

        if (shift === 0) {
          continue;
        }

        if (
          anchor.minX + shift < EDGE_MARGIN ||
          anchor.maxX + shift > frameSize - 1 - EDGE_MARGIN
        ) {
          throw new Error(
            `Frame ${anchor.frame} of ${sheet.file} cannot shift by ${shift}px without clipping.`,
          );
        }

        const frameX = (anchor.frame % columns) * frameSize;
        const frameY = Math.floor(anchor.frame / columns) * frameSize;

        for (let y = 0; y < frameSize; y += 1) {
          const row = new Uint8Array(frameSize * 4);

          for (let x = 0; x < frameSize; x += 1) {
            const sourceX = x - shift;

            if (sourceX >= 0 && sourceX < frameSize) {
              const sourceIndex =
                ((frameY + y) * png.width + (frameX + sourceX)) * 4;
              row.set(png.rgba.subarray(sourceIndex, sourceIndex + 4), x * 4);
            }
          }

          rgba.set(row, ((frameY + y) * png.width + frameX) * 4);
        }
      }

      writeFileSync(path, encodeRgbaPng(png.width, png.height, rgba));

      const verification = decodeRgbaPng(readFileSync(path));
      for (const frame of idleFrames) {
        const anchor = measureFrameAnchor(verification, frame, frameSize);
        expect(Math.abs(anchor.baseCentroidX - target)).toBeLessThanOrEqual(2);
      }
    }
  });
});
