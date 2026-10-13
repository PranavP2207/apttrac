"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { applicationSchema } from "../validation";
import { postJson } from "@/lib/client-api";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { FormField } from "@/components/shared/form-field";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
export function ApplicationDialog({
  candidateId,
  jobs,
}: {
  candidateId: string;
  jobs: { id: string; title: string }[];
}) {
  const [open, setOpen] = useState(false),
    [error, setError] = useState("");
  const router = useRouter();
  const form = useForm<{ jobId: string }>({
    resolver: zodResolver(applicationSchema),
    defaultValues: { jobId: "" },
  });
  async function save(data: { jobId: string }) {
    setError("");
    try {
      await postJson(`/api/candidates/${candidateId}/applications`, data);
      toast.success("Application added to Applied");
      setOpen(false);
      form.reset();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Please try again.");
    }
  }
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button disabled={!jobs.length}>
          <Plus />
          Add application
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add an application</DialogTitle>
          <DialogDescription>
            Choose an open job. This candidate will enter its Applied stage.
          </DialogDescription>
        </DialogHeader>
        <form
          noValidate
          onSubmit={form.handleSubmit(save)}
          className="space-y-5"
        >
          <FormField
            id="application-job"
            label="Job"
            error={form.formState.errors.jobId?.message}
          >
            <Select
              id="application-job"
              {...form.register("jobId")}
              aria-invalid={!!form.formState.errors.jobId}
              aria-describedby={
                form.formState.errors.jobId
                  ? "application-job-error"
                  : undefined
              }
            >
              <option value="">Choose an open job</option>
              {jobs.map((j) => (
                <option value={j.id} key={j.id}>
                  {j.title}
                </option>
              ))}
            </Select>
          </FormField>
          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Adding…" : "Add application"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
