import type { FeedingContent, Food, FoodKind, PreyDefinition, PreyKind } from "../simulation/BurrowFeeding";
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
        food.push(foodItem(id + "-" + segment + "-" + index, "spore",
          a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t, 1));
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
  food.push(
    foodItem("root-west", "root", 550, 520, 0),
    foodItem("root-heart", "root", 1270, 520, 0),
    foodItem("root-deep", "root", 1460, 1090, 0),
    foodItem("root-east", "root", 2030, 520, 0),
    foodItem("brood-first", "brood", 900, 790, 0),
    foodItem("brood-west", "brood", 420, 980, 0),
    foodItem("brood-heart", "brood", 1370, 810, 0),
    foodItem("brood-east", "brood", 1960, 760, 0),
  );
  const prey: PreyDefinition[] = [
    preyItem("thread-first", "thread", 755, 790, 52, 20, 500, 240),
    preyItem("thread-roots", "thread", 450, 585, 80, 45, 600, 0),
    preyItem("thread-west", "thread", 350, 1030, 65, 35, 580, 150),
    preyItem("thread-lower", "thread", 810, 1080, 100, 40, 700, 0),
    preyItem("thread-heart", "thread", 1250, 660, 70, 65, 660, 160),
    preyItem("thread-east", "thread", 2080, 690, 120, 35, 800, 100),
    preyItem("runner-first", "runner", 1000, 830, 95, 48, 620, 220),
    preyItem("runner-top", "runner", 1050, 510, 120, 36, 680, 220),
    preyItem("runner-middle", "runner", 1550, 840, 110, 58, 720, 350),
    preyItem("runner-bottom", "runner", 1840, 1060, 125, 52, 720, 300),
    preyItem("runner-far", "runner", 2270, 950, 95, 68, 760, 260),
    preyItem("runner-ceiling", "runner", 1740, 500, 130, 38, 780, 430),
    preyItem("armored-west", "armored", 820, 590, 130, 75, 1000, 0),
    preyItem("armored-heart", "armored", 1330, 970, 150, 90, 1100, 350),
    preyItem("armored-east", "armored", 2070, 910, 145, 90, 1100, 0),
  ];
  return { food, prey };
}

function foodItem(id: string, kind: FoodKind, x: number, y: number, value: number): Food {
  return { id, kind, position: { x, y }, value, active: true };
}

function preyItem(id: string, kind: PreyKind, x: number, y: number, rx: number, ry: number,
  period: number, offset: number): PreyDefinition {
  return { id, kind, center: { x, y }, radius: { x: rx, y: ry }, period, offset, large: kind === "armored" };
}
