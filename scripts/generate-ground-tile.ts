/**
 * Generate a 32x32 pixel art ground tile PNG.
 * Warm amber/cream base with subtle pixel noise for retro SNES aesthetic.
 * Run with: bun scripts/generate-ground-tile.ts
 */

// Minimal PNG encoder - writes a valid 32x32 RGBA PNG
const WIDTH = 32;
const HEIGHT = 32;

// Base colors - warm amber/cream palette
const BASE_COLORS = [
  [212, 165, 116], // #d4a574 - primary warm amber
  [218, 172, 124], // #daac7c - slightly lighter
  [206, 158, 108], // #ce9e6c - slightly darker
  [224, 178, 130], // #e0b282 - highlight
  [200, 152, 102], // #c89866 - shadow
];

// Seeded PRNG for reproducibility
let seed = 42;
function random(): number {
  seed = (seed * 1664525 + 1013904223) & 0xffffffff;
  return (seed >>> 0) / 0xffffffff;
}

// Generate pixel data (RGBA)
const pixels = new Uint8Array(WIDTH * HEIGHT * 4);

for (let y = 0; y < HEIGHT; y++) {
  for (let x = 0; x < WIDTH; x++) {
    const idx = (y * WIDTH + x) * 4;
    const colorIdx = Math.floor(random() * BASE_COLORS.length);
    const [r, g, b] = BASE_COLORS[colorIdx];

    // Add subtle per-pixel noise (+/- 5)
    const noise = Math.floor(random() * 11) - 5;

    pixels[idx] = Math.max(0, Math.min(255, r + noise));
    pixels[idx + 1] = Math.max(0, Math.min(255, g + noise));
    pixels[idx + 2] = Math.max(0, Math.min(255, b + noise));
    pixels[idx + 3] = 255; // fully opaque
  }
}

// Make edges tile seamlessly by blending a 2px border
for (let i = 0; i < 2; i++) {
  for (let j = 0; j < HEIGHT; j++) {
    // Left-right seam
    const leftIdx = (j * WIDTH + i) * 4;
    const rightIdx = (j * WIDTH + (WIDTH - 1 - i)) * 4;
    const avgR = Math.round((pixels[leftIdx] + pixels[rightIdx]) / 2);
    const avgG = Math.round((pixels[leftIdx + 1] + pixels[rightIdx + 1]) / 2);
    const avgB = Math.round((pixels[leftIdx + 2] + pixels[rightIdx + 2]) / 2);
    pixels[leftIdx] = avgR; pixels[leftIdx + 1] = avgG; pixels[leftIdx + 2] = avgB;
    pixels[rightIdx] = avgR; pixels[rightIdx + 1] = avgG; pixels[rightIdx + 2] = avgB;
  }
  for (let j = 0; j < WIDTH; j++) {
    // Top-bottom seam
    const topIdx = (i * WIDTH + j) * 4;
    const botIdx = ((HEIGHT - 1 - i) * WIDTH + j) * 4;
    const avgR = Math.round((pixels[topIdx] + pixels[botIdx]) / 2);
    const avgG = Math.round((pixels[topIdx + 1] + pixels[botIdx + 1]) / 2);
    const avgB = Math.round((pixels[topIdx + 2] + pixels[botIdx + 2]) / 2);
    pixels[topIdx] = avgR; pixels[topIdx + 1] = avgG; pixels[topIdx + 2] = avgB;
    pixels[botIdx] = avgR; pixels[botIdx + 1] = avgG; pixels[botIdx + 2] = avgB;
  }
}

// === PNG Encoder ===
import { deflateSync } from "node:zlib";

function crc32(buf: Uint8Array): number {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc ^= buf[i];
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function makeChunk(type: string, data: Uint8Array): Uint8Array {
  const typeBytes = new TextEncoder().encode(type);
  const len = data.length;
  const chunk = new Uint8Array(4 + 4 + len + 4);
  const view = new DataView(chunk.buffer);
  view.setUint32(0, len);
  chunk.set(typeBytes, 4);
  chunk.set(data, 8);
  // CRC over type + data
  const crcInput = new Uint8Array(4 + len);
  crcInput.set(typeBytes);
  crcInput.set(data, 4);
  view.setUint32(8 + len, crc32(crcInput));
  return chunk;
}

// IHDR
const ihdr = new Uint8Array(13);
const ihdrView = new DataView(ihdr.buffer);
ihdrView.setUint32(0, WIDTH);
ihdrView.setUint32(4, HEIGHT);
ihdr[8] = 8; // bit depth
ihdr[9] = 6; // color type: RGBA
ihdr[10] = 0; // compression
ihdr[11] = 0; // filter
ihdr[12] = 0; // interlace

// IDAT - filter rows with filter byte 0 (None)
const rawData = new Uint8Array(HEIGHT * (1 + WIDTH * 4));
for (let y = 0; y < HEIGHT; y++) {
  rawData[y * (1 + WIDTH * 4)] = 0; // filter byte
  rawData.set(
    pixels.subarray(y * WIDTH * 4, (y + 1) * WIDTH * 4),
    y * (1 + WIDTH * 4) + 1
  );
}
const compressed = deflateSync(Buffer.from(rawData));

// Build PNG
const signature = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]);
const ihdrChunk = makeChunk("IHDR", ihdr);
const idatChunk = makeChunk("IDAT", new Uint8Array(compressed));
const iendChunk = makeChunk("IEND", new Uint8Array(0));

const png = new Uint8Array(
  signature.length + ihdrChunk.length + idatChunk.length + iendChunk.length
);
let offset = 0;
png.set(signature, offset); offset += signature.length;
png.set(ihdrChunk, offset); offset += ihdrChunk.length;
png.set(idatChunk, offset); offset += idatChunk.length;
png.set(iendChunk, offset);

const outPath = new URL("../public/assets/tiles/ground.png", import.meta.url).pathname;
// On Windows/MSYS the path may start with /C: -- normalize
const normalizedPath = outPath.replace(/^\/([A-Z]:)/, "$1");
await Bun.write(normalizedPath, png);
console.log(`Generated ground tile: ${normalizedPath} (${png.length} bytes)`);
