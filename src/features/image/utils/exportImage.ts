import type { Canvas } from "fabric";
import type { ExportImageFormat } from "@/types";
import { downloadBlob } from "@/lib/download";

const MIME_BY_FORMAT: Record<ExportImageFormat, string> = {
  png: "image/png",
  jpeg: "image/jpeg",
  webp: "image/webp",
};

export interface ExportImageOptions {
  format: ExportImageFormat;
  quality: number; // 0–1, ignored for png
  multiplier: number; // resolution multiplier relative to canvas size
  transparentBackground: boolean;
}

export function exportCanvasToBlob(
  canvas: Canvas,
  options: ExportImageOptions,
): Promise<Blob> {
  const previousBackground = canvas.backgroundColor;
  if (options.format === "png" && options.transparentBackground) {
    canvas.backgroundColor = "";
  } else {
    canvas.backgroundColor = canvas.backgroundColor || "#ffffff";
  }
  canvas.renderAll();

  // Render through fabric's own rasterizer (handles zoom/viewport correctly),
  // then hand the resulting native canvas to the browser's encoder so we can
  // support formats (like webp) that fabric's own toDataURL does not.
  const rendered = canvas.toCanvasElement(options.multiplier);

  canvas.backgroundColor = previousBackground;
  canvas.renderAll();

  return new Promise<Blob>((resolve, reject) => {
    rendered.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Could not encode the image in the selected format."));
      },
      MIME_BY_FORMAT[options.format],
      options.format === "png" ? undefined : options.quality,
    );
  });
}

export async function downloadCanvasImage(
  canvas: Canvas,
  fileName: string,
  options: ExportImageOptions,
): Promise<void> {
  const blob = await exportCanvasToBlob(canvas, options);
  downloadBlob(blob, `${fileName}.${options.format === "jpeg" ? "jpg" : options.format}`);
}

export function mimeForFormat(format: ExportImageFormat): string {
  return MIME_BY_FORMAT[format];
}
