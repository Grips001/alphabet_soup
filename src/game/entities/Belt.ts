import type { LetterItem } from "./LetterItem";

export enum BeltDirection {
  North = "N",
  South = "S",
  East = "E",
  West = "W",
}

export enum BeltVariant {
  StraightNS = "StraightNS",
  StraightEW = "StraightEW",
  CornerNE = "CornerNE",
  CornerNW = "CornerNW",
  CornerSE = "CornerSE",
  CornerSW = "CornerSW",
}

const VARIANT_LOOKUP: Record<string, BeltVariant> = {
  [`${BeltDirection.North},${BeltDirection.North}`]: BeltVariant.StraightNS,
  [`${BeltDirection.South},${BeltDirection.South}`]: BeltVariant.StraightNS,
  [`${BeltDirection.East},${BeltDirection.East}`]: BeltVariant.StraightEW,
  [`${BeltDirection.West},${BeltDirection.West}`]: BeltVariant.StraightEW,
  [`${BeltDirection.North},${BeltDirection.East}`]: BeltVariant.CornerNE,
  [`${BeltDirection.North},${BeltDirection.West}`]: BeltVariant.CornerNW,
  [`${BeltDirection.South},${BeltDirection.East}`]: BeltVariant.CornerSE,
  [`${BeltDirection.South},${BeltDirection.West}`]: BeltVariant.CornerSW,
  // East/West input corners (items traveling horizontally then turning)
  [`${BeltDirection.East},${BeltDirection.North}`]: BeltVariant.CornerNE,
  [`${BeltDirection.East},${BeltDirection.South}`]: BeltVariant.CornerSE,
  [`${BeltDirection.West},${BeltDirection.North}`]: BeltVariant.CornerNW,
  [`${BeltDirection.West},${BeltDirection.South}`]: BeltVariant.CornerSW,
  // Cross-axis straights (e.g. N->S means passing through)
  [`${BeltDirection.North},${BeltDirection.South}`]: BeltVariant.StraightNS,
  [`${BeltDirection.South},${BeltDirection.North}`]: BeltVariant.StraightNS,
  [`${BeltDirection.East},${BeltDirection.West}`]: BeltVariant.StraightEW,
  [`${BeltDirection.West},${BeltDirection.East}`]: BeltVariant.StraightEW,
};

export function computeBeltVariant(
  inputDir: BeltDirection,
  outputDir: BeltDirection
): BeltVariant {
  const key = `${inputDir},${outputDir}`;
  return VARIANT_LOOKUP[key] ?? BeltVariant.StraightNS;
}

export class Belt {
  readonly type = "belt" as const;
  direction: BeltDirection;
  variant: BeltVariant;
  item: LetterItem | null;
  tileX: number;
  tileY: number;

  constructor(direction: BeltDirection, tileX: number, tileY: number) {
    this.direction = direction;
    this.variant = computeBeltVariant(direction, direction);
    this.item = null;
    this.tileX = tileX;
    this.tileY = tileY;
  }

  occupiedTiles(): Array<{ x: number; y: number }> {
    return [{ x: this.tileX, y: this.tileY }];
  }
}
