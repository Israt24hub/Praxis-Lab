import type { Lesson } from "../../types/content";

/*
 * Data: src/content/datasets/screening-scores.ts (scores of a simulated model).
 * Metric values were computed with scikit-learn and are checked against the browser
 * lab in tests/lab-math.test.ts. The code output was produced by running the code.
 */
export const metricsCrossValidation: Lesson = {
  id: "metrics-cross-validation",
  pathSlug: "ml-foundations",
  topicSlug: "metrics-cross-validation",
  title: "Evaluation metrics and cross-validation",
  summary:
    "“92% accurate” can describe a model that misses most of the cases you care about. This lesson builds the confusion matrix, shows which metrics to trust when one class is rare, and uses cross-validation to get an estimate you can report honestly.",
  level: "intermediate",
  minutes: [50, 70],
  objectives: [
    "Build a **confusion matrix** and compute accuracy, precision, recall, specificity and F1 from it",
    "Explain why **accuracy misleads** when one class is rare, and always compare with the majority-class baseline",
    "Choose a **decision threshold** from what each kind of mistake costs",
    "Compare models across all thresholds with **ROC-AUC** and **average precision**",
    "Estimate performance with **stratified k-fold cross-validation**, report the spread, and keep preprocessing inside each fold",
  ],
  prerequisites: [
    { label: "Regression and classification", href: "/learn/ml-foundations/regression-classification" },
    { label: "Overfitting, underfitting and generalization", href: "/learn/ml-foundations/overfitting-generalization" },
    { label: "Basic scikit-learn (for the code section)" },
  ],

  intro: [
    {
      type: "p",
      text: "A screening model gives each of 200 cases a score between 0 and 1. Only 20 of the cases — 10% — are actually positive. Where should you draw the line between “flag this case” and “clear it”, and how should you describe how good the model is?",
    },
    {
      type: "p",
      text: "This lesson answers both questions with one tool, the **confusion matrix**, and then turns to a second problem: a score measured on one validation split is itself noisy. **Cross-validation** gives a steadier estimate, and tells you how steady it is.",
    },
  ],

  why: [
    {
      type: "p",
      text: "Evaluation decides which model gets used and whether a claim in a paper holds up. The wrong metric leads to the wrong conclusion: a model that never flags anything is 90% accurate on this data and completely useless.",
    },
    {
      type: "p",
      text: "Different applications need different trade-offs. A disease screen must miss as few true cases as possible; a fraud team can only investigate so many alerts. Metrics make those trade-offs explicit, and cross-validation stops one lucky or unlucky split from deciding the result.",
    },
  ],

  explanation: {
    beginner: [
      {
        type: "p",
        text: "Pick a threshold, and every case falls into one of four boxes. **True positives** are positives the model flags. **False negatives** are positives it misses. **False positives** are negatives it flags by mistake — false alarms. **True negatives** are negatives it correctly clears.",
      },
      {
        type: "p",
        text: "**Accuracy** is the share of all cases in the two correct boxes. When positives are rare, it is dominated by the negatives: here, predicting “negative” for everyone is 90% accurate.",
      },
      {
        type: "p",
        text: "**Precision** asks: of the cases we flagged, how many were really positive? **Recall** asks: of the real positives, how many did we flag? Lowering the threshold flags more cases, so recall rises and precision usually falls. **F1** combines the two and is only high when both are.",
      },
      {
        type: "p",
        text: "Which threshold is right depends on what mistakes cost. A missed cancer is far worse than a false alarm that leads to a second test, so screening favours recall. A spam filter that deletes real mail is worse than one that lets some spam through, so it favours precision.",
      },
      {
        type: "p",
        text: "Two numbers summarise a model across **all** thresholds: **ROC-AUC** (how often a random positive scores above a random negative) and **average precision** (the area under the precision–recall curve). When positives are rare, average precision is the more revealing of the two.",
      },
      {
        type: "p",
        text: "**Cross-validation** splits the training data into k parts (folds). Each fold takes a turn as the validation set while the model trains on the rest. You get k scores: report their average *and* their spread.",
      },
    ],
    technical: [
      {
        type: "p",
        text: "For threshold t, ŷ = 1[s ≥ t]. Accuracy = (TP + TN)/N, precision = TP/(TP + FP) (undefined when nothing is flagged), recall = TPR = TP/(TP + FN), specificity = TN/(TN + FP), FPR = 1 − specificity, F1 = 2PR/(P + R). F_β weights recall β times as heavily as precision.",
      },
      {
        type: "p",
        text: "The ROC curve plots TPR against FPR over all thresholds. ROC-AUC equals P(s₊ > s₋) + ½P(s₊ = s₋) — the Mann–Whitney statistic — and does not depend on class prevalence. That is a strength and a weakness: with 180 negatives, 18 false positives move FPR by only 0.1, so ROC-AUC can look excellent (0.914 here) while precision at useful recall is modest.",
      },
      {
        type: "p",
        text: "The precision–recall curve does depend on prevalence: a random classifier has precision equal to the positive rate (0.10 here) at every recall. scikit-learn’s average precision is the step-wise sum Σₙ (Rₙ − Rₙ₋₁)·Pₙ over thresholds, which avoids the optimism of linear interpolation between PR points.",
      },
      {
        type: "p",
        text: "Thresholds and model choices are hyperparameters: choose them on validation data or cross-validated predictions, never on the test set. Reweighting classes in the loss (class_weight) shifts the effective threshold; ranking metrics such as average precision change little.",
      },
      {
        type: "p",
        text: "k-fold cross-validation averages k validation scores to reduce the variance of a single split. Stratified folds keep class proportions; grouped or time-ordered folds are needed when rows are not independent. Fold scores share training data, so their standard deviation understates the true uncertainty — treat it as a guide. Any fitted preprocessing must sit inside the cross-validated pipeline, and tuning inside the loop requires nested cross-validation for an unbiased estimate.",
      },
    ],
  },

  analogy: {
    title: "A fishing net with an adjustable mesh",
    blocks: [
      {
        type: "p",
        text: "A fine mesh (a low threshold) catches every fish you want — high recall — and plenty of rubbish too — low precision. A wide mesh brings up little rubbish but lets fish escape. In a sea that is 90% water, a net that catches nothing at all is “90% correct”, which is exactly what accuracy rewards.",
      },
      {
        type: "p",
        text: "The analogy stops at costs. A fisher can see the rubbish and throw it back; in medicine or fraud, each false alarm and each miss has a cost that someone has to decide on before choosing the mesh.",
      },
    ],
  },

  workedExample: {
    title: "Four thresholds, one baseline",
    blocks: [
      {
        type: "p",
        text: "For the 200 screening cases (20 positive), here is what different thresholds give:",
      },
      {
        type: "table",
        caption: "Confusion counts and metrics by threshold",
        head: ["Rule", "TP", "FP", "FN", "TN", "Accuracy", "Precision", "Recall", "F1"],
        rows: [
          ["Always negative", "0", "0", "20", "180", "90.0%", "undefined", "0%", "0"],
          ["Score ≥ 0.70", "6", "2", "14", "178", "92.0%", "75.0%", "30.0%", "0.429"],
          ["Score ≥ 0.50", "15", "18", "5", "162", "88.5%", "45.5%", "75.0%", "0.566"],
          ["Score ≥ 0.46", "18", "33", "2", "147", "82.5%", "35.3%", "90.0%", "0.507"],
        ],
      },
      {
        type: "p",
        text: "At 0.70 the model is 92% accurate — just above doing nothing — and misses 14 of the 20 positives. At 0.50 it finds three quarters of them, with the best F1 of any threshold, and its accuracy is *lower* than doing nothing. To find 90% of positives (0.46), you accept 33 false alarms.",
      },
      {
        type: "p",
        text: "None of these is “the” right answer. If a missed case costs much more than a false alarm, 0.46 is reasonable; if investigators can only handle a few alerts, 0.70 is. Across all thresholds the model has ROC-AUC 0.914 and average precision 0.577, against 0.5 and 0.10 for random guessing.",
      },
    ],
  },

  math: {
    blocks: [
      { type: "equation", expression: "accuracy = (TP + TN) / (TP + FP + FN + TN)", meaning: "Share of all cases classified correctly." },
      { type: "equation", expression: "precision = TP / (TP + FP)      recall = TP / (TP + FN)", meaning: "Of those flagged, how many are positive; of the positives, how many are flagged." },
      { type: "equation", expression: "specificity = TN / (TN + FP)      FPR = FP / (FP + TN)", meaning: "Of the negatives, how many are cleared; how many are falsely flagged." },
      {
        type: "equation",
        expression: "F1 = 2 · precision · recall / (precision + recall)",
        meaning: "The harmonic mean: high only when both are high. F_β = (1 + β²)·P·R / (β²·P + R) weights recall more when β > 1.",
      },
      {
        type: "equation",
        expression: "ROC-AUC = P( s₊ > s₋ ) + ½ · P( s₊ = s₋ )",
        meaning: "The chance that a random positive case scores higher than a random negative one.",
      },
      {
        type: "equation",
        expression: "AP = Σₙ ( Rₙ − Rₙ₋₁ ) · Pₙ",
        meaning: "Average precision: precision at each threshold, weighted by how much recall increases there.",
      },
      {
        type: "equation",
        expression: "CV estimate = (1/k) · Σⱼ scoreⱼ,   reported with its standard deviation",
        meaning: "k-fold cross-validation: each fold is scored by a model trained on the other k − 1 folds.",
      },
    ],
    notation: [
      { symbol: "TP, FP, FN, TN", meaning: "True positives, false positives, false negatives, true negatives" },
      { symbol: "s₊, s₋", meaning: "Scores of a random positive and a random negative case" },
      { symbol: "t", meaning: "Decision threshold: flag when s ≥ t" },
      { symbol: "Pₙ, Rₙ", meaning: "Precision and recall at the n-th threshold" },
      { symbol: "k", meaning: "Number of cross-validation folds" },
    ],
  },

  process: {
    title: "Evaluating a classifier honestly",
    steps: [
      { title: "Name the costs", text: "Before any numbers: what does a miss cost, and what does a false alarm cost?" },
      { title: "Choose metrics in advance", text: "With rare positives: recall, precision, F1 and average precision — not accuracy alone." },
      { title: "Score the baseline", text: "Always predicting the majority class sets the floor every model must beat." },
      { title: "Cross-validate on training data", text: "Stratified k-fold, with all preprocessing inside the pipeline so it is refitted in each fold." },
      { title: "Compare with spread", text: "Report mean ± standard deviation; differences smaller than the spread are not convincing." },
      { title: "Set the threshold on validation data", text: "Use validation or cross-validated predictions to pick the operating point." },
      { title: "Test once", text: "Apply the chosen model and threshold to the untouched test set, and report that." },
    ],
  },

  interactive: {
    component: "threshold-lab",
    kind: "computation",
    intro:
      "Move the threshold over the scores of a simulated screening model. The confusion matrix, every metric and the points on both curves are recomputed in your browser from the 200 scores.",
    tryThis: [
      "Start at 0.50 and read the four boxes of the confusion matrix.",
      "Press **Highest accuracy**. Compare its accuracy and its recall with the always-negative baseline.",
      "Press **Catch 90% of positives**. How many false alarms does that cost?",
      "Push the threshold to 0.96 or above. What happens to precision, and why?",
      "Move the slider anywhere and watch ROC-AUC and average precision. Do they change?",
    ],
    expect: [
      { action: "Threshold 0.50", result: "15 true positives, 18 false positives, 5 false negatives, 162 true negatives: accuracy 88.5%, recall 75%, F1 0.566 — the highest F1 of any threshold." },
      { action: "Highest accuracy (0.70)", result: "Accuracy 92.0%, only 2 points above the baseline, with recall 30%: 14 positives are missed." },
      { action: "Catch 90% of positives (0.46)", result: "Recall 90% with 33 false alarms; precision falls to 35.3%." },
      { action: "Threshold 0.96 or higher", result: "Nothing is flagged: accuracy equals the baseline’s 90% and precision is undefined, because there are no flagged cases to be right about." },
      { action: "Any threshold", result: "ROC-AUC stays at 0.914 and average precision at 0.577; they summarise every threshold at once." },
    ],
  },

  code: {
    label: "cross_validate.py",
    language: "Python",
    source: `from sklearn.datasets import make_classification
from sklearn.dummy import DummyClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import StratifiedKFold, cross_validate
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler

# A synthetic, imbalanced problem: about 10% positives.
X, y = make_classification(n_samples=1000, n_features=10, n_informative=4,
                           weights=[0.9], flip_y=0.02, random_state=0)
print("positives:", y.sum(), "of", len(y))

cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=0)
scoring = ["accuracy", "recall", "average_precision"]

for name, model in [
    ("always negative", DummyClassifier(strategy="most_frequent")),
    ("logistic regression", make_pipeline(StandardScaler(), LogisticRegression())),
    ("+ class weights", make_pipeline(StandardScaler(), LogisticRegression(class_weight="balanced"))),
]:
    r = cross_validate(model, X, y, cv=cv, scoring=scoring)
    print(f"{name}:")
    for m in scoring:
        scores = r["test_" + m]
        print(f"  {m:17s} {scores.mean():.3f} ± {scores.std():.3f}   folds {scores.round(2)}")`,
    walkthrough: [
      { lines: "9–10", text: "A synthetic dataset with about 10% positives and a little label noise (`flip_y`), so the problem is realistically hard." },
      { lines: "13", text: "`StratifiedKFold` keeps the 10% positive rate in every fold. Without it, a fold could end up with very few positives and a meaningless recall." },
      { lines: "14", text: "Three metrics at once. Accuracy and recall depend on the default 0.5 threshold; average precision uses the scores at every threshold." },
      { lines: "17", text: "The baseline: always predict the most frequent class. Every real model must be compared with it." },
      {
        lines: "18–19",
        text: "`make_pipeline` puts the scaler inside the model, so `cross_validate` refits it on the training folds each time — the validation fold never influences the scaling.",
      },
      { lines: "21", text: "`cross_validate` trains and scores the model five times, once per fold, and returns every fold’s score." },
      { lines: "25", text: "Mean, standard deviation and the individual folds. The spread is part of the result." },
    ],
    shapes: [
      { name: "X", shape: "(1000, 10)", meaning: "1,000 examples, 10 features" },
      { name: "y", shape: "(1000,)", meaning: "0/1 labels, 109 positives" },
      { name: "each training fold", shape: "(800, 10)", meaning: "Four fifths of the data" },
      { name: "each validation fold", shape: "(200, 10)", meaning: "One fifth, about 22 positives" },
      { name: "r[\"test_recall\"]", shape: "(5,)", meaning: "One score per fold" },
    ],
    output: {
      label: "Output",
      text:
        "positives: 109 of 1000\nalways negative:\n  accuracy          0.891 ± 0.002   folds [0.9  0.89 0.89 0.89 0.89]\n  recall            0.000 ± 0.000   folds [0. 0. 0. 0. 0.]\n  average_precision 0.109 ± 0.002   folds [0.1  0.11 0.11 0.11 0.11]\nlogistic regression:\n  accuracy          0.895 ± 0.007   folds [0.9  0.89 0.9  0.88 0.9 ]\n  recall            0.064 ± 0.046   folds [0.05 0.   0.14 0.05 0.09]\n  average_precision 0.368 ± 0.107   folds [0.25 0.51 0.42 0.23 0.43]\n+ class weights:\n  accuracy          0.651 ± 0.026   folds [0.63 0.62 0.64 0.69 0.67]\n  recall            0.596 ± 0.050   folds [0.52 0.64 0.64 0.55 0.64]\n  average_precision 0.337 ± 0.085   folds [0.27 0.44 0.38 0.21 0.38]",
      note: "Produced by running the script with scikit-learn 1.9. Read it carefully: by accuracy the logistic regression looks no better than doing nothing; by average precision it clearly ranks positives above negatives; and class weights raise recall from 6% to 60% at the cost of accuracy. The average precision of one model ranges from 0.23 to 0.51 across folds.",
    },
  },

  useCases: [
    {
      title: "Medical screening",
      text: "Screening tests are tuned for high recall, accepting false alarms that a second, more specific test then resolves. Reporting only accuracy would hide the misses.",
    },
    {
      title: "Fraud and anomaly detection",
      text: "Fraud is rare and investigators’ time is limited, so precision at a fixed number of alerts and average precision matter more than accuracy or ROC-AUC.",
    },
    {
      title: "Your first real project",
      text: "In UCI Bank Marketing only about 11% of customers subscribe. Always predicting “no” is about 89% accurate, which is why the Project Lab recommends average precision and recall for it.",
    },
  ],

  mistakes: [
    {
      kind: "mistake",
      title: "Reporting accuracy alone on imbalanced data",
      text: "Always compare with the majority-class baseline, and report recall and precision (or average precision) alongside accuracy.",
    },
    {
      kind: "mistake",
      title: "Choosing the threshold on the test set",
      text: "The threshold is a tuning decision. Choose it on validation data, then test once.",
    },
    {
      kind: "mistake",
      title: "Preprocessing outside the cross-validation loop",
      text: "Scaling, imputing or selecting features on all the data before `cross_val_score` leaks the validation folds into training. Put every fitted step in a pipeline.",
    },
    {
      kind: "misconception",
      title: "“A high ROC-AUC means the model is good in practice”",
      text: "With rare positives, ROC-AUC can be high while every useful threshold still produces many false alarms. Check the precision–recall curve.",
    },
    {
      kind: "misconception",
      title: "“The cross-validation mean is the model’s true score”",
      text: "It is an estimate with real uncertainty. Report the spread, and don’t claim one model is better when the difference is smaller than that spread.",
    },
    {
      kind: "limitation",
      title: "Random folds assume independent rows",
      text: "If several rows come from the same person, place or time period, random k-fold leaks information between folds. Use grouped or time-based splits instead.",
    },
  ],

  exercise: {
    prompt: [
      {
        type: "p",
        text: "A fraud model checks 1,000 transactions, 20 of which are fraudulent. At its current threshold it flags 50 transactions, 15 of which are fraud.",
      },
      {
        type: "list",
        ordered: true,
        items: [
          "Fill in the confusion matrix.",
          "Compute accuracy, precision, recall and F1.",
          "What is the accuracy of a model that never flags anything?",
          "Investigating a flag costs 5 units; a missed fraud costs 500 units. Compare the total cost of this threshold with flagging nothing.",
        ],
      },
    ],
    hints: [
      "Start with TP = 15 and the number of flags; the rest follow from the totals of 20 frauds and 1,000 transactions.",
      "Precision divides by the number flagged; recall divides by the number of frauds.",
      "Cost = (number flagged × 5) + (number missed × 500).",
    ],
    solution: [
      {
        type: "table",
        caption: "Confusion matrix",
        head: ["Actual", "Flagged", "Not flagged"],
        rows: [
          ["Fraud", "TP = 15", "FN = 5"],
          ["Not fraud", "FP = 35", "TN = 945"],
        ],
      },
      { type: "p", text: "Accuracy = (15 + 945) / 1,000 = **96%**. Precision = 15 / 50 = **30%**. Recall = 15 / 20 = **75%**. F1 = 2 × 0.30 × 0.75 / 1.05 ≈ **0.429**." },
      { type: "p", text: "Never flagging gives (0 + 980) / 1,000 = **98%** accuracy — higher than the model, while catching no fraud at all." },
      {
        type: "p",
        text: "Cost of this threshold: 50 × 5 + 5 × 500 = **2,750**. Cost of flagging nothing: 20 × 500 = **10,000**. The model with the lower accuracy is by far the better choice once costs are counted.",
      },
    ],
  },

  quiz: [
    {
      question: "Of 1,000 emails, 50 are spam. A filter marks every email as “not spam”. What is its accuracy?",
      options: ["5%", "50%", "95%", "100%"],
      answer: 2,
      explanation: "It is right about all 950 legitimate emails and wrong about the 50 spam ones: 950 / 1,000 = 95%. That is the baseline any real filter must beat.",
    },
    {
      question: "Which metric answers “of the patients we flagged, how many actually have the disease”?",
      options: ["Recall", "Precision", "Specificity", "Accuracy"],
      answer: 1,
      explanation: "Precision divides true positives by everything flagged. Recall divides them by everyone who actually has the disease.",
    },
    {
      question: "What usually happens when you lower the decision threshold?",
      options: [
        "Recall falls and precision rises",
        "Recall rises and precision falls",
        "Both rise",
        "ROC-AUC changes",
      ],
      answer: 1,
      explanation: "More cases are flagged, so more positives are found (recall up) and more negatives are flagged by mistake (precision usually down). ROC-AUC summarises all thresholds and doesn’t change.",
    },
    {
      question: "Why is the precision–recall curve often more informative than the ROC curve when positives are rare?",
      options: [
        "It is easier to compute",
        "The false positive rate divides by the large number of negatives, so many false alarms barely move the ROC curve; precision shows them directly",
        "ROC curves only work for balanced data",
        "PR curves don’t need a threshold",
      ],
      answer: 1,
      explanation: "In the experiment, 18 false alarms change FPR by only 0.1 but cut precision to 45%. Saito and Rehmsmeier (2015) make this case in detail.",
    },
    {
      question: "How should a scaler be used with cross-validation?",
      options: [
        "Fit it on all the data first, then cross-validate",
        "Put it in a pipeline with the model, so it is fitted on the training folds only, every time",
        "Fit it on the validation fold",
        "Scaling isn’t allowed with cross-validation",
      ],
      answer: 1,
      explanation: "Fitting it on all the data lets the validation folds influence training. A pipeline refits it within each fold.",
    },
    {
      question: "Cross-validation gives average precision 0.368 ± 0.107. What does the ± 0.107 tell you?",
      options: [
        "The model is 10.7% wrong",
        "The score varies a lot between folds, so a rival model scoring 0.40 is not clearly better",
        "The test set score will be exactly 0.368",
        "The folds were not stratified",
      ],
      answer: 1,
      explanation: "The spread shows how much the estimate depends on which data lands in which fold. Differences smaller than it are weak evidence.",
    },
  ],

  glossary: [
    { term: "Confusion matrix", definition: "A table of true positives, false positives, false negatives and true negatives." },
    { term: "True / false positive", definition: "A flagged case that is / isn’t actually positive." },
    { term: "True / false negative", definition: "A cleared case that is / isn’t actually negative." },
    { term: "Accuracy", definition: "Share of all cases classified correctly." },
    { term: "Precision", definition: "Share of flagged cases that are positive." },
    { term: "Recall (sensitivity)", definition: "Share of positive cases that are flagged." },
    { term: "Specificity", definition: "Share of negative cases that are cleared." },
    { term: "F1 score", definition: "Harmonic mean of precision and recall." },
    { term: "ROC curve, ROC-AUC", definition: "True positive rate against false positive rate over all thresholds, and the area under it." },
    { term: "Precision–recall curve, average precision", definition: "Precision against recall over all thresholds, and its step-wise area." },
    { term: "Class imbalance", definition: "When one class is much rarer than the other." },
    { term: "k-fold cross-validation", definition: "Rotating each of k folds through the role of validation set and averaging the scores." },
    { term: "Stratified folds", definition: "Folds that keep the overall class proportions." },
  ],

  references: [
    {
      title: "Metrics and scoring: quantifying the quality of predictions",
      source: "scikit-learn User Guide, section 3.4",
      url: "https://scikit-learn.org/stable/modules/model_evaluation.html",
      note: "Definitions of every metric used here, including average precision.",
    },
    {
      title: "Cross-validation: evaluating estimator performance",
      source: "scikit-learn User Guide, section 3.1",
      url: "https://scikit-learn.org/stable/modules/cross_validation.html",
      note: "k-fold, stratified, grouped and time-series splitters, and `cross_validate`.",
    },
    {
      title: "The Precision-Recall Plot Is More Informative than the ROC Plot When Evaluating Binary Classifiers on Imbalanced Datasets",
      source: "Saito & Rehmsmeier, PLoS ONE 10(3): e0118432, 2015",
      url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC4349800",
      note: "Why ROC plots can flatter a classifier when positives are rare.",
    },
    {
      title: "An Introduction to Statistical Learning (2nd ed.), sections 4.4 and 5.1",
      source: "James, Witten, Hastie & Tibshirani, Springer, 2021",
      url: "https://www.statlearning.com/",
      note: "Confusion matrices and ROC curves, then cross-validation.",
    },
  ],

  next: [
    { pathSlug: "ml-foundations", topicSlug: "train-validation-test", reason: "Where validation and test sets fit, and how to split when rows are not independent." },
    { pathSlug: "ai-engineering", topicSlug: "evaluation-error-analysis", reason: "Looking past the numbers at what the model actually gets wrong." },
    { pathSlug: "research-paper-writing", topicSlug: "baselines-comparisons", reason: "Comparing methods fairly in a paper, with the spread reported." },
  ],

  teaching: {
    notes: [
      "Ask “what would doing nothing score?” before every evaluation. It immediately exposes the accuracy trap.",
      "Keep the 2 × 2 confusion matrix on the board for the whole lesson; every metric is a ratio of its cells.",
      "Before choosing a threshold, make the class name the cost of each kind of mistake. The choice then follows from the costs.",
    ],
    demo: "Print the 20 positive and 40 of the negative scores on cards, and line them up along a rope on the floor. Move a marker along the rope as the threshold and have the class count the four boxes at three positions. Then open the experiment and compare.",
    discussion: [
      "In medical screening, who should decide how much a missed case costs compared with a false alarm?",
      "A paper reports “92% accuracy” for the threshold-0.70 model. What else should the abstract say?",
      "When would ROC-AUC be the right summary despite its weakness with rare positives?",
    ],
    misconceptions: [
      "“Precision and recall are two words for the same thing.”",
      "“A good model is one with high accuracy.”",
      "“Cross-validation folds are independent experiments, so their spread is exact.”",
    ],
    challenge: {
      prompt:
        "A useless classifier gives every case a random score, unrelated to its label. Show that its expected precision at any threshold equals the positive rate, and that its ROC-AUC is 0.5.",
      answer: [
        {
          type: "p",
          text: "If scores ignore the labels, the cases above any threshold are a random sample of all cases, so on average the same share of them — the positive rate — is positive. Precision equals prevalence, which is why it is the PR baseline.",
        },
        {
          type: "p",
          text: "For the same reason, a random positive and a random negative are equally likely to have the higher score, so P(s₊ > s₋) = 0.5. Equivalently, TPR = FPR at every threshold and the ROC curve is the diagonal.",
        },
      ],
    },
  },
};
