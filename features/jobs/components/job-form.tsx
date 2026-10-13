"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { jobSchema, jobStatuses, jobTypes, type JobInput } from "../validation";
import { postJson } from "@/lib/client-api";
import { humanize } from "@/lib/utils";
import { FormField } from "@/components/shared/form-field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export function JobForm({
  initial,
  managers,
  id,
  revision,
}: {
  initial: JobInput;
  managers: { id: string; name: string }[];
  id?: string;
  revision?: string;
}) {
  const form = useForm<JobInput>({
    resolver: zodResolver(jobSchema),
    defaultValues: initial,
  });
  const router = useRouter();
  const [error, setError] = useState("");
  const errorProps = (key: keyof JobInput) => ({
    "aria-invalid": !!form.formState.errors[key],
    "aria-describedby": form.formState.errors[key] ? `${key}-error` : undefined,
  });
  async function save(data: JobInput) {
    setError("");
    try {
      const result = await postJson(id ? `/api/jobs/${id}` : "/api/jobs", {
        ...data,
        ...(id ? { expectedUpdatedAt: revision } : {}),
      });
      toast.success(id ? "Job updated" : "Job created");
      router.push(`/jobs/${result.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn’t save this job.");
    }
  }
  return (
    <form
      noValidate
      onSubmit={form.handleSubmit(save)}
      className="max-w-4xl space-y-6"
    >
      <Card>
        <CardHeader>
          <CardTitle>Role essentials</CardTitle>
          <p className="text-sm text-muted-foreground">
            Give candidates a clear picture of the opportunity.
          </p>
        </CardHeader>
        <CardContent className="grid gap-5 sm:grid-cols-2">
          {(
            [
              {
                key: "title",
                label: "Job title",
                placeholder: "e.g. Senior Product Designer",
              },
              {
                key: "department",
                label: "Department",
                placeholder: "e.g. Design",
              },
              {
                key: "location",
                label: "Location",
                placeholder: "e.g. Bengaluru · Hybrid",
              },
            ] as const
          ).map(({ key, label, placeholder }) => (
            <FormField
              key={key}
              id={key}
              label={label}
              error={form.formState.errors[key]?.message}
            >
              <Input
                id={key}
                placeholder={placeholder}
                {...form.register(key)}
                {...errorProps(key)}
              />
            </FormField>
          ))}
          <FormField id="type" label="Employment type">
            <Select id="type" {...form.register("type")}>
              {jobTypes.map((v) => (
                <option key={v} value={v}>
                  {humanize(v)}
                </option>
              ))}
            </Select>
          </FormField>
          <FormField id="status" label="Status">
            <Select id="status" {...form.register("status")}>
              {jobStatuses.map((v) => (
                <option key={v} value={v}>
                  {humanize(v)}
                </option>
              ))}
            </Select>
          </FormField>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Compensation</CardTitle>
          <p className="text-sm text-muted-foreground">
            Optional range, in whole currency units.
          </p>
        </CardHeader>
        <CardContent className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {(["salaryMin", "salaryMax"] as const).map((key) => (
            <FormField
              id={key}
              key={key}
              label={key === "salaryMin" ? "Salary minimum" : "Salary maximum"}
              error={form.formState.errors[key]?.message}
            >
              <Input
                id={key}
                inputMode="numeric"
                placeholder="Optional"
                {...form.register(key)}
                {...errorProps(key)}
              />
            </FormField>
          ))}
          <FormField
            id="salaryCurrency"
            label="Salary currency"
            error={form.formState.errors.salaryCurrency?.message}
          >
            <Input
              id="salaryCurrency"
              maxLength={3}
              {...form.register("salaryCurrency")}
              {...errorProps("salaryCurrency")}
            />
          </FormField>
          <FormField id="salaryPeriod" label="Salary period">
            <Select id="salaryPeriod" {...form.register("salaryPeriod")}>
              <option value="YEAR">Per year</option>
              <option value="MONTH">Per month</option>
              <option value="HOUR">Per hour</option>
            </Select>
          </FormField>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>About the opportunity</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {(
            [
              { key: "description", label: "Description", rows: 6 },
              { key: "requirements", label: "Requirements", rows: 5 },
            ] as const
          ).map(({ key, label, rows }) => (
            <FormField
              key={key}
              id={key}
              label={label}
              error={form.formState.errors[key]?.message}
            >
              <Textarea
                id={key}
                rows={rows}
                {...form.register(key)}
                {...errorProps(key)}
              />
            </FormField>
          ))}
          <FormField
            id="matchKeywords"
            label="Matching keywords"
            hint="Comma-separated skills, such as TypeScript, Node.js, communication. Resume matching uses these terms in the next phase."
            error={form.formState.errors.matchKeywords?.message}
          >
            <Input
              id="matchKeywords"
              {...form.register("matchKeywords")}
              {...errorProps("matchKeywords")}
            />
          </FormField>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Hiring team</CardTitle>
          <p className="text-sm text-muted-foreground">
            Assigned hiring managers can view this job and its applicants.
          </p>
        </CardHeader>
        <CardContent>
          <fieldset className="flex flex-wrap gap-5">
            <legend className="sr-only">Hiring managers</legend>
            {managers.map((m) => (
              <label key={m.id} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  value={m.id}
                  {...form.register("memberIds")}
                  className="size-4 accent-primary"
                />
                {m.name}
              </label>
            ))}
            {!managers.length && (
              <p className="text-sm text-muted-foreground">
                No active hiring managers available.
              </p>
            )}
          </fieldset>
        </CardContent>
      </Card>
      {error && (
        <p
          role="alert"
          className="rounded-md bg-destructive/10 p-3 text-sm text-destructive"
        >
          {error}
        </p>
      )}
      <div className="flex gap-3">
        <Button disabled={form.formState.isSubmitting} type="submit">
          {form.formState.isSubmitting
            ? "Saving…"
            : id
              ? "Save changes"
              : "Create job"}
        </Button>
        <Button variant="outline" asChild>
          <Link href={id ? `/jobs/${id}` : "/jobs"}>Cancel</Link>
        </Button>
      </div>
    </form>
  );
}
