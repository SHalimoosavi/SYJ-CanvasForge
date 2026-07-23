import { useEffect, useRef } from "react";
import * as fabric from "fabric";
import type {
  Canvas,
  FabricObject,
  FabricImage,
  Point,
  TPointerEventInfo,
  TPointerEvent,
} from "fabric";
import type { ImageEditorTool } from "@/features/image/types";

interface UseImageEditorToolsOptions {
  canvas: Canvas | null;
  baseImage: FabricImage | null;
  tool: ImageEditorTool;
  color: string;
  strokeWidth: number;
  fontSize: number;
  brushSize: number;
  onObjectCommitted: () => void;
}

export function useImageEditorTools({
  canvas,
  baseImage,
  tool,
  color,
  strokeWidth,
  fontSize,
  brushSize,
  onObjectCommitted,
}: UseImageEditorToolsOptions): void {
  const draftRef = useRef<FabricObject | null>(null);
  const originRef = useRef<Point | null>(null);
  const polygonPointsRef = useRef<Point[]>([]);
  const polygonPreviewRef = useRef<fabric.Polyline | null>(null);

  // Freehand draw / erase mode toggling.
  useEffect(() => {
    if (!canvas) return;
    canvas.isDrawingMode = tool === "draw" || tool === "erase";
    if (canvas.isDrawingMode) {
      const brush = new fabric.PencilBrush(canvas);
      brush.width = brushSize;
      brush.color = tool === "erase" ? "#ffffff" : color;
      canvas.freeDrawingBrush = brush;
    }
    canvas.selection = tool === "select";
    canvas.forEachObject((obj) => {
      if (obj === baseImage) return;
      obj.selectable = tool === "select";
      obj.evented = tool === "select";
    });
    canvas.defaultCursor =
      tool === "text" ? "text" : tool === "select" ? "default" : "crosshair";
  }, [canvas, tool, color, brushSize, baseImage]);

  // Commit freehand strokes (erase uses destination-out compositing).
  useEffect(() => {
    if (!canvas) return;
    function handlePathCreated(event: { path?: FabricObject }) {
      const path = event.path;
      if (!path) return;
      if (tool === "erase") {
        path.set({ globalCompositeOperation: "destination-out" });
      }
      onObjectCommitted();
    }
    canvas.on("path:created", handlePathCreated);
    return () => {
      canvas.off("path:created", handlePathCreated);
    };
  }, [canvas, tool, onObjectCommitted]);

  // Click-to-place text.
  useEffect(() => {
    if (!canvas || tool !== "text") return;
    function handleClick(opt: TPointerEventInfo<TPointerEvent>) {
      if (!canvas) return;
      const point = canvas.getScenePoint(opt.e);
      const text = new fabric.IText("Double-click to edit", {
        left: point.x,
        top: point.y,
        fontSize,
        fill: color,
        fontFamily: "Inter, sans-serif",
      });
      canvas.add(text);
      canvas.setActiveObject(text);
      canvas.renderAll();
      onObjectCommitted();
    }
    canvas.on("mouse:down", handleClick);
    return () => {
      canvas.off("mouse:down", handleClick);
    };
  }, [canvas, tool, color, fontSize, onObjectCommitted]);

  // Drag-to-create shapes: rectangle, circle, triangle, line, arrow.
  useEffect(() => {
    const shapeTools: ImageEditorTool[] = ["rectangle", "circle", "triangle", "line", "arrow"];
    if (!canvas || !shapeTools.includes(tool)) return;

    function createDraft(origin: Point): FabricObject {
      const common = {
        left: origin.x,
        top: origin.y,
        stroke: color,
        strokeWidth,
        fill: "transparent",
        originX: "left" as const,
        originY: "top" as const,
      };
      switch (tool) {
        case "circle":
          return new fabric.Ellipse({ ...common, rx: 1, ry: 1 });
        case "triangle":
          return new fabric.Triangle({ ...common, width: 1, height: 1 });
        case "line":
        case "arrow":
          return new fabric.Line([origin.x, origin.y, origin.x, origin.y], {
            stroke: color,
            strokeWidth,
          });
        case "rectangle":
        default:
          return new fabric.Rect({ ...common, width: 1, height: 1 });
      }
    }

    function handleMouseDown(opt: TPointerEventInfo<TPointerEvent>) {
      if (!canvas) return;
      const origin = canvas.getScenePoint(opt.e);
      originRef.current = origin;
      const draft = createDraft(origin);
      draftRef.current = draft;
      canvas.add(draft);
    }

    function handleMouseMove(opt: TPointerEventInfo<TPointerEvent>) {
      if (!canvas || !draftRef.current || !originRef.current) return;
      const current = canvas.getScenePoint(opt.e);
      const origin = originRef.current;
      const draft = draftRef.current;

      if (draft instanceof fabric.Line) {
        draft.set({ x2: current.x, y2: current.y });
      } else if (draft instanceof fabric.Ellipse) {
        draft.set({
          rx: Math.abs(current.x - origin.x) / 2,
          ry: Math.abs(current.y - origin.y) / 2,
          left: Math.min(current.x, origin.x),
          top: Math.min(current.y, origin.y),
        });
      } else {
        draft.set({
          width: Math.abs(current.x - origin.x),
          height: Math.abs(current.y - origin.y),
          left: Math.min(current.x, origin.x),
          top: Math.min(current.y, origin.y),
        });
      }
      canvas.renderAll();
    }

    function handleMouseUp() {
      if (!canvas || !draftRef.current) return;

      if (tool === "arrow" && draftRef.current instanceof fabric.Line) {
        const line = draftRef.current;
        const x1 = line.x1 ?? 0;
        const y1 = line.y1 ?? 0;
        const x2 = line.x2 ?? 0;
        const y2 = line.y2 ?? 0;
        const angle = Math.atan2(y2 - y1, x2 - x1);
        const headLength = Math.max(10, strokeWidth * 4);
        const shaftEndX = x2 - Math.cos(angle) * headLength * 0.6;
        const shaftEndY = y2 - Math.sin(angle) * headLength * 0.6;

        const head = new fabric.Triangle({
          left: x2,
          top: y2,
          originX: "center",
          originY: "center",
          width: headLength,
          height: headLength,
          fill: color,
          angle: (angle * 180) / Math.PI + 90,
        });
        const shaft = new fabric.Line([x1, y1, shaftEndX, shaftEndY], {
          stroke: color,
          strokeWidth,
        });
        canvas.remove(line);
        const group = new fabric.Group([shaft, head]);
        canvas.add(group);
        canvas.setActiveObject(group);
      } else {
        canvas.setActiveObject(draftRef.current);
      }

      draftRef.current = null;
      originRef.current = null;
      canvas.renderAll();
      onObjectCommitted();
    }

    canvas.on("mouse:down", handleMouseDown);
    canvas.on("mouse:move", handleMouseMove);
    canvas.on("mouse:up", handleMouseUp);
    return () => {
      canvas.off("mouse:down", handleMouseDown);
      canvas.off("mouse:move", handleMouseMove);
      canvas.off("mouse:up", handleMouseUp);
      draftRef.current = null;
      originRef.current = null;
    };
  }, [canvas, tool, color, strokeWidth, onObjectCommitted]);

  // Click-sequence polygon tool; double-click or Enter to finish.
  useEffect(() => {
    if (!canvas || tool !== "polygon") return;

    function finishPolygon() {
      if (!canvas || polygonPointsRef.current.length < 3) {
        cleanup();
        return;
      }
      const polygon = new fabric.Polygon(polygonPointsRef.current, {
        stroke: color,
        strokeWidth,
        fill: "transparent",
      });
      canvas.add(polygon);
      canvas.setActiveObject(polygon);
      cleanup();
      canvas.renderAll();
      onObjectCommitted();
    }

    function cleanup() {
      if (polygonPreviewRef.current && canvas) {
        canvas.remove(polygonPreviewRef.current);
      }
      polygonPreviewRef.current = null;
      polygonPointsRef.current = [];
    }

    function handleClick(opt: TPointerEventInfo<TPointerEvent>) {
      if (!canvas) return;
      const point = canvas.getScenePoint(opt.e);
      polygonPointsRef.current = [...polygonPointsRef.current, point];

      if (polygonPreviewRef.current) {
        canvas.remove(polygonPreviewRef.current);
      }
      const preview = new fabric.Polyline(polygonPointsRef.current, {
        stroke: color,
        strokeWidth,
        fill: "transparent",
        selectable: false,
        evented: false,
      });
      polygonPreviewRef.current = preview;
      canvas.add(preview);
      canvas.renderAll();
    }

    function handleDoubleClick() {
      finishPolygon();
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Enter") finishPolygon();
      if (event.key === "Escape") cleanup();
    }

    canvas.on("mouse:down", handleClick);
    canvas.on("mouse:dblclick", handleDoubleClick);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      canvas.off("mouse:down", handleClick);
      canvas.off("mouse:dblclick", handleDoubleClick);
      window.removeEventListener("keydown", handleKeyDown);
      cleanup();
    };
  }, [canvas, tool, color, strokeWidth, onObjectCommitted]);

  // Delete key removes the active selection (skipped while editing text).
  useEffect(() => {
    if (!canvas) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== "Delete" && event.key !== "Backspace") return;
      const activeObject = canvas?.getActiveObject();
      if (!activeObject || (activeObject as fabric.IText).isEditing) return;
      const targets =
        activeObject.type === "activeselection"
          ? (activeObject as fabric.ActiveSelection).getObjects()
          : [activeObject];
      targets.forEach((obj) => canvas?.remove(obj));
      canvas?.discardActiveObject();
      canvas?.renderAll();
      onObjectCommitted();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [canvas, onObjectCommitted]);
}
