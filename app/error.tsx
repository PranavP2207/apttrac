"use client";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("AptTraC page error", error.digest ?? error.name);
  }, [error]);
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="text-2xl font-semibold">We couldn’t load this page</h1>
      <p className="text-muted-foreground">
        Please try again. Your saved data is still there.
      </p>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
