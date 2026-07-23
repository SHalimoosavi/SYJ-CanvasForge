import { saveAs } from "file-saver";

export function downloadBytes(bytes: Uint8Array, fileName: string, mimeType: string): void {
  const blob = new Blob([new Uint8Array(bytes)], { type: mimeType });
  saveAs(blob, fileName);
}

export function downloadBlob(blob: Blob, fileName: string): void {
  saveAs(blob, fileName);
}

export function withoutExtension(fileName: string): string {
  return fileName.replace(/\.[^./]+$/, "");
}
