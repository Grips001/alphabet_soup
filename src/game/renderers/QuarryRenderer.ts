import Phaser from "phaser";
import { TILE_SIZE, DEPTH_BUILDINGS } from "../constants";
import type { QuarrySystem } from "../systems/QuarrySystem";
import type { DebugOverlay } from "../ui/DebugOverlay";
import type { Quarry } from "../entities/Quarry";
import { BeltDirection } from "../entities/Belt";

const QUARRY_COLOR = 0x4a4a5a;
const QUARRY_BORDER_COLOR = 0x8888aa;
const ARROW_COLOR = 0xffaa44;

export class QuarryRenderer {
  private scene: Phaser.Scene;
  private objects: Phaser.GameObjects.GameObject[] = [];

  constructor(scene: Phaser.Scene, quarrySystem: QuarrySystem, debugOverlay: DebugOverlay) {
    this.scene = scene;

    for (const quarry of quarrySystem.getQuarries()) {
      this.createQuarryVisuals(quarry, debugOverlay);
    }
  }

  private createQuarryVisuals(quarry: Quarry, debugOverlay: DebugOverlay): void {
    const { x, y } = quarry.originTile;
    // Center of 2x2 block
    const centerX = x * TILE_SIZE + TILE_SIZE;
    const centerY = y * TILE_SIZE + TILE_SIZE;
    const blockSize = TILE_SIZE * 2;

    // Main body rectangle
    const body = this.scene.add.rectangle(
      centerX,
      centerY,
      blockSize,
      blockSize,
      QUARRY_COLOR
    );
    body.setStrokeStyle(2, QUARRY_BORDER_COLOR);
    body.setDepth(DEPTH_BUILDINGS);
    debugOverlay.ignoreOnUiCamera(body);
    this.objects.push(body);

    // Letter label
    const label = this.scene.add.text(centerX, centerY, quarry.letter, {
      fontFamily: "monospace",
      fontSize: "20px",
      fontStyle: "bold",
      color: "#ffffff",
    });
    label.setOrigin(0.5, 0.5);
    label.setDepth(DEPTH_BUILDINGS + 1);
    debugOverlay.ignoreOnUiCamera(label);
    this.objects.push(label);

    // Output direction arrow — small bar on the appropriate edge
    const arrowGraphics = this.scene.add.graphics();
    arrowGraphics.fillStyle(ARROW_COLOR, 1);
    arrowGraphics.setDepth(DEPTH_BUILDINGS + 1);

    const arrowSize = 8;
    const halfBlock = blockSize / 2;

    switch (quarry.outputDirection) {
      case BeltDirection.South:
        arrowGraphics.fillTriangle(
          centerX - arrowSize / 2, centerY + halfBlock - arrowSize,
          centerX + arrowSize / 2, centerY + halfBlock - arrowSize,
          centerX, centerY + halfBlock
        );
        break;
      case BeltDirection.North:
        arrowGraphics.fillTriangle(
          centerX - arrowSize / 2, centerY - halfBlock + arrowSize,
          centerX + arrowSize / 2, centerY - halfBlock + arrowSize,
          centerX, centerY - halfBlock
        );
        break;
      case BeltDirection.East:
        arrowGraphics.fillTriangle(
          centerX + halfBlock - arrowSize, centerY - arrowSize / 2,
          centerX + halfBlock - arrowSize, centerY + arrowSize / 2,
          centerX + halfBlock, centerY
        );
        break;
      case BeltDirection.West:
        arrowGraphics.fillTriangle(
          centerX - halfBlock + arrowSize, centerY - arrowSize / 2,
          centerX - halfBlock + arrowSize, centerY + arrowSize / 2,
          centerX - halfBlock, centerY
        );
        break;
    }

    debugOverlay.ignoreOnUiCamera(arrowGraphics);
    this.objects.push(arrowGraphics);
  }

  destroy(): void {
    for (const obj of this.objects) {
      obj.destroy();
    }
    this.objects = [];
  }
}
