import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
export default function Loading() {
  return (
    <div aria-busy="true" aria-label="Loading workspace" className="space-y-6">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-4 w-80 max-w-full" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[1, 2, 3, 4].map((id) => (
          <Card key={id} className="space-y-4 p-6">
            <Skeleton className="size-9" />
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-4 w-28" />
          </Card>
        ))}
      </div>
      <Card className="space-y-6 p-6">
        {[1, 2, 3, 4, 5].map((id) => (
          <Skeleton key={id} className="h-14 w-full" />
        ))}
      </Card>
      <span className="sr-only" role="status">
        Loading your workspace
      </span>
    </div>
  );
}
