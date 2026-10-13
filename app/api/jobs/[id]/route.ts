import { mutation } from "@/lib/mutations";
import { editJob } from "@/features/jobs/service";
export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  return mutation(request, (data, user) => editJob(id, data, user));
}
