import {
  CircleDot,
  MessageSquare,
  Mail,
  CalendarDays,
  ArrowRight,
} from "lucide-react";
import { formatDate } from "@/lib/dates";
import { humanize } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import type { getCandidate } from "../queries";
type Profile = NonNullable<Awaited<ReturnType<typeof getCandidate>>>;
export function CandidateTimeline({
  candidate,
  timezone,
}: {
  candidate: Profile;
  timezone: string;
}) {
  const events = [
    // Stage history already renders each move; its audit copy remains in the Activity page.
    ...candidate.activities
      .filter(
        (event) =>
          event.action !== "APPLICATION_STAGE_CHANGED" ||
          !candidate.applications.some(
            (a) => a.id === event.applicationId && a.stageHistory.length > 1,
          ),
      )
      .map((a) => ({
        id: `activity-${a.id}`,
        at: a.createdAt,
        title: a.description,
        detail: a.actor?.name || a.actorLabel || "AptTraC",
        body: "",
        icon: CircleDot,
      })),
    ...candidate.applications.flatMap((a) => [
      ...a.stageHistory
        .filter((h) => h.applicationVersion > 0)
        .map((h) => ({
          id: `stage-${h.id}`,
          at: h.changedAt,
          title: `${h.fromStageName || "Applied"} → ${h.toStageName}`,
          detail: `${a.job.title} · ${h.actor?.name || "AptTraC"}`,
          body: h.reason || "",
          icon: ArrowRight,
        })),
      ...a.interviews.map((i) => ({
        id: `interview-${i.id}`,
        at: i.startsAt,
        title: `${i.title} · ${humanize(i.status)}`,
        detail: `${a.job.title} · ${i.interviewer.name} · ${humanize(i.mode)}`,
        body: "",
        icon: CalendarDays,
      })),
      ...a.interviews.flatMap((i) =>
        i.scorecards.map((s) => ({
          id: `feedback-${s.id}`,
          at: s.submittedAt,
          title: "Interview feedback submitted",
          detail: `${a.job.title} · ${s.author.name}`,
          body: s.comments || "",
          icon: MessageSquare,
        })),
      ),
    ]),
    ...candidate.notes.map((n) => ({
      id: `note-${n.id}`,
      at: n.createdAt,
      title: "Internal note",
      detail: `${n.author.name}${n.application ? ` · ${n.application.job.title}` : ""}`,
      body: n.body,
      icon: MessageSquare,
    })),
    ...candidate.emailLogs.map((e) => ({
      id: `email-${e.id}`,
      at: e.createdAt,
      title: e.subject,
      detail: `${humanize(e.status)} email${e.application ? ` · ${e.application.job.title}` : ""}`,
      body: e.body,
      icon: Mail,
    })),
  ].sort((a, b) => b.at.getTime() - a.at.getTime() || a.id.localeCompare(b.id));
  return (
    <Card>
      <CardHeader>
        <CardTitle>Timeline</CardTitle>
        <p className="text-sm text-muted-foreground">
          Activity, applications, and conversations visible to your role.
        </p>
      </CardHeader>
      <CardContent>
        {events.length ? (
          <ol className="space-y-0">
            {events.map((event, index) => (
              <li key={event.id} className="relative flex gap-4 pb-7 last:pb-0">
                {index < events.length - 1 && (
                  <span
                    className="absolute bottom-0 left-[15px] top-8 w-px bg-border"
                    aria-hidden="true"
                  />
                )}
                <span className="relative flex size-8 shrink-0 items-center justify-center rounded-full border bg-background text-primary">
                  <event.icon className="size-4" aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1 pt-1">
                  <div className="flex flex-wrap justify-between gap-2">
                    <p className="break-words text-sm font-medium">
                      {event.title}
                    </p>
                    <time
                      dateTime={event.at.toISOString()}
                      className="text-xs text-muted-foreground"
                    >
                      {formatDate(event.at, timezone, "MMM d, yyyy · h:mm a")}
                    </time>
                  </div>
                  <p className="mt-1 break-words text-xs text-muted-foreground">
                    {event.detail}
                  </p>
                  {event.body && (
                    <p className="mt-3 whitespace-pre-wrap break-words rounded-md bg-muted/50 p-3 text-sm leading-relaxed">
                      {event.body}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ol>
        ) : (
          <p className="text-sm text-muted-foreground">
            No activity visible yet.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
