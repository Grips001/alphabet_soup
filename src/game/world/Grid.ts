import { TILE_SIZE, WORLD_TILES } from "../constants";

export class Grid {
  private readonly _width: number;
  private readonly _height: number;
  private readonly tiles: Uint8Array;

  constructor(width: number = WORLD_TILES, height: number = WORLD_TILES) {
    this._width = width;
    this._height = height;
    this.tiles = new Uint8Array(width * height);
  }

  /** Grid width in tiles */
  get width(): number {
    return this._width;
  }

  /** Grid height in tiles */
  get height(): number {
    return this._height;
  }

  /** Check if grid coordinates are within bounds */
  isInBounds(x: number, y: number): boolean {
    return x >= 0 && x < this._width && y >= 0 && y < this._height;
  }

  /** Get tile value at grid coordinates. Returns 0 for out-of-bounds. */
  getTile(x: number, y: number): number {
    if (!this.isInBounds(x, y)) return 0;
    return this.tiles[y * this._width + x];
  }

  /** Set tile value at grid coordinates. No-op for out-of-bounds. */
  setTile(x: number, y: number, value: number): void {
    if (!this.isInBounds(x, y)) return;
    this.tiles[y * this._width + x] = value;
  }

  /** Convert pixel coordinates to tile coordinates (floor division) */
  pixelToTile(px: number, py: number): { x: number; y: number } {
    return {
      x: Math.floor(px / TILE_SIZE),
      y: Math.floor(py / TILE_SIZE),
    };
  }

  /** Convert tile coordinates to top-left pixel coordinates */
  tileToPixel(tx: number, ty: number): { x: number; y: number } {
    return {
      x: tx * TILE_SIZE,
      y: ty * TILE_SIZE,
    };
  }

  /** Convert tile coordinates to center pixel coordinates */
  tileToCenter(tx: number, ty: number): { x: number; y: number } {
    return {
      x: tx * TILE_SIZE + TILE_SIZE / 2,
      y: ty * TILE_SIZE + TILE_SIZE / 2,
    };
  }
}
