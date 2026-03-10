import type { Grid } from "../world/Grid";
import type { BuildingSystem } from "./BuildingSystem";
import { WORLD_TILES } from "../constants";

export enum ToolType {
  None = "none",
  Belt = "belt",
  Demolish = "demolish",
}

export class PlacementSystem {
  currentTool: ToolType = ToolType.None;
  cursorTile: { x: number; y: number } = { x: 0, y: 0 };
  isDragging: boolean = false;
  dragPath: Array<{ x: number; y: number }> = [];
  isValid: boolean = false;

  selectTool(tool: ToolType): void {
    this.currentTool = tool;
  }

  updateCursor(worldX: number, worldY: number, grid: Grid): void {
    this.cursorTile = grid.pixelToTile(worldX, worldY);
  }

  isValidPlacement(tx: number, ty: number, buildingSystem: BuildingSystem): boolean {
    // Check bounds
    if (tx < 0 || ty < 0 || tx >= WORLD_TILES || ty >= WORLD_TILES) {
      return false;
    }

    // Check nothing is occupying this tile
    if (buildingSystem.getAt(tx, ty) != null) {
      return false;
    }

    return true;
  }

  startDrag(): void {
    this.isDragging = true;
    this.dragPath = [{ x: this.cursorTile.x, y: this.cursorTile.y }];
  }

  updateDrag(): void {
    if (!this.isDragging) return;

    const last = this.dragPath[this.dragPath.length - 1];
    if (last == null) return;

    if (last.x !== this.cursorTile.x || last.y !== this.cursorTile.y) {
      this.dragPath.push({ x: this.cursorTile.x, y: this.cursorTile.y });
    }
  }

  endDrag(): { path: Array<{ x: number; y: number }>; tool: ToolType } {
    const path = this.dragPath.slice();
    const tool = this.currentTool;

    this.isDragging = false;
    this.dragPath = [];

    return { path, tool };
  }
}
