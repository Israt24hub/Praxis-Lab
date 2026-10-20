/*
 * Content integrity tests. Run with `npm test` (Node's built-in test runner,
 * no extra dependencies). They catch broken cross-references in the mock data.
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { concepts } from "../src/content/concepts.ts";
import { experiments } from "../src/content/experiments.ts";
import { splitGuide } from "../src/content/guides/split-without-leakage.ts";
import { paths } from "../src/content/paths.ts";
import { phases, steps } from "../src/content/project-lab.ts";
import { paperSections, researchStages } from "../src/content/research.ts";

const pathSlugs = new Set(paths.map((p) => p.slug));

describe("learning paths", () => {
  it("has the seven required paths with unique slugs", () => {
    assert.equal(paths.length, 7);
    assert.equal(pathSlugs.size, paths.length);
  });

  it("only references existing paths as prerequisites, without cycles to itself", () => {
    for (const path of paths) {
      for (const pre of path.prerequisitePaths) {
        assert.ok(pathSlugs.has(pre), `${path.slug} -> unknown prerequisite ${pre}`);
        assert.notEqual(pre, path.slug);
      }
    }
  });

  it("gives every path a destination, prerequisites and at least one module", () => {
    for (const path of paths) {
      assert.ok(path.destination.length > 20, path.slug);
      assert.ok(path.prerequisitePaths.length + path.prerequisiteSkills.length > 0, path.slug);
      assert.ok(path.modules.length > 0, path.slug);
    }
  });
});

describe("concepts and experiments", () => {
  it("link to existing paths", () => {
    for (const item of [...concepts, ...experiments]) {
      assert.ok(pathSlugs.has(item.pathSlug), `${item.title} -> ${item.pathSlug}`);
    }
  });

  it("has six concepts and unique experiment ids", () => {
    assert.equal(concepts.length, 6);
    assert.equal(new Set(experiments.map((e) => e.id)).size, experiments.length);
  });
});

describe("project lab workflow", () => {
  it("has 15 steps numbered 1..15 in order", () => {
    assert.deepEqual(
      steps.map((s) => s.number),
      Array.from({ length: 15 }, (_, i) => i + 1),
    );
  });

  it("assigns every step to a known phase", () => {
    const phaseIds = new Set(phases.map((p) => p.id));
    for (const step of steps) assert.ok(phaseIds.has(step.phase), step.slug);
  });

  it("has a guide for every step marked hasGuide", () => {
    const guided = steps.filter((s) => s.hasGuide).map((s) => s.slug);
    assert.deepEqual(guided, [splitGuide.stepSlug]);
  });
});

describe("research", () => {
  it("lists the nine lifecycle stages and the ten paper sections", () => {
    assert.equal(researchStages.length, 9);
    assert.deepEqual(
      paperSections.map((s) => s.title),
      [
        "Abstract",
        "Introduction",
        "Related Work",
        "Methodology",
        "Experimental Setup",
        "Results",
        "Discussion",
        "Limitations",
        "Conclusion",
        "References",
      ],
    );
  });

  it("never puts concrete numeric results in the sample outline", () => {
    // Placeholders must be bracketed; a bare percentage would look like a real result.
    for (const section of paperSections) {
      assert.doesNotMatch(section.example, /\d+(\.\d+)?\s?%/, section.id);
    }
  });
});
