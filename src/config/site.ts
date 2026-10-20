/*
 * Site-wide settings. Site name: "Praxis Lab". Change it here only.
 */
export const site = {
  name: "Praxis Lab",
  tagline: "See what happens inside a model. Then build one yourself.",
  description:
    "Learn AI and machine learning by seeing inside models: step-through diagrams, in-browser experiments, a complete project workflow, and a guide to writing honest research papers.",
  phase: "Phase 1",
} as const;

export interface NavItem {
  href: string;
  label: string;
}

export const mainNav: NavItem[] = [
  { href: "/", label: "Home" },
  { href: "/learn", label: "Learn" },
  { href: "/playground", label: "AI Playground" },
  { href: "/project-lab", label: "Project Lab" },
  { href: "/research", label: "Research & Papers" },
  { href: "/pricing", label: "Pricing" },
];

export const footerInfoLinks: NavItem[] = [
  { href: "/contact", label: "Contact" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
];
