import { Badge } from "@/components/ui/badge";
import { humanize } from "@/lib/utils";
export function StatusBadge({ status }: { status: string }) {
  const variant = ["OPEN", "HIRED", "COMPLETED"].includes(status)
    ? "success"
    : ["ON_HOLD", "OFFER"].includes(status)
      ? "warning"
      : ["REJECTED", "CANCELLED"].includes(status)
        ? "destructive"
        : "secondary";
  return (
    <Badge variant={variant}>
      <span className="size-1.5 rounded-full bg-current opacity-70" />
      {humanize(status)}
    </Badge>
  );
}
