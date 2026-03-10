import { Belt, BeltDirection, computeBeltVariant } from "../entities/Belt";
import type { BuildingSystem } from "./BuildingSystem";

function tileKey(x: number, y: number): string {
  return `${x},${y}`;
}

function directionOffset(dir: BeltDirection): { dx: number; dy: number } {
  switch (dir) {
    case BeltDirection.North:
      return { dx: 0, dy: -1 };
    case BeltDirection.South:
      return { dx: 0, dy: 1 };
    case BeltDirection.East:
      return { dx: 1, dy: 0 };
    case BeltDirection.West:
      return { dx: -1, dy: 0 };
  }
}

function directionFromTiles(
  from: { x: number; y: number },
  to: { x: number; y: number }
): BeltDirection {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  if (dx === 1) return BeltDirection.East;
  if (dx === -1) return BeltDirection.West;
  if (dy === 1) return BeltDirection.South;
  return BeltDirection.North;
}

export class BeltSystem {
  private belts: Map<string, Belt> = new Map();
  private processingOrder: Belt[] = [];

  addBelt(belt: Belt): void {
    this.registerBelt(belt);
    this.rebuildProcessingOrder();
  }

  removeBelt(x: number, y: number): Belt | null {
    const belt = this.belts.get(tileKey(x, y));
    if (belt == null) return null;
    this.belts.delete(tileKey(x, y));
    this.rebuildProcessingOrder();
    return belt;
  }

  getBeltAt(x: number, y: number): Belt | null {
    return this.belts.get(tileKey(x, y)) ?? null;
  }

  getAllBelts(): readonly Belt[] {
    return [...this.belts.values()];
  }

  getNextBelt(belt: Belt): Belt | null {
    const { dx, dy } = directionOffset(belt.direction);
    return this.getBeltAt(belt.tileX + dx, belt.tileY + dy);
  }

  tick(): void {
    // Snapshot all items before any movement
    for (const belt of this.belts.values()) {
      if (belt.item != null) {
        belt.item.snapshotPosition();
      }
    }

    // Process in order: farthest-downstream first
    for (const belt of this.processingOrder) {
      if (belt.item == null) continue;

      const next = this.getNextBelt(belt);
      if (next == null) continue; // end of chain, item stays
      if (next.item != null) continue; // backpressure, item stays

      // Move item to next belt
      const item = belt.item;
      item.tile = { x: next.tileX, y: next.tileY };
      next.item = item;
      belt.item = null;
    }
  }

  rebuildProcessingOrder(): void {
    const allBelts = [...this.belts.values()];

    // Compute distance-from-end for each belt
    // Distance 0 = end of chain (no downstream belt)
    const distanceMap = new Map<string, number>();

    for (const belt of allBelts) {
      this.computeDistance(belt, distanceMap, new Set());
    }

    // Sort: smallest distance first (farthest downstream processed first)
    this.processingOrder = allBelts.slice().sort((a, b) => {
      const dA = distanceMap.get(tileKey(a.tileX, a.tileY)) ?? 0;
      const dB = distanceMap.get(tileKey(b.tileX, b.tileY)) ?? 0;
      return dA - dB;
    });
  }

  private registerBelt(belt: Belt): void {
    this.belts.set(tileKey(belt.tileX, belt.tileY), belt);
  }

  private computeDistance(
    belt: Belt,
    distanceMap: Map<string, number>,
    visiting: Set<string>
  ): number {
    const key = tileKey(belt.tileX, belt.tileY);

    if (distanceMap.has(key)) {
      return distanceMap.get(key)!;
    }

    // Cycle protection
    if (visiting.has(key)) {
      distanceMap.set(key, 0);
      return 0;
    }

    visiting.add(key);

    const next = this.getNextBelt(belt);
    let distance: number;
    if (next == null) {
      distance = 0; // end of chain
    } else {
      distance = 1 + this.computeDistance(next, distanceMap, visiting);
    }

    visiting.delete(key);
    distanceMap.set(key, distance);
    return distance;
  }

  placeBeltPath(
    path: Array<{ x: number; y: number }>,
    buildingSystem: BuildingSystem
  ): Belt[] {
    if (path.length === 0) return [];

    const created: Belt[] = [];

    for (let i = 0; i < path.length; i++) {
      const tile = path[i];
      const prevTile = i > 0 ? path[i - 1] : null;
      const nextTile = i < path.length - 1 ? path[i + 1] : null;

      // Direction this belt outputs toward
      const outputDir = nextTile
        ? directionFromTiles(tile, nextTile)
        : prevTile
          ? directionFromTiles(prevTile, tile) // last tile: keep same direction as incoming
          : BeltDirection.East;

      const belt = new Belt(outputDir, tile.x, tile.y);

      // If there's both an input and output direction (corner tile), compute variant
      if (prevTile != null && nextTile != null) {
        const inputDir = directionFromTiles(prevTile, tile);
        belt.variant = computeBeltVariant(inputDir, outputDir);
      }

      if (buildingSystem.place(belt)) {
        this.registerBelt(belt);
        created.push(belt);
      }
    }

    // Rebuild processing order once after all additions
    this.rebuildProcessingOrder();

    return created;
  }
}
