/*
 * Full guide for Project Lab step 6 — the Phase 1 sample step.
 * The running example is the public UCI Bank Marketing dataset.
 */

export const splitGuide = {
  stepSlug: "split-without-leakage",
  lead: "A model is only as trustworthy as the data you evaluated it on. If any information from your test data reaches training — directly or through preprocessing — the score you report is a measure of memory, not of performance on new cases.",

  roles: [
    {
      name: "Training set",
      share: "≈ 70%",
      job: "The model learns its parameters here. Preprocessing statistics (means, vocabularies, imputation values) are also fitted here and nowhere else.",
    },
    {
      name: "Validation set",
      share: "≈ 15%",
      job: "Used to compare models and tune hyperparameters. Because you make decisions with it, its score becomes optimistic over time.",
    },
    {
      name: "Test set",
      share: "≈ 15%",
      job: "Locked until every decision is made, then used once. This is the number you report.",
    },
  ],

  ratioNote:
    "These proportions are a common starting point, not a rule. With small datasets, use k-fold cross-validation on the training portion instead of a single validation set — and nested cross-validation if you need an unbiased estimate of a tuned model.",

  strategies: [
    {
      when: "Independent rows, classification",
      strategy: "Random split, stratified by label",
      why: "Keeps class proportions the same in every split, which matters most for rare classes.",
    },
    {
      when: "Several rows per person, patient, object or session",
      strategy: "Group split (e.g. GroupKFold, GroupShuffleSplit)",
      why: "All rows from one group stay on the same side, so the model cannot recognise the individual instead of the pattern.",
    },
    {
      when: "Data ordered in time, forecasting",
      strategy: "Time-based split (train on past, test on future)",
      why: "Mirrors deployment, where the model only ever has the past to learn from.",
    },
    {
      when: "Small dataset",
      strategy: "k-fold cross-validation on the training set, plus a held-out test set",
      why: "Uses data efficiently while keeping a final, untouched estimate.",
    },
  ],

  leakageTypes: [
    {
      name: "Target leakage",
      description:
        "A feature contains information that would not exist at prediction time. In the UCI Bank Marketing data, the call’s duration is only known once the call has ended — when the outcome is already known. The dataset’s own documentation advises dropping it for a realistic predictive model.",
      fix: "For every feature, ask: would I have this value at the moment I need the prediction?",
    },
    {
      name: "Preprocessing leakage",
      description:
        "Scaling, imputation, encoding, feature selection or oversampling fitted on the whole dataset before splitting. The test set’s statistics quietly shape the training data.",
      fix: "Split first. Put every fitted step inside a pipeline that is fitted on training data only.",
    },
    {
      name: "Group and duplicate leakage",
      description:
        "Near-identical rows on both sides of the split. HAM10000, a skin-lesion dataset, contains several images of the same lesion, identified by a lesion ID; a random image-level split puts the same lesion in train and test.",
      fix: "Deduplicate, then split by the group identifier.",
    },
    {
      name: "Temporal leakage",
      description: "Training on data from after the period you are predicting, so the model learns from the future.",
      fix: "Split by time, and compute rolling features using past values only.",
    },
    {
      name: "Test-set reuse",
      description:
        "Checking the test score after each change and keeping what helps. The test set slowly turns into a second validation set.",
      fix: "Make all decisions on validation data. Touch the test set once, at the end, and report that result.",
    },
  ],

  code: `import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import average_precision_score
from sklearn.model_selection import GridSearchCV, train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler

df = pd.read_csv("bank-additional-full.csv", sep=";")
y = (df["y"] == "yes").astype(int)
# 'duration' is only known after the call ends, when y is already known.
X = df.drop(columns=["y", "duration"])

# 1. Split first. Stratify because positives are a small minority.
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, stratify=y, random_state=42
)

numeric = X_train.select_dtypes("number").columns
categorical = X_train.select_dtypes("object").columns

# 2. Every fitted step lives inside the pipeline.
preprocess = ColumnTransformer([
    ("num", Pipeline([
        ("impute", SimpleImputer(strategy="median")),
        ("scale", StandardScaler()),
    ]), numeric),
    ("cat", OneHotEncoder(handle_unknown="ignore"), categorical),
])

model = Pipeline([
    ("prep", preprocess),
    ("clf", LogisticRegression(max_iter=1000, class_weight="balanced")),
])

# 3. Tune with cross-validation on the training set only.
#    The pipeline is re-fitted inside each fold, so no fold sees
#    statistics from its own validation rows.
search = GridSearchCV(
    model,
    {"clf__C": [0.01, 0.1, 1, 10]},
    cv=5,
    scoring="average_precision",
)
search.fit(X_train, y_train)

# 4. Touch the test set once, after all decisions are made.
scores = search.predict_proba(X_test)[:, 1]
print("Test average precision:", average_precision_score(y_test, scores))`,

  codeNotes: [
    "average_precision summarises the precision–recall curve, which is more informative than accuracy when positives are rare.",
    "Values such as \"unknown\" in this dataset are real categories, not missing values — check before imputing.",
    "Save the split indices (or the random seed and library versions) so the exact split can be rebuilt.",
  ],

  mistakes: [
    "Calling fit_transform on the full dataset, then splitting.",
    "Oversampling with SMOTE before the split, so synthetic test rows are built from training rows.",
    "Choosing features by their correlation with the label across all rows.",
    "Reporting the best of many test-set runs as if it were a single result.",
    "Shuffling time-series data before splitting.",
    "Splitting images randomly when several images show the same object or patient.",
  ],

  checklist: [
    "I split the data before fitting any preprocessing step.",
    "Every scaler, imputer, encoder and resampler is inside a pipeline fitted on training data.",
    "Each feature would be available at the moment a real prediction is made.",
    "Rows from the same person, object or session are all in one split.",
    "For time-ordered data, the test period comes after the training period.",
    "All tuning used validation data or cross-validation on the training set.",
    "I looked at the test set once and report that result.",
    "The split can be reproduced from saved indices or a recorded seed and versions.",
  ],
};
