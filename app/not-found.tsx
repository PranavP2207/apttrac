import Link from "next/link";
import { Button } from "@/components/ui/button";
export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center">
      <p className="text-sm font-medium text-primary">404</p>
      <h1 className="text-2xl font-semibold">Page not found</h1>
      <p className="text-muted-foreground">
        This page may have moved or you may not have access.
      </p>
      <Button asChild>
        <Link href="/dashboard">Back to workspace</Link>
      </Button>
    </div>
  );
}
