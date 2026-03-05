---
phase: 1
slug: foundation
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-04
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest (latest, via bun) |
| **Config file** | vite.config.ts (test section) — Wave 0 installs |
| **Quick run command** | `bun run test` |
| **Full suite command** | `bun run test && bun run type-check` |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Run `bun run test`
- **After every plan wave:** Run `bun run test && bun run type-check && bun run build`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 10 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 01-01-01 | 01 | 0 | INFRA-01 | smoke | `bun run build` | No — W0 | pending |
| 01-01-02 | 01 | 0 | INFRA-02 | smoke | `bun run type-check` | No — W0 | pending |
| 01-02-01 | 02 | 1 | SIM-01 | unit | `bun run vitest run src/game/systems/TickEngine.test.ts` | No — W0 | pending |
| 01-02-02 | 02 | 1 | SIM-01 | unit | `bun run vitest run src/game/systems/TickEngine.test.ts` | No — W0 | pending |
| 01-03-01 | 03 | 1 | GRID-01 | unit | `bun run vitest run src/game/world/Grid.test.ts` | No — W0 | pending |
| 01-03-02 | 03 | 1 | GRID-01 | unit | `bun run vitest run src/game/world/Grid.test.ts` | No — W0 | pending |
| 01-04-01 | 04 | 2 | GRID-04 | unit | `bun run vitest run src/game/systems/CameraController.test.ts` | No — W0 | pending |
| 01-05-01 | 04 | 2 | GRID-04 | manual | visual inspection | N/A | pending |

*Status: pending / green / red / flaky*

---

## Wave 0 Requirements

- [ ] `bun add -d vitest` — install test framework
- [ ] `vite.config.ts` — add Vitest test configuration section
- [ ] `src/game/systems/TickEngine.test.ts` — stubs for SIM-01
- [ ] `src/game/world/Grid.test.ts` — stubs for GRID-01
- [ ] `src/game/systems/CameraController.test.ts` — stubs for GRID-04

*Framework and test stubs must exist before Wave 1 execution.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Camera pans smoothly with WASD/arrows | GRID-04 | Subjective smoothness feel | Press WASD, verify smooth acceleration/deceleration |
| Zoom follows cursor position | GRID-04 | Visual-spatial verification | Hover cursor, scroll wheel, verify world point stays under cursor |
| Middle-click drag repositions camera | GRID-04 | Browser interaction + visual | Middle-click and drag, verify camera follows |
| Grid lines visible but subtle | GRID-01 | Aesthetic judgment | Visual check at 1x, 0.5x, and 3x zoom |
| Debug overlay shows correct info | SIM-01 | Visual + toggle behavior | Press F3, verify FPS/tick/tile shown, press F3 again to hide |
| Pixel art renders without artifacts | GRID-01 | Visual rendering quality | Pan and zoom, check for tile bleeding or shimmer |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 10s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
