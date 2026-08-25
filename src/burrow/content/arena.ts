import { BurrowTerrain } from "../simulation/BurrowTerrain";

export const BURROW_WORLD_WIDTH = 2048;
export const BURROW_WORLD_HEIGHT = 1280;
export const BURROW_START = { x: 450, y: 825 } as const;
export const BURROW_TARGET_X = 1580;

export function surfaceYAt(worldX: number): number {
  return (
    318 +
    Math.sin(worldX * 0.0064) * 28 +
    Math.sin(worldX * 0.015 + 1.4) * 11
  );
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
