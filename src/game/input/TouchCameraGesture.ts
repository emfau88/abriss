export interface TouchPoint {
  readonly x: number;
  readonly y: number;
}

export interface CameraCenter {
  readonly x: number;
  readonly y: number;
}

export function touchMidpoint(a: TouchPoint, b: TouchPoint): TouchPoint {
  return {
    x: (a.x + b.x) / 2,
    y: (a.y + b.y) / 2,
  };
}

export function touchDistance(a: TouchPoint, b: TouchPoint): number {
  return Math.hypot(b.x - a.x, b.y - a.y);
}

export function nextPinchZoom(
  currentZoom: number,
  previousDistance: number,
  currentDistance: number,
  minimumZoom: number,
  maximumZoom: number,
): number {
  if (previousDistance <= 0 || currentDistance <= 0) {
    return clamp(currentZoom, minimumZoom, maximumZoom);
  }

  return clamp(
    currentZoom * (currentDistance / previousDistance),
    minimumZoom,
    maximumZoom,
  );
}

export function cameraCenterForGestureAnchor(options: {
  readonly previousMidpoint: TouchPoint;
  readonly currentMidpoint: TouchPoint;
  readonly previousCameraCenter: CameraCenter;
  readonly previousRenderZoom: number;
  readonly nextRenderZoom: number;
  readonly viewportWidth: number;
  readonly viewportHeight: number;
}): CameraCenter {
  const viewportCenterX = options.viewportWidth / 2;
  const viewportCenterY = options.viewportHeight / 2;
  const worldAnchorX =
    options.previousCameraCenter.x +
    (options.previousMidpoint.x - viewportCenterX) /
      options.previousRenderZoom;
  const worldAnchorY =
    options.previousCameraCenter.y +
    (options.previousMidpoint.y - viewportCenterY) /
      options.previousRenderZoom;

  return {
    x:
      worldAnchorX -
      (options.currentMidpoint.x - viewportCenterX) / options.nextRenderZoom,
    y:
      worldAnchorY -
      (options.currentMidpoint.y - viewportCenterY) / options.nextRenderZoom,
  };
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.max(minimum, Math.min(maximum, value));
}
