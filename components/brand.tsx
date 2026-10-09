import { Layers3 } from "lucide-react";
import { cn } from "@/lib/utils";
export function Brand({
  compact = false,
  className,
}: {
  compact?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm">
        <Layers3 className="size-5" strokeWidth={2.2} aria-hidden="true" />
      </div>
      <span
        className={cn("text-xl font-bold tracking-tight", compact && "sr-only")}
      >
        Apt<span className="text-primary">TraC</span>
      </span>
    </div>
  );
}
