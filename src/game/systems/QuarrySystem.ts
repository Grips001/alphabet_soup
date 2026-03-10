import { Quarry } from "../entities/Quarry";
import { LetterItem } from "../entities/LetterItem";
import { QUARRY_DEFINITIONS } from "../world/quarryLayout";
import type { BuildingSystem } from "./BuildingSystem";
import type { BeltSystem } from "./BeltSystem";

export class QuarrySystem {
  private buildingSystem: BuildingSystem;
  private beltSystem: BeltSystem;
  private quarries: Quarry[] = [];

  constructor(buildingSystem: BuildingSystem, beltSystem: BeltSystem) {
    this.buildingSystem = buildingSystem;
    this.beltSystem = beltSystem;
  }

  addQuarry(quarry: Quarry): void {
    this.quarries.push(quarry);
  }

  initializeQuarries(): void {
    for (const def of QUARRY_DEFINITIONS) {
      const quarry = new Quarry(def.letter, def.origin, def.output);
      if (this.buildingSystem.place(quarry)) {
        this.quarries.push(quarry);
      }
    }
  }

  tick(): void {
    for (const quarry of this.quarries) {
      quarry.tickProduction();

      const outputTile = quarry.outputTile;
      const belt = this.beltSystem.getBeltAt(outputTile.x, outputTile.y);

      // Always update backpressure status based on current output state
      const outputBlocked = belt == null || belt.item != null;
      quarry.backpressured = outputBlocked;

      if (!quarry.canProduce()) {
        continue;
      }

      // canProduce() is true means: timer >= interval AND !backpressured
      // Since we just set backpressured above, if we reach here, output is clear
      const item = new LetterItem(quarry.letter, outputTile);
      belt!.item = item;
      quarry.resetTimer();
    }
  }

  getQuarries(): readonly Quarry[] {
    return this.quarries;
  }
}
