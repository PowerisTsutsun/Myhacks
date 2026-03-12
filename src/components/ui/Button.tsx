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
    "bg-laser-500 hover:bg-laser-600 active:bg-laser-600 text-white shadow-sm hover:shadow-glow-sm",
  secondary:
    "bg-navy-700 hover:bg-navy-600 text-white shadow-sm border border-white/10",
  outline:
    "border border-laser-500/60 text-laser-400 hover:bg-laser-500/10 hover:border-laser-400",
  ghost:
    "text-slate-500 hover:bg-slate-100 hover:text-slate-900",
  danger:
    "bg-red-600 hover:bg-red-700 active:bg-red-700 text-white shadow-sm",
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
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-laser-400 focus-visible:ring-offset-2",
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
