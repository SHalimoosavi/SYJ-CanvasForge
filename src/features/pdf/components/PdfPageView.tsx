import { useEffect, useRef, useState, useCallback } from "react";
import type { MouseEvent as ReactMouseEvent } from "react";
import type { PDFDocumentProxy, RenderTask } from "pdfjs-dist";
import type { PageViewport } from "pdfjs-dist";
import { usePdfStore } from "@/store/pdfStore";
import type { PdfAnnotationTool } from "@/features/pdf/types";
import { PdfTextAnnotationBox } from "@/features/pdf/components/PdfTextAnnotationBox";

interface PdfPageViewProps {
  fileId: string;
  document: PDFDocumentProxy;
  pageNumber: number; // 1-indexed original page number
  scale: number;
  rotation: 0 | 90 | 180 | 270;
  tool: PdfAnnotationTool;
  toolColor: string;
  toolStrokeWidth: number;
  toolFontSize: number;
}

export function PdfPageView({
  fileId,
  document,
  pageNumber,
  scale,
  rotation,
  tool,
  toolColor,
  toolStrokeWidth,
  toolFontSize,
}: PdfPageViewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const renderTaskRef = useRef<RenderTask | null>(null);
  const [viewport, setViewport] = useState<PageViewport | null>(null);
  const [isRendering, setIsRendering] = useState(true);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [dragCurrent, setDragCurrent] = useState<{ x: number; y: number } | null>(null);

  const pageIndex = pageNumber - 1;

  const textAnnotations = usePdfStore(
    (state) => state.documents[fileId]?.present.textAnnotations ?? [],
  ).filter((a) => a.pageIndex === pageIndex);
  const shapeAnnotations = usePdfStore(
    (state) => state.documents[fileId]?.present.shapeAnnotations ?? [],
  ).filter((a) => a.pageIndex === pageIndex);
  const highlightAnnotations = usePdfStore(
    (state) => state.documents[fileId]?.present.highlightAnnotations ?? [],
  ).filter((a) => a.pageIndex === pageIndex);

  const addTextAnnotation = usePdfStore((state) => state.addTextAnnotation);
  const updateTextAnnotation = usePdfStore((state) => state.updateTextAnnotation);
  const removeTextAnnotation = usePdfStore((state) => state.removeTextAnnotation);
  const addShapeAnnotation = usePdfStore((state) => state.addShapeAnnotation);
  const removeShapeAnnotation = usePdfStore((state) => state.removeShapeAnnotation);
  const addHighlightAnnotation = usePdfStore((state) => state.addHighlightAnnotation);
  const removeHighlightAnnotation = usePdfStore((state) => state.removeHighlightAnnotation);

  useEffect(() => {
    let cancelled = false;
    setIsRendering(true);

    document.getPage(pageNumber).then(async (loadedPage) => {
      if (cancelled) return;
      const nextViewport = loadedPage.getViewport({ scale, rotation });
      const canvas = canvasRef.current;
      if (!canvas) return;
      const context = canvas.getContext("2d");
      if (!context) return;

      const outputScale = window.devicePixelRatio || 1;
      canvas.width = Math.floor(nextViewport.width * outputScale);
      canvas.height = Math.floor(nextViewport.height * outputScale);
      canvas.style.width = `${nextViewport.width}px`;
      canvas.style.height = `${nextViewport.height}px`;

      renderTaskRef.current?.cancel();
      const task = loadedPage.render({
        canvas,
        canvasContext: context,
        viewport: nextViewport,
        transform: outputScale !== 1 ? [outputScale, 0, 0, outputScale, 0, 0] : undefined,
      });
      renderTaskRef.current = task;

      try {
        await task.promise;
        if (!cancelled) {
          setViewport(nextViewport);
          setIsRendering(false);
        }
      } catch {
        if (!cancelled) setIsRendering(false);
      }
    });

    return () => {
      cancelled = true;
      renderTaskRef.current?.cancel();
    };
  }, [document, pageNumber, scale, rotation]);

  const getRelativePoint = useCallback((event: ReactMouseEvent): { x: number; y: number } => {
    const rect = event.currentTarget.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  }, []);

  const handleClick = useCallback(
    (event: ReactMouseEvent<HTMLDivElement>) => {
      if (tool !== "text" || !viewport) return;
      const point = getRelativePoint(event);
      const [pdfX, pdfY] = viewport.convertToPdfPoint(point.x, point.y);
      addTextAnnotation(fileId, {
        pageIndex,
        x: pdfX,
        y: pdfY,
        text: "Double-click to edit",
        fontSize: toolFontSize,
        color: toolColor,
        fontFamily: "Helvetica",
        bold: false,
        italic: false,
      });
    },
    [
      tool,
      viewport,
      getRelativePoint,
      addTextAnnotation,
      fileId,
      pageIndex,
      toolFontSize,
      toolColor,
    ],
  );

  const isShapeTool = tool === "rectangle" || tool === "circle" || tool === "line";
  const isMarkupTool = tool === "highlight" || tool === "underline" || tool === "strikeout";

  const handleMouseDown = useCallback(
    (event: ReactMouseEvent<HTMLDivElement>) => {
      if (!isShapeTool && !isMarkupTool) return;
      const point = getRelativePoint(event);
      setDragStart(point);
      setDragCurrent(point);
    },
    [isShapeTool, isMarkupTool, getRelativePoint],
  );

  const handleMouseMove = useCallback(
    (event: ReactMouseEvent<HTMLDivElement>) => {
      if (!dragStart) return;
      setDragCurrent(getRelativePoint(event));
    },
    [dragStart, getRelativePoint],
  );

  const handleMouseUp = useCallback(() => {
    if (!dragStart || !dragCurrent || !viewport) {
      setDragStart(null);
      setDragCurrent(null);
      return;
    }
    const pixelWidth = Math.abs(dragCurrent.x - dragStart.x);
    const pixelHeight = Math.abs(dragCurrent.y - dragStart.y);

    if (pixelWidth < 4 && pixelHeight < 4) {
      setDragStart(null);
      setDragCurrent(null);
      return;
    }

    const [x1, y1] = viewport.convertToPdfPoint(dragStart.x, dragStart.y);
    const [x2, y2] = viewport.convertToPdfPoint(dragCurrent.x, dragCurrent.y);
    const x = Math.min(x1, x2);
    const y = Math.min(y1, y2);
    const width = Math.abs(x2 - x1);
    const height = Math.abs(y2 - y1);

    if (isShapeTool) {
      addShapeAnnotation(fileId, {
        pageIndex,
        type: tool as "rectangle" | "circle" | "line",
        x,
        y,
        width,
        height,
        color: toolColor,
        strokeWidth: toolStrokeWidth,
      });
    } else if (isMarkupTool) {
      addHighlightAnnotation(fileId, {
        pageIndex,
        x,
        y,
        width,
        height,
        color: toolColor,
        style: tool as "highlight" | "underline" | "strikeout",
      });
    }

    setDragStart(null);
    setDragCurrent(null);
  }, [
    dragStart,
    dragCurrent,
    viewport,
    isShapeTool,
    isMarkupTool,
    tool,
    addShapeAnnotation,
    addHighlightAnnotation,
    fileId,
    pageIndex,
    toolColor,
    toolStrokeWidth,
  ]);

  const cursorClass =
    tool === "text"
      ? "cursor-text"
      : isShapeTool || isMarkupTool
        ? "cursor-crosshair"
        : "cursor-default";

  return (
    <div
      className={`relative inline-block select-none bg-white shadow-md ${cursorClass}`}
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={() => {
        setDragStart(null);
        setDragCurrent(null);
      }}
    >
      <canvas ref={canvasRef} className="block" />
      {isRendering && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/60">
          <span className="h-6 w-6 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
        </div>
      )}

      {viewport &&
        !isRendering &&
        textAnnotations.map((annotation) => {
          const [vx, vy] = viewport.convertToViewportPoint(annotation.x, annotation.y);
          return (
            <PdfTextAnnotationBox
              key={annotation.id}
              annotation={annotation}
              viewportX={vx}
              viewportY={vy}
              scale={scale}
              editable={tool === "select" || tool === "text"}
              onChange={(patch) => updateTextAnnotation(fileId, annotation.id, patch)}
              onDelete={() => removeTextAnnotation(fileId, annotation.id)}
            />
          );
        })}

      {viewport &&
        !isRendering &&
        shapeAnnotations.map((shape) => {
          const [vx1, vy1] = viewport.convertToViewportPoint(shape.x, shape.y + shape.height);
          const [vx2, vy2] = viewport.convertToViewportPoint(shape.x + shape.width, shape.y);
          const left = Math.min(vx1, vx2);
          const top = Math.min(vy1, vy2);
          const width = Math.abs(vx2 - vx1);
          const height = Math.abs(vy2 - vy1);
          return (
            <div
              key={shape.id}
              role="button"
              tabIndex={0}
              aria-label={`${shape.type} annotation`}
              onDoubleClick={() => removeShapeAnnotation(fileId, shape.id)}
              className="group absolute"
              style={{ left, top, width, height }}
              title="Double-click to remove"
            >
              {shape.type === "rectangle" && (
                <div
                  className="h-full w-full"
                  style={{ border: `${shape.strokeWidth}px solid ${shape.color}` }}
                />
              )}
              {shape.type === "circle" && (
                <div
                  className="h-full w-full rounded-full"
                  style={{ border: `${shape.strokeWidth}px solid ${shape.color}` }}
                />
              )}
              {shape.type === "line" && (
                <svg className="h-full w-full overflow-visible">
                  <line
                    x1={0}
                    y1={0}
                    x2={width}
                    y2={height}
                    stroke={shape.color}
                    strokeWidth={shape.strokeWidth}
                  />
                </svg>
              )}
            </div>
          );
        })}

      {viewport &&
        !isRendering &&
        highlightAnnotations.map((highlight) => {
          const [vx1, vy1] = viewport.convertToViewportPoint(
            highlight.x,
            highlight.y + highlight.height,
          );
          const [vx2, vy2] = viewport.convertToViewportPoint(
            highlight.x + highlight.width,
            highlight.y,
          );
          const left = Math.min(vx1, vx2);
          const top = Math.min(vy1, vy2);
          const width = Math.abs(vx2 - vx1);
          const height = Math.abs(vy2 - vy1);
          return (
            <div
              key={highlight.id}
              role="button"
              tabIndex={0}
              aria-label={`${highlight.style} annotation`}
              onDoubleClick={() => removeHighlightAnnotation(fileId, highlight.id)}
              className="absolute"
              style={{
                left,
                top,
                width,
                height,
                backgroundColor:
                  highlight.style === "highlight" ? highlight.color : "transparent",
                opacity: highlight.style === "highlight" ? 0.35 : 1,
                borderBottom:
                  highlight.style === "underline" ? `2px solid ${highlight.color}` : undefined,
                borderTop:
                  highlight.style === "strikeout" ? `2px solid ${highlight.color}` : undefined,
              }}
              title="Double-click to remove"
            />
          );
        })}

      {dragStart && dragCurrent && (isShapeTool || isMarkupTool) && (
        <div
          className="pointer-events-none absolute border-2 border-dashed border-brand-500 bg-brand-500/10"
          style={{
            left: Math.min(dragStart.x, dragCurrent.x),
            top: Math.min(dragStart.y, dragCurrent.y),
            width: Math.abs(dragCurrent.x - dragStart.x),
            height: Math.abs(dragCurrent.y - dragStart.y),
          }}
        />
      )}
    </div>
  );
}
