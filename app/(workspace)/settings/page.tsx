import { Building2, Globe2, ShieldCheck } from "lucide-react";
import { db } from "@/lib/db";
import { requirePageUser } from "@/lib/auth/session";
import { AccessRestricted } from "@/components/shared/access-restricted";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { humanize, initials } from "@/lib/utils";
export default async function SettingsPage() {
  const user = await requirePageUser();
  if (user.role !== "ADMIN") return <AccessRestricted />;
  const [company, users] = await Promise.all([
    db.company.findUniqueOrThrow({ where: { id: "singleton" } }),
    db.user.findMany({
      select: { id: true, name: true, email: true, role: true, isActive: true },
      orderBy: { name: "asc" },
    }),
  ]);
  return (
    <>
      <PageHeader
        title="Settings"
        description="Your company and the people behind your hiring."
      />
      <div className="grid items-start gap-6 xl:grid-cols-[1fr_1.6fr]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="size-4 text-primary" />
              Company profile
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-6 flex size-16 items-center justify-center rounded-xl bg-accent text-xl font-bold text-primary">
              {initials(company.name)}
            </div>
            <h2 className="text-xl font-semibold">{company.name}</h2>
            <dl className="mt-6 space-y-4 text-sm">
              <div>
                <dt className="text-xs text-muted-foreground">Contact email</dt>
                <dd className="mt-1">{company.contactEmail ?? "Not set"}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Timezone</dt>
                <dd className="mt-1 flex items-center gap-1.5">
                  <Globe2 className="size-3.5 text-muted-foreground" />
                  {company.timezone}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">
                  Default currency
                </dt>
                <dd className="mt-1">{company.currency}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="size-4 text-primary" />
              Your team
            </CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              {users.length} people with workspace access.
            </p>
          </CardHeader>
          <CardContent className="divide-y">
            {users.map((member) => (
              <div
                key={member.id}
                className="flex flex-wrap items-center gap-3 py-4 first:pt-0 last:pb-0"
              >
                <Avatar>
                  <AvatarFallback>{initials(member.name)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">{member.name}</p>
                  <p className="mt-1 break-all text-xs text-muted-foreground">
                    {member.email}
                  </p>
                </div>
                <Badge variant={member.isActive ? "secondary" : "destructive"}>
                  {member.isActive ? humanize(member.role) : "Disabled"}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
