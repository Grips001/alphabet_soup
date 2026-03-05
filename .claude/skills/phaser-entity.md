# Skill: Phaser Entity Pattern

Use when creating new game entities (buildings, items, transport) to ensure consistent simulation/render split.

## Pattern

Every entity has three parts:

### 1. Data Model (pure TS — testable)

```typescript
// src/game/entities/MyEntity.ts
export interface MyEntityData {
  tileX: number;
  tileY: number;
  // entity-specific state
}

export class MyEntity {
  // Pure game logic, no Phaser imports
  // Operates on tick callbacks from TickEngine
}
```

### 2. Renderer (Phaser layer)

```typescript
// src/game/world/MyEntityRenderer.ts  OR  src/game/entities/MyEntityRenderer.ts
import Phaser from "phaser";

export class MyEntityRenderer {
  constructor(scene: Phaser.Scene, entity: MyEntity) {
    // Create sprites/graphics
    // Read entity state to position visuals
  }

  update(): void {
    // Sync visuals to entity state each frame
  }

  destroy(): void {
    // Clean up Phaser objects
  }
}
```

### 3. Tests (TDD — write first)

```typescript
// src/game/entities/MyEntity.test.ts
// Test pure logic without Phaser
// Test: construction, state transitions, tick behavior, edge cases
```

## Checklist

- [ ] Data model has zero Phaser imports
- [ ] Tests written before implementation
- [ ] Entity registered in Grid (occupies tile positions)
- [ ] Renderer created in GameScene.create() or via a manager
- [ ] Constants added to constants.ts (not hardcoded)
- [ ] Renderer cleaned up on entity removal (destroy method)
