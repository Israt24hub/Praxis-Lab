import type { WorkflowPhase, WorkflowStep } from "../types/content";

export const phases: WorkflowPhase[] = [
  { id: "frame", title: "Frame", summary: "Decide what question you are answering and what is already known." },
  { id: "data", title: "Data", summary: "Find, understand, clean and split the data without contaminating your evaluation." },
  { id: "model", title: "Model", summary: "Start simple, then train and tune more capable models on validation data only." },
  { id: "evaluate", title: "Evaluate", summary: "Measure once on held-out data, compare fairly, and understand the errors." },
  { id: "report", title: "Report", summary: "Record what you did so someone else can repeat it, then write it up." },
];

/*
 * The fifteen-step workflow. Every step has the same template fields; step 6
 * additionally has a long-form guide (src/content/guides/split-without-leakage.ts).
 */
export const steps: WorkflowStep[] = [
  {
    number: 1,
    slug: "define-the-problem",
    phase: "frame",
    title: "Define the problem and research question",
    summary: "State what you want to predict or understand, for whom, and how you will judge success.",
    purpose:
      "A clear problem statement decides everything downstream: which data is relevant, which metric matters, and what “good enough” means. Vague goals produce experiments that cannot be judged.",
    input: "An idea, a dataset you have access to, or a problem someone has described to you.",
    output: "A one-paragraph problem statement with the prediction target, the people affected, and a measurable success criterion.",
    tools: ["A short written brief", "Conversations with whoever will use the result", "A list of constraints (data, time, compute)"],
    mistakes: [
      "Starting from a model (“let’s use a transformer”) instead of a problem.",
      "Choosing a target that is easy to predict but not useful.",
      "Leaving success undefined until the results are in.",
    ],
    next: "The problem statement tells you what to search for in the literature and which existing results you need to beat.",
    hasGuide: false,
  },
  {
    number: 2,
    slug: "review-literature",
    phase: "frame",
    title: "Review literature and existing approaches",
    summary: "Find what has been tried, which baselines are standard, and where results disagree.",
    purpose:
      "Prior work tells you which baselines are expected, which datasets and metrics are standard, and where a real gap might be. It also stops you re-inventing a known result.",
    input: "Your problem statement and a few search terms.",
    output: "A literature table: paper, method, dataset, metric, reported result, and open questions — plus a sharper research question.",
    tools: ["Google Scholar, Semantic Scholar or arXiv", "A spreadsheet or reference manager such as Zotero", "Papers With Code for datasets and baselines"],
    mistakes: [
      "Citing papers you have not read.",
      "Comparing numbers reported on different splits or metrics as if they were equivalent.",
      "Searching only for papers that agree with your idea.",
    ],
    next: "The literature points you to datasets others have used and the known limitations of each.",
    hasGuide: false,
  },
  {
    number: 3,
    slug: "find-a-dataset",
    phase: "data",
    title: "Find a dataset and understand its limits",
    summary: "Check where the data came from, its licence, how labels were made, and who is missing from it.",
    purpose:
      "A model can only learn what is in its data. Knowing how the data was collected and labelled tells you what the model can — and cannot — be trusted to do.",
    input: "The research question and the datasets used in related work.",
    output: "A short datasheet: source, licence, size, label process, known gaps and biases, and how it matches your question.",
    tools: ["Dataset documentation and papers", "UCI, Kaggle, Hugging Face Datasets", "The “Datasheets for Datasets” template (Gebru et al.)"],
    mistakes: [
      "Ignoring the licence or terms of use.",
      "Assuming the data represents the people your model will serve.",
      "Missing documented warnings — such as a feature the authors say to drop.",
    ],
    next: "With the datasheet in hand you know what to look for when you open the data itself.",
    hasGuide: false,
  },
  {
    number: 4,
    slug: "explore-the-data",
    phase: "data",
    title: "Inspect the data and run exploratory analysis",
    summary: "Look at distributions, missing values, class balance, duplicates and suspicious correlations.",
    purpose:
      "Exploration finds problems while they are cheap to fix: duplicates, impossible values, imbalance and features that are too good to be true.",
    input: "The raw dataset and its datasheet.",
    output: "An EDA notebook recording each finding and the preprocessing decision it leads to.",
    tools: ["pandas (`describe`, `value_counts`, `isna`)", "Matplotlib or seaborn for distributions", "A notebook kept under version control"],
    mistakes: [
      "Exploring the test set and letting what you see shape modelling choices.",
      "Treating sentinel values such as 999 as real measurements.",
      "Not checking for duplicate or near-duplicate rows.",
    ],
    details: [
      {
        type: "callout",
        tone: "warning",
        title: "Check class balance early",
        text: "If one class is rare — for example about 11% positives in UCI Bank Marketing — accuracy becomes misleading: predicting the majority class for everyone scores about 89%. Record the imbalance now so you choose metrics such as PR-AUC or recall in step 11.",
      },
      {
        type: "p",
        text: "A feature with a near-perfect correlation with the target deserves suspicion before celebration. Ask whether it could be known before the outcome.",
      },
    ],
    next: "Each EDA finding becomes a cleaning or preprocessing decision in step 5.",
    hasGuide: false,
  },
  {
    number: 5,
    slug: "clean-and-preprocess",
    phase: "data",
    title: "Clean and preprocess the data",
    summary: "Handle missing values, encode categories, scale numbers, and prepare text or images — as the data requires.",
    purpose:
      "Models need numeric inputs in sensible ranges. Preprocessing turns raw columns, text or images into that form — and must be learned from training data only.",
    input: "The EDA findings and a decision about which features to keep.",
    output: "A preprocessing pipeline that can be fitted on training data alone and applied unchanged to new data.",
    tools: ["scikit-learn `Pipeline` and `ColumnTransformer`", "Text vectorisers or tokenizers", "torchvision transforms for images"],
    mistakes: [
      "Fitting scalers, imputers or vocabularies on the full dataset before splitting.",
      "Removing information that matters, such as negations in text.",
      "Augmenting validation or test images.",
    ],
    details: [
      {
        type: "p",
        text: "There is no universal recipe — what preprocessing means depends on the data type and the model. One rule holds everywhere: anything that **learns** from data (a mean, a vocabulary, a category list) is fitted on the training set and then reused.",
      },
      {
        type: "table",
        caption: "Preprocessing by data type",
        head: ["Data", "Common steps", "Watch for"],
        rows: [
          ["Missing values", "Drop, impute (median, most frequent), or add a “was missing” flag", "Missingness that itself carries information"],
          ["Categories", "One-hot encoding; ordinal encoding only for ordered categories", "Target encoding computed on evaluation rows"],
          ["Numbers", "Standardise for distance- and gradient-based models; trees rarely need it", "Sentinel values such as 999 treated as real"],
          ["Class imbalance", "Choose metrics first; then class weights, resampling or threshold tuning", "Resampling before the split"],
          ["Text", "Normalisation and tokenization matched to the model", "Vocabularies built from test text"],
          ["Images", "Resize and normalise with the statistics the model expects; augment training images only", "The same object appearing in train and test"],
        ],
      },
    ],
    examples: [
      {
        label: "Tabular data (scikit-learn)",
        language: "Python",
        code: `from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler

preprocess = ColumnTransformer([
    ("num", make_pipeline(SimpleImputer(strategy="median"), StandardScaler()), numeric_cols),
    ("cat", OneHotEncoder(handle_unknown="ignore"), categorical_cols),
])

X_train_ready = preprocess.fit_transform(X_train)  # learns medians, means, categories
X_test_ready = preprocess.transform(X_test)        # reuses them; never refit on test`,
        note: "`numeric_cols` and `categorical_cols` are lists of column names. In practice, put `preprocess` inside a model pipeline so cross-validation refits it in every fold.",
      },
      {
        label: "Text (TF-IDF baseline)",
        language: "Python",
        code: `from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import make_pipeline

model = make_pipeline(
    TfidfVectorizer(lowercase=True, ngram_range=(1, 2), min_df=2),
    LogisticRegression(max_iter=1000),
)
model.fit(train_texts, train_labels)  # vocabulary and IDF weights come from training text only`,
        note: "For transformer models, use the tokenizer that belongs to the pretrained model instead of building your own vocabulary.",
      },
      {
        label: "Images (torchvision)",
        language: "Python",
        code: `from torchvision import transforms

# ImageNet statistics, because the pretrained model was trained with them.
normalize = transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])

train_tf = transforms.Compose([
    transforms.RandomResizedCrop(224),
    transforms.RandomHorizontalFlip(),
    transforms.ToTensor(),
    normalize,
])
eval_tf = transforms.Compose([   # no random augmentation for validation and test
    transforms.Resize(256),
    transforms.CenterCrop(224),
    transforms.ToTensor(),
    normalize,
])`,
        note: "Check that each augmentation keeps the label true — a horizontal flip is fine for cats, not for text or some medical images.",
      },
    ],
    next: "With preprocessing defined as fit-on-train steps, you can split the data and know nothing will leak.",
    hasGuide: false,
  },
  {
    number: 6,
    slug: "split-without-leakage",
    phase: "data",
    title: "Split into train, validation and test sets without leakage",
    summary: "Separate the data so that evaluation measures performance on genuinely unseen examples.",
    purpose:
      "Your reported score is only meaningful if it comes from data that played no part in building the model. Splitting correctly — and keeping information from crossing the split — is what makes it meaningful.",
    input: "The cleaned dataset and the preprocessing plan from step 5.",
    output: "Fixed, saved splits and a written note on how they were made and why.",
    tools: ["scikit-learn `train_test_split`, `GroupKFold`, `TimeSeriesSplit`", "Saved index files or a recorded seed", "Pipelines that fit inside each fold"],
    mistakes: [
      "Preprocessing before splitting.",
      "Random splits when rows from the same person or object appear more than once.",
      "Checking the test score after every change.",
    ],
    next: "With a training set you can safely use, the first model to train is a baseline.",
    hasGuide: true,
  },
  {
    number: 7,
    slug: "establish-a-baseline",
    phase: "model",
    title: "Establish a baseline",
    summary: "Score a trivial predictor and a simple model so every later result has a reference point.",
    purpose:
      "Without a baseline, a score has no meaning. “82% accuracy” is impressive or useless depending on whether always guessing the majority class gets 50% or 89%.",
    input: "Training and validation data, the chosen metric.",
    output: "Validation scores for a trivial baseline (majority class or mean) and a simple model (e.g. logistic or linear regression).",
    tools: ["scikit-learn `DummyClassifier` / `DummyRegressor`", "Logistic or linear regression", "The published baselines from step 2"],
    mistakes: [
      "Skipping the trivial baseline because it seems obvious.",
      "Using a weak baseline to make a new method look good.",
      "Tuning the new method heavily while leaving baselines at defaults.",
    ],
    next: "The baseline tells you how much room there is for a more capable model.",
    hasGuide: false,
  },
  {
    number: 8,
    slug: "select-a-model",
    phase: "model",
    title: "Select an algorithm or architecture",
    summary: "Choose candidates that suit the data type, size and constraints — not just the newest model.",
    purpose:
      "Different models suit different data: gradient-boosted trees for many tabular problems, CNNs or vision transformers for images, pretrained transformers for text. Choosing deliberately saves compute and gives a stronger comparison.",
    input: "The baseline results, the data type and size, and your compute budget.",
    output: "A short list of candidate models with the reason for each.",
    tools: ["Results from related work", "scikit-learn, XGBoost or LightGBM for tabular data", "PyTorch and pretrained models from Hugging Face"],
    mistakes: [
      "Picking a model because it is fashionable.",
      "Ignoring hardware limits until training fails.",
      "Comparing a pretrained model with one trained from scratch without saying so.",
    ],
    next: "Each candidate now needs to be trained with a sensible configuration.",
    hasGuide: false,
  },
  {
    number: 9,
    slug: "train-the-model",
    phase: "model",
    title: "Train and configure hyperparameters",
    summary: "Train with sensible defaults first, watch the learning curves, and log every run.",
    purpose: "Training turns the candidate into a fitted model. Watching the curves tells you whether it is learning, overfitting or broken.",
    input: "Training data, the preprocessing pipeline and a candidate model.",
    output: "Trained models with their configurations, seeds and training logs.",
    tools: ["A config file per run", "Experiment tracking (a spreadsheet, MLflow or Weights & Biases)", "Training and validation curves"],
    mistakes: [
      "Changing several settings at once, so you cannot tell what helped.",
      "Not fixing random seeds or recording library versions.",
      "Deleting runs that went badly.",
    ],
    next: "Once a model trains reliably, its hyperparameters can be tuned against validation data.",
    hasGuide: false,
  },
  {
    number: 10,
    slug: "validate-and-tune",
    phase: "model",
    title: "Validate and tune",
    summary: "Tune on the validation set or with cross-validation, deciding the search space in advance.",
    purpose: "Tuning finds better settings, but every decision made on a dataset makes its score optimistic. Keeping tuning on validation data protects the test set.",
    input: "Trained candidates and a predefined search space.",
    output: "A chosen configuration per model, with the validation evidence for it.",
    tools: ["`GridSearchCV` or `RandomizedSearchCV`", "Cross-validation for small datasets", "A log of every configuration tried"],
    mistakes: [
      "Tuning on the test set.",
      "Giving your method a large search and the baseline none.",
      "Reporting the best of many validation runs as if it were typical.",
    ],
    next: "With every decision made, the test set can be opened — once.",
    hasGuide: false,
  },
  {
    number: 11,
    slug: "evaluate-on-test",
    phase: "evaluate",
    title: "Evaluate on the held-out test set",
    summary: "Run the final models once on the test set with metrics that fit the problem.",
    purpose: "The test score estimates performance on new data. It is only trustworthy if the test set has been untouched until now.",
    input: "Final models and configurations, and the untouched test set.",
    output: "Test-set results with variation across seeds or confidence intervals.",
    tools: ["scikit-learn metrics", "Bootstrap confidence intervals", "Several random seeds for neural models"],
    mistakes: [
      "Going back to tune after seeing the test score, then reporting the new score.",
      "Using accuracy on imbalanced data.",
      "Reporting a single run when results vary between seeds.",
    ],
    details: [
      {
        type: "table",
        caption: "Choosing a metric",
        head: ["Situation", "Prefer", "Why"],
        rows: [
          ["Balanced classes, errors equally costly", "Accuracy, F1", "Simple and meaningful when classes are similar in size"],
          ["Rare positive class", "PR-AUC (average precision), recall at a fixed precision", "Accuracy rewards ignoring the rare class"],
          ["Ranking quality across thresholds", "ROC-AUC", "Threshold-independent, but optimistic under heavy imbalance"],
          ["Regression", "MAE, RMSE", "MAE is robust to outliers; RMSE penalises large errors"],
        ],
      },
      {
        type: "callout",
        tone: "honesty",
        title: "The test set is used once",
        text: "If you look at test results and then change the model, the test set has become a validation set. Report that honestly, or hold out new test data.",
      },
    ],
    next: "Test results for every method feed a fair comparison.",
    hasGuide: false,
  },
  {
    number: 12,
    slug: "compare-methods",
    phase: "evaluate",
    title: "Compare baselines and alternatives",
    summary: "Compare under identical splits, preprocessing and budgets, and check whether differences are real.",
    purpose: "A comparison is only fair when every method had the same data, preprocessing and tuning effort, and only meaningful when differences exceed run-to-run variation.",
    input: "Test results for every method, with variation.",
    output: "A comparison table that someone else could reproduce, with variation reported.",
    tools: ["Mean ± standard deviation over seeds", "Paired statistical tests where appropriate", "Tables generated from logged results"],
    mistakes: [
      "Copying baseline numbers from papers that used different splits.",
      "Claiming an improvement smaller than the variation between seeds.",
      "Leaving out methods that beat yours.",
    ],
    next: "Knowing which model is best, the next question is what it still gets wrong.",
    hasGuide: false,
  },
  {
    number: 13,
    slug: "error-analysis",
    phase: "evaluate",
    title: "Analyse errors, interpretability and ablations",
    summary: "Look at what the model gets wrong, which components matter, and whether it relies on shortcuts.",
    purpose: "Aggregate scores hide where a model fails. Error analysis finds failure patterns; ablations show which parts of a method matter; interpretability checks for shortcuts.",
    input: "The final model and its predictions on validation and test data.",
    output: "Error categories with examples, ablation results, and any interpretability findings.",
    tools: ["Confusion matrices and per-class metrics", "Ablation table (remove one component at a time)", "Permutation importance, SHAP or Grad-CAM — with their limits"],
    mistakes: [
      "Reading feature importance as causation.",
      "Only showing examples where the model is right.",
      "Running ablations on the test set while still making decisions.",
    ],
    next: "Everything learned so far has to be written down before it is forgotten.",
    hasGuide: false,
  },
  {
    number: 14,
    slug: "document-experiments",
    phase: "report",
    title: "Document experiments and limitations",
    summary: "Write down every setting, version and failed run, and what the results do not show.",
    purpose: "Documentation is what makes results reproducible and honest. It is far easier to do now than at paper-writing time.",
    input: "Experiment logs, configs, notebooks and results.",
    output: "An experiment log, an environment file, and a list of known limitations.",
    tools: ["`requirements.txt` or `environment.yml`", "A README per experiment folder", "The reproducibility checklist on the Research page"],
    mistakes: [
      "Recording only the final, best run.",
      "Leaving out preprocessing details or dropped features.",
      "Writing limitations as a token sentence.",
    ],
    next: "With everything documented, you can build the repository and write the report.",
    hasGuide: false,
  },
  {
    number: 15,
    slug: "prepare-paper",
    phase: "report",
    title: "Prepare the repository, report and paper",
    summary: "Clean the code, write a README that reproduces the results, and write up the work.",
    purpose: "A public repository and a clear write-up let others check, reuse and build on your work — and they show employers and reviewers what you actually did.",
    input: "Documented experiments, results tables, and figures generated from logs.",
    output: "A public repository whose README reproduces the reported numbers, and a report or paper draft that matches the experiments exactly.",
    tools: ["A clear repository structure (data/, src/, notebooks/, results/)", "A licence and citation file", "The paper outline on the Research page"],
    mistakes: [
      "Numbers in the paper that no script produces.",
      "References that were not checked against their sources.",
      "Claims broader than the experiments support.",
    ],
    next: "The workflow ends here — and the limitations you wrote often become the next project’s research question.",
    hasGuide: false,
  },
];
