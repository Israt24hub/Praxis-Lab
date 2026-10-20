import Link from "next/link";

import { site } from "@/config/site";

/** Mark: a hexagonal frame with a corner line — a lab instrument's dial, from the design board. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden focusable="false">
      <path
        d="M16 2.5 L27.7 9.25 L27.7 22.75 L16 29.5 L4.3 22.75 L4.3 9.25 Z"
        fill="none"
        stroke="var(--dg-ink)"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M13 9.5 V19.5 H20" fill="none" stroke="var(--dg-hl)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Logo() {
  return (
    <Link href="/" className="inline-flex items-center gap-2.5 rounded text-fg">
      <LogoMark className="size-8" />
      <span className="font-display text-[1.4rem] font-medium leading-none tracking-tight">{site.name}</span>
    </Link>
  );
}
