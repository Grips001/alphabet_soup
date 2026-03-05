# Architecture Research

**Domain:** 2D factory simulation / word game hybrid
**Researched:** 2026-03-04
**Confidence:** HIGH

## Standard Architecture

### System Overview

```
+-----------------------------------------------------------------------+
|                         Phaser 3 Game Loop                            |
|  (Scene lifecycle: preload -> create -> update @ 60fps)               |
+-----------------------------------------------------------------------+
|                                                                       |
|  +------------------+    +------------------+    +-----------------+  |
|  | Input Manager    |    | Simulation Engine|    | Render Pipeline |  |
|  | (placement, UI)  |    | (tick-based)     |    | (sprites, tiles)|  |
|  +--------+---------+    +--------+---------+    +--------+--------+  |
|           |                       |                       |           |
|           v                       v                       v           |
|  +------------------+    +------------------+    +-----------------+  |
|  | Grid / World     |<-->| Entity Registry  |<-->| Sprite Sync    |  |
|  | (tile data)      |    | (all game objs)  |    | (ECS -> visuals)|  |
|  +--------+---------+    +--------+---------+    +-----------------+  |
|           |                       |                                   |
|           v                       v                                   |
|  +------------------+    +------------------+                         |
|  | Placement Rules  |    | Systems          |                         |
|  | (validation)     |    | (belt, inserter, |                         |
|  +------------------+    |  assembler, etc) |                         |
|                          +--------+---------+                         |
|                                   |                                   |
|                                   v                                   |
|                          +------------------+                         |
|                          | Recipe / Tech    |                         |
|                          | (progression)    |                         |
|                          +------------------+                         |
|                                                                       |
|  +------------------+                                                 |
|  | Persistence      |                                                 |
|  | (localStorage)   |                                                 |
|  +------------------+                                                 |
+-----------------------------------------------------------------------+
```

The architecture separates into three layers: **Input** (what the player does), **Simulation** (what the factory does each tick), and **Rendering** (what the player sees). The simulation layer is the core -- it runs on a fixed tick rate decoupled from the render frame rate.

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| Grid / World | Stores tile occupancy, dimensions, coordinate mapping | 2D array of cell objects; each cell holds entity reference or null |
| Entity Registry | Tracks all game objects (quarries, belts, inserters, assemblers, items) | Simple registry with typed arrays or Map; NOT full bitECS for this project size |
| Simulation Engine | Runs fixed-timestep tick loop, processes systems in order | Accumulator pattern: accumulate delta time, run tick when threshold reached |
| Belt System | Moves items along belt chains each tick | Transport line abstraction: group consecutive belts into segments |
| Inserter System | Transfers items between adjacent entities (belt<->machine) | Check source, check destination capacity, transfer item |
| Assembler System | Consumes letters in recipe order, produces word on completion | Input buffer with recipe matching; output triggers currency/score |
| Quarry System | Produces letters at fixed intervals | Timer per quarry; spawns item entity when timer completes |
| Recipe / Tech Tree | Defines word recipes, gates progression | Static data objects; unlocked set persisted in save |
| Input Manager | Handles mouse clicks, placement mode, selection | Phaser pointer events, grid snapping via coordinate math |
| Render Pipeline | Syncs entity state to Phaser sprites each frame | Iterate visible entities, update sprite positions/frames |
| Persistence | Save/load game state to localStorage | Serialize entity registry + grid + progression to JSON |

## Recommended Project Structure

```
src/
+-- main.ts                 # Phaser game config, entry point
+-- scenes/
|   +-- BootScene.ts        # Asset loading
|   +-- GameScene.ts        # Main gameplay scene (thin: delegates to systems)
|   +-- UIScene.ts          # HUD overlay scene (Phaser supports parallel scenes)
+-- simulation/
|   +-- SimulationEngine.ts # Tick loop, system orchestration
|   +-- systems/
|   |   +-- QuarrySystem.ts
|   |   +-- BeltSystem.ts
|   |   +-- InserterSystem.ts
|   |   +-- AssemblerSystem.ts
|   +-- entities/
|   |   +-- EntityRegistry.ts  # Central entity store
|   |   +-- types.ts           # Entity type definitions
|   +-- grid/
|       +-- Grid.ts            # 2D grid data structure
|       +-- GridUtils.ts       # Coordinate helpers, neighbor lookup
+-- data/
|   +-- recipes.ts          # Word recipe definitions
|   +-- techTree.ts         # Tech tree / progression data
|   +-- costs.ts            # Building costs
+-- rendering/
|   +-- SpriteSync.ts       # Maps entities to Phaser sprites
|   +-- TileRenderer.ts     # Grid/tile rendering
|   +-- ItemRenderer.ts     # Moving letter item visuals
+-- input/
|   +-- PlacementController.ts  # Building placement logic
|   +-- SelectionController.ts  # Click-to-select, info panels
+-- persistence/
|   +-- SaveManager.ts      # Serialize/deserialize game state
|   +-- SaveTypes.ts        # Save format types
+-- ui/
|   +-- HUD.ts              # Currency display, toolbar
|   +-- RecipePanel.ts      # Assembler recipe selection
|   +-- TechTreePanel.ts    # Tech tree UI
+-- utils/
    +-- Direction.ts         # Cardinal directions enum + helpers
    +-- constants.ts         # Grid size, tick rate, etc.
```

### Structure Rationale

- **simulation/ is framework-agnostic:** The simulation folder has zero Phaser imports. This is deliberate. The tick loop, entity registry, and systems operate on plain TypeScript data. This makes the simulation testable without Phaser, debuggable in isolation, and portable if you ever swap renderers.
- **rendering/ bridges simulation to Phaser:** SpriteSync reads entity positions and updates Phaser GameObjects. This one-directional data flow (simulation -> rendering) prevents rendering concerns from leaking into game logic.
- **scenes/ are thin coordinators:** GameScene creates the simulation engine, input controllers, and renderers, then calls `simulationEngine.tick()` in its update loop. It owns very little logic itself.
- **data/ is static configuration:** Recipes, tech tree, and costs are pure data files. Easy to tweak, easy to extend.

## Architectural Patterns

### Pattern 1: Fixed Timestep Simulation Loop

**What:** Decouple simulation updates from the rendering frame rate. Accumulate real elapsed time and run simulation ticks at a fixed interval (e.g., every 100ms = 10 ticks/second).

**When to use:** Always, for any simulation game. This is non-negotiable for deterministic behavior.

**Trade-offs:** Adds slight complexity over raw `update(delta)`, but gives deterministic simulation, consistent game speed regardless of frame rate, and trivially adjustable game speed (run 2 ticks per frame = 2x speed).

**Example:**
```typescript
class SimulationEngine {
  private accumulator = 0;
  private readonly TICK_RATE = 100; // ms per tick

  update(deltaMs: number): void {
    this.accumulator += deltaMs;
    while (this.accumulator >= this.TICK_RATE) {
      this.accumulator -= this.TICK_RATE;
      this.tick();
    }
  }

  private tick(): void {
    this.quarrySystem.process(this.entities, this.grid);
    this.beltSystem.process(this.entities, this.grid);
    this.inserterSystem.process(this.entities, this.grid);
    this.assemblerSystem.process(this.entities, this.grid);
  }
}
```

### Pattern 2: Transport Line Abstraction for Belts

**What:** Instead of simulating each belt tile independently, group consecutive same-direction belts into "transport lines" (segments). Items belong to a segment and move along it. This is how Factorio achieves massive belt performance.

**When to use:** When belt chains longer than ~5 tiles are common. For AlphabetSoup's scale (likely dozens to low hundreds of belt tiles), a simpler per-tile approach is viable initially, but the transport line concept should inform the data model.

**Trade-offs:** Per-tile is simpler to implement but O(n) per item per tick. Transport lines are O(1) amortized for item movement but more complex to implement, especially at junctions and when belts are added/removed.

**Recommendation for AlphabetSoup:** Start with per-tile belt movement (simple, correct, fast enough for expected scale). Structure the BeltSystem so it can be refactored to transport lines later if performance requires it.

**Example (per-tile approach for v1):**
```typescript
interface BeltEntity {
  id: number;
  gridX: number;
  gridY: number;
  direction: Direction; // UP, DOWN, LEFT, RIGHT
  item: LetterItem | null;
}

function processBelts(belts: BeltEntity[], grid: Grid): void {
  // Process in reverse direction order to avoid double-moves
  // Sort so downstream belts process first
  for (const belt of belts) {
    if (!belt.item) continue;
    const nextPos = getNextPosition(belt.gridX, belt.gridY, belt.direction);
    const nextCell = grid.get(nextPos.x, nextPos.y);

    if (nextCell?.type === 'belt' && nextCell.entity.item === null) {
      nextCell.entity.item = belt.item;
      belt.item = null;
    }
  }
}
```

### Pattern 3: Grid as Spatial Index

**What:** The grid is the primary spatial data structure. Every entity that occupies space registers in the grid. Lookups like "what is at tile (3, 7)?" and "what are the neighbors of this tile?" are O(1).

**When to use:** Any tile-based game. The grid is the source of truth for spatial relationships.

**Trade-offs:** Restricts entities to grid-aligned positions (correct for this game). Makes non-grid elements (like items visually interpolating between tiles) require separate handling.

**Example:**
```typescript
class Grid {
  private cells: (GridCell | null)[][];

  constructor(width: number, height: number) {
    this.cells = Array.from({ length: height }, () =>
      Array.from({ length: width }, () => null)
    );
  }

  get(x: number, y: number): GridCell | null {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) return null;
    return this.cells[y][x];
  }

  place(x: number, y: number, entity: GameEntity): boolean {
    if (this.cells[y][x] !== null) return false; // occupied
    this.cells[y][x] = { type: entity.type, entityId: entity.id };
    return true;
  }

  remove(x: number, y: number): void {
    this.cells[y][x] = null;
  }

  getNeighbors(x: number, y: number): Map<Direction, GridCell | null> {
    return new Map([
      [Direction.UP, this.get(x, y - 1)],
      [Direction.DOWN, this.get(x, y + 1)],
      [Direction.LEFT, this.get(x - 1, y)],
      [Direction.RIGHT, this.get(x + 1, y)],
    ]);
  }
}
```

### Pattern 4: System Processing Order Matters

**What:** The order in which systems run each tick determines behavior correctness. Quarries must produce before belts move. Inserters must transfer before assemblers check inputs.

**When to use:** Always in simulation games with interacting systems.

**Trade-offs:** Hard-coding order is simple and predictable. The alternative (dependency-based ordering) is overkill for this scope.

**Recommended tick order for AlphabetSoup:**
1. **QuarrySystem** -- produce letters onto adjacent belts/output slots
2. **InserterSystem** -- pick items from source, place into destination
3. **BeltSystem** -- move all items one step along their belt direction
4. **AssemblerSystem** -- check input buffers, consume letters, produce words
5. **ProgressionSystem** -- check word completions, award currency, check tech unlocks

This order ensures items flow naturally: produced -> picked up -> moved -> consumed -> scored.

## Data Flow

### Simulation Tick Flow

```
[Phaser update(time, delta)]
    |
    v
[SimulationEngine.update(delta)]
    |
    +-- accumulate delta time
    +-- while (accumulated >= TICK_RATE):
    |       |
    |       v
    |   [tick()]
    |       |
    |       +-> QuarrySystem.process()   -- writes items to grid/belt slots
    |       +-> InserterSystem.process() -- reads source, writes destination
    |       +-> BeltSystem.process()     -- moves items along belt chains
    |       +-> AssemblerSystem.process()-- reads input buffer, writes output
    |       +-> ProgressionSystem.process() -- reads completed words, writes score
    |
    v
[SpriteSync.sync()]
    |
    +-- reads entity positions from EntityRegistry
    +-- updates Phaser sprite x/y (with optional interpolation)
    +-- creates/destroys sprites as entities appear/disappear
```

### Player Action Flow

```
[Mouse Click on Grid]
    |
    v
[PlacementController]
    |
    +-- convert screen coords to grid coords (Phaser camera math)
    +-- check placement validity (grid empty? enough currency?)
    +-- if valid:
    |       +-> EntityRegistry.create(type, gridX, gridY)
    |       +-> Grid.place(gridX, gridY, entity)
    |       +-> Deduct currency
    |       +-> SpriteSync creates visual
    |
    +-- if invalid: show error feedback
```

### Save/Load Flow

```
[Save]
    EntityRegistry.serialize()  --> JSON (all entities + state)
    Grid.serialize()            --> JSON (grid dimensions + cell refs)
    Progression.serialize()     --> JSON (currency, unlocks, stats)
    --> combine into single object --> localStorage.setItem()

[Load]
    localStorage.getItem() --> parse JSON
    --> EntityRegistry.deserialize()
    --> Grid.deserialize()
    --> Progression.deserialize()
    --> SpriteSync.rebuildAll()
```

### Key Data Flows

1. **Letter production:** Quarry timer elapses -> Quarry creates LetterItem -> Item placed on quarry output -> Inserter picks up -> Belt receives -> Belt chain moves item tile-by-tile -> Inserter at assembler picks up -> Assembler input buffer receives
2. **Word completion:** Assembler checks input buffer against recipe -> All letters present in order -> Word produced -> Currency awarded -> Input buffer cleared -> Assembler ready for next word
3. **Visual sync:** Each frame after simulation, SpriteSync iterates entities with changed positions, updates corresponding Phaser sprites. Items on belts interpolate visually between tick positions for smooth movement.

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| Small factory (< 50 entities) | Per-tile belt processing, simple arrays, no optimization needed |
| Medium factory (50-500 entities) | Consider transport line grouping for belts, spatial partitioning for rendering |
| Large factory (500+ entities) | Transport lines mandatory, dirty-flag rendering (only update changed sprites), consider WebWorker for simulation |

### Scaling Priorities

1. **First bottleneck: Belt item processing.** Every item on every belt updates every tick. Fix by grouping belts into transport lines (O(1) movement per line instead of O(n) per item).
2. **Second bottleneck: Rendering.** Updating hundreds of sprites every frame. Fix by only updating sprites whose underlying entity position changed (dirty flag pattern).
3. **Not a bottleneck for v1:** Grid lookups (O(1)), assembler processing (small count), save/load (infrequent).

## Anti-Patterns

### Anti-Pattern 1: Simulation in the Render Loop

**What people do:** Put game logic directly in Phaser's `update()` using raw delta time, making simulation speed frame-rate dependent.
**Why it's wrong:** On a 144Hz monitor the factory runs 2.4x faster than on a 60Hz monitor. Saving and loading produces different results. Game speed is untestable.
**Do this instead:** Fixed timestep accumulator pattern. Simulation runs at consistent ticks regardless of frame rate.

### Anti-Pattern 2: Entities as Phaser GameObjects

**What people do:** Make each belt/quarry/assembler a Phaser.Sprite subclass that contains its own game logic.
**Why it's wrong:** Couples simulation to rendering framework. Cannot test simulation without Phaser. Cannot serialize easily. Cannot run simulation without rendering. Violates separation of concerns.
**Do this instead:** Plain TypeScript data objects for entities. Phaser sprites are created separately by SpriteSync and mapped to entities by ID.

### Anti-Pattern 3: Full ECS for Small-Scale Games

**What people do:** Adopt bitECS or similar full ECS library for a game with < 10 entity types and < 1000 entities.
**Why it's wrong:** ECS libraries like bitECS optimize for cache-coherent iteration over tens of thousands of entities using typed arrays. For AlphabetSoup's scale, the indirection and boilerplate of a full ECS (component IDs, queries, world management) adds complexity without meaningful performance benefit.
**Do this instead:** Use ECS *principles* (composition over inheritance, data-driven entities, systems that process entity groups) with simple TypeScript interfaces and Maps/arrays. Keep the door open to bitECS if entity counts grow large.

### Anti-Pattern 4: Processing Belts in Arbitrary Order

**What people do:** Iterate belts in creation order or random order, causing items to "teleport" multiple tiles per tick when a belt processes, moves its item forward, then the next belt in iteration also processes the same item.
**Why it's wrong:** Items move at inconsistent speeds. Some items teleport, others don't move at all in a given tick.
**Do this instead:** Process belts in reverse flow order (downstream first), or tag items as "already moved this tick" to prevent double-processing.

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| Vercel | Static deploy via `vite build` | No server-side; purely static hosting |
| localStorage | JSON serialization via SaveManager | Max ~5MB; compress if save data grows large |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| GameScene <-> SimulationEngine | Direct method calls | Scene owns engine instance, calls `engine.update(delta)` |
| SimulationEngine <-> Systems | Direct method calls | Engine calls each system in sequence with shared entity/grid refs |
| Systems <-> EntityRegistry | Direct read/write | Systems mutate entity data in-place during tick |
| Systems <-> Grid | Direct read/write | Systems query grid for neighbors, place/remove entities |
| EntityRegistry <-> SpriteSync | Read-only (sync direction: entities -> sprites) | SpriteSync reads entity state, never writes back |
| Input Controllers <-> Grid/EntityRegistry | Write (placement) + Read (validation) | Controllers validate against grid, create entities |
| UIScene <-> GameScene | Phaser Scene events or shared state ref | UI reads currency/progression; buttons trigger actions |

## Why NOT bitECS for v1

bitECS is being used in Phaser 4 development and is the most mature ECS option for Phaser 3. However, for AlphabetSoup:

- Entity count will be low (dozens to hundreds, not thousands)
- Entity types are few and well-defined (quarry, belt, inserter, assembler, item)
- The performance ceiling of simple TypeScript objects is far above what this game needs
- bitECS's typed-array storage model makes serialization and debugging harder
- The learning curve of ECS query patterns adds friction without proportional benefit

**Use ECS architectural principles without the ECS library.** If the game grows to need thousands of entities or complex component composition, bitECS can be introduced to the simulation layer without touching rendering or input code (because they are already decoupled).

## Sources

- [Factorio FFF #176 - Belt Optimization](https://factorio.com/blog/post/fff-176) -- Transport line data structure, O(1) belt movement optimization (HIGH confidence)
- [Shapez.io Source Code](https://github.com/tobspr-games/shapez.io) -- Open source factory game architecture reference (HIGH confidence)
- [Phaser 3 + bitECS Getting Started](https://github.com/ourcade/phaser3-bitecs-getting-started) -- ECS integration pattern with Phaser 3 (HIGH confidence)
- [bitECS Library](https://github.com/NateTheGreatt/bitECS) -- ECS library used in Phaser 4 development (HIGH confidence)
- [Grid Engine for Phaser 3](https://github.com/Annoraaq/grid-engine) -- Grid-based movement library reference (MEDIUM confidence)
- [HexFac Factory Simulation](https://github.com/marggx/HexFac) -- Modular factory sim architecture example (LOW confidence)
- [Modular Game Worlds in Phaser 3](https://medium.com/@michaelwesthadley/modular-game-worlds-in-phaser-3-tilemaps-1-958fc7e6bbd6) -- Tilemap architecture guide (HIGH confidence)
- [Wetzold Studios - Factory Game in 3 Days](https://blog.wetzold.com/2021/05/08/creating-a-factory-automation-game-with-unity-in-three-days-for-ludum-dare/) -- Factory game tick/update architecture (MEDIUM confidence)

---
*Architecture research for: 2D factory simulation / word game (AlphabetSoup)*
*Researched: 2026-03-04*
