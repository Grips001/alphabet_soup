---
description: All game constants must be centralized
globs: src/game/**/*.ts
---

# Constants Rule

All numeric constants (tick rates, tile sizes, speeds, capacities, costs) MUST be defined in `src/game/constants.ts` and imported from there.

Never hardcode magic numbers in logic or renderer files. If a value might change during balancing, it belongs in constants.

When adding a new constant:
1. Add it to `constants.ts` with a descriptive name
2. Export it as a named export
3. Import it where needed
4. If a test references it, import the constant (don't duplicate the value)
