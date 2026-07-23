# API Overview

SYJ-CanvasForge has no network API — this document describes the internal module "API" (the exported functions/hooks each part of the codebase provides), useful when extending the app.

## `services/fileValidation.ts`

| Export             | Signature                                          | Purpose                                           |
| ------------------ | -------------------------------------------------- | ------------------------------------------------- |
| `getExtension`     | `(fileName: string) => SupportedExtension \| null` | Parses and validates a file extension             |
| `extensionToKind`  | `(ext: SupportedExtension) => WorkspaceKind`       | Maps an extension to `pdf` / `image` / `document` |
| `validateBasics`   | `(file: File) => ValidationResult`                 | Checks size and extension                         |
| `verifyIntegrity`  | `(file: File, ext) => Promise<ValidationResult>`   | Checks magic-byte file signature                  |
| `isMimeConsistent` | `(file: File, ext) => boolean`                     | Flags MIME/extension mismatches                   |

## `features/pdf/utils/pdfExport.ts`

| Export             | Signature                                                                 | Purpose                              |
| ------------------ | ------------------------------------------------------------------------- | ------------------------------------ |
| `buildExportedPdf` | `(originalBytes: ArrayBuffer, state: PdfDocState) => Promise<Uint8Array>` | Produces the final, edited PDF bytes |

## `features/pdf/utils/pdfOps.ts`

| Export             | Signature                                               | Purpose                                    |
| ------------------ | ------------------------------------------------------- | ------------------------------------------ |
| `mergePdfs`        | `(inputs: {name, data}[]) => Promise<Uint8Array>`       | Combines multiple PDFs into one            |
| `splitPdfToPages`  | `(data: ArrayBuffer) => Promise<{pageNumber, bytes}[]>` | Splits into one PDF per page               |
| `extractPageRange` | `(data, from, to) => Promise<Uint8Array>`               | Extracts a page range into a new PDF       |
| `getPageCount`     | `(data: ArrayBuffer) => Promise<number>`                | Reads page count without full editor state |

## `features/image/utils/filters.ts`

| Export                | Signature                                                  | Purpose                                       |
| --------------------- | ---------------------------------------------------------- | --------------------------------------------- |
| `applyFiltersToImage` | `(image: FabricImage, values: ImageFilterValues) => void`  | Rebuilds and applies the filter pipeline      |
| `applySharpen`        | `(image, amount: number, base: ImageFilterValues) => void` | Applies filters plus a blended sharpen kernel |

## `features/image/utils/exportImage.ts`

| Export                | Signature                                                        | Purpose                                                 |
| --------------------- | ---------------------------------------------------------------- | ------------------------------------------------------- |
| `exportCanvasToBlob`  | `(canvas: Canvas, options: ExportImageOptions) => Promise<Blob>` | Rasterizes the canvas to a Blob in the requested format |
| `downloadCanvasImage` | `(canvas, fileName, options) => Promise<void>`                   | Exports and triggers a download                         |

## Stores (`store/`)

Each store is a standard Zustand store (`useXStore`). See [docs/ARCHITECTURE.md](./ARCHITECTURE.md#state-management) for what belongs in each one, and the store source files for the full action list — every action is typed and documented via its parameter names.
