import type { LucideIcon } from "lucide-react";
import { SearchX } from "lucide-react";
export function EmptyState({
  title,
  description,
  icon: Icon = SearchX,
  children,
}: {
  title: string;
  description: string;
  icon?: LucideIcon;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center px-6 py-14 text-center">
      <div className="mb-4 rounded-xl bg-accent p-4 text-primary">
        <Icon className="size-6" aria-hidden="true" />
      </div>
      <h2 className="text-base font-semibold">{title}</h2>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>
      {children && <div className="mt-5">{children}</div>}
    </div>
  );
}
