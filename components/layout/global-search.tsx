"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import { BriefcaseBusiness, Loader2, Search, UserRound } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";

type Results = {
  jobs: { id: string; title: string; department: string }[];
  candidates: { id: string; name: string; email: string }[];
};
export function GlobalSearch() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Results>({ jobs: [], candidates: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((current) => !current);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);
  useEffect(() => {
    if (!open || query.trim().length < 2) {
      setResults({ jobs: [], candidates: [] });
      setLoading(false);
      setError("");
      return;
    }
    const controller = new AbortController();
    setLoading(true);
    setError("");
    const timer = setTimeout(async () => {
      try {
        const response = await fetch(
          `/api/search?q=${encodeURIComponent(query.trim())}`,
          { signal: controller.signal },
        );
        if (!response.ok) throw new Error("Search unavailable");
        setResults(await response.json());
      } catch {
        if (!controller.signal.aborted)
          setError("Search is unavailable. Please try again.");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 250);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [open, query]);
  function navigate(path: string) {
    setOpen(false);
    setQuery("");
    router.push(path);
  }
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Search jobs and candidates"
        className="flex h-10 min-w-0 items-center gap-2.5 rounded-lg border bg-background px-3 text-sm text-muted-foreground transition-colors hover:border-primary/30 md:w-80"
      >
        <Search className="size-4 shrink-0" />
        <span className="hidden truncate md:block">
          Search jobs, candidates…
        </span>
        <kbd className="ml-auto hidden rounded border bg-card px-1.5 py-0.5 text-xs md:block">
          ⌘ K
        </kbd>
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="gap-0 overflow-hidden p-0">
          <DialogTitle className="sr-only">Search your workspace</DialogTitle>
          <DialogDescription className="sr-only">
            Find candidates and jobs. Use arrow keys and Enter to open a result.
          </DialogDescription>
          <Command shouldFilter={false}>
            <div className="flex items-center gap-3 border-b px-4 pr-12">
              <Search className="size-5 text-muted-foreground" />
              <Command.Input
                value={query}
                onValueChange={setQuery}
                placeholder="Search jobs and candidates…"
                aria-label="Search query"
                maxLength={100}
                className="h-14 w-full bg-transparent text-base outline-none focus-visible:ring-0"
              />
            </div>
            <Command.List
              className="max-h-80 overflow-y-auto p-2"
              aria-busy={loading}
            >
              {loading && (
                <div className="flex items-center justify-center gap-2 p-8 text-sm text-muted-foreground">
                  <Loader2 className="size-4 animate-spin" />
                  Searching…
                </div>
              )}
              {error && (
                <p role="alert" className="p-6 text-sm text-destructive">
                  {error}
                </p>
              )}
              {!loading && !error && (
                <Command.Empty className="p-8 text-center text-sm text-muted-foreground">
                  {query.trim().length < 2
                    ? "Type at least 2 characters to search."
                    : "No matches. Try a different name or keyword."}
                </Command.Empty>
              )}
              {!!results.jobs.length && (
                <Command.Group
                  heading="Jobs"
                  className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:text-muted-foreground"
                >
                  {results.jobs.map((job) => (
                    <Command.Item
                      key={job.id}
                      value={job.id}
                      onSelect={() => navigate(`/jobs?highlight=${job.id}`)}
                      className="flex cursor-pointer items-center gap-3 rounded-md px-3 py-3 text-sm data-[selected=true]:bg-accent"
                    >
                      <BriefcaseBusiness className="size-4 text-primary" />
                      <span>
                        {job.title}
                        <span className="ml-2 text-xs text-muted-foreground">
                          {job.department}
                        </span>
                      </span>
                    </Command.Item>
                  ))}
                </Command.Group>
              )}
              {!!results.candidates.length && (
                <Command.Group
                  heading="Candidates"
                  className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:text-muted-foreground"
                >
                  {results.candidates.map((candidate) => (
                    <Command.Item
                      key={candidate.id}
                      value={candidate.id}
                      onSelect={() =>
                        navigate(`/candidates?highlight=${candidate.id}`)
                      }
                      className="flex cursor-pointer items-center gap-3 rounded-md px-3 py-3 text-sm data-[selected=true]:bg-accent"
                    >
                      <UserRound className="size-4 text-primary" />
                      <span>
                        {candidate.name}
                        <span className="block text-xs text-muted-foreground">
                          {candidate.email}
                        </span>
                      </span>
                    </Command.Item>
                  ))}
                </Command.Group>
              )}
            </Command.List>
            <div className="border-t px-4 py-2 text-xs text-muted-foreground">
              ↑ ↓ to navigate · Enter to open · Esc to close
            </div>
          </Command>
        </DialogContent>
      </Dialog>
    </>
  );
}
