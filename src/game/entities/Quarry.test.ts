import { Quarry } from "./Quarry";
import { BeltDirection } from "./Belt";
import { QUARRY_PRODUCTION_INTERVAL } from "../constants";

describe("Quarry", () => {
  describe("construction", () => {
    it("has the given letter", () => {
      const quarry = new Quarry("E", { x: 4, y: 4 }, BeltDirection.South);
      expect(quarry.letter).toBe("E");
    });

    it("has the given originTile", () => {
      const quarry = new Quarry("E", { x: 4, y: 4 }, BeltDirection.South);
      expect(quarry.originTile).toEqual({ x: 4, y: 4 });
    });

    it("has the given outputDirection", () => {
      const quarry = new Quarry("E", { x: 4, y: 4 }, BeltDirection.South);
      expect(quarry.outputDirection).toBe(BeltDirection.South);
    });

    it("productionTimer starts at 0", () => {
      const quarry = new Quarry("E", { x: 4, y: 4 }, BeltDirection.South);
      expect(quarry.productionTimer).toBe(0);
    });

    it("backpressured starts false", () => {
      const quarry = new Quarry("E", { x: 4, y: 4 }, BeltDirection.South);
      expect(quarry.backpressured).toBe(false);
    });

    it("type is 'quarry'", () => {
      const quarry = new Quarry("E", { x: 4, y: 4 }, BeltDirection.South);
      expect(quarry.type).toBe("quarry");
    });
  });

  describe("occupiedTiles", () => {
    it("returns 4 tiles for a 2x2 block", () => {
      const quarry = new Quarry("E", { x: 4, y: 4 }, BeltDirection.South);
      const tiles = quarry.occupiedTiles();
      expect(tiles).toHaveLength(4);
    });

    it("occupies (4,4), (5,4), (4,5), (5,5) for origin (4,4)", () => {
      const quarry = new Quarry("E", { x: 4, y: 4 }, BeltDirection.South);
      const tiles = quarry.occupiedTiles();
      expect(tiles).toContainEqual({ x: 4, y: 4 });
      expect(tiles).toContainEqual({ x: 5, y: 4 });
      expect(tiles).toContainEqual({ x: 4, y: 5 });
      expect(tiles).toContainEqual({ x: 5, y: 5 });
    });
  });

  describe("outputTile", () => {
    it("South: output tile is one below the 2x2 block at (originX, originY+2)", () => {
      const quarry = new Quarry("E", { x: 4, y: 4 }, BeltDirection.South);
      expect(quarry.outputTile).toEqual({ x: 4, y: 6 });
    });

    it("North: output tile is above the 2x2 block at (originX, originY-1)", () => {
      const quarry = new Quarry("E", { x: 4, y: 4 }, BeltDirection.North);
      expect(quarry.outputTile).toEqual({ x: 4, y: 3 });
    });

    it("East: output tile is to the right at (originX+2, originY)", () => {
      const quarry = new Quarry("E", { x: 4, y: 4 }, BeltDirection.East);
      expect(quarry.outputTile).toEqual({ x: 6, y: 4 });
    });

    it("West: output tile is to the left at (originX-1, originY)", () => {
      const quarry = new Quarry("E", { x: 4, y: 4 }, BeltDirection.West);
      expect(quarry.outputTile).toEqual({ x: 3, y: 4 });
    });
  });

  describe("production timer", () => {
    it("canProduce() returns false initially", () => {
      const quarry = new Quarry("E", { x: 4, y: 4 }, BeltDirection.South);
      expect(quarry.canProduce()).toBe(false);
    });

    it("tickProduction() increments the timer", () => {
      const quarry = new Quarry("E", { x: 4, y: 4 }, BeltDirection.South);
      quarry.tickProduction();
      expect(quarry.productionTimer).toBe(1);
    });

    it("canProduce() returns true when timer >= QUARRY_PRODUCTION_INTERVAL", () => {
      const quarry = new Quarry("E", { x: 4, y: 4 }, BeltDirection.South);
      for (let i = 0; i < QUARRY_PRODUCTION_INTERVAL; i++) {
        quarry.tickProduction();
      }
      expect(quarry.canProduce()).toBe(true);
    });

    it("canProduce() returns false just before interval", () => {
      const quarry = new Quarry("E", { x: 4, y: 4 }, BeltDirection.South);
      for (let i = 0; i < QUARRY_PRODUCTION_INTERVAL - 1; i++) {
        quarry.tickProduction();
      }
      expect(quarry.canProduce()).toBe(false);
    });

    it("resetTimer() resets to 0", () => {
      const quarry = new Quarry("E", { x: 4, y: 4 }, BeltDirection.South);
      for (let i = 0; i < QUARRY_PRODUCTION_INTERVAL; i++) {
        quarry.tickProduction();
      }
      quarry.resetTimer();
      expect(quarry.productionTimer).toBe(0);
    });

    it("canProduce() returns false after resetTimer()", () => {
      const quarry = new Quarry("E", { x: 4, y: 4 }, BeltDirection.South);
      for (let i = 0; i < QUARRY_PRODUCTION_INTERVAL; i++) {
        quarry.tickProduction();
      }
      quarry.resetTimer();
      expect(quarry.canProduce()).toBe(false);
    });
  });

  describe("backpressure", () => {
    it("backpressure flag blocks production even when timer is ready", () => {
      const quarry = new Quarry("E", { x: 4, y: 4 }, BeltDirection.South);
      for (let i = 0; i < QUARRY_PRODUCTION_INTERVAL; i++) {
        quarry.tickProduction();
      }
      quarry.backpressured = true;
      expect(quarry.canProduce()).toBe(false);
    });

    it("canProduce() returns true when backpressure is cleared and timer is ready", () => {
      const quarry = new Quarry("E", { x: 4, y: 4 }, BeltDirection.South);
      for (let i = 0; i < QUARRY_PRODUCTION_INTERVAL; i++) {
        quarry.tickProduction();
      }
      quarry.backpressured = true;
      quarry.backpressured = false;
      expect(quarry.canProduce()).toBe(true);
    });
  });
});
