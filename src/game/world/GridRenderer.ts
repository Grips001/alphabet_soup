import Phaser from "phaser";
import { Grid } from "./Grid";
import { TILE_SIZE, WORLD_TILES } from "../constants";

export class GridRenderer {
  readonly map: Phaser.Tilemaps.Tilemap;

  constructor(scene: Phaser.Scene, grid: Grid) {
    // Create tilemap programmatically
    this.map = scene.make.tilemap({
      tileWidth: TILE_SIZE,
      tileHeight: TILE_SIZE,
      width: grid.width,
      height: grid.height,
    });

    const tileset = this.map.addTilesetImage("ground", "ground-tile");
    const layer = this.map.createBlankLayer("ground", tileset!, 0, 0);
    layer!.fill(0);

    // Draw subtle grid line overlay
    this.drawGridLines(scene, grid.width, grid.height);
  }

  private drawGridLines(
    scene: Phaser.Scene,
    widthTiles: number,
    heightTiles: number,
  ): void {
    const graphics = scene.add.graphics();
    graphics.lineStyle(1, 0xffffff, 0.08);

    const totalWidth = widthTiles * TILE_SIZE;
    const totalHeight = heightTiles * TILE_SIZE;

    // Vertical lines
    for (let x = 0; x <= widthTiles; x++) {
      const px = x * TILE_SIZE;
      graphics.beginPath();
      graphics.moveTo(px, 0);
      graphics.lineTo(px, totalHeight);
      graphics.strokePath();
    }

    // Horizontal lines
    for (let y = 0; y <= heightTiles; y++) {
      const py = y * TILE_SIZE;
      graphics.beginPath();
      graphics.moveTo(0, py);
      graphics.lineTo(totalWidth, py);
      graphics.strokePath();
    }

    // Render above ground but below future entities
    graphics.setDepth(1);
  }
}
