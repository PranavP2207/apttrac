import { redirect } from "next/navigation";
import { requirePageUser } from "@/lib/auth/session";
import { jobFormOptions } from "@/features/jobs/queries";
import { JobForm } from "@/features/jobs/components/job-form";
import { PageHeader } from "@/components/shared/page-header";
export default async function NewJobPage() {
  const user = await requirePageUser();
  if (user.role === "HIRING_MANAGER") redirect("/access-denied");
  const options = await jobFormOptions();
  return (
    <>
      <PageHeader
        title="Create a job"
        description="A great hire starts with a clear opportunity."
      />
      <JobForm
        managers={options.managers}
        initial={{
          title: "",
          department: "",
          location: "",
          type: "FULL_TIME",
          status: "DRAFT",
          salaryMin: "",
          salaryMax: "",
          salaryCurrency: options.currency,
          salaryPeriod: "YEAR",
          description: "",
          requirements: "",
          matchKeywords: "",
          memberIds: [],
        }}
      />
    </>
  );
}
