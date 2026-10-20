import type { ReactNode } from "react";

import { ButtonLink } from "./button";
import { Container, PageHeader } from "./layout";

/** For pages that are reserved but not written yet (contact, policies). */
export function PlaceholderPage({ title, lead, children }: { title: string; lead: string; children?: ReactNode }) {
  return (
    <>
      <PageHeader title={title} lead={lead} />
      <Container className="py-12 sm:py-16">
        <div className="max-w-prose space-y-4 text-fg-muted">{children}</div>
        <ButtonLink href="/" variant="secondary" className="mt-10">
          Back to home
        </ButtonLink>
      </Container>
    </>
  );
}
