import { requirePageUser } from "@/lib/auth/session";
import { getWorkspaceSnapshot } from "@/features/dashboard/queries";
import { AppShell } from "@/components/layout/app-shell";
export const dynamic = "force-dynamic";
export default async function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requirePageUser();
  const snapshot = await getWorkspaceSnapshot();
  return (
    <AppShell
      user={user}
      company={snapshot.company}
      counts={snapshot.counts}
      notifications={snapshot.notifications}
    >
      {children}
    </AppShell>
  );
}
