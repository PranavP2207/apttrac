import { z } from "zod";
export const candidateSources = [
  "MANUAL",
  "CAREERS",
  "LINKEDIN",
  "REFERRAL",
  "JOB_BOARD",
  "AGENCY",
  "OTHER",
] as const;
export const candidateSchema = z
  .object({
    name: z.string().trim().min(2, "Enter a full name").max(150),
    email: z
      .string()
      .trim()
      .toLowerCase()
      .email("Enter a valid email address")
      .max(254),
    phone: z
      .string()
      .trim()
      .max(30)
      .refine(
        (v) => !v || /^[+\d\s().-]{5,30}$/.test(v),
        "Enter a valid phone number",
      ),
    linkedinUrl: z
      .string()
      .trim()
      .max(500)
      .refine((v) => {
        if (!v) return true;
        try {
          const url = new URL(v);
          return (
            url.protocol === "https:" &&
            !url.username &&
            !url.password &&
            (url.hostname === "linkedin.com" ||
              url.hostname.endsWith(".linkedin.com"))
          );
        } catch {
          return false;
        }
      }, "Use an https://linkedin.com profile URL"),
    source: z.enum(candidateSources),
    sourceDetails: z.string().trim().max(200),
    summary: z.string().trim().max(5000),
    rating: z.enum(["", "1", "2", "3", "4", "5"]),
    tagIds: z.array(z.string().min(1).max(100)).max(20),
  })
  .strict();
export const candidateCreateSchema = candidateSchema.extend({
  jobId: z.string().max(100).default(""),
});
export const candidateEditSchema = candidateSchema.extend({
  expectedUpdatedAt: z.string().datetime(),
});
export const candidateLifecycleSchema = z
  .object({
    action: z.enum(["archive", "restore"]),
    expectedUpdatedAt: z.string().datetime(),
  })
  .strict();
export const applicationSchema = z
  .object({ jobId: z.string().min(1, "Choose an open job").max(100) })
  .strict();
export const bulkTagSchema = z
  .object({
    action: z.literal("tag"),
    ids: z.array(z.string().min(1).max(100)).min(1).max(100),
    tagId: z.string().min(1).max(100),
  })
  .strict();
export type CandidateInput = z.infer<typeof candidateCreateSchema>;
