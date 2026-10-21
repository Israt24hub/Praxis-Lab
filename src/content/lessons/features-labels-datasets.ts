import type { Lesson } from "../../types/content";

/*
 * Data: src/content/datasets/week8-students.ts (invented). The code output was
 * produced by running the code shown with pandas and scikit-learn.
 */
export const featuresLabelsDatasets: Lesson = {
  id: "features-labels-datasets",
  pathSlug: "ml-foundations",
  topicSlug: "features-labels-datasets",
  title: "Features, labels, datasets and predictions",
  summary:
    "Before a model learns anything, someone decides what one example is, what to predict, and which columns may be used. This lesson turns raw student records into a dataset — and shows how one wrong column makes a model useless.",
  level: "beginner",
  minutes: [40, 55],
  objectives: [
    "Describe a dataset in terms of **examples**, **features**, a **target** and its **label distribution**",
    "Turn raw records into a numeric feature matrix, using **one-hot encoding** for categories",
    "Decide whether a column may be a feature by asking **when its value becomes known**",
    "Explain why **identifiers** and **post-outcome columns** make a model look better than it is",
  ],
  prerequisites: [
    { label: "What does learning from data mean?", href: "/learn/ml-foundations/learning-from-data" },
    { label: "Reading a table of records" },
    { label: "Basic Python and pandas (for the code section only)" },
  ],

  intro: [
    {
      type: "p",
      text: "In the first lesson the data was already tidy: one column of hours, one column of scores. Real data rarely arrives like that. It comes as **records** — rows with ID numbers, categories, measurements, and values recorded at different times.",
    },
    {
      type: "p",
      text: "Turning records into a dataset means answering three questions. What is one example? What exactly do we want to predict? And which columns may the model use to predict it? These decisions shape a model’s results more than the choice of algorithm does.",
    },
    {
      type: "p",
      text: "This lesson uses ten students at the end of a course. The question: **in week 8, halfway through, can we predict who will pass?**",
    },
  ],

  why: [
    {
      type: "p",
      text: "A model only sees the table it is given, and it will use whatever helps it fit the training data — including columns that would never be available in real use. If the answer is hidden in a column, the model finds it.",
    },
    {
      type: "p",
      text: "Careful dataset construction solves the problem of building a model whose **test results mean what they appear to mean**: every feature exists at the moment a prediction is needed, and every row describes one real case.",
    },
    {
      type: "callout",
      tone: "warning",
      title: "Leakage is common in published work",
      text: "Kapoor and Narayanan’s survey of leakage in machine-learning-based science lists 41 studies, across 30 fields, that found leakage-related errors — together affecting 648 published papers (figures from their project page). Features that should never have been in the dataset are one of the main causes.",
    },
  ],

  explanation: {
    beginner: [
      {
        type: "p",
        text: "**One example** is one thing we make a prediction about. Here, one student is one row.",
      },
      {
        type: "p",
        text: "The **target** (or **label**) is the value we want to predict: whether the student `passed`. A model learns from rows where the target is known, so it can guess it for rows where it isn’t.",
      },
      {
        type: "p",
        text: "**Features** are the columns the model is allowed to use. The test for each column is one question: **would I know this value at the moment I need the prediction?** In week 8 we know attendance, assignments submitted so far, the midterm mark, the department and where the student lives. We do not know the final exam mark — that exam hasn’t happened.",
      },
      {
        type: "p",
        text: "Some columns are allowed but useless. A `student_id` is unique to each student, so a model can only memorise it; it tells us nothing about a new student.",
      },
      {
        type: "p",
        text: "Models work with numbers, so categories such as department become 0/1 columns: one column per department, with a 1 in the student’s own department. This is **one-hot encoding**. The result is a table of numbers called **X** (one row per student, one column per feature) and a list of targets called **y**.",
      },
    ],
    technical: [
      {
        type: "p",
        text: "A supervised dataset is a set of pairs (xᵢ, yᵢ), i = 1…n, stacked into a feature matrix X ∈ ℝ^(n×d) and a target vector y. Here yᵢ ∈ {0, 1}, so the task is binary classification; a numeric target would make it regression.",
      },
      {
        type: "p",
        text: "Each feature must be computable from information available at the prediction time t*. Any variable measured after t* — or derived from the target — is **target leakage**: the model learns a relationship that cannot be used at inference, and held-out scores overstate real performance.",
      },
      {
        type: "p",
        text: "A categorical variable with k levels is encoded as k indicator columns, or k − 1 with one level as the reference. The category list is part of the fitted preprocessing: it is learned from training data, and unseen categories at inference map to all zeros (scikit-learn’s `handle_unknown=\"ignore\"`).",
      },
      {
        type: "p",
        text: "Identifiers are maximal-cardinality categories: one-hot encoding creates one column per training row, each active once. A flexible model can memorise yᵢ through them, but they carry no information about new identifiers. Some IDs do encode structure — enrolment order, site, batch — which should then be extracted as an explicit feature, and may call for a grouped split.",
      },
      {
        type: "p",
        text: "The label distribution sets the baseline: with 60% passes, always predicting “pass” is already 60% accurate. It also guides metric choice and stratified splitting.",
      },
    ],
  },

  analogy: {
    title: "The forecaster who reads tomorrow’s newspaper",
    blocks: [
      {
        type: "p",
        text: "A weather forecaster may use today’s sky, the season and the latest satellite images. If they also read tomorrow’s newspaper, their forecasts become perfect — and worthless, because tomorrow’s paper doesn’t exist when a forecast is needed.",
      },
      {
        type: "p",
        text: "Using the final exam mark to predict passing is reading tomorrow’s newspaper. The analogy has a limit: in real data the leak is rarely labelled. It hides in columns such as “date account closed” or “number of follow-up visits”, which look harmless until you ask when they were recorded.",
      },
    ],
  },

  workedExample: {
    title: "Building the row for student S01",
    blocks: [
      {
        type: "p",
        text: "S01 studies CSE, lives in a hostel, has 92% attendance, has submitted 9 assignments and scored 24 in the midterm. They passed.",
      },
      {
        type: "table",
        caption: "From record to feature vector",
        head: ["Raw column", "Value", "Encoded as", "Columns in X"],
        rows: [
          ["department", "CSE", "one-hot (BBA, CSE, EEE)", "0, 1, 0"],
          ["residence", "hostel", "one-hot (home, hostel)", "0, 1"],
          ["attendance", "92", "number as is", "92"],
          ["assignments", "9", "number as is", "9"],
          ["midterm", "24", "number as is", "24"],
          ["student_id", "S01", "not used (identifier)", "—"],
          ["final_exam", "41", "not used (not known in week 8)", "—"],
          ["passed", "yes", "target", "y = 1"],
        ],
      },
      {
        type: "p",
        text: "So x = (0, 1, 0, 0, 1, 92, 9, 24) and y = 1. Every student gets the same eight columns in the same order, giving X a shape of (10, 8).",
      },
      {
        type: "p",
        text: "Now look at what the final exam would do. Every student who passed scored 27 or more in it; every student who failed scored 22 or less. A rule “pass if final_exam ≥ 25” is right for all ten — and no column known in week 8 separates them that cleanly. A model given `final_exam` would look perfect and could not make a single real prediction.",
      },
    ],
  },

  math: {
    blocks: [
      { type: "equation", expression: "X ∈ ℝ^(n × d),   y ∈ {0, 1}ⁿ", meaning: "n examples (rows) and d features (columns); one target per row." },
      {
        type: "equation",
        expression: "onehot(c) = ( 1[c = c₁], 1[c = c₂], …, 1[c = c_k] )",
        meaning: "A category becomes k indicator values; exactly one is 1. Here department → (BBA, CSE, EEE).",
      },
      {
        type: "equation",
        expression: "d = d_numeric + Σⱼ kⱼ     (or Σⱼ (kⱼ − 1) with a reference level)",
        meaning: "Column count after encoding: 3 numbers + 3 departments + 2 residences = 8, or 6 when the first level of each category is dropped.",
      },
      {
        type: "equation",
        expression: "feature allowed  ⇔  known(feature) ≤ t*",
        meaning: "A column may be a feature only if its value is known by the prediction time t* — week 8 here.",
      },
    ],
    notation: [
      { symbol: "n", meaning: "Number of examples (10 students)" },
      { symbol: "d", meaning: "Number of feature columns after encoding" },
      { symbol: "xᵢ", meaning: "Feature vector for example i (one row of X)" },
      { symbol: "yᵢ", meaning: "Target for example i" },
      { symbol: "kⱼ", meaning: "Number of categories in categorical column j" },
      { symbol: "t*", meaning: "The moment a prediction is made" },
    ],
  },

  process: {
    title: "From records to a dataset",
    steps: [
      { title: "State the question", text: "Who will pass? Asked when? Write the prediction time down: week 8." },
      { title: "Define one example", text: "One row = one student. Mixing units (rows per student and per week) causes silent errors." },
      { title: "Choose the target", text: "The outcome to predict: `passed`. Check how it was recorded and when." },
      { title: "Date every column", text: "For each column, ask when its value becomes known. Anything after week 8 is out." },
      { title: "Remove identifiers", text: "IDs, names and row numbers identify a case; they don’t describe it." },
      { title: "Encode", text: "Keep numbers, one-hot encode categories. The encoder is fitted on training data." },
      { title: "Check shapes and balance", text: "X is (rows, columns); y has one value per row. Note the class proportions." },
      { title: "Build new rows the same way", text: "At inference, reuse the fitted encoder so new rows have identical columns." },
    ],
  },

  interactive: {
    component: "dataset-builder-lab",
    kind: "computation",
    intro:
      "Give every column a role — feature, target or not used — and watch the feature matrix, the target and the new student’s row change. The encoding is computed in your browser from the records shown.",
    tryThis: [
      "Make **passed** the target. Check the problem type and the label balance.",
      "Leave **final_exam** as a feature and look at the row for the new student S11.",
      "Leave **student_id** as a feature and count how many columns X has.",
      "Mark both as **Not used** and confirm that the review turns green.",
      "Tick **Drop the first category** and watch the number of columns change.",
      "Make **midterm** the target instead. What kind of problem is it now?",
    ],
    expect: [
      { action: "passed as target, everything else a feature", result: "X has shape (10, 19): ten `student_id_…` columns, three for department, two for residence and four numbers. The review flags the ID and the final exam." },
      { action: "final_exam as a feature", result: "The new student’s row shows **?** for `final_exam` and the lab says no prediction is possible — the value doesn’t exist in week 8." },
      { action: "ID and final exam not used", result: "X has shape (10, 8) and S11’s row is complete: (0, 0, 1, 85, 7, 0, 1, 21) — EEE, 85% attendance, 7 assignments, hostel, midterm 21." },
      { action: "Drop the first category", result: "X has shape (10, 6): department keeps CSE and EEE, residence keeps hostel." },
      { action: "midterm as target", result: "The problem type becomes regression, because the target is a number." },
    ],
  },

  code: {
    label: "build_dataset.py",
    language: "Python",
    source: `import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder

students = pd.DataFrame({
    "student_id":  ["S01", "S02", "S03", "S04", "S05", "S06", "S07", "S08", "S09", "S10"],
    "department":  ["CSE", "EEE", "BBA", "CSE", "CSE", "BBA", "EEE", "BBA", "EEE", "CSE"],
    "attendance":  [92, 65, 78, 55, 88, 70, 81, 48, 74, 96],
    "assignments": [9, 5, 7, 4, 8, 6, 8, 3, 6, 10],
    "residence":   ["hostel", "home", "home", "hostel", "home", "hostel", "home", "home", "hostel", "home"],
    "midterm":     [24, 14, 19, 12, 22, 17, 20, 10, 18, 27],
    "final_exam":  [41, 22, 30, 18, 36, 27, 33, 15, 20, 45],
    "passed":      ["yes", "no", "yes", "no", "yes", "yes", "yes", "no", "no", "yes"],
})

# Prediction is made in week 8, so only columns known by then can be features.
numeric = ["attendance", "assignments", "midterm"]
categorical = ["department", "residence"]
# Not used: student_id (an identifier) and final_exam (known only after the outcome).

encode = ColumnTransformer(
    [("cat", OneHotEncoder(handle_unknown="ignore"), categorical)],
    remainder="passthrough",
    verbose_feature_names_out=False,
)
X = encode.fit_transform(students[numeric + categorical])
y = (students["passed"] == "yes").astype(int)

print("X shape:", X.shape)
print("Columns:", list(encode.get_feature_names_out()))
print("Pass rate:", y.mean())

new_student = pd.DataFrame([{"attendance": 85, "assignments": 7, "midterm": 21,
                             "department": "EEE", "residence": "hostel"}])
print("New student row:", encode.transform(new_student))`,
    walkthrough: [
      { lines: "5–14", text: "The raw records, exactly as in the experiment. Nothing has been dropped yet." },
      { lines: "16–19", text: "The decisions from this lesson, written in code: which columns are numeric features, which are categorical, and which are deliberately left out — with the reason." },
      {
        lines: "21–25",
        text: "`ColumnTransformer` one-hot encodes the categorical columns and passes the numeric ones through unchanged (`remainder=\"passthrough\"`). It puts the encoded columns first.",
      },
      { lines: "26", text: "`fit_transform` learns the category lists (BBA, CSE, EEE; home, hostel) from this data and builds X." },
      { lines: "27", text: "The target becomes 1 for “yes” and 0 for “no”." },
      {
        lines: "33–35",
        text: "The new student goes through `transform`, not `fit_transform`, so the encoder reuses the categories it learned and the row gets the same eight columns. Encoding the new row on its own — for example with `pd.get_dummies` — would produce only the categories present in that one row.",
      },
    ],
    shapes: [
      { name: "students", shape: "(10, 8)", meaning: "10 records, 8 raw columns" },
      { name: "X", shape: "(10, 8)", meaning: "10 rows, 5 one-hot columns + 3 numeric columns" },
      { name: "y", shape: "(10,)", meaning: "One 0/1 target per student" },
      { name: "encode.transform(new_student)", shape: "(1, 8)", meaning: "One row with the same 8 columns, in the same order" },
    ],
    output: {
      label: "Output",
      text: "X shape: (10, 8)\nColumns: ['department_BBA', 'department_CSE', 'department_EEE', 'residence_home', 'residence_hostel', 'attendance', 'assignments', 'midterm']\nPass rate: 0.6\nNew student row: [[ 0.  0.  1.  0.  1. 85.  7. 21.]]",
      note: "Produced by running the script with pandas and scikit-learn 1.9. The coincidence that the raw table and X both have 8 columns is just that — they are different columns.",
    },
  },

  useCases: [
    {
      title: "Loan approval",
      text: "A credit model may use what is known when someone applies: income, existing debts, repayment history. Repayments made after the loan is granted are outcomes, not features.",
    },
    {
      title: "Hospital readmission",
      text: "Predicting readmission at discharge can use the stay’s diagnoses and lab results — but not tests ordered later because a doctor already suspected a problem.",
    },
    {
      title: "Your first real project",
      text: "In the UCI Bank Marketing data, the length of the sales call is only known after the call, when the customer has already answered. The dataset’s documentation itself advises leaving it out of a realistic predictive model.",
    },
  ],

  mistakes: [
    {
      kind: "mistake",
      title: "Using columns recorded after the outcome",
      text: "Final marks, closing dates, follow-up counts: they make test scores excellent and real predictions impossible. Date every column before using it.",
    },
    {
      kind: "mistake",
      title: "Keeping identifiers as features",
      text: "IDs let a model memorise training rows. They inflate training scores and add nothing for new cases.",
    },
    {
      kind: "mistake",
      title: "Encoding new data separately",
      text: "Calling `pd.get_dummies` on new rows on their own gives a different set of columns. Fit the encoder once on training data and reuse it.",
    },
    {
      kind: "misconception",
      title: "“Encoding categories as 1, 2, 3 is the same as one-hot”",
      text: "Numbering BBA = 1, CSE = 2, EEE = 3 tells a model that EEE is “more” than BBA and that CSE sits between them. One-hot encoding makes no such claim.",
    },
    {
      kind: "misconception",
      title: "“More columns always help”",
      text: "Irrelevant columns add noise, and every extra column is another chance to include a leak. On small datasets, fewer well-chosen features often generalise better.",
    },
    {
      kind: "limitation",
      title: "Ten students are not enough",
      text: "This dataset is sized to show structure, not to learn from. Real projects need far more rows than columns before a model can find patterns that hold up.",
    },
  ],

  exercise: {
    prompt: [
      {
        type: "p",
        text: "An airline wants to predict, **at the moment a ticket is booked**, whether the flight will be delayed by more than 15 minutes. Its records have these columns: `booking_date`, `scheduled_departure_hour`, `airline`, `origin_airport`, `passenger_name`, `weather_at_departure` (observed), `actual_departure_time`, `delay_minutes`, `delayed` (yes/no).",
      },
      {
        type: "list",
        ordered: true,
        items: [
          "Which column is the target?",
          "Sort the other columns into “feature” and “not used”, with a reason for each.",
          "If the prediction were made two hours before departure instead, what could change?",
        ],
      },
    ],
    hints: [
      "For each column, ask: at booking time, has this happened yet?",
      "`delayed` is defined from `delay_minutes`, so the two carry the same information.",
      "A forecast is known before the event; an observation is known only after it.",
    ],
    solution: [
      { type: "p", text: "1. The target is `delayed`." },
      {
        type: "table",
        caption: "Columns at booking time",
        head: ["Column", "Role", "Why"],
        rows: [
          ["booking_date", "Feature", "Known at booking"],
          ["scheduled_departure_hour", "Feature", "Known at booking"],
          ["airline", "Feature", "Known at booking (one-hot encode it)"],
          ["origin_airport", "Feature", "Known at booking (one-hot encode it)"],
          ["passenger_name", "Not used", "An identifier; also personal data with no predictive meaning"],
          ["weather_at_departure", "Not used", "Observed on the day; doesn’t exist at booking"],
          ["actual_departure_time", "Not used", "Recorded after the outcome — target leakage"],
          ["delay_minutes", "Not used", "The target in another form"],
        ],
      },
      {
        type: "p",
        text: "3. Two hours before departure, a **weather forecast** for departure time and whether the **incoming aircraft is already late** become legitimate features. `actual_departure_time` and `delay_minutes` are still leaks: the prediction time moved, but the outcome still lies in the future.",
      },
    ],
  },

  quiz: [
    {
      question: "In the week-8 student data, what is the target?",
      options: ["`midterm`", "`passed`", "`final_exam`", "`student_id`"],
      answer: 1,
      explanation: "The target is the outcome we want to predict: whether the student passes.",
    },
    {
      question: "Why may `final_exam` not be used as a feature?",
      options: [
        "It is a number, and features must be categories",
        "It is too strongly correlated with attendance",
        "Its value does not exist yet at the time of prediction",
        "It has missing values",
      ],
      answer: 2,
      explanation: "The prediction is made in week 8, before the final exam. A feature must be known when the prediction is needed.",
    },
    {
      question: "`department` has three categories. Without dropping any level, how many columns does one-hot encoding create?",
      options: ["1", "2", "3", "10"],
      answer: 2,
      explanation: "One indicator column per category: BBA, CSE and EEE. Dropping a reference level would leave 2.",
    },
    {
      question: "A model trained with `student_id` as a feature reaches 100% training accuracy. What can it do for a new student, S11?",
      options: [
        "Predict perfectly, because IDs are unique",
        "Nothing useful from the ID: S11 was never seen, so all ID columns are 0",
        "Predict the same as for S10, the nearest ID",
        "Refuse to run",
      ],
      answer: 1,
      explanation: "The ID columns let the model memorise training students. A new ID matches none of them, so those columns carry no information.",
    },
    {
      question: "60% of the ten students passed. What is that number useful for?",
      options: [
        "It is the accuracy of a model that always predicts “pass”, so a real model must beat it",
        "It proves the model will be 60% accurate",
        "It is the learning rate",
        "Nothing; class balance doesn’t matter",
      ],
      answer: 0,
      explanation: "The label distribution gives the simplest baseline. A model that can’t beat always guessing the majority class has learned nothing useful.",
    },
  ],

  glossary: [
    { term: "Example (instance)", definition: "One row of a dataset: one case the model learns from or predicts for." },
    { term: "Feature", definition: "A column the model may use as input." },
    { term: "Target (label)", definition: "The value to predict, known for training examples." },
    { term: "Feature matrix X", definition: "All feature values, one row per example and one column per encoded feature." },
    { term: "Target vector y", definition: "The targets, one per example." },
    { term: "Categorical feature", definition: "A feature whose values are categories rather than measurements, such as department." },
    { term: "One-hot encoding", definition: "Turning a category into one 0/1 column per possible value." },
    { term: "Identifier", definition: "A value that names a case (ID, name, row number) rather than describing it." },
    { term: "Prediction time", definition: "The moment a prediction is needed; it decides which features exist." },
    { term: "Target leakage", definition: "Using information that would not be available at prediction time, often because it is derived from the outcome." },
    { term: "Label distribution", definition: "How often each target value occurs; it sets the majority-class baseline." },
  ],

  references: [
    {
      title: "An Introduction to Statistical Learning (2nd ed.), chapter 2",
      source: "James, Witten, Hastie & Tibshirani, Springer, 2021",
      url: "https://www.statlearning.com/",
      note: "Inputs, outputs and the supervised learning set-up, explained carefully and free to read.",
    },
    {
      title: "Preprocessing data: encoding categorical features",
      source: "scikit-learn User Guide, section 8.3.4",
      url: "https://scikit-learn.org/stable/modules/preprocessing.html",
      note: "`OneHotEncoder`, including how unknown categories are handled.",
    },
    {
      title: "Datasheets for Datasets",
      source: "Gebru et al., arXiv:1803.09010 (2018); Communications of the ACM, 2021",
      url: "https://arxiv.org/abs/1803.09010v1",
      note: "Questions to ask about how a dataset was collected, labelled and intended to be used.",
    },
    {
      title: "Leakage and the reproducibility crisis in machine-learning-based science",
      source: "Kapoor & Narayanan, Patterns, 2023",
      url: "https://reproducible.cs.princeton.edu/",
      note: "A survey of leakage in published research and a taxonomy of how it happens.",
    },
  ],

  next: [
    { pathSlug: "ml-foundations", topicSlug: "regression-classification", reason: "The two kinds of target, and the first model for a yes/no target." },
    { pathSlug: "ml-foundations", topicSlug: "train-validation-test", reason: "Keeping evaluation honest once you have a dataset." },
    { pathSlug: "ai-engineering", topicSlug: "preprocessing-leakage", reason: "Preprocessing real tabular, text and image data without leaks." },
  ],

  teaching: {
    notes: [
      "Make students say the prediction time out loud before they choose a single feature. That one habit prevents most leakage.",
      "Do the S01 row on the board before opening the experiment, so the encoded matrix is not a mystery.",
      "Point out that column order in X doesn’t matter, as long as it is the same for every row — which is why the fitted encoder is reused.",
    ],
    demo: "Hand out the raw table on paper. In groups, students mark each column as feature, target or not used for a week-8 prediction, then again for “the day before the final exam”. Compare the groups’ choices, then reproduce both in the experiment.",
    discussion: [
      "Is `residence` a fair feature? Could a model using it treat some students unfairly, and would that matter if it predicts accurately?",
      "When does attendance stop being a safe feature — for example, if students who are failing stop attending after week 8?",
      "If the pass mark changes next year, is this year’s data still useful? What would you change?",
    ],
    misconceptions: [
      "“The target is just another column, so the model may use it.”",
      "“If a column is in the database, it’s available.” Availability is about time, not storage.",
      "“IDs are harmless because they are random.” They let a model memorise, and some are not random at all.",
    ],
    challenge: {
      prompt:
        "Suppose student IDs are assigned in order of enrolment, and students who enrol late tend to attend less. Is `student_id` still useless as a feature? What would you do instead?",
      answer: [
        {
          type: "p",
          text: "The ID now carries real information — enrolment order — but only implicitly. One-hot encoded, it still can’t generalise, because every new ID is unseen. As a raw number it could, but the meaning is hidden and fragile: a change in how IDs are issued would silently break the model.",
        },
        {
          type: "p",
          text: "Better: create an explicit feature such as `enrolment_week` from the enrolment records, check that it is known by week 8, and drop the ID. If enrolment order also tracks time, consider whether a time-based split is needed to evaluate fairly.",
        },
      ],
    },
  },
};
