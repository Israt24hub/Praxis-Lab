import type { Lesson } from "../../types/content";

/*
 * The lab's split and selection numbers come from src/lib/selection.ts and are
 * checked in tests/lab-math.test.ts. The code section's numbers come from running it.
 */
export const trainValidationTest: Lesson = {
  id: "train-validation-test",
  pathSlug: "ml-foundations",
  topicSlug: "train-validation-test",
  title: "Training, validation and testing",
  summary:
    "Training data fits a model, validation data chooses between models, and test data measures the final choice once. This lesson shows why each needs its own data, how to split records that come in groups or in time order, and what happens to a test score when the test set is used to choose.",
  level: "beginner",
  minutes: [40, 55],
  objectives: [
    "Explain the separate job of the **training**, **validation** and **test** sets",
    "Choose a **random**, **grouped** or **time-based** split to match how the model will be used",
    "Explain why choosing a model by its test score makes that score too optimistic",
    "Recognise the common forms of **data leakage** between splits",
  ],
  prerequisites: [
    { label: "Overfitting, underfitting and generalization", href: "/learn/ml-foundations/overfitting-generalization" },
    { label: "Features, labels, datasets and predictions", href: "/learn/ml-foundations/features-labels-datasets" },
  ],

  intro: [
    {
      type: "p",
      text: "Every lesson so far has held some data back: three students in the first lesson, a validation set to choose the polynomial degree, another to choose a tree’s depth. This lesson makes the rules explicit.",
    },
    {
      type: "p",
      text: "The number you report — “our model is 91% accurate” — is a claim about data the model has never seen. It is only believable if the data it was measured on played no part in building or choosing the model. Most inflated results in student projects, and many in published research, break that rule in one of a few predictable ways.",
    },
  ],

  why: [
    {
      type: "p",
      text: "A model is shaped by every decision made while looking at data: its parameters, its settings, which features to keep, even which model to use. Each decision made on some data makes the model look better on **that** data than it will on new data.",
    },
    {
      type: "p",
      text: "So data has to be divided by role. Training data is used up by fitting; validation data is used up by choosing; the test set is kept untouched so that one honest measurement remains at the end.",
    },
  ],

  explanation: {
    beginner: [
      {
        type: "p",
        text: "**Training set:** the examples the model learns from. Its score is always optimistic — the model has seen the answers.",
      },
      {
        type: "p",
        text: "**Validation set:** examples used to compare options — a polynomial degree, a tree depth, a different model, a different set of features. Pick the option with the best validation score. Because you chose by it, the winner’s validation score is a little optimistic too.",
      },
      {
        type: "p",
        text: "**Test set:** examples kept aside until every decision is final, then used **once**. Its score is the estimate you report. If the result disappoints and you go back to change the model, the test set has become a second validation set and you need fresh test data.",
      },
      {
        type: "p",
        text: "**How to split.** A random split is right when rows are independent. When several rows come from the same person, patient, device or document, put all of a group’s rows on the same side (a **grouped** split) — otherwise the model can recognise the person rather than learn anything general. When the model will predict the future, train on the past and test on later data (a **time-based** split).",
      },
      {
        type: "p",
        text: "A common size is 60% training, 20% validation, 20% test. With little data, use cross-validation on the training part instead of a fixed validation set — but still keep a test set.",
      },
    ],
    technical: [
      {
        type: "p",
        text: "The test set estimates generalisation error: expected loss on new data from the distribution the model will meet. That estimate is unbiased only if the test data is independent of every choice made in fitting and selection, and is drawn the way deployment data will be.",
      },
      {
        type: "p",
        text: "Selecting the best of M candidates by a noisy estimate introduces **selection bias**: the maximum of M noisy scores overestimates the winner’s true score, and the bias grows with M and with the noise (smaller evaluation sets). This is why validation scores of tuned models are optimistic and why a held-out test set — or nested cross-validation — is needed.",
      },
      {
        type: "p",
        text: "Accuracy on n independent test rows has standard error √(p(1 − p)/n): about 3.5 percentage points for n = 200 and p near 0.5. Differences smaller than that between two models are not reliable evidence.",
      },
      {
        type: "p",
        text: "Leakage is any path by which information about the test rows reaches training or selection: duplicated or near-duplicated rows across splits; rows of the same group on both sides; future information in training for a forecasting task; preprocessing (scaling, imputation, feature selection, PCA) fitted on all data; features that are only known after the outcome; and repeated evaluation on the test set.",
      },
    ],
  },

  analogy: {
    title: "Practice questions, mock exam, final exam",
    blocks: [
      {
        type: "p",
        text: "A student learns from practice questions with worked answers (training). Before the real exam they sit a mock to decide how to revise and which methods to use (validation). The final exam measures what they actually know (test) — but only if they haven’t seen it.",
      },
      {
        type: "p",
        text: "Reusing the test set is like a teacher letting a class sit the final paper, discussing the mistakes, and letting them sit the same paper again. The second score is high and means little.",
      },
      {
        type: "p",
        text: "Where it breaks down: a student who sees the paper learns the answers deliberately. A model “sees” the test set indirectly, through your choices — which makes the leak easy to miss.",
      },
    ],
  },

  workedExample: {
    title: "Two ways to fool yourself, measured",
    blocks: [
      {
        type: "p",
        text: "**1. Splitting grouped records.** A clinic has 24 visits by 8 patients (A to H), three visits each, from January to June. A random split puts 6 visits in the test set — and all 6 test patients also have visits in training. A model can match a test visit to the same patient’s earlier visits and look better than it would on a new patient.",
      },
      {
        type: "table",
        caption: "Three splits of the same 24 visits, 6 in the test set each time",
        head: ["Split", "Test patients also in training", "Test visits dated before the last training visit", "Honest estimate for…"],
        rows: [
          ["Random rows", "6", "6", "More visits by the same patients, at any time"],
          ["By patient", "0", "6", "New patients"],
          ["By date", "5", "0", "Future visits by known patients"],
        ],
      },
      {
        type: "p",
        text: "No split is correct in general: each answers a different question. Choose the one that matches how the model will be used.",
      },
      {
        type: "p",
        text: "**2. Choosing on the test set.** Simulate 1,000 candidate models that have no skill at all: labels are coin flips, and each model predicts from its own random feature. Every model’s true accuracy is exactly 50%. Pick the best one by its score on a 200-row test set, and report that score:",
      },
      {
        type: "table",
        caption: "The winner of 1,000 useless models, chosen two ways (the lab’s first dataset)",
        head: ["Chosen by", "Score on the choosing set", "Reported test score", "Score on 5,000 new rows"],
        rows: [
          ["Test set (200 rows)", "63.5%", "63.5%", "51.0%"],
          ["Validation set (200 rows)", "63.0%", "50.5%", "50.1%"],
        ],
      },
      {
        type: "p",
        text: "Both winners are just the luckiest of 1,000 — their choosing scores are inflated by the same amount. The difference is what gets reported: choosing on validation leaves the test set honest (50.5%, within noise of the truth); choosing on test reports 63.5% for a model that is no better than a coin. With 10 candidates instead of 1,000, the inflated test score is 57.0%; with a 1,000-row test set, 55.1%. More candidates and smaller test sets mean more inflation.",
      },
      {
        type: "callout",
        tone: "honesty",
        title: "This happens without any intent to cheat",
        text: "Trying another model, another feature set or another random seed after looking at test results is the same process, one choice at a time.",
      },
    ],
  },

  math: {
    blocks: [
      {
        type: "equation",
        expression: "θ̂ = fit(training)     h* = argmin_h  Loss_validation(h)     report  Loss_test(θ̂, h*)",
        meaning: "Parameters come from training data, choices from validation data, and the reported number from test data — each from its own rows.",
      },
      {
        type: "equation",
        expression: "SE(accuracy) = √( p(1 − p) / n )",
        meaning: "The noise in an accuracy measured on n rows. For p = 0.5 and n = 200: √(0.25/200) ≈ 0.035, so ±3.5 points is ordinary chance variation.",
      },
      {
        type: "equation",
        expression: "E[ max(s₁, …, s_M) ]  >  max( E[s₁], …, E[s_M] )   when the sᵢ are noisy",
        meaning: "Selection bias: the best observed score among M candidates is expected to exceed the best true score. In the simulation every true score is 0.5, yet the maximum of 1,000 was 0.635.",
      },
    ],
    notation: [
      { symbol: "θ̂", meaning: "Fitted parameters (weights, tree splits)" },
      { symbol: "h", meaning: "A choice made by the modeller: a hyperparameter, a model type, a feature set" },
      { symbol: "p, n", meaning: "True accuracy and number of test rows" },
      { symbol: "sᵢ, M", meaning: "Measured score of candidate i, and the number of candidates" },
    ],
  },

  process: {
    title: "Splitting a dataset without leaking",
    steps: [
      { title: "Write down how the model will be used", text: "New people? Future dates? The same population as now? That decides the split." },
      { title: "Remove duplicates first", text: "Exact and near-duplicate rows on both sides of a split inflate scores directly." },
      { title: "Split by the unit that will be new", text: "Random rows, whole groups (patients, users, sites), or a date cut-off. Stratify by class for imbalanced labels." },
      { title: "Lock the test set away", text: "Don’t look at it, plot it or compute statistics on it until the model is final." },
      { title: "Fit all preprocessing on training data", text: "Scalers, imputers, encoders, feature selection and PCA — inside a pipeline, refitted within each cross-validation fold." },
      { title: "Tune on validation or cross-validation", text: "Record every choice tried, not only the winner." },
      { title: "Test once and report it", text: "Report the test score with its uncertainty, and the number of candidates you compared." },
    ],
  },

  interactive: {
    component: "splits-lab",
    kind: "computation",
    intro:
      "Two experiments, both computed in your browser. The first splits 24 clinic visits three ways and checks what each split mixes. The second simulates choosing among many useless models and shows what the reported test score does.",
    tryThis: [
      "Split by **Random rows** and look for patients marked ⚠. Then switch to **By patient** and **By date**.",
      "For the time split, check which patients have visits on both sides of the cut-off. When is that acceptable?",
      "In part 2, keep 1,000 models and 200 test rows. Compare choosing on the test set with choosing on the validation set.",
      "Move **Models tried** from 1 to 1,000, then the **Test set size** from 50 to 1,000, watching the reported score.",
      "Press **Draw a new dataset** a few times. Do the numbers change? Does the pattern?",
    ],
    expect: [
      { action: "Random split", result: "All 6 test patients also appear in training, and all 6 test visits come before the last training visit." },
      { action: "Split by patient", result: "No test patient appears in training." },
      { action: "Split by date", result: "Every test visit is later than every training visit; 5 test patients also have earlier visits in training." },
      { action: "1,000 models, 200 test rows, chosen on test", result: "Reported test accuracy 63.5%; on 5,000 new rows the same model scores 51.0%." },
      { action: "Same, chosen on validation", result: "The winner scores 63.0% on validation but 50.5% on the test set — an honest estimate of a 50% model." },
    ],
  },

  code: {
    label: "splitting.py",
    language: "Python",
    source: `import numpy as np
from sklearn.model_selection import GroupShuffleSplit, train_test_split

rng = np.random.default_rng(0)

# 1. Three-way split: 60% train, 20% validation, 20% test.
X = rng.normal(size=(1000, 5))
y = rng.integers(0, 2, 1000)
X_rest, X_test, y_rest, y_test = train_test_split(X, y, test_size=0.2, random_state=0)
X_train, X_val, y_train, y_val = train_test_split(X_rest, y_rest, test_size=0.25, random_state=0)
print("rows:", len(X_train), len(X_val), len(X_test))

# 2. Grouped split: every visit by a patient lands on the same side.
patient = rng.integers(0, 100, 1000)           # 100 patients, about 10 visits each
split = GroupShuffleSplit(n_splits=1, test_size=0.2, random_state=0)
train_idx, test_idx = next(split.split(X, y, groups=patient))
shared = set(patient[train_idx]) & set(patient[test_idx])
print("patients on both sides:", len(shared))

# 3. Reusing the test set. Labels are coin flips; model i predicts with
#    random feature i. Every model's true accuracy is exactly 50%.
def rows(n):
    return rng.integers(0, 2, (n, 1000), dtype=np.int8), rng.integers(0, 2, n, dtype=np.int8)

F_test, y_test = rows(200)
F_new, y_new = rows(5000)
test_scores = (F_test == y_test[:, None]).mean(axis=0)     # one score per model
best = test_scores.argmax()
print(f"best of 1,000 models on the test set: {test_scores[best]:.3f}")
print(f"the same model on 5,000 new rows:     {(F_new[:, best] == y_new).mean():.3f}")`,
    walkthrough: [
      { lines: "9–10", text: "Two calls to `train_test_split`: first 20% off for the test set, then 25% of the remaining 80% (= 20% of the total) for validation." },
      { lines: "14–16", text: "`GroupShuffleSplit` assigns whole patients to one side. `test_size=0.2` here means about 20% of the **patients**, not of the rows." },
      { lines: "17–18", text: "A check worth keeping in every project: no group may appear on both sides." },
      { lines: "22–23", text: "Each row has a random label and 1,000 random yes/no features. Model i predicts the label from feature i — so it has no real skill." },
      { lines: "27–30", text: "Choosing the model with the best test score, then scoring the **same** model on new rows, shows the gap selection creates." },
    ],
    shapes: [
      { name: "X_train, X_val, X_test", shape: "(600, 5), (200, 5), (200, 5)", meaning: "The three splits" },
      { name: "patient", shape: "(1000,)", meaning: "The group (patient id) of each row" },
      { name: "F_test", shape: "(200, 1000)", meaning: "200 test rows × 1,000 random features, one per candidate model" },
      { name: "test_scores", shape: "(1000,)", meaning: "Each candidate model’s test accuracy" },
    ],
    output: {
      label: "Output",
      text: "rows: 600 200 200\npatients on both sides: 0\nbest of 1,000 models on the test set: 0.620\nthe same model on 5,000 new rows:     0.488",
      note: "Produced by running the script with NumPy 2.5 and scikit-learn 1.9. The simulation uses NumPy’s random generator, so its numbers differ from the lab’s, but the pattern is the same.",
    },
  },

  useCases: [
    {
      title: "Medical imaging",
      text: "Several images per patient are common. Splits by patient are standard; image-level random splits are a well-known source of inflated results.",
    },
    { title: "Forecasting demand or prices", text: "Train on earlier periods, test on later ones. A random split lets the model peek at the future it is supposed to predict." },
    {
      title: "Competitions",
      text: "Many machine learning competitions keep a private test set that is scored only once at the end, because public leaderboards get overfitted by repeated submissions.",
    },
    {
      title: "Your Project Lab work",
      text: "Step 6 of the Project Lab applies this lesson to a real dataset, including a feature that leaks the answer.",
    },
  ],

  mistakes: [
    {
      kind: "mistake",
      title: "Preprocessing before splitting",
      text: "Fitting a scaler, imputer or feature selector on all rows lets statistics of the test rows into training. Fit on training data only, inside a pipeline.",
    },
    {
      kind: "mistake",
      title: "Random splits of grouped or time-ordered data",
      text: "The same patient, user or device on both sides, or future rows in training, makes the test easier than real use.",
    },
    {
      kind: "mistake",
      title: "Going back after seeing the test score",
      text: "Changing anything because of the test result turns the test set into a validation set. Report the first test score, or collect new test data.",
    },
    {
      kind: "mistake",
      title: "Duplicates across splits",
      text: "Repeated rows — common in scraped text and images — appear in both training and test and are “predicted” from memory.",
    },
    {
      kind: "misconception",
      title: "“The validation score is my result”",
      text: "It was used to choose, so it is optimistic: in the simulation the validation winner scored 63.0% while its true accuracy was 50%.",
    },
    {
      kind: "limitation",
      title: "Small test sets are noisy",
      text: "On 200 rows, ±3.5 percentage points is ordinary chance. Report uncertainty, and don’t read meaning into small differences.",
    },
  ],

  exercise: {
    prompt: [
      { type: "p", text: "For each situation, choose a random, grouped or time-based split, and say what must not appear on both sides." },
      {
        type: "list",
        ordered: true,
        items: [
          "Predicting next month’s sales for each shop from its past monthly sales.",
          "Recognising a speaker’s emotion from 20 voice clips recorded by each of 50 speakers; the app will be used by new speakers.",
          "Classifying 10,000 product reviews, each written by a different customer, as positive or negative.",
          "Detecting skin lesions from photos, with several photos of each lesion.",
        ],
      },
    ],
    hints: ["Ask what will be new when the model is used: new rows, new people, or later dates?", "Several rows from one source should be treated as one unit."],
    solution: [
      { type: "p", text: "1. Time-based: train on earlier months, test on later ones. No future months in training." },
      { type: "p", text: "2. Grouped by speaker. No speaker’s clips on both sides; otherwise the model can learn voices instead of emotions." },
      { type: "p", text: "3. Random (stratified by sentiment) is fine: rows are independent. Still remove duplicate reviews first." },
      { type: "p", text: "4. Grouped by lesion — and by patient if patients have several lesions. No lesion (or patient) on both sides." },
    ],
  },

  quiz: [
    {
      question: "What is the validation set for?",
      options: ["Fitting the model’s parameters", "Choosing between models or settings", "The final reported score", "Replacing the training set"],
      answer: 1,
      explanation: "Validation data compares options. Because it was used to choose, its score for the winner is optimistic.",
    },
    {
      question: "A dataset has 30 photos of each of 200 patients’ skin. What is the main risk of a random split?",
      options: [
        "The test set will be too small",
        "Photos of the same patient on both sides let the model recognise the patient, inflating the test score",
        "Random splits are slower",
        "The classes will become balanced",
      ],
      answer: 1,
      explanation: "Split by patient so that every test patient is new, as they will be in real use.",
    },
    {
      question: "In the simulation, 1,000 models with true accuracy 50% are compared on a 200-row test set. The best reports 63.5%. Why?",
      options: [
        "One model really is better",
        "With many candidates, the best observed score is the luckiest, not the most skilful",
        "The test set is biased",
        "Accuracy is the wrong metric",
      ],
      answer: 1,
      explanation: "Every score varies by about ±3.5 points by chance. The maximum of 1,000 such scores is far above 50% even though no model has any skill.",
    },
    {
      question: "You standardise all features using the mean and standard deviation of the whole dataset, then split. What is wrong?",
      options: ["Nothing", "The test rows influenced the scaling used in training — a form of leakage", "Standardising is never needed", "The split will be unbalanced"],
      answer: 1,
      explanation: "Fit the scaler on training data only and apply it to the validation and test data, ideally inside a pipeline.",
    },
    {
      question: "Your model will forecast next week’s electricity demand. Which split?",
      options: ["Random rows", "Grouped by weekday", "Train on earlier weeks, test on later weeks", "No test set is needed"],
      answer: 2,
      explanation: "A time-based split matches use: the model always predicts a future it has not seen.",
    },
  ],

  glossary: [
    { term: "Training set", definition: "Data used to fit a model’s parameters." },
    { term: "Validation set", definition: "Data used to compare and choose models, settings or features." },
    { term: "Test set", definition: "Data kept untouched until the end and used once to estimate performance on new data." },
    { term: "Hyperparameter", definition: "A setting chosen by the modeller rather than learned, such as tree depth or polynomial degree." },
    { term: "Grouped split", definition: "A split that keeps all rows of a group (patient, user, device) on the same side." },
    { term: "Time-based split", definition: "Training on earlier data and testing on later data." },
    { term: "Stratified split", definition: "A random split that keeps each class’s proportion the same in every part." },
    { term: "Data leakage", definition: "Any way information from the test data reaches training or model selection." },
    { term: "Selection bias", definition: "The optimism in the best score among many noisy candidates." },
    { term: "Nested cross-validation", definition: "An inner cross-validation for choosing, inside an outer one for estimating performance." },
  ],

  references: [
    {
      title: "Cross-validation: evaluating estimator performance",
      source: "scikit-learn User Guide, section 3.1",
      url: "https://scikit-learn.org/stable/modules/cross_validation.html",
      note: "Holding out a test set, GroupKFold for data with groups such as patients, and TimeSeriesSplit for time-ordered data.",
    },
    {
      title: "On Over-fitting in Model Selection and Subsequent Selection Bias in Performance Evaluation",
      source: "Cawley & Talbot, Journal of Machine Learning Research 11, 2079–2107, 2010",
      url: "https://www.jmlr.org/papers/v11/cawley10a.html",
      note: "Shows that selecting models on noisy estimates overfits, and that this bias can be large enough to change which algorithm looks best.",
    },
    {
      title: "Leakage and the reproducibility crisis in machine-learning-based science",
      source: "Kapoor & Narayanan, Patterns, 2023",
      url: "https://reproducible.cs.princeton.edu/",
      note: "A survey of leakage in published research and a taxonomy of how it happens.",
    },
  ],

  next: [
    { pathSlug: "ml-foundations", topicSlug: "metrics-cross-validation", reason: "Cross-validation: using every row for both training and validation, and keeping preprocessing inside the folds." },
    { pathSlug: "ai-engineering", topicSlug: "preprocessing-leakage", reason: "Building pipelines that make leakage hard to introduce by accident." },
    { pathSlug: "research-paper-writing", topicSlug: "experimental-design", reason: "How to report what was compared, and how many times, so readers can judge the result." },
  ],

  teaching: {
    notes: [
      "Before the lab, ask the class to write down their estimate of the best score among 1,000 coin-flipping models on 200 questions, then compare with the experiment.",
      "Run part 2 of the experiment live with 1,000 models chosen on test, then reveal the 5,000-row score. The drop from 63.5% to 51.0% is the lesson.",
      "Link every leakage form back to one question: could this information exist at the moment the model is used?",
    ],
    demo: "Each student flips a coin 20 times and predicts each flip in advance (or uses a fixed guess sequence). Find the best “predictor” in the room, then have them predict 20 new flips. Their new score falls back towards 50%, just like the winner in the simulation.",
    discussion: [
      "A paper reports 94% accuracy after trying 40 architectures, each evaluated on the test set. What would you ask the authors?",
      "When is a random split of patient data acceptable?",
      "If you have only 300 rows, is it worth holding 60 back as a test set? What are the alternatives?",
    ],
    misconceptions: [
      "“Using the test set once more can’t hurt much.” Each look is another choice; the bias adds up.",
      "“A larger training set is always better than a test set.” Without a test set you have no honest number to report.",
      "“Leakage needs a bug.” Most leakage comes from reasonable-looking steps in the wrong order.",
    ],
    challenge: {
      prompt:
        "The test-chosen winner of 1,000 models scored 63.5% on 200 rows. Using the standard error of accuracy, roughly how many standard errors above 50% is that? Why is it not surprising that the best of 1,000 is that far out?",
      answer: [
        {
          type: "p",
          text: "The standard error is √(0.25/200) ≈ 0.035, so 63.5% is about (0.635 − 0.5)/0.035 ≈ 3.8 standard errors above 50%.",
        },
        {
          type: "p",
          text: "For one model, a result that far out happens rarely by chance. But the largest of 1,000 roughly independent normal scores is typically about 3 to 3.5 standard errors above the mean, and sometimes more. Searching through many candidates makes rare luck almost certain — which is why the number of candidates tried should always be reported.",
        },
      ],
    },
  },
};
