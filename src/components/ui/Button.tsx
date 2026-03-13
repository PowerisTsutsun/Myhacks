"use client";

import React, { forwardRef } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  asChild?: boolean;
}

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-laser-500 hover:bg-laser-400 active:bg-laser-600 text-white shadow-sm hover:shadow-glow-sm disabled:bg-laser-600/50",
  secondary:
    "bg-navy-700 hover:bg-navy-600 active:bg-navy-600 text-semantic-text-primary shadow-sm border border-semantic-border hover:border-semantic-border-strong disabled:border-semantic-border/60",
  outline:
    "border border-semantic-border-strong text-laser-300 hover:bg-laser-500/12 hover:border-laser-400 hover:text-laser-200",
  ghost:
    "text-semantic-text-secondary hover:bg-white/[0.06] hover:text-semantic-text-primary",
  danger:
    "bg-semantic-danger/90 hover:bg-semantic-danger active:bg-rose-500 text-white shadow-sm disabled:bg-semantic-danger/50",
};

const sizeClasses: Record<Size, string> = {
  sm: "px-3 py-1.5 text-sm rounded-lg",
  md: "px-5 py-2.5 text-sm rounded-xl",
  lg: "px-7 py-3 text-base rounded-xl",
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { variant = "primary", size = "md", loading = false, disabled, asChild = false, className, children, ...props },
    ref
  ) => {
    const composedClass = cn(
      "inline-flex items-center justify-center gap-2 font-semibold transition-all duration-150 cursor-pointer select-none",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-laser-400 focus-visible:ring-offset-2 focus-visible:ring-offset-navy-950",
      "disabled:pointer-events-none disabled:opacity-50",
      variantClasses[variant],
      sizeClasses[size],
      className
    );

    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(
        children as React.ReactElement<{ className?: string }>,
        {
          className: cn(
            composedClass,
            (children as React.ReactElement<{ className?: string }>).props.className
          ),
        }
      );
    }

    return (
      <button ref={ref} disabled={disabled || loading} className={composedClass} {...props}>
        {loading && (
          <svg
            className="animate-spin h-4 w-4 shrink-0"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
export { Button };
