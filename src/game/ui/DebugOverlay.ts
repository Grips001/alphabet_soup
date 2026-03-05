import Phaser from "phaser";
import { TILE_SIZE } from "../constants";

export class DebugOverlay {
  private text: Phaser.GameObjects.Text;
  private visible = false;

  constructor(scene: Phaser.Scene) {
    this.text = scene.add.text(8, 8, "", {
      fontFamily: "monospace",
      fontSize: "14px",
      color: "#00ff00",
      backgroundColor: "rgba(0,0,0,0.6)",
      padding: { x: 6, y: 4 },
    });

    this.text.setScrollFactor(0);
    this.text.setDepth(1000);
    this.text.setVisible(false);

    // F3 toggles visibility
    scene.input.keyboard!.on("keydown-F3", () => {
      this.visible = !this.visible;
      this.text.setVisible(this.visible);
    });
  }

  update(scene: Phaser.Scene, tickCount: number): void {
    if (!this.visible) return;

    const fps = Math.round(scene.game.loop.actualFps);
    const pointer = scene.input.activePointer;
    const worldPoint = scene.cameras.main.getWorldPoint(pointer.x, pointer.y);
    const tileX = Math.floor(worldPoint.x / TILE_SIZE);
    const tileY = Math.floor(worldPoint.y / TILE_SIZE);

    this.text.setText(
      `FPS: ${fps}\nTick: ${tickCount}\nTile: (${tileX}, ${tileY})`,
    );
  }
}
