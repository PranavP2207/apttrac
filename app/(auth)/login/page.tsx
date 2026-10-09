import type { Metadata } from "next";
import { redirect } from "next/navigation";
import {
  ArrowUpRight,
  Check,
  UsersRound,
  BriefcaseBusiness,
} from "lucide-react";
import { getCurrentUser } from "@/lib/auth/session";
import { safeCallbackUrl } from "@/features/auth/validation";
import { LoginForm } from "@/features/auth/components/login-form";
import { Brand } from "@/components/brand";
import { ThemeToggle } from "@/components/shared/theme-toggle";

export const metadata: Metadata = { title: "Sign in" };
export const dynamic = "force-dynamic";
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  if (await getCurrentUser()) redirect("/dashboard");
  const params = await searchParams;
  return (
    <main className="grid min-h-screen lg:grid-cols-[1.04fr_1fr]">
      <section className="relative hidden overflow-hidden bg-[#191943] px-14 py-12 text-white lg:flex lg:flex-col">
        <Brand className="relative z-10 [&>span]:text-white [&>span>span]:text-indigo-300" />
        <div
          aria-hidden="true"
          className="absolute -right-40 -top-48 size-[650px] rounded-full border border-indigo-400/10 bg-indigo-400/[.03]"
        />
        <div
          aria-hidden="true"
          className="absolute -bottom-48 -left-32 size-[550px] rounded-full border border-indigo-400/10 bg-indigo-400/[.03]"
        />
        <div className="relative z-10 my-auto max-w-xl py-16">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 px-3 py-1.5 text-xs text-indigo-200">
            <span className="size-1.5 rounded-full bg-indigo-300" />A little
            less admin. A lot more possibility.
          </span>
          <h1 className="mt-7 text-5xl font-semibold leading-[1.12] tracking-tight text-balance">
            Great teams
            <br />
            start with
            <br />
            <span className="text-indigo-300">great people.</span>
          </h1>
          <p className="mt-6 max-w-sm text-base leading-7 text-indigo-100/65">
            Bring your hiring together. Find the right people, keep
            conversations moving, and make every candidate feel seen.
          </p>
          <div className="mt-10 rounded-2xl border border-white/10 bg-white/[.06] p-5 shadow-lg backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-indigo-400/20 p-2.5">
                  <UsersRound className="size-5 text-indigo-200" />
                </div>
                <div>
                  <p className="text-sm font-medium">
                    A clearer path to your next hire
                  </p>
                  <p className="mt-1 text-xs text-indigo-200/60">
                    One shared workspace for your team
                  </p>
                </div>
              </div>
              <ArrowUpRight className="size-5 text-indigo-200/60" />
            </div>
            <div className="mt-5 flex items-center gap-2 text-xs">
              <span className="rounded-md bg-indigo-400/20 px-3 py-2 text-indigo-100">
                Applied
              </span>
              <span className="text-indigo-200/40">→</span>
              <span className="rounded-md bg-indigo-400/20 px-3 py-2 text-indigo-100">
                Interview
              </span>
              <span className="text-indigo-200/40">→</span>
              <span className="flex items-center gap-1 rounded-md bg-emerald-400/15 px-3 py-2 text-emerald-200">
                <Check className="size-3" />
                Hired
              </span>
            </div>
          </div>
        </div>
        <p className="relative z-10 text-xs text-indigo-200/45">
          Thoughtful hiring. From first hello to welcome aboard.
        </p>
      </section>
      <section className="flex flex-col bg-card px-6 py-6 sm:px-12">
        <div className="flex items-center justify-between lg:justify-end">
          <div className="lg:hidden">
            <Brand />
          </div>
          <ThemeToggle />
        </div>
        <div className="mx-auto my-auto w-full max-w-sm py-16">
          <div className="mb-6 flex size-12 items-center justify-center rounded-xl bg-accent text-primary">
            <BriefcaseBusiness className="size-6" />
          </div>
          <h2 className="text-3xl font-semibold tracking-tight">
            Welcome back
          </h2>
          <p className="mb-8 mt-3 text-base text-muted-foreground">
            Sign in to your hiring workspace.
          </p>
          <LoginForm callbackUrl={safeCallbackUrl(params.callbackUrl)} />
          <p className="mt-8 text-center text-sm text-muted-foreground">
            Need an account? Contact your team administrator.
          </p>
        </div>
        <p className="text-center text-xs text-muted-foreground">
          AptTraC · Made for people who hire people
        </p>
      </section>
    </main>
  );
}
