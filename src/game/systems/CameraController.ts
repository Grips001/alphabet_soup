import Phaser from "phaser";
import {
  CAMERA_ACCELERATION,
  CAMERA_DRAG,
  CAMERA_MAX_SPEED,
  WORLD_SIZE,
  ZOOM_LERP,
  ZOOM_STEP,
} from "../constants";
import { clampZoom } from "./camera-utils";

/**
 * Composite key that reports isDown if either of two keys is pressed.
 * Used to merge WASD and arrow keys into SmoothedKeyControl.
 */
class CompositeKey {
  private keyA: Phaser.Input.Keyboard.Key;
  private keyB: Phaser.Input.Keyboard.Key;

  constructor(a: Phaser.Input.Keyboard.Key, b: Phaser.Input.Keyboard.Key) {
    this.keyA = a;
    this.keyB = b;
  }

  get isDown(): boolean {
    return this.keyA.isDown || this.keyB.isDown;
  }
}

export class CameraController {
  private scene: Phaser.Scene;
  private controls: Phaser.Cameras.Controls.SmoothedKeyControl;
  private targetZoom: number;

  // Zoom-toward-cursor: world point captured at wheel time
  private zoomAnchorWorldX = 0;
  private zoomAnchorWorldY = 0;
  private zoomAnchorScreenX = 0;
  private zoomAnchorScreenY = 0;

  // Middle-click drag state
  private isDragging = false;
  private dragStartX = 0;
  private dragStartY = 0;
  private dragStartScrollX = 0;
  private dragStartScrollY = 0;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    const camera = scene.cameras.main;

    // Set camera bounds to world edges
    camera.setBounds(0, 0, WORLD_SIZE, WORLD_SIZE);

    // Initialize zoom
    this.targetZoom = camera.zoom;

    // Create cursor keys and WASD
    const cursors = scene.input.keyboard!.createCursorKeys();
    const wasd = scene.input.keyboard!.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
    }) as {
      up: Phaser.Input.Keyboard.Key;
      down: Phaser.Input.Keyboard.Key;
      left: Phaser.Input.Keyboard.Key;
      right: Phaser.Input.Keyboard.Key;
    };

    // Composite keys: arrow OR wasd
    const up = new CompositeKey(cursors.up!, wasd.up);
    const down = new CompositeKey(cursors.down!, wasd.down);
    const left = new CompositeKey(cursors.left!, wasd.left);
    const right = new CompositeKey(cursors.right!, wasd.right);

    this.controls = new Phaser.Cameras.Controls.SmoothedKeyControl({
      camera,
      up: up as unknown as Phaser.Input.Keyboard.Key,
      down: down as unknown as Phaser.Input.Keyboard.Key,
      left: left as unknown as Phaser.Input.Keyboard.Key,
      right: right as unknown as Phaser.Input.Keyboard.Key,
      acceleration: CAMERA_ACCELERATION,
      drag: CAMERA_DRAG,
      maxSpeed: CAMERA_MAX_SPEED,
    });

    // Scroll wheel zoom toward cursor
    scene.input.on(
      "wheel",
      (
        _pointer: Phaser.Input.Pointer,
        _gameObjects: Phaser.GameObjects.GameObject[],
        _deltaX: number,
        deltaY: number,
      ) => {
        this.handleZoom(deltaY);
      },
    );

    // Middle-click drag
    this.setupMiddleClickDrag();
  }

  private handleZoom(deltaY: number): void {
    const camera = this.scene.cameras.main;
    const pointer = this.scene.input.activePointer;

    // Capture the world point under cursor BEFORE zoom changes
    const worldPoint = camera.getWorldPoint(pointer.x, pointer.y);
    this.zoomAnchorWorldX = worldPoint.x;
    this.zoomAnchorWorldY = worldPoint.y;
    this.zoomAnchorScreenX = pointer.x;
    this.zoomAnchorScreenY = pointer.y;

    const zoomDelta = deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
    this.targetZoom = clampZoom(this.targetZoom + zoomDelta);
  }

  private setupMiddleClickDrag(): void {
    const scene = this.scene;

    // Prevent browser middle-click auto-scroll on canvas
    const canvas = scene.game.canvas;
    canvas.addEventListener("mousedown", (e: MouseEvent) => {
      if (e.button === 1) {
        e.preventDefault();
      }
    });
    canvas.addEventListener("auxclick", (e: MouseEvent) => {
      if (e.button === 1) {
        e.preventDefault();
      }
    });

    scene.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      if (pointer.middleButtonDown()) {
        this.isDragging = true;
        this.dragStartX = pointer.x;
        this.dragStartY = pointer.y;
        const camera = scene.cameras.main;
        this.dragStartScrollX = camera.scrollX;
        this.dragStartScrollY = camera.scrollY;
      }
    });

    scene.input.on("pointermove", (pointer: Phaser.Input.Pointer) => {
      if (this.isDragging) {
        const camera = scene.cameras.main;
        const dx = (this.dragStartX - pointer.x) / camera.zoom;
        const dy = (this.dragStartY - pointer.y) / camera.zoom;
        camera.scrollX = this.dragStartScrollX + dx;
        camera.scrollY = this.dragStartScrollY + dy;
      }
    });

    scene.input.on("pointerup", (pointer: Phaser.Input.Pointer) => {
      if (pointer.middleButtonReleased()) {
        this.isDragging = false;
      }
    });
  }

  update(delta: number): void {
    this.controls.update(delta);

    // Lerp zoom toward target, anchored to the world point captured at wheel time
    const camera = this.scene.cameras.main;
    if (Math.abs(camera.zoom - this.targetZoom) > 0.001) {
      // Apply lerped zoom
      camera.zoom += (this.targetZoom - camera.zoom) * ZOOM_LERP;

      // Adjust scroll so the anchor world point stays under its original screen position
      const current = camera.getWorldPoint(
        this.zoomAnchorScreenX,
        this.zoomAnchorScreenY,
      );
      camera.scrollX += this.zoomAnchorWorldX - current.x;
      camera.scrollY += this.zoomAnchorWorldY - current.y;
    }
  }
}

// Re-export pure helpers for convenience
export { clampZoom, zoomDeltaFromWheel } from "./camera-utils";
