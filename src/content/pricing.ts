import type { Plan } from "../types/content";

/*
 * Pricing preview only. No prices are set and nothing is for sale.
 * The intended policy below is a draft for the project owner to confirm.
 */
export const plans: Plan[] = [
  {
    id: "free",
    name: "Free",
    status: "Available as content is published",
    summary: "Everything you need to learn the fundamentals and complete a real project.",
    features: [
      { label: "All learning-path syllabi and core lessons" },
      { label: "Concept diagrams and step-through explanations" },
      { label: "Basic in-browser experiments", note: "The single-neuron experiment is live now." },
      { label: "Project Lab workflow guides and checklists" },
      { label: "Research and paper-writing guides" },
    ],
  },
  {
    id: "premium",
    name: "Premium",
    status: "Planned — not available yet",
    summary: "Deeper, more interactive learning for people who want guidance and tools on top of the free core.",
    features: [
      { label: "Advanced guided courses with graded projects" },
      { label: "Interactive labs", note: "Backpropagation, attention, fine-tuning simulations." },
      { label: "3D model and architecture explorers" },
      { label: "Saved progress and completion records", note: "Requires accounts, which don’t exist yet." },
      { label: "Paper-writing templates and interactive checklists" },
    ],
  },
];

export const pricingFaq = [
  {
    question: "Can I pay for Premium now?",
    answer: "No. Pricing hasn’t been set and the site doesn’t take payments or collect payment details anywhere.",
  },
  {
    question: "Will free lessons become paid later?",
    answer: "The intended policy is that the essentials stay free: concepts, core lessons, project guides and research guides. Premium adds interactive tools and guided courses on top.",
  },
  {
    question: "Why would anything be paid?",
    answer: "Interactive labs, 3D explorers and graded projects take far more work to build and cost money to host. Charging for those is what keeps the core free.",
  },
];
