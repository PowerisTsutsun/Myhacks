import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  dark?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, dark, className, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className={cn("text-sm font-medium", dark ? "text-white/70" : "text-slate-700")}
          >
            {label}
            {props.required && <span className="ml-1 text-red-400">*</span>}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            "w-full rounded-lg px-3 py-2 text-sm transition-colors",
            dark
              ? "bg-navy-800/80 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-laser-400 focus:border-transparent"
              : "field-ring bg-white text-slate-900 placeholder:text-slate-400",
            error && (dark ? "border-red-500/50 focus:ring-red-400" : "border-red-400 focus:ring-red-400"),
            className
          )}
          aria-invalid={!!error}
          aria-describedby={
            error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined
          }
          {...props}
        />
        {hint && !error && (
          <p id={`${inputId}-hint`} className={cn("text-xs", dark ? "text-white/40" : "text-slate-500")}>
            {hint}
          </p>
        )}
        {error && (
          <p id={`${inputId}-error`} className={cn("text-xs", dark ? "text-red-400" : "text-red-600")} role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
export { Input };
