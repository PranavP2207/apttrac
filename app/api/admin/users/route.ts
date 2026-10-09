import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth/session";
import { assertRole } from "@/lib/auth/permissions";
import { apiError } from "@/lib/api";
export const dynamic = "force-dynamic";
export async function GET() {
  try {
    assertRole(await requireUser(), ["ADMIN"]);
    const users = await db.user.findMany({
      select: { id: true, name: true, email: true, role: true, isActive: true },
      orderBy: { name: "asc" },
    });
    return NextResponse.json(
      { users },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (error) {
    return apiError(error);
  }
}
