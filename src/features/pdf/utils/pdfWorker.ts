import { GlobalWorkerOptions } from "pdfjs-dist";
// Vite resolves this to a hashed, standalone worker asset URL at build time.
import pdfWorkerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";

let configured = false;

/** Must be called once before any pdf.js `getDocument()` call. */
export function ensurePdfWorkerConfigured(): void {
  if (configured) return;
  GlobalWorkerOptions.workerSrc = pdfWorkerUrl;
  configured = true;
}
