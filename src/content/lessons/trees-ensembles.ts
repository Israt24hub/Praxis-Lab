import type { Lesson } from "../../types/content";

/*
 * Data: src/content/datasets/plants.ts (invented). Single-tree numbers match
 * scikit-learn's DecisionTreeClassifier up to depth 5 exactly; deeper trees and the
 * forest are the lab's own and are checked in tests/lab-math.test.ts. scikit-learn's
 * results are quoted separately and labelled as such.
 */
export const treesEnsembles: Lesson = {
  id: "trees-ensembles",
  pathSlug: "ml-foundations",
  topicSlug: "trees-ensembles",
  title: "Decision trees and ensemble methods",
  summary:
    "A decision tree predicts by asking a short series of yes/no questions about the features. One deep tree memorises its training data; a forest of many trees, each trained a little differently, averages that noise away. This lesson grows both in the browser.",
  level: "beginner",
  minutes: [45, 60],
  objectives: [
    "Trace how a decision tree turns a row of features into a prediction",
    "Explain how a tree chooses each split using **Gini impurity**",
    "Control a tree’s **depth** to avoid underfitting and overfitting",
    "Explain why **random forests** and **gradient boosting** usually beat a single tree",
  ],
  prerequisites: [
    { label: "Regression and classification", href: "/learn/ml-foundations/regression-classification" },
    { label: "Overfitting, underfitting and generalization", href: "/learn/ml-foundations/overfitting-generalization" },
  ],

  intro: [
    {
      type: "p",
      text: "Logistic regression separates classes with a single straight line. Many real patterns aren’t like that. A houseplant thrives with **enough** water for its light, but not **too much** — the thriving plants form a diagonal band, and no single line can carve out a band.",
    },
    {
      type: "p",
      text: "A decision tree takes another approach: it asks a question such as “is water ≤ 8.45 cups?”, then another, and another, cutting the feature space into boxes. This lesson shows how those questions are chosen, why too many of them overfit, and how combining hundreds of trees fixes most of the problem.",
    },
  ],

  why: [
    {
      type: "p",
      text: "Trees handle non-linear patterns and interactions between features without any feature engineering, need no feature scaling, and a small tree can be read and checked by a person. That makes them a common choice where decisions must be explained.",
    },
    {
      type: "p",
      text: "Ensembles of trees — random forests and gradient boosting — are among the strongest general-purpose methods for tabular data: spreadsheets of rows and columns, which is what most business, health and science datasets are.",
    },
  ],

  explanation: {
    beginner: [
      {
        type: "p",
        text: "**Predicting with a tree.** Start at the top (the **root**). Each **node** asks about one feature: “is light ≤ 7.05 hours?” Go left for yes, right for no. When you reach a **leaf**, predict the most common class among the training examples that ended up there.",
      },
      {
        type: "p",
        text: "**Growing a tree.** At the root, the algorithm tries every feature and every possible threshold, and keeps the split whose two halves are **purest** — each half as close as possible to all one class. Then it repeats the search inside each half, and so on. It stops when a node is pure, or when the tree reaches its **maximum depth**.",
      },
      {
        type: "p",
        text: "**Depth is complexity.** A depth-1 tree asks one question. A tree with no limit keeps splitting until every leaf is pure — memorising every noisy label, just like the degree-11 polynomial in the overfitting lesson. So depth is chosen on validation data.",
      },
      {
        type: "p",
        text: "**Forests.** A random forest grows many deep trees, each on a different random resample of the training data, and each choosing from a random subset of features at every split. Each tree overfits, but in different ways; averaging their votes cancels much of the noise.",
      },
      {
        type: "p",
        text: "**Boosting** builds trees one after another instead. Each new, small tree concentrates on the mistakes the trees before it still make. Gradient boosting libraries such as XGBoost and LightGBM are built on this idea.",
      },
    ],
    technical: [
      {
        type: "p",
        text: "CART grows a binary tree greedily. At a node with examples Q, a candidate split θ = (feature j, threshold t) sends xⱼ ≤ t left and the rest right. Thresholds are midpoints between consecutive distinct values of xⱼ.",
      },
      {
        type: "p",
        text: "The split chosen minimises the weighted impurity of the children, G(Q, θ) = (n_L/n)·H(Q_L) + (n_R/n)·H(Q_R), where H is Gini impurity 1 − Σₖ pₖ² (or entropy). The search is greedy: each split is the best one available at that moment, not the best for the tree as a whole.",
      },
      {
        type: "p",
        text: "Splits are axis-aligned, so a diagonal boundary is approximated by a staircase; deeper trees give finer steps but also fit label noise. Regularisation options include max_depth, min_samples_leaf and cost-complexity pruning (ccp_alpha).",
      },
      {
        type: "p",
        text: "A random forest is **bagging** (bootstrap aggregation) plus random feature subsets at each split (max_features, √p by default for classification). Averaging B trees with pairwise correlation ρ reduces variance roughly to ρσ² + (1 − ρ)σ²/B, which is why decorrelating the trees matters. scikit-learn averages the trees’ predicted probabilities rather than counting votes.",
      },
      {
        type: "p",
        text: "**Gradient boosting** fits an additive model F_M(x) = Σₘ η·hₘ(x): each shallow tree hₘ is fitted to the negative gradient of the loss at the current prediction (for squared error, the residuals), scaled by a learning rate η. Boosting mainly reduces bias; bagging mainly reduces variance.",
      },
    ],
  },

  analogy: {
    title: "A triage flowchart, and a panel of doctors",
    blocks: [
      {
        type: "p",
        text: "A single tree is like a triage flowchart: “Temperature above 38 °C? Yes → Breathing difficulty? …” Easy to follow, easy to audit — but a flowchart written from a few memorable past cases can encode their quirks as rules.",
      },
      {
        type: "p",
        text: "A random forest is like asking 100 doctors, each of whom trained on a different random selection of past patients and pays attention to different symptoms first, then averaging their opinions. Each doctor’s quirks are different, so they tend to cancel.",
      },
      {
        type: "p",
        text: "Where it breaks down: real doctors understand causes. Trees only split on numbers that happened to separate the training examples.",
      },
    ],
  },

  workedExample: {
    title: "Growing trees for 200 houseplants",
    blocks: [
      {
        type: "p",
        text: "Each plant has hours of light per day and cups of water per week. The invented rule behind the labels: a plant thrives when light/2 − 0.5 ≤ water ≤ light/2 + 3. Then 8% of the labels were flipped at random, as noise. 73 of the 200 training plants thrive.",
      },
      {
        type: "p",
        text: "**The first split.** Of all features and thresholds, “water ≤ 8.45” makes the purest children: the 23 plants watered more than that all failed. Both children still have a majority of non-thriving plants, so a depth-1 tree predicts “does not thrive” everywhere — its accuracy doesn’t move, but the split set up the next ones.",
      },
      {
        type: "table",
        caption: "Single trees by maximum depth (200 training plants, 200 validation plants)",
        head: ["Max depth", "Leaves", "Training accuracy", "Validation accuracy"],
        rows: [
          ["1", "2", "63.5%", "58.5%"],
          ["3", "5", "71.5%", "65.5%"],
          ["5", "13", "89.0%", "81.0%"],
          ["6", "22", "93.0%", "84.0%"],
          ["8", "37", "98.5%", "83.0%"],
          ["10 (no further split possible)", "40", "99.5%", "83.0%"],
        ],
      },
      {
        type: "p",
        text: "Validation accuracy peaks at depth 6. Beyond that the extra boxes fit the flipped labels, which don’t repeat in new plants.",
      },
      {
        type: "p",
        text: "**Tracing one plant** with 8 hours of light and 4 cups of water (the rule says it thrives, since 4 ≥ 3.5). The depth-3 tree asks: water ≤ 8.45? yes. Water ≤ 1.65? no. Water ≤ 6.45? yes → a leaf of 98 training plants, 56 of which thrived: **thrives**. The depth-6 tree asks three more questions and lands in a leaf of 27 plants where only 1 thrived: **does not thrive**. The point sits just inside the diagonal band, where the staircase cuts the corner.",
      },
      {
        type: "p",
        text: "**A random forest** of 100 full-depth trees scores **88.5%** on validation — better than any single tree. For the traced plant, 64 of its 100 trees say “thrives”. For comparison, logistic regression, limited to one straight boundary, ends up predicting “does not thrive” for every plant: 58.5%.",
      },
      {
        type: "callout",
        tone: "honesty",
        title: "Small differences from scikit-learn",
        text: "Up to depth 5 the lab’s trees are identical to scikit-learn’s. Deeper, some splits tie exactly, and scikit-learn breaks ties at random (fixed by `random_state`), so its depth-6 tree scores 83.5% and its unlimited tree 81.0%. Its forest, with different random resamples, scores 88.0%. The conclusions are the same.",
      },
    ],
  },

  math: {
    blocks: [
      {
        type: "equation",
        expression: "Gini(node) = 1 − p₀² − p₁²",
        meaning: "0 for a pure node; 0.5 for a 50/50 node. p₀ and p₁ are the fractions of each class in the node. The root here: 1 − 0.635² − 0.365² ≈ 0.464.",
      },
      {
        type: "equation",
        expression: "G(split) = (n_L / n) · Gini(left) + (n_R / n) · Gini(right)",
        meaning: "The impurity after a split, weighting each child by its size. The tree picks the feature and threshold with the smallest G.",
      },
      {
        type: "equation",
        expression: "p̂_forest(x) = (1/B) · Σ_b p̂_b(x)",
        meaning: "A random forest’s probability: the average of B trees’ leaf probabilities. Predict the class with the higher average.",
      },
      {
        type: "equation",
        expression: "F_m(x) = F_{m−1}(x) + η · h_m(x)",
        meaning: "Gradient boosting: each new small tree h_m corrects the current model F_{m−1}, scaled down by a learning rate η.",
      },
    ],
    notation: [
      { symbol: "p₀, p₁", meaning: "Fractions of the two classes in a node" },
      { symbol: "n, n_L, n_R", meaning: "Examples in the node, and in its left and right children" },
      { symbol: "B", meaning: "Number of trees in the forest" },
      { symbol: "p̂_b(x)", meaning: "Tree b’s probability for x: the class fraction in the leaf x reaches" },
      { symbol: "h_m, η", meaning: "The m-th boosting tree and the learning rate" },
    ],
  },

  process: {
    title: "Building a tree-based model",
    steps: [
      { title: "Start with a shallow tree", text: "Fit depth 2–3 and read it. Do the questions make sense? Does a single split look too good to be true (a possible leak)?" },
      { title: "Tune depth on validation", text: "Try a range of max_depth or min_samples_leaf values and choose by validation score or cross-validation." },
      { title: "Try a random forest", text: "Usually little tuning needed: a few hundred trees, default max_features." },
      { title: "Try gradient boosting", text: "Often the most accurate; tune the learning rate, number of trees and tree depth together, with early stopping." },
      { title: "Compare against a baseline", text: "The majority class, and a simple linear model. Report all of them." },
      { title: "Test once", text: "Evaluate only the final chosen model on the untouched test set." },
    ],
  },

  interactive: {
    component: "tree-lab",
    kind: "computation",
    intro:
      "The tree and the forest are trained in your browser on 200 plants and scored on 200 more. The shaded area is where the model predicts a plant will thrive. Move the traced plant to see the exact questions the tree asks.",
    tryThis: [
      "Move the depth from 1 to 10 slowly, watching the shaded region and both accuracy lines.",
      "At depth 1 and 2, why is nothing shaded?",
      "Turn on **Show the rule the data came from**. At depth 6, where does the staircase miss the band?",
      "Keep the traced plant at 8 h and 4 cups. Compare the answer at depth 3, depth 6 and with the random forest.",
      "Switch to the random forest and compare its region and validation score with the best single tree.",
    ],
    expect: [
      { action: "Depths 1–2", result: "Nothing shaded: every leaf still has a majority of non-thriving plants, so accuracy stays at 63.5% training, 58.5% validation." },
      { action: "Depth 6", result: "The best single tree: 93.0% training, 84.0% validation, 22 leaves." },
      { action: "Depths 8–10", result: "Training accuracy climbs to 99.5%; validation falls back to 83.0%. Small boxes appear around single noisy plants." },
      { action: "Traced plant (8 h, 4 cups)", result: "Depth 3 predicts thrives (56 of 98 in its leaf); depth 6 predicts it does not (1 of 27); the forest says thrives (64 of 100 trees)." },
      { action: "Random forest", result: "88.5% on validation, with a smoother region that follows the diagonal band more closely." },
    ],
  },

  code: {
    label: "trees_and_forests.py",
    language: "Python",
    source: `import numpy as np
from sklearn.ensemble import GradientBoostingClassifier, RandomForestClassifier
from sklearn.tree import DecisionTreeClassifier, export_text

# The lesson's plants: hours of light, cups of water, thrives or not.
rng = np.random.default_rng(1)
def make(n):
    light = rng.uniform(1, 13, n).round(1)
    water = rng.uniform(0, 10, n).round(1)
    thrives = ((water >= light / 2 - 0.5) & (water <= light / 2 + 3)).astype(int)
    flip = rng.random(n) < 0.08                    # 8% of labels flipped
    return np.c_[light, water], np.where(flip, 1 - thrives, thrives)

X, y = make(200)            # training plants
X_val, y_val = make(200)    # validation plants

for depth in [3, 6, None]:
    tree = DecisionTreeClassifier(max_depth=depth, random_state=0).fit(X, y)
    print(f"tree, max_depth={depth}: train {tree.score(X, y):.3f}, "
          f"validation {tree.score(X_val, y_val):.3f}")

forest = RandomForestClassifier(n_estimators=100, random_state=0).fit(X, y)
boost = GradientBoostingClassifier(random_state=0).fit(X, y)
print(f"random forest:     validation {forest.score(X_val, y_val):.3f}")
print(f"gradient boosting: validation {boost.score(X_val, y_val):.3f}")

small = DecisionTreeClassifier(max_depth=3, random_state=0).fit(X, y)
print(export_text(small, feature_names=["light", "water"]))`,
    walkthrough: [
      { lines: "6–12", text: "Regenerates the lesson’s plants from a fixed seed: the diagonal-band rule, then 8% of labels flipped." },
      { lines: "17–20", text: "Trees of depth 3, 6 and unlimited (`None`). `random_state=0` fixes how ties between equally good splits are broken." },
      { lines: "22", text: "100 trees, each on a bootstrap sample, each split choosing from √2 → 1 random feature." },
      { lines: "23", text: "Gradient boosting with scikit-learn’s defaults: 100 trees of depth 3, learning rate 0.1." },
      { lines: "27–28", text: "`export_text` prints the depth-3 tree as nested questions — the same tree you can trace in the experiment." },
    ],
    shapes: [
      { name: "X, X_val", shape: "(200, 2)", meaning: "Light and water for the training and validation plants" },
      { name: "y, y_val", shape: "(200,)", meaning: "1 if the plant thrived, else 0" },
      { name: "forest.estimators_", shape: "list of 100 trees", meaning: "The individual trees inside the forest" },
    ],
    output: {
      label: "Output",
      text: `tree, max_depth=3: train 0.715, validation 0.655
tree, max_depth=6: train 0.930, validation 0.835
tree, max_depth=None: train 0.995, validation 0.810
random forest:     validation 0.880
gradient boosting: validation 0.840
|--- water <= 8.45
|   |--- water <= 1.65
|   |   |--- light <= 1.50
|   |   |   |--- class: 1
|   |   |--- light >  1.50
|   |   |   |--- class: 0
|   |--- water >  1.65
|   |   |--- water <= 6.45
|   |   |   |--- class: 1
|   |   |--- water >  6.45
|   |   |   |--- class: 0
|--- water >  8.45
|   |--- class: 0`,
      note: "Produced by running the script with scikit-learn 1.9. The depth-3 tree is identical to the lab’s. The deeper tree and the forest differ slightly from the lab’s, as explained in the worked example.",
    },
  },

  useCases: [
    {
      title: "Credit and insurance decisions",
      text: "Shallow trees, or rules extracted from them, are used where a decision must be explained to a customer or a regulator.",
    },
    {
      title: "Tabular prediction in industry and research",
      text: "Gradient-boosted trees are a standard first choice for structured data such as sales, sensor logs or patient records, and often match or beat neural networks there.",
    },
    {
      title: "Finding a leak",
      text: "If a depth-1 tree already scores almost perfectly, the single feature it splits on deserves suspicion — it may encode the answer.",
    },
    {
      title: "Ecology and remote sensing",
      text: "Random forests are widely used to predict species presence or land cover from many environmental measurements.",
    },
  ],

  mistakes: [
    {
      kind: "mistake",
      title: "Growing trees without a depth limit",
      text: "An unlimited tree fits every noisy label: 99.5% training accuracy here, but worse validation accuracy than depth 6.",
    },
    {
      kind: "mistake",
      title: "Trusting impurity-based feature importance",
      text: "The default `feature_importances_` is computed on training data and favours features with many distinct values. Permutation importance on validation data is more reliable.",
    },
    {
      kind: "misconception",
      title: "“A split that doesn’t change accuracy is useless”",
      text: "The first split here leaves accuracy unchanged, yet it isolates 23 pure plants and makes the next splits possible. Trees are judged by impurity, step by step.",
    },
    {
      kind: "misconception",
      title: "“A forest is just a bigger tree”",
      text: "A forest averages many different trees. That reduces variance in a way no single tree, however large, can.",
    },
    {
      kind: "limitation",
      title: "Trees cannot extrapolate",
      text: "Outside the range of the training data, a tree predicts whatever its outermost leaf says. A regression tree never predicts above the largest training target.",
    },
    {
      kind: "limitation",
      title: "Small data changes can reshape a tree",
      text: "Because splits are chosen greedily, removing a few rows can change the root split and everything below it. Forests are much more stable.",
    },
  ],

  exercise: {
    prompt: [
      { type: "p", text: "A node holds 10 plants: 6 thrived and 4 did not. Two candidate splits:" },
      {
        type: "list",
        items: ["**Split A:** left 5 plants (5 thrived, 0 not); right 5 plants (1 thrived, 4 not).", "**Split B:** left 4 plants (3 thrived, 1 not); right 6 plants (3 thrived, 3 not)."],
      },
      {
        type: "list",
        ordered: true,
        items: ["Compute the Gini impurity of the node.", "Compute the weighted Gini impurity after each split.", "Which split does the tree choose, and what does each child predict?"],
      },
    ],
    hints: ["Gini = 1 − p₀² − p₁², using the fraction of each class.", "Weight each child’s Gini by its share of the 10 plants, then add."],
    solution: [
      { type: "p", text: "1. p = 0.6 and 0.4, so Gini = 1 − 0.36 − 0.16 = **0.48**." },
      {
        type: "p",
        text: "2. Split A: left Gini = 0 (pure); right = 1 − 0.2² − 0.8² = 0.32. Weighted: 0.5 × 0 + 0.5 × 0.32 = **0.16**. Split B: left = 1 − 0.75² − 0.25² = 0.375; right = 0.5. Weighted: 0.4 × 0.375 + 0.6 × 0.5 = **0.45**.",
      },
      { type: "p", text: "3. Split A, with the lower impurity (0.16). Its left child predicts “thrives”; its right child predicts “does not thrive”." },
    ],
  },

  quiz: [
    {
      question: "How does a trained decision tree make a prediction for a new example?",
      options: [
        "It averages all the training labels",
        "It follows yes/no questions from the root to a leaf and predicts the majority class there",
        "It finds the nearest training example",
        "It fits a line through the leaf",
      ],
      answer: 1,
      explanation: "Each internal node tests one feature against a threshold; the leaf reached gives the prediction.",
    },
    {
      question: "What does a tree try to minimise when choosing a split?",
      options: ["The number of leaves", "The weighted impurity (e.g. Gini) of the two children", "The depth", "The training time"],
      answer: 1,
      explanation: "It tries every feature and threshold and keeps the split whose children are, on average, purest.",
    },
    {
      question: "Training accuracy rises from 93% to 99.5% as depth goes from 6 to 10, while validation accuracy falls from 84% to 83%. What is happening?",
      options: ["Underfitting", "Overfitting: the extra splits fit label noise", "The validation set is too large", "The tree has converged"],
      answer: 1,
      explanation: "Deeper trees carve out tiny regions around individual noisy plants. That helps on training data only.",
    },
    {
      question: "Why does a random forest usually beat a single deep tree?",
      options: [
        "Its trees are shallower",
        "It averages many trees that make different errors, which reduces variance",
        "It uses a different impurity measure",
        "It sees the validation data",
      ],
      answer: 1,
      explanation: "Bootstrap samples and random feature choices make the trees differ; averaging cancels much of their individual noise.",
    },
    {
      question: "How does gradient boosting differ from a random forest?",
      options: [
        "Boosting builds trees in sequence, each correcting the errors of those before; a forest builds independent trees and averages them",
        "Boosting uses only one tree",
        "A forest needs labels and boosting doesn’t",
        "There is no difference",
      ],
      answer: 0,
      explanation: "Forests reduce variance by averaging independent deep trees; boosting reduces bias by adding small trees that fix remaining errors.",
    },
  ],

  glossary: [
    { term: "Decision tree", definition: "A model that predicts by following yes/no questions about features down to a leaf." },
    { term: "Root, node, leaf", definition: "The first question; any question; an end point that gives a prediction." },
    { term: "Split", definition: "A question “feature ≤ threshold?” that divides a node’s examples in two." },
    { term: "Gini impurity", definition: "1 − Σ pₖ²: how mixed the classes in a node are. 0 means pure." },
    { term: "Maximum depth", definition: "The most questions a tree may ask on the way to a leaf; its main complexity setting." },
    { term: "Ensemble", definition: "A model that combines the predictions of many models." },
    { term: "Bootstrap sample", definition: "A sample of n rows drawn with replacement from n rows; some appear twice, some not at all." },
    { term: "Bagging", definition: "Bootstrap aggregation: training models on bootstrap samples and averaging them." },
    { term: "Random forest", definition: "Bagged trees that also choose from a random subset of features at each split." },
    { term: "Gradient boosting", definition: "Adding small trees one at a time, each fitted to the current model’s errors." },
  ],

  references: [
    {
      title: "An Introduction to Statistical Learning (2nd ed.), chapter 8: Tree-Based Methods",
      source: "James, Witten, Hastie & Tibshirani, Springer, 2021",
      url: "https://www.statlearning.com/",
      note: "Classification trees, Gini index, bagging, random forests and boosting, with worked examples.",
    },
    {
      title: "Decision Trees",
      source: "scikit-learn User Guide, section 1.10",
      url: "https://scikit-learn.org/stable/modules/tree.html",
      note: "CART, impurity measures, midpoint thresholds, and practical tips on controlling depth.",
    },
    {
      title: "Ensembles: gradient boosting, random forests, bagging, voting, stacking",
      source: "scikit-learn User Guide, section 1.11",
      url: "https://scikit-learn.org/stable/modules/ensemble.html",
      note: "Bootstrap samples, max_features, and why scikit-learn averages probabilities instead of counting votes.",
    },
    {
      title: "DecisionTreeClassifier: the random_state parameter",
      source: "scikit-learn API reference",
      url: "https://scikit-learn.org/stable/modules/generated/sklearn.tree.DecisionTreeClassifier",
      note: "Explains why the best split can differ between runs when several splits improve the criterion equally.",
    },
    {
      title: "Random Forests",
      source: "Leo Breiman, Machine Learning 45, 5–32, 2001",
      url: "https://doi.org/10.1023/A:1010933404324",
      note: "The original random forest paper.",
    },
  ],

  next: [
    { pathSlug: "ml-foundations", topicSlug: "train-validation-test", reason: "Depth was chosen on validation data; why the final score still needs an untouched test set." },
    { pathSlug: "ml-foundations", topicSlug: "metrics-cross-validation", reason: "Cross-validation chooses depth more reliably than one validation set." },
    { pathSlug: "ai-engineering", topicSlug: "hyperparameter-tuning", reason: "Tuning forests and boosting systematically." },
  ],

  teaching: {
    notes: [
      "Play “twenty questions” first: one student thinks of an animal, the class may only ask yes/no questions. Point out that good first questions split the possibilities roughly in half — that is what impurity measures.",
      "In the experiment, pause at depth 1 and ask why nothing is shaded. The answer leads straight into impurity versus accuracy.",
      "Show the traced plant at depth 3, depth 6 and in the forest. Disagreement between models on one point is a concrete picture of variance.",
    ],
    demo: "Print 20 cards, each a plant with light and water values and a thrives/doesn’t label. Groups build a tree on paper with at most three questions, then score it on 20 new cards. Collect all the groups’ predictions for the new cards and take a majority vote: the “class forest” usually beats most individual groups.",
    discussion: [
      "A bank must explain every loan rejection. Would you use a depth-3 tree, a random forest, or gradient boosting? What would you lose with each?",
      "Why might a doctor trust a depth-3 tree more than a forest that is 5% more accurate? Should they?",
      "If a forest’s trees were all identical, what would averaging achieve?",
    ],
    misconceptions: [
      "“Trees need scaled features.” Thresholds don’t care about units; scaling changes nothing for a tree.",
      "“More trees in a forest can cause overfitting.” Adding trees mostly stabilises the average; depth and leaf size control overfitting.",
      "“The root split is the most important feature.” It is the best single split at the root; other features may matter more overall.",
    ],
    challenge: {
      prompt:
        "The rule behind the plant data is a diagonal band. Without changing the model type, what one new feature would let a depth-2 tree represent the band almost exactly? Why does this work?",
      answer: [
        {
          type: "p",
          text: "Add d = water − light/2. The rule becomes −0.5 ≤ d ≤ 3: two thresholds on one feature, which a depth-2 tree can express exactly (“d ≤ 3?”, then “d ≤ −0.5?”).",
        },
        {
          type: "p",
          text: "Trees only cut parallel to the feature axes. A feature that lines up with the true boundary turns a diagonal staircase into a single straight cut. Good features can matter more than a better model.",
        },
      ],
    },
  },
};
