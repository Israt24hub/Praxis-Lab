import { Box, CheckCircle2, Clock, FlaskConical, ListChecks, Lock, Play, Unlock } from "lucide-react";

import { cx } from "@/lib/cx";

export type TagKind = "live" | "simulation" | "complete" | "outline" | "planned" | "free" | "premium" | "3d";

/* Status is always carried by an icon and words, never by colour alone. */
const config: Record<TagKind, { label: string; Icon: typeof Play; className: string }> = {
  live: { label: "Runs in your browser", Icon: Play, className: "border-primary text-link" },
  simulation: { label: "Conceptual simulation", Icon: FlaskConical, className: "border-line-strong text-fg-muted" },
  complete: { label: "Complete lesson", Icon: CheckCircle2, className: "border-success text-success" },
  outline: { label: "Outline", Icon: ListChecks, className: "border-line-strong text-fg-muted" },
  planned: { label: "Planned", Icon: Clock, className: "border-line-strong text-fg-muted border-dashed" },
  free: { label: "Free", Icon: Unlock, className: "border-line-strong text-fg" },
  premium: { label: "Premium, planned", Icon: Lock, className: "border-line-strong text-fg-muted border-dashed" },
  "3d": { label: "3D, later phase", Icon: Box, className: "border-line-strong text-fg-muted border-dashed" },
};

export function StatusTag({ kind, label, className }: { kind: TagKind; label?: string; className?: string }) {
  const { label: defaultLabel, Icon, className: kindClass } = config[kind];
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border bg-surface px-2.5 py-0.5 text-sm",
        kindClass,
        className,
      )}
    >
      <Icon aria-hidden className="size-3.5 shrink-0" strokeWidth={2} />
      {label ?? defaultLabel}
    </span>
  );
}
