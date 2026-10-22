import type { Lesson } from "../../types/content";

/*
 * Data: src/content/datasets/student-jobs.ts (invented). Every number quoted below
 * was computed with scikit-learn and is checked against the browser lab in
 * tests/lab-math.test.ts.
 */
export const supervisedUnsupervised: Lesson = {
  id: "supervised-unsupervised",
  pathSlug: "ml-foundations",
  topicSlug: "supervised-unsupervised",
  title: "Supervised and unsupervised learning",
  summary:
    "Give a method labelled examples and it learns to predict the label. Give it the same data without labels and it can only look for structure — which may or may not be the structure you care about. This lesson runs both on the same students.",
  level: "beginner",
  minutes: [35, 50],
  objectives: [
    "Tell **supervised** from **unsupervised** learning by what the method is given",
    "Classify a problem as supervised, unsupervised or neither, with examples from real applications",
    "Explain why unsupervised results are harder to evaluate than supervised ones",
    "Recognise reinforcement and self-supervised learning as further ways to learn from data",
  ],
  prerequisites: [
    { label: "Features, labels, datasets and predictions", href: "/learn/ml-foundations/features-labels-datasets" },
    { label: "Regression and classification (helpful, not required)", href: "/learn/ml-foundations/regression-classification" },
  ],

  intro: [
    {
      type: "p",
      text: "So far every model in this path has learned from examples with answers: study hours **and** the exam score, records **and** whether the student passed. That is supervised learning, and it is the most common kind in practice.",
    },
    {
      type: "p",
      text: "But often the answers don’t exist. A shop has millions of purchase records and no column saying what kind of customer each one is. Unsupervised learning looks for structure in data like that. This lesson puts the two side by side on the same 40 students, and shows what each can and cannot tell you.",
    },
  ],

  why: [
    {
      type: "p",
      text: "Which kind of learning a problem needs decides almost everything after it: what data you must collect, which methods apply and — most importantly — how you will know whether the result is any good.",
    },
    {
      type: "p",
      text: "Labels are what make results checkable. With them you can measure accuracy on held-out data. Without them there is no right answer to compare against, and unsupervised results need judgement, domain knowledge or a later supervised test to mean anything.",
    },
  ],

  explanation: {
    beginner: [
      {
        type: "p",
        text: "**Supervised learning** means learning from examples that come with the answer you want — the **label** or **target**. The model sees inputs and correct outputs, and learns a rule from one to the other. Regression (predict a number) and classification (predict a category) are both supervised.",
      },
      {
        type: "p",
        text: "**Unsupervised learning** means the data has no label. The method only sees the features and looks for structure: groups of similar rows (**clustering**), or a few combinations of features that capture most of the variation (**dimensionality reduction**).",
      },
      {
        type: "p",
        text: "The catch: an unsupervised method finds whatever structure is strongest in the features you give it. Nobody tells it which question you care about. In the experiment, grouping students by study and work hours splits them by **who has a job**, not by **who passed** — both are real patterns, but only one was the question.",
      },
      {
        type: "p",
        text: "Some problems are **neither**. If a fixed rule already gives the answer (“a fine is charged when a book is 14 days late”), there is nothing to learn. And **reinforcement learning** is a third kind: an agent learns from rewards for its actions, not from labelled examples.",
      },
    ],
    technical: [
      {
        type: "p",
        text: "Supervised learning estimates a function f from pairs (xᵢ, yᵢ), usually by minimising a loss between f(xᵢ) and yᵢ. Because y is observed, generalisation error can be estimated directly on held-out pairs.",
      },
      {
        type: "p",
        text: "Unsupervised learning has only x₁ … xₙ. It models the data’s distribution or structure: clusters (k-means minimises within-cluster squared distance), low-dimensional directions (PCA maximises variance), or densities. These objectives are defined by the features and the distance you choose; there is no external target, so there is no single correct answer to score against.",
      },
      {
        type: "p",
        text: "Evaluation is therefore indirect: internal criteria (inertia, silhouette), stability across resamples, agreement with labels collected later (external validation), or usefulness in a downstream supervised task.",
      },
      {
        type: "p",
        text: "Between the two sit **semi-supervised** learning (a few labels, many unlabelled rows) and **self-supervised** learning, which makes labels from the data itself — predicting a hidden word from its context, for example. Large language models are pretrained this way. **Reinforcement learning** optimises a policy from rewards for actions over time.",
      },
    ],
  },

  analogy: {
    title: "Sorting a box of photographs",
    blocks: [
      {
        type: "p",
        text: "Supervised: someone hands you 200 photos, each labelled with the city it was taken in, and asks you to label new ones. You know exactly what you’re aiming for and can be marked right or wrong.",
      },
      {
        type: "p",
        text: "Unsupervised: you get a box of unlabelled photos and are asked to “sort them into piles”. You might sort by city, by season, by who is in them or by colour. Every sort is defensible; whether it’s useful depends on what the person wanted — which you were never told.",
      },
      {
        type: "p",
        text: "Where it breaks down: a person sorting photos brings understanding. An algorithm sorts only by the numbers it is given, using the distance you chose.",
      },
    ],
  },

  workedExample: {
    title: "Forty students, two questions",
    blocks: [
      {
        type: "p",
        text: "Each student has two features — weekly study hours and weekly hours of paid work — and two possible labels: whether they **passed**, and whether they **have a job**. Half the students work about 20 hours a week; the others about 3. Passing depends on study hours.",
      },
      {
        type: "p",
        text: "**Supervised, with the “passed” labels.** Logistic regression learns P(pass) = σ(1.41 × study − 0.02 × work − 11.81). The tiny weight on work hours shows it learned that work doesn’t matter for passing here. It gets 38 of the 40 training students right and **19 of 20 held-out students** — a number we can only compute because those students have labels.",
      },
      {
        type: "p",
        text: "**Unsupervised, no labels.** k-means is asked for two groups using both features. It finds centres at about (9.0 h study, 3.3 h work) and (9.9 h study, 20.6 h work): it has split the students by work hours. Revealing the labels afterwards:",
      },
      {
        type: "table",
        caption: "How well two-group k-means matches each label (40 students)",
        head: ["Features given to k-means", "Matches “has a job”", "Matches “passed”"],
        rows: [
          ["Study and work hours", "39 of 40", "22 of 40"],
          ["Study hours only", "22 of 40", "39 of 40"],
        ],
      },
      {
        type: "p",
        text: "Same students, same method, opposite results. k-means always splits along the largest difference in the features it receives. Work hours vary far more (0 to about 26) than study hours (about 3 to 16), and they fall into two clear bunches, so with both features, work wins. 22 of 40 is barely better than tossing a coin.",
      },
      {
        type: "callout",
        tone: "honesty",
        title: "We could check only because we had the labels",
        text: "In a real unsupervised problem the last step — comparing with labels — is impossible. You would see two tidy groups and have to decide yourself what they mean.",
      },
    ],
  },

  math: {
    blocks: [
      {
        type: "equation",
        expression: "Supervised:   data = {(x₁, y₁), …, (xₙ, yₙ)}   →   learn f with f(x) ≈ y",
        meaning: "Every example comes with its answer y. Success is measured by comparing f(x) with y on new examples.",
      },
      {
        type: "equation",
        expression: "Unsupervised:   data = {x₁, …, xₙ}   →   find structure in x",
        meaning: "No y at all. The method optimises something defined by the features alone.",
      },
      {
        type: "equation",
        expression: "k-means:   minimise  Σᵢ ‖xᵢ − μ_c(i)‖²",
        meaning: "Choose k centres μ and assign each point to one, keeping points close to their centre. Note that y appears nowhere in this objective.",
      },
      {
        type: "equation",
        expression: "agreement = max over matchings of (points whose group matches their label) / n",
        meaning: "Only possible when labels exist. Group numbers are arbitrary, so group 1 may correspond to either label value.",
      },
    ],
    notation: [
      { symbol: "xᵢ", meaning: "The features of example i (here: study hours, work hours)" },
      { symbol: "yᵢ", meaning: "The label of example i (here: passed or not)" },
      { symbol: "f", meaning: "The function a supervised method learns" },
      { symbol: "μ_c", meaning: "The centre of cluster c" },
      { symbol: "c(i)", meaning: "The cluster example i is assigned to" },
    ],
  },

  process: {
    title: "Deciding what kind of learning a problem needs",
    steps: [
      { title: "Write the question", text: "One sentence: what do you want to predict or discover, and for whom?" },
      { title: "Look for the answer column", text: "If a label exists for enough past examples — or can be collected — the problem is supervised." },
      { title: "Check whether a rule already exists", text: "If a fixed, known rule gives the answer, use the rule. No learning is needed." },
      { title: "No labels? Say what structure you want", text: "Groups, a lower-dimensional view, or unusual rows. Choose features and a distance that reflect that goal." },
      { title: "Plan the evaluation now", text: "Supervised: a held-out test set. Unsupervised: stability checks, expert review, or labels collected for a sample." },
    ],
  },

  interactive: {
    component: "learning-types-lab",
    kind: "computation",
    intro:
      "The same 40 students in both modes. In supervised mode logistic regression is trained on the pass/fail labels; in unsupervised mode k-means sees only the two features. Both are computed in your browser.",
    tryThis: [
      "In supervised mode, find the two training students the model gets wrong. Why are they hard?",
      "Tick **Show 20 held-out students** and count the mistakes.",
      "Switch to unsupervised mode. Before comparing with anything, decide what you think the two groups are.",
      "Compare the groups with **Passed or failed**, then with **Has a job**.",
      "Now group by **Study hours only** and compare again.",
    ],
    expect: [
      { action: "Supervised mode", result: "A nearly vertical boundary at about 8.6 study hours; 38 of 40 training students and 19 of 20 held-out students right." },
      { action: "Unsupervised, both features", result: "Two groups split by work hours: they match “has a job” for 39 of 40 students and “passed” for only 22." },
      { action: "Unsupervised, study hours only", result: "The groups now split at about 9 study hours and match “passed” for 39 of 40 students — but “has a job” for only 22." },
    ],
  },

  code: {
    label: "supervised_vs_unsupervised.py",
    language: "Python",
    source: `import numpy as np
from sklearn.cluster import KMeans
from sklearn.linear_model import LogisticRegression

# The lesson's students: weekly study hours, weekly work hours,
# has a job (1) or not (0), passed (1) or failed (0).
rng = np.random.default_rng(3)
def make(n_each):
    work = np.r_[rng.normal(3, 2, n_each).clip(0, None), rng.normal(20, 3, n_each)]
    study = rng.uniform(2, 16, 2 * n_each)
    job = np.r_[np.zeros(n_each, int), np.ones(n_each, int)]
    passed = (study + rng.normal(0, 1.2, 2 * n_each) > 8).astype(int)
    return np.c_[study.round(1), work.round(1)], job, passed

X, job, passed = make(20)          # 40 students to learn from
X_new, _, passed_new = make(10)    # 20 held-out students

# Supervised: features AND the label we care about.
clf = LogisticRegression().fit(X, passed)
print("held-out accuracy:", clf.score(X_new, passed_new))

# Unsupervised: features only. No label goes in.
groups = KMeans(n_clusters=2, n_init=10, random_state=0).fit_predict(X)

def agreement(groups, label):
    same = (groups == label).mean()
    return max(same, 1 - same)     # group numbers are arbitrary

print("groups match 'has a job':", agreement(groups, job))
print("groups match 'passed':   ", agreement(groups, passed))`,
    walkthrough: [
      { lines: "7–13", text: "Regenerates exactly the lesson’s students from a fixed seed. Passing depends on study hours plus some noise; work hours play no part." },
      { lines: "15–16", text: "40 students to learn from and 20 held-out students. Note that `make` returns labels for both — in a real unsupervised problem they would not exist." },
      { lines: "19–20", text: "Supervised: `fit(X, passed)` takes the features **and** the labels. The score on held-out students is a direct measure of quality." },
      { lines: "23", text: "Unsupervised: `fit_predict(X)` takes only the features. `n_init=10` runs k-means from ten random starts and keeps the best." },
      { lines: "25–27", text: "k-means numbers its groups arbitrarily, so group 0 might correspond to label 1. The agreement takes whichever matching is better." },
    ],
    shapes: [
      { name: "X", shape: "(40, 2)", meaning: "Study hours and work hours for the training students" },
      { name: "job, passed", shape: "(40,)", meaning: "Two different labels for the same students" },
      { name: "X_new, passed_new", shape: "(20, 2), (20,)", meaning: "Held-out students for the supervised check" },
      { name: "groups", shape: "(40,)", meaning: "The k-means group of each student: 0 or 1" },
    ],
    output: {
      label: "Output",
      text: "held-out accuracy: 0.95\ngroups match 'has a job': 0.975\ngroups match 'passed':    0.55",
      note: "Produced by running the script with scikit-learn 1.9. The experiment computes the same models and gives the same numbers.",
    },
  },

  useCases: [
    { title: "Supervised: spam filtering", text: "Users mark emails as spam, which supplies labels. The model learns to predict the label for new emails, and its error rate can be measured." },
    {
      title: "Supervised: predicting crop yield",
      text: "Past seasons’ rainfall, soil and fertiliser records, labelled with the yield actually harvested, train a regression model.",
    },
    {
      title: "Unsupervised: customer segments",
      text: "Purchase histories have no “segment” column. Clustering proposes groups; marketers then decide whether the groups are meaningful and useful.",
    },
    {
      title: "Unsupervised: anomaly detection",
      text: "Unusual card transactions or sensor readings are flagged because they are far from typical data — often before anyone has labelled a single fraud or fault.",
    },
    {
      title: "Self-supervised: language models",
      text: "Predicting the next word of real text needs no human labels: the text supplies its own answers. This is how large language models are pretrained.",
    },
  ],

  mistakes: [
    {
      kind: "mistake",
      title: "Reading meaning into clusters",
      text: "Clusters are groups that are close in the features you supplied. Naming them (“the struggling students”) is your interpretation and needs evidence.",
    },
    {
      kind: "mistake",
      title: "Clustering when a label exists",
      text: "If you have the label you care about, use it. A supervised model aims at the question directly; clustering may find a different pattern, as in the experiment.",
    },
    {
      kind: "misconception",
      title: "“Unsupervised means the model figures out what matters”",
      text: "It finds what dominates the features and distance you chose. Change the features — or their units — and the groups change.",
    },
    {
      kind: "misconception",
      title: "“Unsupervised learning has no assumptions”",
      text: "Choosing the features, the number of clusters and the distance are all assumptions, just as strong as choosing a label.",
    },
    {
      kind: "limitation",
      title: "Labels can be wrong too",
      text: "Supervised learning inherits the quality of its labels. Inconsistent or biased labelling teaches the model the inconsistency or the bias.",
    },
  ],

  exercise: {
    prompt: [
      { type: "p", text: "For each problem, decide: supervised (and is it regression or classification?), unsupervised, or neither. Name the label where there is one." },
      {
        type: "list",
        ordered: true,
        items: [
          "Predict tomorrow’s electricity demand from past demand and weather records.",
          "Group 5,000 news articles by topic; nobody has tagged them.",
          "Decide whether a library book is overdue, given its due date and today’s date.",
          "Detect whether an X-ray shows a fracture, using 10,000 X-rays labelled by radiologists.",
          "Find unusual login attempts on a server that has never recorded an attack.",
        ],
      },
    ],
    hints: [
      "Ask: is there a column of correct answers for past examples?",
      "If the answer is a number, it is regression; if it is a category, classification.",
      "If a simple known rule settles the question exactly, there is nothing to learn.",
    ],
    solution: [
      { type: "p", text: "1. Supervised regression. Label: the demand actually recorded on each past day." },
      { type: "p", text: "2. Unsupervised (clustering). There are no topic labels; the clusters would need human review to name and check." },
      { type: "p", text: "3. Neither. Comparing two dates is an exact rule." },
      { type: "p", text: "4. Supervised classification. Label: fracture or no fracture, from the radiologists." },
      {
        type: "p",
        text: "5. Unsupervised (anomaly detection), because no attacks are labelled. Once some flagged logins are investigated and labelled, a supervised model becomes possible.",
      },
    ],
  },

  quiz: [
    {
      question: "What is the defining difference between supervised and unsupervised learning?",
      options: [
        "Supervised learning uses more data",
        "Supervised learning is given the correct answer (label) for each training example; unsupervised is not",
        "Unsupervised learning has no parameters",
        "Supervised learning always uses neural networks",
      ],
      answer: 1,
      explanation: "It is about what the method is given. With labels, it learns to predict them; without, it can only look for structure in the features.",
    },
    {
      question: "In the experiment, k-means with both features matched “has a job” for 39 of 40 students but “passed” for only 22. Why?",
      options: [
        "k-means is broken",
        "Work hours vary much more than study hours, so the biggest structure in the features is who works",
        "Passing is random",
        "k-means needs at least three groups",
      ],
      answer: 1,
      explanation: "k-means splits along the largest differences in the features it is given. Nothing told it that passing was the question.",
    },
    {
      question: "Why are unsupervised results harder to evaluate?",
      options: [
        "They are always wrong",
        "There is no correct answer to compare against, so quality must be judged indirectly",
        "They take longer to compute",
        "They cannot be plotted",
      ],
      answer: 1,
      explanation: "Without labels there is no accuracy to compute. You rely on internal criteria, stability, expert judgement or labels collected later.",
    },
    {
      question: "A language model learns by predicting the next word of web text. What kind of learning is this usually called?",
      options: ["Unsupervised clustering", "Reinforcement learning", "Self-supervised learning", "Not learning at all"],
      answer: 2,
      explanation: "The labels (the next words) come from the data itself, without human labelling. That is self-supervised learning.",
    },
    {
      question: "Which problem needs no machine learning at all?",
      options: [
        "Predicting house prices from past sales",
        "Grouping customers by purchase history",
        "Charging a fee when a book is returned more than 14 days late",
        "Recognising handwritten digits",
      ],
      answer: 2,
      explanation: "A fixed, known rule gives the exact answer. Learning a model would only add the chance of errors.",
    },
  ],

  glossary: [
    { term: "Supervised learning", definition: "Learning a mapping from features to a label, using examples where the label is known." },
    { term: "Unsupervised learning", definition: "Finding structure in data that has no labels." },
    { term: "Label (target)", definition: "The answer a supervised model learns to predict." },
    { term: "Clustering", definition: "Grouping rows so that rows in the same group are similar in the chosen features." },
    { term: "k-means", definition: "A clustering method that places k centres and assigns each row to the nearest one, keeping rows close to their centre." },
    { term: "Dimensionality reduction", definition: "Representing data with fewer features while keeping most of its variation; PCA is the classic method." },
    { term: "Self-supervised learning", definition: "Learning from labels created from the data itself, such as the next word in a sentence." },
    { term: "Reinforcement learning", definition: "Learning which actions to take from rewards received over time." },
    { term: "Semi-supervised learning", definition: "Learning from a few labelled examples together with many unlabelled ones." },
  ],

  references: [
    {
      title: "An Introduction to Statistical Learning (2nd ed.), section 2.1.4 and chapter 12",
      source: "James, Witten, Hastie & Tibshirani, Springer, 2021",
      url: "https://www.statlearning.com/",
      note: "Supervised versus unsupervised learning, and “the challenge of unsupervised learning”: there is no simple goal such as predicting a response.",
    },
    {
      title: "Clustering: k-means",
      source: "scikit-learn User Guide, section 2.3",
      url: "https://scikit-learn.org/stable/modules/clustering.html",
      note: "How k-means works and what its objective (inertia) does and does not measure.",
    },
    {
      title: "Reinforcement Learning: An Introduction (2nd ed.), chapter 1",
      source: "Sutton & Barto, MIT Press, 2018",
      note: "Explains how learning from rewards differs from both supervised and unsupervised learning.",
    },
  ],

  next: [
    { pathSlug: "ml-foundations", topicSlug: "clustering-dimensionality-reduction", reason: "How k-means and PCA work step by step, and why scaling changes their answers." },
    { pathSlug: "ml-foundations", topicSlug: "regression-classification", reason: "The two main kinds of supervised problem, with first models for each." },
    { pathSlug: "llms-generative-ai", topicSlug: "next-token-prediction", reason: "Self-supervised learning at scale: how language models learn from raw text." },
  ],

  teaching: {
    notes: [
      "Start with the exercise list on the board and let pairs sort the problems before any definitions; the arguments over items 3 and 5 introduce “neither” and anomaly detection naturally.",
      "In the experiment, ask the class to name the two unsupervised groups before revealing any labels, then check their guesses against both labels.",
      "Stress that the comparison with labels is a teaching device: real unsupervised problems don’t have it.",
    ],
    demo: "Give groups of students a pile of mixed objects (pens, coins, leaves, keys) and ask each group to “sort them into two piles” without further instructions. Compare the sorts — by colour, size, material, use — then ask which sort is correct. Connect this to the experiment: k-means sorted by the biggest difference it could see.",
    discussion: [
      "Your clustering found three customer groups. What evidence would convince you they are real and useful?",
      "Can a problem start unsupervised and become supervised later? What would have to happen?",
      "Is it fair to call next-word prediction “unsupervised” when it has a right answer for every word?",
    ],
    misconceptions: [
      "“Unsupervised learning is more advanced than supervised.” They answer different questions.",
      "“Clusters are discovered facts about the world.” They depend on the features, the distance and k.",
      "“If a model has no labels, it cannot be biased.” The choice of features and data still shapes the result.",
    ],
    challenge: {
      prompt:
        "Without changing the data, how could you make two-group k-means match “passed” for most students while still giving it both features? What does your answer say about unsupervised results in general?",
      answer: [
        {
          type: "p",
          text: "Change how distance treats the features. Dividing work hours by a large number (or multiplying study hours) makes study differences dominate, so the split moves to study hours — as when only study hours are used.",
        },
        {
          type: "p",
          text: "The general lesson: the scale and choice of features largely decide which structure an unsupervised method finds. If you tune them until the groups match what you expected, you have quietly used the labels — the result is no longer an independent discovery.",
        },
      ],
    },
  },
};
