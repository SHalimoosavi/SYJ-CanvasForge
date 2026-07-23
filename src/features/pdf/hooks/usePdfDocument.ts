import { useEffect, useRef, useState } from "react";
import { getDocument, type PDFDocumentProxy, type PDFDocumentLoadingTask } from "pdfjs-dist";
import { ensurePdfWorkerConfigured } from "@/features/pdf/utils/pdfWorker";

ensurePdfWorkerConfigured();

interface UsePdfDocumentResult {
  document: PDFDocumentProxy | null;
  pageCount: number;
  isLoading: boolean;
  error: string | null;
}

export function usePdfDocument(data: ArrayBuffer | null): UsePdfDocumentResult {
  const [document, setDocument] = useState<PDFDocumentProxy | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const taskRef = useRef<PDFDocumentLoadingTask | null>(null);

  useEffect(() => {
    if (!data) return;
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    // pdf.js may transfer/detach the underlying buffer, so hand it a copy.
    const bytes = new Uint8Array(data.slice(0));

    // Clean up any previously loaded document before starting a new one.
    taskRef.current?.destroy();

    const task = getDocument({ data: bytes });
    taskRef.current = task;

    task.promise
      .then((doc) => {
        if (cancelled) {
          void doc.cleanup();
          return;
        }
        setDocument(doc);
        setPageCount(doc.numPages);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? `Could not open PDF: ${err.message}`
              : "Could not open this PDF. It may be corrupted or password-protected.",
          );
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [data]);

  useEffect(() => {
    return () => {
      taskRef.current?.destroy();
      taskRef.current = null;
    };
  }, []);

  return { document, pageCount, isLoading, error };
}
