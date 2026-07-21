export interface CameraPoint {
  readonly x: number;
  readonly y: number;
}

export interface CameraSize {
  readonly width: number;
  readonly height: number;
}

export interface CameraInsets {
  readonly left: number;
  readonly right: number;
  readonly top: number;
  readonly bottom: number;
}

export interface CameraFrame {
  readonly centerX: number;
  readonly centerY: number;
  readonly zoom: number;
}

export interface CameraFrameOptions {
  readonly padding: number;
  readonly minimumZoom: number;
  readonly maximumZoom: number;
  readonly safeInsets?: CameraInsets;
}

const ZERO_INSETS: CameraInsets = {
  left: 0,
  right: 0,
  top: 0,
  bottom: 0,
};

export function frameCameraPoints(
  points: readonly CameraPoint[],
  viewport: CameraSize,
  world: CameraSize,
  options: CameraFrameOptions,
): CameraFrame {
  if (points.length === 0) {
    throw new Error("Camera framing requires at least one point.");
  }

  validateSize(viewport, "viewport");
  validateSize(world, "world");

  if (
    !Number.isFinite(options.padding) ||
    options.padding < 0 ||
    !Number.isFinite(options.minimumZoom) ||
    !Number.isFinite(options.maximumZoom) ||
    options.minimumZoom <= 0 ||
    options.maximumZoom < options.minimumZoom
  ) {
    throw new Error("Camera framing options are invalid.");
  }

  const insets = options.safeInsets ?? ZERO_INSETS;
  const availableWidth = viewport.width - insets.left - insets.right;
  const availableHeight = viewport.height - insets.top - insets.bottom;

  if (availableWidth <= 0 || availableHeight <= 0) {
    throw new Error("Camera safe area must have a positive size.");
  }

  let minimumX = Number.POSITIVE_INFINITY;
  let maximumX = Number.NEGATIVE_INFINITY;
  let minimumY = Number.POSITIVE_INFINITY;
  let maximumY = Number.NEGATIVE_INFINITY;

  for (const point of points) {
    if (!Number.isFinite(point.x) || !Number.isFinite(point.y)) {
      throw new Error("Camera points must use finite coordinates.");
    }

    minimumX = Math.min(minimumX, point.x);
    maximumX = Math.max(maximumX, point.x);
    minimumY = Math.min(minimumY, point.y);
    maximumY = Math.max(maximumY, point.y);
  }

  const contentWidth = Math.max(1, maximumX - minimumX + options.padding * 2);
  const contentHeight = Math.max(1, maximumY - minimumY + options.padding * 2);
  const zoom = clamp(
    Math.min(availableWidth / contentWidth, availableHeight / contentHeight),
    options.minimumZoom,
    options.maximumZoom,
  );
  const contentCenterX = (minimumX + maximumX) / 2;
  const contentCenterY = (minimumY + maximumY) / 2;
  const safeCenterX = insets.left + availableWidth / 2;
  const safeCenterY = insets.top + availableHeight / 2;
  const desiredCenterX =
    contentCenterX + (viewport.width / 2 - safeCenterX) / zoom;
  const desiredCenterY =
    contentCenterY + (viewport.height / 2 - safeCenterY) / zoom;

  return {
    centerX: clampCameraCenter(desiredCenterX, viewport.width, world.width, zoom),
    centerY: clampCameraCenter(desiredCenterY, viewport.height, world.height, zoom),
    zoom,
  };
}

export function overviewCameraFrame(
  viewport: CameraSize,
  world: CameraSize,
): CameraFrame {
  validateSize(viewport, "viewport");
  validateSize(world, "world");
  const zoom = Math.min(viewport.width / world.width, viewport.height / world.height);

  return {
    centerX: world.width / 2,
    centerY: world.height / 2,
    zoom,
  };
}

function clampCameraCenter(
  desired: number,
  viewportExtent: number,
  worldExtent: number,
  zoom: number,
): number {
  const halfVisibleExtent = viewportExtent / (2 * zoom);

  if (halfVisibleExtent * 2 >= worldExtent) {
    return worldExtent / 2;
  }

  return clamp(desired, halfVisibleExtent, worldExtent - halfVisibleExtent);
}

function validateSize(size: CameraSize, label: string): void {
  if (
    !Number.isFinite(size.width) ||
    !Number.isFinite(size.height) ||
    size.width <= 0 ||
    size.height <= 0
  ) {
    throw new Error(`Camera ${label} dimensions must be positive.`);
  }
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, value));
}
