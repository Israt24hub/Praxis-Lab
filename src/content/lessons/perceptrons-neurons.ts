import type { Lesson } from "../../types/content";

/*
 * Single-neuron lesson. It reuses the AI Playground's Single Neuron lab.
 * Numeric results were computed with NumPy from the values shown.
 */
export const perceptronsNeurons: Lesson = {
  id: "perceptrons-neurons",
  pathSlug: "deep-learning",
  topicSlug: "perceptrons-neurons",
  title: "Perceptrons and single neurons",
  summary:
    "Every neural network, from a digit classifier to a large language model, is built from one small calculation: multiply inputs by weights, add a bias, and pass the result through an activation function.",
  level: "beginner",
  minutes: [40, 55],
  objectives: [
    "Compute a neuron’s **weighted sum** and **activation** by hand",
    "Explain what the **weights**, the **bias** and the **activation function** each contribute",
    "Describe a single neuron’s **decision boundary** and why it is a straight line",
    "Implement a neuron for a whole batch of inputs in NumPy and read the array shapes",
  ],
  prerequisites: [
    { label: "What does learning from data mean?", href: "/learn/ml-foundations/learning-from-data" },
    { label: "Multiplying and adding decimals" },
    { label: "Basic NumPy (for the code section)" },
  ],

  intro: [
    {
      type: "p",
      text: "In the previous lesson, a model predicted a score with **w × hours + b**. A neuron does almost the same thing with several inputs at once — and then passes the result through an **activation function** that bends or limits it.",
    },
    {
      type: "p",
      text: "That is the whole unit. A neural network is many of these, arranged in layers, with the outputs of one layer becoming the inputs of the next.",
    },
  ],

  why: [
    {
      type: "p",
      text: "We often want a model that combines several pieces of evidence, each with its own importance, into one decision: is this email spam, does this patch of an image contain an edge. A weighted sum expresses “how much each input matters”; the bias sets how much evidence is needed before the neuron responds.",
    },
    {
      type: "p",
      text: "The activation function exists because weighted sums alone are linear. Stacking linear steps only ever produces another linear step, so without a non-linear activation, a deep network would be no more expressive than a single line.",
    },
    {
      type: "callout",
      tone: "note",
      title: "A little history",
      text: "Frank Rosenblatt’s **perceptron** (1958) was one of the first trainable neurons: a weighted sum followed by a hard threshold. Minsky and Papert’s 1969 book showed that a single perceptron cannot learn functions such as XOR, which helped motivate networks with hidden layers.",
    },
  ],

  explanation: {
    beginner: [
      {
        type: "p",
        text: "Picture a judge scoring a dish. Each input is something they notice — taste, presentation. Each **weight** says how much that thing matters to them; a negative weight means it counts against the dish.",
      },
      {
        type: "p",
        text: "The judge adds up the weighted impressions and then adds the **bias**: their mood before tasting anything. A generous judge has a positive bias; a harsh one, negative.",
      },
      {
        type: "p",
        text: "Finally the **activation function** turns that total into the neuron’s output. Sigmoid squeezes it into a value between 0 and 1, like a confidence. ReLU keeps positive totals and turns negative ones into 0, like a judge who stays silent unless impressed.",
      },
      {
        type: "p",
        text: "Training — which comes in later lessons — means adjusting the weights and bias so the outputs match examples, exactly as w and b were adjusted for the line.",
      },
    ],
    technical: [
      {
        type: "p",
        text: "For an input vector x ∈ ℝᵈ, a neuron with weights w ∈ ℝᵈ, bias b ∈ ℝ and activation φ computes z = w·x + b (the pre-activation) and a = φ(z).",
      },
      {
        type: "p",
        text: "The set of inputs where z = 0 is a hyperplane — a line when d = 2. With a threshold or sigmoid activation, the neuron separates input space into two half-spaces, so a single neuron can only represent linearly separable decisions.",
      },
      {
        type: "p",
        text: "For a batch X ∈ ℝ^(n×d), all pre-activations are computed at once as z = Xw + b, with b broadcast across the n rows. A layer of m neurons generalises w to a matrix W ∈ ℝ^(d×m).",
      },
      {
        type: "p",
        text: "Activation choice affects training: sigmoid saturates for large |z|, so its gradient σ(z)(1 − σ(z)) approaches zero; ReLU has gradient 1 for z > 0 and 0 for z < 0, which avoids saturation but can leave a neuron permanently inactive.",
      },
    ],
  },

  analogy: {
    title: "A committee vote with a quorum",
    blocks: [
      {
        type: "p",
        text: "Each input is a committee member’s vote; each weight is how much influence that member has. The bias is the quorum rule — how much support is needed before anything happens. The activation decides how the final tally is reported: a yes/no (step), a confidence (sigmoid), or “only report if positive” (ReLU).",
      },
      {
        type: "p",
        text: "Like every analogy, it stops short: a real neuron’s weights are not set by anyone’s judgement but learned from data.",
      },
    ],
  },

  workedExample: {
    title: "One neuron, one input, by hand",
    blocks: [
      {
        type: "p",
        text: "Take inputs x₁ = 1.0 and x₂ = 0.5, weights w₁ = 0.8 and w₂ = −1.2, and bias b = 0.1 — the starting values of the experiment below.",
      },
      {
        type: "table",
        caption: "Computing the output",
        head: ["Step", "Calculation", "Result"],
        rows: [
          ["Weighted inputs", "0.8 × 1.0 and −1.2 × 0.5", "0.8 and −0.6"],
          ["Weighted sum z", "0.8 + (−0.6) + 0.1", "0.3"],
          ["Sigmoid σ(z)", "1 ÷ (1 + e^(−0.3))", "≈ 0.574"],
          ["ReLU(z)", "max(0, 0.3)", "0.3"],
          ["tanh(z)", "tanh(0.3)", "≈ 0.291"],
        ],
      },
      {
        type: "p",
        text: "z is slightly positive, so sigmoid gives slightly more than 0.5. If x₂ rose to 1.0, z would become 0.8 − 1.2 + 0.1 = −0.3: the second input, with its negative weight, would outvote the first.",
      },
    ],
  },

  math: {
    blocks: [
      { type: "equation", expression: "z = w₁x₁ + w₂x₂ + … + w_d x_d + b = w·x + b", meaning: "The weighted sum, or pre-activation." },
      { type: "equation", expression: "σ(z) = 1 / (1 + e^(−z))", meaning: "Sigmoid: output between 0 and 1; equals 0.5 when z = 0." },
      { type: "equation", expression: "ReLU(z) = max(0, z)", meaning: "Rectified linear unit: zero for negative z, unchanged otherwise." },
      { type: "equation", expression: "tanh(z) = (e^z − e^(−z)) / (e^z + e^(−z))", meaning: "Hyperbolic tangent: output between −1 and 1, centred on 0." },
      {
        type: "equation",
        expression: "step(z) = 1 if z ≥ 0, otherwise 0",
        meaning: "The original perceptron’s activation. It has no useful gradient, which is why modern networks use smooth activations.",
      },
      {
        type: "equation",
        expression: "w₁x₁ + w₂x₂ + b = 0",
        meaning: "The decision boundary for two inputs: a straight line separating the inputs where z > 0 from those where z < 0.",
      },
    ],
    notation: [
      { symbol: "x = (x₁, …, x_d)", meaning: "Input vector with d features" },
      { symbol: "w", meaning: "Weight vector, one weight per input" },
      { symbol: "b", meaning: "Bias, a single number" },
      { symbol: "z", meaning: "Pre-activation (weighted sum plus bias)" },
      { symbol: "φ, σ", meaning: "An activation function; σ is the sigmoid" },
      { symbol: "a", meaning: "The neuron’s output (activation)" },
    ],
  },

  process: {
    title: "What a neuron does, in order",
    steps: [
      { title: "Receive inputs", text: "A vector of numbers: features, or the outputs of a previous layer." },
      { title: "Weight each input", text: "Multiply each input by its own weight. Negative weights push the sum down." },
      { title: "Sum and add the bias", text: "Add the weighted inputs together, then add the bias: z = w·x + b." },
      { title: "Activate", text: "Apply the activation function: a = φ(z)." },
      { title: "Pass it on", text: "The output becomes an input to neurons in the next layer, or the network’s prediction." },
    ],
  },

  interactive: {
    component: "neuron-lab",
    kind: "computation",
    intro:
      "This is the same Single Neuron experiment as in the AI Playground. Every value is computed in your browser from the sliders.",
    tryThis: [
      "Set w₂ to 0 and move x₂. Nothing changes — an input with zero weight is ignored.",
      "With ReLU selected, lower the bias until z is negative. The output stays at 0 however you move the inputs slightly.",
      "With sigmoid, push z far above 3 or below −3 and watch the curve flatten: large changes in z barely change the output.",
      "Find inputs that make z exactly 0. With sigmoid the output is 0.5 — you are on the decision boundary.",
    ],
    expect: [
      { action: "Starting values (x = (1, 0.5), w = (0.8, −1.2), b = 0.1)", result: "z = 0.30 and sigmoid output ≈ 0.574." },
      { action: "Raising x₂ to 1.0", result: "z = −0.30: sigmoid falls below 0.5 and ReLU outputs 0." },
      { action: "Switching to tanh at z = 0.30", result: "Output ≈ 0.291, between −1 and 1." },
    ],
  },

  code: {
    label: "neuron.py",
    language: "Python",
    source: `import numpy as np

def sigmoid(z):
    return 1 / (1 + np.exp(-z))

# A batch of 4 examples, each with 2 input features.
X = np.array([[1.0, 0.5],
              [0.0, 0.0],
              [2.0, 1.0],
              [-1.0, 0.5]])
w = np.array([0.8, -1.2])   # one weight per input feature
b = 0.1                     # one bias for the neuron

z = X @ w + b               # weighted sum for every example at once
a = sigmoid(z)              # activation

print("z:", z.round(4))
print("a:", a.round(4))`,
    walkthrough: [
      { lines: "3–4", text: "Sigmoid works element-wise on a whole array, so one call handles every example." },
      { lines: "7–10", text: "Rows are examples and columns are features — the same convention as scikit-learn." },
      { lines: "11–12", text: "The neuron’s parameters: two weights and one bias. These are what training would change." },
      {
        lines: "14",
        text: "`X @ w` is a matrix–vector product: each row of X is multiplied by w and summed. The scalar b is broadcast, added to every row.",
      },
      { lines: "15", text: "The activation turns four pre-activations into four outputs." },
    ],
    shapes: [
      { name: "X", shape: "(4, 2)", meaning: "4 examples × 2 features" },
      { name: "w", shape: "(2,)", meaning: "One weight per feature" },
      { name: "b", shape: "scalar", meaning: "Broadcast to every example" },
      { name: "z, a", shape: "(4,)", meaning: "One value per example" },
    ],
    output: {
      label: "Output",
      text: "z: [ 0.3  0.1  0.5 -1.3]\na: [0.5744 0.525  0.6225 0.2142]",
      note: "Produced by running the script with NumPy. The first row matches the worked example. In PyTorch, `torch.nn.Linear(2, 1)` holds the same parameters, with its weight stored as shape (1, 2).",
    },
  },

  useCases: [
    {
      title: "Logistic regression is a single neuron",
      text: "A sigmoid neuron trained with cross-entropy loss is exactly logistic regression, the standard baseline for binary classification — for example, whether a bank customer will subscribe.",
    },
    {
      title: "Hidden units in every network",
      text: "Each unit in a fully connected layer of an image or text model performs this computation; the network’s power comes from many of them in layers.",
    },
    {
      title: "Output layers",
      text: "A regression network often ends with one neuron and no activation; a binary classifier ends with one sigmoid neuron that outputs a probability.",
    },
  ],

  mistakes: [
    {
      kind: "misconception",
      title: "“Artificial neurons work like brain neurons”",
      text: "The design was loosely inspired by biology, but an artificial neuron is a weighted sum and a function. Claims about networks “thinking like brains” are not supported by this mechanism.",
    },
    {
      kind: "limitation",
      title: "One neuron draws one straight line",
      text: "A single neuron cannot separate classes that need a curved or multi-part boundary, such as XOR. Hidden layers are needed for that.",
    },
    {
      kind: "mistake",
      title: "Forgetting the bias",
      text: "Without a bias, the decision boundary must pass through the origin. Most frameworks include a bias by default; hand-written code often forgets it.",
    },
    {
      kind: "mistake",
      title: "Mixing up shapes",
      text: "Putting features in rows instead of columns, or storing weights as (1, d) when the code expects (d,), produces shape errors — or, worse, silently wrong broadcasting.",
    },
    {
      kind: "misconception",
      title: "“A large weight means an important feature”",
      text: "Weight size depends on the feature’s scale. A feature measured in grams gets a smaller weight than the same feature in kilograms. Compare weights only after standardising features.",
    },
  ],

  exercise: {
    prompt: [
      { type: "p", text: "A neuron has weights w = (0.5, 1.5) and bias b = −0.25. The input is x = (2, −1)." },
      {
        type: "list",
        ordered: true,
        items: [
          "Compute the weighted sum z.",
          "Compute the output with ReLU and with sigmoid.",
          "Write the equation of the line where this neuron’s sigmoid output is exactly 0.5.",
        ],
      },
    ],
    hints: [
      "Multiply pairwise: 0.5 × 2 and 1.5 × (−1), then add the bias.",
      "Sigmoid of a negative number is below 0.5.",
      "Sigmoid outputs 0.5 exactly when z = 0.",
    ],
    solution: [
      { type: "p", text: "z = 0.5 × 2 + 1.5 × (−1) − 0.25 = 1 − 1.5 − 0.25 = **−0.75**." },
      { type: "p", text: "ReLU(−0.75) = **0**. σ(−0.75) = 1 ÷ (1 + e^0.75) ≈ **0.321**." },
      {
        type: "p",
        text: "The output is 0.5 where z = 0, so the boundary is **0.5x₁ + 1.5x₂ − 0.25 = 0**, or equivalently x₂ = (0.25 − 0.5x₁) ÷ 1.5.",
      },
    ],
  },

  quiz: [
    {
      question: "What does the bias let a neuron do?",
      options: [
        "Ignore some of its inputs",
        "Shift its decision boundary so it need not pass through the origin",
        "Train faster",
        "Accept more inputs",
      ],
      answer: 1,
      explanation: "The bias moves the point where z = 0. Without it, z is always 0 when every input is 0.",
    },
    {
      question: "A ReLU neuron has z = −2.4. What is its output?",
      options: ["−2.4", "0", "2.4", "0.5"],
      answer: 1,
      explanation: "ReLU outputs max(0, z), so any negative z gives 0.",
    },
    {
      question: "Which range of outputs does sigmoid produce?",
      options: ["Any real number", "−1 to 1", "Between 0 and 1", "0 or 1 only"],
      answer: 2,
      explanation: "Sigmoid squeezes any z into the open interval between 0 and 1; tanh gives −1 to 1, and the step function gives exactly 0 or 1.",
    },
    {
      question: "Why can a single neuron not learn XOR?",
      options: [
        "XOR needs more than two inputs",
        "Its weights cannot be negative",
        "XOR’s classes cannot be separated by one straight line",
        "Sigmoid is too slow",
      ],
      answer: 2,
      explanation: "A single neuron’s boundary is a straight line. XOR puts (0, 1) and (1, 0) on one side and (0, 0) and (1, 1) on the other, which no single line can do.",
    },
    {
      question: "In NumPy, X has shape (32, 10) and w has shape (10,). What is the shape of X @ w + b?",
      options: ["(10,)", "(32,)", "(32, 10)", "(1,)"],
      answer: 1,
      explanation: "Each of the 32 rows is combined with the 10 weights into one number, giving 32 pre-activations.",
    },
  ],

  glossary: [
    { term: "Neuron (unit)", definition: "A function computing a = φ(w·x + b)." },
    { term: "Weight", definition: "A parameter that scales one input." },
    { term: "Bias", definition: "A parameter added to the weighted sum, shifting the neuron’s threshold." },
    { term: "Pre-activation (z)", definition: "The weighted sum plus bias, before the activation function." },
    { term: "Activation function", definition: "A function applied to z, usually non-linear, such as sigmoid, ReLU or tanh." },
    { term: "Perceptron", definition: "Rosenblatt’s neuron with a step activation, trained with the perceptron learning rule." },
    { term: "Decision boundary", definition: "The set of inputs where the neuron’s output switches between classes; for one neuron, a line or hyperplane." },
    { term: "Linearly separable", definition: "Classes that can be separated by a single straight line or hyperplane." },
    { term: "Saturation", definition: "When an activation’s output barely changes with z, so its gradient is close to zero." },
  ],

  references: [
    {
      title: "The perceptron: a probabilistic model for information storage and organization in the brain",
      source: "Frank Rosenblatt, Psychological Review 65(6), 386–408, 1958",
      note: "The original perceptron paper.",
    },
    {
      title: "Perceptrons: An Introduction to Computational Geometry",
      source: "Marvin Minsky & Seymour Papert, MIT Press, 1969",
      note: "Analysed what single-layer perceptrons can and cannot compute.",
    },
    {
      title: "Deep Learning, chapter 6 (Deep Feedforward Networks)",
      source: "Goodfellow, Bengio & Courville, MIT Press, 2016",
      url: "https://www.deeplearningbook.org/",
      note: "Free online textbook; chapter 6 covers units, activations and why depth helps.",
    },
    {
      title: "torch.nn.Linear",
      source: "PyTorch documentation",
      url: "https://docs.pytorch.org/docs/stable/generated/torch.nn.Linear.html",
      note: "How a layer of neurons is defined in PyTorch, including the shape of its weight.",
    },
  ],

  next: [
    { pathSlug: "deep-learning", topicSlug: "layers-activations", reason: "Many neurons side by side form a layer; layers stacked form a network." },
    { pathSlug: "deep-learning", topicSlug: "loss-functions", reason: "How a neuron’s output is scored against the right answer." },
    { pathSlug: "math-foundations", topicSlug: "linear-algebra-essentials", reason: "The dot products and matrix products behind w·x and Xw." },
  ],

  teaching: {
    notes: [
      "Do the worked example on the board before showing the experiment; students should predict the sign of z before seeing it.",
      "Emphasise that weights and bias are learned; this lesson sets them by hand only to see their effect.",
      "If time is short, skip tanh and keep sigmoid and ReLU.",
    ],
    demo: "Make three students a neuron: two hold input cards, one is the neuron with weight cards. The class calls out inputs, the neuron computes z on the board, and the class applies ReLU. Change one weight to negative and repeat.",
    discussion: [
      "Why might a negative weight be useful? Give an example from a real decision.",
      "If a neuron’s ReLU output is 0 for every training example, what happens when we try to train it?",
      "What would you need to change to make a neuron output any real number?",
    ],
    misconceptions: [
      "Believing the activation function is optional decoration.",
      "Thinking a neuron “decides” anything beyond computing its formula.",
      "Assuming a larger weight always means a more important input, regardless of feature scale.",
    ],
    challenge: {
      prompt:
        "Using step-activation neurons (step(z) = 1 if z ≥ 0, else 0), build a two-layer network that computes XOR of two binary inputs. Give every weight and bias.",
      answer: [
        { type: "p", text: "Hidden neuron h₁ = step(x₁ + x₂ − 0.5) computes OR. Hidden neuron h₂ = step(x₁ + x₂ − 1.5) computes AND." },
        { type: "p", text: "Output y = step(h₁ − h₂ − 0.5): it fires when OR is true but AND is false — which is XOR." },
        {
          type: "table",
          caption: "Check",
          head: ["x₁", "x₂", "h₁", "h₂", "y"],
          rows: [
            ["0", "0", "0", "0", "0"],
            ["0", "1", "1", "0", "1"],
            ["1", "0", "1", "0", "1"],
            ["1", "1", "1", "1", "0"],
          ],
        },
      ],
    },
  },
};
