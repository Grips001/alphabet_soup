---
phase: 3
slug: factory-loop
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-11
---

# Phase 3 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest (globals: true) |
| **Config file** | vite.config.ts (test.globals = true, environment = "node") |
| **Quick run command** | `bun test --reporter=dot` |
| **Full suite command** | `bun test` |
| **Estimated runtime** | ~3 seconds |

---

## Sampling Rate

- **After every task commit:** Run `bun test --reporter=dot`
- **After every plan wave:** Run `bun test && bun run type-check`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 5 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 03-01-01 | 01 | 1 | WORD-01 | unit | `bun test wordDictionary` | ❌ W0 | ⬜ pending |
| 03-01-02 | 01 | 1 | WORD-02 | unit | `bun test wordDictionary` | ❌ W0 | ⬜ pending |
| 03-01-03 | 01 | 1 | PROD-02 | unit | `bun test Assembler` | ❌ W0 | ⬜ pending |
| 03-01-04 | 01 | 1 | TRNS-03 | unit | `bun test Inserter` | ❌ W0 | ⬜ pending |
| 03-02-01 | 02 | 2 | TRNS-03 | unit | `bun test InserterSystem` | ❌ W0 | ⬜ pending |
| 03-02-02 | 02 | 2 | PROD-03 | unit | `bun test AssemblerSystem` | ❌ W0 | ⬜ pending |
| 03-02-03 | 02 | 2 | TRNS-04 | unit | `bun test SplitterSystem` | ❌ W0 | ⬜ pending |
| 03-02-04 | 02 | 2 | TRNS-05 | unit | `bun test UndergroundBeltSystem` | ❌ W0 | ⬜ pending |
| 03-03-01 | 03 | 3 | TRNS-03 | manual | visual | N/A | ⬜ pending |
| 03-03-02 | 03 | 3 | PROD-02 | manual | visual | N/A | ⬜ pending |
| 03-03-03 | 03 | 3 | TRNS-04 | manual | visual | N/A | ⬜ pending |
| 03-03-04 | 03 | 3 | TRNS-05 | manual | visual | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/game/data/wordDictionary.test.ts` — stubs for WORD-01, WORD-02
- [ ] `src/game/entities/Inserter.test.ts` — stubs for TRNS-03 entity contract
- [ ] `src/game/entities/Assembler.test.ts` — stubs for PROD-02, WORD-02 ingredient slots
- [ ] `src/game/systems/InserterSystem.test.ts` — stubs for TRNS-03 transfer/filter
- [ ] `src/game/systems/AssemblerSystem.test.ts` — stubs for PROD-03 collection/timer/output
- [ ] `src/game/systems/SplitterSystem.test.ts` — stubs for TRNS-04
- [ ] `src/game/systems/UndergroundBeltSystem.test.ts` — stubs for TRNS-05
- [ ] No framework install needed — Vitest already configured

*Existing infrastructure covers framework requirements.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Inserter arm swing animation | TRNS-03 | Visual rendering (Phaser) | Place inserter adjacent to belt; verify arm animates pickup→swing→deposit |
| Assembler 3x3 sprite + progress display | PROD-02 | Visual rendering (Phaser) | Place assembler; assign recipe; feed letters; verify progress visual |
| Splitter sprite + item splitting visual | TRNS-04 | Visual rendering (Phaser) | Place splitter on belt; send items; verify items alternate visually |
| Underground belt entry/exit sprites | TRNS-05 | Visual rendering (Phaser) | Place underground pair; send item; verify tunnel visual and re-emergence |
| Recipe panel UI opens/closes | PROD-02 | UI interaction (Phaser) | Click assembler with no tool; verify panel opens; click outside; verify close |
| Word item renders on belt | PROD-03 | Visual rendering (Phaser) | Complete a word in assembler; pull with inserter; verify word block on belt |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 5s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
