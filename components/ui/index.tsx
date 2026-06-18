// components/ui/index.tsx
import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, InputHTMLAttributes, SelectHTMLAttributes, forwardRef, cloneElement, isValidElement } from "react";

// Button
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", loading, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          "inline-flex items-center justify-center gap-2 font-medium rounded-xl transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed",
          {
            "bg-brand-500 hover:bg-brand-400 text-white": variant === "primary",
            "bg-white/8 hover:bg-white/12 text-white border border-white/10": variant === "secondary",
            "bg-red-500/15 hover:bg-red-500/25 text-red-400 border border-red-500/20": variant === "danger",
            "hover:bg-white/5 text-surface-200/60 hover:text-white": variant === "ghost",
          },
          {
            "text-xs px-3 py-1.5": size === "sm",
            "text-sm px-4 py-2.5": size === "md",
            "text-base px-6 py-3": size === "lg",
          },
          className
        )}
        {...props}
      >
        {loading && <div className="w-3.5 h-3.5 border-2 border-current/30 border-t-current rounded-full animate-spin" />}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

// Input
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s/g, "-");
    return (
      <div className="space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-medium text-surface-200/60 uppercase tracking-wider">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            "w-full bg-surface-850 border rounded-xl px-4 py-2.5 text-white text-sm placeholder-surface-200/25 focus:outline-none focus:ring-1 transition-all",
            error
              ? "border-red-500/50 focus:border-red-500 focus:ring-red-500/20"
              : "border-white/8 focus:border-brand-500/50 focus:ring-brand-500/20",
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-red-400">{error}</p>}
        {hint && !error && <p className="text-xs text-surface-200/30">{hint}</p>}
      </div>
    );
  }
);
Input.displayName = "Input";

// Select
interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, children, id, ...props }, ref) => {
    const selectId = id ?? label?.toLowerCase().replace(/\s/g, "-");
    return (
      <div className="space-y-1.5">
        {label && (
          <label htmlFor={selectId} className="block text-xs font-medium text-surface-200/60 uppercase tracking-wider">
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={cn(
            "w-full bg-surface-850 border rounded-xl px-4 py-2.5 pr-10 text-white text-sm focus:outline-none focus:ring-1 transition-all appearance-none select-chevron",
            error
              ? "border-red-500/50 focus:border-red-500 focus:ring-red-500/20"
              : "border-white/8 focus:border-brand-500/50 focus:ring-brand-500/20",
            className
          )}
          {...props}
        >
          {children}
        </select>
        {error && <p className="text-xs text-red-400">{error}</p>}
      </div>
    );
  }
);
Select.displayName = "Select";

// Card
export function Card({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("bg-surface-900 border border-white/5 rounded-2xl", className)}
      {...props}
    >
      {children}
    </div>
  );
}

// Badge
interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "danger" | "brand";
  className?: string;
}

export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium font-mono",
        {
          "bg-white/8 text-surface-200/60": variant === "default",
          "bg-emerald-500/15 text-emerald-400": variant === "success",
          "bg-amber-500/15 text-amber-400": variant === "warning",
          "bg-red-500/15 text-red-400": variant === "danger",
          "bg-brand-500/15 text-brand-400": variant === "brand",
        },
        className
      )}
    >
      {children}
    </span>
  );
}

// Spinner
export function Spinner({ className }: { className?: string }) {
  return (
    <div className={cn("w-5 h-5 border-2 border-white/20 border-t-brand-500 rounded-full animate-spin", className)} />
  );
}

// Empty State
export function EmptyState({ icon, title, description, action }: {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {icon && (
        <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/8 flex items-center justify-center mb-4 text-surface-200/30">
          {icon}
        </div>
      )}
      <h3 className="text-white/80 font-medium mb-1">{title}</h3>
      {description && <p className="text-sm text-surface-200/40 max-w-sm mb-4">{description}</p>}
      {action}
    </div>
  );
}

// Stat Card
export function StatCard({ label, value, sub, icon, trend }: {
  label: string;
  value: string;
  sub?: string;
  icon?: React.ReactNode;
  trend?: { value: string; positive: boolean };
}) {
  return (
    <Card className="relative group overflow-hidden p-5 card-glow transition-all">
      <div className="absolute -right-4 -top-4 p-4 opacity-5 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none text-white z-0">
        {isValidElement(icon) ? cloneElement(icon, { size: 72 } as any) : icon}
      </div>
      <div className="flex items-start justify-between mb-3 z-10 relative">
        <span className="text-xs font-medium text-surface-200/40 uppercase tracking-wider font-mono">{label}</span>
        {/* {icon && (
          <div className="w-8 h-8 rounded-lg bg-brand-500/10 border border-brand-500/15 flex items-center justify-center text-brand-400 z-10">
            {icon}
          </div>
        )} */}
      </div>
      <div className="text-xl font-semibold text-white mb-1 z-10 relative">{value}</div>
      <div className="flex items-center gap-2 z-10 relative">
        {sub && <span className="text-xs text-surface-200/30">{sub}</span>}
        {trend && (
          <span className={cn("text-xs font-mono", trend.positive ? "text-emerald-400" : "text-red-400")}>
            {trend.positive ? "+" : ""}{trend.value}
          </span>
        )}
      </div>
    </Card>
  );
}

// Page Header
export function PageHeader({ title, subtitle, action }: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <h1 className="font-display text-2xl text-white">{title}</h1>
        {subtitle && <p className="text-sm text-surface-200/40 mt-0.5">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

// Loading skeleton
export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("bg-white/5 animate-pulse rounded-lg", className)} />;
}
