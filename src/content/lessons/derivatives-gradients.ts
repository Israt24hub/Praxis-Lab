import type { Lesson } from "../../types/content";

/*
 * Every number below was computed with NumPy and is checked against the lab's
 * arithmetic (src/lib/calculus.ts) in tests/lab-math.test.ts.
 */
export const derivativesGradients: Lesson = {
  id: "derivatives-gradients",
  pathSlug: "math-foundations",
  topicSlug: "derivatives-gradients",
  title: "Derivatives and gradients",
  summary:
    "A derivative says how fast an output changes when an input changes; a gradient collects those rates for every parameter at once and points uphill. This lesson builds both from slopes, then follows the chain rule through one neuron — the calculation that backpropagation repeats millions of times.",
  level: "beginner",
  minutes: [45, 60],
  objectives: [
    "Interpret a **derivative** as the slope of a tangent line, and estimate it with a **finite difference**",
    "Compute derivatives of simple functions with the power rule, and of the sigmoid",
    "Describe a **gradient** as the direction of steepest increase",
    "Apply the **chain rule** to a composition, step by step, and check it numerically",
  ],
  prerequisites: [
    { label: "Linear algebra essentials (for the gradient as a vector)", href: "/learn/math-foundations/linear-algebra-essentials" },
    { label: "Graphs of functions such as y = x²" },
  ],

  intro: [
    {
      type: "p",
      text: "Training a model means adjusting its parameters so that the loss goes down. To do that you need to know, for each parameter: if I nudge it up a little, does the loss rise or fall, and by how much? That number is a derivative.",
    },
    {
      type: "p",
      text: "This lesson starts with the slope of a curve, makes it precise, and ends with the chain rule inside a single neuron. Every step is computed exactly and checked numerically in the experiment.",
    },
  ],

  why: [
    {
      type: "p",
      text: "Gradient descent, the method that trains almost every neural network, uses the gradient of the loss to decide each update. Backpropagation is nothing more than the chain rule applied efficiently to the whole network.",
    },
    {
      type: "p",
      text: "Frameworks compute gradients for you, but you still need to read them: a gradient of zero (a dead unit), an exploding gradient, or a check that fails between your code and a finite difference all tell you something is wrong.",
    },
  ],

  explanation: {
    beginner: [
      {
        type: "p",
        text: "**Slope.** For a straight line, slope is rise over run. A curve has a different slope at each point: the slope of the **tangent** line that just touches it there. That slope is the **derivative**, written f′(x) or df/dx.",
      },
      {
        type: "p",
        text: "**Estimating it.** Pick a small step h. The line through (x, f(x)) and (x + h, f(x + h)) — a **secant** — has slope (f(x + h) − f(x)) / h. As h shrinks, the secant turns into the tangent. Using x − h and x + h (a **central** difference) is usually far more accurate for the same h.",
      },
      {
        type: "p",
        text: "**Rules.** You rarely need the limit. The power rule says the derivative of xⁿ is n·xⁿ⁻¹, so x² → 2x and x³ − 3x → 3x² − 3. Derivatives add, and constants multiply through. The sigmoid σ(x) has the neat derivative σ(x)(1 − σ(x)).",
      },
      {
        type: "p",
        text: "**Gradient.** A loss usually depends on many parameters. Change one at a time and you get a **partial derivative** for each. Stack them into a vector and you have the **gradient**, ∇L. It points in the direction in which L increases fastest, and its length is how steep that is. To decrease L, step the opposite way.",
      },
      {
        type: "p",
        text: "**Chain rule.** When one quantity feeds the next — w feeds z, z feeds a, a feeds the loss L — the rates multiply: dL/dw = dL/da × da/dz × dz/dw. Each factor is a simple local derivative.",
      },
    ],
    technical: [
      {
        type: "p",
        text: "f′(x) = lim_{h→0} (f(x + h) − f(x)) / h. Taylor expansion gives the errors of the estimates: the forward difference has error ≈ (h/2)·f″(x), first order in h; the central difference has error ≈ (h²/6)·f‴(x), second order. In floating point, very small h loses accuracy to rounding, so h around 10⁻⁵ to 10⁻⁶ is typical for checks.",
      },
      {
        type: "p",
        text: "For f: ℝⁿ → ℝ, the gradient ∇f = (∂f/∂x₁, …, ∂f/∂xₙ). The directional derivative along a unit vector u is ∇f · u = ‖∇f‖ cos θ, largest when u points along ∇f — which is why −∇f is the direction of steepest descent.",
      },
      {
        type: "p",
        text: "Chain rule: if L = g(h(w)), then dL/dw = g′(h(w))·h′(w); for vector functions the factors become Jacobian matrices. Reverse-mode automatic differentiation (backpropagation) evaluates this product from the loss backwards, reusing intermediate results, so the gradient with respect to all parameters costs a small constant times one forward pass.",
      },
      {
        type: "p",
        text: "For one sigmoid neuron with squared error, z = wx + b, a = σ(z), L = (a − y)²: ∂L/∂w = 2(a − y)·σ(z)(1 − σ(z))·x and ∂L/∂b = 2(a − y)·σ(z)(1 − σ(z)). The σ(1 − σ) factor is at most 0.25 and near 0 when |z| is large — the origin of vanishing gradients in saturated sigmoids.",
      },
    ],
  },

  analogy: {
    title: "Walking on a hillside in fog",
    blocks: [
      {
        type: "p",
        text: "You can’t see the valley, but you can feel the ground under your feet. The steepness in the east–west direction and in the north–south direction are the two partial derivatives. Together they tell you which way is steepest uphill — the gradient — and so which way is steepest downhill.",
      },
      {
        type: "p",
        text: "The chain rule is like a gear train: if gear A turns gear B twice as fast, and B turns C three times as fast, A turns C six times as fast. Rates along a chain multiply.",
      },
    ],
  },

  workedExample: {
    title: "Three slopes and one neuron",
    blocks: [
      {
        type: "p",
        text: "**Finite differences.** For f(x) = x³ − 3x at x = 2, the exact derivative is 3 × 2² − 3 = 9.",
      },
      {
        type: "table",
        caption: "Estimating f′(2) for f(x) = x³ − 3x",
        head: ["Step h", "Forward estimate", "Its error", "Central estimate", "Its error"],
        rows: [
          ["1", "16", "7", "10", "1"],
          ["0.1", "9.61", "0.61", "9.01", "0.01"],
          ["0.01", "9.0601", "0.0601", "9.0001", "0.0001"],
          ["0.001", "9.006001", "0.006", "9.000001", "0.000001"],
        ],
      },
      {
        type: "p",
        text: "Each tenfold cut in h cuts the forward error about tenfold and the central error about a hundredfold.",
      },
      {
        type: "p",
        text: "**A gradient.** For L(w₁, w₂) = w₁² + 3w₂², the partial derivatives are 2w₁ and 6w₂. At (1, 1) the gradient is (2, 6), of length 6.32, pointing 71.6° above the w₁ axis. Moving along w₁ alone, the slope is 2; along w₂ alone, 6; along the gradient’s own direction, 6.32 — the steepest possible.",
      },
      {
        type: "p",
        text: "**The chain rule in a neuron.** Take w = 0.5, b = 0, input x = 2 and target y = 1.",
      },
      {
        type: "table",
        caption: "Forward pass and local derivatives (w = 0.5, b = 0, x = 2, y = 1)",
        head: ["Step", "Value", "Local derivative"],
        rows: [
          ["z = wx + b", "1", "∂z/∂w = x = 2"],
          ["a = σ(z)", "0.7311", "∂a/∂z = a(1 − a) = 0.1966"],
          ["L = (a − y)²", "0.0723", "∂L/∂a = 2(a − y) = −0.5379"],
        ],
      },
      {
        type: "p",
        text: "Multiplying: ∂L/∂w = −0.5379 × 0.1966 × 2 = **−0.2115**, and ∂L/∂b = −0.5379 × 0.1966 = −0.1058. A central finite difference on w gives −0.211508, matching to six decimal places. The negative sign says: increase w to reduce the loss.",
      },
    ],
  },

  math: {
    blocks: [
      { type: "equation", expression: "f′(x) = lim_{h→0} ( f(x + h) − f(x) ) / h", meaning: "The derivative: the limit of secant slopes." },
      { type: "equation", expression: "central difference:  ( f(x + h) − f(x − h) ) / 2h", meaning: "A more accurate estimate; its error shrinks like h²." },
      { type: "equation", expression: "d/dx xⁿ = n·xⁿ⁻¹,   d/dx σ(x) = σ(x)(1 − σ(x))", meaning: "The power rule and the sigmoid’s derivative." },
      { type: "equation", expression: "∇L = ( ∂L/∂w₁, ∂L/∂w₂, …, ∂L/∂wₙ )", meaning: "The gradient: one partial derivative per parameter, stacked into a vector." },
      { type: "equation", expression: "slope in direction u = ∇L · u", meaning: "For a unit vector u. Largest when u points along ∇L." },
      {
        type: "equation",
        expression: "∂L/∂w = ∂L/∂a · ∂a/∂z · ∂z/∂w",
        meaning: "The chain rule along w → z → a → L. Backpropagation evaluates these products from the loss backwards.",
      },
    ],
    notation: [
      { symbol: "f′(x), df/dx", meaning: "The derivative of f at x" },
      { symbol: "∂L/∂w", meaning: "Partial derivative: change w only, hold the rest fixed" },
      { symbol: "∇L", meaning: "The gradient of L (“nabla L”)" },
      { symbol: "h", meaning: "A small step used in a finite difference" },
      { symbol: "σ", meaning: "The sigmoid function 1 / (1 + e⁻ˣ)" },
    ],
  },

  process: {
    title: "Checking a gradient you computed",
    steps: [
      { title: "Write the chain", text: "List the steps from parameter to loss: w → z → a → L." },
      { title: "Differentiate each step", text: "One local derivative per arrow, using the rules." },
      { title: "Multiply along the chain", text: "Evaluate each factor at the current values and multiply." },
      { title: "Check numerically", text: "Compute (L(w + ε) − L(w − ε)) / 2ε with ε ≈ 10⁻⁶ and compare." },
      { title: "Investigate disagreement", text: "A mismatch beyond about 10⁻⁶ relative error usually means a missing factor or a sign error." },
    ],
  },

  interactive: {
    component: "derivatives-lab",
    kind: "computation",
    intro:
      "Two panels, both computed in your browser. In the first, choose a function and a point, then shrink the step h and watch the secant become the tangent. In the second, set a neuron’s weight, bias, input and target and see every factor of the chain rule, checked against a finite difference.",
    tryThis: [
      "Choose x³ − 3x at x = 2. Move h from 1 down to 0.001, watching both errors.",
      "Find the two points where the tangent of x³ − 3x is flat.",
      "Choose σ(x). Where is the slope largest? What is it there?",
      "In panel 2, start at w = 0.5, b = 0, x = 2, y = 1 and check each factor against the worked example.",
      "Set x = 0. Why does ∂L/∂w vanish? Then set w = 2, x = 3: what happens to ∂a/∂z?",
    ],
    expect: [
      { action: "x³ − 3x at x = 2, h = 1", result: "Exact slope 9; forward estimate 16 (error 7), central 10 (error 1)." },
      { action: "Same, h = 0.001", result: "Forward 9.006 (error 0.006); central 9.000001 (error about 10⁻⁶)." },
      { action: "Flat tangents", result: "At x = −1 and x = 1, where 3x² − 3 = 0." },
      { action: "σ(x) at x = 0", result: "The steepest point, with slope 0.25." },
      { action: "Neuron at the default settings", result: "∂L/∂w = −0.2115 by the chain rule and by the finite difference." },
      { action: "w = 2, x = 3", result: "z = 6 and ∂a/∂z ≈ 0.0025: the sigmoid is saturated and the gradient almost vanishes." },
    ],
  },

  code: {
    label: "derivatives.py",
    language: "Python",
    source: `import numpy as np

f = lambda x: x**3 - 3*x
df = lambda x: 3*x**2 - 3                     # the derivative, by the power rule

x = 2.0
for h in [1, 0.1, 0.001]:
    forward = (f(x + h) - f(x)) / h
    central = (f(x + h) - f(x - h)) / (2 * h)
    print(f"h={h}: forward {forward:.6f}, central {central:.6f}, exact {df(x)}")

# The chain rule for one neuron: z = w*x + b, a = sigmoid(z), L = (a - y)**2
sigmoid = lambda z: 1 / (1 + np.exp(-z))
w, b, x, y = 0.5, 0.0, 2.0, 1.0
a = sigmoid(w * x + b)
dL_dw = 2 * (a - y) * a * (1 - a) * x         # dL/da * da/dz * dz/dw
print("chain rule dL/dw:", round(dL_dw, 6))

L = lambda w: (sigmoid(w * x + b) - y) ** 2
eps = 1e-6
print("numerical  dL/dw:", round((L(w + eps) - L(w - eps)) / (2 * eps), 6))`,
    walkthrough: [
      { lines: "3–4", text: "The function and its exact derivative from the power rule." },
      { lines: "6–10", text: "Forward and central differences for three step sizes, next to the exact value." },
      { lines: "13–17", text: "The neuron’s forward pass, then the chain rule as one product of three local derivatives." },
      { lines: "19–21", text: "A gradient check: the loss as a function of w alone, differentiated numerically." },
    ],
    shapes: [
      { name: "x, w, b, y", shape: "scalars", meaning: "One input, one weight, one bias, one target" },
      { name: "dL_dw", shape: "scalar", meaning: "How the loss changes per unit change in w" },
    ],
    output: {
      label: "Output",
      text: "h=1: forward 16.000000, central 10.000000, exact 9.0\nh=0.1: forward 9.610000, central 9.010000, exact 9.0\nh=0.001: forward 9.006001, central 9.000001, exact 9.0\nchain rule dL/dw: -0.211508\nnumerical  dL/dw: -0.211508",
      note: "Produced by running the script with NumPy 2.5. The experiment computes the same values.",
    },
  },

  useCases: [
    { title: "Backpropagation", text: "Every gradient a deep-learning framework computes is this lesson’s chain rule, applied layer by layer from the loss backwards." },
    { title: "Gradient checking", text: "When you write a custom layer or loss, comparing its gradient with a central difference is the standard test." },
    { title: "Sensitivity analysis", text: "The derivative of a prediction with respect to an input shows which inputs the prediction is most sensitive to — the idea behind saliency maps." },
    { title: "Diagnosing training", text: "Gradients near zero (vanishing) or huge (exploding) explain many failed training runs." },
  ],

  mistakes: [
    { kind: "mistake", title: "Forgetting a factor in the chain", text: "Dropping ∂z/∂w = x (or the σ(1 − σ) term) gives a gradient of the right sign and the wrong size, which still “trains”, badly." },
    { kind: "mistake", title: "A step h that is too small", text: "With h = 10⁻¹² rounding errors dominate. For checks, ε around 10⁻⁵ to 10⁻⁶ with a central difference works well." },
    { kind: "misconception", title: "“The gradient points to the minimum”", text: "It points uphill, locally. Its negative is the steepest way down from here, which may not head straight to the minimum." },
    { kind: "misconception", title: "“A zero gradient means the best point”", text: "It can also be a maximum, a saddle, or a saturated unit where learning has simply stopped." },
    { kind: "limitation", title: "Not every function has a derivative everywhere", text: "ReLU has a corner at 0. Frameworks pick a value there (usually 0) and training works in practice." },
  ],

  exercise: {
    prompt: [
      { type: "p", text: "Let f(x) = 4x² − 2x + 1 and L(w₁, w₂) = w₁² + w₁w₂ + 2w₂²." },
      {
        type: "list",
        ordered: true,
        items: [
          "Find f′(x) and the point where the tangent is flat.",
          "Estimate f′(1) with a forward difference, h = 0.1. How far is it from the exact value?",
          "Find ∇L at (1, 2). In which direction should (w₁, w₂) move to decrease L fastest?",
        ],
      },
    ],
    hints: ["Power rule term by term; the constant disappears.", "For ∂L/∂w₁, treat w₂ as a constant (and the other way round)."],
    solution: [
      { type: "p", text: "1. f′(x) = 8x − 2, which is 0 at x = 0.25." },
      { type: "p", text: "2. f(1.1) = 4.84 − 2.2 + 1 = 3.64 and f(1) = 3, so (3.64 − 3) / 0.1 = 6.4. The exact value is f′(1) = 6, so the error is 0.4 (= 4h, since f″ = 8)." },
      { type: "p", text: "3. ∂L/∂w₁ = 2w₁ + w₂ = 4 and ∂L/∂w₂ = w₁ + 4w₂ = 9, so ∇L(1, 2) = (4, 9). Move along −∇L = (−4, −9)." },
    ],
  },

  quiz: [
    {
      question: "What is the derivative of f(x) = 5x³?",
      options: ["15x²", "5x²", "15x³", "3x²"],
      answer: 0,
      explanation: "Power rule: 3 × 5x² = 15x².",
    },
    {
      question: "The forward difference with h = 0.1 has error 0.6. Roughly what error do you expect with h = 0.01?",
      options: ["0.6", "0.06", "0.006", "6"],
      answer: 1,
      explanation: "The forward difference’s error is roughly proportional to h.",
    },
    {
      question: "∇L at the current parameters is (3, −4). Which update lowers L fastest (for a small step)?",
      options: ["Move along (3, −4)", "Move along (−3, 4)", "Move along (4, 3)", "Don’t move"],
      answer: 1,
      explanation: "The gradient points uphill; its negative points steepest downhill.",
    },
    {
      question: "L depends on a, a on z, and z on w. Which expression is ∂L/∂w?",
      options: ["∂L/∂a + ∂a/∂z + ∂z/∂w", "∂L/∂a × ∂a/∂z × ∂z/∂w", "∂L/∂w × ∂z/∂a", "∂z/∂w only"],
      answer: 1,
      explanation: "Along a chain, local derivatives multiply.",
    },
    {
      question: "A sigmoid neuron has z = 8. Why does it learn slowly?",
      options: [
        "Its input is too small",
        "σ(z)(1 − σ(z)) is nearly 0, so every gradient through it is tiny",
        "The loss is negative",
        "Sigmoids can’t be differentiated",
      ],
      answer: 1,
      explanation: "At z = 8, σ ≈ 0.9997 and σ(1 − σ) ≈ 0.0003: the chain rule multiplies by almost zero.",
    },
  ],

  glossary: [
    { term: "Derivative", definition: "The rate of change of a function; the slope of its tangent line." },
    { term: "Tangent line", definition: "The straight line that touches a curve at a point with the same slope." },
    { term: "Secant line", definition: "A straight line through two points of a curve." },
    { term: "Finite difference", definition: "Estimating a derivative from function values at nearby points." },
    { term: "Partial derivative", definition: "The derivative with respect to one variable, holding the others fixed." },
    { term: "Gradient", definition: "The vector of all partial derivatives; points in the direction of steepest increase." },
    { term: "Chain rule", definition: "The derivative of a composition is the product of the local derivatives along the chain." },
    { term: "Backpropagation", definition: "Applying the chain rule from the loss backwards through a network to get every gradient." },
    { term: "Saturation", definition: "When an activation’s slope is near zero, so gradients through it nearly vanish." },
    { term: "Gradient check", definition: "Comparing a computed gradient with a numerical estimate." },
  ],

  references: [
    {
      title: "Mathematics for Machine Learning, chapter 5 (Vector Calculus)",
      source: "Deisenroth, Faisal & Ong, Cambridge University Press, 2020",
      url: "https://mml-book.github.io/",
      note: "Free PDF. Derivatives, partial derivatives, gradients, the chain rule and backpropagation.",
    },
    {
      title: "Deep Learning, sections 4.3 and 6.5",
      source: "Goodfellow, Bengio & Courville, MIT Press, 2016",
      url: "https://www.deeplearningbook.org/",
      note: "Gradient-based optimisation, and back-propagation as the chain rule on a computational graph.",
    },
  ],

  next: [
    { pathSlug: "math-foundations", topicSlug: "optimization-fundamentals", reason: "Using the gradient to walk downhill: gradient descent and the learning rate." },
    { pathSlug: "deep-learning", topicSlug: "backpropagation", reason: "The same chain rule through a whole network." },
    { pathSlug: "deep-learning", topicSlug: "layers-activations", reason: "Why activation slopes such as σ(1 − σ) decide how well deep networks train." },
  ],

  teaching: {
    notes: [
      "Start with a physical slope: a ruler resting against a curved surface is the tangent. Then shorten a string between two points on the curve for the secant.",
      "Use the h table to make “order of accuracy” visible without the Taylor series: tenfold versus hundredfold.",
      "Write the neuron’s chain as boxes with arrows and put each local derivative on its arrow before multiplying.",
    ],
    demo: "Draw y = x² large on the board. Mark x = 1 and ask students to place a ruler as the tangent and estimate its slope by counting squares. Repeat at x = 2 and x = 3 and notice the slopes 2, 4, 6 — the rule 2x appearing from measurements.",
    discussion: [
      "Why do frameworks compute gradients by the chain rule rather than by finite differences for every parameter?",
      "If a gradient is zero, how could you tell whether you are at a minimum, a maximum or a saddle?",
      "What would happen to training if every sigmoid in a deep network were saturated?",
    ],
    misconceptions: [
      "“Smaller h is always more accurate.” Until rounding error takes over.",
      "“The gradient is a number.” For many parameters it is a vector.",
      "“Backpropagation is a different kind of maths.” It is the chain rule, organised.",
    ],
    challenge: {
      prompt:
        "Show that σ′(x) = σ(x)(1 − σ(x)) for σ(x) = 1 / (1 + e⁻ˣ), and use it to explain why σ′ is never larger than 0.25.",
      answer: [
        {
          type: "p",
          text: "σ(x) = (1 + e⁻ˣ)⁻¹, so by the chain rule σ′(x) = (1 + e⁻ˣ)⁻² · e⁻ˣ = [1 / (1 + e⁻ˣ)] · [e⁻ˣ / (1 + e⁻ˣ)] = σ(x) · (1 − σ(x)), since e⁻ˣ / (1 + e⁻ˣ) = 1 − σ(x).",
        },
        { type: "p", text: "With s = σ(x) between 0 and 1, s(1 − s) is a downward parabola with its maximum at s = 0.5, where it equals 0.25 — at x = 0." },
      ],
    },
  },
};
