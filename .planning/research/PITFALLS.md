# Pitfalls Research

**Domain:** 2D factory simulation word game (Phaser 3 + TypeScript + Vite)
**Researched:** 2026-03-04
**Confidence:** HIGH (core patterns well-documented from Factorio, shapez.io, and Phaser community)

## Critical Pitfalls

### Pitfall 1: Per-Belt-Tile Item Updates (The N*M Problem)

**What goes wrong:**
Every belt tile independently manages items on it, updating each item's position every tick. With 200 belt tiles and 3 items each, that is 600 individual position updates per tick. At 60 ticks/sec the game crawls once the player builds a medium-sized factory. This is the single most common performance killer in web-based factory sims.

**Why it happens:**
The naive implementation is intuitive: each belt tile is an object, each item on it is an object, each tick moves each item. It works perfectly for the first 20 belt tiles. Developers do not feel the pain until the factory is moderately complex, by which point the architecture is baked in.

**How to avoid:**
Use the "belt path" pattern from shapez.io. Connected belt tiles that form a continuous route are merged into a single BeltPath object. Items on a path store only their distance from the item ahead of them. To advance the path, subtract from the last item's spacing and propagate -- O(items_on_path) but with trivial per-item work and no per-tile overhead. Factorio uses a similar approach where contiguous belts become one entity storing item offsets.

**Warning signs:**
- Each belt tile has its own `items: Item[]` array
- The update loop iterates over every tile, then every item on that tile
- Frame time grows linearly with belt count even when items are sparse
- Profiler shows `updateBelts` dominating the tick

**Phase to address:**
Phase 1 (core simulation engine). This is an architectural decision that cannot be retrofitted without a rewrite. The BeltPath data structure must be designed before any belt rendering or placement code.

---

### Pitfall 2: Coupling Simulation Tick to Render Frame

**What goes wrong:**
Game logic runs inside Phaser's `update()` at the display framerate (60fps). Simulation speed cannot be changed independently. Fast-forward is impossible. Slow machines run the simulation slower. Save/load produces different results depending on frame timing. The game is non-deterministic.

**Why it happens:**
Phaser's `update(time, delta)` is the obvious place to put game logic. It works fine until you need variable simulation speed, deterministic replays, or headless testing. The coupling feels natural but creates a ceiling you hit mid-project.

**How to avoid:**
Separate simulation from rendering on day one. Run the simulation engine at a fixed tick rate (e.g., 10 ticks/sec for factory sim -- Factorio uses 60 UPS but a browser game should be conservative). Use an accumulator pattern: each render frame, accumulate real elapsed time, then run zero or more fixed-step simulation ticks. Rendering interpolates between the last two simulation states for smooth visuals.

Key implementation: `SimulationEngine.tick()` is a pure function of current state + inputs. It knows nothing about Phaser, rendering, or frame timing. Phaser's `update()` only calls `engine.tick()` as needed and then renders the current state.

**Warning signs:**
- Game logic directly reads `delta` from Phaser's update
- No way to run the simulation without rendering
- Cannot write unit tests for game logic without instantiating Phaser
- "Fast forward" feature request seems impossibly hard

**Phase to address:**
Phase 1 (core simulation engine). The tick/render boundary is the first thing to build. Everything else layers on top of it.

---

### Pitfall 3: Creating and Destroying Game Objects Every Tick

**What goes wrong:**
Letter items are created as new Phaser GameObjects when they spawn from a quarry and destroyed when consumed by an assembler. Each create/destroy allocates memory, triggers GC, and causes frame hitches. With many quarries producing letters, the game stutters visibly.

**How to avoid:**
Use object pooling from the start. Phaser 3 Groups have built-in pooling via `getFirstDead()` / `killAndHide()`. Pre-allocate a pool of letter sprites. When a quarry produces a letter, activate a pooled sprite. When an assembler consumes it, deactivate and return to pool. Zero allocation in the hot path.

Additionally, the simulation-layer item (the logical letter entity) should be a plain object or struct, not a Phaser GameObject. The Phaser sprite is purely a visual representation that gets assigned to a logical item for rendering.

**Warning signs:**
- `new Phaser.GameObjects.Sprite()` appears in tick-driven code
- `sprite.destroy()` called frequently during gameplay
- Chrome DevTools shows sawtooth memory pattern with frequent GC pauses
- Frame drops correlate with quarry output rate

**Phase to address:**
Phase 2 (entity rendering). Object pooling should be implemented when the first visual entities (letter items) are rendered, but the logical item layer (Phase 1) should already be designed pool-friendly (plain data objects, not class instances with lifecycle).

---

### Pitfall 4: Inserter and Assembler Deadlocks

**What goes wrong:**
An inserter picks up a letter but the target assembler's input is full. The inserter holds the letter forever, blocking the belt behind it. Or two inserters compete for the same belt lane, causing starvation. Or an assembler recipe requires letters in order (e.g., C-A-T) but letters arrive out of order and jam the input buffer.

**Why it happens:**
Inserter logic seems simple (pick from belt, place in machine) but edge cases multiply with real factory layouts. The "letters must arrive in order" constraint for word assembly is unique to this game and does not exist in Factorio, making it an untested design space.

**How to avoid:**
- Inserters must have a "blocked" state that does not remove the item from the belt until the destination has space (peek, not pop)
- Assembler input buffers should be per-letter-slot, not a single queue. A "CAT" assembler has slots for C, A, and T. An inserter feeding it checks if its letter matches any unfilled slot, not just "is there room"
- Consider making assemblers accept letters in any order (unordered set, not sequence) to avoid ordering deadlocks entirely. Require the right letters, not the right sequence
- Add overflow/void mechanics: if a belt backs up fully, the player needs visual feedback, not a silent deadlock

**Warning signs:**
- Items disappear from belts but never arrive at assemblers
- Assemblers stuck at partial completion indefinitely
- Player builds working designs that mysteriously stop after running for a while
- No "blocked" or "waiting" visual state on inserters

**Phase to address:**
Phase 2-3 (inserter and assembler implementation). Design the inserter state machine with blocked/waiting states from the start. Prototype assembler input logic with adversarial letter ordering before building the full recipe system.

---

### Pitfall 5: Rendering Every Item Sprite Regardless of Visibility

**What goes wrong:**
Every letter item on every belt has a visible Phaser sprite, even if it is off-screen. With hundreds of items on distant belts, the GPU draws sprites the player never sees. WebGL draw calls accumulate, FPS drops.

**Why it happens:**
Phaser's tilemap layer has built-in camera culling, but custom game objects (like item sprites on belts) do not get culled automatically. Developers assume Phaser handles this; it does not for arbitrary sprites.

**How to avoid:**
- Use chunk-based visibility: divide the world into chunks, only activate item sprites in chunks overlapping the camera viewport
- Hybrid approach: the simulation tracks all items (logical layer), but only items in visible chunks get assigned a pooled sprite for rendering
- Leverage Phaser's camera `worldView` bounds to determine which chunks are visible each frame
- For belts themselves, use Phaser's TilemapLayer with built-in culling rather than individual sprites per belt tile

**Warning signs:**
- FPS drops when zooming out (more items visible)
- FPS is fine on a small factory but degrades with factory size even when most of it is off-screen
- Phaser's renderer stats show draw call count scaling with total items, not visible items

**Phase to address:**
Phase 2-3 (rendering system). Implement chunk-based sprite activation when building the item rendering layer. This is easier to add early than retrofit.

---

### Pitfall 6: localStorage Serialization Blowup

**What goes wrong:**
The game state grows as the player builds. Naively serializing the entire world state to JSON on every auto-save produces a multi-megabyte string. `JSON.stringify()` on a large object blocks the main thread for 50-200ms, causing a visible frame hitch. localStorage has a 5-10MB limit; once hit, saves silently fail or throw.

**Why it happens:**
localStorage works great for small data. Factory sim state includes every belt tile, every item position, every machine state, every recipe. It grows fast. Developers do not test with large factories during development.

**How to avoid:**
- Design a compact save format from the start. Store belt paths as coordinate arrays, not full objects. Store items as `[type, pathIndex, offset]` tuples, not rich objects
- Use incremental/delta saves: only serialize chunks that changed since the last save
- Move serialization off the main thread if possible (Web Worker for JSON.stringify, or use a streaming serializer)
- Compress the save string (LZ-string library adds ~3KB and achieves 50-70% compression on repetitive factory data)
- Monitor save size during development; add a dev overlay showing current save size in KB
- Set a budget: if save exceeds 2MB uncompressed, optimize the format before adding features

**Warning signs:**
- Auto-save causes a visible stutter
- Save file size not tracked during development
- `JSON.stringify` called on the root game state object directly
- No save format versioning (makes migration impossible later)

**Phase to address:**
Phase 4 (persistence). Design the save format specification before implementing save/load. Include format version number from day one.

---

### Pitfall 7: Monolithic Scene Architecture

**What goes wrong:**
All game logic (simulation, UI, input, rendering) lives in a single Phaser Scene. The `update()` method grows to hundreds of lines. Adding features requires understanding the entire scene. Testing anything requires the whole game running.

**Why it happens:**
Phaser tutorials typically show single-scene games. Factory sims have many interacting systems. Without deliberate architecture, the main game scene becomes a god object.

**How to avoid:**
- Simulation engine is a plain TypeScript module with zero Phaser imports
- Use a layered scene approach: GameScene (world rendering), UIScene (HUD/menus overlay), or use Phaser's parallel scene capability to layer UI over the game world
- Each system (belts, inserters, assemblers, quarries) is its own module/class with a clean interface
- The Phaser scene's `update()` should be ~10 lines: run simulation ticks, sync visuals, done

**Warning signs:**
- GameScene.ts exceeds 300 lines
- Cannot test simulation logic without Phaser running
- Adding a new machine type requires modifying 5+ files
- UI code mixed with game logic in the same scene

**Phase to address:**
Phase 1 (project structure). Establish the module boundaries before writing any game logic. The simulation/rendering split enforces this naturally.

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Items as Phaser GameObjects (not plain data) | Faster to prototype, visual feedback immediate | Cannot run simulation headless, pool management harder, tight coupling | Never -- always separate logical items from visual sprites |
| Single global update loop for all systems | Simple, no inter-system communication needed | Cannot profile individual systems, cannot disable/throttle systems independently | MVP only, refactor by Phase 2 |
| Hardcoded recipes instead of data-driven | Faster to get first assembler working | Adding new words requires code changes, no modding support, tech tree becomes code spaghetti | Phase 1 prototype only, must be data-driven before Phase 3 |
| No save format versioning | One less thing to build | Any save format change destroys all player progress, no migration path | Never -- add `version: 1` from the first save |
| Belt rendering as individual sprites | Simpler initial implementation | Draw call explosion with large factories, cannot use tilemap culling | Phase 1 prototype only, must move to tilemap by Phase 2 |

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Per-item collision checks on belts | Frame time spikes when belts are congested | Use spacing-based approach (items store distance to next item, not absolute position) | 100+ items on belts |
| Unthrottled pathfinding for item routing | Stutter when player places new belt connections | Cache belt paths; only recalculate when topology changes (belt placed/removed) | 50+ connected belt segments |
| Texture atlas not used (individual image files) | Extra draw calls per unique texture, WebGL batch breaks | Pack all sprites into a single texture atlas from the start | 20+ unique sprite types on screen |
| Updating all entities every tick (not just active ones) | Linear slowdown with total entity count | Idle machines (empty assemblers, empty belts) skip updates; use dirty flags | 200+ total entities |
| Large tilemap with many layers | Rendering time increases per layer even with culling | Use maximum 2-3 tilemap layers; merge decorative tiles into base layer | 4+ tilemap layers |
| Phaser Text objects for item labels | Canvas 2D text rendering is slow, breaks WebGL batching | Use BitmapText for any in-game text (letter labels on items, machine names) | 10+ Text objects visible |

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| No visual feedback when belts are full/backed up | Player cannot diagnose why production stopped | Items visually bunch up on belts; inserters show "blocked" animation; belt color/glow changes when full |
| Assembler does not show which letters it still needs | Player has to memorize recipes and count manually | Show recipe progress on the assembler sprite (e.g., "C_T" with blank for missing A) |
| Belt direction unclear during placement | Player places belts wrong way, wastes resources | Show arrow overlay during belt placement; preview item flow direction before confirming |
| No undo for placement | One misclick wastes currency, frustrating early game | Allow belt/machine removal with partial refund; or undo last N placements |
| Camera controls feel sluggish or wrong | Player fights the viewport instead of playing the game | Implement smooth WASD/arrow panning + mouse wheel zoom + edge scrolling on day one; test camera before building game systems |
| Grid snapping ambiguity | Player unsure where machine will be placed | Highlight target grid cell with clear color coding (green=valid, red=invalid) during placement |

## "Looks Done But Isn't" Checklist

- [ ] **Belt system:** Often missing corner/curve handling -- verify belts auto-connect when placed in L-shapes and items follow the curve smoothly
- [ ] **Inserter:** Often missing the "no room at destination" check -- verify inserter does not consume items when target is full
- [ ] **Assembler:** Often missing partial-progress save -- verify assembler remembers which letters it has collected after save/load
- [ ] **Save/load:** Often missing entity reference reconstruction -- verify that inserters still point to the correct belt and machine after loading
- [ ] **Camera:** Often missing bounds clamping -- verify player cannot pan infinitely into empty void
- [ ] **Object pooling:** Often missing proper reset -- verify reused sprites do not retain tint/alpha/animation state from previous use
- [ ] **Belt paths:** Often missing recalculation on topology change -- verify that removing a belt mid-path correctly splits the BeltPath into two
- [ ] **Tech tree:** Often missing unlock state persistence -- verify unlocked recipes survive save/load
- [ ] **Performance:** Often missing large-factory testing -- verify 60fps with 200+ belts and 100+ items before shipping

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Per-belt-tile item updates | HIGH | Rewrite belt system to use BeltPath. All belt-adjacent code (inserters, rendering) must be updated. Budget 1-2 weeks. |
| Simulation coupled to render | HIGH | Extract all game logic into pure TS module. Requires touching every system. Budget 1-2 weeks. |
| No object pooling | MEDIUM | Add pooling layer between simulation items and Phaser sprites. Moderate refactor if items are already plain data objects. |
| Inserter deadlocks | MEDIUM | Add state machine to inserter with blocked/waiting states. Refactor assembler input to per-slot buffers. |
| Rendering all items always | MEDIUM | Add chunk visibility system. Requires a spatial index for items. |
| localStorage blowup | MEDIUM | Redesign save format to be compact. Add LZ-string compression. Migrate existing saves via version flag. |
| Monolithic scene | HIGH | Decompose into modules. Touches every system. Much easier to prevent than fix. |

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Per-belt-tile item updates | Phase 1: Simulation Engine | Belt system uses BeltPath abstraction; no per-tile item arrays exist |
| Simulation coupled to render | Phase 1: Simulation Engine | `SimulationEngine.tick()` runs in a unit test with zero Phaser imports |
| No object pooling | Phase 2: Entity Rendering | Letter sprites come from a pool; no `new Sprite()` in tick-driven code |
| Inserter deadlocks | Phase 2-3: Inserter/Assembler | Automated test: inserter feeding a full assembler does not consume items from belt |
| Rendering all items | Phase 2-3: Rendering System | FPS stays above 55 when 80% of factory is off-screen |
| localStorage blowup | Phase 4: Persistence | Save format has version field; save size logged in dev overlay; 200-entity factory save < 500KB |
| Monolithic scene | Phase 1: Project Structure | GameScene.update() is under 20 lines; simulation has zero Phaser imports |

## Sources

- [Red Blob Games: Conveyor Belt Representation](https://www.redblobgames.com/x/1805-conveyor-belts/) -- tile vs edge model analysis
- [shapez.io Belt & Item Transportation (DeepWiki)](https://deepwiki.com/tobspr-games/shapez.io/3.2-belt-and-item-transportation) -- BeltPath optimization pattern
- [Phaser 3 Object Pooling (Ourcade)](https://blog.ourcade.co/posts/2020/phaser-3-optimization-object-pool-basic/) -- pooling implementation
- [How I Optimized My Phaser 3 Game (2025)](https://franzeus.medium.com/how-i-optimized-my-phaser-3-action-game-in-2025-5a648753f62b) -- real-world Phaser performance
- [Tips on Speeding Up Phaser Games](https://gist.github.com/MarcL/748f29faecc6e3aa679a385bffbdf6fe) -- texture atlas, BitmapText, culling
- [Phaser Discourse: Tilemap Performance](https://phaser.discourse.group/t/tilemap-performance/10190) -- tilemap layer count impact
- [Phaser GitHub #5456: Memory Leak Issues](https://github.com/photonstorm/phaser/issues/5456) -- cleanup and scene lifecycle
- [Fix Your Timestep (Gaffer on Games)](https://gafferongames.com/post/fix_your_timestep/) -- accumulator pattern for fixed tick rate
- [Game Programming Patterns: Game Loop](https://gameprogrammingpatterns.com/game-loop.html) -- simulation/render separation
- [GameDev.net: Managing Objects on Conveyor Belts](https://www.gamedev.net/forums/topic/706829-managing-objects-on-a-conveyor-belt-ie-factorio-and-satisfactory/) -- Factorio-style belt segment approach
- [Factorio Forums: Production Deadlocks](https://forums.factorio.com/viewtopic.php?t=64674) -- inserter deadlock patterns

---
*Pitfalls research for: 2D factory simulation word game (AlphabetSoup)*
*Researched: 2026-03-04*
