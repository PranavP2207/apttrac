"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Copy, Archive, RotateCcw, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "./confirm-dialog";
import { postJson } from "@/lib/client-api";
export function RecordActions({
  kind,
  id,
  revision,
  archived,
  closed = false,
}: {
  kind: "job" | "candidate";
  id: string;
  revision: string;
  archived: boolean;
  closed?: boolean;
}) {
  const [pending, setPending] = useState(false);
  const router = useRouter();
  const base = kind === "job" ? "jobs" : "candidates";
  async function act(action: string) {
    setPending(true);
    try {
      const result = await postJson(`/api/${base}/${id}/lifecycle`, {
        action,
        expectedUpdatedAt: revision,
      });
      toast.success(
        action === "duplicate"
          ? "Draft copy created"
          : `${kind === "job" ? "Job" : "Candidate"} ${action === "restore" ? "restored" : action === "archive" ? "archived" : "closed"}`,
      );
      if (action === "duplicate") router.push(`/${base}/${result.id}`);
      else router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Please try again.");
    } finally {
      setPending(false);
    }
  }
  return (
    <>
      {!archived && (
        <Button variant="outline" asChild>
          <Link href={`/${base}/${id}/edit`}>
            <Pencil />
            Edit {kind}
          </Link>
        </Button>
      )}
      {kind === "job" && (
        <Button
          variant="outline"
          disabled={pending}
          onClick={() => act("duplicate")}
        >
          <Copy />
          Duplicate job
        </Button>
      )}
      {kind === "job" && !archived && !closed && (
        <ConfirmDialog
          title="Close this job?"
          description="New applications will stop. Existing applications and history stay available. You can reopen the job by editing its status."
          onConfirm={() => act("close")}
          pending={pending}
        >
          <Button variant="outline" disabled={pending}>
            Close job
          </Button>
        </ConfirmDialog>
      )}
      {archived ? (
        <Button
          variant="outline"
          disabled={pending}
          onClick={() => act("restore")}
        >
          <RotateCcw />
          Restore {kind}
        </Button>
      ) : (
        <ConfirmDialog
          title={`Archive this ${kind}?`}
          description="It will leave active lists. Its history stays available and you can restore it from the archived list."
          onConfirm={() => act("archive")}
          pending={pending}
        >
          <Button variant="outline" disabled={pending}>
            <Archive />
            Archive {kind}
          </Button>
        </ConfirmDialog>
      )}
    </>
  );
}
