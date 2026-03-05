---
description: Enforces separation between pure game logic and Phaser rendering
globs: src/game/**/*.ts
---

# Simulation/Render Split

Files in `src/game/systems/` and data model files in `src/game/world/` and `src/game/entities/` (excluding `*Renderer.ts`) must NOT import from `phaser`.

Exception: `CameraController.ts` requires Phaser input APIs — this is the only allowed crossover in `systems/`.

When creating a new game system or entity:
1. Write the pure logic class first (no Phaser)
2. Write tests for it (must run without Phaser)
3. Then write the Renderer class that imports Phaser and reads the logic class's state

If you find yourself importing Phaser in a logic file, extract the pure math/logic into a separate `-utils.ts` file (like `camera-utils.ts`).
