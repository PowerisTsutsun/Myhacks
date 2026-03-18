import { cn } from "@/lib/utils";

type BadgeVariant = "default" | "laser" | "gold" | "green" | "red" | "gray";

const variantClasses: Record<BadgeVariant, string> = {
  default: "bg-semantic-surface text-semantic-text-secondary border border-semantic-border",
  laser: "bg-laser-500/16 text-laser-300 border border-laser-400/40",
  gold: "bg-gold-500/16 text-gold-300 border border-gold-400/35",
  green: "bg-semantic-success/12 text-emerald-200 border border-semantic-success/35",
  red: "bg-semantic-danger/12 text-rose-200 border border-semantic-danger/35",
  gray: "bg-semantic-background-secondary text-semantic-text-muted border border-semantic-border",
};

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
        variantClasses[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
