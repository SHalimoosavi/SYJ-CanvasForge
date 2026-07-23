import { useCallback, useEffect, useRef, useState } from "react";
import type { DragEvent } from "react";
import { UploadCloud, FileText, Image as ImageIcon, FileType } from "lucide-react";
import { ACCEPT_ATTRIBUTE } from "@/services/fileValidation";
import { useFileIngest } from "@/features/upload/hooks/useFileIngest";
import { cn } from "@/lib/cn";

export function Dropzone({ compact = false }: { compact?: boolean }) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { ingest, isIngesting } = useFileIngest();

  const handleDrop = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      setIsDragging(false);
      if (event.dataTransfer.files.length > 0) {
        void ingest(event.dataTransfer.files);
      }
    },
    [ingest],
  );

  useEffect(() => {
    function handlePaste(event: ClipboardEvent) {
      const files = event.clipboardData?.files;
      if (files && files.length > 0) {
        void ingest(files);
      }
    }
    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [ingest]);

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label="Upload files: click to browse, or drag and drop"
      onClick={() => inputRef.current?.click()}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") inputRef.current?.click();
      }}
      onDragOver={(event) => {
        event.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      className={cn(
        "flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed text-center transition-colors",
        "border-[var(--border-strong)] bg-[var(--surface-0)] hover:border-brand-500 hover:bg-brand-50/40 dark:hover:bg-brand-950/20",
        isDragging && "border-brand-500 bg-brand-50/60 dark:bg-brand-950/30",
        compact ? "p-6" : "p-12",
      )}
    >
      <input
        ref={inputRef}
        type="file"
        multiple
        accept={ACCEPT_ATTRIBUTE}
        className="sr-only"
        onChange={(event) => {
          if (event.target.files) void ingest(event.target.files);
          event.target.value = "";
        }}
      />
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-600/10 text-brand-600">
        <UploadCloud size={28} aria-hidden="true" />
      </div>
      <div>
        <p className="font-medium text-[var(--text-primary)]">
          {isIngesting ? "Processing files…" : "Drop files here, click to browse, or paste"}
        </p>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          PDF, PNG, JPG, WEBP, GIF, SVG, BMP, DOCX, TXT — up to 100 MB each
        </p>
      </div>
      {!compact && (
        <div className="mt-2 flex items-center gap-4 text-xs text-[var(--text-muted)]">
          <span className="flex items-center gap-1">
            <FileType size={14} aria-hidden="true" /> PDF
          </span>
          <span className="flex items-center gap-1">
            <ImageIcon size={14} aria-hidden="true" /> Images
          </span>
          <span className="flex items-center gap-1">
            <FileText size={14} aria-hidden="true" /> Docs
          </span>
        </div>
      )}
    </div>
  );
}
