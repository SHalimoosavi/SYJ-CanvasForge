import { CheckCircle2, AlertTriangle, XCircle, Info, X } from "lucide-react";
import { useToastStore } from "@/store/toastStore";
import { cn } from "@/lib/cn";
import type { ToastVariant } from "@/types";

const ICONS: Record<ToastVariant, typeof CheckCircle2> = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

const VARIANT_STYLES: Record<ToastVariant, string> = {
  success: "border-emerald-500/30 text-emerald-500",
  error: "border-red-500/30 text-red-500",
  warning: "border-amber-500/30 text-amber-500",
  info: "border-brand-500/30 text-brand-500",
};

export function ToastViewport() {
  const toasts = useToastStore((state) => state.toasts);
  const dismiss = useToastStore((state) => state.dismiss);

  if (toasts.length === 0) return null;

  return (
    <div
      className="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-full max-w-sm flex-col gap-2"
      role="region"
      aria-label="Notifications"
      aria-live="polite"
    >
      {toasts.map((toast) => {
        const Icon = ICONS[toast.variant];
        return (
          <div
            key={toast.id}
            className={cn(
              "pointer-events-auto flex items-start gap-3 rounded-lg border bg-[var(--surface-0)] p-3 shadow-lg",
              VARIANT_STYLES[toast.variant],
            )}
          >
            <Icon size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-[var(--text-primary)]">{toast.title}</p>
              {toast.description && (
                <p className="mt-0.5 text-xs text-[var(--text-secondary)]">
                  {toast.description}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={() => dismiss(toast.id)}
              aria-label="Dismiss notification"
              className="shrink-0 rounded p-0.5 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
