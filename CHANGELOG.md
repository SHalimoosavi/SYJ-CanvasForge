# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [0.1.0] — Initial release

### Added

- PDF editor: page viewer with zoom, text/shape/highlight/underline/strikeout annotations, page rotate/delete/restore/duplicate/drag-reorder, merge, split, page-range extraction, metadata editing, undo/redo, and flattened PDF export.
- Image editor: Fabric.js-based canvas with crop, brightness/contrast/saturation/vibrance/hue/blur/noise/sharpen/grayscale/sepia/invert filters, freehand brush and eraser, rectangle/circle/triangle/line/arrow/polygon shapes, rich text, full layer management, and PNG/JPEG/WEBP export with quality and resolution controls.
- Document viewer/editor: DOCX (via mammoth.js) and TXT viewing with an editable text mode and `.txt` export.
- Drag-and-drop, browse, and clipboard-paste file ingestion with size, extension, MIME-consistency, and magic-byte signature validation.
- Light/dark theming, responsive layout, keyboard shortcuts (undo/redo), and an accessible focus/skip-link setup.
- Vitest test suite covering formatting utilities, color conversion, file validation, PDF store logic, and UI components.
- GitHub Actions CI (lint, typecheck, test, build) and automated GitHub Pages deployment workflow.

### Known limitations (tracked on the roadmap)

- DOCX editing exports plain text (`.txt`), not a re-serialized `.docx`.
- Password-protected/encrypted PDFs are not yet supported for editing.
- No PDF signature capture or form-field filling yet.
- UI is English-only; i18n scaffolding is not yet in place.
