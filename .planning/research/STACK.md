# Stack Research

**Domain:** Browser-based 2D factory simulation game (word/language mechanics)
**Researched:** 2026-03-04
**Confidence:** HIGH

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Phaser | 3.90.0 | Game framework (rendering, input, tilemaps, game loop) | Final stable Phaser 3 release ("Tsugumi", May 2025). Mature, battle-tested, excellent tilemap support. v4 is in development but not production-ready. 3.90 is the terminal v3 release -- stable and complete. |
| TypeScript | ~5.9 | Type safety, IDE support, compile-time error catching | Latest stable TS 5 series. TS 6 is in beta but too bleeding-edge for a game project. 5.9 has full Vite/Vitest compatibility. |
| Vite | 6.x (6.3+) | Dev server, HMR, production bundling | Official Phaser templates target Vite 6.3.1 with Phaser 3.90. Vite 7 exists but has no confirmed Phaser template compatibility yet. Stick with 6.x for proven stability. |

**Confidence: HIGH** -- versions confirmed via official Phaser template repository (phaserjs/template-vite-ts) and npm registry.

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| phaser3-rex-plugins | latest | Board plugin (grid logic, chess-like tile placement), UI components | Use the Board plugin for grid-based entity placement and spatial queries. Import only the specific plugins needed, not the entire bundle. |
| wordlist-english | latest | Curated English word lists by frequency | Recipe dictionary for assembler machines. Frequency tiers (10-70) map naturally to tech tree progression (common words early, rare words late). |
| Vitest | latest (3.x) | Unit and integration testing | Test simulation logic (tick engine, belt movement, recipe validation) independently of Phaser rendering. Native Vite integration means zero config. |

**Confidence: HIGH** for Vitest (official Vite testing tool). **MEDIUM** for rex-plugins (widely used but large -- must tree-shake). **MEDIUM** for wordlist-english (functional but may need curation for game balance).

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| Tiled | 1.11.x | Tilemap editor for designing factory floor layouts | Export as JSON with "Embed in Map" checked. Phaser has native Tiled JSON loader. Use for level templates/starting layouts, not runtime map generation. |
| Aseprite | latest | Pixel art creation (16x16 or 32x32 tile sprites) | Export sprite sheets as PNG + JSON atlas. Phaser loads Aseprite JSON atlas format natively via `this.load.aseprite()`. CLI mode enables asset pipeline automation. |
| ESLint | 9.x | Code linting with flat config | Use `@typescript-eslint/parser` and `@typescript-eslint/eslint-plugin`. Flat config format (eslint.config.js) is the standard as of ESLint 9. |
| Prettier | 3.x | Code formatting | Pair with ESLint. Use `eslint-config-prettier` to avoid rule conflicts. |

### Infrastructure

| Technology | Purpose | Why |
|------------|---------|-----|
| Vercel (hobby tier) | Static hosting and CI/CD | Project requirement. `vite build` produces static output that Vercel deploys directly. Zero config for Vite projects. |
| GitHub Actions | CI pipeline (lint, test, type-check) | Run Vitest + tsc + ESLint on push/PR before Vercel deploys. Catches broken simulation logic before it ships. |
| localStorage | Game state persistence | Project requirement. JSON.stringify/parse with versioned schema. ~5MB limit is more than sufficient for factory state. |

## Installation

```bash
# Core
bun add phaser@3.90.0

# Word dictionary
bun add wordlist-english

# Rex plugins (import specific plugins, not the whole package)
bun add phaser3-rex-plugins

# Dev dependencies
bun add -D typescript@~5.9 vite@~6.3 vitest @vitest/coverage-v8
bun add -D eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin
bun add -D prettier eslint-config-prettier
```

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| Phaser 3.90 | PixiJS 8 | If you only need a renderer without game framework opinions. Phaser gives you tilemaps, input, scenes, cameras, and a game loop out of the box -- all critical for a factory sim. PixiJS would require building all of that manually. |
| Phaser 3.90 | Phaser 4 (upcoming) | Not yet. Phaser 4 is under active development but has no stable release. Phaser 3.90 is the proven choice for 2026. |
| Vite 6 | Vite 7 | Vite 7 exists but the official Phaser templates have not been updated for it. Use Vite 6.3+ until the Phaser team confirms v7 compatibility. |
| Vite 6 | Webpack 5 | Never for new projects. Vite is faster, simpler, and the official Phaser recommendation. Webpack adds complexity with no benefit here. |
| Custom simulation loop | bitECS 0.4 | If entity count exceeds ~5,000 and performance becomes a problem. For a word factory sim with hundreds of entities (belts, inserters, letters), a simple tick-based system is clearer and easier to debug. ECS adds architectural complexity that is not justified at this scale. |
| wordlist-english | word-list-json | If you need words pre-sorted by length (useful for recipe tiers). wordlist-english is preferred because frequency-based tiers are more interesting for game progression than pure length. |
| Vitest | Jest | Never with Vite. Vitest shares Vite's config, has native ESM/TS support, and runs faster. Jest requires extra transform configuration for TypeScript. |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| Phaser 4 (alpha/beta) | Unstable, API still changing, sparse documentation. Will cause blockers. | Phaser 3.90.0 |
| Webpack | Slower builds, more config, not recommended by Phaser team for new projects | Vite 6.x |
| React/Vue/Angular wrappers | A factory sim game is 100% canvas. UI frameworks add bundle size, complexity, and impedance mismatch with Phaser's scene system. HUD/menus should use Phaser's built-in text/UI or rex-ui plugin. | Phaser scenes + rex-ui plugin |
| Matter.js / Arcade Physics | Factory sims use discrete grid-based logic, not continuous physics. Physics engines will fight your tile-snapping, tick-based design. | Custom tick-based simulation engine |
| IndexedDB | Over-engineered for this use case. localStorage's 5MB is plenty for serialized factory state. IndexedDB's async API adds complexity for no benefit. | localStorage with JSON serialization |
| create-phaser-app / Yeoman generators | Outdated scaffolding tools. The official phaserjs/template-vite-ts is maintained and current. | Official Phaser Vite+TS template |
| Full bitECS from day one | Premature optimization. Adds indirection and SoA data patterns that make debugging harder. Only justified if you hit performance walls with thousands of entities. | Simple TypeScript classes with a tick() interface |

## Stack Patterns

**For the simulation engine (belts, inserters, assemblers):**
- Use a pure TypeScript simulation layer with NO Phaser dependency
- Entities implement a `tick(delta: number)` interface
- Simulation runs on a fixed timestep independent of render frame rate
- This separation means simulation logic is testable with Vitest without mocking Phaser

**For rendering:**
- Phaser scenes observe simulation state and render sprites accordingly
- Use Phaser tilemaps for the grid floor layer
- Use Phaser sprites for entities (letters, machines) positioned by grid coordinates
- Camera follows player cursor / panning with Phaser's built-in camera controls

**For game data (recipes, tech tree, word lists):**
- Static JSON files loaded at boot time
- Word lists filtered and curated from wordlist-english at build time (not runtime)
- Recipe definitions are pure data: `{ word: "CAT", letters: ["C","A","T"], tier: 1, value: 10 }`

**For save/load:**
- Version the save schema from day one: `{ version: 1, tick: number, entities: [...] }`
- Auto-save on interval + manual save
- Load with migration: if `save.version < CURRENT_VERSION`, run migration functions

## Version Compatibility

| Package | Compatible With | Notes |
|---------|-----------------|-------|
| phaser@3.90.0 | vite@6.3.x | Confirmed in official template. No known issues. |
| phaser@3.90.0 | typescript@5.9.x | Phaser ships its own type definitions. Works with TS 5.x. |
| vite@6.3.x | vitest@3.x | Vitest 3 is designed for Vite 6. Shared config. |
| phaser3-rex-plugins | phaser@3.90.0 | Rex tracks Phaser 3 releases. Check npm for latest compatible version. |
| wordlist-english | any | Pure JSON data package, no runtime dependencies. |

## Project Scaffolding

Start from the official template, then customize:

```bash
# Clone official Phaser + Vite + TypeScript template
git clone https://github.com/phaserjs/template-vite-ts.git alphabet_soup
cd alphabet_soup

# Replace npm with bun
rm package-lock.json
bun install

# Add project-specific dependencies
bun add wordlist-english phaser3-rex-plugins
bun add -D vitest @vitest/coverage-v8
```

Then restructure into the simulation/rendering separation pattern described above.

## Sources

- [Phaser 3.90.0 Release](https://phaser.io/news/2025/05/phaser-v390-released) -- confirmed final v3 release (HIGH confidence)
- [Phaser Vite+TS Template](https://github.com/phaserjs/template-vite-ts) -- official template with Vite 6.3.1 + Phaser 3.90.0 (HIGH confidence)
- [Vite Releases](https://vite.dev/releases) -- confirmed Vite 7.3.1 exists, but 6.x is the proven Phaser-compatible line (HIGH confidence)
- [TypeScript 5.9 Docs](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-9.html) -- latest stable TS 5 (HIGH confidence)
- [Rex Plugins - Board](https://rexrainbow.github.io/phaser3-rex-notes/docs/site/board/) -- grid/board plugin documentation (MEDIUM confidence)
- [wordlist-english npm](https://www.npmjs.com/package/wordlist-english) -- frequency-sorted English word lists (MEDIUM confidence)
- [Vitest](https://vitest.dev/) -- Vite-native testing framework (HIGH confidence)
- [Tiled 1.11.2 Release](http://www.mapeditor.org/2025/01/28/tiled-1-11-2-released.html) -- latest stable Tiled (HIGH confidence)
- [bitECS GitHub](https://github.com/NateTheGreatt/bitECS) -- ECS library, evaluated and deferred (MEDIUM confidence)
- [Phaser Mega Update](https://phaser.io/news/2025/05/phaser-mega-update) -- context on Phaser 3 being terminal, v4 focus (HIGH confidence)

---
*Stack research for: AlphabetSoup - 2D factory simulation word game*
*Researched: 2026-03-04*
