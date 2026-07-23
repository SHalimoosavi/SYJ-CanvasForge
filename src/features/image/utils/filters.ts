import * as fabric from "fabric";
import type { FabricImage } from "fabric";
import type { ImageFilterValues } from "@/types";

export const DEFAULT_FILTER_VALUES: ImageFilterValues = {
  brightness: 0,
  contrast: 0,
  saturation: 0,
  hue: 0,
  blur: 0,
  grayscale: 0,
  sepia: 0,
  invert: 0,
  noise: 0,
  vibrance: 0,
};

const SHARPEN_KERNEL = [0, -1, 0, -1, 5, -1, 0, -1, 0];
const IDENTITY_KERNEL = [0, 0, 0, 0, 1, 0, 0, 0, 0];

function blendKernel(amount: number): number[] {
  return IDENTITY_KERNEL.map(
    (value, index) => value + (SHARPEN_KERNEL[index] - value) * amount,
  );
}

/** Rebuilds and applies the full filter pipeline on the given image object. */
export function applyFiltersToImage(image: FabricImage, values: ImageFilterValues): void {
  const filters: fabric.filters.BaseFilter<string, Record<string, unknown>>[] = [];

  if (values.brightness !== 0) {
    filters.push(new fabric.filters.Brightness({ brightness: values.brightness }));
  }
  if (values.contrast !== 0) {
    filters.push(new fabric.filters.Contrast({ contrast: values.contrast }));
  }
  if (values.saturation !== 0) {
    filters.push(new fabric.filters.Saturation({ saturation: values.saturation }));
  }
  if (values.vibrance !== 0) {
    filters.push(new fabric.filters.Vibrance({ vibrance: values.vibrance }));
  }
  if (values.hue !== 0) {
    filters.push(new fabric.filters.HueRotation({ rotation: values.hue }));
  }
  if (values.blur > 0) {
    filters.push(new fabric.filters.Blur({ blur: values.blur }));
  }
  if (values.noise > 0) {
    filters.push(new fabric.filters.Noise({ noise: values.noise }));
  }
  if (values.grayscale > 0) {
    filters.push(new fabric.filters.Grayscale());
  }
  if (values.sepia > 0) {
    filters.push(new fabric.filters.Sepia());
  }
  if (values.invert > 0) {
    filters.push(new fabric.filters.Invert({ invert: true }));
  }

  image.filters = filters;
  image.applyFilters();
}

/** Sharpen is intensity-based (0–1) via a blended convolution kernel, applied as a one-off. */
export function applySharpen(
  image: FabricImage,
  amount: number,
  baseValues: ImageFilterValues,
): void {
  applyFiltersToImage(image, baseValues);
  if (amount > 0) {
    image.filters.push(new fabric.filters.Convolute({ matrix: blendKernel(amount) }));
    image.applyFilters();
  }
}
