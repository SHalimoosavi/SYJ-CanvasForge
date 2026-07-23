import { forwardRef } from "react";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: ReactNode;
  label: string;
  active?: boolean;
  size?: "sm" | "md";
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon, label, active = false, size = "md", className, ...props }, ref) => {
    return (
      <button
        ref={ref}
        type="button"
        aria-label={label}
        title={label}
        className={cn(
          "inline-flex items-center justify-center rounded-md transition-colors duration-150",
          "text-[var(--text-secondary)] hover:bg-[var(--surface-3)] hover:text-[var(--text-primary)]",
          "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-50",
          size === "sm" ? "h-8 w-8" : "h-10 w-10",
          active &&
            "bg-brand-600/10 text-brand-600 hover:bg-brand-600/15 hover:text-brand-700",
          className,
        )}
        {...props}
      >
        {icon}
      </button>
    );
  },
);

IconButton.displayName = "IconButton";
