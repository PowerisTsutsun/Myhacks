import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
  dark?: boolean;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, placeholder, dark, className, id, ...props }, ref) => {
    const fieldId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={fieldId} className={cn("text-sm font-medium", dark ? "text-semantic-text-secondary" : "text-semantic-text-secondary")}>
            {label}
            {props.required && <span className="ml-1 text-semantic-danger">*</span>}
          </label>
        )}
        <select
          ref={ref}
          id={fieldId}
          className={cn(
            "field-ring w-full appearance-none cursor-pointer",
            dark
              ? "bg-navy-800/85 border-semantic-border text-semantic-text-primary focus:ring-laser-400 [&>option]:bg-navy-900 [&>option]:text-semantic-text-primary"
              : "border-semantic-border bg-semantic-background-secondary/75 text-semantic-text-primary",
            error && "border-semantic-danger/70 focus:ring-semantic-danger",
            className
          )}
          aria-invalid={!!error}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && (
          <p className="text-xs text-semantic-danger" role="alert">{error}</p>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";
export { Select };
