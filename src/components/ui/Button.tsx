import { forwardRef } from "react";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "outline";
type Size = "sm" | "md" | "lg" | "icon";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  isLoading?: boolean;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
}

const VARIANT_CLASSES: Record<Variant, string> = {
  primary:
    "bg-brand-600 text-white hover:bg-brand-700 active:bg-brand-800 disabled:bg-brand-300",
  secondary:
    "bg-[var(--surface-3)] text-[var(--text-primary)] hover:brightness-95 dark:hover:brightness-110",
  ghost: "bg-transparent text-[var(--text-primary)] hover:bg-[var(--surface-2)]",
  outline:
    "bg-transparent border border-[var(--border-strong)] text-[var(--text-primary)] hover:bg-[var(--surface-2)]",
  danger: "bg-red-600 text-white hover:bg-red-700 active:bg-red-800",
};

const SIZE_CLASSES: Record<Size, string> = {
  sm: "h-8 px-3 text-sm gap-1.5",
  md: "h-10 px-4 text-sm gap-2",
  lg: "h-12 px-6 text-base gap-2",
  icon: "h-10 w-10 justify-center p-0",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      leadingIcon,
      trailingIcon,
      children,
      disabled,
      ...props
    },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          "inline-flex items-center rounded-lg font-medium transition-colors duration-150",
          "disabled:cursor-not-allowed disabled:opacity-60",
          "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
          VARIANT_CLASSES[variant],
          SIZE_CLASSES[size],
          className,
        )}
        {...props}
      >
        {isLoading ? (
          <span
            className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
            aria-hidden="true"
          />
        ) : (
          leadingIcon
        )}
        {children}
        {!isLoading && trailingIcon}
      </button>
    );
  },
);

Button.displayName = "Button";
