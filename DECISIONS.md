# Decisions

A running log of the choices made while building Praxis Lab, and why. Add to it when a decision changes.

## Phase 1 — 2026-10-21

### Stack
- **Next.js 16 (App Router) + TypeScript + Tailwind CSS v4.** The repository started empty, so this follows the brief's default. `create-next-app` 16 enables Cache Components and Partial Prefetching by default; they are kept.
- **One runtime dependency beyond Next/React:** `lucide-react` for icons. Fonts come from Fontsource packages and are self-hosted with `next/font/local` — no requests to Google at runtime, which also helps on slower connections.
- **No database, authentication, payments or AI APIs.** Content is local typed data.

### Content architecture
- **Typed content in `src/content/`, read only through `src/lib/content.ts`.** Accessors are `async` and marked `"use cache"`, so moving content to a CMS or API later changes one file, and caching is already in place.
- **Honest status on every item.** The content model has `status: live | outline | planned` and `access: free | premium`; pages render these instead of hard-coded "coming soon" text.
- **Feature flags** (`src/config/features.ts`: `threeD`, `accounts`, `billing`, all `false`) gate UI that depends on later phases.
- **Static generation with real 404s.** Dynamic routes use `generateStaticParams` and `export const ensureStatic = "navigation"`, so unknown slugs reach `notFound()` before streaming and return HTTP 404 rather than a 200 with not-found UI.

### Design
- **"Lecture board" identity:** deep slate-green background (`#1a372f`), chalk-white text, one chalk-yellow accent (`#f2cf5e`). Teaching on a board is the subject's own vernacular; it also avoids the generic near-black + neon AI look the brief warned against. All text colours pass WCAG AA on their backgrounds (chalk 11.3:1, muted 7.6:1, faint 5.4:1, accent 8.5:1 on the board).
- **Typeface: Atkinson Hyperlegible Next** (+ its mono for code), designed by the Braille Institute for legibility. One family keeps the system quiet; weight and size carry hierarchy.
- **One signature moment:** the hero network diagram, which the learner steps through (user-triggered; no autoplaying animation). Everything else is deliberately restrained.
- **Diagrams share one SVG vocabulary** (`.dg-*` classes in `globals.css`). On phones, detailed diagrams keep a minimum width and scroll sideways rather than shrinking text to unreadable sizes.
- **Dark theme only for Phase 1.** A light theme would need its own contrast pass; deferred.
- **"Explore the AI Lab"** (the brief's hero button label) links to the AI Playground.

### Educational content
- **Sample Project Lab step: step 6, splitting without leakage.** It is the most common source of inflated results in student ML work, and it lets the guide use a concrete public example: the `duration` feature in the UCI Bank Marketing dataset, which the dataset's own documentation says to drop for realistic prediction.
- **Sample paper outline uses bracketed placeholders, never numbers.** A test fails if a percentage appears in an outline example, so the template cannot quietly model invented results.
- **Illustrations are labelled as illustrations.** Only the single-neuron experiment and the convolution diagram compute real values.
- **Pricing policy is a draft.** "Essentials stay free" is the intended policy stated on the site; the owner should confirm before launch.

### Testing
- **Content-integrity tests use `node:test`** with Node's built-in TypeScript stripping — no test framework dependency. They check cross-references (prerequisites, path links), workflow numbering, required paper sections, and the no-invented-numbers rule.
- Browser checks (screenshots at 1440px and 390px, link crawl, console errors, axe-core accessibility scan, keyboard and interaction checks) were run during development but are not yet part of the repository. Adding Playwright as a dev dependency is a candidate for Phase 2.

## Planned for later phases (not built)

- **3D explorers:** add `@react-three/fiber` + `three`, and load each 3D experiment with `next/dynamic` (`ssr: false`) keyed by experiment `id`, only when `features.threeD` is on. The experiment registry's `renderer: "2d" | "3d"` field exists for this, so the 3D bundle never loads on pages that don't need it.
- **Accounts and progress:** the checklist component keeps its own state and shows a "not saved" note while `features.accounts` is off; persisting progress needs an auth provider and a store.
- **Billing:** premium checks should read `access` from content plus the user's plan; nothing in Phase 1 assumes a provider.
