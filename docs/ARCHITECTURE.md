# Architecture

## Guiding principles

1. **Client-only.** No file content is ever sent to a server. Every editing operation — rendering, filtering, annotating, exporting — runs in the browser using WebAssembly/JS libraries.
2. **Feature-first.** Code is organized by domain (`pdf`, `image`, `document`, `upload`), not by technical layer. Each feature owns its components, hooks, and utilities.
3. **Thin pages, thick features.** Route-level components in `pages/` mostly wire feature components and stores together; the actual logic lives in `features/`.
4. **Explicit state, no magic.** All cross-component state lives in typed Zustand stores. Component-local state stays local.

## Directory layout

```
src/
  components/
    layout/        AppShell, Navbar
    ui/             Button, IconButton, Slider, Modal — no feature knowledge
    common/         ErrorBoundary, ToastViewport, WorkspaceFileSwitcher
  features/
    upload/         Dropzone, ingestion hook, validation wiring
    pdf/
      components/   Toolbar, thumbnail rail, page view, annotation box, modals
      hooks/         usePdfDocument (pdf.js lifecycle)
      utils/         pdfExport.ts (pdf-lib bake-in), pdfOps.ts (merge/split/extract)
    image/
      components/   Toolbar, canvas stage, properties panel, export dialog
      hooks/         useFabricCanvas, useImageEditorTools, useImageHistory
      utils/         filters.ts, exportImage.ts
    document/
      hooks/         useDocumentText (mammoth.js extraction)
  pages/            HomePage, PdfEditorPage, ImageEditorPage, DocumentEditorPage
  store/            themeStore, toastStore, uploadStore, pdfStore
  services/         fileValidation.ts
  lib/               cn, format, color, download helpers
  types/            Shared cross-feature TypeScript types
```

## Data flow

### Upload

`Dropzone` → `useFileIngest` validates each file (`services/fileValidation.ts`: extension, size, MIME consistency, magic-byte signature) → accepted files are stored as `{ id, data: ArrayBuffer, objectUrl, ... }` in `uploadStore` → the router navigates to the matching editor.

### PDF editing

- `usePdfDocument` loads the raw bytes into a `pdfjs-dist` `PDFDocumentProxy` for **rendering only**.
- All edits (page order, rotation, deletion, annotations, metadata) are tracked separately in `pdfStore`, keyed by file ID, as plain serializable state — never by mutating the pdf.js document.
- `PdfPageView` renders the current page via pdf.js and overlays an interactive annotation layer, converting between screen pixels and true PDF coordinate space using `viewport.convertToPdfPoint` / `convertToViewportPoint` so annotations stay correctly positioned across zoom and rotation.
- **Export** (`pdfExport.ts`) is a pure function: given the original bytes and the current `pdfStore` state, it uses `pdf-lib` to build a brand-new `PDFDocument` — copying pages in the edited order/rotation and drawing every annotation — and returns the final bytes. The pdf.js viewer state and the pdf-lib export state are intentionally decoupled.

### Image editing

- `useFabricCanvas` creates a `fabric.Canvas` bound to a `<canvas>` element and loads the source image as a locked, non-selectable base layer.
- `useImageEditorTools` attaches pointer/keyboard handlers based on the active tool (shape drag-to-draw, click-to-place text, click-sequence polygons, freehand draw/erase) directly against the Fabric canvas — this is deliberately imperative, since Fabric.js owns the canvas's object graph.
- Filters are applied directly to the base image object via `fabric.filters.*` (`features/image/utils/filters.ts`), rebuilding the filter pipeline on every change.
- `useImageHistory` implements undo/redo via `canvas.toObject()` / `canvas.loadFromJSON()` snapshots, called explicitly after each committed user action (not via a blanket object-added listener, to avoid capturing programmatic/load-time mutations).
- **Export** (`exportImage.ts`) renders through Fabric's own rasterizer (`canvas.toCanvasElement()`, which correctly accounts for zoom/viewport) and then hands the resulting native `<canvas>` to the browser's own `toBlob()` encoder — this is what enables WEBP export, since Fabric's built-in `toDataURL()` only supports PNG/JPEG.

### Documents

`useDocumentText` reads `.txt` via `TextDecoder` and `.docx` via `mammoth.js` (both raw-text and HTML conversion, run in parallel). The page offers a plain-text edit mode and a formatted preview mode; export is currently `.txt` only (see Roadmap in the README).

## Why HashRouter

The app uses `HashRouter` instead of `BrowserRouter`. Since the entire app is a static bundle with no server, a `BrowserRouter` would 404 on refresh or direct navigation to `/pdf` on hosts without a rewrite rule (like plain GitHub Pages). Hash-based routing (`/#/pdf`) works everywhere with zero server configuration, which matches the project's "deployable to any static host" requirement.

## State management

Zustand stores are split by concern, not by feature, where the state is genuinely cross-cutting:

- `themeStore` — light/dark theme, persisted to `localStorage`
- `toastStore` — global toast notification queue
- `uploadStore` — all uploaded files across every workspace (PDF/image/document)
- `pdfStore` — per-document PDF edit state with its own undo/redo history, keyed by file ID

Image-editor undo/redo is intentionally **not** in a global store — it's a per-mount hook (`useImageHistory`) scoped to the currently active Fabric canvas instance, since canvas instances themselves are not serializable/shareable state.

## Security

- No `eval()`, no `dangerouslySetInnerHTML` of remote content — the one use of `dangerouslySetInnerHTML` (DOCX preview) renders HTML produced locally by `mammoth.js` from the user's own uploaded file, never fetched from a URL.
- Uploaded files are validated by extension, size (100 MB cap), MIME-type consistency, and magic-byte signature before being accepted.
- All PDF loads pass `ignoreEncryption: true` to `pdf-lib` so a malformed or encrypted file fails gracefully instead of throwing an unhandled error.
