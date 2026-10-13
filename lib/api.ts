import "server-only";
import { NextResponse } from "next/server";
import { AccessError } from "@/lib/auth/session";
import { DomainError } from "@/lib/errors";
import { Prisma } from "@prisma/client";
import { ZodError } from "zod";

export function apiError(error: unknown) {
  if (error instanceof AccessError || error instanceof DomainError)
    return NextResponse.json(
      { error: error.message },
      { status: error.status },
    );
  if (error instanceof ZodError)
    return NextResponse.json(
      {
        error: "Check the highlighted fields.",
        fieldErrors: error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  )
    return NextResponse.json(
      {
        error:
          "This record already exists. Check the email or job application.",
      },
      { status: 409 },
    );
  console.error("Request failed", error);
  return NextResponse.json(
    { error: "Something went wrong. Please try again." },
    { status: 500 },
  );
}
