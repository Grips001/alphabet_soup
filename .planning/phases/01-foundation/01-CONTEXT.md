# Phase 1: Foundation - Context

**Gathered:** 2026-03-04
**Status:** Ready for planning

<domain>
## Phase Boundary

A running game with a visible tile grid, working camera, and a deterministic tick engine -- deployed to Vercel via CI. No entities, buildings, or gameplay yet. This phase establishes the rendering, input, simulation, and deployment infrastructure everything else builds on.

Requirements: SIM-01, GRID-01, GRID-04, INFRA-01, INFRA-02

</domain>

<decisions>
## Implementation Decisions

### Grid & World Size
- 32x32 pixel tiles
- 64x64 tile world (2048x2048 pixels total)
- Subtle grid lines always visible (faint lines to aid placement)
- Camera bounded to world edges (no void visible)

### Camera Behavior
- Pan: WASD/Arrow keys for steady panning, middle-click drag for quick repositioning
- Zoom: Smooth zoom toward cursor position via scroll wheel
- Zoom range: 0.5x to 3x
- Movement feel: Smooth with light easing (lerp on pan and zoom, not sluggish)

### Visual Direction
- Retro SNES/Genesis pixel art aesthetic with modern polish
- Playful but not childish -- "looks simple, reveals depth" (like the name AlphabetSoup)
- Warm & inviting palette: amber, cream, soft red tones
- Abstract world -- not naturalistic (no grass/earth). Letters are objects in an abstract space, so the environment should complement that concept
- Design constraint for future phases: letter items must have high contrast against belt surfaces (consider this when establishing the visual foundation)

### Tick & Debug Display
- Debug overlay shows: FPS, current tick count, cursor tile coordinates
- Overlay hidden by default, toggled with F3
- Overlay content: FPS + tick number + hovered tile (x, y)

### Claude's Discretion
- Tick rate (choose based on factory game conventions and Phaser performance)
- Debug overlay position (place where it won't conflict with future HUD)
- Abstract ground tile design (complement retro-playful warm aesthetic)
- Camera easing parameters (tune for responsive but polished feel)

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- None -- greenfield project, no code exists yet

### Established Patterns
- None -- patterns will be established in this phase

### Integration Points
- Phaser 3 game instance will be the root of all rendering
- Tick engine will be pure TypeScript, decoupled from Phaser's update loop
- Vite dev server and build pipeline
- Vercel deployment via GitHub integration

</code_context>

<specifics>
## Specific Ideas

- "Like the name alphabet soup, at first it seems childish, but tasting it reveals how good it is" -- the visual style should embody this philosophy
- SNES/Genesis era as the reference point for retro aesthetic (not Game Boy, not PS1)
- Abstract world where letters are physical objects -- the environment isn't a "place" with terrain, it's an abstract factory space
- Letter readability on belts is a design constraint: belt and letter visuals must create sufficient contrast (impacts ground/belt color choices established here)

</specifics>

<deferred>
## Deferred Ideas

None -- discussion stayed within phase scope

</deferred>

---

*Phase: 01-foundation*
*Context gathered: 2026-03-04*
