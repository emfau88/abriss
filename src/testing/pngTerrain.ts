import { readFileSync } from "node:fs";
import { join } from "node:path";
import { inflateSync } from "node:zlib";

import type { MapDefinition } from "../content/maps/mapCatalog";
import { SOLID_ALPHA_THRESHOLD } from "../content/maps/terrainMaskFromImage";
import { BinaryTerrainMask } from "../simulation/terrain/TerrainMask";

/**
 * Headless-Gegenstück zu `createTerrainMaskFromImage`: dekodiert die
 * Terrain-PNGs ohne Browser-Canvas, damit Vitest mit den echten Karten
 * arbeiten kann. Der Browser skaliert das Bild per Canvas auf das Zellraster
 * herunter; hier wird stattdessen der Alpha-Mittelwert des Pixelblocks jeder
 * Zelle gebildet. Beide Verfahren mitteln dieselben Pixel, minimale
 * Abweichungen einzelner Randzellen sind aber möglich und akzeptiert.
 */

interface DecodedPng {
  readonly width: number;
  readonly height: number;
  readonly rgba: Uint8Array;
}

const PNG_SIGNATURE = [137, 80, 78, 71, 13, 10, 26, 10] as const;

export function decodeRgbaPng(buffer: Uint8Array): DecodedPng {
  for (const [index, byte] of PNG_SIGNATURE.entries()) {
    if (buffer[index] !== byte) {
      throw new Error("Not a PNG file.");
    }
  }

  const view = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);
  let offset = PNG_SIGNATURE.length;
  let width = 0;
  let height = 0;
  const idatParts: Uint8Array[] = [];

  while (offset + 8 <= buffer.length) {
    const length = view.getUint32(offset);
    const type = String.fromCharCode(
      buffer[offset + 4]!,
      buffer[offset + 5]!,
      buffer[offset + 6]!,
      buffer[offset + 7]!,
    );
    const dataStart = offset + 8;

    if (type === "IHDR") {
      width = view.getUint32(dataStart);
      height = view.getUint32(dataStart + 4);
      const bitDepth = buffer[dataStart + 8];
      const colorType = buffer[dataStart + 9];
      const interlace = buffer[dataStart + 12];

      if (bitDepth !== 8 || colorType !== 6 || interlace !== 0) {
        throw new Error(
          `Unsupported PNG format (bitDepth ${bitDepth}, colorType ${colorType}, ` +
            `interlace ${interlace}). Expected 8-bit RGBA without interlacing.`,
        );
      }
    } else if (type === "IDAT") {
      idatParts.push(buffer.subarray(dataStart, dataStart + length));
    } else if (type === "IEND") {
      break;
    }

    offset = dataStart + length + 4;
  }

  if (width === 0 || height === 0 || idatParts.length === 0) {
    throw new Error("PNG is missing IHDR or IDAT chunks.");
  }

  const raw = inflateSync(Buffer.concat(idatParts));
  const bytesPerPixel = 4;
  const stride = width * bytesPerPixel;
  const rgba = new Uint8Array(width * height * bytesPerPixel);

  for (let y = 0; y < height; y += 1) {
    const filterType = raw[y * (stride + 1)];
    const rowStart = y * (stride + 1) + 1;
    const outStart = y * stride;

    for (let x = 0; x < stride; x += 1) {
      const value = raw[rowStart + x]!;
      const left = x >= bytesPerPixel ? rgba[outStart + x - bytesPerPixel]! : 0;
      const above = y > 0 ? rgba[outStart - stride + x]! : 0;
      const aboveLeft =
        y > 0 && x >= bytesPerPixel
          ? rgba[outStart - stride + x - bytesPerPixel]!
          : 0;
      let reconstructed: number;

      switch (filterType) {
        case 0:
          reconstructed = value;
          break;
        case 1:
          reconstructed = value + left;
          break;
        case 2:
          reconstructed = value + above;
          break;
        case 3:
          reconstructed = value + Math.floor((left + above) / 2);
          break;
        case 4:
          reconstructed = value + paethPredictor(left, above, aboveLeft);
          break;
        default:
          throw new Error(`Unsupported PNG filter type ${filterType}.`);
      }

      rgba[outStart + x] = reconstructed & 0xff;
    }
  }

  return { width, height, rgba };
}

function paethPredictor(left: number, above: number, aboveLeft: number): number {
  const estimate = left + above - aboveLeft;
  const deltaLeft = Math.abs(estimate - left);
  const deltaAbove = Math.abs(estimate - above);
  const deltaAboveLeft = Math.abs(estimate - aboveLeft);

  if (deltaLeft <= deltaAbove && deltaLeft <= deltaAboveLeft) {
    return left;
  }

  return deltaAbove <= deltaAboveLeft ? above : aboveLeft;
}

export function terrainMaskFromPng(
  png: DecodedPng,
  cellSize: number,
): BinaryTerrainMask {
  const worldWidth = png.width;
  const worldHeight = png.height;
  const cellWidth = Math.ceil(worldWidth / cellSize);
  const cellHeight = Math.ceil(worldHeight / cellSize);
  const scaleX = png.width / cellWidth;
  const scaleY = png.height / cellHeight;

  return BinaryTerrainMask.fromWorldPredicate(
    { worldWidth, worldHeight, cellSize },
    (worldX, worldY) => {
      const cellX = Math.floor(worldX / cellSize);
      const cellY = Math.floor(worldY / cellSize);
      const pixelStartX = Math.floor(cellX * scaleX);
      const pixelEndX = Math.min(png.width, Math.ceil((cellX + 1) * scaleX));
      const pixelStartY = Math.floor(cellY * scaleY);
      const pixelEndY = Math.min(png.height, Math.ceil((cellY + 1) * scaleY));
      let alphaSum = 0;
      let pixelCount = 0;

      for (let pixelY = pixelStartY; pixelY < pixelEndY; pixelY += 1) {
        for (let pixelX = pixelStartX; pixelX < pixelEndX; pixelX += 1) {
          alphaSum += png.rgba[(pixelY * png.width + pixelX) * 4 + 3]!;
          pixelCount += 1;
        }
      }

      return pixelCount > 0 && alphaSum / pixelCount >= SOLID_ALPHA_THRESHOLD;
    },
  );
}

const maskCache = new Map<string, BinaryTerrainMask>();

/** Lädt die echte Terrainmaske einer Karte aus `public/` für headless Tests. */
export function loadTerrainMaskForMap(map: MapDefinition): BinaryTerrainMask {
  const cached = maskCache.get(map.id);

  if (cached) {
    return cloneMask(cached, map.terrainCellSize);
  }

  const diskPath = join(
    process.cwd(),
    "public",
    map.terrainPath.replace(/^[./]+/, ""),
  );
  const png = decodeRgbaPng(readFileSync(diskPath));
  const mask = terrainMaskFromPng(png, map.terrainCellSize);
  maskCache.set(map.id, mask);
  return cloneMask(mask, map.terrainCellSize);
}

function cloneMask(mask: BinaryTerrainMask, cellSize: number): BinaryTerrainMask {
  const cells = mask.copyCellData();
  const cellWidth = mask.cellWidth;

  return BinaryTerrainMask.fromWorldPredicate(
    {
      worldWidth: mask.worldWidth,
      worldHeight: mask.worldHeight,
      cellSize,
    },
    (worldX, worldY) =>
      cells[
        Math.floor(worldY / cellSize) * cellWidth + Math.floor(worldX / cellSize)
      ] === 1,
  );
}
