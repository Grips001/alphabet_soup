import Phaser from "phaser";
import { ITEM_SIZE, DEPTH_ITEMS, LETTER_COLORS } from "../constants";
import type { BeltSystem } from "../systems/BeltSystem";
import type { Grid } from "../world/Grid";
import type { DebugOverlay } from "../ui/DebugOverlay";
import type { LetterItem } from "../entities/LetterItem";

const ITEM_TEXT_COLOR = "#1a1a1a";

export class ItemRenderer {
  private scene: Phaser.Scene;
  private beltSystem: BeltSystem;
  private grid: Grid;
  private debugOverlay: DebugOverlay;
  private itemContainers: Map<LetterItem, Phaser.GameObjects.Container> = new Map();

  constructor(scene: Phaser.Scene, beltSystem: BeltSystem, grid: Grid, debugOverlay: DebugOverlay) {
    this.scene = scene;
    this.beltSystem = beltSystem;
    this.grid = grid;
    this.debugOverlay = debugOverlay;
  }

  /**
   * Synchronize rendered items with simulation state.
   * Call once per tick (inside the tick callback) after belt system has run.
   */
  syncItems(): void {
    // Collect all currently active items from belts
    const activeItems = new Set<LetterItem>();

    // Iterate through all belt system belts
    const allBelts = this.getAllBelts();
    for (const belt of allBelts) {
      if (belt.item != null) {
        activeItems.add(belt.item);
      }
    }

    // Create containers for new items
    for (const item of activeItems) {
      if (!this.itemContainers.has(item)) {
        this.createItemContainer(item);
      }
    }

    // Destroy containers for items no longer on any belt
    for (const [item, container] of this.itemContainers) {
      if (!activeItems.has(item)) {
        container.destroy();
        this.itemContainers.delete(item);
      }
    }
  }

  private createItemContainer(item: LetterItem): void {
    const startPos = this.grid.tileToCenter(item.tile.x, item.tile.y);
    const container = this.scene.add.container(startPos.x, startPos.y);
    container.setDepth(DEPTH_ITEMS);

    // Colored rectangle background
    const color = LETTER_COLORS[item.letter] ?? 0xcccccc;
    const bg = this.scene.add.rectangle(0, 0, ITEM_SIZE, ITEM_SIZE, color);
    bg.setStrokeStyle(1, 0x333333);
    container.add(bg);

    // Letter text centered on rectangle
    const label = this.scene.add.text(0, 0, item.letter, {
      fontFamily: "monospace",
      fontSize: "10px",
      fontStyle: "bold",
      color: ITEM_TEXT_COLOR,
    });
    label.setOrigin(0.5, 0.5);
    container.add(label);

    this.debugOverlay.ignoreOnUiCamera(container);
    this.itemContainers.set(item, container);
  }

  /**
   * Interpolate item positions for smooth visual movement between ticks.
   * Call every frame from GameScene.update() with tickEngine.alpha.
   */
  update(alpha: number): void {
    for (const [item, container] of this.itemContainers) {
      const from = this.grid.tileToCenter(item.previousTile.x, item.previousTile.y);
      const to = this.grid.tileToCenter(item.tile.x, item.tile.y);

      container.x = from.x + (to.x - from.x) * alpha;
      container.y = from.y + (to.y - from.y) * alpha;
    }
  }

  removeItem(item: LetterItem): void {
    const container = this.itemContainers.get(item);
    if (container != null) {
      container.destroy();
      this.itemContainers.delete(item);
    }
  }

  destroy(): void {
    for (const container of this.itemContainers.values()) {
      container.destroy();
    }
    this.itemContainers.clear();
  }

  private getAllBelts(): readonly import("../entities/Belt").Belt[] {
    return this.beltSystem.getAllBelts();
  }
}
