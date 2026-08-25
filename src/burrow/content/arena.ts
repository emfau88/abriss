import { BurrowTerrain } from "../simulation/BurrowTerrain";

export const BURROW_WORLD_WIDTH = 2560;
export const BURROW_WORLD_HEIGHT = 1280;
export const BURROW_START = { x: 450, y: 825 } as const;
export const BURROW_VEHICLE_ROUTE = {
  minimumX: 80,
  maximumX: 1100,
  startX: 600,
} as const;
export const BURROW_HUT = {
  centerX: 1400,
  supportOffsets: [-62, 0, 62],
} as const;

export function surfaceYAt(worldX: number): number {
  return (
    318 +
    Math.sin(worldX * 0.0064) * 28 +
    Math.sin(worldX * 0.015 + 1.4) * 11
  );
}

export function createHutSupportPoints(): readonly { readonly id: string; readonly position: { readonly x: number; readonly y: number } }[] {
  return BURROW_HUT.supportOffsets.map((offset, index) => {
    const x = BURROW_HUT.centerX + offset;
    return {
      id: ["links", "mitte", "rechts"][index]!,
      position: { x, y: surfaceYAt(x) + 38 },
    };
  });
}

export function createBurrowArena(): BurrowTerrain {
  const terrain = new BurrowTerrain({
    worldWidth: BURROW_WORLD_WIDTH,
    worldHeight: BURROW_WORLD_HEIGHT,
    cellSize: 4,
    solidAt: (x, y) => y >= surfaceYAt(x),
  });

  const guideTunnel = [
    { x: 260, y: 850 },
    { x: 390, y: 820 },
    { x: 520, y: 835 },
    { x: 650, y: 790 },
    { x: 770, y: 760 },
  ];
  for (let index = 1; index < guideTunnel.length; index += 1) {
    terrain.carveCapsule(guideTunnel[index - 1]!, guideTunnel[index]!, 39);
  }

  terrain.carveCircle({ x: 1090, y: 940 }, 145);
  terrain.carveCircle({ x: 1195, y: 900 }, 105);
  return terrain;
}
