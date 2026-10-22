import type { Lesson } from "../../types/content";

/*
 * Data: src/content/datasets/shoppers.ts (invented) and scikit-learn's bundled
 * digits dataset (code section only). Lab numbers are checked in
 * tests/lab-math.test.ts; the digits figures come from running the code.
 */
export const clusteringDimensionalityReduction: Lesson = {
  id: "clustering-dimensionality-reduction",
  pathSlug: "ml-foundations",
  topicSlug: "clustering-dimensionality-reduction",
  title: "Clustering and dimensionality reduction",
  summary:
    "k-means finds groups of similar rows; PCA finds the few directions along which data varies most. Both work without labels, and both depend heavily on how the features are scaled. This lesson steps through each one in the browser.",
  level: "beginner",
  minutes: [45, 60],
  objectives: [
    "Run **k-means** step by step and explain what it minimises",
    "Choose k with an elbow plot, and interpret clusters cautiously",
    "Use **PCA** to reduce data to fewer features and read its explained variance",
    "Explain why **standardising** features changes the results of both methods",
  ],
  prerequisites: [
    { label: "Supervised and unsupervised learning", href: "/learn/ml-foundations/supervised-unsupervised" },
    { label: "Mean and standard deviation" },
    { label: "Vectors and distance between points (helpful)", href: "/learn/math-foundations/linear-algebra-essentials" },
  ],

  intro: [
    {
      type: "p",
      text: "The previous lesson used k-means as a black box: give it data, get groups back. Here we open the box. You will move k-means one step at a time, see why its answer depends on where it starts, and see how changing the units of one feature changes everything.",
    },
    {
      type: "p",
      text: "The second half turns to PCA, the standard way to compress many features into a few — to plot high-dimensional data, or to remove redundancy before another model.",
    },
  ],

  why: [
    {
      type: "p",
      text: "Clustering is how unlabelled data gets a first structure: customer segments, groups of similar documents, cell types in biology. PCA is how data with dozens or thousands of features gets looked at at all — a 64-pixel image cannot be plotted, but its first two principal components can.",
    },
    {
      type: "p",
      text: "Both methods rely on distances or variances between numbers. If one feature is measured in dollars and another in visits, the dollars dominate unless you rescale. This is one of the most common silent errors in practice.",
    },
  ],

  explanation: {
    beginner: [
      {
        type: "p",
        text: "**k-means** needs one number from you: k, how many groups. It places k centres at random, then repeats two steps: **assign** every point to its nearest centre; **move** every centre to the average of its points. When no point changes group, it stops.",
      },
      {
        type: "p",
        text: "Each round can only make the clusters tighter, so k-means always finishes. But it can finish in a poor arrangement if it started badly, so in practice it is run from several random starts and the tightest result is kept.",
      },
      {
        type: "p",
        text: "**Choosing k.** Tightness is measured by **inertia**: the total squared distance from each point to its centre. More clusters always lower it, so you look for the “elbow” — the k after which adding a cluster helps much less.",
      },
      {
        type: "p",
        text: "**PCA** looks for the direction along which the data is most spread out — the first **principal component** (PC1). PC2 is the most spread-out direction at right angles to PC1, and so on. Keeping only the first few components gives a smaller dataset that keeps most of the variation.",
      },
      {
        type: "p",
        text: "**Scaling.** Both methods compare raw numbers. Spending varies by hundreds of dollars, visits by a handful, so spending dominates distances and variances. **Standardising** — rescaling each feature to mean 0 and standard deviation 1 — makes them count equally.",
      },
    ],
    technical: [
      {
        type: "p",
        text: "k-means minimises the within-cluster sum of squares J = Σᵢ ‖xᵢ − μ_c(i)‖² over assignments c and centres μ. Lloyd’s algorithm alternates the two exact partial minimisations — assignment (fix μ, choose c) and update (fix c, set each μ to its cluster mean) — so J never increases and the algorithm converges in finitely many steps, to a local minimum.",
      },
      {
        type: "p",
        text: "Because the optimum depends on initialisation, implementations use several starts (scikit-learn’s n_init) and smarter seeding (k-means++). k-means assumes roughly spherical, similar-sized clusters under Euclidean distance; it handles elongated or nested shapes poorly.",
      },
      {
        type: "p",
        text: "PCA finds orthonormal directions u₁, u₂, … that maximise the variance of the projected data: they are the eigenvectors of the covariance matrix, with eigenvalues λ₁ ≥ λ₂ ≥ … equal to the variance along each. The explained-variance ratio of component j is λⱼ / Σλ. In practice PCA is computed with the singular value decomposition of the centred data.",
      },
      {
        type: "p",
        text: "PCA centres the data but does not scale it, so it is not scale-invariant: multiplying a feature by 1,000 multiplies its variance by a million. Running PCA on standardised data is the same as an eigen-decomposition of the correlation matrix. Whether to standardise is a modelling decision: it is usually right when features have different units.",
      },
    ],
  },

  analogy: {
    title: "Pinning a map, and photographing a pen",
    blocks: [
      {
        type: "p",
        text: "k-means is like opening k shops in a town. Each customer goes to the nearest shop; then each shop moves to the middle of its customers; then customers switch to whichever shop is now nearest. After a few rounds nobody switches.",
      },
      {
        type: "p",
        text: "PCA is like photographing a pen to show its length: you turn the camera until the pen lies flat across the picture. That view keeps the most information in a 2D photo. A 3D object squashed into 2D loses something; PCA chooses the angle that loses least.",
      },
      {
        type: "p",
        text: "Where it breaks down: real distances in a town have units everyone agrees on. In data, you choose the units — and the “nearest shop” changes with that choice.",
      },
    ],
  },

  workedExample: {
    title: "Sixty shoppers, with and without scaling",
    blocks: [
      {
        type: "p",
        text: "Each shopper has visits per month (2 to 18) and spend per month ($390 to $2,730). They were invented from three groups of 20: frequent visitors who spend little, rare visitors who spend little, and regular visitors who spend a lot. k-means sees none of that.",
      },
      {
        type: "p",
        text: "**Raw features, k = 3.** Spend has a standard deviation of about $680; visits about 5.3. Squared distances are almost entirely spend, so k-means cuts the spend axis into bands. The best of 10 random starts puts all 40 low spenders in one cluster and splits the high spenders in two; other starts cut the low spenders into two bands instead. Either way, frequent and rare visitors — the most obvious difference in behaviour — are mixed together.",
      },
      {
        type: "p",
        text: "**Standardised features, k = 3.** Now a difference of one standard deviation counts the same in either feature. k-means recovers the three groups exactly, with centres at about (2.8 visits, $876), (8.9 visits, $2,218) and (15.2 visits, $795).",
      },
      {
        type: "table",
        caption: "Inertia on the standardised data, best of 10 random starts",
        head: ["k", "1", "2", "3", "4", "5", "6"],
        rows: [["Inertia", "120.0", "62.1", "9.9", "8.0", "6.3", "4.9"]],
      },
      {
        type: "p",
        text: "The drop from k = 2 to k = 3 is large (62.1 → 9.9); after that each extra cluster helps little. The elbow is at k = 3. (Inertia at k = 1 is 120 = 60 shoppers × 2 standardised features, since each feature has variance 1.)",
      },
      {
        type: "p",
        text: "**PCA on two correlated measures.** 40 students’ study hours and practice questions answered are strongly correlated (r ≈ 0.92). On raw numbers, PC1 explains 99.97% of the variance — but its weights are 0.04 for hours and 1.00 for questions: it is just the questions column, because questions vary in hundreds. After standardising, PC1 weighs both equally (0.71, 0.71) and explains 96.2%: one combined effort score per student that loses little.",
      },
      {
        type: "p",
        text: "**PCA on real images.** scikit-learn’s digits dataset has 1,797 handwritten digits of 8 × 8 pixels: 64 features each. The first two principal components keep 28.5% of the variance — enough for a revealing 2D plot, not enough to stand in for the image. Keeping 90% needs 21 components.",
      },
    ],
  },

  math: {
    blocks: [
      {
        type: "equation",
        expression: "J = Σᵢ ‖xᵢ − μ_c(i)‖²",
        meaning: "k-means’ objective, called inertia: the squared distance of every point to its own cluster centre, added up.",
      },
      {
        type: "equation",
        expression: "assign:  c(i) = argmin_j ‖xᵢ − μⱼ‖²        update:  μⱼ = mean of { xᵢ : c(i) = j }",
        meaning: "The two steps of Lloyd’s algorithm. Each one can only lower J, so the algorithm stops.",
      },
      {
        type: "equation",
        expression: "z = (x − mean) / standard deviation",
        meaning: "Standardising a feature: mean 0, standard deviation 1, no units. A shopper spending $1,976 (mean $1,296 + one SD of $680) gets z = 1.",
      },
      {
        type: "equation",
        expression: "Σ u = λ u,   explained variance ratio of PCj = λⱼ / (λ₁ + … + λ_p)",
        meaning: "Principal components are eigenvectors u of the covariance matrix Σ; each eigenvalue λ is the variance along its component.",
      },
      {
        type: "equation",
        expression: "score on PC1 = u₁ · (x − mean)",
        meaning: "The reduced representation: each row’s coordinate along a component. Keeping m scores instead of p features reduces the data from p to m dimensions.",
      },
    ],
    notation: [
      { symbol: "k", meaning: "Number of clusters" },
      { symbol: "μⱼ", meaning: "Centre of cluster j" },
      { symbol: "c(i)", meaning: "Cluster of point i" },
      { symbol: "Σ", meaning: "Covariance matrix of the features" },
      { symbol: "uⱼ, λⱼ", meaning: "The j-th principal component and its variance" },
      { symbol: "p, m", meaning: "Number of original features; number of components kept" },
    ],
  },

  process: {
    title: "Clustering or reducing a dataset",
    steps: [
      { title: "Choose features deliberately", text: "Only the features that should define similarity. Every included feature pulls the result towards itself." },
      { title: "Decide on scaling", text: "Standardise when features have different units; keep raw units only when they are genuinely comparable." },
      { title: "Fit with several starts", text: "k-means: n_init of 10 or more, or k-means++. PCA: fit on training data only if it feeds a supervised model." },
      { title: "Choose k or the number of components", text: "Elbow of inertia, or the explained-variance curve — then check that the choice makes sense in the domain." },
      { title: "Inspect and name carefully", text: "Look at cluster sizes and centres in original units. Names are hypotheses." },
      { title: "Validate", text: "Re-run on a resample: stable clusters reappear. If labels exist for some rows, compare." },
    ],
  },

  interactive: {
    component: "clustering-lab",
    kind: "computation",
    intro:
      "Both methods run in your browser. In k-means, step through assignment and update yourself, or run to the end; change k, standardise, or restart from new random centres. In PCA, compare raw and standardised data drawn on equal scales — the way PCA “sees” it.",
    tryThis: [
      "k-means, k = 3, raw features: step through one assignment and one move at a time until it converges. Then reveal the true groups.",
      "Tick **Standardise both features first** and run to the end. Reveal the groups again.",
      "With standardised data and k = 3, press **New random start** several times and run each to the end. Do all starts agree?",
      "Read the elbow chart for standardised data. Then try k = 4 and k = 6 and look at what the extra clusters do.",
      "Switch to PCA. Compare PC1’s weights and explained variance with and without standardising.",
    ],
    expect: [
      {
        action: "Raw features, k = 3",
        result: "After 6 moves the clusters are horizontal bands of spend: high spenders, and two bands of low spenders in which frequent and rare visitors are mixed.",
      },
      { action: "Standardised, k = 3", result: "The three true groups, recovered exactly (60 of 60), with inertia 9.90." },
      { action: "New random starts", result: "Most starts reach inertia 9.90; random starts 7 and 10 get stuck at about 60 with two groups merged." },
      { action: "Elbow (standardised)", result: "120.0, 62.1, 9.9, then small steps (8.0, 6.3, 4.9). The bend is at k = 3." },
      { action: "PCA", result: "Raw: PC1 explains 99.97% with weights (0.04, 1.00), just the questions axis. Standardised: 96.2%, weights (0.71, 0.71)." },
    ],
  },

  code: {
    label: "kmeans_and_pca.py",
    language: "Python",
    source: `import numpy as np
from sklearn.cluster import KMeans
from sklearn.datasets import load_digits
from sklearn.decomposition import PCA
from sklearn.preprocessing import StandardScaler

# The lesson's 60 shoppers: visits per month and spend per month ($).
rng = np.random.default_rng(1)
visits, spend = [], []
for v_mean, v_sd, s_mean, s_sd in [(15, 3, 800, 150), (3, 1.2, 900, 180), (9, 2, 2200, 300)]:
    visits += list(rng.normal(v_mean, v_sd, 20).clip(1, None).round())
    spend += list(rng.normal(s_mean, s_sd, 20).round(-1))
X = np.c_[visits, spend]

for name, data in [("raw", X), ("standardised", StandardScaler().fit_transform(X))]:
    km = KMeans(n_clusters=3, n_init=10, random_state=0).fit(data)
    print(f"{name:>12}: cluster sizes {sorted(np.bincount(km.labels_).tolist())}")

# PCA on real images: 1,797 handwritten digits, 8 x 8 pixels = 64 features each.
digits = load_digits().data
pca = PCA().fit(digits)
cumulative = np.cumsum(pca.explained_variance_ratio_)
print("first 2 components keep", round(cumulative[1], 3), "of the variance")
print("components needed for 90%:", np.searchsorted(cumulative, 0.90) + 1)
two_d = PCA(n_components=2).fit_transform(digits)
print("reduced shape:", two_d.shape)`,
    walkthrough: [
      { lines: "8–13", text: "Regenerates the lesson’s shoppers from a fixed seed: three groups of 20, which k-means never sees." },
      { lines: "15–17", text: "k-means with 3 clusters and 10 random starts, once on raw numbers and once after `StandardScaler`. Only the cluster sizes are printed." },
      { lines: "20–22", text: "`load_digits` ships with scikit-learn, so nothing is downloaded. `PCA()` keeps all 64 components so we can see how variance accumulates." },
      { lines: "24", text: "`searchsorted` finds the first position where the cumulative ratio reaches 0.90; add 1 to count components." },
      { lines: "25", text: "The usual use: keep 2 components to plot 64-dimensional data. Each image becomes two numbers." },
    ],
    shapes: [
      { name: "X", shape: "(60, 2)", meaning: "Visits and spend for each shopper" },
      { name: "km.labels_", shape: "(60,)", meaning: "The cluster of each shopper: 0, 1 or 2" },
      { name: "digits", shape: "(1797, 64)", meaning: "Pixel intensities of each 8 × 8 image" },
      { name: "two_d", shape: "(1797, 2)", meaning: "Each image reduced to its first two principal component scores" },
    ],
    output: {
      label: "Output",
      text: "         raw: cluster sizes [8, 12, 40]\nstandardised: cluster sizes [20, 20, 20]\nfirst 2 components keep 0.285 of the variance\ncomponents needed for 90%: 21\nreduced shape: (1797, 2)",
      note: "Produced by running the script with scikit-learn 1.9. On raw data the lab’s best of 10 random starts finds a similar split with sizes 9, 11 and 40; scikit-learn’s k-means++ starts find a slightly tighter one.",
    },
  },

  useCases: [
    { title: "Customer segmentation", text: "Clusters of purchase behaviour, standardised first, as starting points for marketing — checked by people who know the customers." },
    { title: "Visualising high-dimensional data", text: "PCA to two or three components gives a first look at gene-expression profiles, survey answers or image features." },
    { title: "Compressing features before a model", text: "PCA can remove redundant, correlated features. It must be fitted on training data only, inside a pipeline, to avoid leakage." },
    { title: "Colour quantisation", text: "k-means on the colours of an image’s pixels picks k representative colours, shrinking the palette for printing or compression." },
  ],

  mistakes: [
    {
      kind: "mistake",
      title: "Forgetting to scale",
      text: "Features in larger units dominate both k-means and PCA. In the experiment, unscaled spend swamps visits completely.",
    },
    {
      kind: "mistake",
      title: "Trusting one k-means run",
      text: "A single random start can converge to a poor local minimum. Use several starts and keep the lowest inertia.",
    },
    {
      kind: "mistake",
      title: "Fitting PCA or a scaler on all the data before splitting",
      text: "When PCA feeds a supervised model, fitting it on test rows leaks information. Fit inside the training data, then apply to the test data.",
    },
    {
      kind: "misconception",
      title: "“The elbow tells you the true number of clusters”",
      text: "It is a heuristic. Many datasets have no clear elbow, and real groups need not be round blobs of similar size.",
    },
    {
      kind: "misconception",
      title: "“High explained variance means PCA found something important”",
      text: "On raw data PC1 explained 99.97% only because questions are counted in hundreds. Variance is not the same as importance.",
    },
    {
      kind: "limitation",
      title: "Shapes k-means cannot find",
      text: "Elongated, ring-shaped or very unequal clusters are split wrongly. Density-based methods such as DBSCAN, or Gaussian mixtures, suit those better.",
    },
  ],

  exercise: {
    prompt: [
      { type: "p", text: "Four points on a line: 1, 2, 9 and 10. Run k-means with k = 2 by hand, starting with centres at 1 and 2." },
      {
        type: "list",
        ordered: true,
        items: [
          "Assign each point to its nearest centre. Then move each centre to the mean of its points.",
          "Repeat until nothing changes. Where do the centres end up, and what is the final inertia?",
          "Now measure the points in centimetres instead of metres (multiply by 100). Does the clustering change? Does the inertia?",
        ],
      },
    ],
    hints: ["Ties don’t occur here; each point has one nearest centre.", "Inertia is the sum of squared distances to the assigned centre."],
    solution: [
      { type: "p", text: "1. Centres 1 and 2: point 1 → centre 1; points 2, 9, 10 → centre 2. New centres: 1 and (2 + 9 + 10)/3 = 7." },
      {
        type: "p",
        text: "2. Reassign with centres 1 and 7: 1 and 2 → centre 1 (2 is 1 away from 1 but 5 away from 7); 9 and 10 → centre 7. New centres: 1.5 and 9.5. Reassigning changes nothing, so it has converged. Inertia: 0.5² + 0.5² + 0.5² + 0.5² = **1**.",
      },
      {
        type: "p",
        text: "3. Same clusters, because every distance is multiplied by 100 and the comparisons don’t change. Inertia is multiplied by 100² = 10,000. Scaling **one** feature changes clusterings; scaling **all** features equally does not.",
      },
    ],
  },

  quiz: [
    {
      question: "Which two steps does k-means repeat?",
      options: [
        "Split and merge clusters",
        "Assign each point to its nearest centre; move each centre to the mean of its points",
        "Rotate and project the data",
        "Label points and train a classifier",
      ],
      answer: 1,
      explanation: "Lloyd’s algorithm alternates assignment and update until no point changes cluster.",
    },
    {
      question: "Why is k-means usually run from several random starts?",
      options: [
        "To use more of the data",
        "Because it can converge to a poor local minimum depending on where it starts",
        "Because each run finds a different k",
        "To make it faster",
      ],
      answer: 1,
      explanation: "In the experiment most starts reach inertia 9.90, but some get stuck near 60. Keeping the lowest inertia avoids the bad ones.",
    },
    {
      question: "Visits range from 2 to 18 and spend from $390 to $2,730. Without scaling, what drives k-means’ clusters?",
      options: ["Visits", "Spend", "Both equally", "Neither"],
      answer: 1,
      explanation: "Squared distances are dominated by the feature with the largest numbers. Standardising makes each feature count by its spread, not its units.",
    },
    {
      question: "PC1 explains 96% of the variance of two standardised features. What does that mean?",
      options: [
        "96% of rows are correctly classified",
        "Projecting each row onto one direction keeps 96% of the total variance",
        "One feature is 96% important",
        "The data has 96 dimensions",
      ],
      answer: 1,
      explanation: "One score per row along PC1 preserves 96% of the spread; only 4% lies along PC2.",
    },
    {
      question: "Inertia keeps falling as k increases. How should you use it to choose k?",
      options: [
        "Pick the k with the lowest inertia",
        "Look for the k after which adding clusters reduces inertia much less (the elbow), then check it makes sense",
        "Always use k = 2",
        "Inertia cannot help",
      ],
      answer: 1,
      explanation: "The lowest inertia is always at k = n (one point per cluster). The elbow is a heuristic for where extra clusters stop paying off.",
    },
  ],

  glossary: [
    { term: "Cluster", definition: "A group of rows that are close to each other in the chosen features." },
    { term: "Centroid (centre)", definition: "The mean position of the points in a cluster." },
    { term: "Inertia", definition: "The sum of squared distances from points to their cluster centres; k-means minimises it." },
    { term: "Local minimum", definition: "An arrangement no single assign-and-update round can improve, but which is not the best possible." },
    { term: "Elbow method", definition: "Choosing k where the inertia curve bends and further clusters help much less." },
    { term: "Standardisation", definition: "Rescaling a feature to mean 0 and standard deviation 1." },
    { term: "Principal component", definition: "A direction in feature space; PC1 has the most variance, each later one the most at right angles to those before." },
    { term: "Explained variance ratio", definition: "The fraction of total variance along one principal component." },
    { term: "Projection (score)", definition: "A row’s coordinate along a principal component." },
    { term: "Dimensionality reduction", definition: "Replacing many features by fewer derived ones that keep most of the information." },
  ],

  references: [
    {
      title: "Clustering (section 2.3.2: K-means)",
      source: "scikit-learn User Guide",
      url: "https://scikit-learn.org/stable/modules/clustering.html",
      note: "Lloyd’s algorithm, local minima and initialisation, and the assumptions behind inertia.",
    },
    {
      title: "Decomposing signals in components (section 2.5.1: PCA)",
      source: "scikit-learn User Guide",
      url: "https://scikit-learn.org/stable/modules/decomposition.html",
      note: "PCA as successive orthogonal components of maximum variance; notes that PCA centres but does not scale the data.",
    },
    {
      title: "Importance of Feature Scaling",
      source: "scikit-learn example gallery",
      url: "https://scikit-learn.org/stable/auto_examples/preprocessing/plot_scaling_importance.html",
      note: "A real dataset where one large-valued feature dominates PCA and distance-based models until features are standardised.",
    },
    {
      title: "An Introduction to Statistical Learning (2nd ed.), chapter 12",
      source: "James, Witten, Hastie & Tibshirani, Springer, 2021",
      url: "https://www.statlearning.com/",
      note: "Principal components analysis and k-means clustering, including the role of scaling.",
    },
    {
      title: "k-means++: The Advantages of Careful Seeding",
      source: "Arthur & Vassilvitskii, Proceedings of the 18th ACM-SIAM Symposium on Discrete Algorithms (SODA), 2007",
      note: "The seeding method scikit-learn uses by default to start k-means well.",
    },
  ],

  next: [
    { pathSlug: "ml-foundations", topicSlug: "train-validation-test", reason: "Why scalers and PCA must be fitted on training data only." },
    { pathSlug: "math-foundations", topicSlug: "linear-algebra-essentials", reason: "Eigenvectors and projections, the mathematics underneath PCA." },
    { pathSlug: "nlp-language-models", topicSlug: "embeddings", reason: "Embeddings are learned features where distance means similarity — and are often clustered or reduced with PCA." },
  ],

  teaching: {
    notes: [
      "Do the exercise’s four-point example on the board before opening the experiment; it makes the two steps concrete.",
      "In the experiment, step through raw k-means one action at a time and let the class predict each move. Then reveal the groups: frequent and rare visitors mixed in the same clusters make the scaling point.",
      "Emphasise that PCA’s “explained variance” on raw data partly measures the choice of units.",
    ],
    demo: "Mark 12 students’ positions in the room. Choose three students as “centres”. Everyone stands next to the nearest centre; each centre then moves to the middle of its group; repeat. Then redo it but measure distances only front-to-back, doubled — the groups change, which is what scaling a feature does.",
    discussion: [
      "When would you deliberately **not** standardise before clustering?",
      "A clustering of patients finds four groups. What would you need before calling them “disease subtypes”?",
      "PCA keeps the directions of largest variance. Can a direction with small variance still be the one that matters for prediction?",
    ],
    misconceptions: [
      "“k-means finds the natural number of groups.” You choose k.",
      "“PCA selects the most important original features.” It builds new features that mix all the original ones.",
      "“Standardising loses information.” It changes units, not the information each feature carries.",
    ],
    challenge: {
      prompt:
        "Two features are perfectly correlated (one is exactly 3 × the other). What will PCA’s explained-variance ratios be, and why? What happens to k-means if you add a third, pure-noise feature with a much larger scale?",
      answer: [
        {
          type: "p",
          text: "All the points lie on one line, so PC1 (along the line) explains 100% and PC2 explains 0%. Two features carry only one dimension of information.",
        },
        {
          type: "p",
          text: "A large-scale noise feature dominates distances, so k-means splits along the noise and the real structure is lost. Standardising reduces this, but a noise feature still adds random distance: choosing features matters as much as scaling them.",
        },
      ],
    },
  },
};
