import { useState } from "react";
import { FileText, GripVertical } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useUploadStore } from "@/store/uploadStore";
import { mergePdfs } from "@/features/pdf/utils/pdfOps";
import { downloadBytes } from "@/lib/download";
import { toast } from "@/store/toastStore";

export function PdfMergeModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const files = useUploadStore((s) => s.files.filter((f) => f.extension === "pdf"));
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isMerging, setIsMerging] = useState(false);

  function toggle(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  function move(id: string, direction: -1 | 1) {
    setSelectedIds((prev) => {
      const index = prev.indexOf(id);
      const next = index + direction;
      if (next < 0 || next >= prev.length) return prev;
      const copy = [...prev];
      [copy[index], copy[next]] = [copy[next], copy[index]];
      return copy;
    });
  }

  async function handleMerge() {
    const inputs = selectedIds
      .map((id) => files.find((f) => f.id === id))
      .filter((f): f is NonNullable<typeof f> => Boolean(f))
      .map((f) => ({ name: f.name, data: f.data }));

    if (inputs.length < 2) {
      toast.warning("Select at least two PDFs", "Choose two or more files to merge.");
      return;
    }

    setIsMerging(true);
    try {
      const bytes = await mergePdfs(inputs);
      downloadBytes(bytes, "merged.pdf", "application/pdf");
      toast.success("PDFs merged", "merged.pdf has been downloaded.");
      onClose();
    } catch (error) {
      toast.error("Merge failed", error instanceof Error ? error.message : undefined);
    } finally {
      setIsMerging(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Merge PDFs"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleMerge} isLoading={isMerging}>
            Merge & download
          </Button>
        </>
      }
    >
      {files.length < 2 ? (
        <p className="text-sm text-[var(--text-secondary)]">
          Upload two or more PDF files to merge them. Only {files.length} PDF
          {files.length === 1 ? " is" : "s are"} currently open.
        </p>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-[var(--text-secondary)]">
            Select files, then reorder them in the sequence you want them merged.
          </p>
          <ul className="space-y-1.5">
            {files.map((file) => {
              const selected = selectedIds.includes(file.id);
              const position = selectedIds.indexOf(file.id);
              return (
                <li
                  key={file.id}
                  className="flex items-center gap-2 rounded-lg border border-[var(--border-subtle)] p-2"
                >
                  <input
                    type="checkbox"
                    checked={selected}
                    onChange={() => toggle(file.id)}
                    aria-label={`Include ${file.name}`}
                  />
                  <FileText size={16} className="shrink-0 text-[var(--text-muted)]" />
                  <span className="min-w-0 flex-1 truncate text-sm">{file.name}</span>
                  {selected && (
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-[var(--text-muted)]">#{position + 1}</span>
                      <button
                        type="button"
                        aria-label="Move up"
                        onClick={() => move(file.id, -1)}
                        className="rounded p-1 hover:bg-[var(--surface-2)]"
                      >
                        <GripVertical size={14} />
                      </button>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </Modal>
  );
}
