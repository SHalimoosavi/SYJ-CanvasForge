import { Component } from "react";
import type { ErrorInfo, ReactNode } from "react";
import { AlertOctagon } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallbackTitle?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    // Centralized logging hook. Replace with a telemetry sink if desired.
    console.error("[SYJ-CanvasForge] Unhandled UI error:", error, info.componentStack);
  }

  private handleReset = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 p-8 text-center">
        <div className="rounded-full bg-red-500/10 p-3 text-red-500">
          <AlertOctagon size={28} aria-hidden="true" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">
            {this.props.fallbackTitle ?? "Something went wrong"}
          </h2>
          <p className="mt-1 max-w-md text-sm text-[var(--text-secondary)]">
            This part of the editor hit an unexpected error. Your other open files are
            unaffected. You can try again, or reload the file.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={this.handleReset}>
            Try again
          </Button>
          <Button variant="outline" onClick={() => window.location.assign("./")}>
            Back to home
          </Button>
        </div>
      </div>
    );
  }
}
