# Praxis Lab

An interactive platform for learning AI and machine learning: understand what happens inside a model, experiment with it in the browser, apply it in a full project, and write it up honestly as research.

Live site: <https://praxis-lab-seven.vercel.app/>

**Status: Phase 3.** Eight-path curriculum (60 topics, every one with its own page), 21 complete lessons with real in-browser experiments (Path A, Mathematics and Foundations; Path B, Machine Learning; and Path C, Deep Learning, are finished), all 15 Project Lab steps, the Research & Papers guide, and four colour themes. No accounts, payments, backend, 3D or external AI APIs yet. Anything not built is labelled *Planned* on the site.

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
| `npm test` | Content-integrity tests, and tests that every lab reproduces its lesson's numbers (`node:test`, no extra dependencies) |
| `npm run check` | Typecheck, lint and tests together (GitHub Actions runs this and a production build on every push) |

## What's on the site

| Route | Contents |
| --- | --- |
| `/` | Hero with a step-through network, the eight paths and their prerequisite map, concept explorer, project workflow, research preview, free vs premium |
| `/learn` | The curriculum: search and filter all 60 topics, complete lessons marked |
| `/learn/[path]` | Path overview with every topic, prerequisites and what it unlocks |
| `/learn/[path]/[topic]` | A complete lesson, or a clearly marked planned-lesson page |
| `/playground` | The 21 live experiments, each also embedded in its lesson, and the planned catalogue |
| `/project-lab`, `/project-lab/[step]` | The 15-step workflow; every step has a page, step 6 has the full leakage guide |
| `/research` | Lifecycle, writing roadmap, findings vs hypotheses vs limitations, writing examples, paper outline, reproducibility checklist |
| `/pricing` | Pricing preview only |
| `/sitemap.xml`, `/robots.txt`, `/opengraph-image` | Generated from the content: every page in the sitemap, and one link-preview image for the whole site |

**Complete lessons (21 of 60):**

- Path A, Mathematics and Foundations (all 5 topics): [Linear algebra essentials](https://praxis-lab-seven.vercel.app/learn/math-foundations/linear-algebra-essentials), [Vectors, matrices and tensors](https://praxis-lab-seven.vercel.app/learn/math-foundations/vectors-matrices-tensors), [Probability and statistics](https://praxis-lab-seven.vercel.app/learn/math-foundations/probability-statistics), [Derivatives and gradients](https://praxis-lab-seven.vercel.app/learn/math-foundations/derivatives-gradients), [Optimization fundamentals](https://praxis-lab-seven.vercel.app/learn/math-foundations/optimization-fundamentals)
- Path B, Machine Learning (all 9 topics): [What does learning from data mean?](https://praxis-lab-seven.vercel.app/learn/ml-foundations/learning-from-data) (the reference lesson), [Features, labels, datasets and predictions](https://praxis-lab-seven.vercel.app/learn/ml-foundations/features-labels-datasets), [Supervised and unsupervised learning](https://praxis-lab-seven.vercel.app/learn/ml-foundations/supervised-unsupervised), [Regression and classification](https://praxis-lab-seven.vercel.app/learn/ml-foundations/regression-classification), [Decision trees and ensemble methods](https://praxis-lab-seven.vercel.app/learn/ml-foundations/trees-ensembles), [Clustering and dimensionality reduction](https://praxis-lab-seven.vercel.app/learn/ml-foundations/clustering-dimensionality-reduction), [Training, validation and testing](https://praxis-lab-seven.vercel.app/learn/ml-foundations/train-validation-test), [Overfitting, underfitting and generalization](https://praxis-lab-seven.vercel.app/learn/ml-foundations/overfitting-generalization), [Evaluation metrics and cross-validation](https://praxis-lab-seven.vercel.app/learn/ml-foundations/metrics-cross-validation)
- Path C, Deep Learning (all 7 topics): [Perceptrons and single neurons](https://praxis-lab-seven.vercel.app/learn/deep-learning/perceptrons-neurons), [Neural network layers and activations](https://praxis-lab-seven.vercel.app/learn/deep-learning/layers-activations), [Forward propagation](https://praxis-lab-seven.vercel.app/learn/deep-learning/forward-propagation), [Loss functions](https://praxis-lab-seven.vercel.app/learn/deep-learning/loss-functions), [Backpropagation](https://praxis-lab-seven.vercel.app/learn/deep-learning/backpropagation), [Gradient descent and optimizers](https://praxis-lab-seven.vercel.app/learn/deep-learning/gradient-descent-optimizers), [Regularization and training diagnostics](https://praxis-lab-seven.vercel.app/learn/deep-learning/regularization-diagnostics)

Each has an experiment that computes in the browser; the numbers each lesson quotes are checked by `tests/lab-math.test.ts`, `tests/deep-learning.test.ts` and `tests/linear-regression.test.ts`. The Deep Learning labs’ network maths (activations, backward passes, losses, SGD, momentum, Adam and AdamW) is also checked against reference values recorded from PyTorch (`tests/fixtures/make_torch_fixtures.py`).

**Themes:** the Theme button in the header switches between Light (default), Dark, System (follows your device) and Chalkboard. The choice is saved in your browser.

## Project structure

```
src/
  app/                    Routes, layout, 404 / error / loading states, theme tokens (globals.css)
  components/
    layout/               Header, navigation, theme switcher, footer, logo
    ui/                   Buttons, status tags, layout primitives, code block
    diagrams/             SVG diagrams (hero network, concepts, path map, data splits)
    lessons/              Lesson template, curriculum nav, quiz, explanation toggle,
                          training lab, interactive registry
    learn/ playground/ project-lab/ research/
  content/
    paths.ts              The curriculum: 8 paths, 60 topics
    lessons/              Complete lessons (one file each) + index
    datasets/             Small teaching datasets
    project-lab.ts        The 15 workflow steps
    guides/               Long-form step guides
    research.ts, …
  lib/content.ts          Async accessors; the only way pages read content
  lib/                    Lab math shared by the browser and the tests: nn (layers, backward
                          pass, losses and PyTorch's optimizer rules), boundaries, forward-example,
                          losses, backprop, optimizers, regularization, contour, linalg, shapes
                          (NumPy broadcasting, matmul and reshape rules), probability, calculus,
                          optimize (gradient descent), linear-regression, classification, polyfit,
                          metrics, kmeans (and PCA), tree (CART and random forest), selection
                          (split and test-reuse simulations), rng
  config/                 Site name, address (used by the sitemap and previews), navigation, themes, feature flags
  types/content.ts        Content model, including the Lesson template
tests/                    node:test suites
```

## Common changes

- **Write a new lesson:** copy `src/content/lessons/learning-from-data.ts`, fill in every field (the `Lesson` type lists them), add it to `src/content/lessons/index.ts`, and set `lessonId` on the topic in `src/content/paths.ts`. The page, navigation and "complete" markers update automatically; `npm test` checks the template is filled in.
- **Add an interactive experiment:** build a client component, register it in `src/components/lessons/interactive-registry.tsx`, and reference its key from a lesson (`interactive.component`) or an experiment (`component`).
- **Add a topic:** add it to its path in `src/content/paths.ts` with a summary and outcomes; it gets a planned page immediately.
- **Change colours:** theme values at the top of `src/app/globals.css`. Use the semantic token names; don't add raw colours to components.
- **Rename the site or change its domain:** `src/config/site.ts` (`name`, `url`).

Design and architecture decisions are recorded in [DECISIONS.md](./DECISIONS.md).

## Known limitations

- 21 of 60 lessons are complete; the other 39 topics have planned-lesson pages.
- Step 6 is the only Project Lab step with a long-form guide; the other 14 have the core template.
- Quiz answers and checklist ticks are not saved (no accounts).
- Estimated lesson times are planning guides, not measurements.
