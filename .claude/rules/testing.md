---
description: Testing standards for AlphabetSoup
globs: src/**/*.test.ts, src/**/*.ts
---

# Testing Rules

- Write tests BEFORE implementation (TDD). Commit failing tests, then commit passing implementation.
- Tests live next to source: `Foo.ts` → `Foo.test.ts`
- All pure game logic (systems, entities, world data models) MUST have tests
- Renderer classes (Phaser-dependent) do NOT need unit tests — they're verified visually
- Run `bun test` before claiming any task is complete
- Run `bun run build` (includes type-check) before pushing

## Test Structure

```typescript
describe("ClassName", () => {
  describe("methodName", () => {
    it("describes expected behavior", () => {
      // Arrange → Act → Assert
    });
  });
});
```

## What to Test

- Construction and initial state
- State transitions (tick callbacks, input handling)
- Edge cases (bounds, overflow, empty input)
- Integration points (does Grid accept entity placement?)
