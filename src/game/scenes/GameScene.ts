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
import { PlacementSystem, ToolType } from "../systems/PlacementSystem";
import { ToolbarUI } from "../renderers/ToolbarUI";
import { GhostRenderer } from "../renderers/GhostRenderer";

export class GameScene extends Phaser.Scene {
  private tickEngine!: TickEngine;
  private grid!: Grid;
  private gridRenderer!: GridRenderer;
  private cameraController!: CameraController;
  private debugOverlay!: DebugOverlay;

  // Simulation systems (public for PlacementSystem access)
  public buildingSystem!: BuildingSystem;
  public beltSystem!: BeltSystem;
  private quarrySystem!: QuarrySystem;

  // Renderers
  private quarryRenderer!: QuarryRenderer;
  private beltRenderer!: BeltRenderer;
  private itemRenderer!: ItemRenderer;

  // Placement UX
  private placementSystem!: PlacementSystem;
  private toolbarUI!: ToolbarUI;
  private ghostRenderer!: GhostRenderer;

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

    // Placement UX systems
    this.placementSystem = new PlacementSystem();

    // Get the UI camera from DebugOverlay (it's the second camera, index 1)
    const uiCamera = this.cameras.cameras[1];
    this.toolbarUI = new ToolbarUI(this, this.placementSystem, uiCamera);
    this.ghostRenderer = new GhostRenderer(this, this.grid);

    // Ghost renderer objects should be ignored by UI camera
    this.debugOverlay.ignoreOnUiCamera(this.ghostRenderer["ghostRect"]);
    this.debugOverlay.ignoreOnUiCamera(this.ghostRenderer["invalidOverlay"]);

    // Register pointer events for placement
    this.input.on("pointermove", (pointer: Phaser.Input.Pointer) => {
      const world = this.cameras.main.getWorldPoint(pointer.x, pointer.y);
      this.placementSystem.updateCursor(world.x, world.y, this.grid);

      if (this.placementSystem.isDragging) {
        this.placementSystem.updateDrag();
      }
    });

    this.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      // Only left button, only if a tool is selected
      if (pointer.leftButtonDown() && this.placementSystem.currentTool !== ToolType.None) {
        const world = this.cameras.main.getWorldPoint(pointer.x, pointer.y);
        this.placementSystem.updateCursor(world.x, world.y, this.grid);
        this.placementSystem.startDrag();
      }
    });

    this.input.on("pointerup", (pointer: Phaser.Input.Pointer) => {
      if (!pointer.leftButtonReleased() && this.placementSystem.isDragging === false) return;

      if (this.placementSystem.isDragging) {
        const result = this.placementSystem.endDrag();

        if (result.tool === ToolType.Belt && result.path.length > 0) {
          this.placeBelts(result.path);
        } else if (result.tool === ToolType.Demolish && result.path.length > 0) {
          this.demolishTiles(result.path);
        }
      }
    });

    // Keyboard hotkeys
    const keyboard = this.input.keyboard!;

    keyboard.on("keydown-ONE", (event: KeyboardEvent) => {
      event.preventDefault();
      if (this.placementSystem.currentTool === ToolType.Belt) {
        this.placementSystem.selectTool(ToolType.None);
      } else {
        this.placementSystem.selectTool(ToolType.Belt);
      }
    });

    keyboard.on("keydown-TWO", (event: KeyboardEvent) => {
      event.preventDefault();
      if (this.placementSystem.currentTool === ToolType.Demolish) {
        this.placementSystem.selectTool(ToolType.None);
      } else {
        this.placementSystem.selectTool(ToolType.Demolish);
      }
    });

    keyboard.on("keydown-DELETE", (event: KeyboardEvent) => {
      event.preventDefault();
      if (this.placementSystem.currentTool === ToolType.Demolish) {
        this.placementSystem.selectTool(ToolType.None);
      } else {
        this.placementSystem.selectTool(ToolType.Demolish);
      }
    });

    keyboard.on("keydown-ESC", (event: KeyboardEvent) => {
      event.preventDefault();
      this.placementSystem.selectTool(ToolType.None);
    });

    // Center camera on world
    this.cameras.main.centerOn(WORLD_SIZE / 2, WORLD_SIZE / 2);
  }

  private placeBelts(path: Array<{ x: number; y: number }>): void {
    // Filter path to only valid placements
    const validPath = path.filter((tile) =>
      this.placementSystem.isValidPlacement(tile.x, tile.y, this.buildingSystem)
    );

    if (validPath.length === 0) return;

    const newBelts = this.beltSystem.placeBeltPath(validPath, this.buildingSystem);
    for (const belt of newBelts) {
      this.beltRenderer.addBelt(belt);
    }

    // Update adjacent belt visuals (corners may change)
    this.refreshNeighborBelts(validPath);
  }

  private demolishTiles(path: Array<{ x: number; y: number }>): void {
    for (const tile of path) {
      const belt = this.beltSystem.getBeltAt(tile.x, tile.y);
      if (belt != null) {
        // Remove item on this belt first
        if (belt.item != null) {
          this.itemRenderer.removeItem(belt.item);
          belt.item = null;
        }
        this.beltSystem.removeBelt(tile.x, tile.y);
        this.beltRenderer.removeBelt(tile.x, tile.y);
      } else {
        // Try demolishing a building (quarry, etc.)
        const removed = this.buildingSystem.demolish(tile.x, tile.y);
        if (removed != null) {
          // For now, quarries are removed from buildingSystem but not visually
          // (QuarryRenderer is static — quarries rarely demolished in Phase 2)
          // The quarry visual stays but production will fail gracefully
        }
      }

      // Refresh neighbors after demolish
      this.refreshNeighborBelts([tile]);
    }
  }

  private refreshNeighborBelts(tiles: Array<{ x: number; y: number }>): void {
    // For each tile and its 4 neighbors, refresh belt renderer visuals
    const toRefresh = new Set<string>();

    for (const tile of tiles) {
      const neighbors = [
        { x: tile.x, y: tile.y },
        { x: tile.x - 1, y: tile.y },
        { x: tile.x + 1, y: tile.y },
        { x: tile.x, y: tile.y - 1 },
        { x: tile.x, y: tile.y + 1 },
      ];
      for (const n of neighbors) {
        toRefresh.add(`${n.x},${n.y}`);
      }
    }

    for (const key of toRefresh) {
      const [tx, ty] = key.split(",").map(Number);
      const belt = this.beltSystem.getBeltAt(tx, ty);
      if (belt != null) {
        // Refresh: remove and re-add to update variant visuals
        this.beltRenderer.removeBelt(tx, ty);
        this.beltRenderer.addBelt(belt);
      }
    }
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

    // Placement UX updates
    this.ghostRenderer.update(this.placementSystem, this.buildingSystem);
    this.toolbarUI.update();
  }
}
