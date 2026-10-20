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

## Phase 2 — 2026-10-21

### Visual identity and themes
- **Palette from the owner's design board** replaces the green identity as the default: warm ivory `#F7F6F2` (page), ink navy `#202B3C` (text), muted indigo `#5367B7` (interactive), mist blue `#DCE5F5` and sage grey `#E6E9E2` (secondary surfaces), soft coral `#D97960` (sparing highlights).
- **Coral is never used for small text on light backgrounds** (2.8:1 on ivory). A darker `highlight-text` (`#A84B33`, 5.2:1) carries coral meaning in text; plain coral is for fills, borders and chart marks.
- **Four themes, chosen in the header:** Light (default), Dark (navy, from the board's dark preview), System (follows the OS) and Chalkboard (the Phase 1 green, kept by request). Stored in `localStorage` under `praxis-theme`; an inline script in `<head>` applies it before first paint, as the Next.js guide recommends, so pages stay statically prerendered.
- **Semantic tokens only.** Components use `page`, `surface`, `mist`, `sage`, `sunken`, `fg`, `fg-muted`, `fg-faint`, `line`, `primary`, `link`, `highlight`, `success`, `danger`; diagrams use `--dg-ink`, `--dg-hl`, `--dg-on-hl` and pixel tokens. Themes change values, never class names. Axe colour-contrast checks pass on every page in all four themes.
- **Typography from the board:** Playfair Display for h1/h2 and titles, Inter for body and interface, Atkinson Hyperlegible Mono kept for code. All self-hosted.
- **Lesson layout follows the board:** curriculum sidebar, mist header panel, objectives / time / level cards, and a section bar styled as tabs. The tabs are in-page links rather than hidden panels, so a lesson can be read, searched and printed as one page.

### Curriculum and lessons
- **Eight paths (A–H) with the brief's 60 topics.** Existing slugs were kept where a path continued (`ml-foundations`, `deep-learning`, …). The Phase 1 "Model Training and Fine-Tuning" path was split between F (fine-tuning, PEFT) and the new G; `/learn/training-fine-tuning` permanently redirects to `/learn/ai-engineering`.
- **Every topic has a page at `/learn/[path]/[topic]`.** A topic is a lesson only when it has a `lessonId`; otherwise the page is explicitly a *planned lesson*: what it will cover, where it fits, and what on the site covers it in the meantime. Tests fail if any topic lacks a summary and outcomes.
- **One lesson template, data-driven.** `Lesson` in `src/types/content.ts` holds the brief's 16 sections plus teacher material (notes, demonstration, discussion questions, misconceptions, challenge). `LessonPage` renders any lesson; new lessons are content files, not new pages.
- **Interactive registry.** Lessons and the Playground embed experiments by key (`interactive-registry.tsx`), so the Single Neuron lab is the same component in the Playground and in its lesson.
- **Real computation, labelled.** The learning-from-data lab runs full-batch gradient descent in the browser (`src/lib/linear-regression.ts`, shared with tests). Every number the lesson states — w ≈ 6.08, b ≈ 34.20, test MSE ≈ 6.80, divergence at η = 0.05 — is checked by `tests/linear-regression.test.ts`. The dataset is invented and says so.
- **Code outputs were produced by running the code.** Lesson code blocks show output captured from actually running them with NumPy/scikit-learn.
- **References were checked.** Linked references were opened before inclusion; unlinked ones are well-known books and papers with full bibliographic details.

### Project Lab and Research
- **All 15 workflow steps have pages** with purpose, input, output, tools, common mistakes and the link to the next step. Step 5 adds preprocessing for tabular data, text and images (with code); step 11 covers metric choice and imbalance; step 6 keeps its full guide below the template.
- **Research page** gained a section bar, the finding / hypothesis / limitation distinction, weak-versus-clearer writing pairs, and an interactive reproducibility checklist (not saved, like other checklists).

## Planned for later phases (not built)

- **3D explorers:** add `@react-three/fiber` + `three`, and load each 3D experiment with `next/dynamic` (`ssr: false`) keyed by experiment `id`, only when `features.threeD` is on. The experiment registry's `renderer: "2d" | "3d"` field exists for this, so the 3D bundle never loads on pages that don't need it.
- **Accounts and progress:** the checklist component keeps its own state and shows a "not saved" note while `features.accounts` is off; persisting progress needs an auth provider and a store.
- **Billing:** premium checks should read `access` from content plus the user's plan; nothing in Phase 1 assumes a provider.
