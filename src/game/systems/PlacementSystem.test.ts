import { describe, it, expect, beforeEach } from "vitest";
import { PlacementSystem, ToolType } from "./PlacementSystem";
import { Grid } from "../world/Grid";
import { BuildingSystem } from "./BuildingSystem";
import { TILE_SIZE } from "../constants";

describe("PlacementSystem", () => {
  let placement: PlacementSystem;
  let grid: Grid;
  let buildingSystem: BuildingSystem;

  beforeEach(() => {
    placement = new PlacementSystem();
    grid = new Grid();
    buildingSystem = new BuildingSystem();
  });

  describe("tool selection", () => {
    it("starts with ToolType.None as default", () => {
      expect(placement.currentTool).toBe(ToolType.None);
    });

    it("selectTool(Belt) sets currentTool to Belt", () => {
      placement.selectTool(ToolType.Belt);
      expect(placement.currentTool).toBe(ToolType.Belt);
    });

    it("selectTool(None) deselects (ESC behavior)", () => {
      placement.selectTool(ToolType.Belt);
      placement.selectTool(ToolType.None);
      expect(placement.currentTool).toBe(ToolType.None);
    });

    it("selectTool(Demolish) sets currentTool to Demolish", () => {
      placement.selectTool(ToolType.Demolish);
      expect(placement.currentTool).toBe(ToolType.Demolish);
    });
  });

  describe("cursor tracking", () => {
    it("updateCursor converts world pixel to tile coords", () => {
      const worldX = TILE_SIZE * 3 + 5; // tile 3, pixel offset 5
      const worldY = TILE_SIZE * 7 + 10; // tile 7, pixel offset 10
      placement.updateCursor(worldX, worldY, grid);
      expect(placement.cursorTile).toEqual({ x: 3, y: 7 });
    });

    it("updateCursor snaps to tile boundaries", () => {
      placement.updateCursor(0, 0, grid);
      expect(placement.cursorTile).toEqual({ x: 0, y: 0 });
    });

    it("isValidPlacement returns true for empty tile with belt tool", () => {
      placement.selectTool(ToolType.Belt);
      placement.updateCursor(TILE_SIZE * 5, TILE_SIZE * 5, grid);
      expect(placement.isValidPlacement(5, 5, buildingSystem)).toBe(true);
    });

    it("isValidPlacement returns false for occupied tile", () => {
      placement.selectTool(ToolType.Belt);

      // Place a building at tile (5,5)
      const mockBuilding = {
        type: "test",
        occupiedTiles: () => [{ x: 5, y: 5 }],
      };
      buildingSystem.place(mockBuilding);

      expect(placement.isValidPlacement(5, 5, buildingSystem)).toBe(false);
    });

    it("isValidPlacement returns false for out-of-bounds tile", () => {
      placement.selectTool(ToolType.Belt);
      expect(placement.isValidPlacement(-1, 0, buildingSystem)).toBe(false);
      expect(placement.isValidPlacement(0, -1, buildingSystem)).toBe(false);
      expect(placement.isValidPlacement(100, 0, buildingSystem)).toBe(false);
      expect(placement.isValidPlacement(0, 100, buildingSystem)).toBe(false);
    });

    it("isValidPlacement returns false for quarry tile (any occupied building)", () => {
      placement.selectTool(ToolType.Belt);

      // Quarry at tile (10, 10)
      const quarry = {
        type: "quarry",
        occupiedTiles: () => [
          { x: 10, y: 10 },
          { x: 11, y: 10 },
          { x: 10, y: 11 },
          { x: 11, y: 11 },
        ],
      };
      buildingSystem.place(quarry);

      expect(placement.isValidPlacement(10, 10, buildingSystem)).toBe(false);
      expect(placement.isValidPlacement(11, 10, buildingSystem)).toBe(false);
    });
  });

  describe("drag state", () => {
    it("startDrag sets isDragging to true and initializes dragPath with cursorTile", () => {
      placement.selectTool(ToolType.Belt);
      placement.updateCursor(TILE_SIZE * 3, TILE_SIZE * 4, grid);
      placement.startDrag();
      expect(placement.isDragging).toBe(true);
      expect(placement.dragPath).toEqual([{ x: 3, y: 4 }]);
    });

    it("updateDrag appends new tile to dragPath", () => {
      placement.selectTool(ToolType.Belt);
      placement.updateCursor(TILE_SIZE * 3, TILE_SIZE * 4, grid);
      placement.startDrag();
      placement.updateCursor(TILE_SIZE * 4, TILE_SIZE * 4, grid);
      placement.updateDrag();
      expect(placement.dragPath).toEqual([
        { x: 3, y: 4 },
        { x: 4, y: 4 },
      ]);
    });

    it("updateDrag does not duplicate the same tile", () => {
      placement.selectTool(ToolType.Belt);
      placement.updateCursor(TILE_SIZE * 3, TILE_SIZE * 4, grid);
      placement.startDrag();
      // cursor stays at same tile
      placement.updateDrag();
      placement.updateDrag();
      expect(placement.dragPath).toEqual([{ x: 3, y: 4 }]);
    });

    it("endDrag returns the dragPath and tool, then resets state", () => {
      placement.selectTool(ToolType.Belt);
      placement.updateCursor(TILE_SIZE * 2, TILE_SIZE * 2, grid);
      placement.startDrag();
      placement.updateCursor(TILE_SIZE * 3, TILE_SIZE * 2, grid);
      placement.updateDrag();
      const result = placement.endDrag();
      expect(result.path).toEqual([
        { x: 2, y: 2 },
        { x: 3, y: 2 },
      ]);
      expect(result.tool).toBe(ToolType.Belt);
      expect(placement.isDragging).toBe(false);
      expect(placement.dragPath).toEqual([]);
    });

    it("endDrag with tool=None returns empty path", () => {
      // No tool selected, no drag
      const result = placement.endDrag();
      expect(result.path).toEqual([]);
      expect(result.tool).toBe(ToolType.None);
    });
  });

  describe("demolish tool drag", () => {
    it("startDrag with Demolish tool initializes demolishPath with cursorTile", () => {
      placement.selectTool(ToolType.Demolish);
      placement.updateCursor(TILE_SIZE * 5, TILE_SIZE * 5, grid);
      placement.startDrag();
      expect(placement.isDragging).toBe(true);
      expect(placement.dragPath).toEqual([{ x: 5, y: 5 }]);
    });

    it("updateDrag with Demolish tool accumulates tiles to demolish", () => {
      placement.selectTool(ToolType.Demolish);
      placement.updateCursor(TILE_SIZE * 5, TILE_SIZE * 5, grid);
      placement.startDrag();
      placement.updateCursor(TILE_SIZE * 6, TILE_SIZE * 5, grid);
      placement.updateDrag();
      placement.updateCursor(TILE_SIZE * 7, TILE_SIZE * 5, grid);
      placement.updateDrag();
      expect(placement.dragPath).toEqual([
        { x: 5, y: 5 },
        { x: 6, y: 5 },
        { x: 7, y: 5 },
      ]);
    });

    it("endDrag with Demolish tool returns tiles to demolish", () => {
      placement.selectTool(ToolType.Demolish);
      placement.updateCursor(TILE_SIZE * 5, TILE_SIZE * 5, grid);
      placement.startDrag();
      placement.updateCursor(TILE_SIZE * 6, TILE_SIZE * 5, grid);
      placement.updateDrag();
      const result = placement.endDrag();
      expect(result.tool).toBe(ToolType.Demolish);
      expect(result.path).toEqual([
        { x: 5, y: 5 },
        { x: 6, y: 5 },
      ]);
    });
  });
});
