import { useEffect, useRef, useState } from "react";
import type { PDFDocumentProxy } from "pdfjs-dist";
import { RotateCw, Trash2, CopyPlus, RotateCcw as UndoRotateIcon } from "lucide-react";
import { usePdfStore } from "@/store/pdfStore";
import { cn } from "@/lib/cn";

interface PdfThumbnailRailProps {
  fileId: string;
  document: PDFDocumentProxy;
  activePageNumber: number;
  onSelectPage: (pageNumber: number) => void;
}

function Thumbnail({
  document,
  pageNumber,
  rotation,
}: {
  document: PDFDocumentProxy;
  pageNumber: number;
  rotation: 0 | 90 | 180 | 270;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let cancelled = false;
    document.getPage(pageNumber).then(async (page) => {
      if (cancelled) return;
      const baseViewport = page.getViewport({ scale: 1, rotation });
      const targetWidth = 132;
      const scale = targetWidth / baseViewport.width;
      const viewport = page.getViewport({ scale, rotation });
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const context = canvas.getContext("2d");
      if (!context) return;
      try {
        await page.render({ canvas, canvasContext: context, viewport }).promise;
      } catch {
        // Ignore cancelled renders when scrolling quickly.
      }
    });
    return () => {
      cancelled = true;
    };
  }, [document, pageNumber, rotation]);

  return <canvas ref={canvasRef} className="block w-full rounded shadow-sm" />;
}

export function PdfThumbnailRail({
  fileId,
  document,
  activePageNumber,
  onSelectPage,
}: PdfThumbnailRailProps) {
  const state = usePdfStore((s) => s.documents[fileId]?.present);
  const rotatePage = usePdfStore((s) => s.rotatePage);
  const deletePage = usePdfStore((s) => s.deletePage);
  const restorePage = usePdfStore((s) => s.restorePage);
  const duplicatePage = usePdfStore((s) => s.duplicatePage);
  const reorderPages = usePdfStore((s) => s.reorderPages);

  const [draggedFrom, setDraggedFrom] = useState<number | null>(null);

  if (!state) return null;

  const activeOrder = state.pageOrder.filter((p) => !state.deletedPages.includes(p));
  const deletedOrder = state.pageOrder.filter((p) => state.deletedPages.includes(p));

  return (
    <div className="flex h-full w-44 flex-col gap-3 overflow-y-auto border-r border-[var(--border-subtle)] bg-[var(--surface-0)] p-3">
      <p className="px-1 text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
        Pages ({activeOrder.length})
      </p>
      {activeOrder.map((originalIndex, displayIndex) => {
        const pageNumber = originalIndex + 1;
        const rotation = state.rotations[originalIndex] ?? 0;
        const isActive = pageNumber === activePageNumber;
        return (
          <div
            key={originalIndex}
            draggable
            onDragStart={() => setDraggedFrom(displayIndex)}
            onDragOver={(event) => event.preventDefault()}
            onDrop={() => {
              if (draggedFrom !== null && draggedFrom !== displayIndex) {
                reorderPages(fileId, draggedFrom, displayIndex);
              }
              setDraggedFrom(null);
            }}
            className={cn(
              "group relative cursor-grab rounded-lg border-2 p-1.5 transition-colors",
              isActive
                ? "border-brand-500 bg-brand-50/60 dark:bg-brand-950/30"
                : "border-transparent hover:border-[var(--border-strong)]",
            )}
          >
            <button
              type="button"
              className="block w-full"
              onClick={() => onSelectPage(pageNumber)}
              aria-label={`Go to page ${displayIndex + 1}`}
            >
              <Thumbnail document={document} pageNumber={pageNumber} rotation={rotation} />
            </button>
            <p className="mt-1 text-center text-[11px] text-[var(--text-secondary)]">
              {displayIndex + 1}
            </p>
            <div className="absolute right-1 top-1 hidden gap-0.5 rounded-md bg-[var(--surface-0)]/95 p-0.5 shadow group-hover:flex">
              <button
                type="button"
                aria-label="Rotate page"
                title="Rotate 90°"
                onClick={() => rotatePage(fileId, originalIndex, 1)}
                className="rounded p-1 hover:bg-[var(--surface-2)]"
              >
                <RotateCw size={12} />
              </button>
              <button
                type="button"
                aria-label="Duplicate page"
                title="Duplicate"
                onClick={() => duplicatePage(fileId, originalIndex)}
                className="rounded p-1 hover:bg-[var(--surface-2)]"
              >
                <CopyPlus size={12} />
              </button>
              <button
                type="button"
                aria-label="Delete page"
                title="Delete"
                onClick={() => deletePage(fileId, originalIndex)}
                className="rounded p-1 text-red-500 hover:bg-red-500/10"
              >
                <Trash2 size={12} />
              </button>
            </div>
          </div>
        );
      })}

      {deletedOrder.length > 0 && (
        <>
          <p className="mt-2 px-1 text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
            Deleted ({deletedOrder.length})
          </p>
          {deletedOrder.map((originalIndex) => (
            <div
              key={originalIndex}
              className="flex items-center justify-between rounded-lg border border-dashed border-[var(--border-strong)] p-2 opacity-60"
            >
              <span className="text-xs text-[var(--text-secondary)]">
                Page {originalIndex + 1}
              </span>
              <button
                type="button"
                aria-label="Restore page"
                title="Restore"
                onClick={() => restorePage(fileId, originalIndex)}
                className="rounded p-1 hover:bg-[var(--surface-2)]"
              >
                <UndoRotateIcon size={12} />
              </button>
            </div>
          ))}
        </>
      )}
    </div>
  );
}
