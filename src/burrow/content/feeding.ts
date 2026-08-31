import type { FeedingContent, Food, PreyDefinition } from "../simulation/BurrowFeeding";
import type { Point } from "../simulation/BurrowTerrain";

/** Curated connected food routes. Formulas describe authored paths, not gameplay randomness. */
export function createFeedingContent(): FeedingContent {
  const food: Food[] = [];
  const line = (id: string, points: readonly Point[], spacing = 34): void => {
    for (let segment = 1; segment < points.length; segment += 1) {
      const a = points[segment - 1]!;
      const b = points[segment]!;
      const count = Math.ceil(Math.hypot(b.x - a.x, b.y - a.y) / spacing);
      for (let index = 0; index < count; index += 1) {
        const t = index / count;
        food.push({ id: id + "-" + segment + "-" + index,
          position: { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t }, active: true });
      }
    }
  };
  line("first-bites", [{ x: 500, y: 817 }, { x: 700, y: 785 }, { x: 940, y: 800 }, { x: 1180, y: 690 }], 26);
  line("lower-loop", [{ x: 400, y: 825 }, { x: 220, y: 1010 }, { x: 540, y: 1110 },
    { x: 950, y: 1080 }, { x: 1340, y: 1120 }, { x: 1730, y: 1020 },
    { x: 2050, y: 1080 }, { x: 2320, y: 920 }, { x: 2210, y: 720 }]);
  line("upper-loop", [{ x: 450, y: 805 }, { x: 310, y: 600 }, { x: 560, y: 480 },
    { x: 910, y: 540 }, { x: 1220, y: 455 }, { x: 1580, y: 525 },
    { x: 1980, y: 470 }, { x: 2270, y: 590 }, { x: 2210, y: 720 }]);
  line("middle", [{ x: 950, y: 800 }, { x: 1210, y: 720 }, { x: 1510, y: 800 },
    { x: 1870, y: 720 }, { x: 2210, y: 720 }]);
  line("west-link", [{ x: 560, y: 480 }, { x: 690, y: 650 }, { x: 700, y: 785 }, { x: 540, y: 1110 }]);
  line("heart-link", [{ x: 1220, y: 455 }, { x: 1210, y: 720 }, { x: 1340, y: 1120 }]);
  line("east-link", [{ x: 1980, y: 470 }, { x: 1870, y: 720 }, { x: 1730, y: 1020 }]);
  const prey: PreyDefinition[] = [
    small("first", 755, 790, 52, 20, 500, 240),
    small("second", 1000, 830, 80, 40, 600, 220),
    small("roots", 450, 585, 80, 45, 600, 0),
    small("west", 350, 1030, 65, 35, 580, 150),
    small("lower", 810, 1080, 100, 40, 700, 0),
    small("heart", 1250, 660, 70, 65, 660, 160),
    small("top", 1050, 510, 95, 30, 650, 220),
    small("middle", 1550, 840, 90, 50, 700, 350),
    small("east", 2080, 690, 120, 35, 800, 100),
    small("bottom", 1840, 1060, 100, 45, 700, 300),
    small("far", 2270, 950, 75, 60, 740, 260),
    small("ceiling", 1740, 500, 110, 30, 760, 430),
    { ...small("large-west", 820, 590, 130, 75, 1000, 0), large: true },
    { ...small("large-heart", 1330, 970, 150, 90, 1100, 350), large: true },
    { ...small("large-east", 2070, 910, 145, 90, 1100, 0), large: true },
  ];
  return { food, prey };
}

function small(id: string, x: number, y: number, rx: number, ry: number, period: number, offset: number): PreyDefinition {
  return { id, center: { x, y }, radius: { x: rx, y: ry }, period, offset, large: false };
}
