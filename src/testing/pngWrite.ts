import { crc32, deflateSync } from "node:zlib";

/**
 * Minimaler PNG-Encoder (8-Bit-RGBA, kein Interlacing, Filter 0) als
 * Gegenstück zu `decodeRgbaPng` – für Werkzeuge, die Spritesheets
 * rechnerisch korrigieren (Task 025). Nur für Node-Testwerkzeuge gedacht.
 */
export function encodeRgbaPng(
  width: number,
  height: number,
  rgba: Uint8Array,
): Buffer {
  if (rgba.length !== width * height * 4) {
    throw new Error("RGBA buffer does not match the given dimensions.");
  }

  const stride = width * 4;
  const raw = Buffer.alloc(height * (stride + 1));

  for (let y = 0; y < height; y += 1) {
    raw[y * (stride + 1)] = 0;
    raw.set(rgba.subarray(y * stride, (y + 1) * stride), y * (stride + 1) + 1);
  }

  const header = Buffer.alloc(13);
  header.writeUInt32BE(width, 0);
  header.writeUInt32BE(height, 4);
  header[8] = 8; // Bittiefe
  header[9] = 6; // Farbtyp RGBA
  header[10] = 0;
  header[11] = 0;
  header[12] = 0;

  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    buildChunk("IHDR", header),
    buildChunk("IDAT", deflateSync(raw, { level: 9 })),
    buildChunk("IEND", Buffer.alloc(0)),
  ]);
}

function buildChunk(type: string, data: Buffer): Buffer {
  const chunk = Buffer.alloc(12 + data.length);
  chunk.writeUInt32BE(data.length, 0);
  chunk.write(type, 4, "ascii");
  data.copy(chunk, 8);
  chunk.writeUInt32BE(
    crc32(chunk.subarray(4, 8 + data.length)) >>> 0,
    8 + data.length,
  );
  return chunk;
}
