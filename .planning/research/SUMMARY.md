# Research Summary: AlphabetSoup

**Domain:** Browser-based 2D factory simulation game with word/language mechanics
**Researched:** 2026-03-04
**Overall confidence:** HIGH

## Executive Summary

AlphabetSoup is a factory simulation game where the resources are English alphabet letters and the products are words. The standard stack for this type of browser game in 2026 is Phaser 3.90.0 (the terminal Phaser 3 release) + TypeScript 5.9 + Vite 6.3, with Vitest for testing and Vercel for hosting. This stack is well-documented, stable, and has official template support from the Phaser team.

The architecture must separate simulation from rendering on day one. The simulation engine is pure TypeScript with zero Phaser imports -- this enables unit testing, deterministic behavior, and clean save/load. Phaser handles rendering, input, and camera. The fixed-timestep tick loop is the foundation everything else builds on.

The factory sim genre has well-established patterns (belts, inserters, assemblers) documented by Factorio and open-source projects like shapez.io. The word-game twist is novel: letters as resources, words as products, and a tech tree gated by word complexity. The main technical risks are belt system performance (solved by the BeltPath pattern) and inserter/assembler deadlocks (solved by per-slot input buffers and peek-before-pop inserter logic).

The word dictionary should be curated (2,000-5,000 common English words organized by frequency tier), not the full English dictionary. The wordlist-english npm package provides frequency-sorted word lists that map naturally to tech tree progression.

## Key Findings

**Stack:** Phaser 3.90.0 + TypeScript 5.9 + Vite 6.3 + Vitest. Official template at phaserjs/template-vite-ts. No framework wrappers (React/Vue) -- pure Phaser scenes.

**Architecture:** Simulation/rendering separation. Fixed-timestep tick engine. Grid as spatial index. Systems processed in deterministic order (quarries -> inserters -> belts -> assemblers -> progression).

**Critical pitfall:** Belt item processing is the #1 performance risk. Must use BeltPath abstraction (grouped belt segments) instead of per-tile item updates. This is an architectural decision that cannot be retrofitted.

## Implications for Roadmap

Based on research, suggested phase structure:

1. **Foundation (Simulation Engine + Grid)** - Build the tick loop, grid data structure, and entity registry first. Everything depends on these.
   - Addresses: tick-based simulation, grid placement, entity lifecycle
   - Avoids: simulation-coupled-to-render pitfall, monolithic scene pitfall

2. **Core Entities (Quarries + Belts + Items)** - Implement the resource production and transport pipeline.
   - Addresses: letter quarries, belt system with BeltPath, item movement
   - Avoids: per-belt-tile performance pitfall, no-pooling pitfall

3. **Factory Loop (Inserters + Assemblers + Recipes)** - Complete the production chain from letter to word.
   - Addresses: inserters, assemblers, word recipe system, currency
   - Avoids: inserter deadlock pitfall (per-slot buffers, peek logic)

4. **Persistence + Polish** - Save/load, tech tree, UI, camera controls, build/demolish flow.
   - Addresses: localStorage save/load, tech tree, HUD, game speed controls
   - Avoids: localStorage blowup pitfall (versioned compact format)

5. **Ship** - CI/CD pipeline, Vercel deployment, playtesting, word list curation.
   - Addresses: deployment, final word dictionary, performance testing

**Phase ordering rationale:**
- Simulation engine must exist before any entities can be built on it
- Belts must work before inserters can transfer to/from them
- Assemblers need working belt/inserter pipeline to receive letters
- Save/load should come after entity designs stabilize (otherwise format changes constantly)
- Tech tree requires a working currency loop to balance

**Research flags for phases:**
- Phase 2 (belts): Likely needs deeper research on BeltPath data structure and item spacing algorithms
- Phase 3 (assemblers): The "letters in order" vs "letters as unordered set" design decision needs prototyping
- Phase 4 (save/load): Standard patterns, unlikely to need research
- Phase 5 (deployment): Standard Vercel static deploy, no research needed

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Versions confirmed via official Phaser template repo and npm. Phaser 3.90 is terminal v3 release. |
| Features | HIGH | Factory sim genre is well-documented. Word-game twist is novel but builds on established mechanics. |
| Architecture | HIGH | Simulation/rendering separation and fixed-timestep are industry-standard patterns. |
| Pitfalls | HIGH | Performance traps well-documented from Factorio/shapez.io. Inserter deadlocks are the main novel risk. |

## Gaps to Address

- **BeltPath implementation details:** The concept is clear but specific data structure and algorithm choices need prototyping during Phase 2.
- **Assembler letter ordering:** Whether to require ordered letter input (C then A then T for "CAT") or accept any order. Ordered is more interesting but risks deadlocks. Needs gameplay testing.
- **Word list curation:** The wordlist-english package provides raw data, but game-appropriate filtering (removing offensive words, selecting fun/recognizable words per tier) is a content task that needs human judgment.
- **Rex plugins tree-shaking:** The phaser3-rex-plugins package is large. Need to verify that importing only the Board plugin does not pull in the entire bundle.
- **Vite 7 compatibility:** Vite 7.3.1 is current but no official Phaser template targets it. May be safe to upgrade, but unverified.

## Sources

- [Phaser 3.90.0 Release](https://phaser.io/news/2025/05/phaser-v390-released)
- [Phaser Vite+TS Template](https://github.com/phaserjs/template-vite-ts)
- [Vite Releases](https://vite.dev/releases)
- [TypeScript 5.9 Docs](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-9.html)
- [Rex Plugins Board](https://rexrainbow.github.io/phaser3-rex-notes/docs/site/board/)
- [wordlist-english npm](https://www.npmjs.com/package/wordlist-english)
- [Vitest](https://vitest.dev/)
- [bitECS](https://github.com/NateTheGreatt/bitECS)
- [Tiled Map Editor](http://www.mapeditor.org/)

---
*Research summary for: AlphabetSoup*
*Researched: 2026-03-04*
