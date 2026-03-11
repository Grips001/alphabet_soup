# Phase 3: Factory Loop - Research

**Researched:** 2026-03-11
**Domain:** Game simulation systems — Inserter, Assembler, Splitter, UndergroundBelt, word dictionary
**Confidence:** HIGH (codebase fully readable; patterns well-established; decisions locked in CONTEXT.md)

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Inserter Mechanics**
- Fixed-direction arm, 1x1 tile. Direction set with R key during placement (cycles N/E/S/W)
- Standard inserter: picks up from 1 adjacent tile, drops on 1 adjacent tile
- Long-arm inserter: separate building type, picks up 1 or 2 tiles away, always drops 2 tiles away
- Long-arm pickup range toggled by clicking the placed inserter (Bob's Adjustable Inserters style)
- Both inserter types are clickable after placement — establishes click-to-configure pattern
- Transfer speed: every 8 ticks (~0.5s at 15 tps)
- Animated arm swing from pickup side to dropoff side while holding the letter item
- Can transfer between any two tile types: belt↔belt, belt↔machine, machine↔belt
- Smart filter when feeding a recipe-assigned assembler: inserter only grabs letters matching recipe; unneeded letters pass by on the belt
- Without a recipe target: grabs first available letter
- Long-arm inserter entity built in Phase 3 but locked in toolbar UI until Phase 4

**Assembler Design**
- 3x3 tile footprint with 12 orthogonal edge-adjacent tiles for inserter access (3 per side)
- Inserters must face N/E/S/W directly into an assembler edge — no diagonal insertion
- All sides accept both input and output — inserter direction determines feed-in vs pull-out
- Only 1 inserter per adjacent tile (naturally enforced by BuildingSystem)
- Click a placed assembler to open a word list panel showing available recipes with letter requirements
- Unordered letter input: assembler accepts letters in any order, collects all needed letters then produces
- Each letter instance = 1 item needed (e.g., "SEE" needs S×1 + E×2 = 3 items)
- Assembler rejects letters it doesn't need — inserter checks before depositing, holds the letter until a slot opens
- Assembly time scales with word length — longer words take more ticks once all letters are collected
- Immediate reset after the completed word item is pulled out by an output inserter
- Completed word items output via inserter onto belts (routable like letter items)

**Belt Splitter**
- 1x2 tile footprint (two tiles side-by-side)
- Auto-detects mode: 1-in/2-out = splitter, 2-in/1-out = merger, 2-in/2-out = balancer
- Default distribution: alternating 1:1 (items alternate between outputs)
- No manual mode configuration — connection topology determines behavior

**Underground Belts**
- Paired entry/exit placement: select tool, click to place entry (R key for direction), then click within valid range for exit
- Same direction only — no turning underground
- Items travel with tick-based delay (1 tick per tunnel tile) — not instant teleport
- Any building can be placed on tiles above the tunnel
- Ghost preview shows valid exit range; red ghost if out of range

**Word Dictionary**
- All words limited to available quarry letters: E, T, A, O, I, N, S, R, H, L
- Hybrid tier system: primary grouping by letter count, secondary by unique letter count
  - Fewer unique letters = easier (e.g., "SEE" easier than "SET")
- Tier 1: 3-letter words, Tier 2: 4-letter words, Tier 3: 5-letter words
- Dictionary expands as new quarry letters unlock in Phase 4

**Word Item Visuals**
- Multi-letter block showing full word text (e.g., [CAT]) — visually wider than single letter tiles
- Same color palette as letter items (not a distinct golden/special color)
- Occupies 1 belt tile for transport (same slot size as letter items, just renders wider)

**Toolbar & Hotkeys**
- Flat row, all tools visible: 1=Belt, 2=Splitter, 3=Underground, 4=Inserter, 5=Assembler
- Demolish separated by visual gap: X=Demolish (Delete key also works as alternate binding)
- ESC to deselect any tool
- Long-arm inserter slot: Claude's discretion (greyed out teaser vs hidden until unlocked)

### Claude's Discretion
- Assembler progress display (letter slots filling in, progress bar, or other approach)
- Standard inserter click-panel content (info display for Phase 3)
- Underground belt max tunnel distance
- Word dictionary size and specific word selection
- Long-arm inserter toolbar appearance when locked
- Assembly time formula (ticks per word length)
- Inserter arm swing animation details (frame count, rotation speed)
- Splitter/underground belt sprite designs within retro aesthetic
- Assembler sprite design and recipe display layout

### Deferred Ideas (OUT OF SCOPE)
- Priority splitter / overflow routing — future unlock via tech tree or progression
- Filter splitter (route specific letters to specific outputs) — future unlock
- Word-to-word chaining: assembler outputs as inputs to higher-tier assemblers (v2 PROD-04)
- Generating new letters from common letter recipes
- Long-arm inserter UI unlock — Phase 4 tech tree gates access
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| TRNS-03 | Player can place inserters that transfer items between belts and machines | InserterSystem (pure TS) + InserterRenderer; uses BeltSystem.getBeltAt() and BuildingSystem.getAt(); tick-based transfer with smart filter logic |
| TRNS-04 | Player can place belt splitters that divide item flow | SplitterSystem (pure TS) + SplitterRenderer; 1x2 Building in BuildingSystem; BeltSystem extended to recognize splitter output logic |
| TRNS-05 | Player can place underground belts that tunnel under obstacles | UndergroundBeltSystem (pure TS) + renderer; two-click placement flow in PlacementSystem; tick-delayed item transit buffer |
| PROD-02 | Player can place assembler machines and assign a word recipe | Assembler entity (3x3 Building) + AssemblerSystem; click-to-configure panel UI via Phaser scene overlay |
| PROD-03 | Assemblers consume correct letters and output a completed word item | AssemblerSystem.tick() with ingredient slot management, WordItem entity, output via inserter |
| WORD-01 | Game includes a curated dictionary of common English words organized by tier | Static data file in src/game/data/wordDictionary.ts; tier 1/2/3 by letter count, secondary sort by unique letter count |
| WORD-02 | Assembler recipes require feeding specific letters to produce a word | WordRecipe type; AssemblerSystem checks ingredient slots vs recipe; inserter smart-filter reads assembler state |
</phase_requirements>

---

## Summary

Phase 3 completes the full factory automation loop by adding the four missing building types — inserters, assemblers, splitters, and underground belts — plus a word dictionary that provides recipes. All decisions are locked in CONTEXT.md; research focuses on implementation patterns that fit the established codebase.

The codebase has a clear simulation/render split with pure TypeScript systems and Phaser renderers. The existing `Building` interface, `BuildingSystem`, `BeltSystem`, `PlacementSystem`, and `ToolbarUI` all need targeted extensions — not rewrites. The primary complexity in this phase is the interaction protocol between InserterSystem and AssemblerSystem (smart filtering, ingredient slots, transfer timing), plus the two-click underground belt placement UX.

**Primary recommendation:** Build each new system in isolation with full TDD first (InserterSystem, AssemblerSystem, SplitterSystem, UndergroundBeltSystem, WordDictionary data), then integrate into GameScene. The PlacementSystem rotation (R key) and two-click mode (underground) are the most novel UX patterns relative to existing Phase 2 code.

---

## Standard Stack

### Core (unchanged from previous phases)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Phaser 3 | 3.90 | Rendering, input, cameras | Project baseline |
| TypeScript | 5.7 | Strict typing, no `any` | Project baseline |
| Vitest | current | Pure-TS system tests | Project baseline |
| Bun | current | Package manager, test runner | Project baseline |

### No new dependencies required
Phase 3 requires no new npm packages. All needed functionality is achievable with Phaser's existing graphics/text/container API and pure TypeScript logic.

---

## Architecture Patterns

### Recommended Project Structure After Phase 3
```
src/game/
  data/
    wordDictionary.ts        # Static tiered word list (WORD-01)
  entities/
    Belt.ts                  # (existing)
    LetterItem.ts            # (existing)
    Quarry.ts                # (existing)
    Inserter.ts              # NEW: 1x1 building, direction + state
    LongArmInserter.ts       # NEW: 1x1 building, extended reach variant
    Assembler.ts             # NEW: 3x3 building, ingredient slots, recipe
    Splitter.ts              # NEW: 1x2 building, alternating output state
    UndergroundBelt.ts       # NEW: entry/exit pair (each 1x1)
    WordItem.ts              # NEW: output item from assembler
  systems/
    BeltSystem.ts            # (existing, extend for splitter output recognition)
    BuildingSystem.ts        # (existing, unchanged)
    InserterSystem.ts        # NEW: transfer tick logic, smart filter
    AssemblerSystem.ts       # NEW: ingredient collection, assembly timer, output
    SplitterSystem.ts        # NEW: alternating distribution, auto-mode detection
    UndergroundBeltSystem.ts # NEW: paired entry/exit, tick-delayed buffer
  renderers/
    BeltRenderer.ts          # (existing)
    ItemRenderer.ts          # (existing, extend for WordItem)
    QuarryRenderer.ts        # (existing)
    GhostRenderer.ts         # (extend for multi-tile ghost, range preview)
    InserterRenderer.ts      # NEW: arm sprite, rotation, swing animation
    AssemblerRenderer.ts     # NEW: 3x3 sprite, progress display, recipe panel
    SplitterRenderer.ts      # NEW: 1x2 sprite
    UndergroundBeltRenderer.ts # NEW: entry/exit sprites, tunnel indicator
    ToolbarUI.ts             # (extend: 5 tools + gap + demolish, locked slot)
```

### Pattern 1: New System Integration (established by Phase 2)
**What:** Each new game system follows the same three-file pattern: `Entity.ts` (pure data), `System.ts` (pure tick logic), `Renderer.ts` (Phaser visual).
**When to use:** Every new building type.
**Example:**
```typescript
// Entity: pure data, no Phaser
export class Inserter implements Building {
  readonly type = "inserter" as const;
  direction: InserterDirection;
  tileX: number;
  tileY: number;
  ticksSinceLastTransfer: number = 0;
  heldItem: LetterItem | null = null;
  // ...
  occupiedTiles(): Array<{ x: number; y: number }> {
    return [{ x: this.tileX, y: this.tileY }];
  }
}

// System: pure tick logic
export class InserterSystem {
  private inserters: Inserter[] = [];

  tick(beltSystem: BeltSystem, buildingSystem: BuildingSystem): void {
    for (const inserter of this.inserters) {
      inserter.ticksSinceLastTransfer++;
      if (inserter.ticksSinceLastTransfer >= INSERTER_TRANSFER_INTERVAL) {
        this.tryTransfer(inserter, beltSystem, buildingSystem);
      }
    }
  }
}

// Renderer: Phaser only — reads entity state
export class InserterRenderer {
  // Uses TickEngine.alpha for arm swing interpolation
}
```

### Pattern 2: Inserter Smart Filter Logic
**What:** When an inserter's drop target is an assembler with a recipe, check which letters are still needed before picking up from the belt.
**When to use:** InserterSystem.tryTransfer() when target is an Assembler.
**Example:**
```typescript
private canDeposit(inserter: Inserter, target: Assembler, item: LetterItem): boolean {
  if (target.recipe == null) return true; // No recipe — accept any letter
  const needed = target.neededCount(item.letter);
  return needed > 0; // Only pick up if assembler still needs this letter
}
```

### Pattern 3: Assembler Ingredient Slots
**What:** Assembler holds a map of `{ letter → count }` for collected ingredients. When all required letters are collected, starts assembly timer.
**When to use:** AssemblerSystem.tick() and when an inserter deposits an item.
**Example:**
```typescript
export class Assembler implements Building {
  readonly type = "assembler" as const;
  recipe: WordRecipe | null = null;
  collectedIngredients: Map<string, number> = new Map();
  assemblyTicksRemaining: number = 0;
  outputItem: WordItem | null = null;

  neededCount(letter: string): number {
    if (this.recipe == null) return 0;
    const required = this.recipe.letterCounts.get(letter) ?? 0;
    const collected = this.collectedIngredients.get(letter) ?? 0;
    return Math.max(0, required - collected);
  }

  isReadyToAssemble(): boolean {
    if (this.recipe == null) return false;
    for (const [letter, count] of this.recipe.letterCounts) {
      if ((this.collectedIngredients.get(letter) ?? 0) < count) return false;
    }
    return true;
  }
}
```

### Pattern 4: WordRecipe Data Structure
**What:** Recipe encodes a word as a map of letter → required count, enabling O(1) lookup for smart filter.
**Example:**
```typescript
export interface WordRecipe {
  word: string;
  tier: 1 | 2 | 3;
  letterCounts: Map<string, number>;
  uniqueLetterCount: number; // secondary sort key within tier
}

// Builder helper:
function makeRecipe(word: string, tier: 1 | 2 | 3): WordRecipe {
  const letterCounts = new Map<string, number>();
  for (const ch of word) {
    letterCounts.set(ch, (letterCounts.get(ch) ?? 0) + 1);
  }
  return { word, tier, letterCounts, uniqueLetterCount: letterCounts.size };
}
```

### Pattern 5: Underground Belt Tick Buffer
**What:** Items entering an underground entry tile are placed into a `buffer: Array<{item, ticksRemaining}>`. Each tick decrements `ticksRemaining`. When `ticksRemaining === 0`, item moves to the exit belt.
**When to use:** UndergroundBeltSystem.tick()
**Example:**
```typescript
export class UndergroundBelt implements Building {
  readonly type = "underground-entry" | "underground-exit"; // separate classes or union
  direction: BeltDirection;
  pair: UndergroundBelt | null = null; // linked partner
  buffer: Array<{ item: LetterItem | WordItem; ticksRemaining: number }> = [];
  tileX: number;
  tileY: number;
  tunnelLength: number; // in tiles
}
```

### Pattern 6: Splitter Alternating Output State
**What:** Splitter tracks which output received the last item and toggles.
**Example:**
```typescript
export class Splitter implements Building {
  readonly type = "splitter" as const;
  direction: BeltDirection; // primary belt direction
  lastOutputSide: "left" | "right" = "left"; // alternation state

  nextOutputSide(): "left" | "right" {
    this.lastOutputSide = this.lastOutputSide === "left" ? "right" : "left";
    return this.lastOutputSide;
  }
  occupiedTiles(): Array<{ x: number; y: number }> {
    // Returns both tiles (perpendicular to direction)
  }
}
```

### Pattern 7: PlacementSystem Rotation (R Key)
**What:** PlacementSystem gains a `placementDirection` state for directional buildings. R key cycles N→E→S→W.
**When to use:** Inserter, underground belt entry placement.
**Integration:** GameScene keyboard handler calls `placementSystem.rotateDirection()`. GhostRenderer reads `placementSystem.placementDirection` to draw rotated ghost.

### Pattern 8: PlacementSystem Two-Click Mode (Underground Belt)
**What:** Underground belt requires two separate clicks: first sets entry, second sets exit (within valid range). PlacementSystem tracks `pendingUndergroundEntry` state.
**Example:**
```typescript
// In PlacementSystem:
pendingUndergroundEntry: { x: number; y: number; direction: BeltDirection } | null = null;

// GameScene pointerdown:
// If tool=Underground and no pendingEntry → place entry, set pendingEntry
// If tool=Underground and pendingEntry set → place exit at cursor (if valid range and same direction)
```

### Anti-Patterns to Avoid
- **Inserter polling every tick without a timer:** Always gate transfer attempts with `ticksSinceLastTransfer >= INSERTER_TRANSFER_INTERVAL` (8 ticks). Do not check the belt every tick.
- **Assembler checking ingredient completeness inside the inserter:** The inserter only checks `neededCount()`. The assembler checks `isReadyToAssemble()` in its own tick. Separation keeps both testable independently.
- **WordItem as a LetterItem subclass:** Make `WordItem` a separate class with the same interface shape (`tile`, `previousTile`, `snapshotPosition()`). Keeps type system clean and avoids coercion in ItemRenderer.
- **Splitter mode as explicit enum:** Mode is derived from topology at tick time, not stored. The auto-detection should be computed each tick from which adjacent belts exist — simpler and correct.
- **Storing assembler recipe as just a string:** Always store as `WordRecipe` with the pre-computed `letterCounts` Map. Avoids re-parsing on every tick.
- **Underground belt as a single entity:** Model entry and exit as two separate `Building` objects that hold a reference to each other (`pair`). BuildingSystem registers both independently (1x1 each). This respects the existing interface contract.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Assembler progress visual | Custom canvas draw loop | Phaser `Graphics.fillRect()` per ingredient slot | Phaser handles dirty-rect, batching; one fillRect per slot per update |
| Recipe panel UI | HTML/CSS overlay | Phaser `Container` + `Text` + `Rectangle` objects on UI camera | Matches existing ToolbarUI and DebugOverlay patterns; no impedance mismatch |
| Item interpolation for inserter arm | Raw position math | Existing TickEngine `alpha` + lerp, as used in ItemRenderer.update() | Pattern already proven; inserter arm is just another interpolated transform |
| Word validation | Custom letter-count logic | `Map<string, number>` from `WordRecipe.letterCounts` | Already modeled; don't re-implement separately in each caller |
| Underground belt routing | Path-finding or graph traversal | Direct `pair` reference between entry and exit entities | Topology is fixed at placement; no routing needed, just the pair link |

---

## Common Pitfalls

### Pitfall 1: Inserter Grabs Item It Cannot Deposit
**What goes wrong:** Inserter picks up a letter from the belt, but the assembler's slot for that letter just filled from another inserter on the same tick. Inserter holds the item indefinitely with no belt to return it to.
**Why it happens:** Naive implementation checks `neededCount()` at pickup time, but another inserter deposits in the same tick.
**How to avoid:** Check `neededCount()` at both pickup and deposit time. If deposit is blocked, inserter keeps holding the item and retries each transfer cycle. The held item is not on any belt (safe) — it is held by the inserter entity and rendered as mid-swing.
**Warning signs:** Items disappear from belts but words are never produced.

### Pitfall 2: BeltSystem tick() processes a belt that now feeds into a Splitter (not a Belt)
**What goes wrong:** `BeltSystem.getNextBelt()` returns `null` for a belt that terminates into a splitter tile. Items pile up and never enter the splitter.
**Why it happens:** BeltSystem only knows about `Belt` entities. Splitter is a `Building` in `BuildingSystem`, not registered in BeltSystem.
**How to avoid:** BeltSystem tick stays pure (belt-to-belt movement). SplitterSystem tick explicitly reads belts adjacent to each splitter and moves items. The belt adjacent to a splitter is the "end of belt chain" from BeltSystem's view — item stays there until SplitterSystem pulls it.
**Warning signs:** Items stop at the tile before a splitter.

### Pitfall 3: 3x3 Assembler Blocking Ghost Placement Incorrectly
**What goes wrong:** GhostRenderer shows single-tile ghost for a 3x3 building, player places assembler in an invalid location (partially off-grid or overlapping).
**Why it happens:** GhostRenderer currently renders 1x1 ghost rect. Multi-tile ghost needs to check all `occupiedTiles()` in `isValidPlacement()`.
**How to avoid:** Extend `PlacementSystem.isValidPlacement()` to accept a footprint (list of tiles), not just `(tx, ty)`. GhostRenderer renders all tiles of the footprint. `isValid = footprint.every(tile => isValidTile(tile))`.
**Warning signs:** Assembler partially overlaps a belt or quarry on placement.

### Pitfall 4: Assembly Timer Starting Before All Letters Collected
**What goes wrong:** Assembler starts the assembly countdown after the first letter arrives, not after all letters are collected.
**Why it happens:** Timer initiated in the deposit handler rather than in `AssemblerSystem.tick()` after checking `isReadyToAssemble()`.
**How to avoid:** `AssemblerSystem.tick()` is the only place where `assemblyTicksRemaining` is initialized. It sets the timer to `word.length * TICKS_PER_LETTER` only when `isReadyToAssemble()` first becomes true and `assemblyTicksRemaining === 0`.

### Pitfall 5: Underground Belt Exit Tile Occupied By Itself
**What goes wrong:** When placing underground belt exit, the validity check passes because BuildingSystem doesn't yet know about the exit — but then placement fails because exit is placed at a tile that's valid but the entry needs to route through.
**Why it happens:** Two-click placement requires tracking pending state across two separate pointer events. The entry tile is registered in BuildingSystem before the exit is placed.
**How to avoid:** Place entry tile in BuildingSystem at first click. Validate exit tile at second click (check BuildingSystem, check range, check same direction). If exit placement fails, remove the pending entry from BuildingSystem and reset state.

### Pitfall 6: ItemRenderer Not Aware of WordItem on Belts
**What goes wrong:** `ItemRenderer.syncItems()` calls `belt.item` which is typed as `LetterItem | null`. If `WordItem` is a separate class, the type check breaks.
**Why it happens:** `Belt.item` is typed to `LetterItem`. Assembler outputs `WordItem`.
**How to avoid:** Create a common `BeltItem` interface/union: `LetterItem | WordItem`. Both have `tile`, `previousTile`, `snapshotPosition()`. Update `Belt.item` type to `BeltItem | null`. `ItemRenderer` renders the item based on which type it is.

### Pitfall 7: Click-to-Configure Intercepted by Drag Placement Logic
**What goes wrong:** Player clicks a placed assembler to open the recipe panel, but PlacementSystem interprets the pointerdown as the start of a drag.
**Why it happens:** GameScene's `pointerdown` handler starts a drag whenever a tool is active and the player clicks.
**How to avoid:** Click-to-configure only fires when `currentTool === ToolType.None` (no tool selected). When a tool is selected, clicks are for placement. When no tool is selected, clicks hit-test buildings in BuildingSystem and open configure panels if hit.

---

## Code Examples

Verified patterns from existing codebase:

### Assembler multi-tile Building registration
```typescript
// Source: BuildingSystem.ts — place() already handles multi-tile registration
// Assembler implements Building:
occupiedTiles(): Array<{ x: number; y: number }> {
  const tiles: Array<{ x: number; y: number }> = [];
  for (let dy = 0; dy < 3; dy++) {
    for (let dx = 0; dx < 3; dx++) {
      tiles.push({ x: this.tileX + dx, y: this.tileY + dy });
    }
  }
  return tiles; // 9 tiles total
}
// BuildingSystem.place(assembler) handles all 9 tiles atomically
```

### InserterSystem tick pattern
```typescript
// Source: QuarrySystem.ts pattern adapted for inserter timing
export class InserterSystem {
  private inserters: Inserter[] = [];

  tick(beltSystem: BeltSystem, buildingSystem: BuildingSystem): void {
    for (const inserter of this.inserters) {
      inserter.ticksSinceLastTransfer++;
      if (inserter.ticksSinceLastTransfer < INSERTER_TRANSFER_INTERVAL) continue;

      if (inserter.heldItem != null) {
        this.tryDeposit(inserter, beltSystem, buildingSystem);
      } else {
        this.tryPickup(inserter, beltSystem, buildingSystem);
      }
    }
  }
}
```

### ToolbarUI extension pattern
```typescript
// Source: ToolbarUI.ts — toolDefs array is the only change needed
const toolDefs: Array<{ tool: ToolType; label: string; hotkey: string; locked?: boolean }> = [
  { tool: ToolType.Belt,          label: "Belt",       hotkey: "1" },
  { tool: ToolType.Splitter,      label: "Splitter",   hotkey: "2" },
  { tool: ToolType.Underground,   label: "Under",      hotkey: "3" },
  { tool: ToolType.Inserter,      label: "Inserter",   hotkey: "4" },
  { tool: ToolType.Assembler,     label: "Assembler",  hotkey: "5" },
  // Gap separator here
  { tool: ToolType.Demolish,      label: "Del",        hotkey: "X" },
];
```

### WordItem class (mirror of LetterItem interface)
```typescript
// Source: LetterItem.ts pattern — same shape required by ItemRenderer
export class WordItem {
  readonly word: string;       // e.g. "CAT"
  tile: { x: number; y: number };
  previousTile: { x: number; y: number };

  constructor(word: string, startTile: { x: number; y: number }) {
    this.word = word;
    this.tile = { x: startTile.x, y: startTile.y };
    this.previousTile = { x: startTile.x, y: startTile.y };
  }

  snapshotPosition(): void {
    this.previousTile = { x: this.tile.x, y: this.tile.y };
  }
}
```

### Assembly time formula (Claude's discretion — recommendation)
```typescript
// Recommended: baseTime + letter-count multiplier
// 3-letter: 15 ticks (1s), 4-letter: 22 ticks (~1.5s), 5-letter: 30 ticks (2s)
export const ASSEMBLY_TICKS_BASE = 10;
export const ASSEMBLY_TICKS_PER_LETTER = 4; // adds 4 ticks per letter in word

function assemblyTime(word: string): number {
  return ASSEMBLY_TICKS_BASE + word.length * ASSEMBLY_TICKS_PER_LETTER;
}
// "SEE" → 10 + 3*4 = 22 ticks; "HAIR" → 10 + 4*4 = 26 ticks; "STONE" → 10 + 5*4 = 30 ticks
```

### Underground belt max tunnel distance (Claude's discretion — recommendation)
**Recommended: 6 tiles max.** Rationale: TILE_SIZE=32, world is 64x64. 6 tiles = 192px visible gap (6 tiles of obstacle room). Enough to tunnel under a quarry (2-tile wide), an assembler (3-tile wide), or a diagonal belt run. Beyond 6 tiles the routing puzzle value diminishes and the ghost range indicator becomes visually cluttered. This mirrors Factorio's underground belt max distance design philosophy.

### Long-arm inserter toolbar slot (Claude's discretion — recommendation)
**Recommended: Greyed-out teaser slot with "locked" label.** Rationale: teaches players the slot exists, creates anticipation for Phase 4 unlock, and maintains toolbar layout consistency. Hidden-until-unlocked creates confusion when Phase 4 enables it (unexpected toolbar shift).

---

## State of the Art

| Old Approach | Current Approach | Impact |
|--------------|------------------|--------|
| PlacementSystem: single-click tool only | Extend for: R-to-rotate, two-click underground, click-to-configure | PlacementSystem needs new state fields, no core rewrite |
| BeltSystem: only Belt→Belt movement | Extend for: inserter reads/writes belt.item, splitter pulls from adjacent belt | SplitterSystem and InserterSystem own their transfer; BeltSystem unchanged |
| ToolType enum: Belt, Demolish | Extend: add Splitter, Underground, Inserter, Assembler | ToolbarUI and hotkey handlers need new cases |
| ItemRenderer: only LetterItem | Extend for BeltItem union (LetterItem | WordItem) | Belt.item type broadens; ItemRenderer branch on item type for visuals |
| GhostRenderer: single 1x1 tile | Extend for multi-tile footprint (3x3 assembler, 1x2 splitter) | GhostRenderer.update() receives footprint array, draws all tiles |

---

## Implementation Sequencing Recommendation

Based on dependencies between systems, the recommended wave structure:

**Wave 1 — Foundation data (no inter-system deps):**
- `WordItem.ts` entity
- `wordDictionary.ts` data file
- `Inserter.ts`, `LongArmInserter.ts` entity classes
- `Assembler.ts` entity class
- `Splitter.ts` entity class
- `UndergroundBelt.ts` entity classes (entry + exit)
- Update `constants.ts` with new constants

**Wave 2 — Pure systems (depend on Wave 1 entities + existing BeltSystem/BuildingSystem):**
- `InserterSystem.ts` (transfer logic, smart filter)
- `AssemblerSystem.ts` (ingredient collection, assembly timer, output)
- `SplitterSystem.ts` (alternating distribution)
- `UndergroundBeltSystem.ts` (tick buffer, pair management)

**Wave 3 — Placement UX extensions (depend on Wave 1 + Wave 2):**
- Extend `PlacementSystem.ts` (rotation, two-click, multi-tile validity)
- Extend `ToolbarUI.ts` (5 tools + gap + demolish, locked slot)
- Extend `GhostRenderer.ts` (multi-tile ghost, range preview)
- Extend hotkey handlers in `GameScene.ts` (R key rotation, keys 2-5)

**Wave 4 — Renderers (Phaser, depend on all above, no new tests needed):**
- `InserterRenderer.ts`
- `AssemblerRenderer.ts` (including recipe panel overlay)
- `SplitterRenderer.ts`
- `UndergroundBeltRenderer.ts`
- Extend `ItemRenderer.ts` for WordItem

**Wave 5 — GameScene wiring (assembles all systems):**
- Instantiate and connect all new systems in `GameScene.create()`
- Wire new system `.tick()` calls in `GameScene.update()` tick callback
- Load new sprites in `BootScene.ts`

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest (globals: true) |
| Config file | vite.config.ts (test.globals = true, environment = "node") |
| Quick run command | `bun test --reporter=dot` |
| Full suite command | `bun test` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| TRNS-03 | Inserter transfers item from belt to assembler after 8 ticks | unit | `bun test InserterSystem` | No — Wave 1 |
| TRNS-03 | Inserter smart filter: skips letter assembler doesn't need | unit | `bun test InserterSystem` | No — Wave 1 |
| TRNS-03 | Inserter holds item when assembler slot full, retries next cycle | unit | `bun test InserterSystem` | No — Wave 1 |
| TRNS-03 | Long-arm inserter: pickup 2 tiles away, deposit 2 tiles opposite | unit | `bun test InserterSystem` | No — Wave 1 |
| TRNS-04 | Splitter alternates items between two output belts (1:1) | unit | `bun test SplitterSystem` | No — Wave 2 |
| TRNS-04 | Splitter in merger mode (2-in/1-out) accepts from both sides | unit | `bun test SplitterSystem` | No — Wave 2 |
| TRNS-05 | Underground item arrives at exit after (tunnelLength) ticks | unit | `bun test UndergroundBeltSystem` | No — Wave 2 |
| TRNS-05 | Buildings can be placed on tiles above tunnel | unit | `bun test UndergroundBeltSystem` | No — Wave 2 |
| PROD-02 | Assembler occupies 9 tiles in BuildingSystem | unit | `bun test Assembler` | No — Wave 1 |
| PROD-02 | Assembler.recipe can be assigned and read | unit | `bun test Assembler` | No — Wave 1 |
| PROD-03 | AssemblerSystem: collects letters, starts timer when recipe complete | unit | `bun test AssemblerSystem` | No — Wave 2 |
| PROD-03 | AssemblerSystem: assemblyTicksRemaining decrements; outputs WordItem at 0 | unit | `bun test AssemblerSystem` | No — Wave 2 |
| PROD-03 | AssemblerSystem: resets after output item pulled by inserter | unit | `bun test AssemblerSystem` | No — Wave 2 |
| WORD-01 | wordDictionary: tier 1 words contain only {E,T,A,O,I,N,S,R,H,L} | unit | `bun test wordDictionary` | No — Wave 1 |
| WORD-01 | wordDictionary: tier 1 all 3-letter, tier 2 all 4-letter, tier 3 all 5-letter | unit | `bun test wordDictionary` | No — Wave 1 |
| WORD-02 | WordRecipe.letterCounts correct for "SEE": {S:1, E:2} | unit | `bun test wordDictionary` | No — Wave 1 |
| WORD-02 | Assembler.neededCount() returns 0 when ingredient already fully collected | unit | `bun test Assembler` | No — Wave 1 |

### Sampling Rate
- **Per task commit:** `bun test --reporter=dot`
- **Per wave merge:** `bun test && bun run type-check`
- **Phase gate:** Full suite green + `bun run build` before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `src/game/data/wordDictionary.test.ts` — covers WORD-01, WORD-02 validation
- [ ] `src/game/entities/Inserter.test.ts` — covers TRNS-03 entity contract
- [ ] `src/game/entities/Assembler.test.ts` — covers PROD-02, WORD-02 ingredient slot logic
- [ ] `src/game/systems/InserterSystem.test.ts` — covers TRNS-03 transfer/filter behavior
- [ ] `src/game/systems/AssemblerSystem.test.ts` — covers PROD-03 collection/timer/output
- [ ] `src/game/systems/SplitterSystem.test.ts` — covers TRNS-04
- [ ] `src/game/systems/UndergroundBeltSystem.test.ts` — covers TRNS-05
- [ ] No framework install needed — Vitest already configured

---

## Open Questions

1. **BeltItem union type — how does `Belt.item` type change?**
   - What we know: `Belt.ts` currently types `item: LetterItem | null`
   - What's unclear: Adding `WordItem` to the union means updating all consumers
   - Recommendation: Create `export type BeltItem = LetterItem | WordItem` in a new `src/game/entities/BeltItem.ts` and update `Belt.ts`. All consumers (BeltSystem, InserterSystem, ItemRenderer) import `BeltItem`. This is a clean single-file change.

2. **Recipe panel UI — Phaser modal or overlay container?**
   - What we know: DebugOverlay and ToolbarUI use UI camera containers that ignore main camera scroll
   - What's unclear: Recipe panel needs to close when clicking elsewhere; Phaser doesn't have a built-in modal system
   - Recommendation: A `RecipePanelUI` class (similar to ToolbarUI) that creates a centered `Container` on the UI camera. `GameScene` tracks `openPanel: RecipePanelUI | null`. `pointerdown` with no tool checks for building hit-test first, then closes any open panel if click is outside it.

3. **Inserter arm animation — use Phaser tweens or manual alpha interpolation?**
   - What we know: TickEngine provides `alpha` (0..1) for per-frame interpolation. ItemRenderer uses it for smooth item movement.
   - What's unclear: Arm swing covers a 90-180 degree arc. Interpolating `rotation` with alpha is clean but arm swing phase (pickup → swing → deposit) has multiple stages across multiple ticks.
   - Recommendation: Track `armPhase: 'idle' | 'swinging-to-pickup' | 'holding' | 'swinging-to-drop'` in the Inserter entity. Each phase lasts specific tick counts. InserterRenderer reads phase + alpha to interpolate rotation within the current phase arc. Avoids Phaser tweens (which are framerate-based, not tick-synchronized).

---

## Sources

### Primary (HIGH confidence)
- Project codebase (read directly): `BeltSystem.ts`, `BuildingSystem.ts`, `PlacementSystem.ts`, `ToolbarUI.ts`, `GhostRenderer.ts`, `ItemRenderer.ts`, `Belt.ts`, `LetterItem.ts`, `GameScene.ts`, `constants.ts`, `quarryLayout.ts`, `vite.config.ts`
- CONTEXT.md (2026-03-11): all locked decisions
- REQUIREMENTS.md: requirement IDs and descriptions

### Secondary (MEDIUM confidence)
- Phaser 3 Container/Graphics API: confirmed via existing codebase usage patterns in ToolbarUI and ItemRenderer

### Tertiary (LOW confidence — no validation needed, established patterns only)
- Assembly time formula: design recommendation based on game balance reasoning (no external source needed — it's Claude's discretion per CONTEXT.md)
- Underground belt max distance: design recommendation based on Factorio design philosophy reference in CONTEXT.md

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — no new dependencies; existing Phase 1+2 stack unchanged
- Architecture: HIGH — all patterns derived directly from readable codebase; CONTEXT.md locked all major design choices
- Pitfalls: HIGH — identified from direct code reading (type signatures, tick patterns, existing handler logic)
- Word dictionary content: MEDIUM — specific word selection is Claude's discretion; only letter constraint (E,T,A,O,I,N,S,R,H,L) is locked

**Research date:** 2026-03-11
**Valid until:** 2026-04-11 (stable stack; Phaser 3 API is stable; no fast-moving dependencies)
