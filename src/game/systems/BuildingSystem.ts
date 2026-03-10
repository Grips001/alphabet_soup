export interface Building {
  type: string;
  occupiedTiles(): Array<{ x: number; y: number }>;
}

function tileKey(x: number, y: number): string {
  return `${x},${y}`;
}

export class BuildingSystem {
  private tiles: Map<string, Building> = new Map();

  place(entity: Building): boolean {
    const tiles = entity.occupiedTiles();

    // Check all tiles are free first (no partial placement)
    for (const { x, y } of tiles) {
      if (this.tiles.has(tileKey(x, y))) {
        return false;
      }
    }

    // Register all tiles
    for (const { x, y } of tiles) {
      this.tiles.set(tileKey(x, y), entity);
    }

    return true;
  }

  demolish(tx: number, ty: number): Building | null {
    const entity = this.tiles.get(tileKey(tx, ty));
    if (entity == null) {
      return null;
    }

    // Remove all tiles occupied by this entity
    for (const { x, y } of entity.occupiedTiles()) {
      this.tiles.delete(tileKey(x, y));
    }

    return entity;
  }

  getAt(tx: number, ty: number): Building | null {
    return this.tiles.get(tileKey(tx, ty)) ?? null;
  }

  getAllBuildings(): Building[] {
    return [...new Set(this.tiles.values())];
  }
}
