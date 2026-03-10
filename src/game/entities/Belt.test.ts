import { Belt, BeltDirection, BeltVariant, computeBeltVariant } from "./Belt";
import { LetterItem } from "./LetterItem";

describe("Belt", () => {
  describe("construction", () => {
    it("has the given direction", () => {
      const belt = new Belt(BeltDirection.North, 0, 0);
      expect(belt.direction).toBe(BeltDirection.North);
    });

    it("item is null initially", () => {
      const belt = new Belt(BeltDirection.North, 0, 0);
      expect(belt.item).toBeNull();
    });

    it("stores tileX and tileY", () => {
      const belt = new Belt(BeltDirection.East, 3, 7);
      expect(belt.tileX).toBe(3);
      expect(belt.tileY).toBe(7);
    });
  });

  describe("item slot", () => {
    it("can hold a LetterItem", () => {
      const belt = new Belt(BeltDirection.North, 0, 0);
      const item = new LetterItem("B", { x: 0, y: 0 });
      belt.item = item;
      expect(belt.item).toBe(item);
    });

    it("can be cleared back to null", () => {
      const belt = new Belt(BeltDirection.North, 0, 0);
      belt.item = new LetterItem("C", { x: 0, y: 0 });
      belt.item = null;
      expect(belt.item).toBeNull();
    });
  });

  describe("occupiedTiles", () => {
    it("returns single tile at tileX, tileY", () => {
      const belt = new Belt(BeltDirection.South, 4, 7);
      expect(belt.occupiedTiles()).toEqual([{ x: 4, y: 7 }]);
    });
  });

  describe("type", () => {
    it("returns 'belt'", () => {
      const belt = new Belt(BeltDirection.North, 0, 0);
      expect(belt.type).toBe("belt");
    });
  });
});

describe("computeBeltVariant", () => {
  describe("straight variants", () => {
    it("N/N -> StraightNS", () => {
      expect(computeBeltVariant(BeltDirection.North, BeltDirection.North)).toBe(BeltVariant.StraightNS);
    });

    it("S/S -> StraightNS", () => {
      expect(computeBeltVariant(BeltDirection.South, BeltDirection.South)).toBe(BeltVariant.StraightNS);
    });

    it("E/E -> StraightEW", () => {
      expect(computeBeltVariant(BeltDirection.East, BeltDirection.East)).toBe(BeltVariant.StraightEW);
    });

    it("W/W -> StraightEW", () => {
      expect(computeBeltVariant(BeltDirection.West, BeltDirection.West)).toBe(BeltVariant.StraightEW);
    });
  });

  describe("corner variants", () => {
    it("S/E -> CornerSE (coming from south, turning east)", () => {
      expect(computeBeltVariant(BeltDirection.South, BeltDirection.East)).toBe(BeltVariant.CornerSE);
    });

    it("S/W -> CornerSW (coming from south, turning west)", () => {
      expect(computeBeltVariant(BeltDirection.South, BeltDirection.West)).toBe(BeltVariant.CornerSW);
    });

    it("N/E -> CornerNE (coming from north, turning east)", () => {
      expect(computeBeltVariant(BeltDirection.North, BeltDirection.East)).toBe(BeltVariant.CornerNE);
    });

    it("N/W -> CornerNW (coming from north, turning west)", () => {
      expect(computeBeltVariant(BeltDirection.North, BeltDirection.West)).toBe(BeltVariant.CornerNW);
    });
  });
});
