import { useEffect, useRef, useState } from "react";
import * as fabric from "fabric";
import type { Canvas, FabricImage } from "fabric";

const MAX_CANVAS_DIMENSION = 3000;

interface UseFabricCanvasResult {
  canvas: Canvas | null;
  imageObject: FabricImage | null;
  isLoading: boolean;
  error: string | null;
}

export function useFabricCanvas(
  canvasElRef: React.RefObject<HTMLCanvasElement | null>,
  imageUrl: string | null,
): UseFabricCanvasResult {
  const [canvas, setCanvas] = useState<Canvas | null>(null);
  const [imageObject, setImageObject] = useState<FabricImage | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const canvasRef = useRef<Canvas | null>(null);

  useEffect(() => {
    if (!canvasElRef.current) return;
    const instance = new fabric.Canvas(canvasElRef.current, {
      preserveObjectStacking: true,
      backgroundColor: "#ffffff",
      selection: true,
    });
    canvasRef.current = instance;
    setCanvas(instance);

    return () => {
      instance.dispose();
      canvasRef.current = null;
      setCanvas(null);
    };
  }, [canvasElRef]);

  useEffect(() => {
    if (!canvas || !imageUrl) return;
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    fabric.FabricImage.fromURL(imageUrl, { crossOrigin: "anonymous" })
      .then((img) => {
        if (cancelled) return;

        let { width, height } = img;
        if (!width || !height) {
          setError("Could not read this image's dimensions.");
          setIsLoading(false);
          return;
        }

        const scaleDown = Math.min(1, MAX_CANVAS_DIMENSION / Math.max(width, height) || 1);
        width = Math.round(width * scaleDown);
        height = Math.round(height * scaleDown);

        img.set({
          left: 0,
          top: 0,
          scaleX: scaleDown,
          scaleY: scaleDown,
          selectable: false,
          evented: false,
          hasControls: false,
          hoverCursor: "default",
        });

        canvas.setDimensions({ width, height });
        canvas.clear();
        canvas.backgroundColor = "#ffffff";
        canvas.add(img);
        canvas.renderAll();

        setImageObject(img);
        setIsLoading(false);
      })
      .catch(() => {
        if (!cancelled) {
          setError("Could not load this image. The file may be corrupted.");
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [canvas, imageUrl]);

  return { canvas, imageObject, isLoading, error };
}
