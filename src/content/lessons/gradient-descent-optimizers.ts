import type { Lesson } from "../../types/content";

/*
 * Gradient descent and optimizers. Lab numbers come from src/lib/optimizers.ts (PyTorch's
 * update rules, seeded data) and are checked in tests/deep-learning.test.ts; the code
 * output was produced by running the script with PyTorch.
 */
export const gradientDescentOptimizers: Lesson = {
  id: "gradient-descent-optimizers",
  pathSlug: "deep-learning",
  topicSlug: "gradient-descent-optimizers",
  title: "Gradient descent and optimizers",
  summary:
    "Backpropagation gives the gradient; the optimizer decides the step. Mini-batches make each step cheap, momentum and Adam make the steps smarter, and the learning rate — the most important setting of all — shows itself in the shape of the loss curve.",
  level: "intermediate",
  minutes: [50, 65],
  objectives: [
    "Implement **mini-batch SGD**: shuffle, split into batches, one step per batch",
    "Explain what **momentum** and **Adam** change about each step, using PyTorch’s update rules",
    "Recognise a learning rate that is **too high or too low** from the loss curve",
    "Use a **learning-rate schedule** to remove the noise floor of mini-batch training",
  ],
  prerequisites: [
    { label: "Optimization fundamentals", href: "/learn/math-foundations/optimization-fundamentals" },
    { label: "Backpropagation", href: "/learn/deep-learning/backpropagation" },
    { label: "Basic PyTorch (for the code section)" },
  ],

  intro: [
    {
      type: "p",
      text: "In Path A, gradient descent stepped downhill on a whole loss surface: w ← w − η × gradient. Training a real network adds three practical questions. How much data should each step look at? Should a step remember previous steps? And how big should the step be, now and later in training?",
    },
    {
      type: "p",
      text: "The answers are **mini-batches**, **optimizers** such as momentum and Adam, and **learning-rate schedules**. All three appear in nearly every training script you will ever write.",
    },
  ],

  why: [
    {
      type: "p",
      text: "Computing the exact gradient over millions of examples before every step would make training impossibly slow. A gradient from a small random batch is noisy but cheap, and many cheap noisy steps beat a few exact ones.",
    },
    {
      type: "p",
      text: "Loss surfaces are rarely round bowls. In narrow valleys plain gradient descent zig-zags across the steep walls while crawling along the floor. Momentum and Adam are two different fixes, and knowing what each does tells you which knobs to turn when training misbehaves.",
    },
    {
      type: "p",
      text: "The learning rate is usually the single most important hyperparameter. Too low and training crawls; too high and the loss oscillates or explodes. Both are visible in the loss curve within a few hundred steps, long before you would see them in final results.",
    },
  ],

  explanation: {
    beginner: [
      {
        type: "p",
        text: "**Mini-batch SGD.** Shuffle the training data, cut it into small batches, and for each batch: compute the loss on just that batch, backpropagate, take a step. One pass through all the batches is an **epoch**. Each step points roughly, not exactly, downhill, so the loss wobbles as it falls.",
      },
      {
        type: "p",
        text: "**Momentum** is like a ball rolling downhill: each step keeps 90% of the previous step’s direction and adds the new gradient. Consistent directions build up speed; directions that flip back and forth cancel out.",
      },
      {
        type: "p",
        text: "**Adam** gives every weight its own step size. It keeps a running average of each weight’s gradient and of its square, and divides one by the square root of the other. A weight with large, steady gradients and one with tiny gradients both end up moving by roughly the learning rate per step.",
      },
      {
        type: "p",
        text: "**Schedules** shrink the learning rate as training goes on: big steps early to make progress, small steps late to settle into the bottom instead of jittering around it.",
      },
    ],
    technical: [
      {
        type: "p",
        text: "Mini-batch SGD uses ĝ = (1/B) Σ_{i∈batch} ∇ℓᵢ(w), an unbiased estimate of the full gradient whose variance shrinks roughly as 1/B. With a constant learning rate, SGD does not converge to the minimum but to a region around it whose size grows with η and the gradient variance; decaying η (step decay, cosine decay) shrinks that region.",
      },
      {
        type: "p",
        text: "PyTorch’s momentum keeps a velocity v ← μv + g and steps w ← w − ηv. For a constant gradient, v approaches g/(1 − μ), so with μ = 0.9 the effective step is about 10η·g. (Some texts write v ← μv + ηg, w ← w − v; with a fixed η the two are the same.)",
      },
      {
        type: "p",
        text: "Adam keeps m ← β₁m + (1 − β₁)g and s ← β₂s + (1 − β₂)g², corrects their bias towards zero early on (m̂ = m/(1 − β₁ᵗ), ŝ = s/(1 − β₂ᵗ)), and steps w ← w − η m̂/(√ŝ + ε). Defaults: β₁ = 0.9, β₂ = 0.999, ε = 10⁻⁸. The ratio m̂/√ŝ is about ±1 for consistent gradients, so η is roughly the step size in parameter units — which is why Adam is less sensitive to the scale of the gradient, and why its working learning rates (often around 10⁻³) differ from SGD’s.",
      },
      {
        type: "p",
        text: "For plain gradient descent on a quadratic with largest curvature λ_max, steps are stable only when η < 2/λ_max. Small batches can have much larger per-batch curvature than the full average, which is why a learning rate that is fine for full-batch training can diverge with batch size 1.",
      },
    ],
  },

  analogy: {
    title: "Three ways down a foggy valley",
    blocks: [
      {
        type: "p",
        text: "A walker taking plain SGD steps feels the slope under their feet and steps that way — in a steep, narrow gully they bounce from wall to wall. A rolling ball (momentum) keeps its speed along the gully floor and its side-to-side bounces partly cancel. A cautious hiker (Adam) takes a step of about the same length in each direction regardless of how steep it feels.",
      },
      {
        type: "p",
        text: "And with mini-batches, the fog shifts at every step: each reading of the slope is a little off. Shorter steps near the bottom (a schedule) stop the walker from wandering around it.",
      },
    ],
  },

  workedExample: {
    title: "The first steps on the narrow valley",
    blocks: [
      {
        type: "p",
        text: "Take the experiment’s narrow valley, L = ½(w₁² + 10w₂²), starting at (−2.5, 2) with η = 0.1. The gradient there is (w₁, 10w₂) = (−2.5, 20).",
      },
      {
        type: "table",
        caption: "Positions after each step (PyTorch’s update rules)",
        head: ["Step", "SGD", "Momentum 0.9", "Adam"],
        rows: [
          ["0", "(−2.5, 2)", "(−2.5, 2)", "(−2.5, 2)"],
          ["1", "(−2.25, 0)", "(−2.25, 0)", "(−2.4, 1.9)"],
          ["2", "(−2.025, 0)", "(−1.8, −1.8)", "(−2.3001, 1.8002)"],
          ["3", "(−1.8225, 0)", "(−1.215, −1.62)", "(−2.2005, 1.7006)"],
        ],
      },
      {
        type: "list",
        items: [
          "**SGD**: step 1 is −0.1 × (−2.5, 20) = (+0.25, −2). In the steep direction it lands exactly on the floor (w₂ = 0); in the shallow direction it shrinks w₁ by 10% per step.",
          "**Momentum**: step 1 is the same. At step 2 the velocity is 0.9 × (−2.5, 20) + (−2.25, 0) = (−4.5, 18), so w moves by (0.45, −1.8): faster along w₁, but it overshoots the floor to w₂ = −1.8.",
          "**Adam**: at step 1, m̂ = g and ŝ = g², so each weight moves by η × sign(g) = 0.1, whether its gradient is 2.5 or 20. It walks diagonally, 0.1 per step in each direction.",
        ],
      },
      {
        type: "p",
        text: "With this learning rate, plain SGD reaches the minimum first (39 steps, against 71 for momentum and 81 for Adam). Change η and the order changes: at η = 0.3, SGD diverges and Adam is fastest. The experiment shows both.",
      },
    ],
  },

  math: {
    blocks: [
      { type: "equation", expression: "ĝ = (1/B) Σ_{i∈batch} ∇ℓᵢ(w),   w ← w − η ĝ", meaning: "Mini-batch SGD: the gradient of the batch’s mean loss." },
      { type: "equation", expression: "v ← μv + ĝ,   w ← w − η v", meaning: "Momentum, as PyTorch implements it (μ = 0.9 is common)." },
      { type: "equation", expression: "m ← β₁m + (1−β₁)ĝ,   s ← β₂s + (1−β₂)ĝ²", meaning: "Adam’s running averages of the gradient and of its square, per weight." },
      { type: "equation", expression: "w ← w − η · (m/(1−β₁ᵗ)) / (√(s/(1−β₂ᵗ)) + ε)", meaning: "Adam’s step, with bias correction for step t." },
      { type: "equation", expression: "ηₜ = ½ η₀ (1 + cos(πt/T))", meaning: "Cosine decay from η₀ at the start to 0 at step T." },
      { type: "equation", expression: "η < 2 / λ_max", meaning: "Plain gradient descent on a quadratic is stable only below this; λ_max is the steepest curvature." },
    ],
    notation: [
      { symbol: "B", meaning: "Batch size" },
      { symbol: "η, ηₜ", meaning: "Learning rate, and its value at step t under a schedule" },
      { symbol: "μ", meaning: "Momentum coefficient" },
      { symbol: "β₁, β₂, ε", meaning: "Adam’s averaging rates and a small constant against division by zero" },
      { symbol: "T", meaning: "Total number of steps in a schedule" },
    ],
  },

  process: {
    title: "One epoch of mini-batch training in PyTorch",
    steps: [
      { title: "Shuffle and batch", text: "A DataLoader with shuffle=True yields a different order of batches each epoch." },
      { title: "Clear old gradients", text: "optimizer.zero_grad(), because PyTorch adds gradients up." },
      { title: "Forward and loss", text: "Predictions for the batch, then the loss averaged over it." },
      { title: "Backward", text: "loss.backward() fills every parameter’s .grad." },
      { title: "Step", text: "optimizer.step() applies SGD, momentum or Adam to every parameter." },
      { title: "Schedule", text: "scheduler.step() updates the learning rate, per batch or per epoch depending on the schedule." },
    ],
  },

  interactive: {
    component: "optimizers-lab",
    kind: "computation",
    intro:
      "Two panels, both computed in your browser with PyTorch’s update rules. The first races SGD, momentum and Adam with one shared learning rate; the second trains a small linear regression with mini-batch SGD.",
    tryThis: [
      "In panel 1, on the narrow valley, compare η = 0.1, 0.3 and 1. Which optimizer is fastest at each?",
      "Hide SGD and Adam to look at momentum’s path alone at η = 0.1. Why does it swing across the valley?",
      "Switch to the curved valley and compare η = 0.03 and 0.1.",
      "In panel 2, keep batch size 8 and η = 0.03, then change the batch size to 1. What happens to the curve?",
      "With batch size 1 and η = 0.03, try the step and cosine schedules.",
      "With batch size 256 (the full data), try η = 0.03, 0.3 and 1.",
    ],
    expect: [
      { action: "Narrow valley: η = 0.1, 0.3, 1", result: "η = 0.1: SGD 39 steps, momentum 71, Adam 81. η = 0.3: SGD diverges, momentum 82, Adam 76. η = 1: only Adam arrives (61 steps)." },
      { action: "Curved valley: η = 0.03, then 0.1", result: "0.03: SGD 242 steps, momentum 61, Adam 275. 0.1: SGD and momentum diverge; Adam arrives in 77." },
      { action: "Batch 8, η = 0.03", result: "Final loss 0.285, 0.7% above the best possible (0.2835), after 320 steps." },
      { action: "Batch 1, η = 0.03, constant", result: "A noisy floor: 0.338, 19.1% above the best." },
      { action: "Batch 1, η = 0.03, step or cosine", result: "0.284 (0.3% above) and 0.284 (0.1% above): the schedule removes the floor." },
      { action: "Batch 256: η = 0.03, 0.3, 1", result: "0.03: too slow, 3.96 after 10 steps. 0.3: 0.2835, the best. 1: the loss grows to about 12,600 — diverging." },
    ],
  },

  code: {
    label: "optimizers.py",
    language: "Python",
    source: `import torch
from torch import nn

# 1. The narrow valley, with PyTorch's own optimizers (64-bit, as in the experiment).
def steps_to_minimum(make_opt, lr, max_steps=300):
    w = torch.tensor([-2.5, 2.0], dtype=torch.float64, requires_grad=True)
    loss_of = lambda w: 0.5 * (w[0] ** 2 + 10 * w[1] ** 2)
    opt = make_opt([w], lr)
    for step in range(1, max_steps + 1):
        opt.zero_grad()
        loss_of(w).backward()
        opt.step()
        loss = loss_of(w).item()
        if not loss < 1e6:
            return "diverged"
        if loss < 1e-3:
            return step
    return "not reached"

optimizers = {"SGD": lambda p, lr: torch.optim.SGD(p, lr=lr),
              "momentum": lambda p, lr: torch.optim.SGD(p, lr=lr, momentum=0.9),
              "Adam": lambda p, lr: torch.optim.Adam(p, lr=lr)}
for lr in (0.1, 0.3, 1.0):
    print(lr, {name: steps_to_minimum(make, lr) for name, make in optimizers.items()})

# 2. Mini-batch SGD with a cosine schedule on invented data.
g = torch.Generator().manual_seed(0)
X = torch.randn(256, 2, generator=g)
y = X @ torch.tensor([3.0, -2.0]) + 0.5 + 0.5 * torch.randn(256, generator=g)
loader = torch.utils.data.DataLoader(torch.utils.data.TensorDataset(X, y),
                                     batch_size=8, shuffle=True, generator=g)
model = nn.Linear(2, 1)
opt = torch.optim.SGD(model.parameters(), lr=0.03)
sched = torch.optim.lr_scheduler.CosineAnnealingLR(opt, T_max=10 * len(loader))
for epoch in range(10):
    for xb, yb in loader:
        opt.zero_grad()
        nn.functional.mse_loss(model(xb).squeeze(1), yb).backward()
        opt.step()
        sched.step()                     # once per batch
with torch.no_grad():
    print(model.weight.numpy().round(3), model.bias.numpy().round(3),
          round(nn.functional.mse_loss(model(X).squeeze(1), y).item(), 4))`,
    walkthrough: [
      { lines: "5–18", text: "Runs any PyTorch optimizer on the narrow valley and counts steps until the loss is within 0.001 of the minimum (0), using the same rules as the experiment." },
      { lines: "20–24", text: "SGD, SGD with momentum 0.9, and Adam at three learning rates. The step counts match panel 1." },
      { lines: "27–31", text: "256 invented examples from y = 3x₁ − 2x₂ + 0.5 + noise, and a DataLoader that shuffles them into batches of 8 every epoch." },
      { lines: "32–34", text: "A linear model, plain SGD and a cosine schedule spread over all 10 × 32 steps." },
      { lines: "35–40", text: "The training loop: clear gradients, forward, loss, backward, step, then update the learning rate." },
      { lines: "41–43", text: "The learned weights should be close to (3, −2) and 0.5, with a loss near the noise level of 0.5² = 0.25." },
    ],
    shapes: [
      { name: "w", shape: "(2,)", meaning: "The two weights on the valley" },
      { name: "X, y", shape: "(256, 2), (256,)", meaning: "The invented regression data" },
      { name: "xb, yb", shape: "(8, 2), (8,)", meaning: "One mini-batch" },
      { name: "model(xb)", shape: "(8, 1) → squeeze → (8,)", meaning: "nn.Linear keeps an output dimension; squeeze it to match yb" },
    ],
    output: {
      label: "Output",
      text: "0.1 {'SGD': 39, 'momentum': 71, 'Adam': 81}\n0.3 {'SGD': 'diverged', 'momentum': 82, 'Adam': 76}\n1.0 {'SGD': 'diverged', 'momentum': 'diverged', 'Adam': 61}\n[[ 2.994 -2.017]] [0.536] 0.2756",
      note: "Produced by running the script with PyTorch. Part 1 matches the experiment exactly. Part 2 uses PyTorch’s own random numbers, so its data differs from the experiment’s; its numbers are its own.",
    },
  },

  useCases: [
    {
      title: "AdamW for transformers",
      text: "Language and vision transformers are usually trained with AdamW (Adam with decoupled weight decay), a short warm-up of the learning rate and then a decay such as cosine.",
    },
    {
      title: "SGD with momentum for convolutional networks",
      text: "Many image classifiers, including the original ResNets, were trained with SGD, momentum 0.9 and step decays of the learning rate; it remains a strong choice when tuned.",
    },
    {
      title: "Large-batch training",
      text: "Spreading training over many GPUs means larger batches; the learning rate and schedule usually have to change with the batch size, which is why recipes state both.",
    },
  ],

  mistakes: [
    {
      kind: "mistake",
      title: "Judging optimizers at one learning rate",
      text: "In the experiment, SGD wins at η = 0.1 and diverges at 0.3, while Adam wins at η = 1. Compare optimizers each at a tuned learning rate, or over a range.",
    },
    {
      kind: "mistake",
      title: "Changing the batch size and nothing else",
      text: "In panel 2, η = 0.3 is the best choice for full batches but diverges with batch size 1. Batch size and learning rate need tuning together.",
    },
    {
      kind: "mistake",
      title: "Stepping the scheduler at the wrong rate",
      text: "A schedule written for epochs but stepped every batch decays far too fast (and the reverse, far too slow). Check the learning rate you log against the one you intended.",
    },
    {
      kind: "misconception",
      title: "“Adam needs no tuning”",
      text: "Adam is less sensitive to the learning rate than SGD, not insensitive: in the experiment it fails to arrive within 300 steps at η = 0.01. Its default 10⁻³ is a starting point.",
    },
    {
      kind: "limitation",
      title: "Two-parameter surfaces are a cartoon",
      text: "Real loss surfaces have millions of dimensions, with flat regions and saddle points that two-parameter pictures cannot show. The behaviours here — zig-zagging, overshooting, divergence — do carry over.",
    },
  ],

  exercise: {
    prompt: [
      { type: "p", text: "Minimise f(w) = w², whose gradient is 2w, starting at w = 3." },
      {
        type: "list",
        ordered: true,
        items: [
          "Take three SGD steps with η = 0.1.",
          "Take three SGD steps with η = 1.1. What happens, and for which learning rates does SGD converge on this function?",
          "Take three steps of PyTorch-style momentum (μ = 0.9, η = 0.1, starting velocity 0).",
          "Adam’s first step moves w by about η, whatever the gradient. With η = 0.1, where is w after one Adam step?",
        ],
      },
    ],
    hints: [
      "SGD: w ← w − η·2w = (1 − 2η)w.",
      "The factor 1 − 2η must have absolute value below 1.",
      "v ← 0.9v + 2w, then w ← w − 0.1v.",
    ],
    solution: [
      { type: "p", text: "η = 0.1: w = 3 → **2.4 → 1.92 → 1.536** (each step multiplies by 0.8)." },
      { type: "p", text: "η = 1.1: w = 3 → **−3.6 → 4.32 → −5.184**: each step multiplies by −1.2, so it diverges. SGD converges when |1 − 2η| < 1, that is **0 < η < 1** (= 2 ÷ the curvature 2)." },
      { type: "p", text: "Momentum: v = 6, w = 2.4; v = 0.9×6 + 4.8 = 10.2, w = 1.38; v = 0.9×10.2 + 2.76 = 11.94, w = **0.186**. Faster than SGD’s 1.536 after the same three steps." },
      { type: "p", text: "The gradient is positive, so Adam steps down by about 0.1: **w ≈ 2.9**." },
    ],
  },

  quiz: [
    {
      question: "A dataset has 10,000 examples and the batch size is 50. How many optimizer steps are in one epoch?",
      options: ["50", "200", "10,000", "500,000"],
      answer: 1,
      explanation: "10,000 ÷ 50 = 200 batches, one step each.",
    },
    {
      question: "With PyTorch momentum μ = 0.9 and a constant gradient g, the step approaches what size?",
      options: ["η·g", "0.9η·g", "about 10η·g", "η"],
      answer: 2,
      explanation: "The velocity approaches g/(1 − μ) = 10g, and the step is η times the velocity.",
    },
    {
      question: "Why does Adam’s first step move every weight by roughly the learning rate?",
      options: [
        "It ignores the gradient",
        "It divides the averaged gradient by the square root of the averaged squared gradient, which is about ±1",
        "It uses momentum 0.999",
        "Its learning rate is 10⁻³",
      ],
      answer: 1,
      explanation: "After bias correction, m̂/√ŝ = g/|g| at the first step, so the step is η × the sign of the gradient.",
    },
    {
      question: "The training loss falls quickly at first, then stays bumpy at a level clearly above where it should be. What is the most likely fix?",
      options: ["Raise the learning rate", "Lower the learning rate late in training, for example with a schedule", "Remove the shuffle", "Use fewer epochs"],
      answer: 1,
      explanation: "A noisy floor comes from constant-size steps with noisy mini-batch gradients; smaller steps late in training settle it.",
    },
    {
      question: "The loss becomes NaN after a few hundred steps. What should you check first?",
      options: ["The learning rate", "The test set", "The number of epochs", "The random seed"],
      answer: 0,
      explanation: "Growing then exploding losses are the classic sign of a learning rate that is too high (or of exploding gradients, often fixed the same way or with clipping).",
    },
  ],

  glossary: [
    { term: "Mini-batch", definition: "A small random subset of the training data used for one gradient step." },
    { term: "Epoch", definition: "One pass through the whole training set." },
    { term: "Stochastic gradient descent (SGD)", definition: "Gradient descent using gradients from mini-batches (or single examples)." },
    { term: "Momentum", definition: "Adding a decaying sum of past gradients to each step, which speeds up consistent directions and damps oscillations." },
    { term: "Adam", definition: "An optimizer that scales each weight’s step by running averages of its gradient and squared gradient." },
    { term: "AdamW", definition: "Adam with weight decay applied directly to the weights rather than through the gradient." },
    { term: "Learning-rate schedule", definition: "A rule that changes the learning rate during training, such as step decay or cosine decay." },
    { term: "Divergence", definition: "Training in which the loss grows instead of falling, often to infinity or NaN." },
  ],

  references: [
    {
      title: "Adam: A Method for Stochastic Optimization",
      source: "Diederik P. Kingma & Jimmy Ba, ICLR 2015 (arXiv:1412.6980)",
      url: "https://arxiv.org/abs/1412.6980",
      note: "The Adam algorithm, its bias correction and its default settings (η = 0.001, β₁ = 0.9, β₂ = 0.999, ε = 10⁻⁸).",
    },
    {
      title: "Why Momentum Really Works",
      source: "Gabriel Goh, Distill, 2017",
      url: "https://distill.pub/2017/momentum/",
      note: "An interactive explanation of momentum on badly conditioned problems.",
    },
    {
      title: "torch.optim.SGD",
      source: "PyTorch documentation",
      url: "https://docs.pytorch.org/docs/stable/generated/torch.optim.SGD.html",
      note: "Includes the note on how PyTorch’s momentum update differs from Sutskever et al.’s form.",
    },
    {
      title: "Deep Learning, chapter 8 (Optimization for Training Deep Models)",
      source: "Goodfellow, Bengio & Courville, MIT Press, 2016",
      url: "https://www.deeplearningbook.org/",
      note: "Mini-batch SGD, momentum, adaptive learning rates and the difficulties of optimising deep networks.",
    },
  ],

  next: [
    { pathSlug: "deep-learning", topicSlug: "regularization-diagnostics", reason: "Training that works on the training data, and generalises beyond it." },
    { pathSlug: "math-foundations", topicSlug: "optimization-fundamentals", reason: "The learning-rate stability rule, η < 2 ÷ curvature, worked from scratch." },
    { pathSlug: "deep-learning", topicSlug: "backpropagation", reason: "Where the gradients come from." },
  ],

  teaching: {
    notes: [
      "Do the worked example’s first two steps by hand for all three optimizers before running the experiment.",
      "Use panel 1 to make one point: optimizer rankings depend on the learning rate. Students should find a learning rate where each one wins.",
      "In panel 2, have students sketch the four curve shapes — too slow, good, noisy floor, diverging — and label them.",
    ],
    demo: "Roll a marble down a tilted, corrugated tray, then a heavier ball. The marble follows every groove; the heavy ball keeps its line. Then ask: what would you change to make the heavy ball stop at the bottom rather than roll past it?",
    discussion: [
      "Why is an average over 8 examples a reasonable stand-in for the gradient over all 256?",
      "If you double the batch size, what might you change about the learning rate, and why?",
      "When might you prefer SGD with momentum over Adam, even though Adam is easier to tune?",
    ],
    misconceptions: [
      "Believing the noisiest loss curve means the worst model.",
      "Thinking a higher learning rate always trains faster.",
      "Assuming Adam’s learning rate means the same thing as SGD’s.",
    ],
    challenge: {
      prompt:
        "In panel 1, find the largest learning rate in the list for which SGD still reaches the narrow valley’s minimum, and explain from the curvatures (1 and 10) why the next value fails.",
      answer: [
        { type: "p", text: "η = 0.15 reaches the minimum (25 steps, the fastest SGD run); η = 0.3 diverges." },
        { type: "p", text: "Stability needs η < 2/λ_max = 2/10 = 0.2. At 0.15 the steep direction’s error is multiplied by 1 − 10×0.15 = −0.5 each step and shrinks; at 0.3 it is multiplied by −2 and grows." },
      ],
    },
  },
};
