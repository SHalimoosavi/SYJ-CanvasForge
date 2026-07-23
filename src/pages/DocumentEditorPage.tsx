import { useEffect, useState } from "react";
import { AlertTriangle, Download, Eye, Pencil } from "lucide-react";
import { useUploadStore } from "@/store/uploadStore";
import { useDocumentText } from "@/features/document/hooks/useDocumentText";
import { Dropzone } from "@/features/upload/components/Dropzone";
import { WorkspaceFileSwitcher } from "@/components/common/WorkspaceFileSwitcher";
import { Button } from "@/components/ui/Button";
import { downloadBytes, withoutExtension } from "@/lib/download";
import { toast } from "@/store/toastStore";

export function DocumentEditorPage() {
  const files = useUploadStore((s) => s.files.filter((f) => f.kind === "document"));
  const activeFileId = useUploadStore((s) => s.activeFileId);
  const setActiveFile = useUploadStore((s) => s.setActiveFile);

  const activeFile =
    files.find((f) => f.id === activeFileId) ?? (files.length > 0 ? files[0] : undefined);

  const { text, html, isLoading, error } = useDocumentText(activeFile);
  const [draft, setDraft] = useState("");
  const [mode, setMode] = useState<"preview" | "edit">("edit");

  useEffect(() => {
    setDraft(text);
  }, [text]);

  function handleExportTxt() {
    if (!activeFile) return;
    const bytes = new TextEncoder().encode(draft);
    downloadBytes(
      bytes,
      `${withoutExtension(activeFile.name)}.txt`,
      "text/plain;charset=utf-8",
    );
    toast.success("Document exported", "Downloaded as a plain-text (.txt) file.");
  }

  if (files.length === 0) {
    return (
      <div className="mx-auto flex max-w-2xl flex-1 flex-col items-center justify-center gap-6 p-6">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-[var(--text-primary)]">Documents</h1>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Open a TXT or DOCX file to view and edit its text — entirely in your browser.
          </p>
        </div>
        <Dropzone />
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col">
      <WorkspaceFileSwitcher
        files={files}
        activeFileId={activeFile?.id ?? null}
        onSelect={setActiveFile}
        acceptExtra=".txt,.docx"
      />

      <div className="flex items-center gap-2 border-b border-[var(--border-subtle)] bg-[var(--surface-0)] px-3 py-2">
        {html && (
          <div className="flex items-center gap-0.5 rounded-lg bg-[var(--surface-2)] p-1">
            <button
              type="button"
              onClick={() => setMode("edit")}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium ${
                mode === "edit"
                  ? "bg-[var(--surface-0)] shadow-sm"
                  : "text-[var(--text-secondary)]"
              }`}
            >
              <Pencil size={13} /> Edit text
            </button>
            <button
              type="button"
              onClick={() => setMode("preview")}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium ${
                mode === "preview"
                  ? "bg-[var(--surface-0)] shadow-sm"
                  : "text-[var(--text-secondary)]"
              }`}
            >
              <Eye size={13} /> Preview formatting
            </button>
          </div>
        )}
        <div className="ml-auto">
          <Button size="sm" leadingIcon={<Download size={14} />} onClick={handleExportTxt}>
            Export as .txt
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        {isLoading && (
          <div className="flex flex-col items-center gap-3 pt-24 text-[var(--text-secondary)]">
            <span className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
            <p className="text-sm">Reading document…</p>
          </div>
        )}
        {error && (
          <div className="mx-auto flex max-w-sm flex-col items-center gap-3 pt-24 text-center">
            <AlertTriangle size={28} className="text-red-500" />
            <p className="text-sm text-[var(--text-secondary)]">{error}</p>
          </div>
        )}
        {!isLoading && !error && mode === "edit" && (
          <textarea
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            spellCheck
            className="mx-auto block h-full w-full max-w-3xl resize-none rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-0)] p-6 font-mono text-sm leading-relaxed text-[var(--text-primary)] outline-none focus:border-brand-500"
            aria-label="Document text editor"
          />
        )}
        {!isLoading && !error && mode === "preview" && html && (
          <div
            className="mx-auto max-w-3xl rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-0)] p-8 leading-relaxed [&_h1]:mb-4 [&_h1]:text-2xl [&_h1]:font-bold [&_h2]:mb-3 [&_h2]:mt-6 [&_h2]:text-xl [&_h2]:font-semibold [&_p]:mb-3"
            // Content is produced locally by mammoth.js from the user's own uploaded file — never fetched remotely.
            dangerouslySetInnerHTML={{ __html: html }}
          />
        )}
      </div>

      {activeFile?.extension === "docx" && (
        <p className="border-t border-[var(--border-subtle)] px-4 py-2 text-center text-xs text-[var(--text-muted)]">
          DOCX formatting is shown in preview. Editing exports plain text; rich .docx export is
          on the roadmap.
        </p>
      )}
    </div>
  );
}
