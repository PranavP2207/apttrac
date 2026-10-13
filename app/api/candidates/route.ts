import { mutation } from "@/lib/mutations";
import { createCandidate } from "@/features/candidates/service";
export async function POST(request: Request) {
  return mutation(request, createCandidate, 201);
}
