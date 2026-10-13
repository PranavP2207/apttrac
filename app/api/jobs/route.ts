import { mutation } from "@/lib/mutations";
import { createJob } from "@/features/jobs/service";
export async function POST(request: Request) {
  return mutation(request, createJob, 201);
}
