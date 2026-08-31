import { buildForBiomass } from "../simulation/BurrowRun";

export function creatureVisualForBiomass(biomass: number) {
  const build = buildForBiomass(biomass);
  return {
    stage: build.stage, label: build.label, headRadius: 27 * build.headScale,
    bodyRadiusMultiplier: build.bodyScale, sampleCount: build.bodyCount, segmentSpacing: 18,
  } as const;
}
