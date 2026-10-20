import Link from "next/link";

import { site } from "@/config/site";

/** Mark: a box you can see into — a tiny network inside an outlined square. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden focusable="false">
      <rect x="2" y="2" width="28" height="28" rx="6" fill="none" stroke="var(--color-chalk)" strokeWidth="2" />
      <path d="M10 11 L22 16 M10 21 L22 16" stroke="var(--color-chalk-muted)" strokeWidth="1.5" />
      <circle cx="10" cy="11" r="2.6" fill="var(--color-chalk)" />
      <circle cx="10" cy="21" r="2.6" fill="var(--color-chalk)" />
      <circle cx="22" cy="16" r="3.2" fill="var(--color-accent)" />
    </svg>
  );
}

export function Logo() {
  return (
    <Link href="/" className="inline-flex items-center gap-2.5 rounded text-lg font-bold text-chalk">
      <LogoMark className="size-7" />
      <span>{site.name}</span>
    </Link>
  );
}
