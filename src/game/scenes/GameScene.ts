import Phaser from "phaser";
import { WORLD_SIZE } from "../constants";
import { TickEngine } from "../systems/TickEngine";
import { CameraController } from "../systems/CameraController";
import { Grid } from "../world/Grid";
import { GridRenderer } from "../world/GridRenderer";
import { DebugOverlay } from "../ui/DebugOverlay";
import { BuildingSystem } from "../systems/BuildingSystem";
import { BeltSystem } from "../systems/BeltSystem";
import { QuarrySystem } from "../systems/QuarrySystem";
import { QuarryRenderer } from "../renderers/QuarryRenderer";
import { BeltRenderer } from "../renderers/BeltRenderer";
import { ItemRenderer } from "../renderers/ItemRenderer";

export class GameScene extends Phaser.Scene {
  private tickEngine!: TickEngine;
  private grid!: Grid;
  private gridRenderer!: GridRenderer;
  private cameraController!: CameraController;
  private debugOverlay!: DebugOverlay;

  // Simulation systems (public for Plan 04 PlacementSystem access)
  public buildingSystem!: BuildingSystem;
  public beltSystem!: BeltSystem;
  private quarrySystem!: QuarrySystem;

  // Renderers
  private quarryRenderer!: QuarryRenderer;
  private beltRenderer!: BeltRenderer;
  private itemRenderer!: ItemRenderer;

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

    // Debug UI (must be created before renderers that call ignoreOnUiCamera)
    this.debugOverlay = new DebugOverlay(this);

    // Simulation systems
    this.buildingSystem = new BuildingSystem();
    this.beltSystem = new BeltSystem();
    this.quarrySystem = new QuarrySystem(this.buildingSystem, this.beltSystem);

    // Place fixed quarries from quarryLayout
    this.quarrySystem.initializeQuarries();

    // Renderers — draw quarries and initial belt state
    this.quarryRenderer = new QuarryRenderer(this, this.quarrySystem, this.debugOverlay);
    this.beltRenderer = new BeltRenderer(this, this.beltSystem, this.debugOverlay);
    this.itemRenderer = new ItemRenderer(this, this.beltSystem, this.grid, this.debugOverlay);

    // Temporary: place a short belt chain at first quarry's output for visual testing
    const testQuarry = this.quarrySystem.getQuarries()[0];
    if (testQuarry != null) {
      const out = testQuarry.outputTile;
      const belts = this.beltSystem.placeBeltPath(
        [out, { x: out.x, y: out.y + 1 }, { x: out.x, y: out.y + 2 }],
        this.buildingSystem
      );
      for (const belt of belts) {
        this.beltRenderer.addBelt(belt);
      }
    }

    // Center camera on world
    this.cameras.main.centerOn(WORLD_SIZE / 2, WORLD_SIZE / 2);
  }

  update(time: number, delta: number): void {
    this.tickEngine.update(delta, (_tick) => {
      // Run simulation tick
      this.quarrySystem.tick();
      this.beltSystem.tick();

      // Sync item visuals with new simulation state
      this.itemRenderer.syncItems();
    });

    this.cameraController.update(delta);
    this.debugOverlay.update(this, this.tickEngine.currentTick);

    // Per-frame rendering updates
    this.beltRenderer.update(time);
    this.itemRenderer.update(this.tickEngine.alpha);
  }
}
