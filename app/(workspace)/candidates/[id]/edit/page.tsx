import { notFound, redirect } from "next/navigation";
import { requirePageUser } from "@/lib/auth/session";
import { getCandidate, candidateOptions } from "@/features/candidates/queries";
import { CandidateForm } from "@/features/candidates/components/candidate-form";
import type { CandidateInput } from "@/features/candidates/validation";
import { PageHeader } from "@/components/shared/page-header";
export default async function EditCandidatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requirePageUser();
  if (user.role === "HIRING_MANAGER") redirect("/access-denied");
  const { id } = await params;
  const [candidate, options] = await Promise.all([
    getCandidate(id),
    candidateOptions(),
  ]);
  if (!candidate) notFound();
  if (candidate.archivedAt) redirect(`/candidates/${id}`);
  return (
    <>
      <PageHeader title="Edit candidate" description={candidate.name} />
      <CandidateForm
        id={id}
        revision={candidate.updatedAt.toISOString()}
        tags={options.tags}
        jobs={[]}
        initial={{
          name: candidate.name,
          email: candidate.email,
          phone: candidate.phone || "",
          linkedinUrl: candidate.linkedinUrl || "",
          source: candidate.source,
          sourceDetails: candidate.sourceDetails || "",
          summary: candidate.summary || "",
          rating: (candidate.rating?.toString() ||
            "") as CandidateInput["rating"],
          tagIds: candidate.tags.map((t) => t.tagId),
          jobId: "",
        }}
      />
    </>
  );
}
