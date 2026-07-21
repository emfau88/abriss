import { describe, expect, it } from "vitest";

import { frameCameraPoints, overviewCameraFrame } from "./CameraFraming";

describe("camera framing", () => {
  it("fits the 3200 by 1800 world into the 1280 by 720 viewport", () => {
    expect(
      overviewCameraFrame(
        { width: 1280, height: 720 },
        { width: 3200, height: 1800 },
      ),
    ).toEqual({ centerX: 1600, centerY: 900, zoom: 0.4 });
  });

  it("keeps planning points out of the right-hand HUD safe area", () => {
    const frame = frameCameraPoints(
      [
        { x: 500, y: 1200 },
        { x: 1500, y: 850 },
      ],
      { width: 1280, height: 720 },
      { width: 3200, height: 1800 },
      {
        padding: 80,
        minimumZoom: 0.4,
        maximumZoom: 0.75,
        safeInsets: { left: 24, right: 406, top: 106, bottom: 74 },
      },
    );

    expect(frame.zoom).toBeGreaterThan(0.7);
    expect(frame.zoom).toBeLessThanOrEqual(0.74);
    expect(frame.centerX).toBeGreaterThan(1000);
    expect(frame.centerY).toBeGreaterThan(900);
  });

  it("clamps detail frames to world edges", () => {
    const frame = frameCameraPoints(
      [{ x: 30, y: 30 }],
      { width: 1280, height: 720 },
      { width: 3200, height: 1800 },
      { padding: 40, minimumZoom: 0.4, maximumZoom: 1 },
    );

    expect(frame).toEqual({ centerX: 640, centerY: 360, zoom: 1 });
  });
});
