import Phaser from "phaser";
import { WORLD_SIZE } from "../constants";
import { TickEngine } from "../systems/TickEngine";
import { CameraController } from "../systems/CameraController";
import { Grid } from "../world/Grid";
import { GridRenderer } from "../world/GridRenderer";
import { DebugOverlay } from "../ui/DebugOverlay";

export class GameScene extends Phaser.Scene {
  private tickEngine!: TickEngine;
  private grid!: Grid;
  private gridRenderer!: GridRenderer;
  private cameraController!: CameraController;
  private debugOverlay!: DebugOverlay;

  constructor() {
    super({ key: "GameScene" });
  }

  create(): void {
    // Game state
    this.grid = new Grid();

    // Rendering
    this.gridRenderer = new GridRenderer(this, this.grid);

    // Camera controls (sets bounds, input handlers)
    this.cameraController = new CameraController(this);

    // Simulation
    this.tickEngine = new TickEngine();

    // Debug UI
    this.debugOverlay = new DebugOverlay(this);

    // Center camera on world
    this.cameras.main.centerOn(WORLD_SIZE / 2, WORLD_SIZE / 2);
  }

  update(_time: number, delta: number): void {
    this.tickEngine.update(delta, (_tick) => {
      // Future: simulation callbacks (belt movement, assembler processing)
    });

    this.cameraController.update(delta);
    this.debugOverlay.update(this, this.tickEngine.currentTick);
  }
}
