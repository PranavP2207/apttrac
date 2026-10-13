import { mutation } from "@/lib/mutations";
import { jobLifecycle } from "@/features/jobs/service";
export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  return mutation(request, (data, user) => jobLifecycle(id, data, user));
}
