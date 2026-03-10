import { describe, it, expect, beforeEach } from "vitest";
import { BeltSystem } from "./BeltSystem";
import { Belt, BeltDirection, BeltVariant } from "../entities/Belt";
import { LetterItem } from "../entities/LetterItem";
import { BuildingSystem } from "./BuildingSystem";

function makeBelt(
  x: number,
  y: number,
  dir: BeltDirection = BeltDirection.East
): Belt {
  return new Belt(dir, x, y);
}

describe("BeltSystem", () => {
  let beltSystem: BeltSystem;

  beforeEach(() => {
    beltSystem = new BeltSystem();
  });

  describe("addBelt / getBeltAt / removeBelt", () => {
    it("addBelt registers a belt, getBeltAt returns it", () => {
      const belt = makeBelt(3, 5);
      beltSystem.addBelt(belt);
      expect(beltSystem.getBeltAt(3, 5)).toBe(belt);
    });

    it("getBeltAt returns null for empty tile", () => {
      expect(beltSystem.getBeltAt(0, 0)).toBeNull();
    });

    it("removeBelt removes the belt and returns it", () => {
      const belt = makeBelt(2, 2);
      beltSystem.addBelt(belt);
      const removed = beltSystem.removeBelt(2, 2);
      expect(removed).toBe(belt);
      expect(beltSystem.getBeltAt(2, 2)).toBeNull();
    });

    it("removeBelt on non-existent tile returns null", () => {
      expect(beltSystem.removeBelt(99, 99)).toBeNull();
    });

    it("removeBelt on belt with item returns the belt (item cleanup is caller's responsibility)", () => {
      const belt = makeBelt(1, 1);
      belt.item = new LetterItem("A", { x: 1, y: 1 });
      beltSystem.addBelt(belt);
      const removed = beltSystem.removeBelt(1, 1);
      expect(removed).toBe(belt);
      expect(removed?.item).not.toBeNull();
    });
  });

  describe("getNextBelt", () => {
    it("getNextBelt follows belt's output direction to find adjacent belt", () => {
      const a = makeBelt(0, 0, BeltDirection.East);
      const b = makeBelt(1, 0, BeltDirection.East);
      beltSystem.addBelt(a);
      beltSystem.addBelt(b);
      expect(beltSystem.getNextBelt(a)).toBe(b);
    });

    it("getNextBelt returns null when no adjacent belt exists", () => {
      const a = makeBelt(0, 0, BeltDirection.East);
      beltSystem.addBelt(a);
      expect(beltSystem.getNextBelt(a)).toBeNull();
    });

    it("getNextBelt finds belt in North direction", () => {
      const a = makeBelt(5, 5, BeltDirection.North);
      const b = makeBelt(5, 4, BeltDirection.North);
      beltSystem.addBelt(a);
      beltSystem.addBelt(b);
      expect(beltSystem.getNextBelt(a)).toBe(b);
    });

    it("getNextBelt finds belt in South direction", () => {
      const a = makeBelt(5, 5, BeltDirection.South);
      const b = makeBelt(5, 6, BeltDirection.South);
      beltSystem.addBelt(a);
      beltSystem.addBelt(b);
      expect(beltSystem.getNextBelt(a)).toBe(b);
    });

    it("getNextBelt finds belt in West direction", () => {
      const a = makeBelt(5, 5, BeltDirection.West);
      const b = makeBelt(4, 5, BeltDirection.West);
      beltSystem.addBelt(a);
      beltSystem.addBelt(b);
      expect(beltSystem.getNextBelt(a)).toBe(b);
    });
  });

  describe("tick: item movement", () => {
    it("3-belt chain (A->B->C), item on A. After tick(), item is on B, A is empty", () => {
      const a = makeBelt(0, 0, BeltDirection.East);
      const b = makeBelt(1, 0, BeltDirection.East);
      const c = makeBelt(2, 0, BeltDirection.East);
      const item = new LetterItem("X", { x: 0, y: 0 });
      a.item = item;

      beltSystem.addBelt(a);
      beltSystem.addBelt(b);
      beltSystem.addBelt(c);

      beltSystem.tick();

      expect(a.item).toBeNull();
      expect(b.item).toBe(item);
      expect(c.item).toBeNull();
      expect(item.tile).toEqual({ x: 1, y: 0 });
    });

    it("3-belt chain, item on B. After tick(), item is on C", () => {
      const a = makeBelt(0, 0, BeltDirection.East);
      const b = makeBelt(1, 0, BeltDirection.East);
      const c = makeBelt(2, 0, BeltDirection.East);
      const item = new LetterItem("X", { x: 1, y: 0 });
      b.item = item;

      beltSystem.addBelt(a);
      beltSystem.addBelt(b);
      beltSystem.addBelt(c);

      beltSystem.tick();

      expect(b.item).toBeNull();
      expect(c.item).toBe(item);
      expect(item.tile).toEqual({ x: 2, y: 0 });
    });

    it("Item at end of chain stays on C after tick()", () => {
      const a = makeBelt(0, 0, BeltDirection.East);
      const b = makeBelt(1, 0, BeltDirection.East);
      const c = makeBelt(2, 0, BeltDirection.East);
      const item = new LetterItem("X", { x: 2, y: 0 });
      c.item = item;

      beltSystem.addBelt(a);
      beltSystem.addBelt(b);
      beltSystem.addBelt(c);

      beltSystem.tick();

      expect(c.item).toBe(item);
      expect(item.tile).toEqual({ x: 2, y: 0 });
    });

    it("Two items on A and B of 3-belt chain. After tick(), items on B and C (no double-advance)", () => {
      const a = makeBelt(0, 0, BeltDirection.East);
      const b = makeBelt(1, 0, BeltDirection.East);
      const c = makeBelt(2, 0, BeltDirection.East);
      const itemA = new LetterItem("A", { x: 0, y: 0 });
      const itemB = new LetterItem("B", { x: 1, y: 0 });
      a.item = itemA;
      b.item = itemB;

      beltSystem.addBelt(a);
      beltSystem.addBelt(b);
      beltSystem.addBelt(c);

      beltSystem.tick();

      expect(a.item).toBeNull();
      expect(b.item).toBe(itemA);
      expect(c.item).toBe(itemB);
      expect(itemA.tile).toEqual({ x: 1, y: 0 });
      expect(itemB.tile).toEqual({ x: 2, y: 0 });
    });

    it("Item on A, B is occupied. After tick(), item stays on A (backpressure)", () => {
      const a = makeBelt(0, 0, BeltDirection.East);
      const b = makeBelt(1, 0, BeltDirection.East);
      const c = makeBelt(2, 0, BeltDirection.East);
      const itemA = new LetterItem("A", { x: 0, y: 0 });
      const itemB = new LetterItem("B", { x: 1, y: 0 });
      a.item = itemA;
      b.item = itemB;
      // C is empty, but B is occupied so A can't advance

      // Remove c to make B the end of chain too
      beltSystem.addBelt(a);
      beltSystem.addBelt(b);

      beltSystem.tick();

      // itemB has nowhere to go (no next belt), stays on B
      // itemA is blocked by itemB, stays on A
      expect(a.item).toBe(itemA);
      expect(b.item).toBe(itemB);
      expect(itemA.tile).toEqual({ x: 0, y: 0 });
      expect(itemB.tile).toEqual({ x: 1, y: 0 });
    });
  });

  describe("tick: snapshot", () => {
    it("tick() calls snapshotPosition() on all items before moving them", () => {
      const a = makeBelt(0, 0, BeltDirection.East);
      const b = makeBelt(1, 0, BeltDirection.East);
      const item = new LetterItem("X", { x: 0, y: 0 });
      a.item = item;

      beltSystem.addBelt(a);
      beltSystem.addBelt(b);

      // Before tick, previousTile equals current tile
      expect(item.previousTile).toEqual({ x: 0, y: 0 });

      beltSystem.tick();

      // After tick, previousTile should be where item was (snapshotted before move)
      expect(item.previousTile).toEqual({ x: 0, y: 0 });
      expect(item.tile).toEqual({ x: 1, y: 0 });
    });
  });

  describe("processing order", () => {
    it("addBelt in arbitrary order, processing order is farthest-downstream-first", () => {
      // Chain: A(0,0) -> B(1,0) -> C(2,0)
      // C is farthest downstream (0 steps to end), should be processed first
      // We verify this indirectly: two items fill the chain correctly
      const a = makeBelt(0, 0, BeltDirection.East);
      const b = makeBelt(1, 0, BeltDirection.East);
      const c = makeBelt(2, 0, BeltDirection.East);

      // Add in reverse order to test that order of addition doesn't affect processing
      beltSystem.addBelt(c);
      beltSystem.addBelt(b);
      beltSystem.addBelt(a);

      const itemA = new LetterItem("A", { x: 0, y: 0 });
      const itemB = new LetterItem("B", { x: 1, y: 0 });
      a.item = itemA;
      b.item = itemB;

      beltSystem.tick();

      // If processed correctly (downstream first), both items advance
      expect(b.item).toBe(itemA);
      expect(c.item).toBe(itemB);
      expect(a.item).toBeNull();
    });

    it("Placing a belt between two existing belts rebuilds processing order correctly", () => {
      // Start with A->C (no B)
      const a = makeBelt(0, 0, BeltDirection.East);
      const c = makeBelt(2, 0, BeltDirection.East);
      beltSystem.addBelt(a);
      beltSystem.addBelt(c);

      // Insert B between them
      const b = makeBelt(1, 0, BeltDirection.East);
      beltSystem.addBelt(b);

      const item = new LetterItem("X", { x: 0, y: 0 });
      a.item = item;

      beltSystem.tick();

      // Item should move from A to B (B is next in direction)
      expect(a.item).toBeNull();
      expect(b.item).toBe(item);
    });
  });

  describe("placeBeltPath", () => {
    let buildingSystem: BuildingSystem;

    beforeEach(() => {
      buildingSystem = new BuildingSystem();
    });

    it("placeBeltPath creates 3 east-facing belts for straight horizontal path", () => {
      const path = [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }];
      const belts = beltSystem.placeBeltPath(path, buildingSystem);

      expect(belts).toHaveLength(3);
      expect(belts[0].direction).toBe(BeltDirection.East);
      expect(belts[1].direction).toBe(BeltDirection.East);
      expect(belts[2].direction).toBe(BeltDirection.East);
      expect(beltSystem.getBeltAt(0, 0)).not.toBeNull();
      expect(beltSystem.getBeltAt(1, 0)).not.toBeNull();
      expect(beltSystem.getBeltAt(2, 0)).not.toBeNull();
    });

    it("placeBeltPath with L-turn creates belt at (1,0) with corner variant", () => {
      // Path goes East then South
      // (0,0) -> (1,0) -> (1,1)
      // Belt at (1,0): input from West (came from East direction of (0,0)), output to South
      const path = [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 1 }];
      const belts = beltSystem.placeBeltPath(path, buildingSystem);

      expect(belts).toHaveLength(3);

      // Belt at (0,0) faces East
      expect(belts[0].direction).toBe(BeltDirection.East);
      // Belt at (1,0) is a corner (input from East/West, output South)
      const cornerBelt = beltSystem.getBeltAt(1, 0);
      expect(cornerBelt).not.toBeNull();
      expect(cornerBelt!.variant).toBe(BeltVariant.CornerSE);
      // Belt at (1,1) faces South
      expect(belts[2].direction).toBe(BeltDirection.South);
    });

    it("placeBeltPath updates neighbor belt variants when connecting to existing belts", () => {
      // Place an existing belt at (3,0) facing East
      const existingBelt = new Belt(BeltDirection.East, 3, 0);
      beltSystem.addBelt(existingBelt);
      buildingSystem.place(existingBelt);

      // Now place a path ending at (2,0) that connects to the existing belt
      const path = [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }];
      beltSystem.placeBeltPath(path, buildingSystem);

      // The belt at (2,0) should now know about (3,0) as downstream
      // (neighbor variant update: the last placed belt should see existingBelt as neighbor)
      // Verify that routing works correctly - item on (2,0) goes to (3,0)
      const belt2 = beltSystem.getBeltAt(2, 0);
      expect(belt2).not.toBeNull();
      expect(beltSystem.getNextBelt(belt2!)).toBe(existingBelt);
    });
  });
});
