import { TICK_RATE } from "../constants";

export class TickEngine {
  /** Milliseconds per tick */
  readonly tickRate: number;

  /** Maximum accumulator value to prevent spiral of death */
  private readonly maxAccumulator: number;

  /** Accumulated time in milliseconds */
  private accumulator = 0;

  /** Total number of ticks that have fired */
  private _currentTick = 0;

  constructor(ticksPerSecond: number = TICK_RATE) {
    this.tickRate = 1000 / ticksPerSecond;
    this.maxAccumulator = this.tickRate * 5;
  }

  /**
   * Advance the simulation by deltaMs milliseconds.
   * Calls onTick for each fixed-timestep tick consumed.
   */
  update(deltaMs: number, onTick: (tickNumber: number) => void): void {
    this.accumulator += deltaMs;

    // Cap accumulator to prevent spiral of death on tab-resume
    if (this.accumulator > this.maxAccumulator) {
      this.accumulator = this.maxAccumulator;
    }

    while (this.accumulator >= this.tickRate) {
      this.accumulator -= this.tickRate;
      this._currentTick++;
      onTick(this._currentTick);
    }
  }

  /** Total number of ticks that have fired since creation */
  get currentTick(): number {
    return this._currentTick;
  }

  /** Interpolation fraction (0-1) for rendering between ticks */
  get alpha(): number {
    return this.accumulator / this.tickRate;
  }
}
