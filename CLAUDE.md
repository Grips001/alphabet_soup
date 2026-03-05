# AlphabetSoup

A factory automation word game built with Phaser 3 + TypeScript + Vite. Players place quarries, belts, inserters, and assemblers to route letter tiles into assemblers that produce words.

## Quick Reference

- **Stack**: Phaser 3.90, TypeScript 5.7, Vite 6.3, Vitest, Bun
- **Deploy**: Vercel (auto-deploys from `main` via GitHub integration)
- **Live URL**: https://alphabetsoup-snowy.vercel.app
- **CI**: GitHub Actions runs `bun run type-check` and `bun run test` on every push

## Commands

```bash
bun install          # Install dependencies
bun run dev          # Start dev server (localhost:5173)
bun run build        # Type-check + production build
bun run test         # Run tests once
bun run test:watch   # Run tests in watch mode
bun run type-check   # TypeScript check only
bun run preview      # Preview production build locally
```

## Architecture

### Core Principle: Simulation/Render Split

Game logic is **pure TypeScript** — no Phaser imports. Rendering is a separate layer that reads game state. This keeps logic testable without mocking Phaser.

```
src/
  main.ts                      # Entry point — creates Phaser.Game
  game/
    config.ts                  # Phaser game configuration
    constants.ts               # Shared constants (TILE_SIZE, WORLD_TILES, TICK_RATE, etc.)
    systems/                   # Pure game systems (no Phaser imports)
      TickEngine.ts            # Fixed-timestep simulation accumulator
      CameraController.ts      # Camera pan/zoom (exception: needs Phaser input)
      camera-utils.ts          # Pure zoom math helpers
    world/                     # World data + rendering
      Grid.ts                  # Tile data model (pure TS, Uint8Array storage)
      GridRenderer.ts          # Phaser tilemap renderer for Grid
    scenes/
      BootScene.ts             # Asset preloading
      GameScene.ts             # Main scene — wires systems together
    ui/
      DebugOverlay.ts          # Backtick-toggled FPS/tick/tile overlay (dedicated UI camera)
    entities/                  # (Phase 2+) Game entities: quarries, belts, inserters, assemblers
```

### Key Patterns

- **TickEngine**: Fixed-timestep accumulator. Game logic runs in tick callbacks, not in `update()`. Tick rate is 15/sec, independent of framerate. Spiral-of-death protection caps accumulated ticks.
- **Grid**: 64x64 tile world. `Uint8Array` for tile occupancy. Coordinate helpers convert pixel<->tile. All future buildings snap to grid positions.
- **Scenes**: `BootScene` loads assets, then starts `GameScene`. GameScene creates all systems and runs the update loop.
- **UI Camera**: Debug overlay uses a separate Phaser camera (`setScroll(0,0)`) that never moves. Future HUD elements should use this same pattern — add objects to the UI camera, ignore them on the main camera.
- **Constants**: All magic numbers live in `constants.ts`. Import from there, never hardcode values.

### Camera

- WASD + arrow keys for panning (SmoothedKeyControl with easing)
- Scroll wheel zooms toward cursor position (anchor-based)
- Middle-click drag for repositioning
- Zoom range: 1.0x - 3.0x
- Camera bounds locked to world edges (no void visible)

## Coding Conventions

### TypeScript

- Strict mode enabled, no `any` types
- Use `import type` for type-only imports
- Explicit return types on public methods
- No default exports (except `main.ts` entry point)
- Named exports only: `export class Foo`, `export function bar`

### Testing (TDD)

- **Write tests first** — every new system or data model gets tests before implementation
- Tests live next to source: `Foo.ts` -> `Foo.test.ts`
- Pure game logic (systems/, world/ data models) must be testable without Phaser
- Use Vitest with `globals: true` (no need to import `describe`/`it`/`expect`)
- Minimum: test the contract (inputs/outputs), edge cases, and integration points

### File Organization

- **One class per file**, filename matches class name
- **systems/**: Pure game logic (TickEngine, future: BuildingSystem, BeltSystem)
- **world/**: Data models + their renderers (Grid/GridRenderer, future: Entity/EntityRenderer)
- **scenes/**: Phaser scenes only
- **ui/**: HUD and overlay elements
- **entities/**: Entity types (Phase 2+: Quarry, Belt, Inserter, Assembler)

### Phaser-Specific

- Never import Phaser in pure game logic files — keep simulation testable
- Asset keys: kebab-case (e.g., `ground-tile`, `belt-horizontal`)
- Scene keys: PascalCase matching class name (e.g., `BootScene`, `GameScene`)
- Use `scene.make.tilemap()` for programmatic tilemaps, not JSON
- Prevent browser default behavior on game inputs (middle-click, context menu, function keys)

### Git

- Conventional commits: `type(scope): description`
- Types: `feat`, `fix`, `test`, `refactor`, `chore`, `docs`
- Scope: plan ID during GSD execution (e.g., `01-02`), or module name otherwise (e.g., `camera`, `grid`)
- Push to `main` — Vercel auto-deploys, CI runs automatically

## Browser Compatibility

- Target: Modern desktop browsers (Chrome, Edge, Firefox)
- No mobile/touch support (out of scope per requirements)
- Avoid browser-reserved shortcuts: F1-F12, Ctrl+key combos
- Debug overlay: backtick (`` ` ``) key
- Game uses WebGL (Phaser AUTO mode with WebGL preference)

## Visual Style

- Muted forest green palette for ground tiles
- Dark green background (`#2e3d36`)
- Subtle black grid lines (12% opacity)
- Pixel art rendering (`pixelArt: true`, `roundPixels: true`)
- Clean, readable aesthetic — avoid noisy textures
- Future entities should contrast clearly against the green ground

## Planning

Project planning lives in `.planning/` — managed by GSD workflow. See `.planning/ROADMAP.md` for the full 5-phase plan and `.planning/REQUIREMENTS.md` for all requirement IDs.

Current status: Phase 1 complete, Phase 2 (Resource Production) next.
