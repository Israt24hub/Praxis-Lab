import type { PaperSection, ResearchStage } from "../types/content";

export const researchStages: ResearchStage[] = [
  {
    number: 1,
    title: "Identify a meaningful gap",
    summary: "Find something that is unknown, untested, or doesn’t hold for a setting people care about — such as a low-resource language or a dataset with known flaws.",
    produces: "A gap statement backed by specific papers.",
  },
  {
    number: 2,
    title: "Formulate a question and contribution",
    summary: "Turn the gap into a question you can answer with an experiment, and say in one sentence what the answer would add.",
    produces: "A research question and a draft contribution statement.",
  },
  {
    number: 3,
    title: "Conduct a literature review",
    summary: "Read systematically, record each paper’s claims and evidence, and note where results conflict.",
    produces: "A literature matrix you can turn into Related Work.",
  },
  {
    number: 4,
    title: "Select datasets, baselines and metrics",
    summary: "Choose them before running experiments, including the strongest reasonable baseline, not only weak ones.",
    produces: "An evaluation plan written down in advance.",
  },
  {
    number: 5,
    title: "Design experiments and ablations",
    summary: "Plan which comparisons answer the question, which components to remove one at a time, and how many seeds to run.",
    produces: "An experiment plan with the expected tables and figures.",
  },
  {
    number: 6,
    title: "Record configurations, results and limitations",
    summary: "Log every run — including failed and disappointing ones — with configs, versions and seeds.",
    produces: "An experiment log that every number in the paper traces back to.",
  },
  {
    number: 7,
    title: "Interpret without overstating",
    summary: "Separate what the results show from what they suggest, and check whether differences exceed run-to-run variation.",
    produces: "Claims scoped to the data, models and settings actually tested.",
  },
  {
    number: 8,
    title: "Write and revise the paper",
    summary: "Draft in an order that keeps claims tied to evidence, then revise with someone who hasn’t seen the project.",
    produces: "A complete draft and a revision log.",
  },
  {
    number: 9,
    title: "Prepare references, figures and reproducibility materials",
    summary: "Verify every citation, make figures readable in print, and package code and configs so others can rerun the work.",
    produces: "A checked bibliography, final figures and a public repository.",
  },
];

/** The order to write in — not the order the paper is read in. */
export const writingRoadmap = [
  {
    title: "Fix the claims",
    detail: "Write the two or three claims your experiments support. Everything else in the paper serves these.",
  },
  {
    title: "Build figures and tables from logged results",
    detail: "Generate them from the experiment log with code, so no number is copied by hand.",
  },
  {
    title: "Write Methodology and Experimental Setup",
    detail: "Describe what you did while it is fresh, in enough detail to reproduce it.",
  },
  {
    title: "Write Results, Discussion and Limitations",
    detail: "Report what the tables show, then what it means, then where it stops applying.",
  },
  {
    title: "Write Introduction and Related Work",
    detail: "Now that the contribution is settled, motivate it and position it against prior work.",
  },
  {
    title: "Write the Abstract and title last",
    detail: "Summarise the paper that exists, not the one you hoped to write.",
  },
  {
    title: "Revise against the evidence",
    detail: "Check every claim against a table or figure, every citation against the source, and the paper against the venue’s rules.",
  },
];

export const honestReporting = [
  "Never invent or alter citations. Open every reference and confirm it exists and says what you cite it for — AI writing tools can produce convincing references to papers that do not exist.",
  "Never invent, round up or cherry-pick results. Every number must trace back to a logged run.",
  "Report the datasets, versions and preprocessing you actually used, including anything you removed.",
  "Claim only what was tested. “Improves accuracy on dataset X” is not “works for language Y”.",
  "Report negative and inconclusive results that bear on your claims, and the limitations you know about.",
];

/*
 * Sample outline for a hypothetical study that continues the Project Lab
 * example. Results are deliberately left as placeholders.
 */
export const sampleOutline = {
  title: "How much does a post-outcome feature inflate reported performance? A case study on UCI Bank Marketing",
  question:
    "When a feature that is only known after the outcome is included, how much do reported scores and model rankings change?",
  note: "This outline shows structure only. Bracketed text marks where your own measured results go — it never contains invented numbers.",
};

export const paperSections: PaperSection[] = [
  {
    id: "abstract",
    title: "Abstract",
    purpose: "The whole paper in about 150–250 words: problem, method, main result, and why it matters.",
    include: ["The question", "What you did", "The main measured result", "The takeaway"],
    avoid: "Claims that aren’t supported in the body of the paper.",
    example: "We measure how including call duration changes the reported performance of [models] … Including it raises [metric] from [measured value] to [measured value] …",
  },
  {
    id: "introduction",
    title: "Introduction",
    purpose: "Why the problem matters, what is missing, and what this paper contributes.",
    include: ["Motivation", "The gap", "The research question", "A short list of contributions"],
    avoid: "Contributions that the experiments don’t demonstrate.",
    example: "Published results on this dataset often include a feature unavailable at prediction time. We quantify the effect on [metrics] and model rankings.",
  },
  {
    id: "related-work",
    title: "Related Work",
    purpose: "Position the work against prior research, organised by theme rather than paper by paper.",
    include: ["Leakage in ML evaluation", "Prior studies using this dataset", "How this work differs"],
    avoid: "Citations you haven’t read, or that don’t say what you attribute to them.",
    example: "[Theme]: [verified citations] show … Unlike these, we …",
  },
  {
    id: "methodology",
    title: "Methodology",
    purpose: "What you did and why, at a level someone could reimplement.",
    include: ["Problem formulation", "Models compared", "Preprocessing pipeline", "Leakage controls"],
    avoid: "Describing methods you planned but didn’t run.",
    example: "We train [models] with and without the duration feature, using identical stratified splits and preprocessing fitted on training data only.",
  },
  {
    id: "experimental-setup",
    title: "Experimental Setup",
    purpose: "Everything needed to reproduce the numbers.",
    include: ["Dataset version and size", "Split procedure", "Metrics and why", "Hyperparameter search", "Seeds, hardware, library versions"],
    avoid: "“Standard settings” without stating them.",
    example: "Test split: [x]% stratified, seed [n]. Tuning: 5-fold CV on training data, grid over [values]. Metric: average precision.",
  },
  {
    id: "results",
    title: "Results",
    purpose: "Report the measurements clearly, with variation across runs.",
    include: ["Main comparison table", "Variation across seeds", "Ablations"],
    avoid: "Interpretation mixed into the numbers, or hiding runs that didn’t help.",
    example: "Table [n]: [metric] mean ± std over [k] seeds for each model, with and without duration.",
  },
  {
    id: "discussion",
    title: "Discussion",
    purpose: "What the results mean, and alternative explanations you checked.",
    include: ["Interpretation", "Surprises", "Implications for practitioners"],
    avoid: "Generalising beyond the data and models tested.",
    example: "The ranking of [models] [changes / does not change] when … which suggests …",
  },
  {
    id: "limitations",
    title: "Limitations",
    purpose: "Where the conclusions stop applying.",
    include: ["Single dataset", "Models not tested", "Metric choices"],
    avoid: "A token paragraph — reviewers value specific, honest limits.",
    example: "We study one tabular dataset; leakage effects may differ for [settings].",
  },
  {
    id: "conclusion",
    title: "Conclusion",
    purpose: "The answer to the research question, briefly, and what should happen next.",
    include: ["Answer", "Practical recommendation", "Future work"],
    avoid: "New results or claims that appear nowhere else.",
    example: "Including a post-outcome feature [measured effect]. We recommend …",
  },
  {
    id: "references",
    title: "References",
    purpose: "Every source you rely on, in the venue’s citation style.",
    include: ["Dataset citation", "Methods and baselines used", "Prior results compared against"],
    avoid: "Unchecked references from search tools or AI assistants.",
    example: "[Each entry opened and checked against the claim it supports]",
  },
];
