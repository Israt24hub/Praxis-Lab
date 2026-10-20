import type { ReactNode } from "react";

import { cx } from "@/lib/cx";

export function Container({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cx("mx-auto w-full max-w-page px-5 sm:px-8", className)}>{children}</div>;
}

interface SectionProps {
  id?: string;
  title: string;
  intro?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}

/** A page section with a heading. The heading id labels the section for assistive tech. */
export function Section({ id, title, intro, action, children, className }: SectionProps) {
  const headingId = id ? `${id}-heading` : undefined;
  return (
    <section id={id} aria-labelledby={headingId} className={cx("py-16 sm:py-24", className)}>
      <Container>
        <div className="mb-10 flex flex-col gap-4 sm:mb-12 md:flex-row md:items-end md:justify-between">
          <div className="max-w-prose">
            <h2 id={headingId} className="text-3xl leading-tight sm:text-4xl">
              {title}
            </h2>
            {intro ? <div className="mt-4 text-lg text-fg-muted">{intro}</div> : null}
          </div>
          {action ? <div className="shrink-0">{action}</div> : null}
        </div>
        {children}
      </Container>
    </section>
  );
}

interface PageHeaderProps {
  title: string;
  lead: ReactNode;
  children?: ReactNode;
  /** Optional context line above the title, e.g. a breadcrumb. */
  context?: ReactNode;
}

export function PageHeader({ title, lead, children, context }: PageHeaderProps) {
  return (
    <header className="border-b border-line pb-12 pt-12 sm:pb-16 sm:pt-16">
      <Container>
        {context ? <div className="mb-6 text-fg-muted">{context}</div> : null}
        <h1 className="max-w-4xl text-4xl leading-[1.08] sm:text-5xl">{title}</h1>
        <div className="mt-5 max-w-prose text-lg text-fg-muted sm:text-xl">{lead}</div>
        {children ? <div className="mt-8">{children}</div> : null}
      </Container>
    </header>
  );
}

/** A short honest note about what is and isn't built yet. */
export function PhaseNote({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p
      className={cx(
        "max-w-prose border-l-2 border-primary pl-4 text-fg-muted",
        className,
      )}
    >
      {children}
    </p>
  );
}
