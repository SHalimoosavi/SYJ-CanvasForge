# SYJ-CanvasForge

**Professional PDF & Image Editor — Fast, Private, Browser-Based.**

SYJ-CanvasForge is an open-source PDF and image editor that runs entirely in your browser. There's no upload step, no server-side processing, and no account — files never leave your device.

[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)

## Overview

SYJ-CanvasForge combines a page-level PDF editor (annotate, reorganize, merge, split) and a layer-based image editor (crop, filter, draw, compose) in a single, cohesive, offline-capable web app, alongside a lightweight DOCX/TXT viewer.

Everything runs client-side using [pdf.js](https://mozilla.github.io/pdf.js/) and [pdf-lib](https://pdf-lib.js.org/) for PDFs, and [Fabric.js](http://fabricjs.com/) for the image canvas. There is no backend — the app is a static bundle that can be hosted anywhere.

## Features

### PDF Editor

- Render and navigate multi-page PDFs with zoom
- Add, move, and edit text annotations
- Draw rectangles, circles, lines, highlights, underlines, and strikeouts
- Rotate, delete, restore, duplicate, and drag-reorder pages
- Merge multiple PDFs, split a PDF into individual pages, or extract a page range
- Edit document metadata (title, author, subject, keywords)
- Full undo/redo history
- Export a new, flattened PDF with every edit baked in

### Image Editor

- Crop with a live, draggable crop region
- Filters: brightness, contrast, saturation, vibrance, hue, blur, noise, sharpen, grayscale, sepia, invert
- Freehand brush and eraser
- Shapes: rectangle, circle, triangle, line, arrow, polygon
- Rich text with font size, bold, italic, underline, and color
- Full layer management: reorder, duplicate, lock, hide, delete
- Flip, rotate (90° or freeform), and per-object transforms
- Export to PNG, JPEG, or WEBP with adjustable quality, resolution multiplier, and transparency
- Full undo/redo history

### Documents

- Open `.docx` and `.txt` files
- View DOCX with formatting preserved (via [mammoth.js](https://github.com/mwilliamson/mammoth.js))
- Edit the extracted text and export as `.txt`

### Platform

- Drag-and-drop, click-to-browse, and clipboard-paste uploads with size/type/signature validation
- Light and dark themes with a persistent preference
- Fully keyboard-navigable, with visible focus states and `prefers-reduced-motion` support
- Responsive across desktop, tablet, and mobile viewports
- Multiple files open at once, switchable via tabs within each editor

## Architecture

SYJ-CanvasForge uses a **feature-first** structure: each domain (`pdf`, `image`, `document`, `upload`) owns its components, hooks, and utilities, with shared primitives in `components/`, `lib/`, `store/`, and `types/`. See [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) for the full breakdown.

```
src/
  components/     Shared UI primitives, layout, error boundary, toasts
  features/
    pdf/          PDF viewer, annotation tools, page ops, export
    image/        Fabric.js canvas, filters, tools, export
    document/     DOCX/TXT extraction and editing
    upload/       Drag-and-drop / paste ingestion + validation
  pages/          Route-level page components
  store/          Zustand stores (theme, uploads, toasts, pdf document state)
  services/       File validation
  lib/            Formatting, color, download, class-name utilities
  types/          Shared TypeScript types
```

## Tech Stack

React 19 · TypeScript (strict) · Vite · Tailwind CSS v4 · Zustand · React Router · pdf.js · pdf-lib · Fabric.js · mammoth.js · Vitest

## Installation

```bash
git clone https://github.com/SHalimoosavi/SYJ-CanvasForge.git
cd SYJ-CanvasForge
npm install
```

## Development

```bash
npm run dev
```

Opens the app at `http://localhost:5173` with hot module reloading.

## Available Scripts

| Script                 | Description                                    |
| ---------------------- | ---------------------------------------------- |
| `npm run dev`          | Start the dev server                           |
| `npm run build`        | Type-check and build for production            |
| `npm run preview`      | Preview the production build locally           |
| `npm run lint`         | Run ESLint                                     |
| `npm run lint:fix`     | Run ESLint with automatic fixes                |
| `npm run format`       | Format the codebase with Prettier              |
| `npm run format:check` | Check formatting without writing changes       |
| `npm run typecheck`    | Run the TypeScript compiler in check-only mode |
| `npm run test`         | Run the test suite once                        |
| `npm run test:watch`   | Run tests in watch mode                        |

## Build

```bash
npm run build
```

Output is written to `dist/`. The build is fully static — no server runtime is required.

## Deployment

SYJ-CanvasForge deploys to any static host. See [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md) for step-by-step guides for **GitHub Pages** (via the included GitHub Actions workflow) and **Vercel**.

## Contributing

Contributions are welcome. Please read [CONTRIBUTING.md](./CONTRIBUTING.md) before opening a pull request.

## Roadmap

- [ ] PDF password/permission handling for encrypted documents
- [ ] Native `.docx` export (currently exports edited text as `.txt`)
- [ ] PDF form field filling
- [ ] Signature capture (draw / upload / type) for PDFs
- [ ] Internationalization (i18n) of the UI
- [ ] Offline/PWA install support with service-worker caching

Track progress and open items on the [GitHub Issues](https://github.com/SHalimoosavi/SYJ-CanvasForge/issues) board.

## FAQ

**Do my files get uploaded anywhere?**
No. All parsing, editing, and export happens in your browser using WebAssembly/JS libraries. Nothing is sent to a server.

**What's the maximum file size?**
100 MB per file, enforced client-side to keep the browser responsive.

**Does it work offline?**
Once loaded, the app doesn't need a network connection to edit files. A full offline/PWA install is on the roadmap.

**Why does DOCX editing only export `.txt`?**
Re-serializing a `.docx` with full formatting fidelity is a larger effort than raw text extraction. It's tracked on the roadmap.

## License

[MIT](./LICENSE)
