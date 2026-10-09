import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address"),
  password: z
    .string()
    .min(8, "Use at least 8 characters")
    .max(72, "Password is too long")
    .refine(
      (value) => new TextEncoder().encode(value).length <= 72,
      "Password is too long",
    ),
});
export type LoginInput = z.infer<typeof loginSchema>;

export function safeCallbackUrl(value?: string) {
  return value &&
    /^\/(dashboard|jobs|candidates|interviews|reports|activity|settings)(\/|\?|$)/.test(
      value,
    )
    ? value
    : "/dashboard";
}
