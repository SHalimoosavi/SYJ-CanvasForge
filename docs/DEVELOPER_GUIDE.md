# Developer Guide

## Prerequisites

- Node.js 20+ and npm 10+

## Setup

```bash
git clone https://github.com/SHalimoosavi/SYJ-CanvasForge.git
cd SYJ-CanvasForge
npm install
npm run dev
```

## Project conventions

- **TypeScript strict mode** is on. Avoid `any`; if you truly need an escape hatch, prefer `unknown` with a narrowing check.
- **Path alias**: import shared code via `@/...` (maps to `src/`) rather than relative `../../..` chains.
- **Feature-first**: new functionality belongs under `src/features/<domain>/`, with `components/`, `hooks/`, and `utils/` subfolders as needed. Only put something in `src/components/` if it has zero knowledge of a specific feature.
- **Stores**: only add a new Zustand store for state that's genuinely shared across components. Component-local state should stay local (`useState`/`useRef`).
- **Styling**: Tailwind utility classes for layout/spacing/typography; the design-token CSS variables in `src/styles/globals.css` (`--surface-*`, `--text-*`, `--border-*`) for anything that must adapt between light/dark themes.

## Adding a new PDF annotation type

1. Add the type to `PdfTextAnnotation` / a new interface in `src/types/index.ts`.
2. Add store actions (`addXAnnotation`, `removeXAnnotation`) to `src/store/pdfStore.ts`, following the existing `commit()` pattern so it participates in undo/redo automatically.
3. Add interactive creation/rendering in `src/features/pdf/components/PdfPageView.tsx`.
4. Add the corresponding `page.drawX(...)` call in `src/features/pdf/utils/pdfExport.ts` so it's baked into the exported PDF.

## Adding a new image filter

1. Confirm the filter exists in `fabric.filters` (check `node_modules/fabric/dist/src/filters/*.d.ts` for the exact constructor options — the option property names don't always match the class name).
2. Add it to `ImageFilterValues` in `src/types/index.ts` and to `applyFiltersToImage` in `src/features/image/utils/filters.ts`.
3. Add a `Slider` (or toggle) for it in `src/features/image/components/ImagePropertiesPanel.tsx`.

## Testing

```bash
npm run test        # run once
npm run test:watch  # watch mode
```

Tests live alongside the code they cover (`*.test.ts` / `*.test.tsx`), using Vitest + Testing Library. Favor testing:

- Pure utilities (`lib/`, `services/`) — fast, no DOM needed
- Store logic (`store/*.test.ts`) — reset state in `beforeEach`
- Component behavior via Testing Library, querying by role/label rather than test IDs

## Before opening a pull request

```bash
npm run typecheck
npm run lint
npm run format:check
npm run test
npm run build
```

All five must pass. See [CONTRIBUTING.md](../CONTRIBUTING.md) for the full process.
