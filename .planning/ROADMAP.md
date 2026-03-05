# Roadmap: AlphabetSoup

## Overview

AlphabetSoup goes from empty project to playable factory-sim-meets-word-game in five phases. We start with the simulation engine and grid (the foundation everything runs on), then bring the factory to life with quarries and belts moving letters, then close the production loop with inserters and assemblers turning letters into words, then add progression mechanics that give the player goals and rewards, and finally add persistence and UI polish so it is a complete, shippable game.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Foundation** - Simulation engine, grid world, camera, and CI/CD pipeline
- [ ] **Phase 2: Resource Production** - Quarries produce letters, belts transport them, building placement works
- [ ] **Phase 3: Factory Loop** - Inserters, assemblers, and word recipes complete the letter-to-word pipeline
- [ ] **Phase 4: Progression & Economy** - Currency from words, tech tree, hub goals, and game speed controls
- [ ] **Phase 5: Persistence & Polish** - Save/load, HUD, and game state versioning

## Phase Details

### Phase 1: Foundation
**Goal**: A running game with a visible tile grid, working camera, and a deterministic tick engine that can host future entities -- deployed to Vercel via CI
**Depends on**: Nothing (first phase)
**Requirements**: SIM-01, GRID-01, GRID-04, INFRA-01, INFRA-02
**Success Criteria** (what must be TRUE):
  1. Game launches in a browser and displays a tile grid world
  2. Player can pan the camera with mouse/keyboard and zoom with scroll wheel
  3. Tick engine runs at a fixed timestep independent of render framerate (visible via a tick counter or debug overlay)
  4. Pushing to GitHub triggers a build and deploys to a live Vercel URL
  5. CI runs type-check and tests on every push
**Plans**: 3 plans

Plans:
- [ ] 01-01-PLAN.md -- Project scaffold, TickEngine (TDD), Grid data model (TDD)
- [ ] 01-02-PLAN.md -- Grid renderer, camera controller, scene wiring, debug overlay
- [ ] 01-03-PLAN.md -- CI/CD pipeline, Vercel deployment, visual verification

### Phase 2: Resource Production
**Goal**: Players can place quarries and belts on the grid, see letters being produced and physically moving along belt paths
**Depends on**: Phase 1
**Requirements**: PROD-01, TRNS-01, TRNS-02, GRID-02, GRID-03
**Success Criteria** (what must be TRUE):
  1. Letter quarries at fixed map positions visibly produce letter items on a regular tick interval
  2. Player can place conveyor belts that move letter items in a direction, including auto-connecting corners
  3. Player can see a ghost preview when placing buildings, showing valid/invalid positions
  4. Player can demolish any placed building
  5. Letter items visually travel along belt paths from quarry output toward the belt end
**Plans**: TBD

Plans:
- [ ] 02-01: TBD
- [ ] 02-02: TBD
- [ ] 02-03: TBD

### Phase 3: Factory Loop
**Goal**: The complete production chain works -- inserters pull letters off belts into assemblers, assemblers consume the correct letters and output completed word items
**Depends on**: Phase 2
**Requirements**: TRNS-03, TRNS-04, TRNS-05, PROD-02, PROD-03, WORD-01, WORD-02
**Success Criteria** (what must be TRUE):
  1. Player can place inserters that transfer letter items between belts and machines
  2. Player can place an assembler, assign it a word recipe, and it consumes the correct letters to produce a word item
  3. Player can place belt splitters that divide item flow between two output belts
  4. Player can place underground belts that tunnel under obstacles and resurface
  5. A curated word dictionary is available with words organized by tier (3-letter, 4-letter, 5-letter)
**Plans**: TBD

Plans:
- [ ] 03-01: TBD
- [ ] 03-02: TBD
- [ ] 03-03: TBD

### Phase 4: Progression & Economy
**Goal**: Completed words have value -- routing them to a hub earns currency, currency buys infrastructure, and a tech tree gates access to harder word recipes
**Depends on**: Phase 3
**Requirements**: PROG-01, PROG-02, PROG-03, PROG-04, PROG-05, WORD-03, SIM-02
**Success Criteria** (what must be TRUE):
  1. Completed words routed to a central hub earn currency visible to the player
  2. Player can spend currency to purchase machines, belts, and upgrades
  3. Tech tree unlocks progressively complex word tiers (3-letter to 4-letter to 5-letter)
  4. Words using rare letters (Q, Z, X, J) earn bonus currency
  5. Completing a word triggers a satisfying visual effect
**Plans**: TBD

Plans:
- [ ] 04-01: TBD
- [ ] 04-02: TBD

### Phase 5: Persistence & Polish
**Goal**: The game remembers progress across sessions and the player has clear information about their factory state at all times
**Depends on**: Phase 4
**Requirements**: UI-01, UI-02, UI-03
**Success Criteria** (what must be TRUE):
  1. HUD displays current currency, selected tool, and production stats
  2. Game state saves to localStorage and restores correctly when the player returns
  3. Save format includes a version number for future migration compatibility
**Plans**: TBD

Plans:
- [ ] 05-01: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 2 -> 3 -> 4 -> 5

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation | 0/3 | Not started | - |
| 2. Resource Production | 0/3 | Not started | - |
| 3. Factory Loop | 0/3 | Not started | - |
| 4. Progression & Economy | 0/2 | Not started | - |
| 5. Persistence & Polish | 0/1 | Not started | - |
