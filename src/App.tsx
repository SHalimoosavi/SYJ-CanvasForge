import { Suspense, lazy } from "react";
import { HashRouter, Routes, Route } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import { HomePage } from "@/pages/HomePage";
import { NotFoundPage } from "@/pages/NotFoundPage";

const PdfEditorPage = lazy(() =>
  import("@/pages/PdfEditorPage").then((m) => ({ default: m.PdfEditorPage })),
);
const ImageEditorPage = lazy(() =>
  import("@/pages/ImageEditorPage").then((m) => ({ default: m.ImageEditorPage })),
);
const DocumentEditorPage = lazy(() =>
  import("@/pages/DocumentEditorPage").then((m) => ({ default: m.DocumentEditorPage })),
);

function RouteFallback() {
  return (
    <div className="flex flex-1 items-center justify-center p-16">
      <span
        className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent"
        role="status"
        aria-label="Loading editor"
      />
    </div>
  );
}

export function App() {
  return (
    <HashRouter>
      <AppShell>
        <Suspense fallback={<RouteFallback />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/pdf" element={<PdfEditorPage />} />
            <Route path="/image" element={<ImageEditorPage />} />
            <Route path="/document" element={<DocumentEditorPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </AppShell>
    </HashRouter>
  );
}
