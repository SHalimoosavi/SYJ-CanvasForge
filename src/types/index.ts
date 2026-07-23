export type WorkspaceKind = "pdf" | "image" | "document";

export type SupportedExtension =
  "pdf" | "png" | "jpg" | "jpeg" | "webp" | "gif" | "svg" | "bmp" | "txt" | "docx";

export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  extension: SupportedExtension;
  mimeType: string;
  kind: WorkspaceKind;
  addedAt: number;
  /** Object URL for previewing the original file. Revoke on removal. */
  objectUrl: string;
  /** Raw bytes, kept for re-processing (page ops, filters, export). */
  data: ArrayBuffer;
}

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export type Theme = "light" | "dark";

export interface PdfPageState {
  index: number;
  rotation: 0 | 90 | 180 | 270;
  deleted: boolean;
}

export interface PdfTextAnnotation {
  id: string;
  pageIndex: number;
  x: number;
  y: number;
  text: string;
  fontSize: number;
  color: string;
  fontFamily: "Helvetica" | "Times-Roman" | "Courier";
  bold: boolean;
  italic: boolean;
}

export interface PdfShapeAnnotation {
  id: string;
  pageIndex: number;
  type: "rectangle" | "circle" | "line";
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  strokeWidth: number;
}

export interface PdfHighlightAnnotation {
  id: string;
  pageIndex: number;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  style: "highlight" | "underline" | "strikeout";
}

export interface PdfMetadata {
  title: string;
  author: string;
  subject: string;
  keywords: string;
  creator: string;
  producer: string;
}

export type ImageFilterKey =
  | "brightness"
  | "contrast"
  | "saturation"
  | "hue"
  | "blur"
  | "grayscale"
  | "sepia"
  | "invert"
  | "noise"
  | "vibrance";

export type ImageFilterValues = Record<ImageFilterKey, number>;

export type ExportImageFormat = "png" | "jpeg" | "webp";

export interface HistoryEntry<T = unknown> {
  id: string;
  label: string;
  timestamp: number;
  snapshot: T;
}

export type ToastVariant = "success" | "error" | "info" | "warning";

export interface ToastMessage {
  id: string;
  variant: ToastVariant;
  title: string;
  description?: string;
}
