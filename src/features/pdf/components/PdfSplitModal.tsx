import { useState } from "react";
import JSZip from "jszip";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { splitPdfToPages, extractPageRange } from "@/features/pdf/utils/pdfOps";
import { downloadBlob, downloadBytes, withoutExtension } from "@/lib/download";
import { toast } from "@/store/toastStore";

interface PdfSplitModalProps {
  open: boolean;
  onClose: () => void;
  fileName: string;
  data: ArrayBuffer;
  pageCount: number;
}

export function PdfSplitModal({
  open,
  onClose,
  fileName,
  data,
  pageCount,
}: PdfSplitModalProps) {
  const [mode, setMode] = useState<"all" | "range">("all");
  const [fromPage, setFromPage] = useState(1);
  const [toPage, setToPage] = useState(pageCount);
  const [isProcessing, setIsProcessing] = useState(false);

  async function handleSplitAll() {
    setIsProcessing(true);
    try {
      const results = await splitPdfToPages(data);
      const zip = new JSZip();
      results.forEach((result) => {
        zip.file(`${withoutExtension(fileName)}-page-${result.pageNumber}.pdf`, result.bytes);
      });
      const blob = await zip.generateAsync({ type: "blob" });
      downloadBlob(blob, `${withoutExtension(fileName)}-pages.zip`);
      toast.success("PDF split", `${results.length} pages exported as a ZIP.`);
      onClose();
    } catch (error) {
      toast.error("Split failed", error instanceof Error ? error.message : undefined);
    } finally {
      setIsProcessing(false);
    }
  }

  async function handleExtractRange() {
    setIsProcessing(true);
    try {
      const bytes = await extractPageRange(data, fromPage, toPage);
      downloadBytes(
        bytes,
        `${withoutExtension(fileName)}-p${fromPage}-${toPage}.pdf`,
        "application/pdf",
      );
      toast.success("Pages extracted", `Pages ${fromPage}–${toPage} downloaded.`);
      onClose();
    } catch (error) {
      toast.error("Extraction failed", error instanceof Error ? error.message : undefined);
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Split or extract pages"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={mode === "all" ? handleSplitAll : handleExtractRange}
            isLoading={isProcessing}
          >
            {mode === "all" ? "Split all pages" : "Extract range"}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setMode("all")}
            className={`flex-1 rounded-lg border p-3 text-left text-sm ${
              mode === "all"
                ? "border-brand-500 bg-brand-50/60 dark:bg-brand-950/30"
                : "border-[var(--border-subtle)]"
            }`}
          >
            <p className="font-medium">Split every page</p>
            <p className="mt-0.5 text-xs text-[var(--text-secondary)]">
              Download one PDF per page as a ZIP.
            </p>
          </button>
          <button
            type="button"
            onClick={() => setMode("range")}
            className={`flex-1 rounded-lg border p-3 text-left text-sm ${
              mode === "range"
                ? "border-brand-500 bg-brand-50/60 dark:bg-brand-950/30"
                : "border-[var(--border-subtle)]"
            }`}
          >
            <p className="font-medium">Extract a range</p>
            <p className="mt-0.5 text-xs text-[var(--text-secondary)]">
              Pull a page range into one new PDF.
            </p>
          </button>
        </div>

        {mode === "range" && (
          <div className="flex items-center gap-3">
            <label className="flex-1 text-sm">
              From page
              <input
                type="number"
                min={1}
                max={pageCount}
                value={fromPage}
                onChange={(event) => setFromPage(Number(event.target.value))}
                className="mt-1 w-full rounded-md border border-[var(--border-subtle)] bg-transparent px-2 py-1.5"
              />
            </label>
            <label className="flex-1 text-sm">
              To page
              <input
                type="number"
                min={1}
                max={pageCount}
                value={toPage}
                onChange={(event) => setToPage(Number(event.target.value))}
                className="mt-1 w-full rounded-md border border-[var(--border-subtle)] bg-transparent px-2 py-1.5"
              />
            </label>
          </div>
        )}
      </div>
    </Modal>
  );
}
