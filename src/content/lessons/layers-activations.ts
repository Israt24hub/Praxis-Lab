import type { Lesson } from "../../types/content";

/*
 * Layers and activations. Lab numbers come from src/lib/boundaries.ts and src/lib/nn.ts
 * (seeded) and are checked in tests/deep-learning.test.ts; the code output was produced
 * by running the script with PyTorch.
 */
export const layersActivations: Lesson = {
  id: "layers-activations",
  pathSlug: "deep-learning",
  topicSlug: "layers-activations",
  title: "Neural network layers and activations",
  summary:
    "Put neurons side by side and you have a layer: one matrix multiplication plus a bias. Put layers in a row and you have a network — but only if a non-linear activation sits between them.",
  level: "intermediate",
  minutes: [45, 60],
  objectives: [
    "Write a **layer** as a matrix multiplication plus a bias, and give the shapes of its weight and output",
    "Compare **ReLU, sigmoid, tanh and GELU**: their outputs, their slopes and where they flatten out",
    "Show that a stack of **linear layers is still one linear layer**, and why that makes the activation essential",
    "Explain how hidden units let a network draw **curved and multi-part boundaries**, and recognise **dead ReLU** units",
  ],
  prerequisites: [
    { label: "Perceptrons and single neurons", href: "/learn/deep-learning/perceptrons-neurons" },
    { label: "Linear algebra essentials", href: "/learn/math-foundations/linear-algebra-essentials" },
    { label: "Basic PyTorch tensors (for the code section)" },
  ],

  intro: [
    {
      type: "p",
      text: "A single neuron computes a weighted sum, adds a bias and applies an activation. A **layer** is many neurons reading the same inputs at once, each with its own weights. Because they all do the same kind of sum, a whole layer is one matrix multiplication.",
    },
    {
      type: "p",
      text: "Networks stack layers: the outputs of one become the inputs of the next. This lesson shows what stacking buys you — and the one ingredient without which it buys nothing at all.",
    },
  ],

  why: [
    {
      type: "p",
      text: "One neuron can only draw a straight line through its inputs. Most real problems need more: an image class is not separated from the rest by one straight cut in pixel space, and the XOR problem from the previous lesson needs two. Hidden layers let a network combine several simple cuts into a curved or multi-part boundary.",
    },
    {
      type: "p",
      text: "The activation function is what makes this work. Matrix multiplications compose into another matrix multiplication, so without a non-linear activation between them, ten layers compute exactly what one layer could. Choosing the activation also decides how well gradients flow back during training, which is why ReLU and GELU replaced sigmoid in most hidden layers.",
    },
    {
      type: "callout",
      tone: "note",
      title: "How far can one hidden layer go?",
      text: "The **universal approximation theorem** says that a network with one hidden layer and enough units can approximate any continuous function on a bounded region as closely as you like. It promises that such weights exist, not that training will find them or how many units you need — which is why practical networks are usually deeper rather than enormously wide.",
    },
  ],

  explanation: {
    beginner: [
      {
        type: "p",
        text: "Imagine a panel of judges, all looking at the same dish. Each judge has their own scoring rule — one cares about taste, another about colour — so the panel produces one score per judge. That panel is a layer; each judge is a unit.",
      },
      {
        type: "p",
        text: "The next panel never sees the dish. It only sees the first panel’s scores, and combines them in its own ways. This is how depth works: later layers build on features the earlier layers found.",
      },
      {
        type: "p",
        text: "Here is the catch. If every judge just adds things up with weights, the second panel’s scores are still nothing more than weighted sums of the original ingredients — you could have skipped the first panel entirely. The activation is a judge’s rule like “only report a score if it is positive” (ReLU) or “squash the score between −1 and 1” (tanh). That small bend is what lets two panels do something one could not.",
      },
      {
        type: "p",
        text: "In the experiment, a network with four hidden units learns to separate the four corners of the XOR pattern. Remove the activation and, however many units you add, the boundary stays a single straight line.",
      },
    ],
    technical: [
      {
        type: "p",
        text: "A dense (fully connected) layer with weight W ∈ ℝ^(d×m) and bias b ∈ ℝ^m maps a batch X ∈ ℝ^(n×d) to Z = XW + b ∈ ℝ^(n×m), then H = φ(Z) applies the activation element-wise. Each of the m columns of W is one unit’s weight vector. PyTorch’s `nn.Linear(d, m)` stores the transpose, a weight of shape (m, d), and computes X Wᵀ + b.",
      },
      {
        type: "p",
        text: "Without φ, two layers give (XW₁ + b₁)W₂ + b₂ = X(W₁W₂) + (b₁W₂ + b₂): a single affine map with weight W₁W₂. By induction, any depth of purely linear layers is one linear layer, so its decision boundary for classification is a hyperplane.",
      },
      {
        type: "p",
        text: "With a non-linear φ, each hidden unit contributes a bent ‘ridge’ along its own line w·x + b = 0, and the output layer adds these ridges with weights. With ReLU the network is piecewise linear, with a kink along each unit’s line; with tanh or sigmoid the bends are smooth. More units give more pieces to combine.",
      },
      {
        type: "p",
        text: "Activations differ in their slopes, which backpropagation multiplies together layer by layer. Sigmoid’s slope is at most 0.25 and tanh’s at most 1, and both approach 0 for large |z| (saturation). ReLU’s slope is exactly 1 for z > 0 and 0 for z < 0: no saturation for positive inputs, but a unit whose input is negative for every example gets no gradient and stops learning — a **dead ReLU**. GELU, z·Φ(z), is a smooth version of ReLU used in transformers.",
      },
    ],
  },

  analogy: {
    title: "Folding a sheet of paper",
    blocks: [
      {
        type: "p",
        text: "A linear layer can stretch, rotate and shear a sheet of paper, but a sheet stays a flat sheet however many times you do that. The activation is a fold. After a fold, the next linear step acts on a creased sheet, and a few folds can bring points that started far apart onto the same side of a straight cut.",
      },
      {
        type: "p",
        text: "The analogy is about shape only: real networks work in many dimensions at once, and their ‘folds’ are set by learned weights, not by anyone’s hand.",
      },
    ],
  },

  workedExample: {
    title: "One layer, then a second, by hand",
    blocks: [
      {
        type: "p",
        text: "Take the input x = (1, 2) and a layer with three units. Column j of W holds unit j’s two weights:",
      },
      {
        type: "table",
        caption: "The layer’s parameters",
        head: ["Parameter", "unit 1", "unit 2", "unit 3"],
        rows: [
          ["weight from x₁", "1", "−1", "0.5"],
          ["weight from x₂", "0.5", "1", "−2"],
          ["bias", "0", "−0.5", "1"],
        ],
      },
      {
        type: "table",
        caption: "Layer 1: z = xW + b, then two possible activations",
        head: ["Unit", "z", "ReLU(z)", "tanh(z)"],
        rows: [
          ["1", "1×1 + 2×0.5 + 0 = **2**", "2", "0.964"],
          ["2", "1×(−1) + 2×1 − 0.5 = **0.5**", "0.5", "0.462"],
          ["3", "1×0.5 + 2×(−2) + 1 = **−2.5**", "0", "−0.987"],
        ],
      },
      {
        type: "p",
        text: "Now add a second layer with one output unit, weights v = (1, −2, 3) and bias 0.",
      },
      {
        type: "list",
        items: [
          "**With ReLU between the layers:** output = 2×1 + 0.5×(−2) + 0×3 = **1.0**.",
          "**With no activation:** output = 2×1 + 0.5×(−2) + (−2.5)×3 = **−6.5**.",
          "**One layer that does the same as the two linear ones:** weights Wv = (1×1 + (−1)(−2) + 0.5×3, 0.5×1 + 1×(−2) + (−2)×3) = (4.5, −7.5) and bias b·v + 0 = 0 + 1 + 3 = 4. Check: 1×4.5 + 2×(−7.5) + 4 = **−6.5**.",
        ],
      },
      {
        type: "p",
        text: "The two linear layers collapse into one, for every input. The ReLU network does not: unit 3 is switched off for this input, and switched on for others, so there is no single weight vector that matches it everywhere.",
      },
    ],
  },

  math: {
    blocks: [
      { type: "equation", expression: "Z = XW + b,   H = φ(Z)", meaning: "One dense layer for a batch: X is n × d, W is d × m, b has m entries, and φ acts on every element." },
      { type: "equation", expression: "(XW₁ + b₁)W₂ + b₂ = X(W₁W₂) + (b₁W₂ + b₂)", meaning: "Two linear layers are one linear layer, with weight W₁W₂." },
      { type: "equation", expression: "ReLU(z) = max(0, z),   ReLU′(z) = 1 if z > 0, else 0", meaning: "Zero for negative inputs; slope 1 for positive ones." },
      { type: "equation", expression: "σ(z) = 1 / (1 + e^(−z)),   σ′(z) = σ(z)(1 − σ(z)) ≤ 0.25", meaning: "Sigmoid squashes to (0, 1); its slope is largest, 0.25, at z = 0." },
      { type: "equation", expression: "tanh′(z) = 1 − tanh²(z) ≤ 1", meaning: "tanh squashes to (−1, 1) and is centred on 0; its slope is 1 at z = 0." },
      { type: "equation", expression: "GELU(z) = z · Φ(z)", meaning: "Φ is the standard normal cumulative distribution function. Close to ReLU for large |z|, smooth near 0, and slightly negative for negative z." },
    ],
    notation: [
      { symbol: "n, d, m", meaning: "Batch size, number of inputs, number of units in the layer" },
      { symbol: "W, b", meaning: "The layer’s weight matrix (d × m) and bias vector (m)" },
      { symbol: "Z, H", meaning: "Pre-activations and activations of the layer (both n × m)" },
      { symbol: "φ", meaning: "An activation function, applied element by element" },
      { symbol: "Φ", meaning: "Cumulative distribution function of the standard normal distribution" },
    ],
  },

  process: {
    title: "What one layer does to a batch",
    steps: [
      { title: "Receive a batch", text: "An n × d array: n examples, d features (or the d outputs of the previous layer)." },
      { title: "Multiply by the weights", text: "XW gives n × m: every example’s weighted sum for every unit, in one matrix multiplication." },
      { title: "Add the bias", text: "b, with m entries, is broadcast across all n rows." },
      { title: "Apply the activation", text: "φ bends every value. Skip this and the next layer can be folded into this one." },
      { title: "Hand over", text: "The n × m result is the next layer’s input — or, for the last layer, the network’s output." },
    ],
  },

  interactive: {
    component: "layers-lab",
    kind: "computation",
    intro:
      "Two panels. The first plots the four activations and their slopes. The second trains a network with one hidden layer in your browser, from fixed starting weights, and shades the plane by what it predicts.",
    tryThis: [
      "In panel 1, move z to −2 and to 2. Which activations are almost flat at each end? Tick “Show slopes” to check.",
      "In panel 2, keep XOR, tanh, 4 units and 500 steps. Then set the activation to “none (linear)”.",
      "Still with no activation, raise the hidden units to 8. Does the boundary change shape?",
      "Choose ReLU and step the hidden units through 2, 3, 4 and 8. Read “units never active”.",
      "Switch to the circle and use tanh. Find the fewest hidden units that classify every training point correctly.",
      "Set training steps to 0, 50 and 100 with tanh and 4 units, and watch the boundary form.",
    ],
    expect: [
      { action: "z = −2", result: "ReLU 0 with slope 0; sigmoid 0.1192 (slope 0.1050); tanh −0.9640 (slope 0.0707); GELU −0.0455." },
      { action: "XOR, tanh, 4 units, 500 steps", result: "100% of the 80 training points correct, loss 0.001, 17 parameters." },
      { action: "No activation, 4 or 8 units", result: "52.5%: one straight line, z = 0.05·x₁ + 0.05·x₂ + 0.00, whatever the width." },
      { action: "ReLU with 2, 3, 4, 8 units", result: "75%, 75%, 75%, then 100%. With 3 and 4 units, 2 and 3 of them are dead." },
      { action: "Circle with tanh", result: "2 and 3 units reach 95%; 4 units reach 100%." },
      { action: "tanh, 4 units, after 0 and 50 steps", result: "50% (loss 0.758) before training; 100% (loss 0.091) after 50 steps." },
    ],
  },

  code: {
    label: "layers.py",
    language: "Python",
    source: `import torch
from torch import nn

torch.manual_seed(0)

# A layer: 2 inputs, 3 units. PyTorch stores the weight as (out, in).
layer = nn.Linear(2, 3)
x = torch.tensor([[1.0, 2.0]])           # a batch of one example
print(layer.weight.shape, layer.bias.shape)
print(torch.allclose(layer(x), x @ layer.weight.T + layer.bias))

# Two linear layers with nothing in between...
two_linear = nn.Sequential(nn.Linear(2, 3), nn.Linear(3, 1))
W1, b1 = two_linear[0].weight, two_linear[0].bias
W2, b2 = two_linear[1].weight, two_linear[1].bias
W, b = W2 @ W1, W2 @ b1 + b2              # ...equal this single layer
X = torch.randn(5, 2)
print(torch.allclose(two_linear(X), X @ W.T + b))

# With a ReLU in between, no single layer matches.
with_relu = nn.Sequential(two_linear[0], nn.ReLU(), two_linear[1])
print(torch.allclose(with_relu(X), X @ W.T + b))

z = torch.tensor([-2.0, -1.0, 0.0, 1.0, 2.0])
for name, f in [("relu", nn.ReLU()), ("sigmoid", nn.Sigmoid()),
                ("tanh", nn.Tanh()), ("gelu", nn.GELU())]:
    print(f"{name:8s}", f(z).numpy().round(4))`,
    walkthrough: [
      { lines: "6–9", text: "`nn.Linear(2, 3)` creates a weight of shape (3, 2) and a bias of shape (3,), initialised at random." },
      { lines: "10", text: "The layer computes x Wᵀ + b. `allclose` confirms it with the formula written out." },
      { lines: "13–16", text: "Two linear layers in a row, and the single weight W₂W₁ and bias W₂b₁ + b₂ that they collapse to (in PyTorch’s (out, in) layout)." },
      { lines: "17–18", text: "On five random inputs the two-layer network and the single layer agree exactly." },
      { lines: "21–22", text: "The same two layers with a ReLU between them no longer match any single layer." },
      { lines: "24–27", text: "The four activations on the same five inputs as the table in panel 1." },
    ],
    shapes: [
      { name: "layer.weight", shape: "(3, 2)", meaning: "PyTorch’s layout: one row per unit (out × in)" },
      { name: "x", shape: "(1, 2)", meaning: "A batch of one example with two features" },
      { name: "layer(x)", shape: "(1, 3)", meaning: "One value per unit" },
      { name: "W", shape: "(1, 2)", meaning: "The single layer equal to the two linear layers" },
      { name: "X", shape: "(5, 2)", meaning: "Five random examples" },
    ],
    output: {
      label: "Output",
      text: "torch.Size([3, 2]) torch.Size([3])\nTrue\nTrue\nFalse\nrelu     [0. 0. 0. 1. 2.]\nsigmoid  [0.1192 0.2689 0.5    0.7311 0.8808]\ntanh     [-0.964  -0.7616  0.      0.7616  0.964 ]\ngelu     [-0.0455 -0.1587  0.      0.8413  1.9545]",
      note: "Produced by running the script with PyTorch. The activation values match panel 1 of the experiment.",
    },
  },

  useCases: [
    {
      title: "Hidden layers in every tabular and image model",
      text: "Multilayer perceptrons — dense layers with ReLU between them — are a common model for tabular data (where gradient-boosted trees are often a strong rival), and the same layers appear at the end of image classifiers, after the convolutional part.",
    },
    {
      title: "GELU in transformers",
      text: "The feed-forward blocks of BERT and GPT-style models use GELU between two dense layers; the smooth curve near zero is preferred there over ReLU’s hard corner.",
    },
    {
      title: "Sigmoid and softmax at the output",
      text: "Sigmoid is rarely used in hidden layers now, but it remains the standard output for a yes/no probability, and softmax for one-of-many classes.",
    },
  ],

  mistakes: [
    {
      kind: "mistake",
      title: "Forgetting the activation",
      text: "`nn.Sequential(nn.Linear(10, 64), nn.Linear(64, 1))` trains without complaint but is a linear model with extra parameters. The experiment’s XOR stays at 52.5% for exactly this reason.",
    },
    {
      kind: "mistake",
      title: "Putting ReLU on the final output",
      text: "A ReLU after the last layer stops a regression model from ever predicting a negative value, and it destroys the logits a classification loss expects. The last layer usually has no activation; the loss applies sigmoid or softmax itself.",
    },
    {
      kind: "limitation",
      title: "Dead ReLUs",
      text: "A ReLU unit whose input is negative for every example outputs 0 and gets a gradient of 0, so training cannot revive it. Large learning rates and unlucky starts make it more likely; more units, careful initialisation, or a variant such as GELU or LeakyReLU make it less of a problem.",
    },
    {
      kind: "misconception",
      title: "“More layers always means more power”",
      text: "More depth adds capacity only with non-linear activations between layers, and extra capacity can also mean overfitting and harder training. Width and depth are choices to test on validation data.",
    },
    {
      kind: "misconception",
      title: "“The activation is a detail”",
      text: "It decides what the network can represent (linear or not) and how gradients flow back through it (saturation, dead units). It is one of the first things to check when a network refuses to learn.",
    },
  ],

  exercise: {
    prompt: [
      {
        type: "p",
        text: "A layer has 2 inputs and 2 units with weights W = [[2, −1], [1, 1]] (row i holds the weights from input i) and bias b = (−1, 0.5). The input is x = (1, −1).",
      },
      {
        type: "list",
        ordered: true,
        items: [
          "Compute z = xW + b and the ReLU outputs.",
          "A second layer with weights v = (1, 3) and bias −0.5 reads the ReLU outputs. What does it output?",
          "If the ReLU is removed, which single layer (weights and bias) gives the same output as the two layers for every input?",
          "How many parameters does the two-layer network have?",
        ],
      },
    ],
    hints: [
      "Unit j’s sum is x₁·W[1][j] + x₂·W[2][j] + b[j].",
      "Without the ReLU, the combined weights are Wv and the combined bias is b·v − 0.5.",
      "Count every weight and every bias in both layers.",
    ],
    solution: [
      { type: "p", text: "z₁ = 1×2 + (−1)×1 − 1 = **0**; z₂ = 1×(−1) + (−1)×1 + 0.5 = **−1.5**. ReLU gives (0, 0)." },
      { type: "p", text: "Output = 0×1 + 0×3 − 0.5 = **−0.5**: both hidden units are switched off for this input, so only the bias remains." },
      { type: "p", text: "Wv = (2×1 + (−1)×3, 1×1 + 1×3) = **(−1, 4)**; bias = (−1)×1 + 0.5×3 − 0.5 = **0**. (For x = (1, −1) that gives −1 − 4 = −5, the linear network’s output.)" },
      { type: "p", text: "Layer 1: 2×2 weights + 2 biases = 6. Layer 2: 2 weights + 1 bias = 3. Total **9**." },
    ],
  },

  quiz: [
    {
      question: "A layer maps a batch of shape (32, 10) to (32, 64). In NumPy form Z = XW + b, what is the shape of W?",
      options: ["(64, 10)", "(10, 64)", "(32, 64)", "(64,)"],
      answer: 1,
      explanation: "W must turn 10 features into 64 units: (10, 64). PyTorch’s nn.Linear(10, 64) stores the transpose, (64, 10).",
    },
    {
      question: "Why is a network of five linear layers with no activations no more powerful than one linear layer?",
      options: [
        "Its gradients vanish",
        "A product of matrices is a matrix, so the whole stack is one affine map",
        "It has too few parameters",
        "Biases cancel out between layers",
      ],
      answer: 1,
      explanation: "Each layer is an affine map, and composing affine maps gives another affine map: X(W₁W₂…) + (a combined bias).",
    },
    {
      question: "What is the largest possible slope of the sigmoid function?",
      options: ["1", "0.5", "0.25", "It has no maximum"],
      answer: 2,
      explanation: "σ′(z) = σ(z)(1 − σ(z)), which is largest at z = 0 where it equals 0.5 × 0.5 = 0.25.",
    },
    {
      question: "In the experiment, three of four ReLU units output 0 for every training point. What happens to their weights during further training?",
      options: ["They grow quickly", "They stop changing, because their gradients are 0", "They become negative", "They copy the active unit"],
      answer: 1,
      explanation: "A ReLU with negative input has slope 0, so no gradient flows to its weights or bias: a dead unit stays dead.",
    },
    {
      question: "Which activation is z·Φ(z), with Φ the normal cumulative distribution function?",
      options: ["ReLU", "tanh", "GELU", "softmax"],
      answer: 2,
      explanation: "GELU weights each input by the probability that a standard normal value is below it. It is a smooth relative of ReLU.",
    },
  ],

  glossary: [
    { term: "Layer (dense, fully connected)", definition: "A set of units that all read the same inputs; computed as Z = XW + b followed by an activation." },
    { term: "Hidden layer", definition: "Any layer between the input and the output layer." },
    { term: "Width", definition: "The number of units in a layer." },
    { term: "Depth", definition: "The number of layers with weights in a network." },
    { term: "Activation function", definition: "A non-linear function applied element-wise after a layer’s weighted sums." },
    { term: "Saturation", definition: "The flat region of an activation where its slope is close to zero, as for sigmoid and tanh at large |z|." },
    { term: "Dead ReLU", definition: "A ReLU unit whose input is negative for every example, so it outputs 0 and receives no gradient." },
    { term: "GELU", definition: "Gaussian Error Linear Unit, z·Φ(z): a smooth variant of ReLU common in transformers." },
    { term: "Universal approximation theorem", definition: "One hidden layer with enough units can approximate any continuous function on a bounded region; it does not say how to find the weights." },
  ],

  references: [
    {
      title: "Deep Learning, chapter 6 (Deep Feedforward Networks)",
      source: "Goodfellow, Bengio & Courville, MIT Press, 2016",
      url: "https://www.deeplearningbook.org/",
      note: "Hidden units, activation choices, architecture design and the universal approximation theorem.",
    },
    {
      title: "Gaussian Error Linear Units (GELUs)",
      source: "Dan Hendrycks & Kevin Gimpel, arXiv:1606.08415",
      url: "https://arxiv.org/abs/1606.08415",
      note: "Defines GELU as x·Φ(x) and compares it with ReLU.",
    },
    {
      title: "Delving Deep into Rectifiers: Surpassing Human-Level Performance on ImageNet Classification",
      source: "Kaiming He, Xiangyu Zhang, Shaoqing Ren & Jian Sun, ICCV 2015 (arXiv:1502.01852)",
      url: "https://arxiv.org/abs/1502.01852",
      note: "Introduces an initialisation designed for ReLU networks, which keeps signals from shrinking or growing layer by layer.",
    },
    {
      title: "torch.nn.Linear",
      source: "PyTorch documentation",
      url: "https://docs.pytorch.org/docs/stable/generated/torch.nn.Linear.html",
      note: "The dense layer, its (out, in) weight shape and its default initialisation.",
    },
  ],

  next: [
    { pathSlug: "deep-learning", topicSlug: "forward-propagation", reason: "Push a whole batch through several layers and track every shape." },
    { pathSlug: "deep-learning", topicSlug: "backpropagation", reason: "How the activation’s slope decides the gradients each layer receives." },
    { pathSlug: "math-foundations", topicSlug: "vectors-matrices-tensors", reason: "The shape rules behind XW + b." },
  ],

  teaching: {
    notes: [
      "Do the worked example’s collapse on the board: computing Wv by hand convinces students more than any argument.",
      "Run the experiment with no activation before showing any working network; let students predict what extra units will do.",
      "Keep the universal approximation theorem brief and stress what it does not promise.",
    ],
    demo: "Draw XOR’s four corners on the board. Ask one student for a single straight line that separates them (impossible), then ask two students for one line each. Show that an output unit can combine the two lines’ answers: that is a hidden layer with two units.",
    discussion: [
      "If two linear layers equal one, why might a network still use a linear layer with no activation somewhere (for example, the last layer)?",
      "Why might a network with more units than it needs train more reliably, as with 8 ReLU units on XOR?",
      "What would a network with sigmoid in every hidden layer find hard when it is twenty layers deep?",
    ],
    misconceptions: [
      "Thinking depth alone adds power, regardless of activation.",
      "Believing a dead ReLU will come back to life on its own.",
      "Assuming 100% training accuracy means the network will do well on new data.",
    ],
    challenge: {
      prompt:
        "With ReLU units, write a network with one hidden layer of two units that outputs |x| for any single number x. Give the weights and biases, and explain why no network without an activation can do this.",
      answer: [
        { type: "p", text: "Hidden units: h₁ = ReLU(x) and h₂ = ReLU(−x) (weights 1 and −1, biases 0). Output: h₁ + h₂ (weights 1 and 1, bias 0)." },
        { type: "p", text: "For x ≥ 0 this is x + 0 = x; for x < 0 it is 0 + (−x) = −x. Both cases give |x|." },
        { type: "p", text: "Without an activation, the network is a·x + c for some a and c — a straight line — but |x| has a corner at 0, so no straight line matches it everywhere." },
      ],
    },
  },
};
