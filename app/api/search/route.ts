import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth/session";
import { candidateScope, jobScope } from "@/lib/auth/permissions";
import { apiError } from "@/lib/api";
export const dynamic = "force-dynamic";
export async function GET(request: NextRequest) {
  try {
    const user = await requireUser();
    const parsed = z
      .string()
      .trim()
      .min(2)
      .max(100)
      .safeParse(request.nextUrl.searchParams.get("q"));
    if (!parsed.success)
      return NextResponse.json(
        { error: "Search needs 2 to 100 characters" },
        { status: 400 },
      );
    const term = parsed.data;
    const [jobs, candidates] = await Promise.all([
      db.job.findMany({
        where: {
          ...jobScope(user),
          archivedAt: null,
          OR: [
            { title: { contains: term } },
            { department: { contains: term } },
            { location: { contains: term } },
          ],
        },
        select: { id: true, title: true, department: true },
        orderBy: [{ title: "asc" }, { id: "asc" }],
        take: 6,
      }),
      db.candidate.findMany({
        where: {
          ...candidateScope(user),
          archivedAt: null,
          OR: [{ name: { contains: term } }, { email: { contains: term } }],
        },
        select: { id: true, name: true, email: true },
        orderBy: [{ name: "asc" }, { id: "asc" }],
        take: 6,
      }),
    ]);
    return NextResponse.json(
      { jobs, candidates },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (error) {
    return apiError(error);
  }
}
