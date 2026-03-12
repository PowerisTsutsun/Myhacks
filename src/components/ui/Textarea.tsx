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
          <label htmlFor={fieldId} className={cn("text-sm font-medium", dark ? "text-white/70" : "text-slate-700")}>
            {label}
            {props.required && <span className="ml-1 text-red-500">*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          id={fieldId}
          className={cn(
            "field-ring w-full resize-y min-h-[100px]",
            dark
              ? "bg-navy-800/80 border border-white/10 text-white placeholder:text-white/30 focus:ring-laser-400"
              : "bg-white text-slate-900 placeholder:text-slate-400",
            error && "border-red-400 focus:ring-red-400",
            className
          )}
          aria-invalid={!!error}
          aria-describedby={error ? `${fieldId}-error` : hint ? `${fieldId}-hint` : undefined}
          {...props}
        />
        {hint && !error && (
          <p id={`${fieldId}-hint`} className={cn("text-xs", dark ? "text-white/40" : "text-slate-500")}>{hint}</p>
        )}
        {error && (
          <p id={`${fieldId}-error`} className="text-xs text-red-400" role="alert">{error}</p>
        )}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";
export { Textarea };
