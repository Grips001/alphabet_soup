import Phaser from "phaser";
import { DEPTH_UI } from "../constants";
import type { PlacementSystem } from "../systems/PlacementSystem";
import { ToolType } from "../systems/PlacementSystem";

const TOOLBAR_HEIGHT = 48;
const BUTTON_SIZE = 40;
const BUTTON_MARGIN = 8;
const TOOLBAR_BG_COLOR = 0x1e1e28;
const TOOLBAR_BG_ALPHA = 0.88;

const BUTTON_IDLE_COLOR = 0x3a3a4a;
const BUTTON_HOVER_COLOR = 0x4a4a5a;
const BUTTON_ACTIVE_COLOR = 0x5a7a5a;
const BUTTON_BORDER_IDLE = 0x555566;
const BUTTON_BORDER_ACTIVE = 0x88cc88;

interface ToolButton {
  tool: ToolType;
  container: Phaser.GameObjects.Container;
  bg: Phaser.GameObjects.Rectangle;
}

export class ToolbarUI {
  private scene: Phaser.Scene;
  private placementSystem: PlacementSystem;
  private uiCamera: Phaser.Cameras.Scene2D.Camera;

  private toolbarBg!: Phaser.GameObjects.Rectangle;
  private buttons: ToolButton[] = [];

  constructor(
    scene: Phaser.Scene,
    placementSystem: PlacementSystem,
    uiCamera: Phaser.Cameras.Scene2D.Camera
  ) {
    this.scene = scene;
    this.placementSystem = placementSystem;
    this.uiCamera = uiCamera;

    this.createToolbar();

    // Handle resize
    scene.scale.on("resize", (gameSize: Phaser.Structs.Size) => {
      this.repositionToolbar(gameSize.width, gameSize.height);
    });
  }

  private createToolbar(): void {
    const { width, height } = this.scene.scale;

    // Background bar at bottom
    this.toolbarBg = this.scene.add.rectangle(
      width / 2,
      height - TOOLBAR_HEIGHT / 2,
      width,
      TOOLBAR_HEIGHT,
      TOOLBAR_BG_COLOR,
      TOOLBAR_BG_ALPHA
    );
    this.toolbarBg.setDepth(DEPTH_UI);
    this.toolbarBg.setScrollFactor(0);

    // Only UI camera sees toolbar; main camera ignores it
    this.scene.cameras.main.ignore(this.toolbarBg);

    // Create tool buttons
    const toolDefs: Array<{ tool: ToolType; label: string; hotkey: string }> = [
      { tool: ToolType.Belt, label: "Belt", hotkey: "1" },
      { tool: ToolType.Demolish, label: "Del", hotkey: "2" },
    ];

    const totalWidth = toolDefs.length * (BUTTON_SIZE + BUTTON_MARGIN) - BUTTON_MARGIN;
    const startX = width / 2 - totalWidth / 2 + BUTTON_SIZE / 2;
    const buttonY = height - TOOLBAR_HEIGHT / 2;

    for (let i = 0; i < toolDefs.length; i++) {
      const def = toolDefs[i];
      const x = startX + i * (BUTTON_SIZE + BUTTON_MARGIN);
      const button = this.createButton(x, buttonY, def.tool, def.label, def.hotkey);
      this.buttons.push(button);
    }
  }

  private createButton(
    x: number,
    y: number,
    tool: ToolType,
    label: string,
    hotkey: string
  ): ToolButton {
    const container = this.scene.add.container(x, y);
    container.setDepth(DEPTH_UI + 1);
    container.setScrollFactor(0);

    // Background rectangle
    const bg = this.scene.add.rectangle(0, 0, BUTTON_SIZE, BUTTON_SIZE, BUTTON_IDLE_COLOR);
    bg.setStrokeStyle(1.5, BUTTON_BORDER_IDLE);
    container.add(bg);

    // Tool icon (drawn with graphics)
    const icon = this.scene.add.graphics();
    this.drawToolIcon(icon, tool);
    container.add(icon);

    // Hotkey label (small, bottom-right)
    const hotkeyText = this.scene.add.text(
      BUTTON_SIZE / 2 - 3,
      BUTTON_SIZE / 2 - 3,
      hotkey,
      {
        fontFamily: "monospace",
        fontSize: "9px",
        color: "#888899",
      }
    );
    hotkeyText.setOrigin(1, 1);
    container.add(hotkeyText);

    // Tool name label
    const nameText = this.scene.add.text(0, -BUTTON_SIZE / 2 - 3, label, {
      fontFamily: "monospace",
      fontSize: "10px",
      color: "#aaaacc",
    });
    nameText.setOrigin(0.5, 1);
    container.add(nameText);

    // Interaction
    bg.setInteractive({ useHandCursor: true });
    bg.on("pointerover", () => {
      if (this.placementSystem.currentTool !== tool) {
        bg.setFillStyle(BUTTON_HOVER_COLOR);
      }
    });
    bg.on("pointerout", () => {
      if (this.placementSystem.currentTool !== tool) {
        bg.setFillStyle(BUTTON_IDLE_COLOR);
      }
    });
    bg.on("pointerdown", () => {
      if (this.placementSystem.currentTool === tool) {
        // Toggle off if already selected
        this.placementSystem.selectTool(ToolType.None);
      } else {
        this.placementSystem.selectTool(tool);
      }
    });

    // Register on main camera ignore + UI camera only
    this.scene.cameras.main.ignore(container);

    return { tool, container, bg };
  }

  private drawToolIcon(graphics: Phaser.GameObjects.Graphics, tool: ToolType): void {
    const half = BUTTON_SIZE / 2 - 6;

    if (tool === ToolType.Belt) {
      // Draw a belt with arrow: rectangle + chevron
      graphics.lineStyle(2, 0x8888aa, 1);
      graphics.strokeRect(-half, -4, half * 2, 8);
      // Arrow pointing right
      graphics.beginPath();
      graphics.moveTo(-4, -4);
      graphics.lineTo(4, 0);
      graphics.lineTo(-4, 4);
      graphics.strokePath();
    } else if (tool === ToolType.Demolish) {
      // X mark
      graphics.lineStyle(2.5, 0xdd5555, 1);
      graphics.beginPath();
      graphics.moveTo(-half, -half);
      graphics.lineTo(half, half);
      graphics.moveTo(half, -half);
      graphics.lineTo(-half, half);
      graphics.strokePath();
    }
  }

  private repositionToolbar(width: number, height: number): void {
    this.toolbarBg.setPosition(width / 2, height - TOOLBAR_HEIGHT / 2);
    this.toolbarBg.setSize(width, TOOLBAR_HEIGHT);

    const totalWidth = this.buttons.length * (BUTTON_SIZE + BUTTON_MARGIN) - BUTTON_MARGIN;
    const startX = width / 2 - totalWidth / 2 + BUTTON_SIZE / 2;
    const buttonY = height - TOOLBAR_HEIGHT / 2;

    for (let i = 0; i < this.buttons.length; i++) {
      const btn = this.buttons[i];
      btn.container.setPosition(startX + i * (BUTTON_SIZE + BUTTON_MARGIN), buttonY);
    }
  }

  /** Sync button highlight state to PlacementSystem.currentTool. Call every frame. */
  update(): void {
    for (const btn of this.buttons) {
      const isActive = this.placementSystem.currentTool === btn.tool;
      if (isActive) {
        btn.bg.setFillStyle(BUTTON_ACTIVE_COLOR);
        btn.bg.setStrokeStyle(1.5, BUTTON_BORDER_ACTIVE);
      } else {
        btn.bg.setFillStyle(BUTTON_IDLE_COLOR);
        btn.bg.setStrokeStyle(1.5, BUTTON_BORDER_IDLE);
      }
    }
  }
}
