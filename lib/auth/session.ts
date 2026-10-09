import "server-only";
import { cache } from "react";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { authOptions } from "./options";

export class AccessError extends Error {
  constructor(
    public status: 401 | 403,
    message: string,
  ) {
    super(message);
    this.name = "AccessError";
  }
}

export const getCurrentUser = cache(async () => {
  const session = await getServerSession(authOptions);
  if (!session?.isValid || !session.user.id) return null;
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      role: true,
      isActive: true,
      sessionVersion: true,
    },
  });
  return user?.isActive && user.sessionVersion === session.user.sessionVersion
    ? user
    : null;
});
export type CurrentUser = NonNullable<
  Awaited<ReturnType<typeof getCurrentUser>>
>;

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) throw new AccessError(401, "Sign in to continue");
  return user;
}
export async function requirePageUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}
