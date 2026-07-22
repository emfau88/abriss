/**
 * Pixel-Vermessung von Charakter-Spritesheets für Stabilitätstests und die
 * rechnerische Neuausrichtung (Task 025). Anker ist der Alpha-Schwerpunkt
 * des unteren Inhaltsdrittels (Basis der Figur) – stabiler gegenüber Arm-
 * und Schweifbewegungen als der Gesamtschwerpunkt.
 */

export interface DecodedSheet {
  readonly width: number;
  readonly height: number;
  readonly rgba: Uint8Array;
}

export interface FrameAnchor {
  readonly frame: number;
  /** Alpha-Schwerpunkt X des unteren Inhaltsdrittels, in Frame-Pixeln. */
  readonly baseCentroidX: number;
  /** Unterste Inhaltszeile (Fußlinie), in Frame-Pixeln. */
  readonly footY: number;
  readonly minX: number;
  readonly maxX: number;
  readonly minY: number;
  readonly maxY: number;
}

export const SHEET_ALPHA_THRESHOLD = 40;

export function measureFrameAnchor(
  sheet: DecodedSheet,
  frameIndex: number,
  frameSize: number,
): FrameAnchor {
  const columns = Math.floor(sheet.width / frameSize);
  const frameX = (frameIndex % columns) * frameSize;
  const frameY = Math.floor(frameIndex / columns) * frameSize;
  let minX = frameSize;
  let maxX = -1;
  let minY = frameSize;
  let maxY = -1;

  for (let y = 0; y < frameSize; y += 1) {
    for (let x = 0; x < frameSize; x += 1) {
      const alpha =
        sheet.rgba[((frameY + y) * sheet.width + (frameX + x)) * 4 + 3]!;

      if (alpha >= SHEET_ALPHA_THRESHOLD) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  if (maxX < 0) {
    throw new Error(`Frame ${frameIndex} contains no visible pixels.`);
  }

  const baseTop = maxY - Math.ceil((maxY - minY + 1) / 3);
  let sumX = 0;
  let count = 0;

  for (let y = Math.max(0, baseTop); y <= maxY; y += 1) {
    for (let x = 0; x < frameSize; x += 1) {
      const alpha =
        sheet.rgba[((frameY + y) * sheet.width + (frameX + x)) * 4 + 3]!;

      if (alpha >= SHEET_ALPHA_THRESHOLD) {
        sumX += x;
        count += 1;
      }
    }
  }

  return {
    frame: frameIndex,
    baseCentroidX: sumX / count,
    footY: maxY,
    minX,
    maxX,
    minY,
    maxY,
  };
}

/** Größter Basis-Sprung zwischen Nachbarframes einschließlich Loop-Wrap. */
export function maxLoopBaseJump(anchors: readonly FrameAnchor[]): number {
  let maximum = 0;

  for (let index = 0; index < anchors.length; index += 1) {
    const current = anchors[index]!;
    const next = anchors[(index + 1) % anchors.length]!;
    maximum = Math.max(
      maximum,
      Math.abs(next.baseCentroidX - current.baseCentroidX),
    );
  }

  return maximum;
}

export function footLineDrift(anchors: readonly FrameAnchor[]): number {
  const feet = anchors.map((anchor) => anchor.footY);
  return Math.max(...feet) - Math.min(...feet);
}

export function medianBaseCentroid(anchors: readonly FrameAnchor[]): number {
  const sorted = anchors
    .map((anchor) => anchor.baseCentroidX)
    .sort((left, right) => left - right);
  const middle = Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 1) {
    return sorted[middle]!;
  }

  return (sorted[middle - 1]! + sorted[middle]!) / 2;
}
