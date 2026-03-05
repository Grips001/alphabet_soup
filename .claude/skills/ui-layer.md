# Skill: UI Layer Pattern

Use when adding HUD elements, overlays, tooltips, or any UI that should stay fixed on screen regardless of camera position/zoom.

## Pattern

UI elements use a dedicated camera that never scrolls or zooms.

```typescript
// In the component that creates UI elements:

// 1. Create the UI game object
const text = scene.add.text(x, y, content, style);
text.setDepth(1000); // Above all world objects

// 2. Get or create the UI camera
// DebugOverlay already creates one — reuse via scene.cameras if possible
const uiCamera = scene.cameras.add(0, 0, scene.scale.width, scene.scale.height);
uiCamera.setScroll(0, 0);

// 3. Cross-ignore: main camera ignores UI, UI camera ignores world
scene.cameras.main.ignore(text);
uiCamera.ignore(worldObjects);

// 4. Handle resize
scene.scale.on("resize", (gameSize: Phaser.Structs.Size) => {
  uiCamera.setSize(gameSize.width, gameSize.height);
});
```

## Rules

- **One shared UI camera** — don't create multiple. Future refactor: extract a `UIManager` that owns the camera and provides `addToUI(obj)`.
- **Position in screen coordinates** — (0,0) is top-left of viewport, not world.
- **Don't use setScrollFactor(0)** — it's unreliable with camera bounds. Use the dedicated UI camera instead.
- **Depth 1000+** for UI elements to stay above world objects.
