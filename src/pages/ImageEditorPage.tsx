import { useEffect, useMemo, useState } from "react";
import type { Canvas, FabricImage } from "fabric";
import { useUploadStore } from "@/store/uploadStore";
import { useCanvasHistory } from "@/features/image/hooks/useImageHistory";
import { ImageToolbar } from "@/features/image/components/ImageToolbar";
import { ImageCanvasStage } from "@/features/image/components/ImageCanvasStage";
import { ImagePropertiesPanel } from "@/features/image/components/ImagePropertiesPanel";
import { ExportDialog } from "@/features/image/components/ExportDialog";
import { Dropzone } from "@/features/upload/components/Dropzone";
import { WorkspaceFileSwitcher } from "@/components/common/WorkspaceFileSwitcher";
import type { ImageEditorTool } from "@/features/image/types";

export function ImageEditorPage() {
  const allFiles = useUploadStore((s) => s.files);
  const files = useMemo(() => allFiles.filter((f) => f.kind === "image"), [allFiles]);
  const activeFileId = useUploadStore((s) => s.activeFileId);
  const setActiveFile = useUploadStore((s) => s.setActiveFile);

  const activeFile =
    files.find((f) => f.id === activeFileId) ?? (files.length > 0 ? files[0] : undefined);

  const [workingImageUrl, setWorkingImageUrl] = useState<string | null>(null);
  const [canvas, setCanvas] = useState<Canvas | null>(null);
  const [baseImage, setBaseImage] = useState<FabricImage | null>(null);
  const [tool, setTool] = useState<ImageEditorTool>("select");
  const [toolColor, setToolColor] = useState("#e11d48");
  const [zoom, setZoom] = useState(1);
  const [exportOpen, setExportOpen] = useState(false);

  const history = useCanvasHistory(canvas);

  useEffect(() => {
    if (activeFile) {
      setWorkingImageUrl(activeFile.objectUrl);
      setCanvas(null);
      setBaseImage(null);
      setZoom(1);
      setTool("select");
    }
  }, [activeFile]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const isMeta = event.ctrlKey || event.metaKey;
      if (isMeta && event.key.toLowerCase() === "z" && !event.shiftKey) {
        event.preventDefault();
        history.undo();
      } else if (
        isMeta &&
        (event.key.toLowerCase() === "y" ||
          (event.shiftKey && event.key.toLowerCase() === "z"))
      ) {
        event.preventDefault();
        history.redo();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [history]);

  if (files.length === 0) {
    return (
      <div className="mx-auto flex max-w-2xl flex-1 flex-col items-center justify-center gap-6 p-6">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-[var(--text-primary)]">Image Editor</h1>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Crop, filter, annotate, and export images — entirely in your browser.
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
        acceptExtra="image/*"
      />

      <ImageToolbar
        tool={tool}
        onToolChange={setTool}
        toolColor={toolColor}
        onToolColorChange={setToolColor}
        zoom={zoom}
        onZoomChange={setZoom}
        canUndo={history.canUndo}
        canRedo={history.canRedo}
        onUndo={history.undo}
        onRedo={history.redo}
        onOpenExport={() => setExportOpen(true)}
      />

      <div className="flex flex-1 overflow-hidden">
        <div className="canvas-checkerboard flex flex-1 items-start justify-center overflow-auto p-10">
          {workingImageUrl && (
            <ImageCanvasStage
              imageUrl={workingImageUrl}
              tool={tool}
              color={toolColor}
              strokeWidth={2}
              fontSize={28}
              brushSize={6}
              zoom={zoom}
              onCanvasReady={(nextCanvas, nextBaseImage) => {
                setCanvas(nextCanvas);
                setBaseImage(nextBaseImage);
              }}
              onObjectCommitted={history.snapshot}
              onCropApplied={(newUrl) => {
                setWorkingImageUrl(newUrl);
                setTool("select");
                history.reset();
              }}
              onExitCropMode={() => setTool("select")}
            />
          )}
        </div>

        <ImagePropertiesPanel
          canvas={canvas}
          baseImage={baseImage}
          onChange={history.snapshot}
        />
      </div>

      {activeFile && (
        <ExportDialog
          open={exportOpen}
          onClose={() => setExportOpen(false)}
          canvas={canvas}
          fileName={activeFile.name}
        />
      )}
    </div>
  );
}
