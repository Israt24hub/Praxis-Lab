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

/* ---------- Phase 2 additions ---------- */

/** The three kinds of statement a paper makes, and how to tell them apart. */
export const claimTypes = [
  {
    kind: "Finding",
    definition: "What your experiments directly measured, on the data and setup you actually used.",
    signals: "“On our test split…”, “across five seeds…”, “we observed…”",
    example:
      "Removing `duration` lowered average precision from [measured value] to [measured value] for all four models on our held-out test split.",
  },
  {
    kind: "Hypothesis",
    definition: "A possible explanation or generalisation that your results suggest but do not test.",
    signals: "“This suggests…”, “one explanation is…”, “we expect… but did not test”",
    example:
      "Features recorded after the outcome may inflate results in other marketing datasets too; we did not test datasets beyond this one.",
  },
  {
    kind: "Limitation",
    definition: "A specific boundary on where your findings apply, or a weakness in how they were obtained.",
    signals: "“We only…”, “results may not hold when…”, “we could not…”",
    example:
      "We evaluate on a single dataset collected by one bank, so the size of the effect may differ for other institutions and time periods.",
  },
];

/** Weak versus clearer academic sentences. Brackets mark where real measurements go. */
export const writingExamples = [
  {
    problem: "Vague claim",
    weak: "Our model achieves state-of-the-art results.",
    better:
      "On the UCI Bank Marketing test split, our model reaches an average precision of [value] compared with [value] for the strongest baseline we tested, averaged over five seeds.",
    why: "Names the dataset, the metric, the comparison and how variation was handled.",
  },
  {
    problem: "Overclaiming",
    weak: "This proves that neural networks are better for tabular data.",
    better: "On this dataset, the multilayer perceptron did not outperform gradient-boosted trees.",
    why: "One dataset cannot prove a general rule. The clearer version reports what was observed.",
  },
  {
    problem: "Missing method detail",
    weak: "We preprocessed the data and trained several models.",
    better:
      "We one-hot encoded the ten categorical features, standardised the numerical features using training-set statistics, and trained logistic regression, a random forest and gradient-boosted trees.",
    why: "Someone else could now repeat the preprocessing.",
  },
  {
    problem: "Token limitation",
    weak: "Our work has some limitations.",
    better:
      "The data comes from one Portuguese bank’s campaigns between 2008 and 2010, so results may not transfer to other banks, countries or periods.",
    why: "A specific limitation tells readers exactly where the conclusions stop.",
  },
  {
    problem: "Unsupported citation",
    weak: "Data leakage is a widespread problem [citation].",
    better:
      "Kapoor and Narayanan (2023) document leakage in published machine-learning-based science across many fields.",
    why: "Cites a specific source you have read, for the specific claim it supports.",
  },
];

export const reproducibilityChecklist = [
  "The exact dataset version, source and licence are stated, with access instructions.",
  "Every preprocessing step is described, including dropped rows and features.",
  "Train, validation and test splits can be rebuilt (saved indices or a seed and procedure).",
  "Hyperparameters and search spaces are reported for every method, including baselines.",
  "Random seeds, library versions and hardware are recorded.",
  "Results report variation across seeds or confidence intervals.",
  "Every number in the paper is produced by a script in the repository.",
  "Figures and tables are generated from logged results, not edited by hand.",
  "Failed and negative runs that bear on the claims are reported.",
  "Every reference has been opened and checked against the claim it supports.",
  "The repository README explains how to reproduce the main results.",
];
