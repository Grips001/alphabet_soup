# Phase 1: Foundation - Research

**Researched:** 2026-03-04
**Domain:** Phaser 3 game bootstrap, tile grid rendering, camera controls, fixed-timestep simulation, Vite build pipeline, Vercel deployment, CI
**Confidence:** HIGH

## Summary

Phase 1 bootstraps a greenfield Phaser 3 + TypeScript + Vite project that renders a 64x64 tile grid world, implements smooth camera pan/zoom, runs a deterministic fixed-timestep tick engine decoupled from rendering, and deploys to Vercel via GitHub integration with CI checks.

The official `phaserjs/template-vite-ts` template provides the scaffold. Phaser 3.90.0 is the current and likely final version of Phaser 3 (all future development is Phaser 4), making it stable and well-documented. The tick engine should be a pure TypeScript accumulator pattern running independently of Phaser's render loop. Camera controls combine Phaser's built-in `SmoothedKeyControl` for WASD panning with custom scroll-wheel zoom-toward-cursor logic. Vercel's native GitHub integration handles deployment automatically; a separate GitHub Actions workflow handles type-check and test CI.

**Primary recommendation:** Use the official Phaser Vite TS template as the starting scaffold, implement the tick engine as a standalone pure-TS class (no Phaser dependency), and use Vitest for testing game logic.

<user_constraints>

## User Constraints (from CONTEXT.md)

### Locked Decisions
- 32x32 pixel tiles, 64x64 tile world (2048x2048 pixels total)
- Subtle grid lines always visible (faint lines to aid placement)
- Camera bounded to world edges (no void visible)
- Pan: WASD/Arrow keys for steady panning, middle-click drag for quick repositioning
- Zoom: Smooth zoom toward cursor position via scroll wheel
- Zoom range: 0.5x to 3x
- Movement feel: Smooth with light easing (lerp on pan and zoom, not sluggish)
- Retro SNES/Genesis pixel art aesthetic with modern polish
- Playful but not childish -- warm & inviting palette: amber, cream, soft red tones
- Abstract world -- not naturalistic (letters are objects in abstract space)
- Design constraint: letter items must have high contrast against belt surfaces
- Debug overlay shows: FPS, current tick count, cursor tile coordinates
- Overlay hidden by default, toggled with F3
- Overlay content: FPS + tick number + hovered tile (x, y)

### Claude's Discretion
- Tick rate (choose based on factory game conventions and Phaser performance)
- Debug overlay position (place where it won't conflict with future HUD)
- Abstract ground tile design (complement retro-playful warm aesthetic)
- Camera easing parameters (tune for responsive but polished feel)

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope

</user_constraints>

<phase_requirements>

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| SIM-01 | Game runs on a fixed-timestep tick engine decoupled from render framerate | Accumulator pattern in pure TS class; called from Phaser scene update with delta; 15 ticks/sec recommended |
| GRID-01 | World is a 2D tile grid where buildings snap to grid positions | Phaser Tilemap with createBlankLayer + fill; 64x64 tiles at 32px; data model is a 2D array for game state |
| GRID-04 | Player can pan camera with mouse/keyboard and zoom with scroll wheel | SmoothedKeyControl for WASD/arrows; custom wheel handler for zoom-toward-cursor; middle-click drag via pointerdown/move |
| INFRA-01 | Project builds with Vite and deploys to Vercel via GitHub integration | Official Phaser Vite TS template; Vercel auto-deploys on push via native GitHub integration |
| INFRA-02 | CI pipeline runs type-check and tests on push | GitHub Actions workflow: checkout, setup-bun, install, tsc --noEmit, vitest run |

</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| phaser | 3.90.0 | Game framework (rendering, input, scenes, tilemaps) | Final stable release of Phaser 3; mature, well-documented |
| typescript | ~5.7 | Type safety | Matches official template; stable TS 5.x |
| vite | ~6.3 | Dev server and production bundler | Official Phaser template uses Vite 6; fast HMR, ESM-native |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| vitest | latest | Unit/integration testing | Test pure game logic (tick engine, grid math, camera bounds) |
| @vitest/ui | latest | Test runner UI | Optional: visual test feedback during dev |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Vitest | Jest | Vitest integrates with Vite config natively; Jest needs separate TS transpilation setup |
| Phaser Tilemap | Raw canvas grid drawing | Tilemap gives collision, tile queries, culling for free; raw canvas means hand-rolling all of it |
| SmoothedKeyControl | Custom keyboard handler | Built-in handles acceleration/drag/maxSpeed; custom only needed for unusual behavior |

**Installation:**
```bash
bun add phaser
bun add -d typescript vitest @vitest/ui
```

## Architecture Patterns

### Recommended Project Structure
```
src/
  main.ts                  # Vite entry point, creates Phaser.Game
  game/
    config.ts              # Phaser game config (type, scale, scene list)
    scenes/
      BootScene.ts         # Asset loading (tileset images, fonts)
      GameScene.ts         # Main scene: grid, camera, tick engine, debug overlay
    systems/
      TickEngine.ts        # Pure TS fixed-timestep accumulator (no Phaser imports)
      CameraController.ts  # WASD + scroll zoom + middle-click drag logic
    world/
      Grid.ts              # Grid data model (tile types, coordinate helpers)
      GridRenderer.ts      # Phaser tilemap setup, grid line overlay
    ui/
      DebugOverlay.ts      # FPS, tick count, hovered tile display
    constants.ts           # TILE_SIZE, WORLD_TILES, TICK_RATE, ZOOM_MIN/MAX
  assets/                  # Source assets (if any need processing)
public/
  assets/
    tiles/                 # Tileset sprite sheets (32x32 px)
.github/
  workflows/
    ci.yml                 # Type-check + test on push
vite.config.ts
tsconfig.json
```

### Pattern 1: Fixed-Timestep Accumulator (Tick Engine)
**What:** A pure TypeScript class that accumulates real elapsed time and fires discrete simulation ticks at a fixed interval, decoupled from the render framerate.
**When to use:** Always -- this is the simulation backbone.
**Example:**
```typescript
// Source: "Fix Your Timestep!" by Glenn Fiedler (gafferongames.com)
// Adapted for Phaser 3 scene update

export class TickEngine {
  private accumulator = 0;
  private tickCount = 0;
  private readonly tickRate: number;      // ms per tick
  private readonly maxAccumulator: number; // prevent spiral of death

  constructor(ticksPerSecond: number = 15) {
    this.tickRate = 1000 / ticksPerSecond;
    this.maxAccumulator = this.tickRate * 5; // cap at 5 ticks worth
  }

  /** Called from Phaser scene update(time, delta) */
  update(deltaMs: number, onTick: (tickNumber: number) => void): void {
    this.accumulator += deltaMs;

    // Prevent spiral of death (e.g., tab was backgrounded)
    if (this.accumulator > this.maxAccumulator) {
      this.accumulator = this.maxAccumulator;
    }

    while (this.accumulator >= this.tickRate) {
      this.accumulator -= this.tickRate;
      this.tickCount++;
      onTick(this.tickCount);
    }
  }

  get currentTick(): number {
    return this.tickCount;
  }

  /** Fraction of current tick elapsed (0-1), useful for interpolation */
  get alpha(): number {
    return this.accumulator / this.tickRate;
  }
}
```

### Pattern 2: Zoom-Toward-Cursor
**What:** When the player scrolls the mouse wheel, zoom the camera such that the world point under the cursor stays fixed.
**When to use:** Scroll wheel zoom (GRID-04).
**Example:**
```typescript
// Source: Phaser discourse (Antriel's solution)
// https://phaser.discourse.group/t/zoom-and-pan-to-mouse-position-on-wheel-event/13689

scene.input.on('wheel', (
  pointer: Phaser.Input.Pointer,
  _gameObjects: any[],
  _deltaX: number,
  deltaY: number
) => {
  const camera = scene.cameras.main;
  const worldBefore = camera.getWorldPoint(pointer.x, pointer.y);

  // Adjust zoom (deltaY is positive for scroll-down = zoom out)
  const zoomDelta = deltaY > 0 ? -0.1 : 0.1;
  const newZoom = Phaser.Math.Clamp(camera.zoom + zoomDelta, 0.5, 3);
  camera.setZoom(newZoom);

  // Force camera matrix recalculation
  camera.preRender();

  const worldAfter = camera.getWorldPoint(pointer.x, pointer.y);

  // Adjust scroll to keep world point under cursor
  camera.scrollX += worldBefore.x - worldAfter.x;
  camera.scrollY += worldBefore.y - worldAfter.y;
});
```

### Pattern 3: Programmatic Tilemap Grid
**What:** Create a tilemap from code (no Tiled editor) using createBlankLayer + fill, with a grid line overlay drawn via Phaser Graphics.
**When to use:** The initial ground tile grid (GRID-01).
**Example:**
```typescript
// Create tilemap programmatically
const map = scene.make.tilemap({
  tileWidth: 32,
  tileHeight: 32,
  width: 64,
  height: 64,
});

// Add tileset from loaded spritesheet
const tileset = map.addTilesetImage('ground-tiles', 'ground-tiles-key');

// Create and fill ground layer
const groundLayer = map.createBlankLayer('ground', tileset!, 0, 0);
groundLayer!.fill(0); // Fill with tile index 0

// Grid line overlay
const gridGraphics = scene.add.graphics();
gridGraphics.lineStyle(1, 0xffffff, 0.08); // Subtle white lines
for (let x = 0; x <= 64; x++) {
  gridGraphics.lineBetween(x * 32, 0, x * 32, 64 * 32);
}
for (let y = 0; y <= 64; y++) {
  gridGraphics.lineBetween(0, y * 32, 64 * 32, y * 32);
}
```

### Pattern 4: SmoothedKeyControl for Camera Pan
**What:** Use Phaser's built-in SmoothedKeyControl for WASD/arrow camera panning with physics-based smoothing.
**When to use:** Keyboard camera movement (GRID-04).
**Example:**
```typescript
const cursors = scene.input.keyboard!.createCursorKeys();
const wasd = scene.input.keyboard!.addKeys({
  up: Phaser.Input.Keyboard.KeyCodes.W,
  down: Phaser.Input.Keyboard.KeyCodes.S,
  left: Phaser.Input.Keyboard.KeyCodes.A,
  right: Phaser.Input.Keyboard.KeyCodes.D,
}) as Record<string, Phaser.Input.Keyboard.Key>;

const controls = new Phaser.Cameras.Controls.SmoothedKeyControl({
  camera: scene.cameras.main,
  left: wasd.left,
  right: wasd.right,
  up: wasd.up,
  down: wasd.down,
  acceleration: 0.08,
  drag: 0.003,
  maxSpeed: 0.5,
});

// Also bind arrow keys (SmoothedKeyControl supports one set;
// bind arrows as additional keys that share the same Key objects,
// or create a second controller)

// In update():
controls.update(delta);
```

### Anti-Patterns to Avoid
- **Coupling simulation to Phaser's update loop directly:** Phaser's update fires at render framerate (variable). Simulation logic must go through the TickEngine accumulator, never directly in `update()`.
- **Using Phaser's TimeStep.tick() for simulation:** This is a renderer concept, not a simulation primitive. The tick engine must be independent.
- **Storing game state in Phaser objects:** Tile types, entity positions, etc. should live in plain TS data structures. Phaser objects are the view layer. This separation is critical for save/load in Phase 5 and for testing without Phaser.
- **Using `pixelArt: true` without `roundPixels: true`:** For pixel art at non-integer zoom levels, textures will blur or shimmer unless `roundPixels` is enabled in the game config.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Keyboard camera smoothing | Custom velocity/friction math | `Phaser.Cameras.Controls.SmoothedKeyControl` | Handles acceleration, drag, maxSpeed, and frame-delta correctly |
| Tile coordinate math | Manual division/floor for pixel-to-tile | `map.worldToTileX/Y()` and `map.tileToWorldX/Y()` | Handles zoom, scroll offset, and edge cases |
| Camera bounds enforcement | Manual scroll clamping | `camera.setBounds(0, 0, worldWidth, worldHeight)` | Works correctly with zoom levels |
| Sprite sheet loading | Manual image slicing | `scene.load.spritesheet()` with frameWidth/frameHeight config | Phaser handles atlas generation and frame indexing |
| FPS measurement | Manual frame counting | `scene.game.loop.actualFps` | Already tracked by Phaser's TimeStep |

**Key insight:** Phaser 3 has mature, battle-tested utilities for camera, tilemap, and input. The only custom system needed is the tick engine, because Phaser intentionally does not ship a fixed-timestep simulation loop.

## Common Pitfalls

### Pitfall 1: Camera Bounds Break at Non-1x Zoom
**What goes wrong:** `camera.setBounds()` doesn't automatically account for zoom. At 0.5x zoom, the camera can see beyond world edges.
**Why it happens:** Bounds are in world coordinates but the visible area changes with zoom.
**How to avoid:** Use `camera.setBounds(x, y, w, h, centerOn)` -- the 5th parameter `centerOn` (boolean) helps. Additionally, recalculate bounds dynamically when zoom changes, or set bounds large enough to account for min zoom.
**Warning signs:** Black/void areas visible at edge of world when zoomed out.

### Pitfall 2: Spiral of Death in Fixed Timestep
**What goes wrong:** If the game tab is backgrounded, accumulated delta becomes huge, causing hundreds of ticks to fire on resume, freezing the game.
**Why it happens:** The accumulator pattern faithfully tries to "catch up" on missed time.
**How to avoid:** Cap the accumulator at a maximum (e.g., 5 ticks worth). When the player returns from a backgrounded tab, the simulation simply skips ahead rather than grinding through every missed tick.
**Warning signs:** Game freezes for seconds after alt-tabbing back.

### Pitfall 3: Pixel Art Rendering Artifacts
**What goes wrong:** Tiles show sub-pixel bleeding, shimmer during camera movement, or blur when zoomed.
**Why it happens:** Default texture filtering is bilinear; camera scroll/zoom at fractional positions causes sampling artifacts.
**How to avoid:** Set `pixelArt: true` in game config (sets NEAREST filtering) AND `roundPixels: true` in the render config. Both are needed.
**Warning signs:** Visible seams between tiles, blurry sprites.

### Pitfall 4: Middle-Click Browser Default Behavior
**What goes wrong:** Middle-click triggers auto-scroll cursor (browser default) instead of camera drag.
**Why it happens:** The browser intercepts middle mouse button events.
**How to avoid:** Call `event.preventDefault()` on the `mousedown` event for button 1 (middle). Phaser's input system may not suppress this automatically. Add a DOM-level event listener on the canvas.
**Warning signs:** Browser auto-scroll icon appears on middle-click.

### Pitfall 5: Vite Base Path for Vercel
**What goes wrong:** Assets load in dev but 404 in production.
**Why it happens:** Vite defaults `base` to `/` which is correct for Vercel root deployment, but asset paths in Phaser must match.
**How to avoid:** Keep Vite `base: '/'` (default). Load assets with relative paths from `public/assets/`. Do NOT use absolute filesystem paths in Phaser loader calls.
**Warning signs:** Console 404 errors for sprites/images in production only.

## Code Examples

### Phaser Game Configuration
```typescript
// src/game/config.ts
import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { GameScene } from './scenes/GameScene';

export const gameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 1280,
  height: 720,
  parent: 'game-container',
  backgroundColor: '#2d2a23',
  pixelArt: true,
  roundPixels: true,
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [BootScene, GameScene],
};
```

### Debug Overlay
```typescript
// src/game/ui/DebugOverlay.ts
export class DebugOverlay {
  private text: Phaser.GameObjects.Text;
  private visible = false;

  constructor(scene: Phaser.Scene) {
    this.text = scene.add.text(8, 8, '', {
      fontFamily: 'monospace',
      fontSize: '14px',
      color: '#ffffff',
      backgroundColor: 'rgba(0,0,0,0.5)',
      padding: { x: 6, y: 4 },
    })
    .setScrollFactor(0)   // Fixed to camera
    .setDepth(1000)       // Always on top
    .setVisible(false);

    // F3 toggle
    scene.input.keyboard!.on('keydown-F3', () => {
      this.visible = !this.visible;
      this.text.setVisible(this.visible);
    });
  }

  update(scene: Phaser.Scene, tickCount: number): void {
    if (!this.visible) return;

    const pointer = scene.input.activePointer;
    const camera = scene.cameras.main;
    const worldPoint = camera.getWorldPoint(pointer.x, pointer.y);
    const tileX = Math.floor(worldPoint.x / 32);
    const tileY = Math.floor(worldPoint.y / 32);
    const fps = Math.round(scene.game.loop.actualFps);

    this.text.setText([
      `FPS: ${fps}`,
      `Tick: ${tickCount}`,
      `Tile: (${tileX}, ${tileY})`,
    ].join('\n'));
  }
}
```

### GitHub Actions CI Workflow
```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v2
      - run: bun install --frozen-lockfile
      - run: bun run type-check
      - run: bun run test
```

### Package.json Scripts
```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc --noEmit && vite build",
    "type-check": "tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest",
    "preview": "vite preview"
  }
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Phaser 3.60 (last major API change) | Phaser 3.90.0 (final v3 release) | May 2025 | 3.90 is bugfix-only; API is frozen and stable |
| Webpack bundling | Vite 6.x bundling | 2024+ | Official template switched to Vite; faster dev, simpler config |
| Jest for testing | Vitest | 2023+ | Vitest shares Vite config, no separate TS transpilation needed |
| npm/yarn | bun | 2024+ | Per project guidelines: use bun as package manager |

**Deprecated/outdated:**
- Phaser 3 `game.config.fps.target` does NOT create a fixed simulation timestep -- it only throttles the render loop. Do not use it for deterministic simulation.
- `Phaser.Cameras.Controls.FixedKeyControl` is simpler but lacks smoothing -- use `SmoothedKeyControl` instead for the eased feel the user wants.

## Discretion Recommendations

### Tick Rate: 15 ticks/second
**Rationale:** Factory games like Factorio use ~60 UPS but that's for real-time combat. Shapez.io and similar pure-logistics games use lower rates. 15 ticks/sec (66.7ms per tick) is sufficient for belt movement at 32px tiles (items move ~2px per tick at belt speed 1), keeps CPU overhead low, and is easy to reason about. Can be adjusted later without architectural changes since the TickEngine parameterizes it.

### Debug Overlay Position: Top-left corner
**Rationale:** Top-left is standard for debug info in games. Future HUD elements (toolbar, currency) typically occupy the bottom or right side. The overlay is toggle-hidden anyway, so conflicts are minimal.

### Camera Easing Parameters
**Rationale:** Start with `acceleration: 0.08, drag: 0.003, maxSpeed: 0.5` for SmoothedKeyControl. For zoom lerp, use `0.1` per frame toward target zoom. These provide responsive-but-polished feel. Tunable constants -- expose in `constants.ts`.

### Abstract Ground Tile
**Rationale:** A warm amber/cream base tile with very subtle texture variation (not flat color, not noisy). Think slightly worn parchment or warm concrete. This complements the "letters as objects" concept and provides contrast for future belt surfaces (which should be darker/cooler tones).

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest (latest, via bun) |
| Config file | vite.config.ts (test section) -- created in Wave 0 |
| Quick run command | `bun run test` |
| Full suite command | `bun run test && bun run type-check` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| SIM-01 | Tick engine fires correct number of ticks for given delta | unit | `bun run vitest run src/game/systems/TickEngine.test.ts` | No -- Wave 0 |
| SIM-01 | Accumulator caps prevent spiral of death | unit | `bun run vitest run src/game/systems/TickEngine.test.ts` | No -- Wave 0 |
| SIM-01 | Alpha interpolation value correct | unit | `bun run vitest run src/game/systems/TickEngine.test.ts` | No -- Wave 0 |
| GRID-01 | Grid data model stores/retrieves tile types | unit | `bun run vitest run src/game/world/Grid.test.ts` | No -- Wave 0 |
| GRID-01 | Pixel-to-tile coordinate conversion correct | unit | `bun run vitest run src/game/world/Grid.test.ts` | No -- Wave 0 |
| GRID-04 | Camera zoom clamped to 0.5-3.0 range | unit | `bun run vitest run src/game/systems/CameraController.test.ts` | No -- Wave 0 |
| INFRA-01 | Vite production build succeeds | smoke | `bun run build` | No -- Wave 0 |
| INFRA-02 | Type-check passes | smoke | `bun run type-check` | No -- Wave 0 |

### Sampling Rate
- **Per task commit:** `bun run test`
- **Per wave merge:** `bun run test && bun run type-check && bun run build`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `src/game/systems/TickEngine.test.ts` -- covers SIM-01 (tick accumulator logic)
- [ ] `src/game/world/Grid.test.ts` -- covers GRID-01 (grid data model, coordinate math)
- [ ] `src/game/systems/CameraController.test.ts` -- covers GRID-04 (zoom clamping, bounds math)
- [ ] `vite.config.ts` test configuration -- Vitest config section
- [ ] Framework install: `bun add -d vitest`

## Open Questions

1. **Phaser `camera.preRender()` availability in 3.90**
   - What we know: The zoom-toward-cursor pattern calls `camera.preRender()` to force matrix recalculation. This was documented for 3.55-3.60.
   - What's unclear: Whether `preRender()` is still the correct method name in 3.90 or has been renamed.
   - Recommendation: Verify at implementation time by checking the Camera class API. If unavailable, an alternative is to use `camera.dirty = true` or defer scroll adjustment to the next frame.

2. **SmoothedKeyControl with two key sets (WASD + Arrows)**
   - What we know: SmoothedKeyControl accepts one key per direction. The user wants both WASD and arrow keys.
   - What's unclear: Whether two SmoothedKeyControl instances conflict, or if we need a custom wrapper.
   - Recommendation: Create a lightweight wrapper that combines both key sets into virtual keys (either is pressed = direction active), then feed those into a single SmoothedKeyControl.

3. **Ground tile asset creation**
   - What we know: Need a 32x32 pixel art ground tile with warm amber/cream palette.
   - What's unclear: Whether to create a minimal placeholder programmatically or commission/create pixel art.
   - Recommendation: Start with a simple procedurally generated tile (canvas fill with subtle noise) or a hand-drawn 32x32 PNG. A single tile with 2-4 color variants using Phaser's tile randomization is sufficient for Phase 1.

## Sources

### Primary (HIGH confidence)
- [Official Phaser Vite TS template](https://github.com/phaserjs/template-vite-ts) - project structure, dependency versions (Phaser 3.90.0, Vite 6.3.1, TS 5.7.2)
- [Phaser 3.90 release announcement](https://phaser.io/news/2025/05/phaser-v390-released) - confirmed as final v3 release
- [Phaser SmoothedKeyControl API](https://docs.phaser.io/api-documentation/class/cameras-controls-smoothedkeycontrol) - camera control config and methods
- [Phaser Camera API](https://docs.phaser.io/api-documentation/class/cameras-scene2d-camera) - setBounds, zoom, scroll
- [Phaser Tilemap API](https://docs.phaser.io/api-documentation/class/tilemaps-tilemap) - createBlankLayer, fill, putTileAt
- [Fix Your Timestep! (Gaffer on Games)](https://gafferongames.com/post/fix_your_timestep/) - accumulator pattern reference

### Secondary (MEDIUM confidence)
- [Phaser discourse: zoom to cursor](https://phaser.discourse.group/t/zoom-and-pan-to-mouse-position-on-wheel-event/13689) - zoom-toward-cursor math pattern (verified approach)
- [Testing Phaser with Vitest (DEV.to)](https://dev.to/davidmorais/testing-phaser-games-with-vitest-3kon) - Vitest setup, mocking strategy
- [Vercel GitHub integration docs](https://vercel.com/docs/git/vercel-for-github) - auto-deploy on push
- [Phaser discourse: fixed timestep](https://phaser.discourse.group/t/fixed-time-scene-update/9401) - confirmed no built-in fixed timestep

### Tertiary (LOW confidence)
- Camera easing parameters (acceleration/drag/maxSpeed values) -- based on general game dev conventions, needs tuning during implementation

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Official template pins exact versions; Phaser 3.90 is final stable release
- Architecture: HIGH - Accumulator pattern is well-established (Gaffer on Games); Phaser tilemap and camera APIs are mature
- Pitfalls: HIGH - Documented in Phaser issues and community forums with known solutions
- Discretion items: MEDIUM - Tick rate and easing params are informed recommendations that need play-testing

**Research date:** 2026-03-04
**Valid until:** 2026-06-04 (90 days -- Phaser 3.90 is the final v3 release, stack is frozen)
