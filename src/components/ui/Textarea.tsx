import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
  dark?: boolean;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, dark, className, id, ...props }, ref) => {
    const fieldId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={fieldId} className={cn("text-sm font-medium", dark ? "text-semantic-text-secondary" : "text-semantic-text-secondary")}>
            {label}
            {props.required && <span className="ml-1 text-semantic-danger">*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          id={fieldId}
          className={cn(
            "field-ring w-full resize-y min-h-[100px]",
            dark
              ? "bg-navy-800/85 border-semantic-border text-semantic-text-primary placeholder:text-semantic-text-muted focus:ring-laser-400"
              : "border-semantic-border bg-semantic-background-secondary/75 text-semantic-text-primary placeholder:text-semantic-text-muted",
            error && "border-semantic-danger/70 focus:ring-semantic-danger",
            className
          )}
          aria-invalid={!!error}
          aria-describedby={error ? `${fieldId}-error` : hint ? `${fieldId}-hint` : undefined}
          {...props}
        />
        {hint && !error && (
          <p id={`${fieldId}-hint`} className={cn("text-xs", dark ? "text-semantic-text-muted" : "text-semantic-text-muted")}>{hint}</p>
        )}
        {error && (
          <p id={`${fieldId}-error`} className="text-xs text-semantic-danger" role="alert">{error}</p>
        )}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";
export { Textarea };
