import {
  MousePointer2,
  Crop,
  Pencil,
  Eraser,
  Type,
  Square,
  Circle,
  Triangle as TriangleIcon,
  Minus,
  ArrowUpRight,
  Hexagon,
  Undo2,
  Redo2,
  ZoomIn,
  ZoomOut,
  Download,
} from "lucide-react";
import { IconButton } from "@/components/ui/IconButton";
import { Button } from "@/components/ui/Button";
import type { ImageEditorTool } from "@/features/image/types";

interface ImageToolbarProps {
  tool: ImageEditorTool;
  onToolChange: (tool: ImageEditorTool) => void;
  toolColor: string;
  onToolColorChange: (color: string) => void;
  zoom: number;
  onZoomChange: (zoom: number) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onOpenExport: () => void;
}

const TOOLS: { id: ImageEditorTool; icon: typeof MousePointer2; label: string }[] = [
  { id: "select", icon: MousePointer2, label: "Select / move" },
  { id: "crop", icon: Crop, label: "Crop" },
  { id: "draw", icon: Pencil, label: "Brush" },
  { id: "erase", icon: Eraser, label: "Eraser" },
  { id: "text", icon: Type, label: "Add text" },
  { id: "rectangle", icon: Square, label: "Rectangle" },
  { id: "circle", icon: Circle, label: "Circle" },
  { id: "triangle", icon: TriangleIcon, label: "Triangle" },
  { id: "line", icon: Minus, label: "Line" },
  { id: "arrow", icon: ArrowUpRight, label: "Arrow" },
  { id: "polygon", icon: Hexagon, label: "Polygon (double-click to finish)" },
];

export function ImageToolbar({
  tool,
  onToolChange,
  toolColor,
  onToolColorChange,
  zoom,
  onZoomChange,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onOpenExport,
}: ImageToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-1 border-b border-[var(--border-subtle)] bg-[var(--surface-0)] px-3 py-2">
      <div className="flex flex-wrap items-center gap-0.5 rounded-lg bg-[var(--surface-2)] p-1">
        {TOOLS.map(({ id, icon: ToolIcon, label }) => (
          <IconButton
            key={id}
            icon={<ToolIcon size={16} />}
            label={label}
            active={tool === id}
            size="sm"
            onClick={() => onToolChange(id)}
          />
        ))}
      </div>

      <label className="ml-1 flex items-center gap-1.5">
        <span className="sr-only">Tool color</span>
        <input
          type="color"
          value={toolColor}
          onChange={(event) => onToolColorChange(event.target.value)}
          className="h-8 w-8 cursor-pointer rounded border border-[var(--border-subtle)] bg-transparent"
          aria-label="Tool color"
        />
      </label>

      <div className="mx-2 h-6 w-px bg-[var(--border-subtle)]" />

      <IconButton
        icon={<Undo2 size={16} />}
        label="Undo (Ctrl+Z)"
        onClick={onUndo}
        disabled={!canUndo}
        size="sm"
      />
      <IconButton
        icon={<Redo2 size={16} />}
        label="Redo (Ctrl+Y)"
        onClick={onRedo}
        disabled={!canRedo}
        size="sm"
      />

      <div className="mx-2 h-6 w-px bg-[var(--border-subtle)]" />

      <IconButton
        icon={<ZoomOut size={16} />}
        label="Zoom out"
        onClick={() => onZoomChange(Math.max(0.2, Math.round((zoom - 0.1) * 10) / 10))}
        size="sm"
      />
      <span className="w-12 text-center text-xs tabular-nums text-[var(--text-secondary)]">
        {Math.round(zoom * 100)}%
      </span>
      <IconButton
        icon={<ZoomIn size={16} />}
        label="Zoom in"
        onClick={() => onZoomChange(Math.min(3, Math.round((zoom + 0.1) * 10) / 10))}
        size="sm"
      />

      <div className="ml-auto">
        <Button
          variant="primary"
          size="sm"
          leadingIcon={<Download size={15} />}
          onClick={onOpenExport}
        >
          Export
        </Button>
      </div>
    </div>
  );
}
