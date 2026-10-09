import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
export function AccessRestricted() {
  return (
    <Card className="mx-auto mt-12 max-w-lg p-10 text-center">
      <ShieldCheck className="mx-auto mb-5 size-10 text-primary" />
      <h1 className="text-2xl font-semibold">Access restricted</h1>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">
        This area is managed by your administrator. Contact them if you need
        access.
      </p>
      <Button asChild className="mt-6">
        <Link href="/dashboard">Back to overview</Link>
      </Button>
    </Card>
  );
}
