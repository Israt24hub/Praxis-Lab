import type { Lesson } from "../../types/content";

/*
 * Reference lesson for the platform. Every number below was computed from the
 * dataset in src/content/datasets/study-hours.ts (code outputs were produced by
 * running the code shown). The dataset is invented for teaching and says so.
 */
export const learningFromData: Lesson = {
  id: "learning-from-data",
  pathSlug: "ml-foundations",
  topicSlug: "learning-from-data",
  title: "What does learning from data mean?",
  summary:
    "A model learns by adjusting a few numbers until its predictions match examples it has seen. This lesson makes that concrete with fifteen students, one feature and a line.",
  level: "beginner",
  minutes: [45, 60],
  objectives: [
    "Identify the **features**, **target**, **predictions** and **errors** in a small dataset",
    "Explain what changes during **training** and what stays fixed during **inference**",
    "Train a one-feature linear model with gradient descent and watch the error fall",
    "Judge a model on **held-out data** and compare it with a simple baseline",
  ],
  prerequisites: [
    { label: "Reading a table of numbers and a scatter plot" },
    { label: "The equation of a line, y = mx + c" },
    { label: "Basic Python (for the code section only)" },
  ],

  intro: [
    {
      type: "p",
      text: "Imagine a teacher who has recorded, for fifteen students, how many hours each one studied and the score they got on an exam. A new student says they will study for five hours. What score would you guess?",
    },
    {
      type: "p",
      text: "You would probably look at students who studied about five hours and guess something close to their scores. Machine learning does the same thing, but it writes the pattern down as a rule with numbers in it — and it chooses those numbers by checking the rule against every example it has.",
    },
    {
      type: "p",
      text: "That is what **learning from data** means: start with examples where the answer is known, pick a form of rule, and adjust the rule’s numbers until its answers are as close as possible to the known ones.",
    },
  ],

  why: [
    {
      type: "p",
      text: "Many useful rules are too complicated, too numerous or too fuzzy to write by hand. Nobody can write an exact formula for how a house’s size, location and age set its price, or for which pixels make a photo a cat.",
    },
    {
      type: "p",
      text: "Learning from data replaces hand-written rules with rules **fitted to examples**. It solves the problem of building a predictor when you have examples of the answer but no complete theory of how the answer comes about.",
    },
    {
      type: "callout",
      tone: "note",
      title: "What it does not solve",
      text: "A fitted rule only captures patterns present in its examples. It does not know why the pattern exists, and it can fail on cases unlike anything it saw.",
    },
  ],

  explanation: {
    beginner: [
      {
        type: "p",
        text: "Each row in our table is one **example** (one student). The column we use to make a guess — hours studied — is a **feature**. The column we want to guess — the exam score — is the **target** (also called the label).",
      },
      {
        type: "p",
        text: "Our model is a straight line: **predicted score = w × hours + b**. The two numbers **w** and **b** are the model’s **parameters**. They are the only things the model can change.",
      },
      {
        type: "p",
        text: "For each student, the gap between the line’s guess and the real score is the **error**. Square each error (so negatives don’t cancel positives) and take the average: that single number is the **loss**. A smaller loss means the line fits the examples better.",
      },
      {
        type: "p",
        text: "**Training** means nudging w and b, over and over, in whichever direction makes the loss smaller. When training stops, w and b are frozen. Using the frozen line to guess the score of a new student is called **inference**.",
      },
      {
        type: "p",
        text: "Finally, we kept three students out of training. Checking the line on them tells us how well it works on students it has never seen — which is what we actually care about.",
      },
    ],
    technical: [
      {
        type: "p",
        text: "We have a dataset of pairs (xᵢ, yᵢ), where xᵢ is a feature value and yᵢ a real-valued target. We choose a hypothesis class — here linear functions f(x) = w·x + b with parameters θ = (w, b).",
      },
      {
        type: "p",
        text: "Learning is empirical risk minimisation: choose θ to minimise the average loss on the training set. With squared error, the objective is the mean squared error L(θ) = (1/n)·Σᵢ (w·xᵢ + b − yᵢ)².",
      },
      {
        type: "p",
        text: "This particular problem has a closed-form solution (ordinary least squares), but we use gradient descent because it is how almost every larger model is trained: repeatedly move θ against the gradient ∇L, scaled by a learning rate η.",
      },
      {
        type: "p",
        text: "Training minimises loss on the training sample; what we want is low loss on the underlying population. The held-out test set gives an estimate of that generalisation error, valid only if the test rows played no part in any choice we made.",
      },
      {
        type: "callout",
        tone: "note",
        title: "Conditioning",
        text: "With the raw feature (hours, mean ≈ 4.9) the loss surface is a long, narrow valley, so gradient descent needs a small learning rate and many steps. Standardising the feature makes the valley round and training converges in a few dozen steps. You can see both in the experiment.",
      },
    ],
  },

  analogy: {
    title: "Tuning a recipe by taste",
    blocks: [
      {
        type: "p",
        text: "A cook adjusting salt and sugar works like gradient descent. They taste (compute the loss), notice it is too sweet (the direction of the error), and adjust a little (a small step). Large adjustments overshoot and the dish swings from too sweet to too sour — just like a learning rate that is too high.",
      },
      {
        type: "p",
        text: "The analogy breaks down in one important way: the cook tastes the dish they will serve. A model is tuned on training examples but judged on new ones, so it can “taste right” and still disappoint.",
      },
    ],
  },

  workedExample: {
    title: "Errors and loss for three students, by hand",
    blocks: [
      {
        type: "p",
        text: "Suppose training produced the rounded line **predicted score = 6 × hours + 35**. Take the first three training students:",
      },
      {
        type: "table",
        caption: "Predictions and errors with w = 6, b = 35",
        head: ["Hours (x)", "Actual score (y)", "Prediction (6x + 35)", "Error (prediction − actual)", "Squared error"],
        rows: [
          ["1", "41", "41", "0", "0"],
          ["2", "44", "47", "+3", "9"],
          ["2.5", "53", "50", "−3", "9"],
        ],
      },
      {
        type: "p",
        text: "The mean squared error over these three rows is (0 + 9 + 9) ÷ 3 = **6**. Training looks at all twelve training rows at once and chooses w and b to make this average as small as possible.",
      },
    ],
  },

  math: {
    blocks: [
      { type: "equation", expression: "ŷᵢ = w·xᵢ + b", meaning: "The model’s prediction for example i." },
      { type: "equation", expression: "eᵢ = ŷᵢ − yᵢ", meaning: "The error: positive when the model guesses too high." },
      {
        type: "equation",
        expression: "L(w, b) = (1/n) · Σᵢ eᵢ²",
        meaning: "Mean squared error, the loss we minimise. Squaring makes every error count and penalises large ones heavily.",
      },
      {
        type: "equation",
        expression: "∂L/∂w = (2/n) · Σᵢ eᵢ·xᵢ      ∂L/∂b = (2/n) · Σᵢ eᵢ",
        meaning: "The gradients: how the loss changes if w or b increases slightly.",
      },
      {
        type: "equation",
        expression: "w ← w − η·∂L/∂w      b ← b − η·∂L/∂b",
        meaning: "One gradient-descent step with learning rate η. This is the update the experiment runs.",
      },
    ],
    notation: [
      { symbol: "xᵢ", meaning: "Feature value of example i (hours studied)" },
      { symbol: "yᵢ", meaning: "Target value of example i (actual exam score)" },
      { symbol: "ŷᵢ", meaning: "Prediction for example i (read “y-hat”)" },
      { symbol: "w, b", meaning: "Weight and bias — the model’s parameters" },
      { symbol: "n", meaning: "Number of training examples (12 here)" },
      { symbol: "η", meaning: "Learning rate (“eta”), the step size" },
    ],
  },

  process: {
    title: "The full learning loop",
    steps: [
      { title: "Collect examples", text: "Rows where both the features and the correct target are known." },
      { title: "Hold some out", text: "Set aside test rows before doing anything else. They are not used until the end." },
      { title: "Choose a model form", text: "Here a line, ŷ = w·x + b. The form limits what patterns can be learned." },
      { title: "Start with guesses", text: "Initial parameters, often zero or small random numbers." },
      { title: "Predict and measure", text: "Predict every training row and compute the loss from the errors." },
      { title: "Update", text: "Move each parameter a small step in the direction that lowers the loss." },
      { title: "Repeat", text: "Each full pass over the training data is one epoch. Stop when the loss stops improving." },
      { title: "Test once", text: "Measure the loss on the held-out rows to estimate performance on new data." },
      { title: "Use it", text: "Inference: frozen parameters, new inputs, predictions out." },
    ],
  },

  interactive: {
    component: "learning-from-data-lab",
    kind: "computation",
    intro:
      "Fit a line to the fifteen students yourself, then let gradient descent do it. Everything is computed live in your browser from the data in the table — nothing is pre-recorded. The data itself is made up for teaching.",
    tryThis: [
      "In **Fit by hand**, move w and b to make the training MSE as small as you can. Then switch to gradient descent and compare.",
      "Train with the raw feature at learning rate 0.01, then reset and try 0.03. Watch how many epochs each needs.",
      "Set the learning rate to 0.05 without scaling and press Run. This is a failure case on purpose.",
      "Turn on **Standardize hours** and train again at 0.1. The same model now trains in a few dozen epochs.",
      "Move the prediction slider to 11 hours. Is the answer possible on a 100-point exam?",
    ],
    expect: [
      {
        action: "Training with the raw feature at η = 0.03",
        result: "Training MSE falls from about 4,300 to about 6.04 in roughly 450 epochs, ending at w ≈ 6.08 and b ≈ 34.20 — the same line the closed-form solution gives. At η = 0.01 it takes about three times as long.",
      },
      {
        action: "Raw feature at η = 0.05",
        result: "The loss grows instead of shrinking and the experiment stops: the steps overshoot the minimum by more each time.",
      },
      {
        action: "Standardized feature at η = 0.1",
        result: "The loss reaches about 6.04 within roughly 30 epochs.",
      },
      {
        action: "Comparing with the baseline",
        result: "Always predicting the training mean (63.8) gives a test MSE of about 125.6; the trained line gets about 6.8.",
      },
    ],
  },

  code: {
    label: "learning_from_data.py",
    language: "Python",
    source: `import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_squared_error

# Hours studied (feature) and exam score (target) for 15 students.
# Made-up teaching data: 12 rows for training, 3 held out for testing.
hours = np.array([1, 2, 2.5, 3, 4, 4.5, 5, 6, 6.5, 7, 8, 9, 3.5, 5.5, 7.5])
score = np.array([41, 44, 53, 50, 61, 58, 66, 69, 77, 74, 85, 88, 57, 64, 82])

X = hours.reshape(-1, 1)          # scikit-learn wants 2-D features: (rows, features)
X_train, y_train = X[:12], score[:12]
X_test, y_test = X[12:], score[12:]

model = LinearRegression()
model.fit(X_train, y_train)       # training: learn w and b from examples

w, b = model.coef_[0], model.intercept_
print(f"w = {w:.2f}, b = {b:.2f}")

y_pred = model.predict(X_test)    # inference: apply the fixed w and b to new rows
print("Test predictions:", y_pred.round(2))
print("Test MSE:", round(mean_squared_error(y_test, y_pred), 2))`,
    walkthrough: [
      { lines: "7–8", text: "The data as two arrays. Rows 13–15 are the held-out test students." },
      {
        lines: "10",
        text: "`reshape(-1, 1)` turns 15 numbers into a 15 × 1 table. scikit-learn always expects features as rows × columns, even when there is only one feature.",
      },
      { lines: "11–12", text: "The split happens before any fitting, so the test rows cannot influence the model." },
      {
        lines: "14–15",
        text: "`fit` is training. `LinearRegression` solves for the best w and b directly (least squares) rather than by gradient descent, but it minimises the same loss.",
      },
      { lines: "17", text: "`coef_` holds one weight per feature; `intercept_` is the bias." },
      { lines: "20", text: "`predict` is inference: no parameters change." },
    ],
    shapes: [
      { name: "X", shape: "(15, 1)", meaning: "15 examples, 1 feature" },
      { name: "X_train / y_train", shape: "(12, 1) / (12,)", meaning: "Training features and targets" },
      { name: "X_test / y_test", shape: "(3, 1) / (3,)", meaning: "Held-out features and targets" },
      { name: "model.coef_", shape: "(1,)", meaning: "One weight, because there is one feature" },
      { name: "y_pred", shape: "(3,)", meaning: "One prediction per test row" },
    ],
    output: {
      label: "Output",
      text: "w = 6.08, b = 34.20\nTest predictions: [55.48 67.63 79.79]\nTest MSE: 6.8",
      note: "Produced by running this script with NumPy and scikit-learn. Gradient descent in the experiment converges to the same w and b.",
    },
  },

  useCases: [
    {
      title: "Estimating prices",
      text: "Predicting a house’s price from its size and location uses the same idea with more features: a target (price), features (size, rooms, area) and a loss on the error.",
    },
    {
      title: "Forecasting demand",
      text: "A shop predicting tomorrow’s sales from past sales, day of week and weather is learning from data — with the extra rule that training data must come from before the test period.",
    },
    {
      title: "Your first real project",
      text: "In the UCI Bank Marketing project, the target is whether a customer subscribed and the features describe the customer and campaign. The structure is identical; the model and the loss change because the target is a category, not a number.",
    },
  ],

  mistakes: [
    {
      kind: "mistake",
      title: "Judging a model on its training data",
      text: "Training error says how well the model fits examples it was tuned on. It is almost always optimistic. Report performance on held-out data.",
    },
    {
      kind: "limitation",
      title: "Predicting outside the data",
      text: "The fitted line predicts about **101** points for 11 hours of study — impossible on a 100-point exam. No student in the data studied more than 9 hours, so the model has no evidence about that range.",
    },
    {
      kind: "misconception",
      title: "“The model understands why studying helps”",
      text: "The model found that hours and scores move together in these fifteen rows. It says nothing about cause: students who study more might also sleep more or have more support.",
    },
    {
      kind: "mistake",
      title: "Using features you won’t have at prediction time",
      text: "If a feature is only known after the outcome — say, the time spent writing the exam — the model looks excellent in testing and is useless in practice. This is target leakage.",
    },
    {
      kind: "misconception",
      title: "“Lower training error is always better”",
      text: "A flexible enough model can reach zero training error by memorising noise. What matters is error on new data.",
    },
  ],

  exercise: {
    prompt: [
      {
        type: "p",
        text: "A trained model predicts **score = 6 × hours + 35**. Three new students studied 2, 5 and 8 hours and scored 45, 62 and 86.",
      },
      {
        type: "list",
        ordered: true,
        items: [
          "Compute each student’s prediction and error.",
          "Compute the mean squared error over the three students.",
          "A baseline always predicts the training mean, 63.83. Compute its MSE on the same three students. Is the model better?",
        ],
      },
    ],
    hints: [
      "Error is prediction minus actual, so a guess that is too high has a positive error.",
      "Square each error before averaging.",
      "For the baseline, the prediction is 63.83 for every student.",
    ],
    solution: [
      {
        type: "table",
        caption: "Solution",
        head: ["Hours", "Actual", "Model prediction", "Model error", "Baseline error"],
        rows: [
          ["2", "45", "47", "+2", "+18.83"],
          ["5", "62", "65", "+3", "+1.83"],
          ["8", "86", "83", "−3", "−22.17"],
        ],
      },
      { type: "p", text: "Model MSE = (4 + 9 + 9) ÷ 3 ≈ **7.33**." },
      { type: "p", text: "Baseline MSE = (354.69 + 3.36 + 491.36) ÷ 3 ≈ **283.14**." },
      {
        type: "p",
        text: "The model’s error is far lower, so the line has learned something useful beyond the average — on these three students. Three examples are too few to be confident; a real evaluation needs more held-out data.",
      },
    ],
  },

  quiz: [
    {
      question: "In the study-hours dataset, what is the target?",
      options: ["Hours studied", "Exam score", "The weight w", "The number of students"],
      answer: 1,
      explanation: "The target is the value we want to predict — the exam score. Hours studied is the feature we predict it from.",
    },
    {
      question: "What happens during inference?",
      options: [
        "The parameters are updated to reduce the loss",
        "The data is split into training and test sets",
        "The model applies its fixed parameters to new inputs",
        "The learning rate is chosen",
      ],
      answer: 2,
      explanation: "Inference uses the trained, frozen parameters to make predictions. Parameters change only during training.",
    },
    {
      question: "Why were three students kept out of training?",
      options: [
        "To make training faster",
        "To estimate how the model performs on examples it has not seen",
        "Because their scores were wrong",
        "To make the training loss lower",
      ],
      answer: 1,
      explanation: "Held-out data estimates performance on new cases. It only works if those rows influenced no decision during training.",
    },
    {
      question: "During gradient descent the loss gets larger every epoch. What is the most likely cause?",
      options: ["Too few training examples", "The learning rate is too high", "The model has too few parameters", "The test set is too small"],
      answer: 1,
      explanation: "Steps that are too large overshoot the minimum, landing further away each time. Lower the learning rate — or rescale the feature.",
    },
    {
      question: "The trained line predicts 101 points for 11 hours of study on a 100-point exam. What does this show?",
      options: [
        "The model is broken and must be retrained",
        "Students who study 11 hours get bonus marks",
        "The model is extrapolating beyond the range of its training data",
        "The learning rate was too low",
      ],
      answer: 2,
      explanation: "No training example studied more than 9 hours. A linear model keeps the trend going indefinitely, even where it no longer makes sense.",
    },
  ],

  glossary: [
    { term: "Example", definition: "One row of data: one student, one house, one image." },
    { term: "Feature", definition: "An input value the model uses to make a prediction." },
    { term: "Target (label)", definition: "The value the model should predict, known for training examples." },
    { term: "Prediction", definition: "The model’s output for an input, written ŷ." },
    { term: "Error (residual)", definition: "Prediction minus actual value for one example." },
    { term: "Loss", definition: "A single number summarising the errors; training tries to make it small." },
    { term: "Mean squared error (MSE)", definition: "The average of the squared errors." },
    { term: "Parameters", definition: "The numbers the model adjusts during training, here w and b." },
    { term: "Training", definition: "Adjusting parameters to reduce the loss on training examples." },
    { term: "Inference", definition: "Using fixed parameters to predict for new inputs." },
    { term: "Epoch", definition: "One full pass over the training data." },
    { term: "Learning rate", definition: "How large each parameter update is." },
    { term: "Generalisation", definition: "How well a model performs on data it was not trained on." },
  ],

  references: [
    {
      title: "An Introduction to Statistical Learning (2nd ed.), chapters 2–3",
      source: "James, Witten, Hastie & Tibshirani, Springer, 2021",
      url: "https://www.statlearning.com/",
      note: "A free, careful treatment of what statistical learning is and of linear regression.",
    },
    {
      title: "Linear Models — scikit-learn User Guide",
      source: "scikit-learn documentation",
      url: "https://scikit-learn.org/stable/modules/linear_model.html",
      note: "Reference for `LinearRegression` and related models used in the code example.",
    },
    {
      title: "Machine Learning, chapter 1",
      source: "Tom M. Mitchell, McGraw-Hill, 1997",
      note: "The widely quoted definition of a program that learns from experience to improve at a task.",
    },
  ],

  next: [
    { pathSlug: "ml-foundations", topicSlug: "features-labels-datasets", reason: "Turn messier real-world records into features and targets." },
    { pathSlug: "ml-foundations", topicSlug: "train-validation-test", reason: "Why one held-out set is not enough once you start tuning." },
    { pathSlug: "deep-learning", topicSlug: "perceptrons-neurons", reason: "The same w·x + b, with an activation function: the start of neural networks." },
  ],

  teaching: {
    notes: [
      "Spend most of the time on the vocabulary (feature, target, prediction, error). Students who mix up features and targets struggle in every later lesson.",
      "Show the worked example on the board before opening the experiment, so the numbers on screen have meaning.",
      "Keep returning to the question “would we know this value at prediction time?” — it prepares students for leakage later.",
    ],
    demo: "Project the experiment. Ask three volunteers to fit the line by hand with the w and b sliders while the class calls out the training MSE. Then run gradient descent and compare its MSE with the class’s best attempt.",
    discussion: [
      "What other features might predict an exam score? Which of them would you actually have before the exam?",
      "The model predicts 101 for 11 hours. What should a deployed system do with inputs outside the training range?",
      "Is a model that predicts exam scores well a good tool for deciding how much students should study? Why or why not?",
    ],
    misconceptions: [
      "Thinking the model stores the training table and looks rows up. A linear model keeps only w and b.",
      "Believing a lower training loss always means a better model.",
      "Reading the learned weight as a cause: “each hour of study causes 6 more points”.",
    ],
    challenge: {
      prompt: "Add a second feature, hours of sleep the night before. Write the new model, say how many parameters it has, and write the gradient of the loss with respect to the new weight.",
      answer: [
        { type: "p", text: "The model becomes ŷ = w₁·hours + w₂·sleep + b, with three parameters." },
        {
          type: "p",
          text: "The gradient for the new weight follows the same pattern as before: ∂L/∂w₂ = (2/n)·Σᵢ eᵢ·sleepᵢ. Each weight’s gradient is the average error multiplied by its own feature.",
        },
      ],
    },
  },
};
