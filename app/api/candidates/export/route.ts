import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth/session";
import { candidateScope } from "@/lib/auth/permissions";
import { candidateWhere, candidateSelect } from "@/features/candidates/queries";
import { csv } from "@/lib/csv";
import { apiError } from "@/lib/api";
import { DomainError } from "@/lib/errors";
export async function GET(request: Request) {
  try {
    const user = await requireUser();
    const params = Object.fromEntries(new URL(request.url).searchParams);
    const ids = params.ids ? [...new Set(params.ids.split(","))] : [];
    if (ids.length > 100 || ids.some((id) => !id || id.length > 100))
      throw new DomainError(400, "Select up to 100 candidates.");
    const content = await db.$transaction(async (tx) => {
      if (
        ids.length &&
        (await tx.candidate.count({
          where: { ...candidateScope(user), id: { in: ids } },
        })) !== ids.length
      )
        throw new DomainError(404, "One or more candidates are unavailable.");
      const where = ids.length
        ? { ...candidateScope(user), id: { in: ids } }
        : candidateWhere(params, user);
      if ((await tx.candidate.count({ where })) > 10000)
        throw new DomainError(
          400,
          "Narrow your filters to export up to 10,000 candidates.",
        );
      const rows = await tx.candidate.findMany({
        where,
        select: candidateSelect(user),
        orderBy: [{ name: "asc" }, { id: "asc" }],
      });
      return csv([
        [
          "Name",
          "Email",
          "Source",
          "Rating",
          "Tags",
          "Jobs",
          "Stages",
          "Added (UTC)",
        ],
        ...rows.map((c) => [
          c.name,
          c.email,
          c.source,
          c.rating,
          c.tags.map((t) => t.tag.name).join("; "),
          c.applications.map((a) => a.job.title).join("; "),
          c.applications.map((a) => a.stage.name).join("; "),
          c.createdAt.toISOString(),
        ]),
      ]);
    });
    return new NextResponse(`\uFEFF${content}`, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="apttrac-candidates.csv"',
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    return apiError(error);
  }
}
