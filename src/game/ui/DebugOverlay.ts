import Phaser from "phaser";
import { TILE_SIZE } from "../constants";

export class DebugOverlay {
  private text: Phaser.GameObjects.Text;
  private visible = false;
  private uiCamera: Phaser.Cameras.Scene2D.Camera;

  constructor(scene: Phaser.Scene) {
    this.text = scene.add.text(8, 8, "", {
      fontFamily: "monospace",
      fontSize: "14px",
      color: "#00ff00",
      backgroundColor: "rgba(0,0,0,0.6)",
      padding: { x: 6, y: 4 },
    });

    this.text.setDepth(1000);
    this.text.setVisible(false);

    // Dedicated UI camera that never scrolls or zooms
    this.uiCamera = scene.cameras.add(0, 0, scene.scale.width, scene.scale.height);
    this.uiCamera.setScroll(0, 0);

    // Main camera ignores UI text; UI camera only sees UI text
    scene.cameras.main.ignore(this.text);
    this.uiCamera.ignore(scene.children.getAll().filter((obj) => obj !== this.text));

    // Backtick toggles visibility
    scene.input.keyboard!.on("keydown-BACKTICK", () => {
      this.visible = !this.visible;
      this.text.setVisible(this.visible);
    });

    // Keep UI camera sized to window
    scene.scale.on("resize", (gameSize: Phaser.Structs.Size) => {
      this.uiCamera.setSize(gameSize.width, gameSize.height);
    });
  }

  /** Call when new game objects are added so the UI camera ignores them. */
  ignoreOnUiCamera(obj: Phaser.GameObjects.GameObject): void {
    this.uiCamera.ignore(obj);
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
