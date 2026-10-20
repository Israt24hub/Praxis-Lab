import type { Metadata } from "next";

import { PlaceholderPage } from "@/components/ui/placeholder-page";

export const metadata: Metadata = { title: "Terms" };

export default function TermsPage() {
  return (
    <PlaceholderPage
      title="Terms of use"
      lead="Terms of use will be published before accounts or paid plans exist."
    >
      <p>
        The material here is educational. Diagrams marked as illustrations use example values; check code and claims
        before relying on them in your own research.
      </p>
    </PlaceholderPage>
  );
}
