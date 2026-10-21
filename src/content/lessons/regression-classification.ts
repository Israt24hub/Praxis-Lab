import type { Lesson } from "../../types/content";

/*
 * Data: src/content/datasets/pass-fail.ts (invented). Fitted values were computed
 * with NumPy/scikit-learn and are checked against the browser lab in tests/lab-math.test.ts.
 */
export const regressionClassification: Lesson = {
  id: "regression-classification",
  pathSlug: "ml-foundations",
  topicSlug: "regression-classification",
  title: "Regression and classification",
  summary:
    "Predicting a number and predicting a category need different models. This lesson fits a straight line and a logistic regression to the same pass/fail data, and shows why the line fails as a classifier.",
  level: "beginner",
  minutes: [45, 60],
  objectives: [
    "Tell a **regression** problem from a **classification** problem by looking at the target",
    "Explain why a straight line is a poor model for a yes/no target",
    "Use **logistic regression** to turn a weighted sum into a probability, and a **threshold** to turn that probability into a decision",
    "Read a fitted model: its weight, its decision boundary and its probabilities",
  ],
  prerequisites: [
    { label: "What does learning from data mean?", href: "/learn/ml-foundations/learning-from-data" },
    { label: "Features, labels, datasets and predictions", href: "/learn/ml-foundations/features-labels-datasets" },
    { label: "Helpful: Perceptrons and single neurons (the sigmoid function)", href: "/learn/deep-learning/perceptrons-neurons" },
  ],

  intro: [
    {
      type: "p",
      text: "In the first lesson the target was an exam score, which can be any number. Ask a slightly different question — **will this student pass?** — and the target becomes yes or no. Same students, same feature, a different kind of problem.",
    },
    {
      type: "p",
      text: "Predicting a number is **regression**. Predicting a category is **classification**. This lesson shows what goes wrong when you treat a yes/no target as a number, and introduces the model built for it: logistic regression.",
    },
  ],

  why: [
    {
      type: "p",
      text: "Many real questions have categorical answers: is this email spam, does this scan show a tumour, which digit is this. A model for them should output something that can be compared with a category — and, ideally, say how sure it is.",
    },
    {
      type: "p",
      text: "A straight line can output any number, including 1.25 or −0.1, which mean nothing as answers to a yes/no question. Logistic regression solves this by squeezing its output into a probability between 0 and 1, and leaves the final yes/no decision to a threshold you choose.",
    },
  ],

  explanation: {
    beginner: [
      {
        type: "p",
        text: "**Regression** predicts a quantity: an exam score, a price, a temperature. A prediction is good when it is close to the true number.",
      },
      {
        type: "p",
        text: "**Classification** predicts a category: pass or fail. A prediction is either right or wrong — though a good model also tells you how confident it is.",
      },
      {
        type: "p",
        text: "You *could* fit a straight line to labels coded as 0 (fail) and 1 (pass). But the line keeps going: for a student who studied 9 hours it predicts 1.25, and one unusual student far to the right can tilt the whole line and move its decision point.",
      },
      {
        type: "p",
        text: "**Logistic regression** starts with the same weighted sum, z = w × hours + b, then passes it through the **sigmoid** function. The result is always between 0 and 1, so it can be read as the probability of passing.",
      },
      {
        type: "p",
        text: "To make a decision, compare the probability with a **threshold**: predict “pass” if it is at least 0.5, say. Moving the threshold trades one kind of mistake for another — that is the subject of the metrics lesson.",
      },
      {
        type: "p",
        text: "Training uses a different loss from lesson 1. Instead of squared error it uses **log loss**, which punishes confident wrong answers very heavily and barely notices confident right ones.",
      },
    ],
    technical: [
      {
        type: "p",
        text: "In regression, y ∈ ℝ and the model estimates the conditional mean E[y | x], usually by minimising squared error. In binary classification, y ∈ {0, 1} and the model estimates p(x) = P(y = 1 | x).",
      },
      {
        type: "p",
        text: "Least squares on 0/1 labels — the linear probability model — produces unbounded outputs, and squared error penalises correctly classified points that lie far from the boundary, so a single extreme but correct example can drag the fit.",
      },
      {
        type: "p",
        text: "Logistic regression models the **log-odds** as linear: log(p / (1 − p)) = w·x + b, so p = σ(w·x + b). It is fitted by maximum likelihood, which is the same as minimising the mean binary cross-entropy. The loss is convex but has no closed-form minimiser; Newton’s method (iteratively reweighted least squares) or gradient descent finds it.",
      },
      {
        type: "p",
        text: "For a threshold t, the decision boundary is w·x + b = logit(t): a point in one dimension, a line in two, a hyperplane in general. The weight has a direct reading: e^w is the multiplicative change in the odds per unit of x — here e^1.12 ≈ 3.07 per hour of study, an association in this data rather than a causal effect.",
      },
      {
        type: "p",
        text: "If the classes are perfectly separable, the likelihood keeps increasing as |w| grows, so the unregularised estimate does not exist. This is one reason scikit-learn regularises by default (C = 1). With more than two classes, softmax regression generalises the same idea.",
      },
    ],
  },

  analogy: {
    title: "A dial and a switch",
    blocks: [
      {
        type: "p",
        text: "Regression is a dial: it reads out a quantity, such as the temperature. Classification ends with a switch: the heater is on or off. Logistic regression gives you both — a dial reading of “how likely”, and a switch point that you set.",
      },
      {
        type: "p",
        text: "Where you put the switch depends on what mistakes cost. A smoke alarm is set to go off early, accepting false alarms; a spam filter is set to avoid deleting real mail. The analogy ends where real decisions need more than two positions — that is multi-class classification.",
      },
    ],
  },

  workedExample: {
    title: "From hours to a probability to a decision",
    blocks: [
      {
        type: "p",
        text: "Fitted to the 20 students, logistic regression gives w ≈ 1.12 per hour and b ≈ −4.06. For three new students:",
      },
      {
        type: "table",
        caption: "Logistic regression with w = 1.12, b = −4.06",
        head: ["Hours", "z = w·hours + b", "P(pass) = σ(z)", "Decision at threshold 0.5"],
        rows: [
          ["2", "−1.81", "0.140", "fail"],
          ["4", "0.43", "0.606", "pass"],
          ["6", "2.68", "0.936", "pass"],
        ],
      },
      {
        type: "p",
        text: "The model switches from fail to pass where z = 0, at 4.06 ÷ 1.12 ≈ **3.62 hours**. A straight line fitted to the same 0/1 labels crosses 0.5 at 3.75 hours — similar — but predicts 0.03 for 0.5 hours and **1.25** for 9 hours, which is not a probability.",
      },
      {
        type: "p",
        text: "Now add one student who studied 25 hours and passed. Logistic regression is already confident about such a student, so it barely changes. The line is pulled flat, its decision point jumps to **2.83 hours**, and its accuracy on the original 20 students falls from 80% to 75%.",
      },
    ],
  },

  math: {
    blocks: [
      { type: "equation", expression: "z = w·x + b", meaning: "The weighted sum, exactly as in linear regression and in a single neuron." },
      { type: "equation", expression: "p = σ(z) = 1 / (1 + e^(−z))", meaning: "The sigmoid maps any z to a probability between 0 and 1; σ(0) = 0.5." },
      { type: "equation", expression: "log( p / (1 − p) ) = w·x + b", meaning: "Equivalently, the log-odds of passing is a straight line in x." },
      {
        type: "equation",
        expression: "L(w, b) = −(1/n) · Σᵢ [ yᵢ·log pᵢ + (1 − yᵢ)·log(1 − pᵢ) ]",
        meaning: "Log loss (binary cross-entropy). Confident wrong predictions cost the most; confident right ones cost almost nothing.",
      },
      {
        type: "equation",
        expression: "∂L/∂w = (1/n) · Σᵢ (pᵢ − yᵢ)·xᵢ      ∂L/∂b = (1/n) · Σᵢ (pᵢ − yᵢ)",
        meaning: "The gradients have the same shape as in linear regression, with the probability in place of the prediction.",
      },
      {
        type: "equation",
        expression: "x* = ( logit(t) − b ) / w,   logit(t) = log( t / (1 − t) )",
        meaning: "The decision boundary for threshold t. At t = 0.5, logit(t) = 0 and x* = −b / w.",
      },
    ],
    notation: [
      { symbol: "y ∈ {0, 1}", meaning: "Binary target: 1 = passed, 0 = failed" },
      { symbol: "p, pᵢ", meaning: "Predicted probability that y = 1" },
      { symbol: "σ", meaning: "The sigmoid (logistic) function" },
      { symbol: "p / (1 − p)", meaning: "The odds; log of it is the log-odds or logit" },
      { symbol: "t", meaning: "Decision threshold" },
      { symbol: "x*", meaning: "Decision boundary: where the decision changes" },
    ],
  },

  process: {
    title: "From a question to a classifier",
    steps: [
      { title: "Look at the target", text: "A number → regression. A category → classification. Two categories → binary classification." },
      { title: "Choose the model", text: "For a binary target, logistic regression is the standard first model and baseline." },
      { title: "Fit by maximum likelihood", text: "Minimise log loss on the training data. No closed form; an optimiser finds it." },
      { title: "Get probabilities", text: "For each example, p = σ(w·x + b): how likely the positive class is." },
      { title: "Choose a threshold", text: "0.5 by default; move it when one kind of mistake costs more than the other." },
      { title: "Evaluate the decisions", text: "Accuracy, and — especially with imbalanced classes — precision and recall (next lessons)." },
    ],
  },

  interactive: {
    component: "pass-fail-lab",
    kind: "computation",
    intro:
      "Both models are fitted in your browser to the 20 students every time you change something. Compare their curves, move the threshold, and add one unusual student to see which model it disturbs.",
    tryThis: [
      "Compare the two curves. Where does the line go above 1 or below 0?",
      "Tick **Add a student who studied 25 hours and passed**. Watch where each model switches to “pass”.",
      "With that student added, compare both models’ accuracy on the original 20 students.",
      "Move the threshold to 0.30 and then to 0.70. How many students are predicted to pass each time, and which ones become mistakes?",
      "Set the new student to 9 hours and compare the two outputs.",
    ],
    expect: [
      { action: "The starting fit", result: "Logistic regression switches to pass at 3.62 hours, the line at 3.75. Both get 80% of the 20 students right. The line reaches 1.25 at 9 hours." },
      { action: "Adding the 25-hour student", result: "The line’s switch point moves to 2.83 hours and its accuracy on the original 20 drops to 75%. Logistic regression stays at 3.62 hours." },
      { action: "Threshold 0.30", result: "15 students are predicted to pass and accuracy falls to 75%: fewer passing students are missed, but more failing students are called passes." },
      { action: "Threshold 0.70", result: "10 students are predicted to pass, with 80% accuracy." },
    ],
  },

  code: {
    label: "pass_fail.py",
    language: "Python",
    source: `import numpy as np
from sklearn.linear_model import LinearRegression, LogisticRegression

# Hours studied and whether each of 20 students passed (1) or failed (0).
hours = np.array([0.5, 1, 1.5, 2, 2.5, 3, 3, 3.5, 4, 4, 4.5, 5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 9])
passed = np.array([0, 0, 0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1])
X = hours.reshape(-1, 1)

clf = LogisticRegression(C=np.inf)  # C=inf: no regularisation, to match the lesson
clf.fit(X, passed)
w, b = clf.coef_[0, 0], clf.intercept_[0]
print(f"logistic: w = {w:.2f}, b = {b:.2f}, boundary = {-b / w:.2f} hours")
print("P(pass) at 2, 4, 6 hours:", clf.predict_proba([[2], [4], [6]])[:, 1].round(3))

line = LinearRegression().fit(X, passed)  # a straight line through 0/1 labels
print("line at 0.5 and 9 hours:", line.predict([[0.5], [9]]).round(3))`,
    walkthrough: [
      { lines: "5–7", text: "The same 20 students as the experiment. `reshape(-1, 1)` makes one feature column." },
      {
        lines: "9",
        text: "`C` is the inverse strength of regularisation. `C=np.inf` turns it off, which is how the scikit-learn documentation now says to do it (the older `penalty=None` is deprecated). The default, `C=1`, would shrink w slightly.",
      },
      { lines: "11", text: "`coef_` has one row per class boundary and one column per feature, so the single weight is `coef_[0, 0]`." },
      {
        lines: "13",
        text: "`predict_proba` returns one column per class — P(fail), P(pass) — so `[:, 1]` picks P(pass). `predict` would apply the default threshold of 0.5 for you.",
      },
      { lines: "15–16", text: "The line for comparison. Its outputs are not probabilities, as the 1.251 shows." },
    ],
    shapes: [
      { name: "X", shape: "(20, 1)", meaning: "20 students, 1 feature" },
      { name: "passed", shape: "(20,)", meaning: "One 0/1 label per student" },
      { name: "clf.coef_", shape: "(1, 1)", meaning: "One weight for one feature (binary problem)" },
      { name: "clf.predict_proba(...)", shape: "(3, 2)", meaning: "Three students × two classes; each row sums to 1" },
    ],
    output: {
      label: "Output",
      text: "logistic: w = 1.12, b = -4.06, boundary = 3.62 hours\nP(pass) at 2, 4, 6 hours: [0.14  0.606 0.936]\nline at 0.5 and 9 hours: [0.034 1.251]",
      note: "Produced by running the script with scikit-learn 1.9. The browser experiment fits the same model with Newton’s method and gets the same numbers.",
    },
  },

  useCases: [
    {
      title: "Regression in practice",
      text: "Predicting house prices, delivery times, energy demand or exam scores: the target is a quantity, and errors are measured as distances.",
    },
    {
      title: "Classification in practice",
      text: "Spam filtering, fraud detection, disease screening and digit recognition: the target is a category, and errors are counted — usually separately for each kind of mistake.",
    },
    {
      title: "Your first real project",
      text: "Whether a bank customer subscribes to a term deposit is a binary target. Logistic regression is the standard first baseline for it, and its probabilities let you rank customers by how likely they are to say yes.",
    },
  ],

  mistakes: [
    {
      kind: "mistake",
      title: "Reading a line’s output as a probability",
      text: "A line fitted to 0/1 labels can output 1.25 or −0.1. Those are not probabilities, and the line can be dragged by examples that are already correctly classified.",
    },
    {
      kind: "misconception",
      title: "“Logistic regression is regression, so it predicts numbers”",
      text: "It predicts the probability of a class and is used for classification. The name comes from the regression on the log-odds.",
    },
    {
      kind: "misconception",
      title: "“0.5 is the correct threshold”",
      text: "0.5 is only a default. A cancer screen and a spam filter should use very different thresholds, because their mistakes cost different things.",
    },
    {
      kind: "limitation",
      title: "One straight boundary",
      text: "With one feature, logistic regression has a single switch point. It can’t express “pass only between 3 and 6 hours” without extra features such as hours².",
    },
    {
      kind: "limitation",
      title: "Perfectly separated data",
      text: "If one hours value separates every pass from every fail, the unregularised weight grows without limit. Regularisation (scikit-learn’s default) keeps it finite.",
    },
  ],

  exercise: {
    prompt: [
      {
        type: "p",
        text: "A shop’s logistic regression predicts whether a visitor buys something from the number of minutes they spend on the site: w = 0.8 per minute, b = −4.",
      },
      {
        type: "list",
        ordered: true,
        items: [
          "Compute P(buy) for visitors who stay 2, 5 and 8 minutes.",
          "At what number of minutes does the decision switch to “buy” with threshold 0.5? With threshold 0.8?",
          "By what factor do the odds of buying change for each extra minute?",
        ],
      },
    ],
    hints: [
      "First compute z = 0.8 × minutes − 4, then σ(z) = 1 / (1 + e^(−z)).",
      "The switch is where z = logit(t). logit(0.5) = 0; logit(0.8) = log(0.8 / 0.2) = log 4 ≈ 1.386.",
      "The odds factor per unit is e^w.",
    ],
    solution: [
      {
        type: "table",
        caption: "Solution",
        head: ["Minutes", "z", "P(buy)"],
        rows: [
          ["2", "−2.4", "≈ 0.083"],
          ["5", "0", "0.5"],
          ["8", "2.4", "≈ 0.917"],
        ],
      },
      { type: "p", text: "Threshold 0.5: 0.8m − 4 = 0, so m = **5 minutes**. Threshold 0.8: 0.8m − 4 = 1.386, so m ≈ **6.73 minutes**." },
      { type: "p", text: "Each extra minute multiplies the odds of buying by e^0.8 ≈ **2.23**." },
    ],
  },

  quiz: [
    {
      question: "Which of these is a classification problem?",
      options: ["Predicting tomorrow’s temperature", "Predicting whether an email is spam", "Predicting a house’s price", "Predicting an exam score out of 100"],
      answer: 1,
      explanation: "Spam or not spam is a category. The others are quantities, so they are regression problems.",
    },
    {
      question: "What does the sigmoid output when z = 0?",
      options: ["0", "0.5", "1", "It depends on w"],
      answer: 1,
      explanation: "σ(0) = 1 / (1 + 1) = 0.5. That is why, at threshold 0.5, the decision boundary is where w·x + b = 0.",
    },
    {
      question: "Why does adding a correctly labelled student who studied 25 hours move the line but not logistic regression?",
      options: [
        "Logistic regression ignores students above 10 hours",
        "Squared error punishes the line for being far from 1 at 25 hours, even though that student is classified correctly; log loss for a confident, correct prediction is close to zero",
        "The line has more parameters",
        "The 25-hour student is mislabelled",
      ],
      answer: 1,
      explanation: "The line is fitted to make outputs close to 0 and 1, so an extreme point drags it. Logistic regression only cares about getting probabilities right, and it is already right about that student.",
    },
    {
      question: "Lowering the threshold from 0.5 to 0.3 will…",
      options: [
        "predict “pass” for fewer students",
        "predict “pass” for more students: fewer real passes are missed, but more failing students are called passes",
        "change the fitted weight w",
        "always increase accuracy",
      ],
      answer: 1,
      explanation: "The threshold changes decisions, not the model. In the experiment, 0.3 predicts 15 passes instead of 12 and accuracy falls from 80% to 75%.",
    },
    {
      question: "The fitted weight is w ≈ 1.12 per hour, and e^1.12 ≈ 3.07. What does that mean?",
      options: [
        "Each hour adds 3.07 marks",
        "Each extra hour of study is associated with the odds of passing being multiplied by about 3.1 in this data",
        "The probability of passing triples every hour, up to 100%",
        "Studying causes students to pass",
      ],
      answer: 1,
      explanation: "In logistic regression, e^w is an odds ratio per unit of the feature. It describes an association in this data, not a cause.",
    },
  ],

  glossary: [
    { term: "Regression", definition: "Predicting a numeric quantity." },
    { term: "Classification", definition: "Predicting a category; binary classification has two." },
    { term: "Odds", definition: "p / (1 − p): how much more likely an event is than not." },
    { term: "Log-odds (logit)", definition: "The logarithm of the odds; logistic regression models it as a straight line." },
    { term: "Sigmoid", definition: "σ(z) = 1 / (1 + e^(−z)), mapping any number to the range 0–1." },
    { term: "Logistic regression", definition: "A classifier that predicts p = σ(w·x + b) and is fitted by maximum likelihood." },
    { term: "Log loss (binary cross-entropy)", definition: "The loss minimised by logistic regression; large for confident wrong predictions." },
    { term: "Decision threshold", definition: "The probability above which the positive class is predicted." },
    { term: "Decision boundary", definition: "The inputs at which the predicted class changes." },
    { term: "Linear probability model", definition: "A straight line fitted to 0/1 labels by least squares." },
    { term: "Odds ratio", definition: "e^w: the factor by which the odds change per unit of a feature." },
  ],

  references: [
    {
      title: "An Introduction to Statistical Learning (2nd ed.), chapter 4: Classification",
      source: "James, Witten, Hastie & Tibshirani, Springer, 2021",
      url: "https://www.statlearning.com/",
      note: "Why linear regression is unsuitable for categorical targets, and logistic regression in depth.",
    },
    {
      title: "sklearn.linear_model.LogisticRegression",
      source: "scikit-learn API reference",
      url: "https://scikit-learn.org/stable/modules/generated/sklearn.linear_model.LogisticRegression.html",
      note: "Parameters, solvers and regularisation, including `C=np.inf` for an unpenalised fit.",
    },
    {
      title: "Applied Logistic Regression (3rd ed.)",
      source: "Hosmer, Lemeshow & Sturdivant, Wiley, 2013",
      note: "A thorough statistical treatment, including interpreting odds ratios.",
    },
  ],

  next: [
    { pathSlug: "ml-foundations", topicSlug: "metrics-cross-validation", reason: "Choosing a threshold and measuring a classifier properly, especially with rare classes." },
    { pathSlug: "ml-foundations", topicSlug: "overfitting-generalization", reason: "What happens when a model is too flexible for its data." },
    { pathSlug: "deep-learning", topicSlug: "perceptrons-neurons", reason: "A single sigmoid neuron is logistic regression — the start of neural networks." },
  ],

  teaching: {
    notes: [
      "Open with the same data and two questions — “what score?” and “pass or fail?” — so students see that the target, not the data, decides the problem type.",
      "Draw a straight line through 0/1 points on the board and ask what an output of 1.25 means. The awkward silence does the teaching.",
      "Keep “probability” and “decision” separate throughout. Many later misunderstandings come from merging them.",
    ],
    demo: "Give each student a card with hours studied and pass/fail and line them up by hours. Ask the class where to put the switch point. Then add a card for someone who studied 25 hours and passed, show the experiment, and ask which model should change its mind — and which one does.",
    discussion: [
      "For a disease screening test, would you choose a threshold above or below 0.5? What does each choice cost, and who pays it?",
      "The model says P(pass) = 0.6 for a student. Is that a statement about this one student, or about students like them?",
      "If you only care about ranking students by risk, does the threshold matter?",
    ],
    misconceptions: [
      "“The S-curve means logistic regression can fit any non-linear pattern.” Its boundary is still linear in the features.",
      "“P(pass) = 0.6 means the student has 60% of the ability needed.”",
      "“A higher threshold always gives a better model.” It changes which mistakes are made, not the model.",
    ],
    challenge: {
      prompt:
        "With two features, a model has w₁ = 1 per hour of study, w₂ = 0.05 per percentage point of attendance and b = −7. A student studies 3 hours. What attendance do they need to be predicted to pass at threshold 0.5? At threshold 0.7?",
      answer: [
        { type: "p", text: "At 0.5 the boundary is z = 0: 3 + 0.05a − 7 = 0, so a = **80%**." },
        { type: "p", text: "At 0.7 the boundary is z = logit(0.7) ≈ 0.847: 0.05a = 4.847, so a ≈ **96.9%**." },
        { type: "p", text: "In two dimensions the boundary w₁·hours + w₂·attendance + b = logit(t) is a straight line; changing the threshold shifts the line without turning it." },
      ],
    },
  },
};
