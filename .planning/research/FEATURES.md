# Feature Research

**Domain:** 2D Factory Simulation + Word Puzzle Hybrid (Browser Game)
**Researched:** 2026-03-04
**Confidence:** HIGH (factory sim mechanics well-documented; word-game hybrid is novel territory)

## Feature Landscape

### Table Stakes (Users Expect These)

Features that factory sim players will assume exist. Missing any of these means the game feels broken, not just incomplete.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Grid-based tile placement | Every factory sim uses a grid. Players expect snapping, rotation, and clear tile boundaries. | MEDIUM | Foundation of everything else. Phaser 3 tilemap support makes this straightforward. |
| Conveyor belts with directional flow | Belts ARE the genre. Factorio, Shapez, Mindustry all center on belt logistics. No belts = not a factory game. | HIGH | Must handle merging, splitting, corners, and visual animation of items moving along paths. Most complex single system. |
| Inserters / transfer mechanisms | Moving items between machines and belts is core to the routing puzzle. Without inserters, there is no logistics challenge. | MEDIUM | Simpler than belts but requires clear visual feedback showing pickup/drop action. |
| Resource sources (letter quarries) | Every factory sim has resource nodes. Players need something to extract and route. | LOW | Fixed map positions per PROJECT.md. Each quarry produces a specific letter. |
| Assembler / crafting machines | The destination for routed resources. In this game: feed letters, produce words. Without assemblers, belts have no purpose. | MEDIUM | Must display recipe (target word), current letter inventory, and production progress. |
| Tick-based simulation engine | Deterministic updates that players can reason about. Factory sims need predictable timing. | HIGH | Underpins ALL entity behavior. Must be robust before anything else works. |
| Visual item flow (letters on belts) | Seeing items move is half the satisfaction. Factorio's "belt spaghetti" is iconic because you can watch it work. | MEDIUM | Letter sprites moving along belt paths. Players must see individual letters to debug routing. |
| Build / demolish controls | Place machines, remove mistakes. Basic construction UI is assumed in every builder game. | LOW | Toolbar, click-to-place, right-click-to-remove (or similar). Ghost preview of placement. |
| Camera pan and zoom | Players need to navigate their factory. Every 2D factory sim supports this. | LOW | Phaser 3 camera system handles this natively. |
| Game speed controls (pause/1x/2x) | Players need to pause to plan, speed up to watch production. Standard in all sim games. | LOW | Modify tick rate. Pause is essential for planning complex layouts. |
| Basic HUD / resource display | Current currency, production rates, selected tool. Players need status information at all times. | LOW | Minimal UI overlay showing score/currency and active tool. |
| Save / load game state | Players invest hours. Losing progress = losing the player forever. | MEDIUM | localStorage per PROJECT.md. Must serialize full factory state (grid, entities, tick count, unlocks). |

### Differentiators (Competitive Advantage)

Features that make AlphabetSoup distinct from generic factory sims. The word-game layer IS the differentiator.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Words as factory output | The core twist: letters are resources, words are products. No other factory sim does this. Creates a unique mental model where vocabulary knowledge becomes a gameplay skill. | MEDIUM | Requires a curated word dictionary (not full English dictionary -- curated for fun, not obscure words). |
| Spatial letter routing puzzles | Quarries are fixed, so routing the right letters to the right assembler IS the puzzle. "I need A, B, and T to make BAT -- but A is across the map from B." | LOW | Emergent from fixed quarry positions + assembler recipes. No extra code needed beyond good map design. |
| Tech tree gated by word complexity | Progression from 3-letter words to longer words creates natural difficulty scaling. Longer words need more letters routed simultaneously, demanding more sophisticated belt networks. | MEDIUM | Recipe unlock tree. 3-letter -> 4-letter -> 5-letter etc. Each tier requires currency from previous tier. |
| Word recipe system | Assemblers configured with a target word from available recipes. Feed correct letters in order. Unique to this game -- combines Scrabble-like word knowledge with factory logistics. | MEDIUM | Dictionary of valid recipes per tier. UI for selecting/browsing recipes on an assembler. |
| Letter frequency as resource scarcity | Some letters are common (E, T, A, S) and some are rare (Q, Z, X, J). Rare letter quarries create high-value routing challenges. Words using rare letters could be worth more currency. | LOW | Map design + scoring multipliers. Natural scarcity creates interesting decisions. |
| Multiple valid words from same letters | Unlike Factorio where there is one recipe for iron plates, the same letters can make different words. Players choose WHICH words to produce, adding strategic depth. | LOW | Emergent from dictionary. No extra system needed -- just recipe selection on assemblers. |
| Word completion animations | Satisfying visual/particle effect when a word is completed. The "aha" moment of word formation combined with factory automation payoff. | LOW | Particle effects + brief text display of completed word. Small effort, high impact on game feel. |

### Anti-Features (Commonly Requested, Often Problematic)

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Full English dictionary | "Let me make ANY word!" | 170k+ words is overwhelming. Obscure words are not fun. Balance becomes impossible. Players would need to look up valid words externally. | Curated dictionary of common, recognizable words (2,000-5,000 words) organized by tier. Every word should be one a player could reasonably think of. |
| Multiplayer / competitive | Factory sims with multiplayer exist (Factorio, Mindustry). | Massively increases complexity (netcode, sync, hosting). PROJECT.md explicitly scopes this out. Single-player factory sims are perfectly viable -- Shapez.io proves this. | Single player only. Leaderboards could be a lightweight v2 add-on if desired. |
| Mobile support | Browser game = phones too, right? | Touch controls for precise tile placement are frustrating. Belt routing on small screens is painful. Phaser 3 can do it but the UX is bad for this genre. | Desktop-first per PROJECT.md. Responsive layout that doesn't break on tablets, but no touch optimization. |
| Real-time combat / enemies | Mindustry and Factorio have enemies. | Adds an entirely separate game system (AI, pathfinding, damage, health). Splits development focus. The word puzzle IS the challenge -- enemies would distract from it. | No combat. The challenge is logistics + vocabulary, not tower defense. |
| Sound and music | Expected in polished games. | Significant asset creation/licensing effort. Not needed to validate the core loop. | Defer to v2 per PROJECT.md. Visual feedback (animations, particles) carries the game feel for v1. |
| Free-form word typing | "Let me type words directly!" | Bypasses the entire factory simulation. The point is building machines to produce words, not typing them yourself. | Words are produced by assemblers only. The factory IS the input method. |
| Procedural / infinite maps | "I want to keep expanding forever!" | Makes map design meaningless. Fixed quarry placement is what creates the spatial puzzle. Infinite maps dilute the routing challenge. | Hand-designed or semi-procedural maps with intentional quarry placement. Multiple maps/levels rather than infinite expansion. |
| Idle / offline progression | Factory idle games are popular. | Undermines the active factory-building gameplay. The fun is in designing and watching the factory, not leaving it running. | Factory runs while the tab is open. No offline production. Save state preserves factory but does not simulate missed time. |
| Word-to-word chaining (words as inputs) | "Use completed words as ingredients for bigger words!" | Cool concept but exponentially increases complexity. Deferred in PROJECT.md for good reason. | v2 feature. Get single-tier word production working perfectly first. |
| Blueprint / copy-paste system | Factorio players love blueprints. | Premature optimization for a game where factories are small and word-specific. Blueprints matter when factories have hundreds of repeated patterns. AlphabetSoup factories are each unique (different letter routing per word). | Not needed for v1. Each word recipe creates a unique routing challenge. If factories grow large enough to need it, add in v2. |

## Feature Dependencies

```
[Tick-based Simulation Engine]
    |-- drives --> [Conveyor Belt System]
    |                  |-- moves --> [Letter Items on Belts]
    |                  |-- connects --> [Inserters]
    |                                      |-- feeds --> [Assembler Machines]
    |                                                       |-- uses --> [Word Recipe System]
    |                                                       |-- produces --> [Currency/Scoring]
    |                                                                           |-- unlocks --> [Tech Tree]
    |
    |-- drives --> [Resource Sources (Quarries)]
                       |-- produces --> [Letter Items]

[Grid System]
    |-- required by --> [Tile Placement / Build Controls]
    |-- required by --> [Conveyor Belts]
    |-- required by --> [All Machine Placement]

[Save/Load System]
    |-- requires --> [Serializable Game State]
    |                    |-- requires --> [All entity systems finalized]

[Camera Controls] -- independent, can be built anytime

[Game Speed Controls] -- requires --> [Tick Engine]

[Word Recipe System] -- requires --> [Curated Dictionary]
```

### Dependency Notes

- **Tick Engine is the foundation:** Every entity (quarries, belts, inserters, assemblers) depends on the tick system. Build this first.
- **Grid System is the spatial foundation:** All placement logic depends on a working grid. Build alongside or immediately after tick engine.
- **Belts are the hardest system:** Belt merging, splitting, corners, and item flow are the most complex single feature. Budget significant time.
- **Save/Load should come after core systems stabilize:** Serialization format depends on final entity structure. Building it too early means constant refactoring.
- **Tech Tree depends on working economy:** Cannot balance progression without a functioning currency loop from word completion.
- **Dictionary curation is a content task:** Can be done in parallel with engine work. Start with 100-200 words for testing, expand later.

## MVP Definition

### Launch With (v1)

Minimum viable product -- enough to validate the core loop of "build factory, route letters, produce words."

- [ ] Tick-based simulation engine -- everything else depends on this
- [ ] Grid system with tile placement and demolition -- spatial foundation
- [ ] Letter quarries producing letters over time -- resource generation
- [ ] Conveyor belts moving letters directionally -- logistics backbone
- [ ] Inserters transferring items between belts and machines -- the glue
- [ ] Assembler machines with word recipe selection -- the payoff
- [ ] Curated word dictionary (200-500 words, 3-5 letter words) -- content
- [ ] Currency from completed words -- progression fuel
- [ ] Basic tech tree (3-letter -> 4-letter -> 5-letter unlocks) -- progression
- [ ] Camera pan/zoom -- navigation
- [ ] Game speed controls (pause/play/fast) -- planning and observation
- [ ] Basic HUD (currency, selected tool, production stats) -- status info
- [ ] localStorage save/load -- session persistence
- [ ] Word completion visual feedback -- satisfaction moment

### Add After Validation (v1.x)

Features to add once the core loop is proven fun.

- [ ] More word tiers (6+ letter words) -- when players exhaust 5-letter content
- [ ] Letter frequency scoring multipliers -- when economy needs more depth
- [ ] Multiple maps with different quarry layouts -- when players want variety
- [ ] Belt splitters and underground belts -- when routing becomes too constrained
- [ ] Production statistics panel -- when players want to optimize throughput
- [ ] Undo/redo for placement -- quality of life after core works

### Future Consideration (v2+)

- [ ] Word-to-word chaining (words as inputs to higher-tier assemblers) -- deferred per PROJECT.md, adds a new dimension of complexity
- [ ] Sound and music -- deferred per PROJECT.md, visual-first approach for v1
- [ ] Achievement system -- once there is enough content to reward
- [ ] Multiple save slots -- when players want parallel experiments
- [ ] Community word packs / custom dictionaries -- when base game is stable
- [ ] Leaderboards (best score per map) -- lightweight competitive element

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Tick-based simulation engine | HIGH | HIGH | P1 |
| Grid system + tile placement | HIGH | MEDIUM | P1 |
| Conveyor belts with item flow | HIGH | HIGH | P1 |
| Letter quarries | HIGH | LOW | P1 |
| Inserters | HIGH | MEDIUM | P1 |
| Assembler machines | HIGH | MEDIUM | P1 |
| Word recipe system + dictionary | HIGH | MEDIUM | P1 |
| Currency / scoring | HIGH | LOW | P1 |
| Camera pan/zoom | MEDIUM | LOW | P1 |
| Game speed controls | MEDIUM | LOW | P1 |
| Basic HUD | MEDIUM | LOW | P1 |
| Save/load (localStorage) | HIGH | MEDIUM | P1 |
| Tech tree (word tiers) | MEDIUM | MEDIUM | P1 |
| Word completion effects | MEDIUM | LOW | P1 |
| Belt splitters / underground | MEDIUM | MEDIUM | P2 |
| Production statistics | LOW | LOW | P2 |
| Multiple maps | MEDIUM | MEDIUM | P2 |
| Letter rarity scoring | LOW | LOW | P2 |
| Undo/redo | MEDIUM | MEDIUM | P2 |
| Word-to-word chaining | HIGH | HIGH | P3 |
| Sound/music | MEDIUM | MEDIUM | P3 |
| Achievements | LOW | LOW | P3 |

**Priority key:**
- P1: Must have for launch
- P2: Should have, add when possible
- P3: Nice to have, future consideration

## Competitor Feature Analysis

| Feature | Factorio | Shapez.io | Mindustry | AlphabetSoup Approach |
|---------|----------|-----------|-----------|----------------------|
| Resource type | Ores (iron, copper, etc.) | Geometric shapes | Ores + liquids | Alphabet letters (26 types) |
| Transport | Belts, trains, logistics bots | Belts only | Conveyors, bridges | Belts + inserters (keep it simple) |
| Crafting | Recipes with fixed inputs | Cut/rotate/paint/stack shapes | Recipes + smelting | Word recipes (feed letters, produce word) |
| Progression | Tech tree (science packs) | Hub deliveries unlock tiers | Campaign + research | Tech tree gated by word length tiers |
| Challenge source | Enemies + throughput optimization | Throughput + shape complexity | Enemies + waves | Spatial routing + vocabulary knowledge |
| Map structure | Infinite procedural | Infinite procedural | Campaign maps + custom | Fixed maps with intentional quarry placement |
| Complexity ceiling | Extremely high (megabases) | High (logic gates, wires) | High (logic, PvP) | Moderate (word length + routing complexity) |
| Combat | Yes (biters) | No | Yes (tower defense) | No -- puzzle focus |
| Multiplayer | Yes (co-op) | No | Yes (PvP + co-op) | No -- single player |
| Platform | Desktop (Steam) | Browser + Steam | Multi-platform | Browser (desktop) |

## Sources

- [Factorio - Wikipedia](https://en.wikipedia.org/wiki/Factorio)
- [Formal Deconstruction Analysis of Factorio](https://medium.com/@VladArtym/the-formal-deconstruction-analysis-of-factorio-a1dae391ca08)
- [Shapez.io Game Mechanics - DeepWiki](https://deepwiki.com/tobspr-games/shapez.io/3-game-mechanics)
- [Shapez.io GitHub](https://github.com/tobspr-games/shapez.io)
- [Mindustry - Wikipedia](https://en.wikipedia.org/wiki/Mindustry)
- [Mindustry Game Review](https://tildesare.cool/2025/01/17/game-review-mindustry-steam/)
- [Evolution of Word Games: Scrabble to Wordle](https://miniwordgame.com/evolution-of-word-games)
- [MDA: Wordscapes Analysis](https://medium.com/game-design-fundamentals/mda-wordscapes-77b6d762204d)
- [Wordnik Open Source Wordlist](https://github.com/wordnik/wordlist)
- [Factorio Blueprint System](https://wiki.factorio.com/Blueprint)
- [Factorio Systems Thinking](https://medium.com/gaming-is-good/factorio-taught-me-systems-thinking-part-i-f8a1d2a8a349)

---
*Feature research for: 2D Factory Simulation + Word Puzzle Hybrid*
*Researched: 2026-03-04*
