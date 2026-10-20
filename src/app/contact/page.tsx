import type { Metadata } from "next";

import { PlaceholderPage } from "@/components/ui/placeholder-page";

export const metadata: Metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <PlaceholderPage
      title="Contact"
      lead="A contact form and address will be added here. There is no way to send a message through the site yet."
    >
      <p>Until then, the project’s public code repository is the place for feedback and issue reports, once it is published.</p>
    </PlaceholderPage>
  );
}
