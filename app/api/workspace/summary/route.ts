import { NextResponse } from "next/server";
import { getWorkspaceSnapshot } from "@/features/dashboard/queries";
import { apiError } from "@/lib/api";
export const dynamic = "force-dynamic";
export async function GET() {
  try {
    const snapshot = await getWorkspaceSnapshot();
    return NextResponse.json(
      { jobs: snapshot.jobs, counts: snapshot.counts },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (error) {
    return apiError(error);
  }
}
