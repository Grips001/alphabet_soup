import Phaser from "phaser";

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: "BootScene" });
  }

  preload(): void {
    this.load.image("ground-tile", "assets/tiles/ground.png");
  }

  create(): void {
    this.scene.start("GameScene");
  }
}
