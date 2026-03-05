import { describe, it, expect, vi } from "vitest";
import { TickEngine } from "./TickEngine";

describe("TickEngine", () => {
  it("constructor sets correct tick rate from ticks-per-second param", () => {
    const engine = new TickEngine(15);
    // 1000ms / 15 ticks = ~66.67ms per tick
    expect(engine.tickRate).toBeCloseTo(1000 / 15, 2);
  });

  it("update with delta of exactly 1 tick fires onTick once", () => {
    const engine = new TickEngine(15);
    const onTick = vi.fn();
    engine.update(1000 / 15, onTick); // exactly one tick's worth of ms
    expect(onTick).toHaveBeenCalledTimes(1);
    expect(onTick).toHaveBeenCalledWith(1);
  });

  it("update with delta of 2.5 ticks fires onTick twice and retains remainder", () => {
    const engine = new TickEngine(15);
    const tickMs = 1000 / 15;
    const onTick = vi.fn();
    engine.update(tickMs * 2.5, onTick);
    expect(onTick).toHaveBeenCalledTimes(2);
    expect(onTick).toHaveBeenNthCalledWith(1, 1);
    expect(onTick).toHaveBeenNthCalledWith(2, 2);
    // alpha should reflect the 0.5 remainder
    expect(engine.alpha).toBeCloseTo(0.5, 2);
  });

  it("update with delta of 0.5 ticks fires no onTick", () => {
    const engine = new TickEngine(15);
    const tickMs = 1000 / 15;
    const onTick = vi.fn();
    engine.update(tickMs * 0.5, onTick);
    expect(onTick).not.toHaveBeenCalled();
  });

  it("multiple update calls accumulate correctly across frames", () => {
    const engine = new TickEngine(15);
    const tickMs = 1000 / 15;
    const onTick = vi.fn();

    // First frame: 0.6 ticks worth - no tick fired
    engine.update(tickMs * 0.6, onTick);
    expect(onTick).not.toHaveBeenCalled();

    // Second frame: 0.6 ticks worth - total 1.2 ticks, one tick fires
    engine.update(tickMs * 0.6, onTick);
    expect(onTick).toHaveBeenCalledTimes(1);
  });

  it("spiral of death prevention - caps accumulator at 5 ticks", () => {
    // Use clean tick rate (10 tps = 100ms/tick) to avoid float issues
    const engine = new TickEngine(10);
    const tickMs = 100; // exactly 100ms per tick
    const onTick = vi.fn();

    // Send 1000 ticks worth of delta (simulating tab-resume)
    engine.update(tickMs * 1000, onTick);
    // Should cap at 5 ticks max
    expect(onTick).toHaveBeenCalledTimes(5);
  });

  it("currentTick getter returns cumulative tick count", () => {
    // Use clean tick rate to avoid float precision issues
    const engine = new TickEngine(10);
    const tickMs = 100;
    const onTick = vi.fn();

    expect(engine.currentTick).toBe(0);

    engine.update(tickMs * 3, onTick);
    expect(engine.currentTick).toBe(3);

    engine.update(tickMs * 2, onTick);
    expect(engine.currentTick).toBe(5);
  });

  it("alpha getter returns correct interpolation fraction (0-1)", () => {
    const engine = new TickEngine(15);
    const tickMs = 1000 / 15;
    const onTick = vi.fn();

    // No update yet - alpha should be 0
    expect(engine.alpha).toBe(0);

    // 1.75 ticks: 1 tick fires, 0.75 remains
    engine.update(tickMs * 1.75, onTick);
    expect(engine.alpha).toBeCloseTo(0.75, 2);
  });

  it("uses default TICK_RATE when no argument provided", () => {
    const engine = new TickEngine();
    expect(engine.tickRate).toBeCloseTo(1000 / 15, 2);
  });
});
