import { Activity as ActivityIcon } from "lucide-react";
import { db } from "@/lib/db";
import { requirePageUser } from "@/lib/auth/session";
import { activityScope } from "@/lib/auth/permissions";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Card } from "@/components/ui/card";
import { formatDate } from "@/lib/dates";
export default async function ActivityPage() {
  const user = await requirePageUser();
  const [company, rows] = await Promise.all([
    db.company.findUniqueOrThrow({ where: { id: "singleton" } }),
    db.activity.findMany({
      where: activityScope(user),
      select: {
        id: true,
        description: true,
        createdAt: true,
        actor: { select: { name: true } },
      },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: 100,
    }),
  ]);
  return (
    <>
      <PageHeader
        title="Activity"
        description="A shared history of your team’s hiring."
      />
      <Card className="overflow-hidden">
        {rows.length ? (
          <ol className="divide-y">
            {rows.map((row) => (
              <li
                key={row.id}
                className="flex items-start gap-4 px-5 py-4 sm:px-6"
              >
                <span className="mt-0.5 rounded-full bg-accent p-2 text-primary">
                  <ActivityIcon className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm leading-6">{row.description}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {row.actor?.name ?? "System"} ·{" "}
                    {formatDate(
                      row.createdAt,
                      company.timezone,
                      "MMM d, yyyy · h:mm a",
                    )}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        ) : (
          <EmptyState
            title="No updates yet"
            description="Hiring activity for your roles will appear here."
            icon={ActivityIcon}
          />
        )}
      </Card>
    </>
  );
}
