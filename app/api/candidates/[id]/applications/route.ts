import { mutation } from "@/lib/mutations";
import { addApplication } from "@/features/candidates/service";
export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  return mutation(request, (data, user) => addApplication(id, data, user), 201);
}
