import { describe, expect, it } from "vitest";

import { BodyTrail } from "./BodyTrail";

describe("BodyTrail", () => {
  it("keeps segment spacing independent of input step size", () => {
    const fine = new BodyTrail({ x: 100, y: 100 }, 0);
    const coarse = new BodyTrail({ x: 100, y: 100 }, 0);

    for (let x = 104; x <= 400; x += 4) {
      fine.record({ x, y: 100 });
    }
    for (let x = 116; x <= 400; x += 16) {
      coarse.record({ x, y: 100 });
    }
    coarse.record({ x: 400, y: 100 });

    const fineSamples = fine.sample(12, 18);
    const coarseSamples = coarse.sample(12, 18);
    for (let index = 0; index < fineSamples.length; index += 1) {
      expect(coarseSamples[index]!.x).toBeCloseTo(fineSamples[index]!.x, 3);
      expect(coarseSamples[index]!.y).toBeCloseTo(fineSamples[index]!.y, 3);
    }
  });

  it("returns evenly spaced body samples", () => {
    const trail = new BodyTrail({ x: 200, y: 100 }, 0);
    for (let x = 204; x <= 500; x += 4) {
      trail.record({ x, y: 100 });
    }

    const samples = trail.sample(10, 20);
    for (let index = 1; index < samples.length; index += 1) {
      expect(Math.hypot(
        samples[index - 1]!.x - samples[index]!.x,
        samples[index - 1]!.y - samples[index]!.y,
      )).toBeCloseTo(20, 3);
    }
  });
});
