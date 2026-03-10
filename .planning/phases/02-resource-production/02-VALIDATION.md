---
phase: 2
slug: resource-production
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-10
---

# Phase 2 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 3.x |
| **Config file** | `vite.config.ts` (test section with `globals: true`, `environment: "node"`) |
| **Quick run command** | `bun test` |
| **Full suite command** | `bun test && bun run build` |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Run `bun test`
- **After every plan wave:** Run `bun test && bun run build`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 5 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 02-01-01 | 01 | 0 | PROD-01 | unit | `bun test src/game/entities/Quarry.test.ts` | ❌ W0 | ⬜ pending |
| 02-01-02 | 01 | 0 | TRNS-01 | unit | `bun test src/game/entities/LetterItem.test.ts` | ❌ W0 | ⬜ pending |
| 02-01-03 | 01 | 0 | TRNS-02 | unit | `bun test src/game/entities/Belt.test.ts` | ❌ W0 | ⬜ pending |
| 02-01-04 | 01 | 0 | GRID-02, GRID-03 | unit | `bun test src/game/systems/BuildingSystem.test.ts` | ❌ W0 | ⬜ pending |
| 02-02-01 | 02 | 1 | PROD-01 | unit | `bun test src/game/systems/QuarrySystem.test.ts` | ❌ W0 | ⬜ pending |
| 02-02-02 | 02 | 1 | TRNS-01, TRNS-02 | unit | `bun test src/game/systems/BeltSystem.test.ts` | ❌ W0 | ⬜ pending |
| 02-02-03 | 02 | 1 | GRID-02 | unit | `bun test src/game/systems/PlacementSystem.test.ts` | ❌ W0 | ⬜ pending |
| 02-03-01 | 03 | 2 | PROD-01 | visual | manual | N/A | ⬜ pending |
| 02-03-02 | 03 | 2 | TRNS-01 | visual | manual | N/A | ⬜ pending |
| 02-03-03 | 03 | 2 | GRID-02 | visual | manual | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/game/entities/` directory — does not exist yet
- [ ] `src/game/entities/Quarry.ts` — Quarry entity class stub
- [ ] `src/game/entities/Quarry.test.ts` — covers PROD-01 production timing + backpressure
- [ ] `src/game/entities/Belt.ts` — Belt entity class stub
- [ ] `src/game/entities/Belt.test.ts` — covers TRNS-02 variant logic
- [ ] `src/game/entities/LetterItem.ts` — LetterItem class stub
- [ ] `src/game/entities/LetterItem.test.ts` — covers TRNS-01 interpolation snapshot
- [ ] `src/game/systems/BuildingSystem.ts` — building placement/demolish
- [ ] `src/game/systems/BuildingSystem.test.ts` — covers GRID-02, GRID-03
- [ ] `src/game/systems/BeltSystem.ts` — belt tick logic
- [ ] `src/game/systems/BeltSystem.test.ts` — covers TRNS-01, TRNS-02
- [ ] `src/game/systems/QuarrySystem.ts` — quarry tick logic
- [ ] `src/game/systems/QuarrySystem.test.ts` — covers PROD-01
- [ ] `src/game/systems/PlacementSystem.ts` — cursor/drag placement state
- [ ] `src/game/systems/PlacementSystem.test.ts` — covers GRID-02

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Ghost preview shows valid/invalid positions | GRID-02 | Phaser visual rendering | Place building, verify green/red ghost appears at cursor |
| Belt items visually interpolate between tiles | TRNS-01 | Phaser sprite animation | Place quarry + belt, verify smooth item movement |
| Quarry produces visible letter tiles | PROD-01 | Phaser sprite rendering | Place quarry, wait, verify letter appears on output tile |
| Toolbar selection highlights active tool | GRID-02 | Phaser UI rendering | Click toolbar buttons, verify visual selection state |
| Demolish removes building visually | GRID-03 | Phaser visual rendering | Place building, select demolish, click building, verify removal |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 5s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
