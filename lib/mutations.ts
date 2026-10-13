import "server-only";
import { NextResponse } from "next/server";
import { requireUser, AccessError, type CurrentUser } from "@/lib/auth/session";
import { assertRole } from "@/lib/auth/permissions";
import { env } from "@/lib/env";
import { apiError } from "@/lib/api";
import { DomainError } from "@/lib/errors";

// Cookie-authenticated writes require the configured app origin, including its port.
export async function mutation(
  request: Request,
  action: (data: unknown, user: CurrentUser) => Promise<unknown>,
  status = 200,
) {
  try {
    const user = await requireUser();
    assertRole(user, ["ADMIN", "RECRUITER"]);
    if (request.headers.get("origin") !== new URL(env.NEXTAUTH_URL).origin)
      throw new AccessError(403, "Open this action in AptTraC and try again.");
    if (!request.headers.get("content-type")?.includes("application/json"))
      throw new DomainError(400, "Send a JSON request.");
    if (Number(request.headers.get("content-length") || 0) > 100_000)
      throw new DomainError(400, "This request is too large.");
    let data: unknown;
    try {
      data = await request.json();
    } catch {
      throw new DomainError(400, "Invalid JSON request.");
    }
    return NextResponse.json(await action(data, user), { status });
  } catch (error) {
    return apiError(error);
  }
}

export function checkRevision(actual: Date, expected: string) {
  if (actual.toISOString() !== expected)
    throw new DomainError(
      409,
      "Someone changed this record. Refresh the page before saving again.",
    );
}
export function nextRevision(previous: Date) {
  return new Date(Math.max(Date.now(), previous.getTime() + 1));
}
