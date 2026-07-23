import { PDFDocument } from "pdf-lib";

export interface MergeInput {
  name: string;
  data: ArrayBuffer;
}

export async function mergePdfs(inputs: MergeInput[]): Promise<Uint8Array> {
  if (inputs.length < 2) {
    throw new Error("Select at least two PDFs to merge.");
  }
  const outputDoc = await PDFDocument.create();

  for (const input of inputs) {
    const sourceDoc = await PDFDocument.load(input.data, { ignoreEncryption: true });
    const pageIndices = sourceDoc.getPageIndices();
    const pages = await outputDoc.copyPages(sourceDoc, pageIndices);
    pages.forEach((page) => outputDoc.addPage(page));
  }

  outputDoc.setProducer("SYJ-CanvasForge");
  outputDoc.setCreator("SYJ-CanvasForge");
  return outputDoc.save();
}

export interface SplitPageResult {
  pageNumber: number; // 1-indexed
  bytes: Uint8Array;
}

export async function splitPdfToPages(data: ArrayBuffer): Promise<SplitPageResult[]> {
  const sourceDoc = await PDFDocument.load(data, { ignoreEncryption: true });
  const pageCount = sourceDoc.getPageCount();
  const results: SplitPageResult[] = [];

  for (let i = 0; i < pageCount; i += 1) {
    const outputDoc = await PDFDocument.create();
    const [page] = await outputDoc.copyPages(sourceDoc, [i]);
    outputDoc.addPage(page);
    const bytes = await outputDoc.save();
    results.push({ pageNumber: i + 1, bytes });
  }

  return results;
}

/** Extracts a 1-indexed, inclusive page range into a new standalone PDF. */
export async function extractPageRange(
  data: ArrayBuffer,
  fromPage: number,
  toPage: number,
): Promise<Uint8Array> {
  const sourceDoc = await PDFDocument.load(data, { ignoreEncryption: true });
  const pageCount = sourceDoc.getPageCount();
  const from = Math.max(1, Math.min(fromPage, pageCount));
  const to = Math.max(from, Math.min(toPage, pageCount));

  const indices = Array.from({ length: to - from + 1 }, (_, i) => from - 1 + i);
  const outputDoc = await PDFDocument.create();
  const pages = await outputDoc.copyPages(sourceDoc, indices);
  pages.forEach((page) => outputDoc.addPage(page));

  outputDoc.setProducer("SYJ-CanvasForge");
  return outputDoc.save();
}

export async function getPageCount(data: ArrayBuffer): Promise<number> {
  const doc = await PDFDocument.load(data, { ignoreEncryption: true });
  return doc.getPageCount();
}
