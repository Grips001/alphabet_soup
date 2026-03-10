import { LetterItem } from "./LetterItem";

describe("LetterItem", () => {
  describe("construction", () => {
    it("has the correct letter", () => {
      const item = new LetterItem("A", { x: 5, y: 5 });
      expect(item.letter).toBe("A");
    });

    it("sets tile to startTile", () => {
      const item = new LetterItem("A", { x: 5, y: 5 });
      expect(item.tile).toEqual({ x: 5, y: 5 });
    });

    it("sets previousTile to startTile", () => {
      const item = new LetterItem("A", { x: 5, y: 5 });
      expect(item.previousTile).toEqual({ x: 5, y: 5 });
    });

    it("tile and previousTile are independent copies", () => {
      const start = { x: 5, y: 5 };
      const item = new LetterItem("A", start);
      item.tile.x = 6;
      expect(item.previousTile.x).toBe(5);
    });
  });

  describe("snapshotPosition", () => {
    it("copies current tile to previousTile", () => {
      const item = new LetterItem("A", { x: 5, y: 5 });
      item.tile = { x: 6, y: 5 };
      item.snapshotPosition();
      expect(item.previousTile).toEqual({ x: 6, y: 5 });
    });

    it("after snapshot, previousTile reflects the tile at snapshot time", () => {
      const item = new LetterItem("Z", { x: 3, y: 3 });
      item.tile = { x: 6, y: 5 };
      item.snapshotPosition();
      expect(item.previousTile).toEqual({ x: 6, y: 5 });
    });

    it("mutating tile after snapshot does not change previousTile (deep copy)", () => {
      const item = new LetterItem("A", { x: 5, y: 5 });
      item.tile = { x: 6, y: 5 };
      item.snapshotPosition();
      item.tile.x = 10;
      expect(item.previousTile.x).toBe(6);
    });
  });
});
