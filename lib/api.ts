import "server-only";
import { NextResponse } from "next/server";
import { AccessError } from "@/lib/auth/session";

export function apiError(error: unknown) {
  if (error instanceof AccessError)
    return NextResponse.json(
      { error: error.message },
      { status: error.status },
    );
  console.error("Request failed", error);
  return NextResponse.json(
    { error: "Something went wrong. Please try again." },
    { status: 500 },
  );
}
