# Phase 2: Resource Production - Context

**Gathered:** 2026-03-09
**Status:** Ready for planning

<domain>
## Phase Boundary

Players can place quarries and conveyor belts on the grid, see letters being produced and physically moving along belt paths. Includes ghost preview for placement, demolish capability, and backpressure when belts are full. No assemblers, inserters, or word recipes — those are Phase 3.

Requirements: PROD-01, TRNS-01, TRNS-02, GRID-02, GRID-03

</domain>

<decisions>
## Implementation Decisions

### Quarry Design
- 2x2 tile multi-tile structures at scattered fixed positions across the 64x64 map
- 8-10 quarries for common English letters only: E, T, A, O, I, N, S, R, H, L
- Additional letters unlock via tech tree in Phase 4 — no quarry should be inaccessible for goal words (goal words must only use letters that have available quarries)
- Steady drip production: 1 letter every ~30 ticks (~2 seconds at 15 tps), all quarries same rate
- Letter the quarry produces is displayed on the quarry sprite
- Output direction is fixed per quarry, with output side visually marked

### Belt Placement & Behavior
- Click-drag to paint belt paths (direction follows drag direction)
- Single click also works for fine-tuning individual tiles (click without drag = single placement)
- Animated chevron/arrow marks on belt surface show flow direction, scrolling in direction of travel
- Auto-corner insertion when drag changes direction (90-degree turns only)
- Belts auto-connect to adjacent belt endpoints and quarry outputs
- Backpressure system: items stack up at dead ends, belts jam, quarry pauses production when output tile is occupied

### Building Placement UX
- Bottom toolbar with building icons: Belt, Quarry (if applicable), Demolish
- Number hotkeys (1, 2, 3...) for quick tool selection, ESC to deselect
- Active tool highlighted in toolbar
- Ghost preview: semi-transparent tinted sprite follows cursor, snapped to grid
  - Green tint = valid placement
  - Red tint = blocked/occupied (with X mark)
- Placement on occupied tiles is BLOCKED — must demolish first, then place new building
- Demolish is a tool mode: select from toolbar or press Delete key
  - Click to demolish single building
  - Click+drag to demolish multiple buildings along path
  - Items on demolished belts vanish
  - No refund (keep simple for now)

### Letter Item Visuals
- Small solid-colored blocks (~16x16px on 32x32 tile, ~50% tile size)
- Scrabble tile / alphabet block style: colored background with dark letter character (high contrast)
- Unique color per letter — 26 distinct colors that feel cohesive within the warm retro palette
- Smooth sliding animation between tiles using TickEngine alpha interpolation (not tile-snapping)
- When backed up, items can overlap slightly on belt tiles

### Claude's Discretion
- Specific quarry map positions (scattered, interesting routing puzzles)
- Quarry output direction per position
- The 26-color letter palette (must be cohesive, distinguishable, warm-toned, high contrast for letter readability)
- Belt speed (tiles per tick — tune for satisfying visual movement)
- Belt chevron animation details (frame count, scroll speed)
- Toolbar visual styling (fits retro SNES aesthetic from Phase 1)
- Ghost preview opacity level and X mark design for invalid placement
- Demolish cursor icon design
- Item overlap behavior when backed up (slight offset vs stacking)
- Depth layering for buildings, belts, and items

</decisions>

<specifics>
## Specific Ideas

- Goal words must only require letters from available quarries — never present a goal the player can't complete with current letter availability
- "Generating new letters from common letter recipes" — deferred idea for future consideration
- Scrabble tile / alphabet block aesthetic for letter items — ties into the "AlphabetSoup" name and playful-but-deep philosophy from Phase 1
- Click-drag for fast belt runs + single-click for fine-tuning provides best of both interaction modes
- Backpressure (items blocking, quarries pausing) creates visible feedback that routing needs fixing — classic factory game tension

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `Grid.ts`: Pure TS 64x64 Uint8Array tile storage with `getTile`/`setTile`, `pixelToTile`/`tileToPixel`/`tileToCenter` coordinate converters. Can store building type per tile (0-255 range). Phase 2 needs: multi-tile occupancy for 2x2 quarries, building type encoding.
- `TickEngine.ts`: Fixed 15 tps with spiral-of-death protection. `alpha` property (0-1) available for render interpolation — key for smooth letter sliding animation. Tick callbacks where quarry production and belt movement will plug in.
- `DebugOverlay.ts`: UI camera pattern (dedicated camera with `setScroll(0,0)` that never moves). Reuse this pattern for the bottom toolbar.
- `GridRenderer.ts`: Programmatic tilemap pattern. Depth layering established: ground at 0, grid lines at 1, debug at 1000.

### Established Patterns
- Simulation/render split: pure TS logic in `systems/` and `entities/`, Phaser-only in `*Renderer.ts` files
- TDD: tests next to source, pure logic fully testable without Phaser
- Constants in `constants.ts`: all magic numbers imported from there
- Asset keys: kebab-case (`"ground-tile"`)
- Scene keys: PascalCase

### Integration Points
- `GameScene.create()`: Instantiate new systems (BuildingSystem, QuarrySystem, BeltSystem) and renderers
- `GameScene.update()` tick callback: Call `quarrySystem.tick()`, `beltSystem.tick()` inside TickEngine callback
- `BootScene.ts`: Load new assets (quarry sprite, belt sprites, letter block sprites)
- `constants.ts`: Add quarry production interval, belt speed, letter colors, building types
- Mouse/pointer events in GameScene for placement interaction (pointerdown, pointermove, pointerup)
- Grid tile values: need encoding scheme for building types (belt directions, quarry tiles)

</code_context>

<deferred>
## Deferred Ideas

- Generating new letters from common letter recipes (crafting rare letters from common ones) — potential future phase mechanic
- Belt speed tiers (slow/medium/fast) — v2 requirement TRNS-07
- Building refund on demolish — revisit when economy is implemented in Phase 4

</deferred>

---

*Phase: 02-resource-production*
*Context gathered: 2026-03-09*
