export class LetterItem {
  readonly letter: string;
  tile: { x: number; y: number };
  previousTile: { x: number; y: number };

  constructor(letter: string, startTile: { x: number; y: number }) {
    this.letter = letter;
    this.tile = { x: startTile.x, y: startTile.y };
    this.previousTile = { x: startTile.x, y: startTile.y };
  }

  snapshotPosition(): void {
    this.previousTile = { x: this.tile.x, y: this.tile.y };
  }
}
