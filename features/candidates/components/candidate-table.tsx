"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Download, Star } from "lucide-react";
import type { CandidateRow } from "../queries";
import { postJson } from "@/lib/client-api";
import { cn, humanize, initials } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
export function CandidateTable({
  candidates,
  tags,
  editable,
  highlight,
  exportUrl,
}: {
  candidates: CandidateRow[];
  tags: { id: string; name: string }[];
  editable: boolean;
  highlight: string;
  exportUrl: string;
}) {
  const [selected, setSelected] = useState<string[]>([]),
    [tagId, setTagId] = useState(""),
    [pending, setPending] = useState(false);
  const router = useRouter();
  const activeSelection = selected.filter((id) =>
    candidates.some((c) => c.id === id),
  );
  async function tag() {
    setPending(true);
    try {
      const result = await postJson<{ count: number }>("/api/candidates/bulk", {
        action: "tag",
        ids: activeSelection,
        tagId,
      });
      toast.success(
        `Tag added to ${result.count} candidate${result.count === 1 ? "" : "s"}`,
      );
      setSelected([]);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Please try again.");
    } finally {
      setPending(false);
    }
  }
  async function download() {
    try {
      const response = await fetch(
        activeSelection.length
          ? `/api/candidates/export?ids=${activeSelection.join(",")}`
          : exportUrl,
      );
      if (!response.ok) throw new Error((await response.json()).error);
      const url = URL.createObjectURL(await response.blob());
      const a = document.createElement("a");
      a.href = url;
      a.download = "apttrac-candidates.csv";
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Export failed.");
    }
  }
  return (
    <>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        {editable && (
          <>
            <span className="text-sm text-muted-foreground">
              {activeSelection.length} selected on this page
            </span>
            <Select
              aria-label="Bulk tag"
              value={tagId}
              onChange={(e) => setTagId(e.target.value)}
              className="w-auto max-w-full"
            >
              <option value="">Choose a tag…</option>
              {tags.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </Select>
            <Button
              size="sm"
              variant="outline"
              disabled={!activeSelection.length || !tagId || pending}
              onClick={tag}
            >
              {pending ? "Adding…" : "Apply tag"}
            </Button>
          </>
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={download}
          className="sm:ml-auto"
        >
          <Download />
          {activeSelection.length ? "Export selected" : "Export filtered CSV"}
        </Button>
      </div>
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <caption className="sr-only">
              Candidates visible to your role
            </caption>
            <thead className="border-b bg-muted/40 text-xs text-muted-foreground">
              <tr>
                {editable && (
                  <th scope="col" className="p-4">
                    <input
                      type="checkbox"
                      aria-label="Select all candidates on this page"
                      checked={
                        !!candidates.length &&
                        activeSelection.length === candidates.length
                      }
                      onChange={(e) =>
                        setSelected(
                          e.target.checked ? candidates.map((c) => c.id) : [],
                        )
                      }
                      className="size-4 accent-primary"
                    />
                  </th>
                )}
                {["Candidate", "Applications", "Source", "Rating", "Tags"].map(
                  (h) => (
                    <th scope="col" className="px-4 py-4 font-medium" key={h}>
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody className="divide-y">
              {candidates.map((c) => (
                <tr
                  id={c.id}
                  key={c.id}
                  className={cn(
                    "hover:bg-muted/40",
                    highlight === c.id && "bg-accent/60",
                  )}
                >
                  {editable && (
                    <td className="p-4">
                      <input
                        type="checkbox"
                        aria-label={`Select ${c.name}`}
                        checked={activeSelection.includes(c.id)}
                        onChange={(e) =>
                          setSelected(
                            e.target.checked
                              ? [...activeSelection, c.id]
                              : activeSelection.filter((id) => id !== c.id),
                          )
                        }
                        className="size-4 accent-primary"
                      />
                    </td>
                  )}
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="size-9">
                        <AvatarFallback className="text-xs">
                          {initials(c.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-40">
                        <Link
                          href={`/candidates/${c.id}`}
                          data-candidate-link
                          className="font-semibold hover:text-primary hover:underline"
                        >
                          {c.name}
                        </Link>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {c.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="min-w-52 px-4 py-4">
                    <div className="space-y-2">
                      {c.applications.map((a) => (
                        <div key={a.id}>
                          <Link
                            href={`/jobs/${a.job.id}`}
                            className="text-xs font-medium hover:text-primary"
                          >
                            {a.job.title}
                          </Link>
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {a.stage.name}
                            {a.job.archivedAt ? " · Archived job" : ""}
                          </p>
                        </div>
                      ))}
                      {!c.applications.length && (
                        <span className="text-xs text-muted-foreground">
                          No applications yet
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 text-xs text-muted-foreground">
                    {humanize(c.source)}
                  </td>
                  <td className="px-4 py-4">
                    {c.rating ? (
                      <span
                        className="flex items-center gap-1.5 whitespace-nowrap"
                        aria-label={`${c.rating} out of 5 stars`}
                      >
                        <Star
                          className="size-3.5 fill-amber-400 text-amber-400"
                          aria-hidden="true"
                        />
                        {c.rating}
                        <span className="text-xs text-muted-foreground">
                          /5
                        </span>
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        Unrated
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex min-w-28 flex-wrap gap-1.5">
                      {c.tags.map(({ tag }) => (
                        <Badge key={tag.name} variant="secondary">
                          {tag.name}
                        </Badge>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
