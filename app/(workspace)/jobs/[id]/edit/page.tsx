import { notFound, redirect } from "next/navigation";
import { requirePageUser } from "@/lib/auth/session";
import { getJob, jobFormOptions } from "@/features/jobs/queries";
import { JobForm } from "@/features/jobs/components/job-form";
import { PageHeader } from "@/components/shared/page-header";
export default async function EditJobPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requirePageUser();
  if (user.role === "HIRING_MANAGER") redirect("/access-denied");
  const { id } = await params;
  const [job, options] = await Promise.all([getJob(id), jobFormOptions()]);
  if (!job) notFound();
  if (job.archivedAt) redirect(`/jobs/${id}`);
  return (
    <>
      <PageHeader title="Edit job" description={job.title} />
      <JobForm
        id={id}
        revision={job.updatedAt.toISOString()}
        managers={options.managers}
        initial={{
          title: job.title,
          department: job.department,
          location: job.location,
          type: job.type,
          status: job.status,
          salaryMin: job.salaryMin?.toString() || "",
          salaryMax: job.salaryMax?.toString() || "",
          salaryCurrency: job.salaryCurrency,
          salaryPeriod: job.salaryPeriod,
          description: job.description,
          requirements: job.requirements,
          matchKeywords: Array.isArray(job.matchKeywords)
            ? job.matchKeywords.filter((k) => typeof k === "string").join(", ")
            : "",
          memberIds: job.members
            .filter((m) => options.managers.some((u) => u.id === m.userId))
            .map((m) => m.userId),
        }}
      />
    </>
  );
}
