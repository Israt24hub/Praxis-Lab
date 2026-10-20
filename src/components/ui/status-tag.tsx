import { Box, Clock, ListChecks, Lock, Play, Unlock } from "lucide-react";

import { cx } from "@/lib/cx";

export type TagKind = "live" | "outline" | "planned" | "free" | "premium" | "3d";

const config: Record<TagKind, { label: string; Icon: typeof Play; className: string }> = {
  live: { label: "Runs in your browser", Icon: Play, className: "border-accent text-accent" },
  outline: { label: "Syllabus published", Icon: ListChecks, className: "border-line-strong text-chalk-muted" },
  planned: { label: "Planned", Icon: Clock, className: "border-line-strong text-chalk-muted border-dashed" },
  free: { label: "Free", Icon: Unlock, className: "border-line-strong text-chalk" },
  premium: { label: "Premium, planned", Icon: Lock, className: "border-line-strong text-chalk-muted border-dashed" },
  "3d": { label: "3D, later phase", Icon: Box, className: "border-line-strong text-chalk-muted border-dashed" },
};

export function StatusTag({ kind, label, className }: { kind: TagKind; label?: string; className?: string }) {
  const { label: defaultLabel, Icon, className: kindClass } = config[kind];
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded border px-2 py-0.5 text-sm",
        kindClass,
        className,
      )}
    >
      <Icon aria-hidden className="size-3.5 shrink-0" strokeWidth={2} />
      {label ?? defaultLabel}
    </span>
  );
}
