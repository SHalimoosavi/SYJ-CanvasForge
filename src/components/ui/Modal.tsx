import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { IconButton } from "@/components/ui/IconButton";
import { cn } from "@/lib/cn";

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}

export function Modal({ open, onClose, title, children, footer, className }: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    dialogRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      previouslyFocused?.focus();
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        tabIndex={-1}
        className={cn(
          "w-full max-w-lg rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-0)] shadow-2xl outline-none",
          className,
        )}
      >
        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] px-5 py-4">
          <h2 id="modal-title" className="text-base font-semibold text-[var(--text-primary)]">
            {title}
          </h2>
          <IconButton
            icon={<X size={18} />}
            label="Close dialog"
            onClick={onClose}
            size="sm"
          />
        </div>
        <div className="max-h-[70vh] overflow-y-auto px-5 py-4">{children}</div>
        {footer && (
          <div className="flex justify-end gap-2 border-t border-[var(--border-subtle)] px-5 py-3">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
