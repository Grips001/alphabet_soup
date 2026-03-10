import { BeltDirection } from "../entities/Belt";

export interface QuarryDefinition {
  letter: string;
  origin: { x: number; y: number };
  output: BeltDirection;
}

// 10 quarries for the most common English letters: E, T, A, O, I, N, S, R, H, L
// Scattered across a 64x64 map for routing challenges.
// Each quarry occupies a 2x2 footprint; origins are chosen to avoid overlaps
// and to keep all footprints within the 0-63 tile range.
export const QUARRY_DEFINITIONS: QuarryDefinition[] = [
  { letter: "E", origin: { x: 4, y: 4 },   output: BeltDirection.South },
  { letter: "T", origin: { x: 12, y: 4 },  output: BeltDirection.South },
  { letter: "A", origin: { x: 20, y: 4 },  output: BeltDirection.South },
  { letter: "O", origin: { x: 28, y: 4 },  output: BeltDirection.South },
  { letter: "I", origin: { x: 36, y: 4 },  output: BeltDirection.South },
  { letter: "N", origin: { x: 44, y: 4 },  output: BeltDirection.South },
  { letter: "S", origin: { x: 52, y: 4 },  output: BeltDirection.South },
  { letter: "R", origin: { x: 8, y: 56 },  output: BeltDirection.North },
  { letter: "H", origin: { x: 28, y: 56 }, output: BeltDirection.North },
  { letter: "L", origin: { x: 48, y: 56 }, output: BeltDirection.North },
];
