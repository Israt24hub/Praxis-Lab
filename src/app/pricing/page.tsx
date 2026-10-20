import { Check, Minus } from "lucide-react";
import type { Metadata } from "next";

import { ButtonLink } from "@/components/ui/button";
import { Container, PageHeader } from "@/components/ui/layout";
import { StatusTag } from "@/components/ui/status-tag";
import { features } from "@/config/features";
import { getPricing } from "@/lib/content";

export const metadata: Metadata = {
  title: "Pricing",
  description: "The intended split between free learning resources and planned premium tools. Nothing is for sale yet.",
};

export default async function PricingPage() {
  const { plans, pricingFaq } = await getPricing();

  return (
    <>
      <PageHeader
        title="Pricing"
        lead="The essentials of learning AI should be free. Premium will add deeper interactive tools and guided courses on top — later."
      >
        {!features.billing ? (
          <p className="max-w-prose rounded-control border border-line-strong bg-sunken px-4 py-3 text-fg">
            Preview only. Prices haven’t been set, there are no paid plans, and this site doesn’t collect payment details.
          </p>
        ) : null}
      </PageHeader>

      <Container className="py-12 sm:py-16">
        <div className="grid gap-6 md:grid-cols-2">
          {plans.map((plan) => {
            const isFree = plan.id === "free";
            return (
              <section
                key={plan.id}
                aria-labelledby={`plan-${plan.id}`}
                className={
                  isFree
                    ? "flex flex-col rounded-panel border-2 border-primary p-6 sm:p-8"
                    : "flex flex-col rounded-panel border border-dashed border-line-strong p-6 sm:p-8"
                }
              >
                <StatusTag kind={plan.id} label={plan.status} className="self-start" />
                <h2 id={`plan-${plan.id}`} className="mt-4 text-3xl">
                  {plan.name}
                </h2>
                <p className="mt-2 text-lg text-fg-muted">{plan.summary}</p>
                <ul className="mt-6 space-y-4">
                  {plan.features.map((f) => (
                    <li key={f.label} className="flex gap-3">
                      {isFree ? (
                        <Check aria-hidden className="mt-1 size-4 shrink-0 text-link" />
                      ) : (
                        <Minus aria-hidden className="mt-1 size-4 shrink-0 text-fg-faint" />
                      )}
                      <span>
                        {f.label}
                        {f.note ? <span className="block text-sm text-fg-muted">{f.note}</span> : null}
                      </span>
                    </li>
                  ))}
                </ul>
                <div className="mt-auto pt-8">
                  {isFree ? (
                    <ButtonLink href="/learn">Start learning free</ButtonLink>
                  ) : (
                    <p className="text-fg-muted">Not available yet. No sign-up or waitlist exists in this version.</p>
                  )}
                </div>
              </section>
            );
          })}
        </div>

        <section aria-labelledby="faq-heading" className="mt-20 max-w-3xl">
          <h2 id="faq-heading" className="text-3xl">
            Questions
          </h2>
          <dl className="mt-6 divide-y divide-line border-y border-line">
            {pricingFaq.map((q) => (
              <div key={q.question} className="py-6">
                <dt className="text-lg font-bold">{q.question}</dt>
                <dd className="mt-2 text-fg-muted">{q.answer}</dd>
              </div>
            ))}
          </dl>
        </section>
      </Container>
    </>
  );
}
