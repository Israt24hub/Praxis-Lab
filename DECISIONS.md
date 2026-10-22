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

## Phase 3, round 1 — 2026-10-21: four Path B lessons

- **Lessons added:** Features, labels, datasets and predictions; Regression and classification; Overfitting, underfitting and generalization; Evaluation metrics and cross-validation. Chosen to continue directly from the reference lesson and to cover honest evaluation, which later paths rely on. Supervised vs unsupervised, trees and ensembles, clustering and train/validation/test are next.
- **Every lab is real computation, never a recording.** Logistic regression is fitted by Newton’s method (exact, no regularisation, matching `LogisticRegression(C=np.inf)`); polynomials by least squares; metrics with scikit-learn’s definitions (step-wise average precision, tie-aware ROC-AUC). The math lives in `src/lib/` and is shared with the tests.
- **Teaching data is small, invented or simulated, and labelled as such.** Each dataset was designed so the lesson’s point is visible: only the post-outcome `final_exam` column separates pass from fail (a test enforces this); pass/fail labels overlap between 2.5 and 5 hours so logistic regression has a finite solution; the noisy-wave and screening data are generated from fixed NumPy seeds that the lesson code reproduces.
- **Polynomials use a Chebyshev basis** in the browser. It describes the same curves as powers of x but keeps degree-11 fits accurate; the lesson’s NumPy code (`Polynomial.fit`, which rescales internally) gives the same numbers. scikit-learn’s `PolynomialFeatures` + `LinearRegression` was rejected for the code example because at degree 11 the powers-of-x system is badly conditioned and it returned a noticeably different fit (validation MSE 437 instead of about 857,000).
- **Scores are stored as integers in hundredths** so thresholds compare exactly in JavaScript.
- **Lab layouts respond to their container**, not the viewport (Tailwind container queries), because the same lab is narrow inside a lesson and wide on the Playground.
- **Overfitting verdicts are relative to the best validation degree**: within 20% is “about as good”, up to 2× is “a little more complex than needed”, beyond that “overfitting”. A fixed threshold mislabelled the 48-point case.

## Phase 3, round 2 — 2026-10-22: Path B finished

- **Lessons added:** Supervised and unsupervised learning; Decision trees and ensemble methods; Clustering and dimensionality reduction; Training, validation and testing. Path B now has all nine lessons. Each lab is also a live Playground experiment (10 in total).
- **Supervised vs unsupervised is shown on one dataset.** Two-group k-means on study and work hours finds the job split (39 of 40), not the pass split (22 of 40); on study hours alone it finds the pass split. The point — unsupervised methods find the largest structure in the features given, not the question asked — needs labels to demonstrate, and the lab says that real problems lack them.
- **Trees match scikit-learn exactly up to depth 5.** Deeper, some splits tie and scikit-learn breaks ties at random (`random_state`), so the lab keeps the first tie found and the lesson quotes scikit-learn’s own numbers separately. The random forest uses its own seeded generator (100 trees, one random feature per split, probabilities averaged as scikit-learn does); its numbers differ slightly from scikit-learn’s forest and the lesson says so.
- **k-means uses random starts from the data with a seeded generator,** keeping the best of 10 for the elbow chart. Standardised inertia for k = 1–3 matches scikit-learn; for larger k either may find a slightly better local minimum. The step-through starts from one random start on purpose, so learners see local minima.
- **PCA is drawn with equal scales on both axes,** the way PCA measures distance. On raw units the data collapses to a vertical strip, which makes the scaling lesson visible.
- **The test-reuse simulation is honest about its seed.** Every candidate model has a true accuracy of exactly 50% by construction. Seed 28 was chosen so that the default settings show typical behaviour (no coincidental agreement between validation and test winners); a “Draw a new dataset” button moves to other seeds, which show the same pattern with different numbers.
- **Categorical colours added** (`--dg-cat-1` … `--dg-cat-6` in every theme), each at least 3:1 against surface and sunken backgrounds, for clusters. Classes keep the filled/hollow convention so meaning never depends on colour alone.
- **Shared lab controls** (`src/components/lessons/lab-ui.tsx`): segmented choices built on radio inputs, step sliders, checkboxes, stat grids and verdict boxes.

## Engineering track — 2026-10-23: CI, sitemap and link previews

- **CI on GitHub Actions** (`.github/workflows/ci.yml`): on every push to `main` and every pull request, `npm ci`, then `npm run check` (typecheck, lint, all tests — including that every lab reproduces its lesson’s numbers), then `npm run build`. Node 22, matching `engines`.
- **Sitemap and robots.txt are generated from the content** (`src/app/sitemap.ts`, `src/app/robots.ts`), so new lessons and steps appear without editing a list. Complete lessons get priority 0.8, planned-lesson pages 0.4. No `lastModified` dates: the content has no reliable edit dates, and invented ones would mislead crawlers.
- **One canonical address** in `src/config/site.ts` (`url`), used for `metadataBase`, canonical links, the sitemap and robots.txt. Changing the domain is a one-line change.
- **One link-preview image for the whole site** (`src/app/opengraph-image.tsx`), prerendered at build time in the design-board palette. It needs static `.woff` fonts (`@fontsource/playfair-display`, `@fontsource/inter`) because the image renderer cannot read the variable `.woff2` files the site uses. Per-page images are possible later; titles and descriptions already differ per page.
- **`pageMetadata()`** (`src/lib/metadata.ts`) builds title, description, canonical URL, Open Graph and Twitter fields together. Next.js does not copy a page’s title into Open Graph, and a page that sets its own Open Graph loses the inherited image, so the helper sets both explicitly.
- **Not done yet:** Playwright and axe checks are still run by hand during development, not in CI.

## Planned for later phases (not built)

- **3D explorers:** add `@react-three/fiber` + `three`, and load each 3D experiment with `next/dynamic` (`ssr: false`) keyed by experiment `id`, only when `features.threeD` is on. The experiment registry's `renderer: "2d" | "3d"` field exists for this, so the 3D bundle never loads on pages that don't need it.
- **Accounts and progress:** the checklist component keeps its own state and shows a "not saved" note while `features.accounts` is off; persisting progress needs an auth provider and a store.
- **Billing:** premium checks should read `access` from content plus the user's plan; nothing in Phase 1 assumes a provider.
