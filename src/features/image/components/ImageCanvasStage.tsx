import { useEffect, useRef, useState } from "react";
import * as fabric from "fabric";
import type { Canvas, FabricImage } from "fabric";
import { Check, X as XIcon } from "lucide-react";
import { useFabricCanvas } from "@/features/image/hooks/useFabricCanvas";
import { useImageEditorTools } from "@/features/image/hooks/useImageEditorTools";
import { Button } from "@/components/ui/Button";
import type { ImageEditorTool } from "@/features/image/types";

interface ImageCanvasStageProps {
  imageUrl: string;
  tool: ImageEditorTool;
  color: string;
  strokeWidth: number;
  fontSize: number;
  brushSize: number;
  zoom: number;
  onCanvasReady: (canvas: Canvas, baseImage: FabricImage) => void;
  onObjectCommitted: () => void;
  onCropApplied: (newImageUrl: string) => void;
  onExitCropMode: () => void;
}

export function ImageCanvasStage({
  imageUrl,
  tool,
  color,
  strokeWidth,
  fontSize,
  brushSize,
  zoom,
  onCanvasReady,
  onObjectCommitted,
  onCropApplied,
  onExitCropMode,
}: ImageCanvasStageProps) {
  const canvasElRef = useRef<HTMLCanvasElement>(null);
  const cropRectRef = useRef<fabric.Rect | null>(null);
  const { canvas, imageObject, isLoading, error } = useFabricCanvas(canvasElRef, imageUrl);
  const [isCropReady, setIsCropReady] = useState(false);

  useImageEditorTools({
    canvas,
    baseImage: imageObject,
    tool: tool === "crop" ? "select" : tool,
    color,
    strokeWidth,
    fontSize,
    brushSize,
    onObjectCommitted,
  });

  const naturalSizeRef = useRef<{ width: number; height: number } | null>(null);

  useEffect(() => {
    naturalSizeRef.current = null;
  }, [imageUrl]);

  useEffect(() => {
    if (canvas && imageObject && !naturalSizeRef.current) {
      naturalSizeRef.current = { width: canvas.getWidth(), height: canvas.getHeight() };
    }
    if (canvas && imageObject) onCanvasReady(canvas, imageObject);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canvas, imageObject]);

  useEffect(() => {
    if (!canvas || !naturalSizeRef.current) return;
    const { width, height } = naturalSizeRef.current;
    canvas.setDimensions({ width: width * zoom, height: height * zoom });
    canvas.setZoom(zoom);
    canvas.renderAll();
  }, [canvas, zoom]);

  // Crop mode: overlay a movable/resizable rect representing the crop region.
  useEffect(() => {
    if (!canvas || !imageObject) return;

    if (tool === "crop") {
      const rect = new fabric.Rect({
        left: imageObject.left,
        top: imageObject.top,
        width: (imageObject.width ?? 100) * (imageObject.scaleX ?? 1) * 0.8,
        height: (imageObject.height ?? 100) * (imageObject.scaleY ?? 1) * 0.8,
        fill: "rgba(61, 99, 243, 0.15)",
        stroke: "#3d63f3",
        strokeWidth: 2,
        strokeDashArray: [6, 4],
        cornerColor: "#3d63f3",
        cornerStyle: "circle",
        transparentCorners: false,
      });
      cropRectRef.current = rect;
      canvas.add(rect);
      canvas.setActiveObject(rect);
      canvas.selection = false;
      canvas.renderAll();
      setIsCropReady(true);
    }

    return () => {
      if (cropRectRef.current && canvas) {
        canvas.remove(cropRectRef.current);
        cropRectRef.current = null;
        canvas.renderAll();
      }
      setIsCropReady(false);
    };
  }, [canvas, imageObject, tool]);

  function handleApplyCrop() {
    if (!canvas || !cropRectRef.current) return;
    const rect = cropRectRef.current;
    const left = rect.left ?? 0;
    const top = rect.top ?? 0;
    const width = (rect.width ?? 0) * (rect.scaleX ?? 1);
    const height = (rect.height ?? 0) * (rect.scaleY ?? 1);

    canvas.remove(rect);
    cropRectRef.current = null;
    canvas.renderAll();

    const dataUrl = canvas.toDataURL({
      format: "png",
      left,
      top,
      width,
      height,
      multiplier: 1,
    });
    onCropApplied(dataUrl);
  }

  function handleCancelCrop() {
    onExitCropMode();
  }

  return (
    <div className="relative inline-block bg-white shadow-lg">
      <canvas ref={canvasElRef} />
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/70">
          <span className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-white p-4 text-center text-sm text-red-600">
          {error}
        </div>
      )}
      {tool === "crop" && isCropReady && (
        <div className="absolute -bottom-14 left-1/2 flex -translate-x-1/2 gap-2">
          <Button
            size="sm"
            variant="secondary"
            leadingIcon={<XIcon size={14} />}
            onClick={handleCancelCrop}
          >
            Cancel
          </Button>
          <Button size="sm" leadingIcon={<Check size={14} />} onClick={handleApplyCrop}>
            Apply crop
          </Button>
        </div>
      )}
    </div>
  );
}
