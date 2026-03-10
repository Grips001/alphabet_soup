# Phase 2: Resource Production - Research

**Researched:** 2026-03-10
**Domain:** Factory game entities (quarries, conveyor belts, items), placement UX, Phaser sprite/graphics, interpolated movement
**Confidence:** HIGH — all findings grounded in existing codebase, established game-dev patterns, and Phaser 3 documentation

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Quarry Design**
- 2x2 tile multi-tile structures at scattered fixed positions across the 64x64 map
- 8-10 quarries for common English letters only: E, T, A, O, I, N, S, R, H, L
- Steady drip production: 1 letter every ~30 ticks (~2 seconds at 15 tps), all quarries same rate
- Letter the quarry produces is displayed on the quarry sprite
- Output direction is fixed per quarry, with output side visually marked

**Belt Placement & Behavior**
- Click-drag to paint belt paths (direction follows drag direction)
- Single click also works for fine-tuning individual tiles
- Animated chevron/arrow marks on belt surface show flow direction, scrolling in direction of travel
- Auto-corner insertion when drag changes direction (90-degree turns only)
- Belts auto-connect to adjacent belt endpoints and quarry outputs
- Backpressure system: items stack up at dead ends, belts jam, quarry pauses production when output tile is occupied

**Building Placement UX**
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
  - No refund

**Letter Item Visuals**
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

### Deferred Ideas (OUT OF SCOPE)
- Generating new letters from common letter recipes
- Belt speed tiers (slow/medium/fast) — v2 requirement TRNS-07
- Building refund on demolish — revisit when economy is implemented in Phase 4
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| PROD-01 | Letter quarries at fixed map positions produce a specific letter over time | QuarrySystem tick callback, production interval constant, backpressure flag |
| TRNS-01 | Player can place conveyor belts that move letter items in a direction | BeltSystem with linked-cell item movement, BeltRenderer with chevron animation |
| TRNS-02 | Belts support corners and auto-connect when placed in L-shapes | Belt variant lookup table (N/S/E/W combits -> sprite), drag-direction auto-corner logic |
| GRID-02 | Player can place buildings with ghost preview showing validity | PlacementSystem with pointer events, alpha-tinted ghost sprite, green/red validity tint |
| GRID-03 | Player can demolish placed buildings | Demolish tool mode in PlacementSystem, click/drag demolish, belt item cleanup |
</phase_requirements>

---

## Summary

Phase 2 is the largest and most architecturally critical phase in the project. It introduces four interlocking systems that must be designed to work together: building placement/demolish UX, quarry entities, belt transport, and visual letter items. Getting these right now prevents rewrites in Phase 3.

The simulation/render split established in Phase 1 must be maintained strictly. All game logic (QuarrySystem, BeltSystem, PlacementSystem) lives in pure TypeScript with no Phaser imports. Renderer classes (QuarryRenderer, BeltRenderer, ItemRenderer, ToolbarUI) read from those systems and use Phaser for display only. Every pure logic class gets full unit tests before implementation.

The hardest engineering problem in this phase is the belt item transport system: items need smooth interpolated visual movement (using `TickEngine.alpha`) while the simulation advances in discrete ticks. The BeltPath/segment data structure must be designed upfront — retrofitting it in Phase 3 when inserters are added would be a full rewrite.

**Primary recommendation:** Design and test BeltSystem (with BeltPath + LetterItem data structures) before writing any rendering code. The correct data model makes everything else easy; the wrong one causes cascading rewrites.

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Phaser 3 | 3.90 | Rendering, input events, animation, UI camera | Already in project — no change |
| TypeScript | 5.7 | Pure simulation logic, type safety | Already in project |
| Vitest | 3.x | TDD for all pure systems | Already configured with `globals: true` |

### Rendering Approaches
| Approach | Use Case | Why |
|----------|----------|-----|
| `scene.add.graphics()` | Belt chevrons, ghost preview X mark, toolbar background | Programmatic, no texture needed |
| `scene.add.text()` | Letter on quarry sprite, letter on item block | Phaser text with `setOrigin` for centering |
| `scene.add.rectangle()` | Letter item colored blocks | Programmatic colored rect, no texture needed |
| Phaser.GameObjects.Container | Group belt sprite + chevron | Parent/child transform for belt tiles |
| Spritesheet / atlas | Belt variants (4 directions + 4 corners = 8 frames) | Single texture, frame selection by variant |

**No new npm packages needed.** All required features are in existing stack.

---

## Architecture Patterns

### Recommended Project Structure

```
src/game/
  entities/
    Quarry.ts            # Pure: quarry data, production timer, backpressure
    Quarry.test.ts
    Belt.ts              # Pure: single belt tile data (direction, variant)
    Belt.test.ts
    LetterItem.ts        # Pure: item data (letter, position, progress 0-1)
    LetterItem.test.ts
  systems/
    BuildingSystem.ts    # Pure: building registry, occupancy, place/demolish
    BuildingSystem.test.ts
    BeltSystem.ts        # Pure: belt graph, item movement each tick
    BeltSystem.test.ts
    QuarrySystem.ts      # Pure: quarry tick, production, backpressure
    QuarrySystem.test.ts
    PlacementSystem.ts   # Pure: tool state, ghost validity, drag tracking
    PlacementSystem.test.ts
  renderers/
    QuarryRenderer.ts    # Phaser: quarry sprites + letter label
    BeltRenderer.ts      # Phaser: belt tiles + animated chevrons
    ItemRenderer.ts      # Phaser: letter block rectangles + text
    ToolbarUI.ts         # Phaser: bottom toolbar, tool buttons
    GhostRenderer.ts     # Phaser: ghost preview sprite following cursor
  world/
    Grid.ts              # Existing — extend for multi-tile occupancy
    GridRenderer.ts      # Existing — unchanged
```

### Pattern 1: Building Registry (BuildingSystem)

**What:** Central registry mapping tile positions to building instances. Owns all place/demolish operations. Grid stores tile type codes (for quick lookup); BuildingSystem stores the full entity objects.

**When to use:** Any time a system needs to know "what is at tile (x, y)".

```typescript
// Pure TS — no Phaser
export class BuildingSystem {
  private buildings = new Map<string, Building>();

  place(entity: Building): boolean {
    for (const tile of entity.occupiedTiles()) {
      const key = tileKey(tile.x, tile.y);
      if (this.buildings.has(key)) return false; // blocked
      this.buildings.set(key, entity);
    }
    return true;
  }

  demolish(tx: number, ty: number): Building | null {
    const entity = this.getAt(tx, ty);
    if (!entity) return null;
    for (const tile of entity.occupiedTiles()) {
      this.buildings.delete(tileKey(tile.x, tile.y));
    }
    return entity;
  }

  getAt(tx: number, ty: number): Building | null {
    return this.buildings.get(tileKey(tx, ty)) ?? null;
  }
}

function tileKey(x: number, y: number): string {
  return `${x},${y}`;
}
```

### Pattern 2: Belt Linked-Cell Item Movement

**What:** Each belt tile stores one item slot. On each tick, items try to advance to the next belt in direction. If the next slot is occupied (or is the end), item stays put — this is backpressure. Quarry output tile occupancy check gates production.

**When to use:** The core BeltSystem tick callback.

```typescript
// Called once per TickEngine tick
tick(): void {
  // Process belts in reverse order (farthest from source first)
  // to avoid moving the same item twice in one tick
  for (const belt of this.beltsInReversePropagationOrder()) {
    const item = belt.item;
    if (!item) continue;
    const next = this.getNextBelt(belt);
    if (next && !next.item) {
      next.item = item;
      belt.item = null;
      item.progress = 0; // reset to start of next tile
    }
    // else: item stays, belt is jammed
  }
}
```

**Key insight:** Processing belts farthest-from-source first (reverse propagation order) means items move one tile per tick correctly. Processing source-first causes double-advance bugs.

### Pattern 3: Alpha Interpolation for Smooth Item Movement

**What:** `TickEngine.alpha` (0-1) represents progress between the last tick and the next. Item visual position = lerp(currentTileCenter, nextTileCenter, alpha).

**When to use:** `ItemRenderer.update()` called every frame.

```typescript
// ItemRenderer.update() — called from GameScene.update() after tickEngine.update()
update(alpha: number): void {
  for (const [item, sprite] of this.sprites) {
    const from = grid.tileToCenter(item.tile.x, item.tile.y);
    const to = item.nextTile
      ? grid.tileToCenter(item.nextTile.x, item.nextTile.y)
      : from;
    sprite.x = from.x + (to.x - from.x) * alpha;
    sprite.y = from.y + (to.y - from.y) * alpha;
  }
}
```

**Note:** `item.nextTile` must be snapshotted at tick time so the renderer knows where to interpolate toward. This is the key design requirement for LetterItem.

### Pattern 4: Belt Variant Lookup

**What:** Belt visual appearance (straight N/S, straight E/W, corner NE, corner SE, etc.) is determined at placement time and when neighbors change. Store variant as enum; renderer maps variant to sprite frame.

**When to use:** Whenever a belt is placed or a neighbor belt is demolished.

```typescript
export const enum BeltDirection {
  North = "N", South = "S", East = "E", West = "W"
}

export const enum BeltVariant {
  StraightNS = "straight-ns",
  StraightEW = "straight-ew",
  CornerNE = "corner-ne",
  CornerNW = "corner-nw",
  CornerSE = "corner-se",
  CornerSW = "corner-sw",
}

// Variant = (input direction, output direction) -> sprite frame
const VARIANT_MAP: Record<string, BeltVariant> = {
  "N-N": BeltVariant.StraightNS,
  "S-S": BeltVariant.StraightNS,
  "E-E": BeltVariant.StraightEW,
  "W-W": BeltVariant.StraightEW,
  "N-E": BeltVariant.CornerNE,
  // ... etc
};
```

### Pattern 5: Ghost Preview via PlacementSystem + GhostRenderer

**What:** PlacementSystem is a pure state machine tracking current tool, drag state, and cursor tile. GhostRenderer reads from it each frame and updates the ghost sprite position and tint.

```typescript
// PlacementSystem (pure TS)
export class PlacementSystem {
  currentTool: ToolType = ToolType.None;
  cursorTile: { x: number; y: number } = { x: 0, y: 0 };
  isDragging = false;
  dragPath: Array<{ x: number; y: number }> = [];

  isValidPlacement(tx: number, ty: number, buildingSystem: BuildingSystem): boolean {
    return buildingSystem.getAt(tx, ty) === null;
  }
}

// GhostRenderer (Phaser)
update(placement: PlacementSystem, buildingSystem: BuildingSystem): void {
  const valid = placement.isValidPlacement(
    placement.cursorTile.x,
    placement.cursorTile.y,
    buildingSystem
  );
  this.ghostSprite.setTint(valid ? 0x00ff00 : 0xff0000);
  this.ghostSprite.setAlpha(0.5);
  const px = grid.tileToCenter(placement.cursorTile.x, placement.cursorTile.y);
  this.ghostSprite.setPosition(px.x, px.y);
}
```

### Pattern 6: Multi-Tile Occupancy for 2x2 Quarries

**What:** Quarry occupies a 2x2 block. BuildingSystem registers all 4 tiles under the same quarry reference. Grid.setTile stores the tile type code for all 4 tiles so collision detection is fast.

```typescript
export class Quarry {
  constructor(
    readonly originTile: { x: number; y: number }, // top-left tile
    readonly letter: string,
    readonly outputDirection: BeltDirection,
  ) {}

  occupiedTiles(): Array<{ x: number; y: number }> {
    const { x, y } = this.originTile;
    return [
      { x, y }, { x: x + 1, y },
      { x, y: y + 1 }, { x: x + 1, y: y + 1 }
    ];
  }

  get outputTile(): { x: number; y: number } {
    // Tile adjacent to origin in outputDirection
    // ...
  }
}
```

### Anti-Patterns to Avoid

- **Storing Phaser objects in simulation classes:** Never put a `Phaser.GameObjects.Sprite` inside `Quarry`, `Belt`, or `LetterItem`. Simulation = pure data; rendering = separate class that reads that data.
- **Processing belts source-first:** Causes double-movement bug where an item gets advanced twice in one tick. Always process farthest-from-source first.
- **Hardcoded magic numbers in systems:** Belt speed, production rate, item size, all go in `constants.ts`. CONTEXT.md specifies 30 ticks/production interval — add `QUARRY_PRODUCTION_INTERVAL = 30` to constants.
- **Using world coordinates in simulation:** Simulation tracks tile positions only. World pixel coordinates are only computed in renderer layer.
- **Registering pointer events inside systems:** PlacementSystem is pure state. Pointer event handlers go in GameScene and call `placementSystem.onPointerMove()` etc.
- **Using `scene.cameras.main.ignore()` incorrectly for toolbar:** Toolbar uses the UI camera pattern from DebugOverlay (separate `uiCamera` via `scene.cameras.add()`). Main camera ignores toolbar objects; UI camera ignores world objects.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Colored letter block sprites | Custom texture generator | `scene.add.rectangle()` + `scene.add.text()` | Phaser shapes + text = zero texture management |
| Belt animation timing | Custom timer | Phaser `scene.add.tween()` or texture UV scroll in graphics | Phaser tweens handle frame-independent animation |
| Toolbar button hover states | Custom hit-testing | Phaser `setInteractive()` + `on('pointerover')` | Phaser input system handles all pointer hit-testing |
| Drag gesture detection | Distance/time heuristics | `pointerdown` + `pointermove` + `pointerup` sequence | Standard browser pointer events are reliable |
| Belt graph traversal order | Custom topological sort | Simple "process from farthest downstream" pass over ordered belt list | Factory games use simple ordered-list approach, not full graph algorithms |

**Key insight:** The project has no texture assets beyond the single ground tile. All Phase 2 visuals (quarry body, belt tile, letter item) should be drawn programmatically with Phaser Graphics/Rectangle/Text. This avoids the BootScene asset pipeline complexity and keeps the game vector-like. Sprites can be replaced with pixel art assets in Phase 5 Polish.

---

## Common Pitfalls

### Pitfall 1: Belt Ordering Bug (Double-Move)
**What goes wrong:** Items advance two tiles in one tick instead of one.
**Why it happens:** Processing belt list source-first means the item gets moved to the next belt, then that belt gets processed and moves it again.
**How to avoid:** Build the belt processing order once when belts are placed/removed. Process in reverse (farthest downstream first). Test with a 3-belt chain and verify items advance exactly 1 tile per tick.
**Warning signs:** Item appears to teleport or skip tiles visually.

### Pitfall 2: Alpha Interpolation Jitter
**What goes wrong:** Items stutter or snap when the tick fires.
**Why it happens:** Renderer uses `item.currentTile` for both "from" and "to" positions — doesn't snapshot the "from" position at tick time.
**How to avoid:** `LetterItem` must store both `tile` (current, updated at tick) and `previousTile` (set at tick time before updating `tile`). Renderer lerps from `previousTile` to `tile` using `alpha`.
**Warning signs:** Items don't slide smoothly, they pop from tile to tile.

### Pitfall 3: Multi-Tile Demolish Leaves Orphan Occupancy
**What goes wrong:** Demolishing a quarry by clicking one of its 4 tiles removes that tile's occupancy but leaves the other 3 tiles still marked occupied.
**How to avoid:** `BuildingSystem.demolish(tx, ty)` looks up the entity at that tile, then removes ALL of the entity's `occupiedTiles()`. Never just remove the single clicked tile.
**Warning signs:** Ghost preview shows red/invalid on empty-looking tiles near a demolished quarry.

### Pitfall 4: UI Camera Not Ignoring New World Objects
**What goes wrong:** Belt sprites or item sprites appear floating in the top-left corner of the screen (world objects visible through the UI camera at scroll 0,0).
**Why it happens:** The UI camera from DebugOverlay ignores objects that existed when DebugOverlay was constructed, but not new objects added afterward.
**How to avoid:** `DebugOverlay.ignoreOnUiCamera()` already exists for this purpose. Call it whenever a new world-space game object is added. Alternatively, use a scene-level ignore list approach. Also: toolbar objects must be ignored by main camera via `cameras.main.ignore(toolbarObjects)`.
**Warning signs:** Toolbar buttons appear in the game world; or belt sprites appear top-left corner.

### Pitfall 5: Belt Variant Not Updating on Neighbor Demolish
**What goes wrong:** After demolishing a belt that was connected to a corner, the adjacent belt still shows the corner graphic instead of updating to straight.
**Why it happens:** Belt variant is only computed at placement time, not when neighbors change.
**How to avoid:** After any place or demolish action, call `updateBeltVariant()` on the 4 adjacent tiles. This is a small O(1) local operation.
**Warning signs:** Disconnected belts show wrong direction arrows.

### Pitfall 6: Backpressure Not Propagating to Quarry
**What goes wrong:** Quarry keeps producing items even when the output tile is full, causing item stacking beyond the single-slot design.
**Why it happens:** `QuarrySystem.tick()` doesn't check whether the output tile belt slot is occupied.
**How to avoid:** QuarrySystem must hold a reference to BeltSystem (or BuildingSystem). Before producing, check if the output tile has a belt and if that belt's slot is empty. Only produce if empty.
**Warning signs:** Multiple items appear stacked on the same belt tile at the quarry output.

---

## Code Examples

### Tile Type Encoding for Grid

The existing `Grid` uses `Uint8Array` (values 0-255). Phase 2 needs a scheme:

```typescript
// Add to constants.ts
export const TILE_EMPTY = 0;
export const TILE_QUARRY = 1;      // any quarry tile (entity lookup via BuildingSystem)
export const TILE_BELT_N = 2;      // belt facing North
export const TILE_BELT_S = 3;      // belt facing South
export const TILE_BELT_E = 4;      // belt facing East
export const TILE_BELT_W = 5;      // belt facing West
// Corners: add as needed
export const TILE_BELT_CORNER_NE = 6;
export const TILE_BELT_CORNER_NW = 7;
export const TILE_BELT_CORNER_SE = 8;
export const TILE_BELT_CORNER_SW = 9;

// Production constants
export const QUARRY_PRODUCTION_INTERVAL = 30; // ticks between letter outputs (~2s at 15 tps)
export const BELT_SPEED = 1; // tiles per tick (1 = one tile per tick, adjust for visual feel)

// Item visual
export const ITEM_SIZE = 16; // pixels (half of TILE_SIZE = 32)

// Depth layers
export const DEPTH_GROUND = 0;
export const DEPTH_GRID_LINES = 1;
export const DEPTH_BUILDINGS = 10;
export const DEPTH_ITEMS = 20;
export const DEPTH_GHOST = 30;
export const DEPTH_UI = 1000;
```

### LetterItem Data Structure (Pure TS)

```typescript
// src/game/entities/LetterItem.ts
export class LetterItem {
  tile: { x: number; y: number };
  previousTile: { x: number; y: number }; // for alpha interpolation
  readonly letter: string;

  constructor(letter: string, startTile: { x: number; y: number }) {
    this.letter = letter;
    this.tile = { ...startTile };
    this.previousTile = { ...startTile };
  }

  /** Call at tick time BEFORE updating tile position */
  snapshotPosition(): void {
    this.previousTile = { ...this.tile };
  }
}
```

### Quarry Fixed Positions (Claude's Discretion)

Recommended layout for a 64x64 grid — scattered to create routing challenges. Each quarry is the top-left tile of a 2x2 block. Output directions chosen so belts must be routed around quarry bodies.

```typescript
// src/game/world/quarryLayout.ts — pure data, no Phaser
export const QUARRY_DEFINITIONS = [
  { letter: "E", origin: { x:  4, y:  4 }, output: "S" },
  { letter: "T", origin: { x: 30, y:  4 }, output: "S" },
  { letter: "A", origin: { x: 58, y:  4 }, output: "S" },
  { letter: "O", origin: { x:  4, y: 30 }, output: "E" },
  { letter: "I", origin: { x: 58, y: 20 }, output: "W" },
  { letter: "N", origin: { x: 20, y: 58 }, output: "N" },
  { letter: "S", origin: { x: 40, y: 58 }, output: "N" },
  { letter: "R", origin: { x: 58, y: 58 }, output: "N" },
  { letter: "H", origin: { x:  4, y: 58 }, output: "N" },
  { letter: "L", origin: { x: 30, y: 30 }, output: "E" },
] as const;
```

### Drag-to-Place Belt Logic

```typescript
// In PlacementSystem or GameScene pointer handlers
onPointerMove(worldX: number, worldY: number): void {
  const tile = grid.pixelToTile(worldX, worldY);
  this.cursorTile = tile;
  if (this.isDragging && this.currentTool === ToolType.Belt) {
    const last = this.dragPath[this.dragPath.length - 1];
    if (!last || last.x !== tile.x || last.y !== tile.y) {
      // Determine direction from last tile to this tile
      this.dragPath.push(tile);
    }
  }
}

onPointerUp(): void {
  if (this.isDragging && this.dragPath.length > 0) {
    // Convert path to belt placements with auto-corner logic
    this.commitBeltPath(this.dragPath);
  }
  this.isDragging = false;
  this.dragPath = [];
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Per-frame item position update | Tick-based simulation + alpha interpolation | Established in Phase 1 | Items move at correct game speed independent of framerate |
| Direct sprite manipulation in game logic | Simulation/render split | Established in Phase 1 | Logic is testable; renderers are Phaser-only |
| JSON tilemap files | Programmatic tilemaps | Phase 1 GridRenderer | No asset pipeline for tile data |

**No deprecated approaches in scope.** The Phase 1 patterns are current and correct for this project.

---

## Open Questions

1. **Belt speed tuning**
   - What we know: BELT_SPEED = 1 tile/tick = 15 tiles/second at 15 tps — very fast visually
   - What's unclear: Whether 1 tile/tick feels satisfying or too fast. At TILE_SIZE=32, items would cross the screen in ~4 seconds at zoom 1x. 0.5 tiles/tick (every 2 ticks) may be more satisfying.
   - Recommendation: Start with BELT_SPEED = 1 tile per tick in constants.ts, observe in-game, adjust the constant. The data model supports fractional progress if needed.

2. **Belt segment ordering for backpressure propagation**
   - What we know: Items must process farthest-first. For a linear chain, ordering is straightforward. For branching (Phase 3), more complex.
   - What's unclear: Whether Phase 2 needs to handle Y-junctions (it shouldn't — that's Phase 3 splitters).
   - Recommendation: Keep BeltSystem to linear chains only in Phase 2. Store processing order as a sorted array rebuilt on any place/demolish. Do NOT implement general graph traversal now.

3. **UI camera management as scene grows**
   - What we know: `DebugOverlay.ignoreOnUiCamera()` exists but requires explicit calls per new object.
   - What's unclear: Whether managing this manually will scale for dozens of belt/item sprites.
   - Recommendation: In GameScene.create(), establish a pattern where all world-space renderers call `debugOverlay.ignoreOnUiCamera(sprite)` for each created sprite. Alternatively, wrap in a helper method on GameScene. The DebugOverlay pattern was designed to support this.

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 3.x |
| Config file | `vite.config.ts` (test section with `globals: true`, `environment: "node"`) |
| Quick run command | `bun test` |
| Full suite command | `bun test` (then `bun run build` for type-check) |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| PROD-01 | Quarry produces letter every N ticks | unit | `bun test src/game/entities/Quarry.test.ts` | ❌ Wave 0 |
| PROD-01 | Quarry pauses when output tile occupied (backpressure) | unit | `bun test src/game/entities/Quarry.test.ts` | ❌ Wave 0 |
| PROD-01 | QuarrySystem.tick() advances production timer | unit | `bun test src/game/systems/QuarrySystem.test.ts` | ❌ Wave 0 |
| TRNS-01 | BeltSystem.tick() moves item one tile per tick | unit | `bun test src/game/systems/BeltSystem.test.ts` | ❌ Wave 0 |
| TRNS-01 | Item stays when next slot occupied (backpressure) | unit | `bun test src/game/systems/BeltSystem.test.ts` | ❌ Wave 0 |
| TRNS-01 | LetterItem.snapshotPosition() saves previousTile | unit | `bun test src/game/entities/LetterItem.test.ts` | ❌ Wave 0 |
| TRNS-02 | Belt auto-corner variant computed from input/output dirs | unit | `bun test src/game/entities/Belt.test.ts` | ❌ Wave 0 |
| TRNS-02 | Drag path generates correct belt variants at turns | unit | `bun test src/game/systems/BeltSystem.test.ts` | ❌ Wave 0 |
| GRID-02 | BuildingSystem.place() returns false if tile occupied | unit | `bun test src/game/systems/BuildingSystem.test.ts` | ❌ Wave 0 |
| GRID-02 | PlacementSystem tracks cursor tile and drag state | unit | `bun test src/game/systems/PlacementSystem.test.ts` | ❌ Wave 0 |
| GRID-03 | BuildingSystem.demolish() removes all tiles of 2x2 quarry | unit | `bun test src/game/systems/BuildingSystem.test.ts` | ❌ Wave 0 |
| GRID-03 | Demolishing belt removes its item | unit | `bun test src/game/systems/BuildingSystem.test.ts` | ❌ Wave 0 |

All renderer classes (QuarryRenderer, BeltRenderer, ItemRenderer, ToolbarUI, GhostRenderer) are Phaser-dependent and verified visually — no unit tests needed per project rules.

### Sampling Rate
- **Per task commit:** `bun test`
- **Per wave merge:** `bun test && bun run build`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `src/game/entities/Quarry.test.ts` — covers PROD-01 production timing + backpressure
- [ ] `src/game/entities/Quarry.ts` — Quarry entity class
- [ ] `src/game/entities/Belt.test.ts` — covers TRNS-02 variant logic
- [ ] `src/game/entities/Belt.ts` — Belt entity class
- [ ] `src/game/entities/LetterItem.test.ts` — covers TRNS-01 interpolation snapshot
- [ ] `src/game/entities/LetterItem.ts` — LetterItem class
- [ ] `src/game/systems/BuildingSystem.test.ts` — covers GRID-02, GRID-03
- [ ] `src/game/systems/BuildingSystem.ts`
- [ ] `src/game/systems/BeltSystem.test.ts` — covers TRNS-01, TRNS-02
- [ ] `src/game/systems/BeltSystem.ts`
- [ ] `src/game/systems/QuarrySystem.test.ts` — covers PROD-01
- [ ] `src/game/systems/QuarrySystem.ts`
- [ ] `src/game/systems/PlacementSystem.test.ts` — covers GRID-02
- [ ] `src/game/systems/PlacementSystem.ts`
- [ ] `src/game/entities/` directory — does not exist yet

---

## Sources

### Primary (HIGH confidence)
- Codebase direct inspection — `Grid.ts`, `TickEngine.ts`, `GridRenderer.ts`, `DebugOverlay.ts`, `GameScene.ts`, `BootScene.ts`, `constants.ts`, `vite.config.ts`, `package.json`
- CONTEXT.md — locked decisions and discretion areas for Phase 2
- REQUIREMENTS.md — requirement IDs and descriptions
- Established project patterns from Phase 1 (sim/render split, TDD, constants)

### Secondary (MEDIUM confidence)
- Factory automation game design patterns (Factorio-style belt mechanics) — backpressure, reverse-propagation ordering, item slot per belt tile — widely documented in game dev literature and the game's own design doc notes

### Tertiary (LOW confidence)
- None. All research grounded in direct codebase inspection and locked design decisions.

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — directly inspected package.json and existing source files
- Architecture: HIGH — patterns derived from existing Phase 1 patterns + well-understood factory game mechanics
- Pitfalls: HIGH — derived from direct analysis of interaction between the proposed data structures and the sim/render split constraint
- Quarry positions: MEDIUM — specific coordinates are Claude's discretion; functional but may need gameplay tuning

**Research date:** 2026-03-10
**Valid until:** 2026-04-10 (stable tech stack, no external dependencies being added)
