import { BeltDirection } from "./Belt";
import { QUARRY_PRODUCTION_INTERVAL } from "../constants";

export class Quarry {
  readonly type = "quarry" as const;
  readonly letter: string;
  readonly originTile: { x: number; y: number };
  readonly outputDirection: BeltDirection;
  productionTimer: number;
  backpressured: boolean;

  constructor(
    letter: string,
    originTile: { x: number; y: number },
    outputDirection: BeltDirection
  ) {
    this.letter = letter;
    this.originTile = { x: originTile.x, y: originTile.y };
    this.outputDirection = outputDirection;
    this.productionTimer = 0;
    this.backpressured = false;
  }

  occupiedTiles(): Array<{ x: number; y: number }> {
    const { x, y } = this.originTile;
    return [
      { x, y },
      { x: x + 1, y },
      { x, y: y + 1 },
      { x: x + 1, y: y + 1 },
    ];
  }

  get outputTile(): { x: number; y: number } {
    const { x, y } = this.originTile;
    switch (this.outputDirection) {
      case BeltDirection.South:
        return { x, y: y + 2 };
      case BeltDirection.North:
        return { x, y: y - 1 };
      case BeltDirection.East:
        return { x: x + 2, y };
      case BeltDirection.West:
        return { x: x - 1, y };
    }
  }

  tickProduction(): void {
    this.productionTimer++;
  }

  canProduce(): boolean {
    return this.productionTimer >= QUARRY_PRODUCTION_INTERVAL && !this.backpressured;
  }

  resetTimer(): void {
    this.productionTimer = 0;
  }
}
