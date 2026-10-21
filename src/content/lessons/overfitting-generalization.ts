import type { Lesson } from "../../types/content";

/*
 * Data: src/content/datasets/noisy-wave.ts (simulated). Every error quoted below
 * was computed with NumPy and is checked against the browser lab in tests/lab-math.test.ts.
 */
export const overfittingGeneralization: Lesson = {
  id: "overfitting-generalization",
  pathSlug: "ml-foundations",
  topicSlug: "overfitting-generalization",
  title: "Overfitting, underfitting and generalization",
  summary:
    "A model that fits its training data perfectly can be useless on new data. This lesson fits curves of increasing flexibility to the same noisy points and shows how to tell — and fix — a model that is too simple or too flexible.",
  level: "beginner",
  minutes: [45, 60],
  objectives: [
    "Recognise **underfitting** and **overfitting** by comparing training and validation error",
    "Explain **generalisation** as performance on data the model has not seen",
    "Use a validation set to choose a model’s complexity",
    "Describe three remedies — a simpler model, **regularisation** and more data — and when each helps",
  ],
  prerequisites: [
    { label: "What does learning from data mean?", href: "/learn/ml-foundations/learning-from-data" },
    { label: "Polynomials such as ax² + bx + c" },
    { label: "Basic NumPy (for the code section only)" },
  ],

  intro: [
    {
      type: "p",
      text: "In the first lesson a straight line fitted twelve students well and predicted the three held-out students well too. What if we had used a more flexible curve instead? It could bend to pass closer to every training point, and the training error would fall.",
    },
    {
      type: "p",
      text: "But fitting the training points was never the goal. The goal was to predict **new** points. This lesson shows that those two goals pull apart — and how to tell where to stop.",
    },
  ],

  why: [
    {
      type: "p",
      text: "Every dataset mixes a **pattern** with **noise**: measurement error, chance, and everything that wasn’t recorded. A flexible enough model can fit both. Training error keeps falling as flexibility grows, so it can never tell you when the model has started fitting noise.",
    },
    {
      type: "p",
      text: "**Generalisation** — how well a model does on data it hasn’t seen — is what matters in use. Validation data, held out from training, is how we measure it while we are still choosing a model.",
    },
  ],

  explanation: {
    beginner: [
      {
        type: "p",
        text: "Imagine points that follow a smooth wave, but each one is nudged up or down a little by noise. We fit polynomials to twelve of them: degree 1 is a straight line, degree 3 can bend twice, degree 11 can bend ten times.",
      },
      {
        type: "p",
        text: "**Underfitting**: the model is too simple to follow the pattern. A straight line through a wave is wrong almost everywhere — so error is high on the training points *and* on new points.",
      },
      {
        type: "p",
        text: "**Overfitting**: the model is so flexible that it follows the noise too. A degree-11 curve can pass exactly through all twelve training points, so its training error is zero — but between the points it swings wildly, and its error on new points is enormous.",
      },
      {
        type: "p",
        text: "**A good fit** sits in between. To find it, fit models of different complexity, measure each on a **validation set**, and choose the one with the lowest validation error. Plotted against complexity, validation error usually makes a U-shape.",
      },
      {
        type: "p",
        text: "If a flexible model overfits, there are three remedies: use a **simpler model**; add a **penalty** that discourages the large coefficients wild curves need (regularisation); or get **more data**, which is much harder to memorise.",
      },
    ],
    technical: [
      {
        type: "p",
        text: "Assume y = f(x) + ε with E[ε] = 0 and Var(ε) = σ². A model f̂ is chosen to minimise training error, which therefore underestimates its error on new data from the same distribution — the **generalisation error**.",
      },
      {
        type: "p",
        text: "For squared error, the expected error at a point decomposes as bias² + variance + σ². Low-capacity models have high **bias** (systematically wrong shape); high-capacity models have high **variance** (the fit changes a lot with the particular training sample). σ² is irreducible: here σ = 0.2, so no model can average below 0.04.",
      },
      {
        type: "p",
        text: "Capacity here is the polynomial degree d, with d + 1 parameters. With n distinct points, d = n − 1 interpolates them exactly. The validation curve is the empirical guide to the bias–variance trade-off.",
      },
      {
        type: "p",
        text: "**Ridge regularisation** minimises training MSE + λ·Σₖ cₖ², shrinking coefficients towards zero. It trades a little bias for a large drop in variance; λ is a hyperparameter chosen on validation data. In the experiment the penalty applies to the coefficients of Chebyshev polynomials, a well-conditioned basis for the same curves.",
      },
      {
        type: "p",
        text: "More data reduces variance for a fixed capacity. And because you choose the degree using the validation set, its score becomes slightly optimistic too — the final estimate needs an untouched test set, or nested cross-validation.",
      },
    ],
  },

  analogy: {
    title: "Memorising past papers",
    blocks: [
      {
        type: "p",
        text: "One student memorises every past exam paper word for word. They score 100% on those papers (training error zero) and struggle the moment a question is phrased differently (high validation error). Another learns a single rule — “when unsure, answer C” — and does badly on both. The student who learns the underlying ideas does well on old and new questions alike.",
      },
      {
        type: "p",
        text: "The analogy breaks down because a model doesn’t “understand” anything. Generalisation is statistical: whether the patterns it fitted also hold in new data from the same source.",
      },
    ],
  },

  workedExample: {
    title: "Twelve noisy points, five different curves",
    blocks: [
      {
        type: "p",
        text: "The data: 12 training points and 30 validation points from y = sin(πx) plus noise with standard deviation 0.2. Polynomials of each degree are fitted to the 12 training points by least squares:",
      },
      {
        type: "table",
        caption: "Mean squared error by polynomial degree (12 training points, no penalty)",
        head: ["Degree", "Parameters", "Training MSE", "Validation MSE", "Diagnosis"],
        rows: [
          ["1", "2", "0.279", "0.248", "Underfitting"],
          ["3", "4", "0.029", "0.059", "Best on validation"],
          ["4", "5", "0.020", "0.111", "Starting to overfit"],
          ["9", "10", "0.007", "75.2", "Overfitting"],
          ["11", "12", "0.000", "≈ 857,000", "Memorised the training points"],
        ],
      },
      {
        type: "p",
        text: "Training error falls at every step; validation error falls, then rises steeply. Degree 3 wins. Now keep the most flexible model, degree 11, and apply each remedy instead:",
      },
      {
        type: "list",
        items: [
          "A penalty of λ = 0.1 brings its validation MSE down to **0.150**.",
          "Four times as much data — 48 training points — brings it down to **0.051**, close to the noise level of 0.04.",
        ],
      },
    ],
  },

  math: {
    blocks: [
      { type: "equation", expression: "y = f(x) + ε,   Var(ε) = σ²", meaning: "Data is a pattern plus noise. Here f(x) = sin(πx) and σ = 0.2." },
      {
        type: "equation",
        expression: "MSE_train = (1/n) · Σᵢ ( f̂(xᵢ) − yᵢ )²   over the training set",
        meaning: "What fitting minimises. The same formula on the validation set gives MSE_val.",
      },
      {
        type: "equation",
        expression: "E[ ( y − f̂(x) )² ] = Bias[f̂(x)]² + Var[f̂(x)] + σ²",
        meaning: "Expected error on a new point: systematic error, plus sensitivity to the training sample, plus noise no model can remove.",
      },
      {
        type: "equation",
        expression: "f̂(x) = c₀ + c₁·T₁(x) + … + c_d·T_d(x)",
        meaning: "A degree-d polynomial: d + 1 coefficients to fit. Tₖ are Chebyshev polynomials, which describe the same curves as powers of x.",
      },
      {
        type: "equation",
        expression: "minimise   MSE_train + λ · Σₖ≥₁ cₖ²",
        meaning: "Ridge regularisation. λ = 0 is plain least squares; larger λ forces smaller coefficients and smoother curves.",
      },
    ],
    notation: [
      { symbol: "f(x)", meaning: "The true pattern (unknown in practice)" },
      { symbol: "f̂(x)", meaning: "The fitted model" },
      { symbol: "ε, σ²", meaning: "Noise and its variance" },
      { symbol: "d", meaning: "Polynomial degree — the model’s complexity" },
      { symbol: "cₖ", meaning: "The polynomial’s coefficients" },
      { symbol: "λ", meaning: "Regularisation strength (“lambda”)" },
    ],
  },

  process: {
    title: "Choosing complexity without fooling yourself",
    steps: [
      { title: "Split first", text: "Training, validation and test sets, before any fitting." },
      { title: "Fit a range of models", text: "Increasing complexity — degree, depth, number of features — each on the training set only." },
      { title: "Score on validation", text: "Compute validation error for every candidate." },
      { title: "Pick the low point", text: "Choose the lowest validation error; if two are close, prefer the simpler model." },
      { title: "Try remedies if needed", text: "Regularise, simplify or collect more data, and re-check on validation." },
      { title: "Test once", text: "Measure the chosen model on the untouched test set and report that number." },
    ],
  },

  interactive: {
    component: "overfitting-lab",
    kind: "computation",
    intro:
      "Every fit is recomputed in your browser when you move a control. The left chart shows the curve and the data; the right chart shows training and validation error for every degree at once, so you can see the whole trade-off.",
    tryThis: [
      "Move the degree slowly from 0 to 11, watching both charts and the diagnosis.",
      "At degree 11, look at what the curve does between the training points and near the edges.",
      "Keep degree 11 and raise the penalty λ one step at a time.",
      "Set λ back to 0 and tick **Use 48 training points**. Move the degree again.",
      "Turn on **Show the curve the data came from** and compare it with the best degree.",
    ],
    expect: [
      { action: "Degrees 0–2", result: "Underfitting: validation MSE between about 0.25 and 0.47, and training error just as high." },
      { action: "Degree 3", result: "The lowest validation MSE, 0.059, with training MSE 0.029." },
      { action: "Degrees 9 and 11", result: "Training MSE 0.007 and 0.000; validation MSE about 75 and about 857,000. The curve shoots off between points." },
      { action: "Degree 11 with a penalty", result: "λ = 0.001 gives validation MSE about 0.85; λ = 0.1 gives about 0.150." },
      { action: "48 training points", result: "Degree 11 now has validation MSE 0.051, and the best degree becomes 8 with 0.034 — about the noise level." },
    ],
  },

  code: {
    label: "overfitting.py",
    language: "Python",
    source: `import numpy as np

# The lesson's data: a sine wave plus noise, rounded to 3 decimals.
rng = np.random.default_rng(7)
def make(n):
    x = rng.uniform(-1, 1, n)
    y = np.sin(np.pi * x) + rng.normal(0, 0.2, n)
    return x.round(3), y.round(3)

x_pool, y_pool = make(48)                  # training pool
x_val, y_val = make(30)                    # validation set
x_train, y_train = x_pool[:12], y_pool[:12]  # the small training set

def mse(p, x, y):
    return np.mean((p(x) - y) ** 2)

for degree in [1, 3, 9, 11]:
    p = np.polynomial.Polynomial.fit(x_train, y_train, degree)  # least squares
    print(f"degree {degree:2d}: train MSE {mse(p, x_train, y_train):.4f}, "
          f"validation MSE {mse(p, x_val, y_val):.4f}")`,
    walkthrough: [
      { lines: "4–8", text: "Regenerates exactly the data in the experiment: a fixed random seed, x drawn uniformly at random from [−1, 1], and noise with standard deviation 0.2." },
      { lines: "10–12", text: "The training pool (48 points) and validation set (30 points). The first 12 pool points are the small training set." },
      {
        lines: "18",
        text: "`Polynomial.fit` finds the least-squares coefficients. It works in a rescaled domain, which the NumPy documentation notes reduces the chance of ill-conditioning — important at degree 11.",
      },
      { lines: "19–20", text: "Training and validation error side by side. Only the validation error says anything about new data." },
    ],
    shapes: [
      { name: "x_pool, y_pool", shape: "(48,)", meaning: "The full training pool" },
      { name: "x_train, y_train", shape: "(12,)", meaning: "The small training set" },
      { name: "x_val, y_val", shape: "(30,)", meaning: "Validation set, never used for fitting" },
      { name: "p", shape: "degree + 1 coefficients", meaning: "The fitted polynomial; `p(x)` evaluates it" },
    ],
    output: {
      label: "Output",
      text: "degree  1: train MSE 0.2786, validation MSE 0.2483\ndegree  3: train MSE 0.0288, validation MSE 0.0590\ndegree  9: train MSE 0.0072, validation MSE 75.1740\ndegree 11: train MSE 0.0000, validation MSE 856827.4452",
      note: "Produced by running the script with NumPy 2.5. The experiment computes the same fits and matches these values.",
    },
  },

  useCases: [
    {
      title: "Small data, many features",
      text: "Medical, genomic and survey datasets often have few rows and many columns — ideal conditions for memorising. Regularisation and cross-validation are standard practice there.",
    },
    {
      title: "Training neural networks",
      text: "Training and validation curves over epochs show the same gap opening. Early stopping, weight decay and dropout are the deep-learning versions of today’s remedies.",
    },
    {
      title: "Your own projects",
      text: "Tree depth, the number of features, polynomial terms and regularisation strength are all complexity settings. Each should be chosen on validation data, never on the test set.",
    },
  ],

  mistakes: [
    {
      kind: "mistake",
      title: "Choosing complexity by training error",
      text: "Training error almost always falls as complexity rises. Choosing by it picks the most flexible model every time.",
    },
    {
      kind: "mistake",
      title: "Choosing complexity by test error",
      text: "Then the test set has been used for tuning, and its score is no longer an honest estimate. Choose on validation; test once.",
    },
    {
      kind: "misconception",
      title: "“Overfitting means the model is too accurate”",
      text: "It is accurate on the wrong data. Overfitting is a gap between training performance and performance on new data.",
    },
    {
      kind: "misconception",
      title: "“Perfect training accuracy proves a good model”",
      text: "Degree 11 has zero training error and the worst validation error in the experiment.",
    },
    {
      kind: "limitation",
      title: "One small validation set is noisy",
      text: "With 30 validation points, the chosen degree depends partly on luck. Cross-validation averages over several splits for a steadier choice.",
    },
    {
      kind: "limitation",
      title: "The U-shape is the classical picture",
      text: "Very large neural networks can behave differently: test error can fall again as models grow far beyond the size needed to fit the data (“double descent”). The U-shape remains the right first model for most tabular problems.",
    },
  ],

  exercise: {
    prompt: [
      {
        type: "p",
        text: "Suppose you train decision trees of increasing maximum depth and get these (hypothetical) results:",
      },
      {
        type: "table",
        caption: "Hypothetical training and validation error by tree depth",
        head: ["Depth", "1", "2", "3", "4", "5", "6", "8"],
        rows: [
          ["Training error", "0.40", "0.25", "0.15", "0.10", "0.06", "0.03", "0.00"],
          ["Validation error", "0.42", "0.27", "0.18", "0.16", "0.17", "0.21", "0.30"],
        ],
      },
      {
        type: "list",
        ordered: true,
        items: [
          "Which depths underfit and which overfit?",
          "Which depth would you choose, and why?",
          "At your chosen depth, validation error is still well above training error. Name two things you could try.",
        ],
      },
    ],
    hints: [
      "Underfitting: both errors high. Overfitting: training error keeps falling while validation error rises.",
      "Look for the lowest validation error, and consider whether a simpler model is nearly as good.",
      "Think of the three remedies from the lesson, and what “regularisation” could mean for a tree.",
    ],
    solution: [
      { type: "p", text: "1. Depths 1–2 underfit: both errors are high. From depth 5 on, validation error rises while training error keeps falling — overfitting, clearest at depths 6 and 8." },
      {
        type: "p",
        text: "2. Depth 4 has the lowest validation error (0.16). Depth 3 (0.18) is close and simpler, so either is defensible; the gap is small enough that cross-validation should decide.",
      },
      {
        type: "p",
        text: "3. Collect more training data; regularise the tree (for example require more examples per leaf); or average many trees, as a random forest does, which mainly reduces variance.",
      },
    ],
  },

  quiz: [
    {
      question: "A model has training MSE 0.001 and validation MSE 4.2. What is most likely happening?",
      options: ["Underfitting", "Overfitting", "A good fit", "The data has no noise"],
      answer: 1,
      explanation: "A tiny training error and a much larger validation error is the signature of overfitting.",
    },
    {
      question: "A model has training MSE 0.45 and validation MSE 0.47, and the noise level is about 0.04. What should you try?",
      options: ["A more flexible model", "A stronger penalty", "Fewer training examples", "Nothing; it’s a good fit"],
      answer: 0,
      explanation: "Both errors are high and close together, far above the noise level: the model is underfitting, so it needs more flexibility.",
    },
    {
      question: "Why can’t training error be used to choose the polynomial degree?",
      options: [
        "It is too slow to compute",
        "It almost always decreases as the degree increases, so it would always pick the most complex model",
        "It is always zero",
        "It only works for straight lines",
      ],
      answer: 1,
      explanation: "A more flexible model can always fit the training points at least as well. Only held-out data reveals when the extra flexibility stops helping.",
    },
    {
      question: "What does increasing the penalty λ do to a degree-11 fit?",
      options: [
        "Makes the curve wigglier",
        "Shrinks its coefficients, giving a smoother curve — too much and it underfits",
        "Adds more training data",
        "Changes the degree to 3",
      ],
      answer: 1,
      explanation: "Wild curves need large coefficients. Penalising them trades a little training error for much lower variance; too large a λ flattens the curve too much.",
    },
    {
      question: "At degree 11, going from 12 to 48 training points changes validation MSE from about 857,000 to 0.051. Why?",
      options: [
        "More data reduces variance: 12 coefficients can’t pass through 48 noisy points, so they must follow the pattern instead",
        "The validation set changed",
        "Degree 11 is automatically regularised with more data",
        "It is a coincidence",
      ],
      answer: 0,
      explanation: "With 12 points, 12 coefficients can memorise every point exactly. With 48 points they can’t, so least squares averages the noise out.",
    },
  ],

  glossary: [
    { term: "Generalisation", definition: "How well a model performs on new data from the same source." },
    { term: "Underfitting", definition: "A model too simple to capture the pattern; high training and validation error." },
    { term: "Overfitting", definition: "A model that fits noise in the training data; low training error, much higher validation error." },
    { term: "Model complexity (capacity)", definition: "How flexible a model is — here, the polynomial degree." },
    { term: "Validation set", definition: "Held-out data used to compare and choose models." },
    { term: "Bias", definition: "Systematic error from a model that is too rigid for the pattern." },
    { term: "Variance", definition: "How much a fitted model changes with the particular training sample." },
    { term: "Irreducible error", definition: "Noise no model can predict; here σ² = 0.04." },
    { term: "Regularisation", definition: "Adding a penalty or constraint that discourages overly complex fits." },
    { term: "Ridge penalty", definition: "λ times the sum of squared coefficients, added to the training loss." },
    { term: "Interpolation", definition: "Passing exactly through every training point." },
  ],

  references: [
    {
      title: "An Introduction to Statistical Learning (2nd ed.), sections 2.2 and 6.2",
      source: "James, Witten, Hastie & Tibshirani, Springer, 2021",
      url: "https://www.statlearning.com/",
      note: "The bias–variance trade-off, and ridge regression as a way to control it.",
    },
    {
      title: "Underfitting vs. Overfitting",
      source: "scikit-learn example gallery",
      url: "https://scikit-learn.org/stable/auto_examples/model_selection/plot_underfitting_overfitting.html",
      note: "The same idea with polynomials of degree 1, 4 and 15 and cross-validated error.",
    },
    {
      title: "numpy.polynomial.Polynomial.fit",
      source: "NumPy documentation",
      url: "https://numpy.org/doc/stable/reference/generated/numpy.polynomial.polynomial.Polynomial.fit.html",
      note: "The least-squares polynomial fit used in the code.",
    },
  ],

  next: [
    { pathSlug: "ml-foundations", topicSlug: "metrics-cross-validation", reason: "Cross-validation gives a steadier estimate than one validation set when choosing complexity." },
    { pathSlug: "ml-foundations", topicSlug: "trees-ensembles", reason: "Tree depth is a complexity setting, and ensembles are a remedy for variance." },
    { pathSlug: "deep-learning", topicSlug: "regularization-diagnostics", reason: "The same ideas for neural networks: weight decay, dropout and early stopping." },
  ],

  teaching: {
    notes: [
      "Before each degree change in the experiment, ask the class to vote “underfit, good or overfit”, then reveal. Votes at degree 4–6 are usually split, which is a useful discussion.",
      "Point to the noise-level line: no model beats it on average, so a validation error near 0.04 is as good as it gets.",
      "Separate the roles clearly: training data fits, validation data chooses, test data reports.",
    ],
    demo: "Give two groups the same 12 practice questions with answers. One group memorises the answers; the other works out the rule that generates them. Test both on five new questions, then connect the result to degree 11 versus degree 3 in the experiment.",
    discussion: [
      "If you cannot collect more data, which remedy would you try first, and why?",
      "With only 30 validation points, how confident are you that degree 3 is really the best? What could you do to be more confident?",
      "Is a model with training error 0.05 and validation error 0.06 better than one with 0.01 and 0.06?",
    ],
    misconceptions: [
      "“More complex models are always better if you have enough compute.”",
      "“You can spot overfitting from training error alone.”",
      "“Regularisation is a fix for bugs.” It is a deliberate modelling choice, tuned on validation data.",
    ],
    challenge: {
      prompt:
        "Explain why a polynomial of degree n − 1 can always pass exactly through n points with distinct x values. Large neural networks often have far more parameters than training examples, yet many generalise well. Does that contradict this lesson?",
      answer: [
        {
          type: "p",
          text: "Requiring the curve to pass through n points gives n linear equations in the n coefficients. For distinct x values the system has exactly one solution (its Vandermonde matrix is invertible), so an interpolating polynomial always exists.",
        },
        {
          type: "p",
          text: "It doesn’t contradict it, but it shows that parameter count alone is not the whole story. Training methods, architecture and implicit regularisation also limit which functions a network ends up fitting — an active research area. The safe practice is unchanged: judge every model on data it has not seen.",
        },
      ],
    },
  },
};
