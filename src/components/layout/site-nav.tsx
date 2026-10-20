"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { mainNav } from "@/config/site";
import { cx } from "@/lib/cx";

function isActive(pathname: string | null, href: string) {
  if (!pathname) return false;
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

const linkBase =
  "rounded px-3 py-2 text-[0.975rem] transition-colors duration-150 hover:text-chalk";

/** Desktop links without an active state — used while the pathname is unknown. */
export function StaticNavLinks() {
  return (
    <ul className="hidden items-center gap-1 lg:flex">
      {mainNav.map((item) => (
        <li key={item.href}>
          <Link href={item.href} className={cx(linkBase, "text-chalk-muted")}>
            {item.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function SiteNav() {
  const pathname = usePathname();
  // The menu is open only for the page it was opened on, so navigating closes it.
  const [openOn, setOpenOn] = useState<string | null>(null);
  const open = openOn !== null && openOn === pathname;

  return (
    <div
      onKeyDown={(event) => {
        if (event.key === "Escape" && open) setOpenOn(null);
      }}
    >
      <ul className="hidden items-center gap-1 lg:flex">
        {mainNav.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cx(
                  linkBase,
                  active
                    ? "text-chalk underline decoration-accent decoration-2 underline-offset-[10px]"
                    : "text-chalk-muted",
                )}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>

      <button
        type="button"
        className="inline-flex items-center gap-2 rounded-control border border-line-strong px-3 py-2 text-chalk lg:hidden"
        aria-expanded={open}
        aria-controls="mobile-menu"
        onClick={() => setOpenOn(open ? null : pathname)}
      >
        {open ? <X aria-hidden className="size-5" /> : <Menu aria-hidden className="size-5" />}
        Menu
      </button>

      {open ? (
        <div
          id="mobile-menu"
          className="absolute inset-x-0 top-full border-b border-line bg-board-deep lg:hidden"
        >
          <ul className="mx-auto flex max-w-page flex-col px-5 py-3 sm:px-8">
            {mainNav.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cx(
                      "flex items-center justify-between border-b border-line py-3.5 text-lg last:border-b-0",
                      active ? "font-bold text-chalk" : "text-chalk-muted",
                    )}
                    onClick={() => setOpenOn(null)}
                  >
                    {item.label}
                    {active ? <span className="size-2 rounded-full bg-accent" aria-hidden /> : null}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
