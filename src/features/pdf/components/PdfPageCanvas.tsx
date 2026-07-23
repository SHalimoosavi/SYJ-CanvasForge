import { useEffect, useRef, useState } from "react";
import type { PDFDocumentProxy, RenderTask } from "pdfjs-dist";

interface PdfPageCanvasProps {
  document: PDFDocumentProxy;
  pageNumber: number; // 1-indexed, matches pdf.js convention
  scale: number;
  rotation: 0 | 90 | 180 | 270;
  onRendered?: (size: { width: number; height: number }) => void;
}

export function PdfPageCanvas({
  document,
  pageNumber,
  scale,
  rotation,
  onRendered,
}: PdfPageCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const renderTaskRef = useRef<RenderTask | null>(null);
  const [isRendering, setIsRendering] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setIsRendering(true);

    document.getPage(pageNumber).then(async (page) => {
      if (cancelled) return;
      const viewport = page.getViewport({ scale, rotation });
      const canvas = canvasRef.current;
      if (!canvas) return;

      const context = canvas.getContext("2d");
      if (!context) return;

      const outputScale = window.devicePixelRatio || 1;
      canvas.width = Math.floor(viewport.width * outputScale);
      canvas.height = Math.floor(viewport.height * outputScale);
      canvas.style.width = `${viewport.width}px`;
      canvas.style.height = `${viewport.height}px`;

      renderTaskRef.current?.cancel();
      const task = page.render({
        canvas,
        canvasContext: context,
        viewport,
        transform: outputScale !== 1 ? [outputScale, 0, 0, outputScale, 0, 0] : undefined,
      });
      renderTaskRef.current = task;

      try {
        await task.promise;
        if (!cancelled) {
          onRendered?.({ width: viewport.width, height: viewport.height });
          setIsRendering(false);
        }
      } catch (err) {
        // Cancelled renders throw; ignore those, surface nothing else visually.
        if (
          !cancelled &&
          !(err instanceof Error && err.name === "RenderingCancelledException")
        ) {
          setIsRendering(false);
        }
      }
    });

    return () => {
      cancelled = true;
      renderTaskRef.current?.cancel();
    };
  }, [document, pageNumber, scale, rotation, onRendered]);

  return (
    <div className="relative inline-block bg-white shadow-md">
      <canvas ref={canvasRef} className="block" />
      {isRendering && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/60">
          <span className="h-6 w-6 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
        </div>
      )}
    </div>
  );
}
