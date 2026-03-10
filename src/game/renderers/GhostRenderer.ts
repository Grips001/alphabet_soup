import Phaser from "phaser";
import { TILE_SIZE, DEPTH_GHOST } from "../constants";
import type { Grid } from "../world/Grid";
import type { PlacementSystem } from "../systems/PlacementSystem";
import { ToolType } from "../systems/PlacementSystem";
import type { BuildingSystem } from "../systems/BuildingSystem";

const GHOST_ALPHA = 0.5;
const COLOR_VALID = 0x00ff00;
const COLOR_INVALID = 0xff0000;
const COLOR_DEMOLISH = 0xff4444;

export class GhostRenderer {
  private scene: Phaser.Scene;
  private grid: Grid;

  private ghostRect: Phaser.GameObjects.Rectangle;
  private invalidOverlay: Phaser.GameObjects.Graphics;

  constructor(scene: Phaser.Scene, grid: Grid) {
    this.scene = scene;
    this.grid = grid;

    // Ghost rectangle — belt-tile sized
    this.ghostRect = scene.add.rectangle(0, 0, TILE_SIZE, TILE_SIZE, COLOR_VALID);
    this.ghostRect.setAlpha(GHOST_ALPHA);
    this.ghostRect.setDepth(DEPTH_GHOST);
    this.ghostRect.setVisible(false);

    // Invalid X overlay
    this.invalidOverlay = scene.add.graphics();
    this.invalidOverlay.setDepth(DEPTH_GHOST + 1);
    this.invalidOverlay.setVisible(false);
  }

  /** Update ghost position and validity tint. Call every frame. */
  update(placementSystem: PlacementSystem, buildingSystem: BuildingSystem): void {
    const tool = placementSystem.currentTool;

    if (tool === ToolType.None) {
      this.ghostRect.setVisible(false);
      this.invalidOverlay.setVisible(false);
      return;
    }

    const { x: tx, y: ty } = placementSystem.cursorTile;
    const center = this.grid.tileToCenter(tx, ty);

    this.ghostRect.setPosition(center.x, center.y);
    this.ghostRect.setVisible(true);

    if (tool === ToolType.Belt) {
      const valid = placementSystem.isValidPlacement(tx, ty, buildingSystem);

      if (valid) {
        this.ghostRect.setFillStyle(COLOR_VALID);
        this.invalidOverlay.setVisible(false);
      } else {
        this.ghostRect.setFillStyle(COLOR_INVALID);
        this.invalidOverlay.setPosition(center.x, center.y);
        this.invalidOverlay.setVisible(true);
        this.drawInvalidX();
      }
    } else if (tool === ToolType.Demolish) {
      // Always show red for demolish
      this.ghostRect.setFillStyle(COLOR_DEMOLISH);
      this.invalidOverlay.setPosition(center.x, center.y);
      this.invalidOverlay.setVisible(true);
      this.drawDemolishX();
    }
  }

  private drawInvalidX(): void {
    this.invalidOverlay.clear();
    const half = TILE_SIZE / 2 - 4;
    this.invalidOverlay.lineStyle(2, 0xffffff, 0.9);
    this.invalidOverlay.beginPath();
    this.invalidOverlay.moveTo(-half, -half);
    this.invalidOverlay.lineTo(half, half);
    this.invalidOverlay.moveTo(half, -half);
    this.invalidOverlay.lineTo(-half, half);
    this.invalidOverlay.strokePath();
  }

  private drawDemolishX(): void {
    this.invalidOverlay.clear();
    const half = TILE_SIZE / 2 - 4;
    this.invalidOverlay.lineStyle(2.5, 0xffffff, 0.9);
    this.invalidOverlay.beginPath();
    this.invalidOverlay.moveTo(-half, -half);
    this.invalidOverlay.lineTo(half, half);
    this.invalidOverlay.moveTo(half, -half);
    this.invalidOverlay.lineTo(-half, half);
    this.invalidOverlay.strokePath();
  }

  destroy(): void {
    this.ghostRect.destroy();
    this.invalidOverlay.destroy();
  }
}
