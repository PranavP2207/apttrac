import { mutation } from "@/lib/mutations";
import { candidateLifecycle } from "@/features/candidates/service";
export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  return mutation(request, (data, user) => candidateLifecycle(id, data, user));
}
