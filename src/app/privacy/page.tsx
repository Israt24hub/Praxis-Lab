import type { Metadata } from "next";

import { PlaceholderPage } from "@/components/ui/placeholder-page";

export const metadata: Metadata = { title: "Privacy" };

export default function PrivacyPage() {
  return (
    <PlaceholderPage
      title="Privacy"
      lead="A full privacy policy will be published before accounts or payments are introduced."
    >
      <p>
        In this version the site has no accounts, sign-in, analytics, advertising or payment forms, and it sets no
        cookies of its own. Fonts are served from the site itself rather than a third-party font service.
      </p>
      <p>
        Experiments in the AI Playground run entirely in your browser; the values you enter are not sent anywhere.
      </p>
      <p>Your hosting provider may still keep standard server logs; those will be described in the full policy.</p>
    </PlaceholderPage>
  );
}
