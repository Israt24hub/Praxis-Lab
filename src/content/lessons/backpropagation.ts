import type { Lesson } from "../../types/content";

/*
 * Backpropagation. Lab numbers come from src/lib/backprop.ts and are checked in
 * tests/deep-learning.test.ts; the code output was produced by running the script with
 * NumPy and PyTorch.
 */
export const backpropagation: Lesson = {
  id: "backpropagation",
  pathSlug: "deep-learning",
  topicSlug: "backpropagation",
  title: "Backpropagation",
  summary:
    "Backpropagation is the chain rule, applied layer by layer from the loss back to the first weights. One backward pass gives the gradient of every parameter — and the same multiplications explain why deep networks can stop learning.",
  level: "intermediate",
  minutes: [55, 75],
  objectives: [
    "Compute every gradient of a **two-layer network** by hand, starting from ∂L/∂z = ŷ − y",
    "Explain why one **backward pass** is enough for all parameters, and what it reuses from the forward pass",
    "Check hand-computed gradients against **finite differences** and against **PyTorch autograd**",
    "Explain **vanishing and exploding gradients** as a product of per-layer factors",
  ],
  prerequisites: [
    { label: "Derivatives and gradients", href: "/learn/math-foundations/derivatives-gradients" },
    { label: "Forward propagation", href: "/learn/deep-learning/forward-propagation" },
    { label: "Loss functions", href: "/learn/deep-learning/loss-functions" },
  ],

  intro: [
    {
      type: "p",
      text: "To train a network we need, for every weight, the answer to one question: if this weight increased slightly, would the loss go up or down, and by how much? That is the gradient. A network with a million weights needs a million of them, at every step.",
    },
    {
      type: "p",
      text: "**Backpropagation** computes them all in one sweep backwards through the network, at roughly the cost of a second forward pass. It is not a separate learning algorithm: it is the chain rule from calculus, organised so that no work is repeated.",
    },
  ],

  why: [
    {
      type: "p",
      text: "Without it, you could estimate each gradient by nudging one weight and re-running the network — two forward passes per weight, so two million passes per step for a million weights. Backpropagation makes training large networks possible at all.",
    },
    {
      type: "p",
      text: "Understanding it also explains how training fails. The gradient reaching an early layer is a product of one factor per later layer; if those factors are small, early layers barely learn (vanishing gradients), and if they are large, updates blow up (exploding gradients). Activations, initialisation and normalisation are all chosen with this product in mind.",
    },
    {
      type: "callout",
      tone: "note",
      title: "A little history",
      text: "Rumelhart, Hinton and Williams’ 1986 paper in Nature showed that back-propagating errors lets hidden layers learn useful internal representations. The underlying idea — reverse-mode differentiation — had appeared earlier in other fields; the 1986 paper made it the standard way to train neural networks.",
    },
  ],

  explanation: {
    beginner: [
      {
        type: "p",
        text: "Imagine a relay of people, each multiplying a number before passing it on. At the end, the final number is compared with a target. To know how much the first person’s choice mattered, you multiply together how much each later person amplified or shrank what they received. Backpropagation does this multiplication once, from the end towards the start, and hands each person their share on the way.",
      },
      {
        type: "p",
        text: "It starts at the loss. For a sigmoid output with cross-entropy, the first number is beautifully simple: prediction minus target. A prediction of 0.445 when the answer was 1 gives −0.555 — “the output should go up”.",
      },
      {
        type: "p",
        text: "Each weight feeding the output gets that number multiplied by what flowed through the weight on the way forward. Each hidden unit gets it multiplied by the weight connecting it to the output — and then by its activation’s slope. Then the same rule repeats one layer further back.",
      },
      {
        type: "p",
        text: "Because every step multiplies by an activation slope, a long chain of small slopes makes the number reaching the first layer tiny. That is the vanishing gradient problem, and you can watch it happen in the experiment.",
      },
    ],
    technical: [
      {
        type: "p",
        text: "Write the network as Z₁ = XW₁ + b₁, H = φ(Z₁), Z₂ = HW₂ + b₂, with loss L(Z₂). Backpropagation computes δ₂ = ∂L/∂Z₂ and then, for each layer from the last to the first: ∂L/∂W = Aᵀδ, ∂L/∂b = Σ_rows δ, and the signal for the layer below, ∂L/∂A = δWᵀ, followed by δ = ∂L/∂A ⊙ φ′(Z) for that layer.",
      },
      {
        type: "p",
        text: "Every quantity needed — the layer inputs A and the pre-activations Z — was computed in the forward pass and stored. Each backward step costs about as much as the corresponding forward step, so a full gradient costs a small constant times one forward pass, independent of the number of parameters. This is reverse-mode automatic differentiation; PyTorch’s autograd records the forward operations and replays their derivatives in reverse when you call `backward()`.",
      },
      {
        type: "p",
        text: "For sigmoid outputs with binary cross-entropy (or softmax with cross-entropy), δ₂ = ŷ − y. For a sigmoid hidden layer φ′(z) = h(1 − h); for tanh, 1 − h²; for ReLU, 1 when z > 0 and 0 otherwise.",
      },
      {
        type: "p",
        text: "The gradient reaching layer l contains the product of Wₖ and φ′(Zₖ) for every later layer k. With sigmoid, φ′ ≤ 0.25, so with modest weights this product shrinks geometrically with depth. With ReLU, φ′ is 0 or 1, so the size of the product is governed by the weights — which is why initialisation schemes scale weights to each layer’s size (Glorot for tanh, He for ReLU).",
      },
    ],
  },

  analogy: {
    title: "Tracing blame through a kitchen",
    blocks: [
      {
        type: "p",
        text: "A dish comes back too salty. The head chef asks the sauce station how much salt it added, the sauce station asks the stock station, and so on. Each station’s share of the blame is the blame passed to it, times how much its own output affected what it passed on. One walk backwards through the kitchen assigns blame to every station.",
      },
      {
        type: "p",
        text: "The analogy breaks in one place: in a network, “blame” is a signed, exact number for every weight, and every station is adjusted a little at the same time, not just the one most to blame.",
      },
    ],
  },

  workedExample: {
    title: "A 2 → 2 → 1 network, forward and backward",
    blocks: [
      {
        type: "p",
        text: "Input x = (1, 2), target y = 1. Hidden layer: W₁ = [[0.5, −0.3], [0.2, 0.8]] (row i is input i), b₁ = (0.1, −0.1), sigmoid. Output: W₂ = (1.0, −1.5), b₂ = 0.2, sigmoid, binary cross-entropy. These are the experiment’s starting values.",
      },
      {
        type: "table",
        caption: "Forward pass",
        head: ["Quantity", "Calculation", "Value"],
        rows: [
          ["z of h₁", "1×0.5 + 2×0.2 + 0.1", "1.0"],
          ["z of h₂", "1×(−0.3) + 2×0.8 − 0.1", "1.2"],
          ["h = σ(z)", "σ(1.0), σ(1.2)", "0.7311, 0.7685"],
          ["output z", "0.7311×1.0 + 0.7685×(−1.5) + 0.2", "−0.2217"],
          ["ŷ = σ(z)", "", "0.4448"],
          ["loss", "−ln 0.4448", "**0.8101**"],
        ],
      },
      {
        type: "table",
        caption: "Backward pass, one layer at a time",
        head: ["Gradient", "Rule", "Value"],
        rows: [
          ["∂L/∂z (output)", "ŷ − y", "−0.5552"],
          ["∂L/∂W₂", "h × (−0.5552)", "(−0.4059, −0.4267)"],
          ["∂L/∂b₂", "same as ∂L/∂z", "−0.5552"],
          ["∂L/∂h", "W₂ × (−0.5552)", "(−0.5552, 0.8328)"],
          ["∂L/∂z (hidden)", "∂L/∂h × h(1 − h) = ∂L/∂h × (0.1966, 0.1779)", "(−0.1092, 0.1482)"],
          ["∂L/∂W₁", "xᵢ × ∂L/∂zⱼ", "[[−0.1092, 0.1482], [−0.2183, 0.2963]]"],
          ["∂L/∂b₁", "same as ∂L/∂z (hidden)", "(−0.1092, 0.1482)"],
        ],
      },
      {
        type: "p",
        text: "Read the signs: W₂’s first weight has a negative gradient, so increasing it lowers the loss — and h₁ pushes the output towards 1. W₂’s second weight is −1.5, and its negative gradient says “make it less negative”. One gradient-descent step with η = 0.5 moves W₂ to (1.2029, −1.2867) and lowers the loss from 0.8101 to **0.4544**.",
      },
    ],
  },

  math: {
    blocks: [
      { type: "equation", expression: "δ₂ = ∂L/∂z₂ = ŷ − y", meaning: "Where the backward pass starts, for sigmoid with binary cross-entropy (and softmax with cross-entropy)." },
      { type: "equation", expression: "∂L/∂W₂ = Hᵀ δ₂,   ∂L/∂b₂ = Σ_rows δ₂", meaning: "A weight’s gradient is its input times the error signal at its output, summed over the batch." },
      { type: "equation", expression: "∂L/∂H = δ₂ W₂ᵀ", meaning: "The error signal passed to the layer below, through the same weights." },
      { type: "equation", expression: "δ₁ = ∂L/∂H ⊙ φ′(Z₁)", meaning: "Multiply by the activation’s slope (⊙ is element-wise); for sigmoid, φ′ = h(1 − h)." },
      { type: "equation", expression: "∂L/∂W₁ = Xᵀ δ₁,   ∂L/∂b₁ = Σ_rows δ₁", meaning: "The same rule, one layer down." },
      { type: "equation", expression: "∂ output / ∂ (layer 1) ∝ Πₖ wₖ φ′(zₖ)", meaning: "Through a deep chain, one factor per layer: below 1 they vanish, above 1 they explode." },
    ],
    notation: [
      { symbol: "δ", meaning: "∂L/∂Z for a layer: the error signal at its pre-activations" },
      { symbol: "⊙", meaning: "Element-wise multiplication" },
      { symbol: "Hᵀ, Xᵀ", meaning: "Transposed layer inputs, so the batch is summed over" },
      { symbol: "φ′", meaning: "Slope of the activation function" },
      { symbol: "η", meaning: "Learning rate for the gradient-descent step" },
    ],
  },

  process: {
    title: "One training step",
    steps: [
      { title: "Forward", text: "Compute and store every layer’s input, pre-activation and output, then the loss." },
      { title: "Start the backward pass", text: "δ = ∂L/∂(output logits); for cross-entropy, prediction minus target." },
      { title: "Layer gradients", text: "∂L/∂W = (layer input)ᵀ δ and ∂L/∂b = δ summed over the batch." },
      { title: "Pass the signal down", text: "Multiply δ by the weights (transposed), then by the activation’s slope, to get the previous layer’s δ." },
      { title: "Repeat to the first layer", text: "Every parameter now has its gradient." },
      { title: "Update", text: "w ← w − η × gradient for every parameter (or an optimizer such as Adam)." },
    ],
  },

  interactive: {
    component: "backprop-lab",
    kind: "computation",
    intro:
      "Two panels, computed in your browser. The first is the worked example: switch between forward values and gradients, compare every gradient with a finite difference, and take gradient steps. The second multiplies slopes through a deep chain of one-unit layers.",
    tryThis: [
      "With the defaults, switch to “Backward: gradients” and check each number against the worked example.",
      "Read the table: how far apart are backpropagation and the finite differences?",
      "Take one step with η = 0.5, then nine more. Watch the loss.",
      "Reset, change the target to 0, and look at the signs of the gradients.",
      "In panel 2, keep sigmoid and w = 1 and raise the depth from 5 to 10 to 20.",
      "Switch to tanh, then to ReLU, at depth 10 and w = 1. Then try ReLU with w = 2.",
    ],
    expect: [
      { action: "Defaults, forward", result: "Hidden values 0.731 and 0.769, prediction 0.445, loss 0.810." },
      { action: "Defaults, backward", result: "∂L/∂z at the output −0.555; hidden ∂L/∂z −0.109 and 0.148; all nine gradients match the finite differences to about 10⁻¹¹." },
      { action: "One step, η = 0.5", result: "Loss 0.810 → 0.454. After ten steps: 0.077." },
      { action: "Target 0", result: "Loss 0.588; every gradient changes sign compared with target 1 (∂L/∂z at the output becomes +0.445)." },
      { action: "Sigmoid, w = 1, depth 10 and 20", result: "Layer 1’s gradient is 1.9 × 10⁻⁶ of the last layer’s at depth 10, and 6.2 × 10⁻¹³ at depth 20." },
      { action: "Depth 10: tanh, ReLU, ReLU with w = 2", result: "tanh: ratio 0.13. ReLU, w = 1: every layer’s gradient is exactly 1. ReLU, w = 2: every gradient is 512 — exploding." },
    ],
  },

  code: {
    label: "backprop.py",
    language: "Python",
    source: `import numpy as np
import torch
import torch.nn.functional as F

x, y = np.array([1.0, 2.0]), 1.0
W1, b1 = np.array([[0.5, -0.3], [0.2, 0.8]]), np.array([0.1, -0.1])
W2, b2 = np.array([1.0, -1.5]), 0.2
sig = lambda z: 1 / (1 + np.exp(-z))

# Forward, keeping what the backward pass needs
h = sig(x @ W1 + b1)
yhat = sig(h @ W2 + b2)
loss = -(y * np.log(yhat) + (1 - y) * np.log(1 - yhat))

# Backward, by hand
dzo = yhat - y                    # dL/dz at the output
dW2, db2 = h * dzo, dzo
dzh = (W2 * dzo) * h * (1 - h)    # through W2, then the sigmoid's slope
dW1, db1 = np.outer(x, dzh), dzh
print(round(loss, 4), dW1.round(4).tolist(), dW2.round(4).tolist())

# The same gradients from PyTorch autograd
p = {k: torch.tensor(v, dtype=torch.float64, requires_grad=True)
     for k, v in dict(W1=W1, b1=b1, W2=W2, b2=b2).items()}
th = torch.sigmoid(torch.tensor(x) @ p["W1"] + p["b1"])
zo = th @ p["W2"] + p["b2"]
F.binary_cross_entropy_with_logits(zo, torch.tensor(y, dtype=torch.float64)).backward()
for name, mine in dict(W1=dW1, b1=db1, W2=dW2, b2=db2).items():
    print(name, np.allclose(p[name].grad.numpy(), mine))`,
    walkthrough: [
      { lines: "5–8", text: "The worked example’s input, target and starting weights." },
      { lines: "11–13", text: "Forward pass. h and yhat are kept: the backward pass needs them." },
      { lines: "16–19", text: "Backward pass in four lines: the output signal, the output layer’s gradients, the signal through W₂ and the sigmoid’s slope h(1 − h), then the hidden layer’s gradients. np.outer(x, dzh) gives xᵢ × δⱼ for every pair." },
      { lines: "23–27", text: "The same network written with PyTorch tensors that require gradients; backward() runs reverse-mode differentiation automatically." },
      { lines: "28–29", text: "Every hand-computed gradient matches autograd." },
    ],
    shapes: [
      { name: "x, h", shape: "(2,)", meaning: "Inputs and hidden activations for one example" },
      { name: "W1, dW1", shape: "(2, 2)", meaning: "A gradient always has the same shape as its parameter" },
      { name: "W2, dW2", shape: "(2,)", meaning: "One weight per hidden unit" },
      { name: "dzo, b2", shape: "scalar", meaning: "One output" },
    ],
    output: {
      label: "Output",
      text: "0.8101 [[-0.1092, 0.1482], [-0.2183, 0.2963]] [-0.4059, -0.4267]\nW1 True\nb1 True\nW2 True\nb2 True",
      note: "Produced by running the script with NumPy and PyTorch (64-bit floats). The values match the worked example and the experiment.",
    },
  },

  useCases: [
    {
      title: "Every neural network you will train",
      text: "Calling `loss.backward()` in PyTorch runs exactly this algorithm through whatever network you built, from a two-layer perceptron to a large language model.",
    },
    {
      title: "Gradient checking",
      text: "When writing a custom layer or loss by hand, compare its gradients with finite differences on a few random inputs, as the experiment does, before trusting it in training.",
    },
    {
      title: "Diagnosing a network that will not learn",
      text: "Printing each layer’s gradient size shows whether early layers receive almost nothing (vanishing) or huge values (exploding) — a common first check when the loss is stuck or becomes NaN.",
    },
  ],

  mistakes: [
    {
      kind: "mistake",
      title: "Forgetting the activation’s slope",
      text: "Passing the error signal through the weights but not multiplying by φ′(z) gives plausible-looking but wrong gradients. A finite-difference check catches it immediately.",
    },
    {
      kind: "mistake",
      title: "Gradients that keep adding up",
      text: "PyTorch adds each backward() result to `.grad`. Without `optimizer.zero_grad()` before each step, every update uses the sum of all previous gradients.",
    },
    {
      kind: "misconception",
      title: "“Backpropagation is how the brain learns”",
      text: "It is an efficient way to compute derivatives of a formula. Whether brains do anything like it is an open research question, and the algorithm does not depend on the answer.",
    },
    {
      kind: "limitation",
      title: "Gradients are local",
      text: "Backpropagation gives the slope at the current weights only. It says nothing about better weights far away, which is why training can stall in poor regions.",
    },
    {
      kind: "limitation",
      title: "Memory for stored activations",
      text: "The backward pass needs the forward pass’s intermediate values, so training uses far more memory than prediction. Techniques such as gradient checkpointing trade recomputation for memory.",
    },
  ],

  exercise: {
    prompt: [
      { type: "p", text: "Use the worked example’s network and input, but with target y = 0." },
      {
        type: "list",
        ordered: true,
        items: [
          "The forward pass is unchanged. What is the loss now?",
          "Compute ∂L/∂z at the output, ∂L/∂W₂ and ∂L/∂b₂.",
          "Compute the hidden-layer signal ∂L/∂z for both hidden units.",
          "Without computing, how do these compare with the gradients for y = 1?",
        ],
      },
    ],
    hints: [
      "With y = 0 the loss is −ln(1 − ŷ).",
      "∂L/∂z = ŷ − y = 0.4448 − 0.",
      "Multiply by W₂, then by h(1 − h) = (0.1966, 0.1779).",
    ],
    solution: [
      { type: "p", text: "Loss = −ln(1 − 0.4448) = −ln 0.5552 ≈ **0.588**." },
      { type: "p", text: "∂L/∂z = **0.4448**; ∂L/∂W₂ = (0.7311, 0.7685) × 0.4448 ≈ **(0.325, 0.342)**; ∂L/∂b₂ = **0.4448**." },
      { type: "p", text: "∂L/∂h = (1.0, −1.5) × 0.4448 = (0.4448, −0.6672); × (0.1966, 0.1779) ≈ **(0.0875, −0.1187)**." },
      { type: "p", text: "Every gradient has the opposite sign, and is scaled by 0.4448/0.5552: the output error changed from −0.5552 to +0.4448, and every other gradient is that error times the same factors." },
    ],
  },

  quiz: [
    {
      question: "What does one backward pass through a network give you?",
      options: [
        "The gradient of the loss with respect to one chosen weight",
        "The gradient of the loss with respect to every parameter",
        "The new weights after training",
        "The second derivatives of the loss",
      ],
      answer: 1,
      explanation: "Reverse-mode differentiation produces all parameter gradients in one sweep, at a cost similar to a forward pass.",
    },
    {
      question: "For a sigmoid output trained with binary cross-entropy, where does the backward pass start?",
      options: ["ŷ(1 − ŷ)", "ŷ − y", "−ln ŷ", "y / ŷ"],
      answer: 1,
      explanation: "∂L/∂z = ŷ − y: the sigmoid’s slope cancels with the log in the loss.",
    },
    {
      question: "Why must the forward pass keep its intermediate values during training?",
      options: [
        "To print them",
        "Because the backward pass needs layer inputs and pre-activations to compute gradients",
        "To speed up the next forward pass",
        "Because the optimizer reads them",
      ],
      answer: 1,
      explanation: "∂L/∂W uses each layer’s input, and the activation slope uses its pre-activation; both come from the forward pass.",
    },
    {
      question: "A 20-layer network uses sigmoid everywhere. Why might its first layers barely learn?",
      options: [
        "Sigmoid outputs are too large",
        "Each layer multiplies the gradient by a slope of at most 0.25, so it shrinks geometrically",
        "The first layers have fewer weights",
        "Backpropagation skips early layers",
      ],
      answer: 1,
      explanation: "In the experiment, with w = 1, layer 1’s gradient is about 6 × 10⁻¹³ of the last layer’s at depth 20.",
    },
    {
      question: "Your hand-written gradient for one weight is 0.21; a central finite difference gives 0.15. What is most likely?",
      options: ["Finite differences are always inaccurate", "A bug in the hand-written gradient", "The learning rate is too high", "The network is too deep"],
      answer: 1,
      explanation: "A correct gradient agrees with a central difference to many decimal places (about 10⁻¹¹ in the experiment); a gap that large points to a mistake.",
    },
  ],

  glossary: [
    { term: "Backpropagation", definition: "Computing all gradients of a network by applying the chain rule backwards from the loss, reusing forward-pass values." },
    { term: "Chain rule", definition: "The derivative of a composition is the product of the derivatives of its parts." },
    { term: "Error signal (δ)", definition: "∂L/∂z for a layer: how the loss changes with that layer’s pre-activations." },
    { term: "Autograd", definition: "A framework’s automatic differentiation: it records operations in the forward pass and replays their derivatives in reverse." },
    { term: "Finite difference", definition: "Estimating a derivative by evaluating the function at slightly shifted inputs; slow, but a reliable check." },
    { term: "Vanishing gradient", definition: "Gradients that shrink layer by layer until early layers barely change." },
    { term: "Exploding gradient", definition: "Gradients that grow layer by layer until updates are huge or overflow." },
    { term: "Gradient clipping", definition: "Capping the size of gradients before an update, a common guard against explosions." },
  ],

  references: [
    {
      title: "Learning representations by back-propagating errors",
      source: "David E. Rumelhart, Geoffrey E. Hinton & Ronald J. Williams, Nature 323, 533–536, 1986",
      url: "https://mlanthology.org/misc/1986/rumelhart1986misc-learning",
      note: "The paper that made back-propagation the standard way to train networks with hidden layers.",
    },
    {
      title: "Deep Learning, section 6.5 (Back-Propagation and Other Differentiation Algorithms)",
      source: "Goodfellow, Bengio & Courville, MIT Press, 2016",
      url: "https://www.deeplearningbook.org/",
      note: "Computational graphs, the chain rule for tensors, and why reverse mode is efficient.",
    },
    {
      title: "Understanding the difficulty of training deep feedforward neural networks",
      source: "Xavier Glorot & Yoshua Bengio, AISTATS 2010, PMLR 9:249–256",
      url: "https://proceedings.mlr.press/v9/glorot10a",
      note: "Studies how activations and gradients behave across layers, finds sigmoid unsuited to deep networks with random initialisation, and proposes a scaled initialisation.",
    },
    {
      title: "A Gentle Introduction to torch.autograd",
      source: "PyTorch Tutorials",
      url: "https://docs.pytorch.org/tutorials/beginner/blitz/autograd_tutorial.html",
      note: "How PyTorch records the forward pass and accumulates gradients in .grad when backward() is called.",
    },
  ],

  next: [
    { pathSlug: "deep-learning", topicSlug: "gradient-descent-optimizers", reason: "What to do with the gradients: SGD, momentum and Adam." },
    { pathSlug: "deep-learning", topicSlug: "regularization-diagnostics", reason: "Debugging training runs, including gradient problems." },
    { pathSlug: "math-foundations", topicSlug: "derivatives-gradients", reason: "The chain rule inside one neuron, step by step." },
  ],

  teaching: {
    notes: [
      "Do the worked example on the board in two colours: forward values left to right, gradients right to left.",
      "Insist on the shape rule — a gradient has the same shape as its parameter — before any formula.",
      "Use the finite-difference column to build trust: students should see that backprop is not magic but checkable.",
    ],
    demo: "Line up five students. The first multiplies a number by their card (a weight), the next by theirs, and so on. Change the first card slightly and measure the change at the end; then compute the same thing by multiplying the later cards together. Hand out cards of 0.25 to show vanishing.",
    discussion: [
      "Why does backpropagation run from the output backwards rather than from the input forwards?",
      "If every hidden unit started with exactly the same weights, what would their gradients be — and what does that say about initialisation?",
      "What could you change about a 30-layer network to keep its first layers learning?",
    ],
    misconceptions: [
      "Thinking backpropagation updates the weights (it computes gradients; the optimizer updates).",
      "Believing finite differences are a fine way to train (they are a check, far too slow for training).",
      "Assuming vanishing gradients mean the model has converged.",
    ],
    challenge: {
      prompt:
        "In the worked example, both hidden units start with different weights. Suppose instead both hidden units had identical incoming weights and identical outgoing weights. Show that their gradients stay identical at every step, so they can never learn different features.",
      answer: [
        { type: "p", text: "With identical incoming weights and biases, both units compute the same z and the same h for every input." },
        { type: "p", text: "With identical outgoing weights, both receive the same ∂L/∂h; multiplied by the same slope h(1 − h), they get the same δ, and so the same gradients for their incoming weights." },
        { type: "p", text: "Identical gradients give identical updates, so the symmetry is never broken. This is why weights are initialised at random." },
      ],
    },
  },
};
