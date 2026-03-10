import Phaser from "phaser";
import { TILE_SIZE, DEPTH_BUILDINGS } from "../constants";
import type { BeltSystem } from "../systems/BeltSystem";
import type { DebugOverlay } from "../ui/DebugOverlay";
import { Belt, BeltDirection, BeltVariant } from "../entities/Belt";

const BELT_COLOR = 0x7a7a8a;
const CHEVRON_COLOR = 0xaaaacc;
const CHEVRON_DARK = 0x555566;

/** Pixel speed at which chevron animation scrolls (px per ms) */
const CHEVRON_SPEED = 0.02;

export class BeltRenderer {
  private scene: Phaser.Scene;
  private beltSystem: BeltSystem;
  private debugOverlay: DebugOverlay;
  private containers: Map<string, Phaser.GameObjects.Container> = new Map();

  constructor(scene: Phaser.Scene, beltSystem: BeltSystem, debugOverlay: DebugOverlay) {
    this.scene = scene;
    this.beltSystem = beltSystem;
    this.debugOverlay = debugOverlay;
  }

  addBelt(belt: Belt): void {
    const key = `${belt.tileX},${belt.tileY}`;
    if (this.containers.has(key)) return;

    const centerX = belt.tileX * TILE_SIZE + TILE_SIZE / 2;
    const centerY = belt.tileY * TILE_SIZE + TILE_SIZE / 2;

    const container = this.scene.add.container(centerX, centerY);
    container.setDepth(DEPTH_BUILDINGS);

    // Base rectangle
    const base = this.scene.add.rectangle(0, 0, TILE_SIZE, TILE_SIZE, BELT_COLOR);
    container.add(base);

    // Directional chevron graphics
    const chevrons = this.scene.add.graphics();
    this.drawChevrons(chevrons, belt.direction, belt.variant, 0);
    container.add(chevrons);

    this.debugOverlay.ignoreOnUiCamera(container);
    this.containers.set(key, container);
  }

  removeBelt(x: number, y: number): void {
    const key = `${x},${y}`;
    const container = this.containers.get(key);
    if (container != null) {
      container.destroy();
      this.containers.delete(key);
    }
  }

  update(time: number): void {
    // Animate chevrons by scrolling their offset using time modulo
    for (const [key, container] of this.containers) {
      const [tx, ty] = key.split(",").map(Number);
      const belt = this.beltSystem.getBeltAt(tx, ty);
      if (belt == null) continue;

      // Get the chevrons graphics (second child at index 1)
      const chevrons = container.getAt(1) as Phaser.GameObjects.Graphics;
      if (chevrons == null) continue;

      // Scroll offset cycles between 0 and TILE_SIZE
      const offset = (time * CHEVRON_SPEED) % TILE_SIZE;
      chevrons.clear();
      this.drawChevrons(chevrons, belt.direction, belt.variant, offset);
    }
  }

  private drawChevrons(
    graphics: Phaser.GameObjects.Graphics,
    direction: BeltDirection,
    variant: BeltVariant,
    offset: number
  ): void {
    graphics.lineStyle(2, CHEVRON_COLOR, 1);

    const halfTile = TILE_SIZE / 2;
    const chevronSpacing = TILE_SIZE / 3;

    if (variant === BeltVariant.StraightNS) {
      // Vertical chevrons scrolling north or south
      const scrollDir = direction === BeltDirection.South ? 1 : -1;
      const scrolledOffset = ((offset * scrollDir) % TILE_SIZE + TILE_SIZE) % TILE_SIZE;

      for (let i = -1; i <= 2; i++) {
        const py = -halfTile + i * chevronSpacing + scrolledOffset;
        if (py < -halfTile - 4 || py > halfTile + 4) continue;
        graphics.beginPath();
        graphics.moveTo(-halfTile + 4, py - 4);
        graphics.lineTo(0, py + 4);
        graphics.lineTo(halfTile - 4, py - 4);
        graphics.strokePath();
      }
    } else if (variant === BeltVariant.StraightEW) {
      // Horizontal chevrons scrolling east or west
      const scrollDir = direction === BeltDirection.East ? 1 : -1;
      const scrolledOffset = ((offset * scrollDir) % TILE_SIZE + TILE_SIZE) % TILE_SIZE;

      for (let i = -1; i <= 2; i++) {
        const px = -halfTile + i * chevronSpacing + scrolledOffset;
        if (px < -halfTile - 4 || px > halfTile + 4) continue;
        graphics.beginPath();
        graphics.moveTo(px - 4, -halfTile + 4);
        graphics.lineTo(px + 4, 0);
        graphics.lineTo(px - 4, halfTile - 4);
        graphics.strokePath();
      }
    } else {
      // Corner belts — draw a single curved arc indicator
      graphics.lineStyle(2, CHEVRON_COLOR, 0.8);

      // Small diagonal arrow based on corner type
      const arrowLen = 8;
      switch (variant) {
        case BeltVariant.CornerNE:
          graphics.beginPath();
          graphics.moveTo(-arrowLen / 2, arrowLen / 2);
          graphics.lineTo(arrowLen / 2, -arrowLen / 2);
          graphics.strokePath();
          this.drawArrowHead(graphics, arrowLen / 2, -arrowLen / 2, -45);
          break;
        case BeltVariant.CornerNW:
          graphics.beginPath();
          graphics.moveTo(arrowLen / 2, arrowLen / 2);
          graphics.lineTo(-arrowLen / 2, -arrowLen / 2);
          graphics.strokePath();
          this.drawArrowHead(graphics, -arrowLen / 2, -arrowLen / 2, -135);
          break;
        case BeltVariant.CornerSE:
          graphics.beginPath();
          graphics.moveTo(-arrowLen / 2, -arrowLen / 2);
          graphics.lineTo(arrowLen / 2, arrowLen / 2);
          graphics.strokePath();
          this.drawArrowHead(graphics, arrowLen / 2, arrowLen / 2, 45);
          break;
        case BeltVariant.CornerSW:
          graphics.beginPath();
          graphics.moveTo(arrowLen / 2, -arrowLen / 2);
          graphics.lineTo(-arrowLen / 2, arrowLen / 2);
          graphics.strokePath();
          this.drawArrowHead(graphics, -arrowLen / 2, arrowLen / 2, 135);
          break;
      }

      // Subtle background tint for corners
      graphics.lineStyle(1, CHEVRON_DARK, 0.5);
      graphics.strokeRect(-halfTile + 2, -halfTile + 2, TILE_SIZE - 4, TILE_SIZE - 4);
    }
  }

  private drawArrowHead(
    graphics: Phaser.GameObjects.Graphics,
    x: number,
    y: number,
    angleDeg: number
  ): void {
    const len = 5;
    const angleRad = Phaser.Math.DegToRad(angleDeg);
    const spread = Phaser.Math.DegToRad(140);

    graphics.lineStyle(2, CHEVRON_COLOR, 1);
    graphics.beginPath();
    graphics.moveTo(
      x + Math.cos(angleRad + spread / 2) * len,
      y + Math.sin(angleRad + spread / 2) * len
    );
    graphics.lineTo(x, y);
    graphics.lineTo(
      x + Math.cos(angleRad - spread / 2) * len,
      y + Math.sin(angleRad - spread / 2) * len
    );
    graphics.strokePath();
  }

  destroy(): void {
    for (const container of this.containers.values()) {
      container.destroy();
    }
    this.containers.clear();
  }
}
