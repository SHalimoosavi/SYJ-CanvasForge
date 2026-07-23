import type { ReactNode } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { ToastViewport } from "@/components/common/ToastViewport";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--surface-1)]">
      <a href="#main-content" className="sr-only-focusable">
        Skip to main content
      </a>
      <Navbar />
      <main id="main-content" className="flex flex-1 flex-col">
        <ErrorBoundary>{children}</ErrorBoundary>
      </main>
      <ToastViewport />
    </div>
  );
}
