import { mutation } from "@/lib/mutations";
import { bulkTag } from "@/features/candidates/service";
export async function POST(request: Request) {
  return mutation(request, bulkTag);
}
