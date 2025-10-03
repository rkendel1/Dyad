import { cn } from "@/lib/utils";
import { CheckCircle2, XCircle, Loader2, AlertCircle } from "lucide-react";

export type BadgeVariant = "success" | "error" | "warning" | "info" | "loading";

interface StatusBadgeProps {
  variant: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

export function StatusBadge({ variant, children, className }: StatusBadgeProps) {
  const variants = {
    success: {
      icon: CheckCircle2,
      className:
        "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    },
    error: {
      icon: XCircle,
      className:
        "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    },
    warning: {
      icon: AlertCircle,
      className:
        "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
    },
    info: {
      icon: AlertCircle,
      className:
        "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    },
    loading: {
      icon: Loader2,
      className:
        "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
    },
  };

  const { icon: Icon, className: variantClass } = variants[variant];

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
        variantClass,
        className
      )}
    >
      <Icon
        className={cn("h-3.5 w-3.5", variant === "loading" && "animate-spin")}
      />
      {children}
    </div>
  );
}
