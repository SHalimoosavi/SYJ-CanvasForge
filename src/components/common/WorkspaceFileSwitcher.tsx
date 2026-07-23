import { useRef } from "react";
import { Plus, X } from "lucide-react";
import type { UploadedFile } from "@/types";
import { useUploadStore } from "@/store/uploadStore";
import { useFileIngest } from "@/features/upload/hooks/useFileIngest";
import { cn } from "@/lib/cn";

interface WorkspaceFileSwitcherProps {
  files: UploadedFile[];
  activeFileId: string | null;
  onSelect: (id: string) => void;
  acceptExtra: string;
}

export function WorkspaceFileSwitcher({
  files,
  activeFileId,
  onSelect,
  acceptExtra,
}: WorkspaceFileSwitcherProps) {
  const removeFile = useUploadStore((s) => s.removeFile);
  const { ingest } = useFileIngest();
  const inputRef = useRef<HTMLInputElement>(null);

  if (files.length === 0) return null;

  return (
    <div className="flex items-center gap-1 overflow-x-auto border-b border-[var(--border-subtle)] bg-[var(--surface-0)] px-2 py-1.5">
      {files.map((file) => (
        <div
          key={file.id}
          className={cn(
            "group flex shrink-0 items-center gap-2 rounded-md px-3 py-1.5 text-sm",
            file.id === activeFileId
              ? "bg-brand-600/10 text-brand-700 dark:text-brand-300"
              : "text-[var(--text-secondary)] hover:bg-[var(--surface-2)]",
          )}
        >
          <button
            type="button"
            onClick={() => onSelect(file.id)}
            className="max-w-[160px] truncate"
          >
            {file.name}
          </button>
          <button
            type="button"
            aria-label={`Close ${file.name}`}
            onClick={() => removeFile(file.id)}
            className="hidden rounded p-0.5 hover:bg-[var(--surface-3)] group-hover:block"
          >
            <X size={12} />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        aria-label="Add another file"
        className="ml-1 flex shrink-0 items-center gap-1 rounded-md px-2 py-1.5 text-xs text-[var(--text-muted)] hover:bg-[var(--surface-2)]"
      >
        <Plus size={13} /> Add
      </button>
      <input
        ref={inputRef}
        type="file"
        multiple
        accept={acceptExtra}
        className="sr-only"
        onChange={(event) => {
          if (event.target.files) void ingest(event.target.files, { navigateOnFirst: false });
          event.target.value = "";
        }}
      />
    </div>
  );
}
