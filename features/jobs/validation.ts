import { z } from "zod";

export const jobTypes = [
  "FULL_TIME",
  "PART_TIME",
  "CONTRACT",
  "INTERN",
] as const;
export const jobStatuses = ["DRAFT", "OPEN", "ON_HOLD", "CLOSED"] as const;
const money = z
  .string()
  .trim()
  .refine(
    (v) => v === "" || (/^\d+$/.test(v) && Number(v) <= 2_147_483_647),
    "Use a non-negative whole amount below 2,147,483,648",
  );
export function keywords(value: string) {
  return [
    ...new Map(
      value
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .map((s) => [s.toLowerCase(), s]),
    ).values(),
  ];
}
const fields = z
  .object({
    title: z.string().trim().min(3, "Enter a job title").max(150),
    department: z.string().trim().min(1, "Enter a department").max(100),
    location: z.string().trim().min(1, "Enter a location").max(150),
    type: z.enum(jobTypes),
    status: z.enum(jobStatuses),
    salaryMin: money,
    salaryMax: money,
    salaryCurrency: z
      .string()
      .trim()
      .toUpperCase()
      .regex(/^[A-Z]{3}$/, "Use a three-letter currency code"),
    salaryPeriod: z.enum(["YEAR", "MONTH", "HOUR"]),
    description: z
      .string()
      .trim()
      .min(20, "Add a description of at least 20 characters")
      .max(20000),
    requirements: z
      .string()
      .trim()
      .min(10, "Add requirements of at least 10 characters")
      .max(10000),
    matchKeywords: z
      .string()
      .max(3500)
      .refine(
        (v) =>
          keywords(v).length <= 40 && keywords(v).every((s) => s.length <= 80),
        "Use up to 40 keywords, each under 81 characters",
      ),
    memberIds: z.array(z.string().min(1).max(100)).max(30),
  })
  .strict();
function salaryOrder(data: { salaryMin: string; salaryMax: string }) {
  return (
    !data.salaryMin ||
    !data.salaryMax ||
    Number(data.salaryMax) >= Number(data.salaryMin)
  );
}
export const jobSchema = fields.refine(salaryOrder, {
  path: ["salaryMax"],
  message: "Maximum must be at least the minimum",
});
export const jobEditSchema = fields
  .extend({ expectedUpdatedAt: z.string().datetime() })
  .refine(salaryOrder, {
    path: ["salaryMax"],
    message: "Maximum must be at least the minimum",
  });
export const jobLifecycleSchema = z
  .object({
    action: z.enum(["duplicate", "close", "archive", "restore"]),
    expectedUpdatedAt: z.string().datetime(),
  })
  .strict();
export type JobInput = z.infer<typeof jobSchema>;
