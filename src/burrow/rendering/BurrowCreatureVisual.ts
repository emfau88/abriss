export type BurrowGrowthStage = "sprout" | "burrower" | "colossus";

export interface BurrowCreatureVisual {
  readonly stage: BurrowGrowthStage;
  readonly label: string;
  readonly headRadius: number;
  readonly bodyRadiusMultiplier: number;
  readonly sampleCount: number;
  readonly segmentSpacing: number;
  readonly plateEvery: number;
}

const VISUALS: Record<BurrowGrowthStage, BurrowCreatureVisual> = {
  sprout: { stage: "sprout", label: "KEIMLING", headRadius: 27, bodyRadiusMultiplier: 0.9, sampleCount: 18, segmentSpacing: 18, plateEvery: 5 },
  burrower: { stage: "burrower", label: "GRÄBER", headRadius: 32, bodyRadiusMultiplier: 1, sampleCount: 23, segmentSpacing: 18, plateEvery: 4 },
  colossus: { stage: "colossus", label: "KOLOSS", headRadius: 37, bodyRadiusMultiplier: 1.14, sampleCount: 28, segmentSpacing: 18, plateEvery: 3 },
};

/** Rein visuell: Biomasse ändert weder Kollisionsradius noch Bewegung. */
export function creatureVisualForBiomass(biomass: number): BurrowCreatureVisual {
  if (biomass >= 3) return VISUALS.colossus;
  if (biomass >= 1) return VISUALS.burrower;
  return VISUALS.sprout;
}
