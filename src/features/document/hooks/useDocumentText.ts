import { useEffect, useState } from "react";
import mammoth from "mammoth";
import type { UploadedFile } from "@/types";

interface UseDocumentTextResult {
  text: string;
  html: string | null;
  isLoading: boolean;
  error: string | null;
}

export function useDocumentText(file: UploadedFile | undefined): UseDocumentTextResult {
  const [text, setText] = useState("");
  const [html, setHtml] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!file) {
      setText("");
      setHtml(null);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setError(null);

    async function run() {
      try {
        if (file!.extension === "txt") {
          const decoded = new TextDecoder("utf-8").decode(file!.data);
          if (!cancelled) {
            setText(decoded);
            setHtml(null);
          }
        } else if (file!.extension === "docx") {
          const [rawResult, htmlResult] = await Promise.all([
            mammoth.extractRawText({ arrayBuffer: file!.data.slice(0) }),
            mammoth.convertToHtml({ arrayBuffer: file!.data.slice(0) }),
          ]);
          if (!cancelled) {
            setText(rawResult.value);
            setHtml(htmlResult.value);
          }
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? `Could not read this document: ${err.message}`
              : "Could not read this document.",
          );
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void run();
    return () => {
      cancelled = true;
    };
  }, [file]);

  return { text, html, isLoading, error };
}
