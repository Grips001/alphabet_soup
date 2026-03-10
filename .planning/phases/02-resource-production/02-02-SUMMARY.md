---
phase: 02-resource-production
plan: "02"
subsystem: simulation
tags: [belt-system, quarry-system, item-transport, backpressure, tdd]

# Dependency graph
requires:
  - phase: 02-01
    provides: Belt, Quarry, LetterItem entity classes, BuildingSystem, BeltDirection/Variant enums

provides:
  - BeltSystem: item transport with reverse-propagation ordering, backpressure, placeBeltPath
  - QuarrySystem: letter production every 30 ticks with backpressure detection
  - computeBeltVariant: fixed to cover all 8 directional corner combinations

affects:
  - 02-03-rendering (reads BeltSystem and QuarrySystem state for visual output)
  - 02-04-placement (calls BeltSystem.placeBeltPath on drag, QuarrySystem.initializeQuarries on load)
  - phase-03-assembler (consumes LetterItems arriving at assembler input from BeltSystem)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Reverse-propagation belt processing: sort belts by distance-from-end (ascending), so farthest-downstream processed first — prevents double-advance bug without additional state tracking
    - backpressured flag updated every tick before canProduce() check — ensures clearing propagates immediately
    - registerBelt private helper separates storage from rebuildProcessingOrder, allowing placeBeltPath to batch-add belts with a single rebuild

key-files:
  created:
    - src/game/systems/BeltSystem.ts
    - src/game/systems/BeltSystem.test.ts
    - src/game/systems/QuarrySystem.ts
    - src/game/systems/QuarrySystem.test.ts
  modified:
    - src/game/entities/Belt.ts

key-decisions:
  - "BeltSystem processes belts farthest-downstream-first using distance-from-end sort; prevents double-advance without explicit visited set during tick"
  - "QuarrySystem updates backpressured flag unconditionally each tick before canProduce() check, not only on attempted production"
  - "Belt.ts VARIANT_LOOKUP extended with E/W input corners (E,N E,S W,N W,S) — bug fix, all 8 corner orientations now covered"
  - "placeBeltPath uses private registerBelt to batch-add belts with one rebuildProcessingOrder at end (O(n) vs O(n^2))"

patterns-established:
  - "Downstream-first processing: compute distance-from-end with memoized DFS, sort ascending, process in order"
  - "Backpressure check at top of tick per-entity: always refresh flag before deciding whether to produce/move"

requirements-completed: [PROD-01, TRNS-01, TRNS-02]

# Metrics
duration: 6min
completed: 2026-03-10
---

# Phase 2 Plan 02: Simulation Systems Summary

**BeltSystem with reverse-propagation item transport and QuarrySystem with 30-tick letter production, both with full backpressure handling and TDD coverage**

## Performance

- **Duration:** 6 min
- **Started:** 2026-03-10T18:13:56Z
- **Completed:** 2026-03-10T18:19:26Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments

- BeltSystem moves items 1 tile/tick with correct downstream-first processing order — no double-advance bug with 2 items in a 3-belt chain
- QuarrySystem produces LetterItems every 30 ticks when output belt is clear, sets backpressure flag otherwise
- placeBeltPath converts a drag path into placed belts with auto-computed corner variants (L-turns, connecting to existing belts)
- Fixed missing corner entries in Belt.ts VARIANT_LOOKUP (E,N / E,S / W,N / W,S were absent — caused incorrect variant for East-input corners)

## Task Commits

Each task was committed atomically with TDD RED then GREEN commits:

1. **Task 1: BeltSystem failing tests** - `d638e45` (test)
2. **Task 1: BeltSystem implementation** - `9de5ab5` (feat — includes Belt.ts bug fix)
3. **Task 2: QuarrySystem failing tests** - `6a00567` (test)
4. **Task 2: QuarrySystem implementation** - `a9eac80` (feat)

**Plan metadata:** (docs commit follows)

_Note: TDD tasks have separate test (RED) and implementation (GREEN) commits_

## Files Created/Modified

- `src/game/systems/BeltSystem.ts` - Belt management, item movement with downstream-first ordering, placeBeltPath
- `src/game/systems/BeltSystem.test.ts` - 21 tests covering transport, backpressure, ordering, corners
- `src/game/systems/QuarrySystem.ts` - Production timer, LetterItem creation, backpressure flag management
- `src/game/systems/QuarrySystem.test.ts` - 11 tests covering timer, production, backpressure, initializeQuarries
- `src/game/entities/Belt.ts` - Added 4 missing horizontal-to-vertical corner entries to VARIANT_LOOKUP

## Decisions Made

- **Downstream-first sort via distance-from-end DFS:** Each tick, belts sorted by ascending steps-to-chain-end. Simplest correct approach for linear chains; Phase 3 can extend to handle splits/merges if needed.
- **Backpressure flag updated unconditionally:** Setting `quarry.backpressured` before `canProduce()` check ensures it clears immediately when output frees up, rather than requiring an extra tick to clear.
- **Batch rebuild in placeBeltPath:** Private `registerBelt()` method lets placeBeltPath add N belts then call `rebuildProcessingOrder()` once, avoiding O(N^2) rebuilds for long drag paths.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed missing East/West input corners in Belt.ts VARIANT_LOOKUP**
- **Found during:** Task 1 (BeltSystem placeBeltPath L-turn test)
- **Issue:** VARIANT_LOOKUP had corners for N,E / N,W / S,E / S,W but was missing E,N / E,S / W,N / W,S. An East-traveling item turning South at a corner returned `StraightNS` instead of `CornerSE`.
- **Fix:** Added the 4 missing entries mapping E/W input directions to their correct corner variants
- **Files modified:** `src/game/entities/Belt.ts`
- **Verification:** BeltSystem test `placeBeltPath with L-turn creates belt at (1,0) with corner variant` passes; all 111 tests pass
- **Committed in:** `9de5ab5` (Task 1 implementation commit)

---

**Total deviations:** 1 auto-fixed (Rule 1 - Bug)
**Impact on plan:** Fix necessary for correct corner rendering. No scope creep — Belt.ts is already in plan's `files_modified` list.

## Issues Encountered

- `canProduce()` on Quarry checks `!this.backpressured`, so if backpressure was set in tick N and belt clears before tick N+1, the quarry could still appear blocked. Resolved by updating the backpressured flag unconditionally at the top of each quarry's tick cycle, before calling `canProduce()`.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- BeltSystem and QuarrySystem are fully tested and ready to wire into TickEngine callbacks in GameScene
- QuarrySystem.initializeQuarries() is ready to call during scene setup
- BeltSystem.placeBeltPath() is ready for the placement UI (Plan 04)
- Both systems produce state that BeltRenderer/QuarryRenderer can read in Plan 03

---
*Phase: 02-resource-production*
*Completed: 2026-03-10*
