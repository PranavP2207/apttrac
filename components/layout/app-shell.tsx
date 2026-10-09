"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import * as Dialog from "@radix-ui/react-dialog";
import {
  Activity,
  Bell,
  BriefcaseBusiness,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  Menu,
  Settings2,
  Sparkles,
  UsersRound,
  X,
} from "lucide-react";
import { Brand } from "@/components/brand";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { GlobalSearch } from "./global-search";
import { ProfileMenu } from "./profile-menu";
import { cn, initials } from "@/lib/utils";

type ShellProps = {
  user: { name: string; email: string; role: string };
  company: { name: string };
  counts: { candidates: number; openJobs: number };
  notifications: {
    id: string;
    title: string;
    message: string;
    href: string | null;
    readAt: Date | string | null;
  }[];
  children: React.ReactNode;
};

export function AppShell({
  user,
  company,
  counts,
  notifications,
  children,
}: ShellProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { data: session, status } = useSession();
  const signingOut = useRef(false);
  useEffect(() => {
    try {
      setCollapsed(
        localStorage.getItem("apttrac-sidebar-collapsed") === "true",
      );
    } catch {
      /* Storage may be disabled by the browser. */
    }
  }, []);
  useEffect(() => {
    if (
      status === "authenticated" &&
      !session?.isValid &&
      !signingOut.current
    ) {
      signingOut.current = true;
      void signOut({ callbackUrl: "/login" });
    }
  }, [session, status]);
  function toggleCollapsed() {
    setCollapsed((current) => {
      try {
        localStorage.setItem("apttrac-sidebar-collapsed", String(!current));
      } catch {
        /* Keep the control usable without storage. */
      }
      return !current;
    });
  }
  const navItems = [
    { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
    {
      name: "Jobs",
      href: "/jobs",
      icon: BriefcaseBusiness,
      count: counts.openJobs,
    },
    {
      name: "Candidates",
      href: "/candidates",
      icon: UsersRound,
      count: counts.candidates,
    },
    { name: "Interviews", href: "/interviews", icon: CalendarDays },
    { name: "Activity", href: "/activity", icon: Activity },
  ];
  function navigation(compact: boolean, mobile = false) {
    return (
      <>
        <div
          className={cn(
            "min-h-0 flex-1 overflow-y-auto px-3 pt-6",
            compact && "px-2",
          )}
        >
          <div
            className={cn(
              "mb-7 flex items-center gap-3 rounded-lg border bg-background/60 p-3",
              compact && "justify-center border-0 p-1",
            )}
          >
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-sm font-bold text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-200">
              {initials(company.name)}
            </div>
            {!compact && (
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{company.name}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Hiring workspace
                </p>
              </div>
            )}
          </div>
          {!compact && (
            <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-[.12em] text-muted-foreground">
              Workspace
            </p>
          )}
          <nav
            aria-label={mobile ? "Mobile navigation" : "Main navigation"}
            className="space-y-1.5"
          >
            {navItems.map((item) => {
              const active =
                pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-label={item.name}
                  onClick={() => mobile && setMobileOpen(false)}
                  aria-current={active ? "page" : undefined}
                  title={compact ? item.name : undefined}
                  className={cn(
                    "flex h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                    active &&
                      "bg-accent text-primary hover:bg-accent hover:text-primary",
                    compact && "justify-center px-2",
                  )}
                >
                  <item.icon
                    className="size-[18px] shrink-0"
                    aria-hidden="true"
                  />
                  <span className={compact ? "sr-only" : ""}>{item.name}</span>
                  {item.count !== undefined && !compact && (
                    <span
                      className={cn(
                        "ml-auto rounded-md bg-muted px-1.5 py-0.5 text-[11px] tabular-nums",
                        active && "bg-primary/10 text-primary",
                      )}
                    >
                      {item.count}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
          {user.role === "ADMIN" && (
            <div className="mt-7 border-t pt-5">
              {!compact && (
                <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-[.12em] text-muted-foreground">
                  Manage
                </p>
              )}
              <Link
                href="/settings"
                onClick={() => mobile && setMobileOpen(false)}
                title={compact ? "Settings" : undefined}
                aria-current={
                  pathname.startsWith("/settings") ? "page" : undefined
                }
                className={cn(
                  "flex h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground",
                  pathname.startsWith("/settings") && "bg-accent text-primary",
                  compact && "justify-center px-2",
                )}
              >
                <Settings2 className="size-[18px] shrink-0" />
                <span className={compact ? "sr-only" : ""}>Settings</span>
              </Link>
            </div>
          )}
        </div>
        <div className="shrink-0 p-4">
          {!compact && (
            <div className="rounded-xl bg-accent/60 p-4">
              <Sparkles className="mb-2 size-4 text-primary" />
              <p className="text-xs font-semibold">
                Every conversation counts.
              </p>
              <p className="mt-1.5 text-xs leading-5 text-muted-foreground">
                A thoughtful candidate experience starts with your team.
              </p>
            </div>
          )}
          {!mobile && (
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleCollapsed}
              className="mt-3 w-full text-muted-foreground"
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? <ChevronRight /> : <ChevronLeft />}
            </Button>
          )}
        </div>
      </>
    );
  }
  const unread = notifications.filter(
    (notification) => !notification.readAt,
  ).length;
  return (
    <div className="flex min-h-screen">
      <a
        href="#main-content"
        className="sr-only fixed left-4 top-4 z-[100] rounded-md bg-primary px-4 py-3 text-primary-foreground focus:not-sr-only"
      >
        Skip to main content
      </a>
      <aside
        className={cn(
          "sticky top-0 hidden h-screen shrink-0 flex-col border-r bg-card transition-[width] duration-200 lg:flex",
          collapsed ? "w-[76px]" : "w-60",
        )}
      >
        <div
          className={cn(
            "flex h-20 shrink-0 items-center border-b px-6",
            collapsed && "justify-center px-0",
          )}
        >
          <Link href="/dashboard" aria-label="AptTraC overview">
            <Brand compact={collapsed} />
          </Link>
        </div>
        {navigation(collapsed)}
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-20 shrink-0 items-center justify-between gap-3 border-b bg-card/95 px-4 backdrop-blur-md sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              aria-label="Open navigation"
              onClick={() => setMobileOpen(true)}
            >
              <Menu />
            </Button>
            <GlobalSearch />
          </div>
          <div className="flex shrink-0 items-center gap-1 sm:gap-2">
            <ThemeToggle />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative"
                  aria-label={`Notifications, ${unread} unread`}
                >
                  <Bell />
                  {unread > 0 && (
                    <span className="absolute right-2 top-2 size-2 rounded-full border-2 border-card bg-indigo-500" />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="max-h-96 w-[min(340px,calc(100vw-2rem))] overflow-y-auto"
              >
                <p className="border-b px-3 py-3 text-sm font-semibold">
                  Notifications
                  {unread > 0 && (
                    <span className="ml-2 text-xs font-normal text-muted-foreground">
                      {unread} unread
                    </span>
                  )}
                </p>
                {notifications.length ? (
                  notifications.map((notification) => (
                    <DropdownMenuItem key={notification.id} asChild>
                      <Link
                        href={notification.href ?? "/dashboard"}
                        className="items-start py-3"
                      >
                        <span
                          className={cn(
                            "mt-1.5 size-1.5 shrink-0 rounded-full",
                            notification.readAt ? "bg-muted" : "bg-primary",
                          )}
                        />
                        <span>
                          <span className="block text-sm font-medium">
                            {notification.title}
                          </span>
                          <span className="mt-1 block text-xs leading-5 text-muted-foreground">
                            {notification.message}
                          </span>
                        </span>
                      </Link>
                    </DropdownMenuItem>
                  ))
                ) : (
                  <p className="px-4 py-8 text-center text-sm text-muted-foreground">
                    You’re all caught up.
                  </p>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
            <div className="mx-1 hidden h-7 w-px bg-border sm:block" />
            <ProfileMenu user={user} />
          </div>
        </header>
        <main
          id="main-content"
          tabIndex={-1}
          className="mx-auto w-full max-w-[1600px] flex-1 p-4 pb-10 outline-none sm:p-6 lg:p-8"
        >
          {children}
        </main>
        <footer className="flex flex-wrap items-center justify-between gap-2 px-6 pb-5 text-xs text-muted-foreground">
          <span>AptTraC · {company.name}</span>
          <span>A better way to build your team.</span>
        </footer>
      </div>
      <Dialog.Root open={mobileOpen} onOpenChange={setMobileOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" />
          <Dialog.Content className="fixed inset-y-0 left-0 z-50 flex w-[min(300px,85vw)] flex-col bg-card shadow-xl">
            <Dialog.Title className="sr-only">Navigation</Dialog.Title>
            <Dialog.Description className="sr-only">
              Open a page in your hiring workspace.
            </Dialog.Description>
            <div className="flex h-20 items-center justify-between border-b px-6">
              <Brand />
              <Dialog.Close asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Close navigation"
                >
                  <X />
                </Button>
              </Dialog.Close>
            </div>
            {navigation(false, true)}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
