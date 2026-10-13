import { redirect } from "next/navigation";
import { requirePageUser } from "@/lib/auth/session";
import { candidateOptions } from "@/features/candidates/queries";
import { CandidateForm } from "@/features/candidates/components/candidate-form";
import { PageHeader } from "@/components/shared/page-header";
export default async function NewCandidatePage({
  searchParams,
}: {
  searchParams: Promise<{ jobId?: string }>;
}) {
  const user = await requirePageUser();
  if (user.role === "HIRING_MANAGER") redirect("/access-denied");
  const options = await candidateOptions(),
    params = await searchParams,
    jobs = options.jobs.filter((j) => j.status === "OPEN" && !j.archivedAt);
  return (
    <>
      <PageHeader
        title="Add a candidate"
        description="Keep every promising person in one place."
      />
      <CandidateForm
        tags={options.tags}
        jobs={jobs}
        initial={{
          name: "",
          email: "",
          phone: "",
          linkedinUrl: "",
          source: "MANUAL",
          sourceDetails: "",
          summary: "",
          rating: "",
          tagIds: [],
          jobId: jobs.some((j) => j.id === params.jobId) ? params.jobId! : "",
        }}
      />
    </>
  );
}
