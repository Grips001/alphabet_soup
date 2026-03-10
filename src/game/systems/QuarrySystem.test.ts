import { describe, it, expect, beforeEach } from "vitest";
import { QuarrySystem } from "./QuarrySystem";
import { BeltSystem } from "./BeltSystem";
import { BuildingSystem } from "./BuildingSystem";
import { Belt, BeltDirection } from "../entities/Belt";
import { Quarry } from "../entities/Quarry";
import { LetterItem } from "../entities/LetterItem";
import { QUARRY_PRODUCTION_INTERVAL } from "../constants";
import { QUARRY_DEFINITIONS } from "../world/quarryLayout";

function makeBuildingSystem(): BuildingSystem {
  return new BuildingSystem();
}

function makeBeltSystem(): BeltSystem {
  return new BeltSystem();
}

describe("QuarrySystem", () => {
  let buildingSystem: BuildingSystem;
  let beltSystem: BeltSystem;
  let quarrySystem: QuarrySystem;

  beforeEach(() => {
    buildingSystem = makeBuildingSystem();
    beltSystem = makeBeltSystem();
    quarrySystem = new QuarrySystem(buildingSystem, beltSystem);
  });

  describe("tick: production timer", () => {
    it("tick() advances production timer on all quarries", () => {
      const quarry = new Quarry("A", { x: 0, y: 0 }, BeltDirection.East);
      buildingSystem.place(quarry);
      quarrySystem.addQuarry(quarry);

      expect(quarry.productionTimer).toBe(0);
      quarrySystem.tick();
      expect(quarry.productionTimer).toBe(1);
      quarrySystem.tick();
      expect(quarry.productionTimer).toBe(2);
    });

    it("After production, timer resets to 0", () => {
      const quarry = new Quarry("A", { x: 0, y: 0 }, BeltDirection.East);
      buildingSystem.place(quarry);
      quarrySystem.addQuarry(quarry);

      // Place a belt at the output tile (2,0) for East output
      const outputBelt = new Belt(BeltDirection.East, 2, 0);
      buildingSystem.place(outputBelt);
      beltSystem.addBelt(outputBelt);

      // Advance timer to just before production
      for (let i = 0; i < QUARRY_PRODUCTION_INTERVAL - 1; i++) {
        quarrySystem.tick();
      }
      expect(quarry.productionTimer).toBe(QUARRY_PRODUCTION_INTERVAL - 1);

      // One more tick triggers production
      quarrySystem.tick();
      expect(quarry.productionTimer).toBe(0);
    });
  });

  describe("tick: item production", () => {
    it("After 30 ticks, quarry with clear output belt produces a LetterItem with correct letter", () => {
      const quarry = new Quarry("E", { x: 0, y: 0 }, BeltDirection.East);
      buildingSystem.place(quarry);
      quarrySystem.addQuarry(quarry);

      // Output tile for East direction is (2, 0)
      const outputBelt = new Belt(BeltDirection.East, 2, 0);
      buildingSystem.place(outputBelt);
      beltSystem.addBelt(outputBelt);

      for (let i = 0; i < QUARRY_PRODUCTION_INTERVAL; i++) {
        quarrySystem.tick();
      }

      expect(outputBelt.item).not.toBeNull();
      expect(outputBelt.item!.letter).toBe("E");
      expect(outputBelt.item!.tile).toEqual({ x: 2, y: 0 });
    });

    it("Quarry with no belt at output tile does NOT produce (no orphan items)", () => {
      const quarry = new Quarry("A", { x: 0, y: 0 }, BeltDirection.East);
      buildingSystem.place(quarry);
      quarrySystem.addQuarry(quarry);
      // No belt placed at output tile

      for (let i = 0; i < QUARRY_PRODUCTION_INTERVAL; i++) {
        quarrySystem.tick();
      }

      // Timer should not reset since production didn't happen
      expect(quarry.productionTimer).toBe(QUARRY_PRODUCTION_INTERVAL);
    });

    it("Quarry with occupied output belt slot does NOT produce (backpressure)", () => {
      const quarry = new Quarry("A", { x: 0, y: 0 }, BeltDirection.East);
      buildingSystem.place(quarry);
      quarrySystem.addQuarry(quarry);

      const outputBelt = new Belt(BeltDirection.East, 2, 0);
      buildingSystem.place(outputBelt);
      beltSystem.addBelt(outputBelt);

      // Pre-occupy the output belt
      outputBelt.item = new LetterItem("X", { x: 2, y: 0 });

      for (let i = 0; i < QUARRY_PRODUCTION_INTERVAL; i++) {
        quarrySystem.tick();
      }

      // Timer should not reset since production was blocked
      expect(quarry.productionTimer).toBe(QUARRY_PRODUCTION_INTERVAL);
      // Output belt still has the original item
      expect(outputBelt.item!.letter).toBe("X");
    });
  });

  describe("tick: backpressure flag", () => {
    it("Quarry backpressured flag is set when output is blocked, cleared when output clears", () => {
      const quarry = new Quarry("A", { x: 0, y: 0 }, BeltDirection.East);
      buildingSystem.place(quarry);
      quarrySystem.addQuarry(quarry);

      const outputBelt = new Belt(BeltDirection.East, 2, 0);
      buildingSystem.place(outputBelt);
      beltSystem.addBelt(outputBelt);

      // Advance to just before production
      for (let i = 0; i < QUARRY_PRODUCTION_INTERVAL - 1; i++) {
        quarrySystem.tick();
      }

      // Block the output belt
      outputBelt.item = new LetterItem("X", { x: 2, y: 0 });

      // Tick once — canProduce() is true, but belt is occupied — should set backpressured
      quarrySystem.tick();
      expect(quarry.backpressured).toBe(true);

      // Clear the belt
      outputBelt.item = null;

      // Tick again — should detect clear output and produce
      quarrySystem.tick();
      expect(quarry.backpressured).toBe(false);
    });

    it("Quarry with no belt at output tile is backpressured", () => {
      const quarry = new Quarry("A", { x: 0, y: 0 }, BeltDirection.East);
      buildingSystem.place(quarry);
      quarrySystem.addQuarry(quarry);
      // No belt placed

      // Advance to production point
      for (let i = 0; i < QUARRY_PRODUCTION_INTERVAL; i++) {
        quarrySystem.tick();
      }

      expect(quarry.backpressured).toBe(true);
    });
  });

  describe("multiple quarries", () => {
    it("Multiple quarries tick independently", () => {
      const quarryA = new Quarry("A", { x: 0, y: 0 }, BeltDirection.East);
      const quarryB = new Quarry("B", { x: 10, y: 0 }, BeltDirection.East);
      buildingSystem.place(quarryA);
      buildingSystem.place(quarryB);
      quarrySystem.addQuarry(quarryA);
      quarrySystem.addQuarry(quarryB);

      const beltA = new Belt(BeltDirection.East, 2, 0);
      const beltB = new Belt(BeltDirection.East, 12, 0);
      buildingSystem.place(beltA);
      buildingSystem.place(beltB);
      beltSystem.addBelt(beltA);
      beltSystem.addBelt(beltB);

      for (let i = 0; i < QUARRY_PRODUCTION_INTERVAL; i++) {
        quarrySystem.tick();
      }

      expect(beltA.item).not.toBeNull();
      expect(beltA.item!.letter).toBe("A");
      expect(beltB.item).not.toBeNull();
      expect(beltB.item!.letter).toBe("B");
    });
  });

  describe("initializeQuarries", () => {
    it("initializeQuarries() creates quarries from QUARRY_DEFINITIONS and places them", () => {
      const freshBuildingSystem = makeBuildingSystem();
      const freshBeltSystem = makeBeltSystem();
      const freshQuarrySystem = new QuarrySystem(
        freshBuildingSystem,
        freshBeltSystem
      );

      freshQuarrySystem.initializeQuarries();

      const quarries = freshQuarrySystem.getQuarries();
      expect(quarries.length).toBe(QUARRY_DEFINITIONS.length);

      // Verify each quarry is placed in building system
      for (const quarry of quarries) {
        const origin = quarry.originTile;
        const found = freshBuildingSystem.getAt(origin.x, origin.y);
        expect(found).toBe(quarry);
      }
    });

    it("initializeQuarries creates quarries matching QUARRY_DEFINITIONS letters", () => {
      const freshBuildingSystem = makeBuildingSystem();
      const freshBeltSystem = makeBeltSystem();
      const freshQuarrySystem = new QuarrySystem(
        freshBuildingSystem,
        freshBeltSystem
      );

      freshQuarrySystem.initializeQuarries();

      const quarries = freshQuarrySystem.getQuarries();
      const letters = quarries.map((q) => q.letter).sort();
      const expectedLetters = QUARRY_DEFINITIONS.map((d) => d.letter).sort();
      expect(letters).toEqual(expectedLetters);
    });
  });

  describe("getQuarries", () => {
    it("getQuarries returns readonly list of quarries", () => {
      const quarry = new Quarry("A", { x: 0, y: 0 }, BeltDirection.East);
      buildingSystem.place(quarry);
      quarrySystem.addQuarry(quarry);

      const quarries = quarrySystem.getQuarries();
      expect(quarries).toHaveLength(1);
      expect(quarries[0]).toBe(quarry);
    });
  });
});
