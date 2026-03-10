import { BuildingSystem } from "./BuildingSystem";
import { Belt, BeltDirection } from "../entities/Belt";
import { Quarry } from "../entities/Quarry";

describe("BuildingSystem", () => {
  let system: BuildingSystem;

  beforeEach(() => {
    system = new BuildingSystem();
  });

  describe("place", () => {
    it("places a Belt and getAt returns it", () => {
      const belt = new Belt(BeltDirection.North, 5, 5);
      system.place(belt);
      expect(system.getAt(5, 5)).toBe(belt);
    });

    it("returns true on empty tile", () => {
      const belt = new Belt(BeltDirection.North, 5, 5);
      expect(system.place(belt)).toBe(true);
    });

    it("returns false on occupied tile", () => {
      const belt1 = new Belt(BeltDirection.North, 5, 5);
      const belt2 = new Belt(BeltDirection.South, 5, 5);
      system.place(belt1);
      expect(system.place(belt2)).toBe(false);
    });

    it("places a Quarry and getAt returns it for all 4 tiles", () => {
      const quarry = new Quarry("E", { x: 4, y: 4 }, BeltDirection.South);
      system.place(quarry);
      expect(system.getAt(4, 4)).toBe(quarry);
      expect(system.getAt(5, 4)).toBe(quarry);
      expect(system.getAt(4, 5)).toBe(quarry);
      expect(system.getAt(5, 5)).toBe(quarry);
    });

    it("rejects Belt placement on tile occupied by Quarry", () => {
      const quarry = new Quarry("E", { x: 4, y: 4 }, BeltDirection.South);
      system.place(quarry);
      const belt = new Belt(BeltDirection.North, 5, 4);
      expect(system.place(belt)).toBe(false);
    });

    it("does not partially place if any tile is occupied", () => {
      const quarry = new Quarry("E", { x: 4, y: 4 }, BeltDirection.South);
      system.place(quarry);
      // Quarry2 overlaps at (5,4)
      const quarry2 = new Quarry("A", { x: 5, y: 3 }, BeltDirection.South);
      system.place(quarry2);
      // quarry2 occupies (5,3),(6,3),(5,4),(6,4) but (5,4) is taken by quarry
      // So quarry2 should not be placed at all
      expect(system.getAt(5, 3)).toBeNull();
      expect(system.getAt(6, 3)).toBeNull();
    });
  });

  describe("demolish", () => {
    it("returns the removed building entity", () => {
      const belt = new Belt(BeltDirection.North, 5, 5);
      system.place(belt);
      expect(system.demolish(5, 5)).toBe(belt);
    });

    it("returns null on empty tile", () => {
      expect(system.demolish(5, 5)).toBeNull();
    });

    it("removes a Quarry from all 4 tiles", () => {
      const quarry = new Quarry("E", { x: 4, y: 4 }, BeltDirection.South);
      system.place(quarry);
      system.demolish(5, 4); // demolish by any occupied tile
      expect(system.getAt(4, 4)).toBeNull();
      expect(system.getAt(5, 4)).toBeNull();
      expect(system.getAt(4, 5)).toBeNull();
      expect(system.getAt(5, 5)).toBeNull();
    });

    it("after demolish, getAt returns null for all previously occupied tiles", () => {
      const quarry = new Quarry("A", { x: 10, y: 10 }, BeltDirection.North);
      system.place(quarry);
      system.demolish(10, 10);
      for (const tile of [{ x: 10, y: 10 }, { x: 11, y: 10 }, { x: 10, y: 11 }, { x: 11, y: 11 }]) {
        expect(system.getAt(tile.x, tile.y)).toBeNull();
      }
    });
  });

  describe("getAt", () => {
    it("returns null for empty tiles", () => {
      expect(system.getAt(0, 0)).toBeNull();
    });
  });

  describe("getAllBuildings", () => {
    it("returns unique building instances (Quarry counted once, not 4 times)", () => {
      const quarry = new Quarry("E", { x: 4, y: 4 }, BeltDirection.South);
      system.place(quarry);
      const all = system.getAllBuildings();
      expect(all).toHaveLength(1);
      expect(all[0]).toBe(quarry);
    });

    it("returns all unique buildings", () => {
      const belt1 = new Belt(BeltDirection.North, 1, 1);
      const belt2 = new Belt(BeltDirection.East, 2, 2);
      const quarry = new Quarry("T", { x: 4, y: 4 }, BeltDirection.South);
      system.place(belt1);
      system.place(belt2);
      system.place(quarry);
      const all = system.getAllBuildings();
      expect(all).toHaveLength(3);
      expect(all).toContain(belt1);
      expect(all).toContain(belt2);
      expect(all).toContain(quarry);
    });
  });
});
