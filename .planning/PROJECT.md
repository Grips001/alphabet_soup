# AlphabetSoup

## What This Is

A web-based 2D factory simulation game where "resources" are English alphabet letters and the goal is to automate word production. Players place letter quarries, route letters via belts and inserters, and feed them into assembler machines with word recipes — classic factory sim mechanics with a linguistic twist. Built with Phaser 3 + TypeScript + Vite, hosted on Vercel.

## Core Value

The factory automation loop — placing machines, routing letters on belts, and watching assemblers produce words — must feel satisfying and work reliably.

## Requirements

### Validated

<!-- Shipped and confirmed valuable. -->

(None yet — ship to validate)

### Active

<!-- Current scope. Building toward these. -->

- [ ] Grid-based world with tile placement
- [ ] Letter quarries at fixed map positions that produce specific letters over time
- [ ] Transport belts that move letter items along a path
- [ ] Inserters that transfer items between belts and machines
- [ ] Assembler machines with recipe slots (set to a word, feed correct letters)
- [ ] Tick-based simulation engine driving all entities
- [ ] Item entities representing individual letters moving through the factory
- [ ] Tech tree unlocking progressively complex word recipes (3-letter to longer)
- [ ] Currency/scoring system from completed words to buy machines/belts/upgrades
- [ ] Pixel art visual style (16x16 or 32x32 tiles)
- [ ] Game state persistence via browser localStorage
- [ ] CI/CD pipeline: GitHub repo linked to Vercel (hobby tier) for build/hosting

### Out of Scope

- Word-to-word chaining (words as inputs to higher-tier assemblers) — deferred to v2
- Cloud save / user accounts — localStorage sufficient for v1
- Mobile support — desktop browser first
- Multiplayer — single player only
- Sound/music — visual gameplay first

## Context

- Factory sim genre (Factorio, Shapez.io style) applied to language/word building
- Letters are the atomic resource; words are the product
- Quarries are fixed on the map, creating spatial routing puzzles
- Assemblers require letters in the correct order to produce a word
- Completed words earn currency for purchasing more infrastructure
- Tech tree gates which word recipes are available (progression)
- Phaser 3 handles rendering, input, and game loop
- Vite for dev server and production builds
- Vercel hobby tier for hosting (static site deployment)

## Constraints

- **Tech stack**: Phaser 3 + TypeScript + Vite — non-negotiable
- **Hosting**: Vercel hobby tier — static builds only, no server-side
- **Storage**: Browser localStorage only — no backend/database
- **Platform**: Desktop browser (modern Chrome/Firefox/Edge)

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Phaser 3 over raw Canvas/WebGL | Mature game framework with sprite, tilemap, and input handling built in | — Pending |
| Tick-based simulation | Deterministic updates, easier to debug and save/load state | — Pending |
| Fixed quarry positions | Creates spatial puzzle — routing letters across the grid is the challenge | — Pending |
| Assembler recipe model | Clear mental model — set a word, feed letters, get output | — Pending |
| localStorage persistence | No backend needed, keeps v1 simple | — Pending |

---
*Last updated: 2026-03-04 after initialization*
