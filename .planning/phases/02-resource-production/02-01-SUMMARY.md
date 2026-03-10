---
phase: 02-resource-production
plan: 01
subsystem: entities
tags: [typescript, tdd, vitest, game-entities, data-models]

# Dependency graph
requires:
  - phase: 01-foundation
    provides: Grid tile system (Uint8Array), TickEngine fixed-timestep, constants.ts base
provides:
  - Quarry data model: 2x2 occupancy, outputTile per direction, production timer, backpressure
  - Belt data model: direction enum, variant enum, computeBeltVariant lookup, item slot
  - LetterItem data model: tile/previousTile with snapshotPosition deep-copy for interpolation
  - BuildingSystem registry: place/demolish/getAt/getAllBuildings for single and multi-tile buildings
  - Phase 2 constants: tile type codes, QUARRY_PRODUCTION_INTERVAL, BELT_SPEED, ITEM_SIZE, depth layers, LETTER_COLORS palette
  - quarryLayout: 10 quarry definitions for E,T,A,O,I,N,S,R,H,L on the 64x64 map
affects:
  - 02-02 (BeltSystem, QuarrySystem depend on Belt, Quarry, LetterItem, BuildingSystem)
  - 02-03 (PlacementSystem and all renderers depend on BuildingSystem and entity types)
  - All subsequent plans in Phase 2 and Phase 3

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Building interface (occupiedTiles + type) implemented by Quarry and Belt for polymorphic registry
    - TDD: failing tests committed first, implementation committed after all tests pass
    - computeBeltVariant uses a static lookup table (Record<string,BeltVariant>) for O(1) variant resolution
    - snapshotPosition uses shallow object copy ({ ...tile }) for interpolation-safe previousTile

key-files:
  created:
    - src/game/entities/LetterItem.ts
    - src/game/entities/LetterItem.test.ts
    - src/game/entities/Belt.ts
    - src/game/entities/Belt.test.ts
    - src/game/entities/Quarry.ts
    - src/game/entities/Quarry.test.ts
    - src/game/systems/BuildingSystem.ts
    - src/game/systems/BuildingSystem.test.ts
    - src/game/world/quarryLayout.ts
  modified:
    - src/game/constants.ts

key-decisions:
  - "Building interface uses occupiedTiles() + type string for polymorphic multi-tile registry"
  - "computeBeltVariant uses static string-keyed lookup table rather than switch/case for extensibility"
  - "quarryLayout scatters 7 quarries along top edge (y=4) and 3 along bottom (y=56) for routing variety"
  - "LETTER_COLORS uses 0xRRGGBB hex numbers to match Phaser's integer color format"

patterns-established:
  - "Entity pattern: pure TS class with occupiedTiles() and type, no Phaser imports"
  - "Building registry: Map<string,Building> keyed by 'x,y' tile coordinates"
  - "TDD flow: write all test files (RED commit), then implement (GREEN commit)"

requirements-completed: [GRID-02, GRID-03]

# Metrics
duration: 2min
completed: 2026-03-10
---

# Phase 2 Plan 01: Entity Data Models and BuildingSystem Summary

**Pure-TS entity data models (Quarry 2x2, Belt with variant lookup, LetterItem interpolation) plus BuildingSystem tile registry with multi-tile place/demolish — 79 tests passing, zero type errors**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-10T01:48:25Z
- **Completed:** 2026-03-10T01:50:31Z
- **Tasks:** 2
- **Files modified:** 10

## Accomplishments

- Entity data models (Quarry, Belt, LetterItem) fully typed with no Phaser dependencies
- BuildingSystem correctly handles single-tile (Belt) and multi-tile (Quarry 2x2) place/demolish with atomic rejection on collision
- Phase 2 constants added: tile type codes, production interval, depth layers, 26-color letter palette
- 10 quarry positions defined across 64x64 map for routing challenges

## Task Commits

Each task was committed atomically using TDD (RED then GREEN):

1. **Task 1 RED: Failing tests for entity models** - `1390f49` (test)
2. **Task 1+2 GREEN: All entity implementations** - `66de782` (feat)

_Note: Both tasks' tests were committed together in RED phase, then both implementations in GREEN phase, as all implementation files were cleanly separable._

## Files Created/Modified

- `src/game/constants.ts` - Added Phase 2 tile codes, QUARRY_PRODUCTION_INTERVAL=30, BELT_SPEED=1, ITEM_SIZE=16, depth layers, LETTER_COLORS palette (26 warm tones)
- `src/game/entities/LetterItem.ts` - Letter, tile/previousTile, snapshotPosition() deep copy
- `src/game/entities/LetterItem.test.ts` - 8 tests covering construction and snapshot
- `src/game/entities/Belt.ts` - BeltDirection/BeltVariant enums, computeBeltVariant() lookup, Belt class with item slot
- `src/game/entities/Belt.test.ts` - 14 tests covering direction, item, occupiedTiles, all 8 variant combos
- `src/game/entities/Quarry.ts` - 2x2 occupiedTiles(), outputTile per direction, production timer, backpressure
- `src/game/entities/Quarry.test.ts` - 17 tests covering all construction, occupancy, outputTile, timer, backpressure
- `src/game/systems/BuildingSystem.ts` - Building interface, place/demolish/getAt/getAllBuildings
- `src/game/systems/BuildingSystem.test.ts` - 16 tests covering single/multi-tile placement, collision, demolish, dedup
- `src/game/world/quarryLayout.ts` - QUARRY_DEFINITIONS: 10 quarries for E,T,A,O,I,N,S,R,H,L

## Decisions Made

- Building interface uses `occupiedTiles()` + `type` string for polymorphic multi-tile registry
- `computeBeltVariant` uses a static string-keyed lookup table (`Record<string, BeltVariant>`) rather than nested switch/case — easily extended with cross-axis straight variants
- Quarry layout: 7 quarries across the top edge (origin y=4, output South) and 3 along the bottom (origin y=56, output North) — gives varied routing paths
- `LETTER_COLORS` uses `0xRRGGBB` hex integers to match Phaser's native color format (no conversion needed at render time)

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- All entity types (Quarry, Belt, LetterItem) and BuildingSystem are ready for Phase 2 Plan 02 (BeltSystem and QuarrySystem)
- The Building interface is the contract BeltSystem and QuarrySystem will query for placement/routing
- No blockers

---
*Phase: 02-resource-production*
*Completed: 2026-03-10*
