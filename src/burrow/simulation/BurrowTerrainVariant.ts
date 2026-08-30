export type BurrowTerrainVariant = "persistent" | "recovering";

export const DEFAULT_TERRAIN_VARIANT: BurrowTerrainVariant = "recovering";

export function parseTerrainVariant(value: string | null): BurrowTerrainVariant {
  return value === "persistent" ? "persistent" : DEFAULT_TERRAIN_VARIANT;
}
