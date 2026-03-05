import { describe, it, expect } from "vitest";
import { Grid } from "./Grid";
import { TILE_SIZE } from "../constants";

describe("Grid", () => {
  it("constructor creates a width x height grid initialized to empty (0)", () => {
    const grid = new Grid(4, 4);
    for (let y = 0; y < 4; y++) {
      for (let x = 0; x < 4; x++) {
        expect(grid.getTile(x, y)).toBe(0);
      }
    }
  });

  it("getTile returns tile value at grid coordinates", () => {
    const grid = new Grid(4, 4);
    // All tiles should be 0 initially
    expect(grid.getTile(0, 0)).toBe(0);
    expect(grid.getTile(3, 3)).toBe(0);
  });

  it("setTile sets tile value and getTile retrieves it", () => {
    const grid = new Grid(4, 4);
    grid.setTile(1, 2, 5);
    expect(grid.getTile(1, 2)).toBe(5);

    grid.setTile(0, 0, 255);
    expect(grid.getTile(0, 0)).toBe(255);
  });

  it("isInBounds returns true for valid coordinates, false for out-of-bounds", () => {
    const grid = new Grid(4, 4);
    expect(grid.isInBounds(0, 0)).toBe(true);
    expect(grid.isInBounds(3, 3)).toBe(true);
    expect(grid.isInBounds(2, 1)).toBe(true);

    expect(grid.isInBounds(-1, 0)).toBe(false);
    expect(grid.isInBounds(0, -1)).toBe(false);
    expect(grid.isInBounds(4, 0)).toBe(false);
    expect(grid.isInBounds(0, 4)).toBe(false);
    expect(grid.isInBounds(100, 100)).toBe(false);
  });

  it("pixelToTile converts pixel coords to tile coords via floor division", () => {
    const grid = new Grid(4, 4);
    // Pixel (0, 0) -> Tile (0, 0)
    expect(grid.pixelToTile(0, 0)).toEqual({ x: 0, y: 0 });

    // Pixel (TILE_SIZE - 1, TILE_SIZE - 1) -> Tile (0, 0) (still in first tile)
    expect(grid.pixelToTile(TILE_SIZE - 1, TILE_SIZE - 1)).toEqual({ x: 0, y: 0 });

    // Pixel (TILE_SIZE, TILE_SIZE) -> Tile (1, 1)
    expect(grid.pixelToTile(TILE_SIZE, TILE_SIZE)).toEqual({ x: 1, y: 1 });

    // Pixel (TILE_SIZE * 2 + 10, TILE_SIZE * 3 + 5) -> Tile (2, 3)
    expect(grid.pixelToTile(TILE_SIZE * 2 + 10, TILE_SIZE * 3 + 5)).toEqual({ x: 2, y: 3 });
  });

  it("tileToPixel converts tile coords to top-left pixel coords", () => {
    const grid = new Grid(4, 4);
    expect(grid.tileToPixel(0, 0)).toEqual({ x: 0, y: 0 });
    expect(grid.tileToPixel(1, 1)).toEqual({ x: TILE_SIZE, y: TILE_SIZE });
    expect(grid.tileToPixel(3, 2)).toEqual({ x: TILE_SIZE * 3, y: TILE_SIZE * 2 });
  });

  it("out-of-bounds getTile returns 0 and setTile is a no-op", () => {
    const grid = new Grid(4, 4);
    // getTile out of bounds returns default 0
    expect(grid.getTile(-1, 0)).toBe(0);
    expect(grid.getTile(0, -1)).toBe(0);
    expect(grid.getTile(4, 0)).toBe(0);
    expect(grid.getTile(0, 4)).toBe(0);

    // setTile out of bounds is a no-op (no crash)
    grid.setTile(-1, 0, 5);
    grid.setTile(4, 0, 5);
    // Nearby valid tiles should be unaffected
    expect(grid.getTile(0, 0)).toBe(0);
    expect(grid.getTile(3, 0)).toBe(0);
  });

  it("tileToCenter returns center pixel of tile", () => {
    const grid = new Grid(4, 4);
    const half = TILE_SIZE / 2;
    expect(grid.tileToCenter(0, 0)).toEqual({ x: half, y: half });
    expect(grid.tileToCenter(1, 1)).toEqual({ x: TILE_SIZE + half, y: TILE_SIZE + half });
    expect(grid.tileToCenter(2, 3)).toEqual({ x: TILE_SIZE * 2 + half, y: TILE_SIZE * 3 + half });
  });

  it("width and height accessors return grid dimensions", () => {
    const grid = new Grid(10, 20);
    expect(grid.width).toBe(10);
    expect(grid.height).toBe(20);
  });

  it("uses default WORLD_TILES when no arguments provided", () => {
    const grid = new Grid();
    expect(grid.width).toBe(64);
    expect(grid.height).toBe(64);
  });
});
