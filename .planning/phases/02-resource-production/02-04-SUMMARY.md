---
phase: 02-resource-production
plan: "04"
subsystem: ui
tags: [phaser, typescript, placement, toolbar, ghost-preview, drag-placement, demolish]

# Dependency graph
requires:
  - phase: 02-resource-production plan 01
    provides: BuildingSystem, BeltSystem, Belt entities with variants
  - phase: 02-resource-production plan 02
    provides: BeltSystem.placeBeltPath, QuarrySystem simulation
  - phase: 02-resource-production plan 03
    provides: BeltRenderer.addBelt/removeBelt, ItemRenderer.removeItem, QuarryRenderer

provides:
  - PlacementSystem: pure TS tool selection, cursor tracking, drag path accumulation
  - ToolbarUI: bottom toolbar with Belt and Demolish buttons on dedicated UI camera
  - GhostRenderer: world-space ghost preview with green/red validity tinting
  - GameScene: complete pointer and keyboard input wiring for placement and demolish

affects: [03-word-assembly, all future phases with build tools]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - PlacementSystem as pure state machine (no Phaser) — testable without renderer
    - ToolbarUI on UI camera with main camera ignore pattern (matches DebugOverlay)
    - GhostRenderer in world space (main camera) ignored by UI camera
    - Keyboard hotkeys with event.preventDefault() to block browser defaults

key-files:
  created:
    - src/game/systems/PlacementSystem.ts
    - src/game/systems/PlacementSystem.test.ts
    - src/game/renderers/ToolbarUI.ts
    - src/game/renderers/GhostRenderer.ts
  modified:
    - src/game/scenes/GameScene.ts

key-decisions:
  - "PlacementSystem uses same dragPath for both Belt and Demolish tools — unified drag accumulation"
  - "ToolbarUI accesses UI camera via cameras.cameras[1] (created by DebugOverlay)"
  - "Ghost renderer accesses private fields via bracket notation for UI camera ignore registration"
  - "Belt validity filter applied at placement time (not preview time) — only valid tiles in path are placed"
  - "Neighbor belt refresh: remove+re-add via BeltRenderer for corner variant update after place/demolish"

patterns-established:
  - "PlacementSystem pattern: pure state machine with selectTool/updateCursor/startDrag/updateDrag/endDrag"
  - "Toolbar buttons: toggle behavior (click active tool again to deselect)"

requirements-completed: [GRID-02, GRID-03, TRNS-01, TRNS-02]

# Metrics
duration: 3min
completed: 2026-03-10
---

# Phase 2 Plan 04: Placement UX Summary

**PlacementSystem state machine + ToolbarUI + GhostRenderer delivering click-drag belt placement and demolish tool with green/red validity preview**

## Performance

- **Duration:** ~3 min
- **Started:** 2026-03-10T18:30:42Z
- **Completed:** 2026-03-10T18:33:51Z
- **Tasks:** 2 of 3 complete (Task 3 is human visual verification checkpoint)
- **Files modified:** 5

## Accomplishments
- PlacementSystem pure state machine: tool selection, cursor tracking, drag path accumulation — 18 tests all pass
- ToolbarUI with Belt and Demolish buttons, active highlighting, hotkeys 1/2/Delete/ESC
- GhostRenderer in world space with green (valid) / red+X (invalid/demolish) feedback
- GameScene fully wired: pointer events drive PlacementSystem, pointerup commits belt paths or demolishes tiles
- Neighbor belt refresh after place/demolish keeps corner variants correct

## Task Commits

Each task was committed atomically:

1. **Task 1 RED: PlacementSystem failing tests** - `dd167df` (test)
2. **Task 1 GREEN: PlacementSystem implementation** - `ddab8ba` (feat)
3. **Task 2: ToolbarUI, GhostRenderer, GameScene wiring** - `92ece68` (feat)

_Task 3 (human-verify checkpoint) pending visual confirmation._

## Files Created/Modified
- `src/game/systems/PlacementSystem.ts` - Pure TS placement state machine (no Phaser)
- `src/game/systems/PlacementSystem.test.ts` - 18 tests for tool selection, cursor, drag, demolish
- `src/game/renderers/ToolbarUI.ts` - Bottom toolbar on UI camera, active tool highlighting
- `src/game/renderers/GhostRenderer.ts` - World-space ghost preview with validity tinting
- `src/game/scenes/GameScene.ts` - Full input wiring, placement and demolish handlers

## Decisions Made
- PlacementSystem uses unified dragPath for both Belt and Demolish — simpler API, single endDrag() return type
- ToolbarUI accesses UI camera via `cameras.cameras[1]` (DebugOverlay creates it as second camera)
- Ghost renderer uses bracket notation to access private fields for UI camera ignore registration
- Belt validity filter runs at placement commit (not during ghost preview) — ghost still shows red but path is filtered
- Neighbor refresh uses remove+re-add pattern matching BeltRenderer's explicit API

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered
None — build and tests passed first attempt.

## User Setup Required
None — no external service configuration required.

## Next Phase Readiness
- Complete Phase 2 interaction loop ready for visual verification (Task 3 checkpoint)
- After verification, Phase 3 (Word Assembly) can build assembler entities using BuildingSystem.place()
- PlacementSystem can be extended with additional ToolTypes (e.g., ToolType.Assembler) in Phase 3
- Toolbar can accept additional buttons alongside Belt and Demolish

---
*Phase: 02-resource-production*
*Completed: 2026-03-10*
