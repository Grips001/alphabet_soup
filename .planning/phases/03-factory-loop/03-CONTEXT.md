# Phase 3: Factory Loop - Context

**Gathered:** 2026-03-11
**Status:** Ready for planning

<domain>
## Phase Boundary

The complete production chain works — inserters pull letters off belts into assemblers, assemblers consume the correct letters and output completed word items. Also includes belt splitters and underground belts for routing flexibility. A curated word dictionary provides recipes limited to available quarry letters (E, T, A, O, I, N, S, R, H, L).

Requirements: TRNS-03, TRNS-04, TRNS-05, PROD-02, PROD-03, WORD-01, WORD-02

</domain>

<decisions>
## Implementation Decisions

### Inserter Mechanics
- Fixed-direction arm, 1x1 tile. Direction set with R key during placement (cycles N/E/S/W)
- Standard inserter: picks up from 1 adjacent tile, drops on 1 adjacent tile
- Long-arm inserter: separate building type, picks up from 1 or 2 tiles away, always drops 2 tiles away
- Long-arm pickup range toggled by clicking the placed inserter (Bob's Adjustable Inserters style)
- Both inserter types are clickable after placement — establishes click-to-configure pattern for all inserters
- Transfer speed: every 8 ticks (~0.5s at 15 tps)
- Animated arm swing from pickup side to dropoff side while holding the letter item
- Can transfer between any two tile types: belt↔belt, belt↔machine, machine↔belt
- Smart filter when feeding a recipe-assigned assembler: inserter checks assembler's ingredient slots and only grabs letters that match the recipe. Unneeded letters pass by on the belt
- Without a recipe target (standalone inserter or assembler with no recipe): grabs first available letter
- Long-arm inserter entity built in Phase 3 but locked in toolbar UI until Phase 4 tech tree unlocks it

### Assembler Design
- 3x3 tile footprint with 12 orthogonal edge-adjacent tiles for inserter access (3 per side)
- Inserters must face N/E/S/W directly into an assembler edge — no diagonal insertion
- All sides accept both input and output — inserter direction determines whether it feeds in or pulls out
- Only 1 inserter per adjacent tile (naturally enforced by BuildingSystem)
- Click a placed assembler to open a word list panel showing available recipes with letter requirements
- Unordered letter input: assembler accepts letters in any order, collects all needed letters then produces
- Each letter instance = 1 item needed (e.g., "SEE" needs S x1 + E x2 = 3 items)
- Assembler rejects letters it doesn't need — inserter checks before depositing, holds the letter until a slot opens
- Assembly time scales with word length — longer words take more ticks to assemble once all letters are collected
- Immediate reset after the completed word item is pulled out by an output inserter
- Completed word items output via inserter onto belts (routable like letter items)

### Belt Splitter
- 1x2 tile footprint (wider building occupying 2 tiles side-by-side)
- Auto-detects mode based on adjacent belt connections:
  - 1-in / 2-out = splitter
  - 2-in / 1-out = merger
  - 2-in / 2-out = balancer
- Default distribution: alternating 1:1 (items alternate between outputs)
- No manual mode configuration needed — connection topology determines behavior

### Underground Belts
- Paired entry/exit placement: select tool, click to place entry (R key for direction), then click within valid range for exit
- Same direction only — no turning underground
- Items travel with tick-based delay (1 tick per tunnel tile) — not instant teleport
- Any building can be placed on tiles above the tunnel (that's the purpose of underground belts)
- Ghost preview shows valid exit range during placement; red ghost if out of range
- Max tunnel distance: Claude's discretion (balance routing flexibility vs spatial puzzle challenge)

### Word Dictionary
- All words limited to available quarry letters: E, T, A, O, I, N, S, R, H, L
- Hybrid tier system: primary grouping by letter count, secondary by unique letter count within each tier
  - Fewer unique letters = easier (e.g., "SEE" easier than "SET" — fewer quarry sources needed)
  - More unique letters = harder (more routing complexity)
- Tier 1: 3-letter words, Tier 2: 4-letter words, Tier 3: 5-letter words
- Dictionary expands as new quarry letters unlock in Phase 4
- Dictionary size: Claude's discretion (curate for quality and gameplay variety within the 10-letter constraint)

### Word Item Visuals
- Multi-letter block showing the full word text (e.g., [CAT]) — visually wider than single letter tiles
- Same color palette as letter items (not a distinct golden/special color)
  - Design rationale: leaves door open for word-to-word chaining (v2 PROD-04) where word items feed into assemblers as components
- Occupies 1 belt tile for transport (same slot size as letter items, just renders wider)

### Toolbar & Hotkeys
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

</decisions>

<specifics>
## Specific Ideas

- Long-arm inserter toggle inspired by "Bob's Adjustable Inserters" mod from Factorio — click placed inserter to cycle pickup range
- Smart filter on inserters: when feeding an assembler with a recipe, inserter only grabs letters matching recipe ingredients. Without a recipe target, grabs first available letter
- Assembler immediate reset + assembly time scaling = balancing lever is the assembly process, not cooldown
- Word-to-word chaining (assembler output → another assembler input) is a v2 feature (PROD-04), but visual design and 1-belt-slot sizing support it now
- Splitter as a combo building: auto-detects split/merge/balance mode from connections — versatile single building type

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `BuildingSystem`: Generic `Building` interface with `occupiedTiles()` + `type` string. Inserters (1x1), assemblers (3x3), splitters (1x2), underground entry/exit (1x1 each) all implement this interface
- `BeltSystem`: Downstream-first processing with backpressure. Inserters interact by reading/writing `belt.item`. Splitters need custom processing logic (1-in/2-out routing)
- `Belt.ts`: Has `item: LetterItem | null` per tile. Inserter pickup = read `belt.item`, inserter deposit = write `belt.item`
- `LetterItem.ts`: Simple class with `letter`, `tile`, `previousTile`. Word items could extend or be a new `WordItem` class with similar interface
- `PlacementSystem`: Click/drag placement with ghost preview. Needs extension for R-to-rotate (inserters), two-click placement (underground belts), and click-to-configure (inserter range toggle, assembler recipe assignment)
- `ToolbarUI`: Bottom toolbar with hotkey support. Add new tool entries (Splitter, Underground, Inserter, Assembler) and gap separator before Demolish
- `constants.ts`: Add INSERTER_TRANSFER_INTERVAL, ASSEMBLER_SIZE, SPLITTER_SIZE, new TILE_TYPE codes, assembly time constants

### Established Patterns
- Simulation/render split: pure TS logic in `systems/` and `entities/`, Phaser-only in `*Renderer.ts` files
- TDD: tests next to source, pure logic fully testable without Phaser
- Constants in `constants.ts`: all magic numbers imported from there
- TickEngine alpha interpolation available for smooth inserter arm animation
- Depth layering: DEPTH_BUILDINGS=10, DEPTH_ITEMS=20, DEPTH_GHOST=30, DEPTH_UI=1000

### Integration Points
- `GameScene.create()`: Instantiate InserterSystem, AssemblerSystem, SplitterSystem, UndergroundBeltSystem and their renderers
- `GameScene.update()` tick callback: Call new system `.tick()` methods inside TickEngine callback
- `BootScene.ts`: Load inserter, assembler, splitter, underground belt sprites
- `PlacementSystem`: Extend tool types, add rotation state (R key), two-click mode (underground), click-to-configure handlers
- `ToolbarUI`: Add new tool buttons with hotkeys 1-5 + X, visual gap separator
- Word dictionary: new data file in `src/game/data/` or `src/game/world/` with tiered word lists

</code_context>

<deferred>
## Deferred Ideas

- Priority splitter / overflow routing — future unlock via tech tree or progression
- Filter splitter (route specific letters to specific outputs) — future unlock
- Word-to-word chaining: assembler outputs as inputs to higher-tier assemblers (v2 PROD-04) — visual design supports this now
- Generating new letters from common letter recipes (crafting rare letters) — potential future mechanic
- Long-arm inserter UI unlock — Phase 4 tech tree gates access

</deferred>

---

*Phase: 03-factory-loop*
*Context gathered: 2026-03-11*
