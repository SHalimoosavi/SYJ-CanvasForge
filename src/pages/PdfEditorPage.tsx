import { useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { useUploadStore } from "@/store/uploadStore";
import { usePdfStore } from "@/store/pdfStore";
import { usePdfDocument } from "@/features/pdf/hooks/usePdfDocument";
import { PdfToolbar } from "@/features/pdf/components/PdfToolbar";
import { PdfThumbnailRail } from "@/features/pdf/components/PdfThumbnailRail";
import { PdfPageView } from "@/features/pdf/components/PdfPageView";
import { PdfMergeModal } from "@/features/pdf/components/PdfMergeModal";
import { PdfSplitModal } from "@/features/pdf/components/PdfSplitModal";
import { PdfMetadataModal } from "@/features/pdf/components/PdfMetadataModal";
import { Dropzone } from "@/features/upload/components/Dropzone";
import { WorkspaceFileSwitcher } from "@/components/common/WorkspaceFileSwitcher";
import type { PdfAnnotationTool } from "@/features/pdf/types";
import { buildExportedPdf } from "@/features/pdf/utils/pdfExport";
import { downloadBytes, withoutExtension } from "@/lib/download";
import { toast } from "@/store/toastStore";

export function PdfEditorPage() {
  const files = useUploadStore((s) => s.files.filter((f) => f.extension === "pdf"));
  const activeFileId = useUploadStore((s) => s.activeFileId);
  const setActiveFile = useUploadStore((s) => s.setActiveFile);

  const activeFile =
    files.find((f) => f.id === activeFileId) ?? (files.length > 0 ? files[0] : undefined);

  const { document, pageCount, isLoading, error } = usePdfDocument(activeFile?.data ?? null);

  const initDocument = usePdfStore((s) => s.initDocument);
  const undo = usePdfStore((s) => s.undo);
  const redo = usePdfStore((s) => s.redo);
  const canUndo = usePdfStore((s) => (activeFile ? s.canUndo(activeFile.id) : false));
  const canRedo = usePdfStore((s) => (activeFile ? s.canRedo(activeFile.id) : false));

  const [tool, setTool] = useState<PdfAnnotationTool>("select");
  const [toolColor, setToolColor] = useState("#e11d48");
  const [zoom, setZoom] = useState(1.1);
  const [activePageNumber, setActivePageNumber] = useState(1);
  const [isExporting, setIsExporting] = useState(false);
  const [mergeOpen, setMergeOpen] = useState(false);
  const [splitOpen, setSplitOpen] = useState(false);
  const [metadataOpen, setMetadataOpen] = useState(false);

  const currentPageRotation = usePdfStore((s) => {
    if (!activeFile) return 0;
    const rotations = s.documents[activeFile.id]?.present.rotations;
    return rotations?.[activePageNumber - 1] ?? 0;
  });

  useEffect(() => {
    if (activeFile && pageCount > 0) {
      initDocument(activeFile.id, pageCount, { title: withoutExtension(activeFile.name) });
      setActivePageNumber(1);
    }
  }, [activeFile, pageCount, initDocument]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (!activeFile) return;
      const isMeta = event.ctrlKey || event.metaKey;
      if (isMeta && event.key.toLowerCase() === "z" && !event.shiftKey) {
        event.preventDefault();
        undo(activeFile.id);
      } else if (
        isMeta &&
        (event.key.toLowerCase() === "y" ||
          (event.shiftKey && event.key.toLowerCase() === "z"))
      ) {
        event.preventDefault();
        redo(activeFile.id);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeFile, undo, redo]);

  async function handleExport() {
    if (!activeFile || !document) return;
    const state = usePdfStore.getState().getState(activeFile.id);
    if (!state) return;
    setIsExporting(true);
    try {
      const bytes = await buildExportedPdf(activeFile.data, state);
      downloadBytes(
        bytes,
        `${withoutExtension(activeFile.name)}-edited.pdf`,
        "application/pdf",
      );
      toast.success("PDF exported", "Your edited file has been downloaded.");
    } catch (err) {
      toast.error("Export failed", err instanceof Error ? err.message : undefined);
    } finally {
      setIsExporting(false);
    }
  }

  if (files.length === 0) {
    return (
      <div className="mx-auto flex max-w-2xl flex-1 flex-col items-center justify-center gap-6 p-6">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-[var(--text-primary)]">PDF Editor</h1>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Upload a PDF to view, annotate, reorganize, and export it — entirely in your
            browser.
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
        acceptExtra="application/pdf"
      />

      <PdfToolbar
        tool={tool}
        onToolChange={setTool}
        toolColor={toolColor}
        onToolColorChange={setToolColor}
        zoom={zoom}
        onZoomChange={setZoom}
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={() => activeFile && undo(activeFile.id)}
        onRedo={() => activeFile && redo(activeFile.id)}
        onExport={handleExport}
        onOpenMerge={() => setMergeOpen(true)}
        onOpenSplit={() => setSplitOpen(true)}
        onOpenMetadata={() => setMetadataOpen(true)}
        isExporting={isExporting}
      />

      <div className="flex flex-1 overflow-hidden">
        {document && activeFile && (
          <PdfThumbnailRail
            fileId={activeFile.id}
            document={document}
            activePageNumber={activePageNumber}
            onSelectPage={setActivePageNumber}
          />
        )}

        <div className="canvas-checkerboard flex flex-1 items-start justify-center overflow-auto p-8">
          {isLoading && (
            <div className="flex flex-col items-center gap-3 pt-24 text-[var(--text-secondary)]">
              <span className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
              <p className="text-sm">Loading PDF…</p>
            </div>
          )}
          {error && (
            <div className="flex max-w-sm flex-col items-center gap-3 pt-24 text-center">
              <AlertTriangle size={28} className="text-red-500" />
              <p className="text-sm text-[var(--text-secondary)]">{error}</p>
            </div>
          )}
          {document && activeFile && !isLoading && !error && (
            <PdfPageView
              fileId={activeFile.id}
              document={document}
              pageNumber={activePageNumber}
              scale={zoom}
              rotation={currentPageRotation}
              tool={tool}
              toolColor={toolColor}
              toolStrokeWidth={2}
              toolFontSize={16}
            />
          )}
        </div>
      </div>

      {mergeOpen && <PdfMergeModal open={mergeOpen} onClose={() => setMergeOpen(false)} />}
      {splitOpen && activeFile && (
        <PdfSplitModal
          open={splitOpen}
          onClose={() => setSplitOpen(false)}
          fileName={activeFile.name}
          data={activeFile.data}
          pageCount={pageCount}
        />
      )}
      {metadataOpen && activeFile && (
        <PdfMetadataModal
          open={metadataOpen}
          onClose={() => setMetadataOpen(false)}
          fileId={activeFile.id}
        />
      )}
    </div>
  );
}
