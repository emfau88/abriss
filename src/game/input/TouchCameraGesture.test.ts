import { describe, expect, it } from "vitest";

import {
  cameraCenterForGestureAnchor,
  nextPinchZoom,
  touchDistance,
  touchMidpoint,
} from "./TouchCameraGesture";

describe("TouchCameraGesture", () => {
  it("measures a stable midpoint and distance independently of pointer order", () => {
    const a = { x: 100, y: 180 };
    const b = { x: 220, y: 340 };

    expect(touchMidpoint(a, b)).toEqual({ x: 160, y: 260 });
    expect(touchMidpoint(b, a)).toEqual({ x: 160, y: 260 });
    expect(touchDistance(a, b)).toBe(200);
  });

  it("zooms by the pinch ratio and respects the camera limits", () => {
    expect(nextPinchZoom(0.6, 100, 150, 0.4, 1.05)).toBeCloseTo(0.9);
    expect(nextPinchZoom(0.9, 100, 200, 0.4, 1.05)).toBe(1.05);
    expect(nextPinchZoom(0.5, 100, 20, 0.4, 1.05)).toBe(0.4);
  });

  it("keeps the previous world anchor beneath a translated pinch midpoint", () => {
    const nextCenter = cameraCenterForGestureAnchor({
      previousMidpoint: { x: 1_000, y: 500 },
      currentMidpoint: { x: 1_040, y: 520 },
      previousCameraCenter: { x: 1_600, y: 900 },
      previousRenderZoom: 0.75,
      nextRenderZoom: 1,
      viewportWidth: 1_600,
      viewportHeight: 900,
    });

    expect(nextCenter.x).toBeCloseTo(1_600 + 200 / 0.75 - 240);
    expect(nextCenter.y).toBeCloseTo(900 + 50 / 0.75 - 70);
  });
});
