export type CropGeometryInput = {
  frameHeight: number;
  frameWidth: number;
  imageHeight: number;
  imageWidth: number;
  offsetX: number;
  offsetY: number;
  zoom: number;
};

export type CropGeometry = {
  displayHeight: number;
  displayWidth: number;
  maxOffsetX: number;
  maxOffsetY: number;
  offsetX: number;
  offsetY: number;
  scale: number;
  sourceHeight: number;
  sourceWidth: number;
  sourceX: number;
  sourceY: number;
};

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(maximum, Math.max(minimum, value));
}

export function calculateCropGeometry(input: CropGeometryInput): CropGeometry {
  const baseScale = Math.max(input.frameWidth / input.imageWidth, input.frameHeight / input.imageHeight);
  const scale = baseScale * input.zoom;
  const displayWidth = input.imageWidth * scale;
  const displayHeight = input.imageHeight * scale;
  const maxOffsetX = Math.max(0, (displayWidth - input.frameWidth) / 2);
  const maxOffsetY = Math.max(0, (displayHeight - input.frameHeight) / 2);
  const offsetX = clamp(input.offsetX, -maxOffsetX, maxOffsetX);
  const offsetY = clamp(input.offsetY, -maxOffsetY, maxOffsetY);
  const sourceWidth = input.frameWidth / scale;
  const sourceHeight = input.frameHeight / scale;

  return {
    displayHeight,
    displayWidth,
    maxOffsetX,
    maxOffsetY,
    offsetX,
    offsetY,
    scale,
    sourceHeight,
    sourceWidth,
    sourceX: clamp((displayWidth - input.frameWidth) / 2 / scale - offsetX / scale, 0, input.imageWidth - sourceWidth),
    sourceY: clamp((displayHeight - input.frameHeight) / 2 / scale - offsetY / scale, 0, input.imageHeight - sourceHeight),
  };
}

export function fitOutputSize(sourceWidth: number, sourceHeight: number, maximumWidth: number, maximumHeight: number) {
  const scale = Math.min(1, maximumWidth / sourceWidth, maximumHeight / sourceHeight);
  return {
    height: Math.max(1, Math.round(sourceHeight * scale)),
    width: Math.max(1, Math.round(sourceWidth * scale)),
  };
}
