import type { Lesson } from "../../types/content";

/*
 * Forward propagation. Every number comes from the hand-set network in
 * src/lib/forward-example.ts and is checked in tests/deep-learning.test.ts; the code
 * output was produced by running the script with NumPy and PyTorch.
 */
export const forwardPropagation: Lesson = {
  id: "forward-propagation",
  pathSlug: "deep-learning",
  topicSlug: "forward-propagation",
  title: "Forward propagation",
  summary:
    "A forward pass sends a batch through the network one layer at a time: multiply, add the bias, activate, repeat, and turn the last numbers into probabilities. Writing down every shape on the way is the habit that prevents most bugs.",
  level: "intermediate",
  minutes: [40, 55],
  objectives: [
    "Compute a **forward pass** through a two-layer network by hand",
    "Track the **shape** of every array, and say which dimension is the **batch**",
    "Turn logits into probabilities with **softmax**, computed stably",
    "Implement the same forward pass in **NumPy** and in **PyTorch**, and count its parameters",
  ],
  prerequisites: [
    { label: "Neural network layers and activations", href: "/learn/deep-learning/layers-activations" },
    { label: "Vectors, matrices and tensors", href: "/learn/math-foundations/vectors-matrices-tensors" },
    { label: "NumPy arrays and PyTorch tensors (for the code section)" },
  ],

  intro: [
    {
      type: "p",
      text: "Every prediction a network makes, and every training step it takes, starts with a **forward pass**: the input goes into the first layer, that layer’s output goes into the second, and so on until the last layer produces the answer.",
    },
    {
      type: "p",
      text: "In this lesson you will follow four examples through a small network — three inputs, four hidden units, two outputs — and see every number and every shape along the way.",
    },
  ],

  why: [
    {
      type: "p",
      text: "Shape errors are the most common bug in deep-learning code, and the fastest way to find them is to know what shape each array should have. A forward pass written out with its shapes is also how you estimate how much memory and computation a model needs.",
    },
    {
      type: "p",
      text: "Training depends on it too. The backward pass in the next lessons reuses the values computed on the way forward — the sums and activations of every layer — so understanding the forward pass is the first half of understanding backpropagation.",
    },
  ],

  explanation: {
    beginner: [
      {
        type: "p",
        text: "Think of each layer as a station on a production line. A tray arrives holding several items (the **batch**); the station does exactly the same thing to every item and passes the tray on. Nothing about one item affects another.",
      },
      {
        type: "p",
        text: "At the first station each item has 3 numbers. The station computes 4 weighted sums for each item, so the tray leaves with 4 numbers per item. The ReLU station sets every negative number to 0. The next station turns the 4 numbers into 2, and the last station turns those 2 into probabilities that add up to 1.",
      },
      {
        type: "p",
        text: "That is the whole forward pass. The number of items on the tray never changes; only the number of values per item does, at each layer with weights.",
      },
    ],
    technical: [
      {
        type: "p",
        text: "For a batch X ∈ ℝ^(B×3), the network computes Z₁ = XW₁ + b₁ ∈ ℝ^(B×4), H = ReLU(Z₁), Z₂ = HW₂ + b₂ ∈ ℝ^(B×2) and P = softmax(Z₂), with softmax applied to each row. The first dimension, B, is carried through unchanged: rows are independent, so changing the batch size changes no example’s output.",
      },
      {
        type: "p",
        text: "Z₂ holds the **logits**, unnormalised scores. Softmax turns a row z into probabilities pₖ = e^(zₖ) ÷ Σⱼ e^(zⱼ). Subtracting the row’s maximum before exponentiating gives the same result and avoids overflow; PyTorch’s cross-entropy loss takes the logits directly and does this internally.",
      },
      {
        type: "p",
        text: "The network has 3×4 + 4 + 4×2 + 2 = 26 parameters and costs 3×4 + 4×2 = 20 multiply-adds per example. Deep-learning frameworks express the layers exactly this way; PyTorch’s `nn.Linear` stores each weight transposed, as (out, in).",
      },
      {
        type: "p",
        text: "During training the framework keeps Z₁, H and the other intermediate arrays in memory, because the backward pass needs them. That stored activation memory grows with the batch size, and it is often what limits how large a batch fits on a GPU.",
      },
    ],
  },

  analogy: {
    title: "A tray on a production line",
    blocks: [
      {
        type: "p",
        text: "Each station works on the whole tray at once but on every item separately. Adding items to the tray makes the station busier, not different. In a network, that is why a batch dimension can be any size: the weights are shared by every example in it.",
      },
      {
        type: "p",
        text: "The analogy leaves out one thing: a real network’s stations are tuned by training, and some layers (batch normalisation, attention) do look across items or positions — which is exactly why their shapes need extra care.",
      },
    ],
  },

  workedExample: {
    title: "Example 1, all the way through",
    blocks: [
      {
        type: "p",
        text: "Example 1 is x = (1.0, 0.5, 2.0). The weights are those in the experiment (set by hand so every number has two decimals).",
      },
      {
        type: "table",
        caption: "Layer 1: each hidden unit’s sum, then ReLU",
        head: ["Unit", "Sum: x · column of W₁ + bias", "z", "ReLU"],
        rows: [
          ["1", "1×0.5 + 0.5×1.0 + 2×(−0.4) + 0.1", "0.30", "0.30"],
          ["2", "1×(−1.0) + 0.5×0.5 + 2×0.2 + 0.0", "−0.35", "0"],
          ["3", "1×0.3 + 0.5×(−0.6) + 2×0.9 − 0.2", "1.60", "1.60"],
          ["4", "1×0.8 + 0.5×0.0 + 2×(−0.5) + 0.3", "0.10", "0.10"],
        ],
      },
      {
        type: "table",
        caption: "Layer 2 and softmax",
        head: ["Output", "Sum: h · column of W₂ + bias", "logit", "probability"],
        rows: [
          ["1", "0.30×0.7 + 0×(−0.5) + 1.60×0.4 + 0.10×0.9 + 0.0", "0.94", "e^0.94 ÷ (e^0.94 + e^0.96) = 0.495"],
          ["2", "0.30×(−0.3) + 0×0.8 + 1.60×0.6 + 0.10×(−1.1) + 0.2", "0.96", "0.505"],
        ],
      },
      {
        type: "p",
        text: "The network narrowly prefers class 2. Unit 2’s sum was negative, so ReLU switched it off and its weights in layer 2 played no part for this example. The two probabilities add to 1, as softmax guarantees.",
      },
    ],
  },

  math: {
    blocks: [
      { type: "equation", expression: "Z₁ = XW₁ + b₁   (B×3)·(3×4) + (4) → (B×4)", meaning: "Layer 1: the bias is broadcast across the B rows." },
      { type: "equation", expression: "H = ReLU(Z₁)   (B×4) → (B×4)", meaning: "The activation keeps the shape." },
      { type: "equation", expression: "Z₂ = HW₂ + b₂   (B×4)·(4×2) + (2) → (B×2)", meaning: "Layer 2 produces the logits." },
      { type: "equation", expression: "Pᵢₖ = e^(Z₂ᵢₖ − mᵢ) ÷ Σⱼ e^(Z₂ᵢⱼ − mᵢ),   mᵢ = maxⱼ Z₂ᵢⱼ", meaning: "Softmax of each row; subtracting the row maximum changes nothing mathematically and prevents overflow." },
      { type: "equation", expression: "parameters = (3×4 + 4) + (4×2 + 2) = 26", meaning: "Every weight and bias, counted once." },
    ],
    notation: [
      { symbol: "B", meaning: "Batch size: the number of examples processed together" },
      { symbol: "X", meaning: "Input batch, B × 3" },
      { symbol: "W₁, b₁, W₂, b₂", meaning: "Weights (in × out) and biases of the two layers" },
      { symbol: "Z₁, H", meaning: "Hidden-layer sums and activations, B × 4" },
      { symbol: "Z₂, P", meaning: "Logits and probabilities, B × 2" },
    ],
  },

  process: {
    title: "A forward pass, layer by layer",
    steps: [
      { title: "Check the input shape", text: "(batch, features). Make sure features are columns and the batch is the first dimension." },
      { title: "Layer 1 sums", text: "Z₁ = XW₁ + b₁. The inner dimensions (3 and 3) must match; the result is (batch, 4)." },
      { title: "Activate", text: "H = ReLU(Z₁), same shape. Some values become 0." },
      { title: "Layer 2 sums", text: "Z₂ = HW₂ + b₂, giving the logits, (batch, 2)." },
      { title: "Turn logits into probabilities", text: "Softmax each row — or, during training, hand the logits straight to the loss." },
      { title: "Read the prediction", text: "The class with the largest probability (equivalently, the largest logit)." },
    ],
  },

  interactive: {
    component: "forward-lab",
    kind: "computation",
    intro:
      "The network above, computed in your browser. Choose a batch size, pick any number in any array to see how it was computed, and change an example’s inputs to watch every later number follow.",
    tryThis: [
      "With the defaults, read the trace for unit 3 of layer 1 and check it against the worked example.",
      "Trace unit 2 in the ReLU step for example 1. Why is it 0?",
      "Trace output 1 in the softmax step for example 1, then for example 3. Which example is the network most sure about?",
      "Change the batch size from 4 to 1. Which numbers in example 1’s row change? Which shapes change?",
      "For example 1, set x₃ to 0. Which hidden units switch on or off, and does the predicted class change?",
    ],
    expect: [
      { action: "Layer 1, example 1, unit 3", result: "1.00×0.30 + 0.50×(−0.60) + 2.00×0.90 + (−0.20) = 1.60." },
      { action: "ReLU, example 1, unit 2", result: "max(0, −0.35) = 0: a negative sum is switched off. 7 of the 16 hidden values are 0." },
      { action: "Softmax, examples 1 and 3", result: "Example 1: 0.495 and 0.505 (barely class 2). Example 3: 0.998 for class 1." },
      { action: "Batch size 1", result: "Example 1’s numbers are unchanged; every shape starts with 1 instead of 4." },
      { action: "Example 1 with x₃ = 0", result: "Hidden values (1.10, 0, 0, 1.10); logits (1.76, −1.34); class 1 with probability 0.957." },
    ],
  },

  code: {
    label: "forward.py",
    language: "Python",
    source: `import numpy as np
import torch
from torch import nn

X = np.array([[1.0, 0.5, 2.0], [0.0, 1.0, 1.0],
              [2.0, 1.5, 0.0], [0.5, 0.0, 1.5]])
W1 = np.array([[0.5, -1.0, 0.3, 0.8],
               [1.0, 0.5, -0.6, 0.0],
               [-0.4, 0.2, 0.9, -0.5]])
b1 = np.array([0.1, 0.0, -0.2, 0.3])
W2 = np.array([[0.7, -0.3], [-0.5, 0.8], [0.4, 0.6], [0.9, -1.1]])
b2 = np.array([0.0, 0.2])

def softmax(Z):
    E = np.exp(Z - Z.max(axis=1, keepdims=True))  # subtract each row's max
    return E / E.sum(axis=1, keepdims=True)

Z1 = X @ W1 + b1        # (4, 3) @ (3, 4) + (4,) -> (4, 4)
H = np.maximum(Z1, 0)   # ReLU
Z2 = H @ W2 + b2        # (4, 4) @ (4, 2) + (2,) -> (4, 2)
P = softmax(Z2)
print([A.shape for A in (Z1, H, Z2, P)])
print(P.round(3))

# The same network in PyTorch. nn.Linear stores weights as (out, in).
net = nn.Sequential(nn.Linear(3, 4), nn.ReLU(), nn.Linear(4, 2))
with torch.no_grad():
    net[0].weight.copy_(torch.tensor(W1.T)); net[0].bias.copy_(torch.tensor(b1))
    net[2].weight.copy_(torch.tensor(W2.T)); net[2].bias.copy_(torch.tensor(b2))
    logits = net(torch.tensor(X, dtype=torch.float32))
print(torch.softmax(logits, dim=1).numpy().round(3))
print(sum(p.numel() for p in net.parameters()), "parameters")`,
    walkthrough: [
      { lines: "5–12", text: "The batch and the hand-set weights from the experiment, in NumPy’s (in, out) layout." },
      { lines: "14–16", text: "A stable softmax: subtracting each row’s maximum leaves the probabilities unchanged but keeps e^z from overflowing." },
      { lines: "18–21", text: "The forward pass, one line per step, with the shapes in comments." },
      { lines: "26–30", text: "The same network as nn.Sequential. Copying W.T into each layer converts to PyTorch’s (out, in) layout; no_grad tells PyTorch not to track these operations for gradients." },
      { lines: "31–32", text: "PyTorch gives the same probabilities, and counts the 26 parameters." },
    ],
    shapes: [
      { name: "X", shape: "(4, 3)", meaning: "4 examples × 3 features" },
      { name: "W1 / net[0].weight", shape: "(3, 4) / (4, 3)", meaning: "NumPy (in, out) and PyTorch (out, in) layouts of the same weights" },
      { name: "Z1, H", shape: "(4, 4)", meaning: "4 examples × 4 hidden units" },
      { name: "Z2, P", shape: "(4, 2)", meaning: "4 examples × 2 classes" },
    ],
    output: {
      label: "Output",
      text: "[(4, 4), (4, 4), (4, 2), (4, 2)]\n[[0.495 0.505]\n [0.394 0.606]\n [0.998 0.002]\n [0.387 0.613]]\n[[0.495 0.505]\n [0.394 0.606]\n [0.998 0.002]\n [0.387 0.613]]\n26 parameters",
      note: "Produced by running the script with NumPy and PyTorch. PyTorch computes in 32-bit floats, NumPy in 64-bit; at three decimals they agree, and both match the experiment.",
    },
  },

  useCases: [
    {
      title: "Every prediction in production",
      text: "Serving a model means running forward passes, often on batches of requests grouped together so the matrix multiplications use the hardware efficiently.",
    },
    {
      title: "Debugging shape errors",
      text: "Printing the shape after each layer, as in the code, is the quickest way to find where a mismatch starts — for example a flattened image of 784 values meeting a layer that expects 3,072.",
    },
    {
      title: "Estimating cost",
      text: "Multiply-adds per example and stored activations per example, both read off a written-out forward pass, tell you roughly how fast a model will run and how large a batch fits in memory.",
    },
  ],

  mistakes: [
    {
      kind: "mistake",
      title: "Examples in the wrong dimension",
      text: "A (3, 4) array of 4 examples with 3 features each, fed to a layer expecting (batch, 3), either fails or — if the numbers happen to line up — silently treats features as examples. Keep the batch first.",
    },
    {
      kind: "mistake",
      title: "Applying softmax before a cross-entropy loss",
      text: "PyTorch’s `nn.CrossEntropyLoss` expects logits and applies log-softmax itself. Passing probabilities applies softmax twice, which trains, but badly.",
    },
    {
      kind: "mistake",
      title: "An unstable softmax",
      text: "exp(1000) overflows to infinity. Subtract each row’s maximum first, or use the framework’s softmax, which does this for you.",
    },
    {
      kind: "misconception",
      title: "“The batch size changes the predictions”",
      text: "For dense layers each row is computed independently, so it does not. Layers that compute statistics across the batch, such as batch normalisation in training mode, are the exception.",
    },
    {
      kind: "limitation",
      title: "Hand-set weights",
      text: "This lesson’s weights were chosen for readable arithmetic. A trained network’s weights come from data, and its hidden units rarely have a meaning you can name.",
    },
  ],

  exercise: {
    prompt: [
      { type: "p", text: "Use the lesson’s network (weights in the experiment) for a new example x = (1, 1, 1)." },
      {
        type: "list",
        ordered: true,
        items: [
          "Compute the four hidden sums and their ReLU values.",
          "Compute the two logits and the probability of class 1.",
          "A batch of 64 such examples goes through. Give the shape of X, Z₁, H, Z₂ and P.",
          "If the hidden layer had 100 units instead of 4, how many parameters would the network have?",
        ],
      },
    ],
    hints: [
      "With every input equal to 1, each hidden sum is the column total of W₁ plus the bias.",
      "Probability of class 1 = 1 ÷ (1 + e^(z₂ − z₁)).",
      "Weights: 3 × 100 and 100 × 2; biases: 100 and 2.",
    ],
    solution: [
      { type: "p", text: "Sums: 0.5 + 1.0 − 0.4 + 0.1 = **1.2**; −1.0 + 0.5 + 0.2 + 0 = **−0.3**; 0.3 − 0.6 + 0.9 − 0.2 = **0.4**; 0.8 + 0 − 0.5 + 0.3 = **0.6**. ReLU: (1.2, 0, 0.4, 0.6)." },
      { type: "p", text: "Logit 1 = 1.2×0.7 + 0.4×0.4 + 0.6×0.9 + 0 = **1.54**. Logit 2 = 1.2×(−0.3) + 0.4×0.6 + 0.6×(−1.1) + 0.2 = **−0.58**. P(class 1) = 1 ÷ (1 + e^(−2.12)) ≈ **0.893**." },
      { type: "p", text: "X (64, 3); Z₁ and H (64, 4); Z₂ and P (64, 2)." },
      { type: "p", text: "3×100 + 100 + 100×2 + 2 = **602** parameters." },
    ],
  },

  quiz: [
    {
      question: "A batch X of shape (32, 3) enters a layer with W of shape (3, 4). What is the shape of XW + b?",
      options: ["(3, 4)", "(32, 3)", "(32, 4)", "(4, 32)"],
      answer: 2,
      explanation: "(32, 3) @ (3, 4) gives (32, 4); the bias (4,) is broadcast across the 32 rows.",
    },
    {
      question: "You change the batch size from 4 to 1 and keep example 1. What happens to example 1’s probabilities?",
      options: ["They change slightly", "They stay exactly the same", "They become 0.5 each", "They are recomputed with new weights"],
      answer: 1,
      explanation: "Dense layers process each row independently with the same weights, so a row’s outputs do not depend on the other rows.",
    },
    {
      question: "Why does a stable softmax subtract each row’s maximum before exponentiating?",
      options: [
        "To make the probabilities sum to 1",
        "To avoid overflow; the result is mathematically unchanged",
        "To make the largest logit win",
        "To speed up training",
      ],
      answer: 1,
      explanation: "Multiplying top and bottom by e^(−max) cancels out, but keeps every exponent ≤ 0 so e^z never overflows.",
    },
    {
      question: "In PyTorch, nn.Linear(3, 4) stores its weight with which shape?",
      options: ["(3, 4)", "(4, 3)", "(4,)", "(3,)"],
      answer: 1,
      explanation: "PyTorch stores (out_features, in_features) and computes x Wᵀ + b.",
    },
    {
      question: "How many parameters does a network 10 → 20 → 3 (dense layers with biases) have?",
      options: ["230", "283", "260", "33"],
      answer: 1,
      explanation: "10×20 + 20 = 220 for the first layer and 20×3 + 3 = 63 for the second: 283 in total.",
    },
  ],

  glossary: [
    { term: "Forward pass", definition: "Computing a network’s output from its input, layer by layer." },
    { term: "Batch", definition: "A group of examples processed together; the first dimension of every array in the pass." },
    { term: "Logits", definition: "The final layer’s raw scores, before softmax or sigmoid." },
    { term: "Softmax", definition: "Turns a vector of logits into probabilities: e^(zₖ) ÷ Σ e^(zⱼ)." },
    { term: "Parameters", definition: "Every weight and bias the network learns." },
    { term: "Activations (stored)", definition: "The intermediate values of a forward pass, kept in memory for the backward pass during training." },
    { term: "Multiply-add", definition: "One multiplication and one addition; the basic unit of a layer’s cost." },
  ],

  references: [
    {
      title: "Deep Learning, chapter 6 (Deep Feedforward Networks)",
      source: "Goodfellow, Bengio & Courville, MIT Press, 2016",
      url: "https://www.deeplearningbook.org/",
      note: "Forward propagation in multilayer networks and the computational graph view used for back-propagation.",
    },
    {
      title: "torch.nn.Linear",
      source: "PyTorch documentation",
      url: "https://docs.pytorch.org/docs/stable/generated/torch.nn.Linear.html",
      note: "Why PyTorch weights are (out, in), and how the layer computes x Wᵀ + b.",
    },
    {
      title: "Broadcasting",
      source: "NumPy documentation",
      url: "https://numpy.org/doc/stable/user/basics.broadcasting.html",
      note: "The rule that adds a (4,) bias to every row of a (B, 4) array.",
    },
  ],

  next: [
    { pathSlug: "deep-learning", topicSlug: "loss-functions", reason: "Score the probabilities against the right answers." },
    { pathSlug: "deep-learning", topicSlug: "backpropagation", reason: "Run the pass backwards to get every gradient." },
    { pathSlug: "math-foundations", topicSlug: "vectors-matrices-tensors", reason: "Shape and broadcasting rules in more depth." },
  ],

  teaching: {
    notes: [
      "Have students write the shapes before any numbers; then fill in example 1 together.",
      "Use batch size 1 in the experiment to make the point that rows are independent.",
      "Point out that unit 2 is switched off for example 1 but not for example 2: ReLU decisions are per example.",
    ],
    demo: "Give four students one example card each and four students one hidden unit each (a column of W₁). Each unit-student computes their sum for every example on the board, making Z₁ as a 4 × 4 grid. Then cross out the negatives (ReLU).",
    discussion: [
      "Why do frameworks put the batch dimension first?",
      "Which arrays from the forward pass would you need to keep to compute gradients later, and what does that mean for memory?",
      "When would a network’s prediction for one example depend on the others in its batch?",
    ],
    misconceptions: [
      "Believing softmax changes which class is predicted (it does not change the order of the logits).",
      "Confusing NumPy’s (in, out) weight layout with PyTorch’s (out, in).",
      "Thinking the batch size is part of the model.",
    ],
    challenge: {
      prompt:
        "Without recomputing anything, explain why adding the same number c to both biases in b₂ cannot change any prediction or probability — and why adding c to only one of them can.",
      answer: [
        { type: "p", text: "Adding c to both logits of a row multiplies every e^z by e^c, which cancels in softmax’s ratio: the probabilities are unchanged." },
        { type: "p", text: "Adding c to only one logit changes the difference between them, and softmax depends only on differences — so that class’s probability rises (for c > 0) for every example, and some predictions can flip." },
      ],
    },
  },
};
