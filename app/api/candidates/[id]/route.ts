import { mutation } from "@/lib/mutations";
import { editCandidate } from "@/features/candidates/service";
export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  return mutation(request, (data, user) => editCandidate(id, data, user));
}
