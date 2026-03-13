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
          <label htmlFor={fieldId} className={cn("text-sm font-medium", dark ? "text-white/70" : "text-slate-700")}>
            {label}
            {props.required && <span className="ml-1 text-red-500">*</span>}
          </label>
        )}
        <select
          ref={ref}
          id={fieldId}
          className={cn(
            "field-ring w-full appearance-none cursor-pointer",
            dark
              ? "bg-navy-800/80 border border-white/10 text-white focus:ring-laser-400 [&>option]:bg-navy-900 [&>option]:text-white"
              : "bg-white text-slate-900 placeholder:text-slate-400",
            error && "border-red-400 focus:ring-red-400",
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
          <p className="text-xs text-red-600" role="alert">{error}</p>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";
export { Select };
