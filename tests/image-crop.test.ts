import { describe, expect, it } from "vitest";
import { calculateCropGeometry, fitOutputSize } from "../lib/image-crop";

describe("image crop", () => {
  it("vycentruje široký obrázok do štvorcového výrezu", () => {
    const crop = calculateCropGeometry({
      frameHeight: 400,
      frameWidth: 400,
      imageHeight: 1000,
      imageWidth: 2000,
      offsetX: 0,
      offsetY: 0,
      zoom: 1,
    });

    expect(crop.sourceX).toBe(500);
    expect(crop.sourceY).toBe(0);
    expect(crop.sourceWidth).toBe(1000);
    expect(crop.sourceHeight).toBe(1000);
  });

  it("obmedzí posun tak, aby výrez nemal prázdne okraje", () => {
    const crop = calculateCropGeometry({
      frameHeight: 500,
      frameWidth: 400,
      imageHeight: 1500,
      imageWidth: 1200,
      offsetX: 500,
      offsetY: -500,
      zoom: 1.5,
    });

    expect(crop.offsetX).toBe(crop.maxOffsetX);
    expect(crop.offsetY).toBe(-crop.maxOffsetY);
    expect(crop.sourceX).toBeGreaterThanOrEqual(0);
    expect(crop.sourceY).toBeGreaterThanOrEqual(0);
  });

  it("nezväčší malý zdrojový obrázok", () => {
    expect(fitOutputSize(600, 750, 1200, 1500)).toEqual({ width: 600, height: 750 });
    expect(fitOutputSize(2400, 3000, 1200, 1500)).toEqual({ width: 1200, height: 1500 });
  });
});
