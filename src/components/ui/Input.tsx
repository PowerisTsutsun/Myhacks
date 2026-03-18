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
            className={cn("text-sm font-medium", dark ? "text-semantic-text-secondary" : "text-semantic-text-secondary")}
          >
            {label}
            {props.required && <span className="ml-1 text-semantic-danger">*</span>}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            "w-full rounded-xl px-3 py-2.5 text-sm transition-colors",
            dark
              ? "field-ring bg-navy-800/85 border-semantic-border text-semantic-text-primary placeholder:text-semantic-text-muted"
              : "field-ring border-semantic-border bg-semantic-background-secondary/75 text-semantic-text-primary placeholder:text-semantic-text-muted",
            error && "border-semantic-danger/70 focus:ring-semantic-danger",
            className
          )}
          aria-invalid={!!error}
          aria-describedby={
            error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined
          }
          {...props}
        />
        {hint && !error && (
          <p id={`${inputId}-hint`} className={cn("text-xs", dark ? "text-semantic-text-muted" : "text-semantic-text-muted")}>
            {hint}
          </p>
        )}
        {error && (
          <p id={`${inputId}-error`} className="text-xs text-semantic-danger" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
export { Input };
