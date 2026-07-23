import {
  MousePointer2,
  Type,
  Square,
  Circle,
  Minus,
  Highlighter,
  Underline,
  Strikethrough,
  ZoomIn,
  ZoomOut,
  Undo2,
  Redo2,
  Download,
  FilePlus2,
  Scissors,
  Info,
} from "lucide-react";
import { IconButton } from "@/components/ui/IconButton";
import { Button } from "@/components/ui/Button";
import type { PdfAnnotationTool } from "@/features/pdf/types";

interface PdfToolbarProps {
  tool: PdfAnnotationTool;
  onToolChange: (tool: PdfAnnotationTool) => void;
  toolColor: string;
  onToolColorChange: (color: string) => void;
  zoom: number;
  onZoomChange: (zoom: number) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onExport: () => void;
  onOpenMerge: () => void;
  onOpenSplit: () => void;
  onOpenMetadata: () => void;
  isExporting: boolean;
}

const TOOLS: { id: PdfAnnotationTool; icon: typeof MousePointer2; label: string }[] = [
  { id: "select", icon: MousePointer2, label: "Select / move" },
  { id: "text", icon: Type, label: "Add text" },
  { id: "rectangle", icon: Square, label: "Rectangle" },
  { id: "circle", icon: Circle, label: "Circle" },
  { id: "line", icon: Minus, label: "Line" },
  { id: "highlight", icon: Highlighter, label: "Highlight" },
  { id: "underline", icon: Underline, label: "Underline" },
  { id: "strikeout", icon: Strikethrough, label: "Strikeout" },
];

export function PdfToolbar({
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
  onExport,
  onOpenMerge,
  onOpenSplit,
  onOpenMetadata,
  isExporting,
}: PdfToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-1 border-b border-[var(--border-subtle)] bg-[var(--surface-0)] px-3 py-2">
      <div className="flex items-center gap-0.5 rounded-lg bg-[var(--surface-2)] p-1">
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
        <span className="sr-only">Annotation color</span>
        <input
          type="color"
          value={toolColor}
          onChange={(event) => onToolColorChange(event.target.value)}
          className="h-8 w-8 cursor-pointer rounded border border-[var(--border-subtle)] bg-transparent"
          aria-label="Annotation color"
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
        onClick={() => onZoomChange(Math.max(0.4, zoom - 0.2))}
        size="sm"
      />
      <span className="w-12 text-center text-xs tabular-nums text-[var(--text-secondary)]">
        {Math.round(zoom * 100)}%
      </span>
      <IconButton
        icon={<ZoomIn size={16} />}
        label="Zoom in"
        onClick={() => onZoomChange(Math.min(3, zoom + 0.2))}
        size="sm"
      />

      <div className="ml-auto flex items-center gap-1.5">
        <Button
          variant="ghost"
          size="sm"
          leadingIcon={<FilePlus2 size={15} />}
          onClick={onOpenMerge}
        >
          Merge
        </Button>
        <Button
          variant="ghost"
          size="sm"
          leadingIcon={<Scissors size={15} />}
          onClick={onOpenSplit}
        >
          Split
        </Button>
        <Button
          variant="ghost"
          size="sm"
          leadingIcon={<Info size={15} />}
          onClick={onOpenMetadata}
        >
          Info
        </Button>
        <Button
          variant="primary"
          size="sm"
          leadingIcon={<Download size={15} />}
          onClick={onExport}
          isLoading={isExporting}
        >
          Export PDF
        </Button>
      </div>
    </div>
  );
}
