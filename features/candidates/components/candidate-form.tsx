"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Star } from "lucide-react";
import {
  candidateCreateSchema,
  candidateSources,
  type CandidateInput,
} from "../validation";
import { postJson } from "@/lib/client-api";
import { cn, humanize } from "@/lib/utils";
import { FormField } from "@/components/shared/form-field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export function CandidateForm({
  initial,
  tags,
  jobs,
  id,
  revision,
}: {
  initial: CandidateInput;
  tags: { id: string; name: string }[];
  jobs: { id: string; title: string }[];
  id?: string;
  revision?: string;
}) {
  const form = useForm<CandidateInput>({
    resolver: zodResolver(candidateCreateSchema),
    defaultValues: initial,
  });
  const router = useRouter(),
    [error, setError] = useState("");
  const rating = form.watch("rating");
  const errorProps = (key: keyof CandidateInput) => ({
    "aria-invalid": !!form.formState.errors[key],
    "aria-describedby": form.formState.errors[key] ? `${key}-error` : undefined,
  });
  async function save(data: CandidateInput) {
    setError("");
    const { jobId, ...fields } = data;
    try {
      const result = await postJson(
        id ? `/api/candidates/${id}` : "/api/candidates",
        id ? { ...fields, expectedUpdatedAt: revision } : { ...fields, jobId },
      );
      toast.success(id ? "Candidate updated" : "Candidate added");
      router.push(`/candidates/${result.id}`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Couldn’t save this candidate.",
      );
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
          <CardTitle>Meet your candidate</CardTitle>
          <p className="text-sm text-muted-foreground">
            Start with a name and email. You can fill in the rest later.
          </p>
        </CardHeader>
        <CardContent className="grid gap-5 sm:grid-cols-2">
          {(
            [
              {
                key: "name",
                label: "Full name",
                type: "text",
                placeholder: "e.g. Alex Morgan",
              },
              {
                key: "email",
                label: "Email address",
                type: "email",
                placeholder: "alex@example.com",
              },
              {
                key: "phone",
                label: "Phone",
                type: "tel",
                placeholder: "Optional",
              },
              {
                key: "linkedinUrl",
                label: "LinkedIn URL",
                type: "url",
                placeholder: "https://linkedin.com/in/…",
              },
            ] as const
          ).map(({ key, label, type, placeholder }) => (
            <FormField
              id={key}
              key={key}
              label={label}
              error={form.formState.errors[key]?.message}
            >
              <Input
                id={key}
                type={type}
                placeholder={placeholder}
                {...form.register(key)}
                {...errorProps(key)}
              />
            </FormField>
          ))}
          <FormField id="source" label="Source">
            <Select id="source" {...form.register("source")}>
              {candidateSources.map((v) => (
                <option key={v} value={v}>
                  {humanize(v)}
                </option>
              ))}
            </Select>
          </FormField>
          <FormField
            id="sourceDetails"
            label="Source details"
            error={form.formState.errors.sourceDetails?.message}
          >
            <Input
              id="sourceDetails"
              placeholder="e.g. Referral from Morgan"
              {...form.register("sourceDetails")}
              {...errorProps("sourceDetails")}
            />
          </FormField>
          <div className="sm:col-span-2">
            <FormField
              id="summary"
              label="Summary"
              error={form.formState.errors.summary?.message}
            >
              <Textarea
                id="summary"
                rows={4}
                placeholder="Experience, interests, and anything useful for your team…"
                {...form.register("summary")}
                {...errorProps("summary")}
              />
            </FormField>
          </div>
        </CardContent>
      </Card>
      {!id && (
        <Card>
          <CardHeader>
            <CardTitle>First application</CardTitle>
          </CardHeader>
          <CardContent>
            <FormField
              id="jobId"
              label="Apply to job"
              hint="Optional. An application starts in the job’s Applied stage."
            >
              <Select id="jobId" {...form.register("jobId")}>
                <option value="">No job yet — add a profile only</option>
                {jobs.map((j) => (
                  <option key={j.id} value={j.id}>
                    {j.title}
                  </option>
                ))}
              </Select>
            </FormField>
          </CardContent>
        </Card>
      )}
      <Card>
        <CardHeader>
          <CardTitle>Organize and evaluate</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <fieldset>
            <legend className="mb-3 text-sm font-medium">
              Recruiter rating
            </legend>
            <div className="flex flex-wrap items-center gap-2">
              {[1, 2, 3, 4, 5].map((n) => (
                <label
                  key={n}
                  className={cn(
                    "relative flex size-11 cursor-pointer items-center justify-center rounded-md border",
                    Number(rating) >= n && "bg-amber-50 dark:bg-amber-950/30",
                  )}
                >
                  <input
                    type="radio"
                    value={String(n)}
                    aria-label={`${n} stars`}
                    {...form.register("rating")}
                    className="absolute inset-0 cursor-pointer opacity-0 peer"
                  />
                  <Star
                    className={cn(
                      "size-5 text-muted-foreground peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-primary",
                      Number(rating) >= n && "fill-amber-400 text-amber-500",
                    )}
                  />
                </label>
              ))}
              <label className="ml-2 flex items-center gap-2 text-sm text-muted-foreground">
                <input
                  type="radio"
                  value=""
                  {...form.register("rating")}
                  className="accent-primary"
                />
                Unrated
              </label>
            </div>
          </fieldset>
          <fieldset>
            <legend className="mb-3 text-sm font-medium">Tags</legend>
            <div className="flex flex-wrap gap-4">
              {tags.map((t) => (
                <label
                  key={t.id}
                  className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm"
                >
                  <input
                    type="checkbox"
                    value={t.id}
                    {...form.register("tagIds")}
                    className="size-4 accent-primary"
                  />
                  {t.name}
                </label>
              ))}
              {!tags.length && (
                <p className="text-sm text-muted-foreground">
                  No tags available.
                </p>
              )}
            </div>
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
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting
            ? "Saving…"
            : id
              ? "Save changes"
              : "Add candidate"}
        </Button>
        <Button variant="outline" asChild>
          <Link href={id ? `/candidates/${id}` : "/candidates"}>Cancel</Link>
        </Button>
      </div>
    </form>
  );
}
