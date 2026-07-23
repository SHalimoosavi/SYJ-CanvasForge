import { useRef, useState } from "react";
import type { MouseEvent as ReactMouseEvent } from "react";
import { X } from "lucide-react";
import type { PdfTextAnnotation } from "@/types";

interface PdfTextAnnotationBoxProps {
  annotation: PdfTextAnnotation;
  viewportX: number;
  viewportY: number;
  scale: number;
  editable: boolean;
  onChange: (patch: Partial<PdfTextAnnotation>) => void;
  onDelete: () => void;
}

export function PdfTextAnnotationBox({
  annotation,
  viewportX,
  viewportY,
  scale,
  editable,
  onChange,
  onDelete,
}: PdfTextAnnotationBoxProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const dragOrigin = useRef<{
    startX: number;
    startY: number;
    boxX: number;
    boxY: number;
  } | null>(null);

  const displayFontSize = annotation.fontSize * scale;

  function handleDragStart(event: ReactMouseEvent) {
    if (!editable || isEditing) return;
    event.stopPropagation();
    dragOrigin.current = {
      startX: event.clientX,
      startY: event.clientY,
      boxX: viewportX,
      boxY: viewportY,
    };
    setIsDragging(true);

    function handleMove(moveEvent: globalThis.MouseEvent) {
      if (!dragOrigin.current) return;
      const dx = moveEvent.clientX - dragOrigin.current.startX;
      const dy = moveEvent.clientY - dragOrigin.current.startY;
      const el = document.getElementById(`pdf-text-annotation-${annotation.id}`);
      if (el) {
        el.style.left = `${dragOrigin.current.boxX + dx}px`;
        el.style.top = `${dragOrigin.current.boxY + dy}px`;
      }
    }

    function handleUp(upEvent: globalThis.MouseEvent) {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleUp);
      setIsDragging(false);
      if (dragOrigin.current) {
        const dx = (upEvent.clientX - dragOrigin.current.startX) / scale;
        const dy = (upEvent.clientY - dragOrigin.current.startY) / scale;
        // PDF y-axis is inverted relative to screen y-axis.
        onChange({ x: annotation.x + dx, y: annotation.y - dy });
      }
      dragOrigin.current = null;
    }

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleUp);
  }

  return (
    <div
      id={`pdf-text-annotation-${annotation.id}`}
      className="group absolute"
      style={{
        left: viewportX,
        top: viewportY - displayFontSize,
        cursor: editable ? (isDragging ? "grabbing" : "grab") : "default",
      }}
      onMouseDown={handleDragStart}
      onDoubleClick={(event) => {
        event.stopPropagation();
        if (editable) setIsEditing(true);
      }}
    >
      {isEditing ? (
        <input
          autoFocus
          value={annotation.text}
          onChange={(event) => onChange({ text: event.target.value })}
          onBlur={() => setIsEditing(false)}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === "Escape") setIsEditing(false);
          }}
          style={{
            fontSize: displayFontSize,
            color: annotation.color,
            fontWeight: annotation.bold ? 700 : 400,
            fontStyle: annotation.italic ? "italic" : "normal",
          }}
          className="min-w-[80px] rounded border border-brand-500 bg-white px-1 outline-none"
        />
      ) : (
        <span
          style={{
            fontSize: displayFontSize,
            color: annotation.color,
            fontWeight: annotation.bold ? 700 : 400,
            fontStyle: annotation.italic ? "italic" : "normal",
            whiteSpace: "pre",
          }}
          className="rounded px-0.5 outline-1 outline-dashed outline-transparent group-hover:outline-brand-400"
        >
          {annotation.text}
        </span>
      )}
      {editable && !isEditing && (
        <button
          type="button"
          aria-label="Delete text annotation"
          onClick={(event) => {
            event.stopPropagation();
            onDelete();
          }}
          className="absolute -right-2 -top-2 hidden h-4 w-4 items-center justify-center rounded-full bg-red-500 text-white group-hover:flex"
        >
          <X size={10} />
        </button>
      )}
    </div>
  );
}
