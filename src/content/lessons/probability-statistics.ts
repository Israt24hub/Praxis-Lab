import type { Lesson } from "../../types/content";

/*
 * Screening numbers are exact arithmetic; the sampling numbers come from the lab's
 * seeded simulation (src/lib/probability.ts) and are checked in tests/lab-math.test.ts.
 * The code section's numbers come from running it with NumPy.
 */
export const probabilityStatistics: Lesson = {
  id: "probability-statistics",
  pathSlug: "math-foundations",
  topicSlug: "probability-statistics",
  title: "Probability and statistics",
  summary:
    "Every result in machine learning is measured on a sample, so every result is uncertain. This lesson covers the few ideas you need to reason about that: means, variances and distributions; conditional probability and Bayes’ rule; and how much a test score can move by chance alone.",
  level: "beginner",
  minutes: [45, 60],
  objectives: [
    "Summarise data with a **mean**, **variance** and **standard deviation**",
    "Compute a **conditional probability** and apply **Bayes’ rule** to a screening test",
    "Explain why a measured accuracy varies, and estimate by how much with the **standard error**",
    "Report results across random seeds honestly",
  ],
  prerequisites: [{ label: "Fractions and percentages" }, { label: "Evaluation metrics (helpful for the examples)", href: "/learn/ml-foundations/metrics-cross-validation" }],

  intro: [
    {
      type: "p",
      text: "A model scores 84% on a test set. Is it better than one that scored 82%? A screening test is 90% accurate. If it says “positive”, how worried should you be? Both questions sound simple, and both are answered wrongly surprisingly often.",
    },
    {
      type: "p",
      text: "This lesson gives you the tools to answer them: describing data with a few numbers, conditional probability, and the size of chance variation. Two experiments let you see both effects with your own settings.",
    },
  ],

  why: [
    {
      type: "p",
      text: "Models output probabilities, data contains noise, test sets are samples, and training uses random initialisations and random batches. Without probability you cannot tell a real improvement from luck, or a good test result from a misleading one.",
    },
    {
      type: "p",
      text: "Many published comparisons of machine learning methods have been shown to depend on which random seed or data split happened to be used. Reporting spread, not just a single number, is part of doing the work properly.",
    },
  ],

  explanation: {
    beginner: [
      {
        type: "p",
        text: "**Describing data.** The **mean** is the average. The **variance** is the average squared distance from the mean, and the **standard deviation** (SD) is its square root, in the original units. Scores of 78, 80 and 82 have mean 80 and SD about 1.6; scores of 60, 80 and 100 have the same mean and SD about 16.",
      },
      {
        type: "p",
        text: "**Probability** is a number from 0 to 1 for how likely something is. A **distribution** says how likely each possible value is — for example, the number of correct answers when a model with 80% accuracy sees 200 new examples.",
      },
      {
        type: "p",
        text: "**Conditional probability** is the probability of one thing given that another is true, written P(A | B). P(positive test | ill) is not the same as P(ill | positive test). Confusing the two is one of the most common reasoning errors there is.",
      },
      {
        type: "p",
        text: "**Bayes’ rule** turns one into the other. The easiest way to use it is with counts: imagine 1,000 people, work out how many are in each group, and read the answer off. When a condition is rare, most positive results can be false alarms even for a good test.",
      },
      {
        type: "p",
        text: "**Chance variation.** A test set is a sample. Test the same model on a different 200 examples and its score changes. The **standard error** tells you by how much: about √(p(1 − p) / n). For 80% accuracy on 200 examples that is about 2.8 points, so a score anywhere from about 74% to 86% is unremarkable.",
      },
    ],
    technical: [
      {
        type: "p",
        text: "For a random variable X: E[X] = Σ x·P(X = x), Var(X) = E[(X − E[X])²], SD = √Var. The sample mean x̄ estimates E[X]; the sample variance with denominator n − 1 is unbiased for Var(X).",
      },
      {
        type: "p",
        text: "P(A | B) = P(A ∩ B) / P(B). Bayes’ rule: P(A | B) = P(B | A)·P(A) / P(B), with P(B) = P(B | A)P(A) + P(B | ¬A)P(¬A). For a test, the positive predictive value is sensitivity × prevalence ÷ P(positive): it depends on prevalence, which the test itself does not.",
      },
      {
        type: "p",
        text: "The number correct on n independent examples is Binomial(n, p), so the measured accuracy p̂ has mean p and standard error √(p(1 − p)/n). By the central limit theorem p̂ is approximately normal for moderate n, so about 95% of test sets give p̂ within ±1.96 SE of p — the basis of an approximate 95% confidence interval p̂ ± 1.96·√(p̂(1 − p̂)/n).",
      },
      {
        type: "p",
        text: "Training randomness (initialisation, data order, dropout) adds a second source of variance. Report the mean and the sample SD over several seeds, and compare methods with paired designs or statistical tests rather than single runs.",
      },
    ],
  },

  analogy: {
    title: "A smoke alarm in a kitchen",
    blocks: [
      {
        type: "p",
        text: "A smoke alarm almost never misses a real fire. But real fires are rare and burnt toast is common, so most times it goes off, there is no fire. The alarm is good; the base rate of fires is low. That is exactly the screening problem.",
      },
      {
        type: "p",
        text: "Chance variation is like judging a basketball player by ten free throws. An 80% shooter can easily make 6 or 10. Judge them on 200 throws and the score settles close to 80%.",
      },
    ],
  },

  workedExample: {
    title: "A rare condition, and a noisy test score",
    blocks: [
      {
        type: "p",
        text: "**Screening.** A condition affects 2% of people. A test catches 90% of real cases (sensitivity) and correctly clears 95% of people without it (specificity). Out of 1,000 people:",
      },
      {
        type: "table",
        caption: "1,000 people tested (prevalence 2%, sensitivity 90%, specificity 95%)",
        head: ["Who", "Tests positive", "Tests negative", "Total"],
        rows: [
          ["Has the condition", "18", "2", "20"],
          ["Does not", "49", "931", "980"],
          ["Total", "67", "933", "1,000"],
        ],
      },
      {
        type: "p",
        text: "P(condition | positive) = 18 ÷ 67 = **26.9%**. Nearly three out of four positives are false alarms, because 5% of 980 healthy people (49) outnumber 90% of 20 ill people (18). A negative result, though, is reassuring: 931 ÷ 933 = 99.8%.",
      },
      {
        type: "table",
        caption: "The same test at different prevalences: P(condition | positive)",
        head: ["Prevalence", "0.1%", "1%", "2%", "10%", "30%"],
        rows: [["P(condition | positive)", "1.8%", "15.4%", "26.9%", "66.7%", "88.5%"]],
      },
      {
        type: "p",
        text: "**A noisy test score.** A model is right 80% of the time. In the experiment, it is tested on 200 new examples, 1,000 separate times. The measured accuracy ranges from 70.0% to 88.5%; its standard deviation is 2.8 points, matching the formula √(0.8 × 0.2 / 200) = 0.028. On 50 examples the range widens to 62–94%; on 1,000 it narrows to 76.2–84.0%.",
      },
      {
        type: "callout",
        tone: "honesty",
        title: "What this means for comparisons",
        text: "Two models scoring 84% and 82% on the same 200 examples differ by less than one standard error of each score. Without more data or a paired test, that difference is not evidence that either is better.",
      },
    ],
  },

  math: {
    blocks: [
      { type: "equation", expression: "x̄ = (1/n) Σ xᵢ,   s² = (1/(n − 1)) Σ (xᵢ − x̄)²,   s = √s²", meaning: "Sample mean, sample variance and sample standard deviation." },
      { type: "equation", expression: "P(A | B) = P(A and B) / P(B)", meaning: "The probability of A among the cases where B is true." },
      {
        type: "equation",
        expression: "P(ill | +) = P(+ | ill) · P(ill) / P(+)",
        meaning: "Bayes’ rule. Here: 0.90 × 0.02 / 0.067 = 0.269.",
      },
      {
        type: "equation",
        expression: "P(+) = P(+ | ill)·P(ill) + P(+ | well)·P(well)",
        meaning: "All the ways to test positive: 0.90 × 0.02 + 0.05 × 0.98 = 0.067.",
      },
      {
        type: "equation",
        expression: "SE(p̂) = √( p(1 − p) / n )",
        meaning: "Standard error of an accuracy measured on n independent examples. It shrinks with √n: four times the data halves it.",
      },
      { type: "equation", expression: "p̂ ± 1.96 · SE", meaning: "An approximate 95% confidence interval for the true accuracy." },
    ],
    notation: [
      { symbol: "x̄, s", meaning: "Sample mean and sample standard deviation" },
      { symbol: "P(A | B)", meaning: "Probability of A given B (“A given B”)" },
      { symbol: "p, p̂", meaning: "True accuracy, and accuracy measured on a test set" },
      { symbol: "n", meaning: "Number of test examples" },
      { symbol: "SE", meaning: "Standard error: the standard deviation of an estimate" },
    ],
  },

  process: {
    title: "Reporting a result honestly",
    steps: [
      { title: "Say what was measured, on how much data", text: "Metric, test set, and n. “84% accuracy on 200 held-out examples.”" },
      { title: "Give the uncertainty", text: "A standard error or confidence interval for the metric: here about ±2.8 points (SE), ±5 points (95% interval)." },
      { title: "Repeat over seeds", text: "Train with several random seeds and report mean ± sample SD, and how many runs." },
      { title: "Compare on the same examples", text: "Evaluate both models on the same test set and look at the per-example differences, or use a paired test." },
      { title: "Mind the base rate", text: "For rare outcomes, report precision (P(real | flagged)) as well as recall — it depends heavily on prevalence." },
    ],
  },

  interactive: {
    component: "probability-lab",
    kind: "computation",
    intro:
      "Two panels. The first is exact arithmetic on 1,000 people; the second simulates testing a model on many different test sets, with a fixed random seed so the numbers are repeatable.",
    tryThis: [
      "Start at prevalence 2%, sensitivity 90%, specificity 95%. Count the coral squares against the green ones.",
      "Raise the specificity to 99.9%. What happens to P(condition | positive)?",
      "Now keep the test fixed and move the prevalence from 0.1% to 50%.",
      "In panel 2, set the test size to 20, then 200, then 1,000, watching the spread.",
      "Press **Simulate again** a few times. Does the share within ±2 SE stay near 95%?",
    ],
    expect: [
      { action: "2%, 90%, 95%", result: "67 positives, 18 of them real: P(condition | positive) = 26.9%." },
      { action: "Specificity 99.9%", result: "Only about 1 false positive; P(condition | positive) rises to 94.8%." },
      { action: "Prevalence 0.1% and 30%", result: "The same test gives 1.8% and 88.5%." },
      { action: "True accuracy 80%, n = 200", result: "Standard error 2.8 points; scores from 70.0% to 88.5%, with 96.3% of them within ±2 SE." },
      { action: "n = 50 and n = 1,000", result: "Standard error 5.7 and 1.3 points." },
    ],
  },

  code: {
    label: "probability.py",
    language: "Python",
    source: `import numpy as np

# Bayes' rule for a screening test
prevalence, sensitivity, specificity = 0.02, 0.90, 0.95
p_positive = sensitivity * prevalence + (1 - specificity) * (1 - prevalence)
print("P(condition | positive) =", round(sensitivity * prevalence / p_positive, 3))

# How much does a measured accuracy vary? 1,000 test sets of 200 examples each.
rng = np.random.default_rng(0)
scores = rng.binomial(n=200, p=0.8, size=1000) / 200
se = np.sqrt(0.8 * 0.2 / 200)
print("mean", round(scores.mean(), 4), "sd", round(scores.std(), 4), "formula", round(se, 4))
print("share within 2 standard errors:", np.mean(np.abs(scores - 0.8) <= 2 * se))

# Reporting across random seeds: mean and sample standard deviation
seed_scores = np.array([0.812, 0.798, 0.825, 0.806, 0.791])   # hypothetical
print(f"{seed_scores.mean():.3f} +/- {seed_scores.std(ddof=1):.3f} over {len(seed_scores)} seeds")`,
    walkthrough: [
      { lines: "4–6", text: "Bayes’ rule written out: the probability of testing positive, then the share of positives that are real." },
      { lines: "9–10", text: "`rng.binomial(200, 0.8)` draws the number of correct answers on one 200-example test set; 1,000 draws simulate 1,000 test sets." },
      { lines: "11–13", text: "The spread of the simulated scores matches the standard-error formula, and about 95% fall within two standard errors." },
      { lines: "16–17", text: "Five hypothetical accuracies from five training seeds, reported as mean ± sample SD (`ddof=1`) with the number of runs." },
    ],
    shapes: [
      { name: "scores", shape: "(1000,)", meaning: "One measured accuracy per simulated test set" },
      { name: "seed_scores", shape: "(5,)", meaning: "One accuracy per training seed (illustrative values)" },
    ],
    output: {
      label: "Output",
      text: "P(condition | positive) = 0.269\nmean 0.801 sd 0.0288 formula 0.0283\nshare within 2 standard errors: 0.949\n0.806 +/- 0.013 over 5 seeds",
      note: "Produced by running the script with NumPy 2.5. The simulation uses NumPy’s random generator, so its exact numbers differ slightly from the experiment’s; the seed scores are invented to illustrate the reporting format.",
    },
  },

  useCases: [
    { title: "Fraud and disease screening", text: "When positives are rare, a model with high accuracy can still produce mostly false alarms. Precision at the real-world prevalence is the number that matters." },
    { title: "Comparing models", text: "Confidence intervals and paired tests show whether a leaderboard gap is larger than chance." },
    { title: "Reporting deep-learning results", text: "Results that change with the random seed are reported as mean ± SD over several runs." },
    { title: "Classifier probabilities", text: "A model’s predicted P(spam | words) is a conditional probability; calibrated outputs can be combined with Bayes’ rule when base rates change." },
  ],

  mistakes: [
    { kind: "mistake", title: "Confusing P(A | B) with P(B | A)", text: "“The test catches 90% of cases” is P(+ | ill). The patient wants P(ill | +), which here is 26.9%." },
    { kind: "mistake", title: "Ignoring the base rate", text: "The same test is excellent in one population and misleading in another. Always ask how common the outcome is." },
    { kind: "mistake", title: "Reporting one run", text: "A single seed or a single split can be lucky. Repeat, and report the spread." },
    { kind: "misconception", title: "“A bigger test set changes the accuracy”", text: "It doesn’t change the true accuracy; it makes the estimate of it less noisy." },
    {
      kind: "limitation",
      title: "The formula assumes independent examples",
      text: "If test examples come in groups (several images per patient), the real uncertainty is larger than √(p(1 − p)/n) suggests.",
    },
  ],

  exercise: {
    prompt: [
      {
        type: "p",
        text: "A spam filter flags 95% of spam and wrongly flags 2% of genuine emails. 10% of all emails are spam.",
      },
      {
        type: "list",
        ordered: true,
        items: [
          "Out of 1,000 emails, how many are flagged, and how many of those are really spam?",
          "What is P(spam | flagged)?",
          "The filter is tested on 400 emails and gets 92% right. What is the standard error of that accuracy, and a rough 95% range?",
        ],
      },
    ],
    hints: ["Start with 100 spam and 900 genuine emails.", "SE = √(p(1 − p)/n); a 95% range is about ±2 SE."],
    solution: [
      { type: "p", text: "1. Spam flagged: 95% of 100 = 95. Genuine flagged: 2% of 900 = 18. Flagged in total: 113." },
      { type: "p", text: "2. P(spam | flagged) = 95 ÷ 113 ≈ 84.1%." },
      { type: "p", text: "3. SE = √(0.92 × 0.08 / 400) ≈ 0.0136, about 1.4 points; a rough 95% range is 92% ± 2.7, about 89% to 95%." },
    ],
  },

  quiz: [
    {
      question: "A test has sensitivity 99%. What does that mean?",
      options: ["99% of positive results are correct", "99% of people with the condition test positive", "99% of people test negative", "The test is right 99% of the time"],
      answer: 1,
      explanation: "Sensitivity is P(positive | condition). How many positives are correct depends on prevalence too.",
    },
    {
      question: "Prevalence 1%, sensitivity 90%, specificity 95%. Roughly what share of positive results are real?",
      options: ["About 90%", "About 50%", "About 15%", "About 1%"],
      answer: 2,
      explanation: "Per 1,000: 9 true positives and 49.5 false positives, so 9 ÷ 58.5 ≈ 15.4%.",
    },
    {
      question: "How does the standard error of an accuracy change if the test set is four times larger?",
      options: ["It quadruples", "It halves", "It stays the same", "It falls to a quarter"],
      answer: 1,
      explanation: "SE ∝ 1/√n, and √4 = 2.",
    },
    {
      question: "Model A scores 83% and model B 81%, each on the same 200 test examples. What can you conclude?",
      options: ["A is better", "B is better", "Not much yet: the gap is within ordinary chance variation", "The test set is broken"],
      answer: 2,
      explanation: "Each score has a standard error of about 2.7 points. Use more data, repeated runs or a paired test before claiming a difference.",
    },
    {
      question: "Five training seeds give 0.812, 0.798, 0.825, 0.806 and 0.791. Which report is most honest?",
      options: ["0.825 (the best run)", "0.806 ± 0.013 over 5 seeds", "0.812 (the first run)", "0.80–0.83"],
      answer: 1,
      explanation: "The mean with the sample standard deviation and the number of runs lets readers judge the spread. Reporting the best run overstates the result.",
    },
  ],

  glossary: [
    { term: "Mean", definition: "The average: the sum divided by the count." },
    { term: "Variance", definition: "The average squared distance from the mean." },
    { term: "Standard deviation", definition: "The square root of the variance, in the data’s own units." },
    { term: "Distribution", definition: "How likely each possible value of a random quantity is." },
    { term: "Conditional probability", definition: "P(A | B): how likely A is when B is known to be true." },
    { term: "Bayes’ rule", definition: "P(A | B) = P(B | A)·P(A) / P(B)." },
    { term: "Prevalence (base rate)", definition: "How common the condition or outcome is before any test." },
    { term: "Sensitivity, specificity", definition: "P(positive | condition) and P(negative | no condition)." },
    { term: "Standard error", definition: "The standard deviation of an estimate, such as a measured accuracy." },
    { term: "Confidence interval", definition: "A range, built from the data, that would contain the true value in a stated share (such as 95%) of repeated studies." },
  ],

  references: [
    {
      title: "Mathematics for Machine Learning, chapter 6 (Probability and Distributions)",
      source: "Deisenroth, Faisal & Ong, Cambridge University Press, 2020",
      url: "https://mml-book.github.io/",
      note: "Free PDF. Probability, conditional probability, Bayes’ theorem, expectation and variance.",
    },
    {
      title: "Deep Learning, chapter 3 (Probability and Information Theory)",
      source: "Goodfellow, Bengio & Courville, MIT Press, 2016",
      url: "https://www.deeplearningbook.org/",
      note: "Free online textbook; the probability used throughout deep learning.",
    },
    {
      title: "Accounting for Variance in Machine Learning Benchmarks",
      source: "Bouthillier et al., Proceedings of MLSys, 2021",
      url: "https://arxiv.org/abs/2103.03098v1",
      note: "Shows that data sampling, initialisation and hyperparameter choice can change benchmark conclusions, and recommends how to account for it.",
    },
  ],

  next: [
    { pathSlug: "math-foundations", topicSlug: "derivatives-gradients", reason: "The next tool: how a model’s output changes when its parameters change." },
    { pathSlug: "ml-foundations", topicSlug: "metrics-cross-validation", reason: "Precision, recall and cross-validation build directly on these ideas." },
    { pathSlug: "research-paper-writing", topicSlug: "reproducibility-tracking", reason: "Reporting seeds, spread and uncertainty in a paper." },
  ],

  teaching: {
    notes: [
      "Ask the screening question cold before the lesson and collect answers; then work it with 1,000 people on the board.",
      "In panel 2, set n = 20 and let the class call out where they think the bars will fall before showing them.",
      "Tie standard error to the train/validation/test lesson: a test score is an estimate, and estimates have error bars.",
    ],
    demo: "Give each student 20 coin flips and ask them to record the share of heads. Plot the class’s results on the board: a spread around 50%. Then pool everyone’s flips — the pooled share lands much closer to 50%. That is the standard error shrinking with n.",
    discussion: [
      "A hospital adopts a test that is “95% accurate”. What extra information would you ask for before trusting a positive result?",
      "Why might a paper report the best of five seeds? What would you need to judge it fairly?",
      "When would grouped test examples make a reported confidence interval too narrow?",
    ],
    misconceptions: [
      "“High accuracy means a positive result is probably right.” Only if the condition isn’t rare.",
      "“Two decimal places of accuracy means the number is precise to two decimal places.”",
      "“Random seed variation is just noise to ignore.” It is part of the result and should be reported.",
    ],
    challenge: {
      prompt:
        "How large must a test set be for the standard error of an accuracy near 80% to be at most 1 percentage point? And why do differences between two models measured on the same examples often need fewer examples to detect than this suggests?",
      answer: [
        { type: "p", text: "√(0.8 × 0.2 / n) ≤ 0.01 ⇒ n ≥ 0.16 / 0.0001 = 1,600 examples." },
        {
          type: "p",
          text: "When both models are scored on the same examples, they get most of them right or wrong together. Only the examples where they disagree carry information about the difference, and the paired comparison removes the shared noise — so its uncertainty is usually smaller than that of either score alone.",
        },
      ],
    },
  },
};
