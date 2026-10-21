import Link from "next/link";

import { footerInfoLinks, mainNav, site } from "@/config/site";
import { getPaths } from "@/lib/content";

import { LogoMark } from "./logo";

function FooterList({ title, links }: { title: string; links: { href: string; label: string }[] }) {
  return (
    <div>
      <h2 className="text-base font-bold text-fg">{title}</h2>
      <ul className="mt-4 space-y-2.5">
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className="text-fg-muted hover:text-fg hover:underline">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export async function SiteFooter() {
  const paths = await getPaths();
  const pathLinks = paths.map((p) => ({ href: `/learn/${p.slug}`, label: p.title }));
  const completeLessons = paths.reduce((n, p) => n + p.topics.filter((t) => t.lessonId).length, 0);

  return (
    <footer className="mt-auto border-t border-line bg-sunken">
      <div className="mx-auto grid w-full max-w-page gap-12 px-5 py-16 sm:px-8 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1.3fr_1fr]">
        <div className="max-w-sm">
          <p className="flex items-center gap-2.5 font-display text-xl font-medium">
            <LogoMark className="size-7" />
            {site.name}
          </p>
          <p className="mt-4 text-fg-muted">
            An independent learning project for understanding AI by seeing how it works, experimenting with it, and
            applying it to real projects.
          </p>
          <p className="mt-4 text-fg-muted">
            {site.phase}: {completeLessons} complete lessons, every curriculum topic mapped, and the full project workflow. Items marked
            <q className="mx-1">Planned</q>don’t exist yet.
          </p>
        </div>
        <FooterList title="Platform" links={mainNav.filter((item) => item.href !== "/")} />
        <FooterList title="Learning paths" links={pathLinks} />
        <FooterList title="Information" links={footerInfoLinks} />
      </div>
      <div className="border-t border-line">
        <p className="mx-auto w-full max-w-page px-5 py-6 text-sm text-fg-faint sm:px-8">
          No accounts, payments or tracking in this version. Diagrams are illustrations unless marked as running in
          your browser.
        </p>
      </div>
    </footer>
  );
}
