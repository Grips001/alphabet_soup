export const TILE_SIZE = 32;
export const WORLD_TILES = 64;
export const WORLD_SIZE = TILE_SIZE * WORLD_TILES; // 2048
export const TICK_RATE = 15; // ticks per second
export const ZOOM_MIN = 1.0;
export const ZOOM_MAX = 3.0;
export const ZOOM_STEP = 0.15;
export const ZOOM_LERP = 0.12;
export const CAMERA_ACCELERATION = 0.08;
export const CAMERA_DRAG = 0.003;
export const CAMERA_MAX_SPEED = 0.5;

// --- Phase 2: Tile type codes ---
export const TILE_EMPTY = 0;
export const TILE_QUARRY = 1;
export const TILE_BELT_N = 2;
export const TILE_BELT_S = 3;
export const TILE_BELT_E = 4;
export const TILE_BELT_W = 5;
export const TILE_BELT_CORNER_NE = 6;
export const TILE_BELT_CORNER_NW = 7;
export const TILE_BELT_CORNER_SE = 8;
export const TILE_BELT_CORNER_SW = 9;

// --- Phase 2: Production ---
export const QUARRY_PRODUCTION_INTERVAL = 30; // ticks (~2s at 15tps)
export const BELT_SPEED = 1; // tiles per tick

// --- Phase 2: Rendering ---
export const ITEM_SIZE = 16; // pixels, half of TILE_SIZE

// --- Phase 2: Depth layers ---
export const DEPTH_GROUND = 0;
export const DEPTH_GRID_LINES = 1;
export const DEPTH_BUILDINGS = 10;
export const DEPTH_ITEMS = 20;
export const DEPTH_GHOST = 30;
export const DEPTH_UI = 1000;

// --- Phase 2: Letter colors (warm-toned palette, distinct per letter) ---
// Values are 0xRRGGBB hex numbers, chosen for dark-text readability
export const LETTER_COLORS: Record<string, number> = {
  A: 0xe8a87c, // amber
  B: 0xa8c5a0, // sage green
  C: 0xe8c87c, // warm yellow
  D: 0xc5a8d4, // dusty lavender
  E: 0xf0b89a, // peach
  F: 0xa8c8d4, // slate blue
  G: 0xd4b8a8, // warm beige
  H: 0xe8b4b8, // dusty rose
  I: 0xb8d4c8, // mint
  J: 0xd4c8a8, // tan
  K: 0xc8a8b8, // mauve
  L: 0xa8b8d4, // periwinkle
  M: 0xd4a8a8, // terracotta rose
  N: 0xb4d4a8, // light sage
  O: 0xe8d4a8, // cream amber
  P: 0xc8b8d4, // soft violet
  Q: 0xd4c8b8, // warm grey
  R: 0xe8c4a0, // warm sand
  S: 0xa8d4c0, // seafoam
  T: 0xd4b8c8, // pinkish lavender
  U: 0xb8c8d4, // sky blue
  V: 0xd4d4a8, // olive cream
  W: 0xc8d4b8, // light fern
  X: 0xd4a8c0, // rose mauve
  Y: 0xe8d8b0, // pale gold
  Z: 0xb0c8c0, // cool mint
};
