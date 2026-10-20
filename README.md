# Praxis Lab

An interactive platform for learning AI and machine learning by seeing what happens inside models, experimenting with them, and applying them to real projects — through to writing an honest research paper.

**Status: Phase 1.** The 2D website, navigation, learning-path syllabi, Project Lab workflow, Research & Papers section and pricing preview. No accounts, payments, backend, 3D or external AI APIs yet. Anything not built is labelled *Planned* on the site.

## Run it

Requires Node.js 22.18 or newer (the tests use Node's built-in TypeScript support).

```bash
npm install
npm run dev        # http://localhost:3000
```

| Script | What it does |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` / `npm start` | Production build / serve it |
| `npm run typecheck` | Generates route types, then `tsc --noEmit` |
| `npm run lint` | ESLint (Next.js core-web-vitals + TypeScript rules) |
| `npm test` | Content-integrity tests (`node:test`, no extra dependencies) |
| `npm run check` | Typecheck, lint and tests together |

## What's on the site

| Route | Contents |
| --- | --- |
| `/` | Hero with a step-through network diagram, learning paths and prerequisite map, concept explorer, project workflow, research preview, free vs premium |
| `/learn`, `/learn/[slug]` | Searchable, filterable paths; a syllabus page per path |
| `/playground` | A live single-neuron experiment (real arithmetic in the browser) and the planned-experiment catalog |
| `/project-lab`, `/project-lab/split-without-leakage` | The 15-step workflow, preprocessing-by-data-type table, and one complete sample step guide |
| `/research` | Research lifecycle, paper-writing roadmap, honest-reporting rules, sample paper outline |
| `/pricing` | Pricing preview only |
| `/contact`, `/privacy`, `/terms` | Placeholders |

## Project structure

```
src/
  app/                 Routes, layout, 404 / error / loading states, global CSS tokens
  components/
    layout/            Header, navigation, footer, logo
    ui/                Buttons, status tags, layout primitives, code block
    diagrams/          SVG diagrams (hero network, concepts, path map, data splits)
    learn/ playground/ project-lab/ research/   Feature components
  content/             Typed local content (mock data) — edit text here
  lib/content.ts       Async accessors; the only way pages read content
  config/site.ts       Site name, navigation
  config/features.ts   Flags for later phases (3D, accounts, billing)
  types/content.ts     Content model
tests/                 Content-integrity tests
```

## Common changes

- **Edit text or add a learning path:** `src/content/paths.ts` (tests check that prerequisites point to real paths).
- **Write another Project Lab guide:** add a file in `src/content/guides/`, set `hasGuide: true` on the step in `src/content/project-lab.ts`, and register it in `getStepGuide` in `src/lib/content.ts`.
- **Add an experiment:** add an entry to `src/content/experiments.ts`; build its component when its status becomes `live`.
- **Rename the site:** `src/config/site.ts`.
- **Change colours or type scale:** tokens at the top of `src/app/globals.css`.

Design and architecture decisions, and how Phase 2 features are meant to plug in, are recorded in [DECISIONS.md](./DECISIONS.md).

## Known limitations (Phase 1)

- Lessons are not written; path pages show syllabi only. One of fifteen Project Lab steps has a full guide.
- Only one Playground experiment is live; the others are described, not built.
- Checklist ticks are not saved (no accounts).
- Dark theme only.
- Concept diagrams are illustrations with example values, except the convolution diagram, whose feature map is computed from the image shown.
