import type { Lesson } from "../../types/content";

/*
 * Every number below was computed with NumPy and is checked against the lab's
 * gradient descent (src/lib/optimize.ts) in tests/lab-math.test.ts.
 */
export const optimizationFundamentals: Lesson = {
  id: "optimization-fundamentals",
  pathSlug: "math-foundations",
  topicSlug: "optimization-fundamentals",
  title: "Optimization fundamentals",
  summary:
    "Training a model means minimising a loss. Gradient descent does it by repeatedly stepping downhill, and almost everything that can go wrong — crawling, zig-zagging, bouncing, exploding, or settling in the wrong valley — comes from the learning rate and the shape of the surface. This lesson lets you cause each one deliberately.",
  level: "beginner",
  minutes: [45, 60],
  objectives: [
    "Run **gradient descent** by hand on a one-variable function",
    "Explain how the **learning rate** causes slow progress, oscillation or divergence",
    "Explain why narrow valleys are slow, and how **momentum** helps",
    "Distinguish **convex** losses from **non-convex** ones with several minima",
  ],
  prerequisites: [
    { label: "Derivatives and gradients", href: "/learn/math-foundations/derivatives-gradients" },
    { label: "What does learning from data mean? (helpful)", href: "/learn/ml-foundations/learning-from-data" },
  ],

  intro: [
    {
      type: "p",
      text: "In the first Machine Learning lesson, gradient descent fitted a line to fifteen students, and one learning rate made it blow up. This lesson explains why. You will run gradient descent by hand, then on three loss surfaces drawn as contour maps.",
    },
    {
      type: "p",
      text: "The surfaces are deliberately simple — two parameters, a formula you can read — so that every behaviour has a visible cause. Real networks have millions of parameters, but the same behaviours appear in their training curves.",
    },
  ],

  why: [
    {
      type: "p",
      text: "Almost every model in this curriculum, from logistic regression to a large language model, is trained by some form of gradient descent. The learning rate is the single most important setting: wrong by a factor of ten, a run either crawls or diverges.",
    },
    {
      type: "p",
      text: "Knowing the typical failure shapes — a loss curve that is flat, saw-toothed, or shooting up — lets you diagnose a training run in seconds instead of guessing.",
    },
  ],

  explanation: {
    beginner: [
      {
        type: "p",
        text: "**The idea.** The gradient points uphill. Take a small step the other way, recompute the gradient, and repeat: w ← w − η × gradient. The **learning rate** η sets the step size.",
      },
      {
        type: "p",
        text: "**Too small** and progress is slow: each step barely moves. **About right** and the loss falls quickly. **Too large** and each step jumps past the bottom to the other side. A little too large and it zig-zags but still settles; much too large and every jump lands higher than the last — the loss explodes. That is **divergence**.",
      },
      {
        type: "p",
        text: "**Narrow valleys.** If the loss is steep in one direction and gentle in another, the steep direction limits the learning rate. A rate small enough not to bounce across the steep sides makes painfully slow progress along the gentle floor. **Momentum** helps: it keeps a running velocity, so consistent movement along the valley builds up speed while the side-to-side bouncing partly cancels.",
      },
      {
        type: "p",
        text: "**Convex or not.** A **convex** loss is shaped like a single bowl: any downhill path reaches the one minimum. Linear and logistic regression have convex losses. Neural networks don’t: their losses have many valleys, and where gradient descent ends up depends on where it starts.",
      },
      {
        type: "p",
        text: "**In practice**, the gradient is estimated on a small random batch of examples at each step — **stochastic** gradient descent — which is cheaper and adds noise that can help. Methods such as Adam adapt the step size for each parameter.",
      },
    ],
    technical: [
      {
        type: "p",
        text: "Gradient descent: wₜ₊₁ = wₜ − η ∇L(wₜ). For a quadratic L(w) = ½ Σᵢ λᵢ wᵢ² (in its eigenbasis), each coordinate evolves as wᵢ ← (1 − ηλᵢ) wᵢ. It converges if and only if |1 − ηλᵢ| < 1 for all i, i.e. 0 < η < 2/λ_max. At η = 2/λ_max the steepest coordinate flips sign each step without shrinking; above it, it grows geometrically.",
      },
      {
        type: "p",
        text: "The slowest coordinate shrinks by |1 − ηλ_min| per step. With η limited by λ_max, the rate is governed by the condition number κ = λ_max/λ_min: large κ means a long, narrow valley and slow convergence.",
      },
      {
        type: "p",
        text: "Heavy-ball momentum: vₜ₊₁ = βvₜ − η∇L(wₜ), wₜ₊₁ = wₜ + vₜ₊₁. With suitable η and β it improves the dependence on κ roughly from κ to √κ for quadratics; too much momentum overshoots and spirals.",
      },
      {
        type: "p",
        text: "A function is convex when every chord lies above its graph; then every local minimum is global, and gradient descent with a suitable step size converges to it. Neural-network losses are non-convex, with many minima and saddle points; in high dimensions saddles are common, and stochastic gradient noise helps escape them.",
      },
    ],
  },

  analogy: {
    title: "Finding the bottom of a dark valley",
    blocks: [
      {
        type: "p",
        text: "You are blindfolded on a hillside and can only feel the slope under your feet. Small careful steps get you down, slowly. Huge leaps send you flying across the valley and up the far side — or right out of it. In a narrow gorge, you spend most of your effort stepping from wall to wall instead of walking along the floor.",
      },
      {
        type: "p",
        text: "Momentum is like rolling a heavy ball instead of stepping: it keeps going in a consistent direction and doesn’t stop at every bump. And in hilly country, which valley you end in depends on where you started — you can’t feel that a deeper one exists over the ridge.",
      },
    ],
  },

  workedExample: {
    title: "By hand, then on a narrow valley",
    blocks: [
      {
        type: "p",
        text: "**One variable by hand.** Minimise f(w) = (w − 3)², whose derivative is 2(w − 3). Start at w = 0 with η = 0.1.",
      },
      {
        type: "table",
        caption: "Five steps of gradient descent on f(w) = (w − 3)², η = 0.1",
        head: ["Step", "w before", "Gradient 2(w − 3)", "w after", "Loss before"],
        rows: [
          ["1", "0", "−6", "0.6", "9"],
          ["2", "0.6", "−4.8", "1.08", "5.76"],
          ["3", "1.08", "−3.84", "1.464", "3.6864"],
          ["4", "1.464", "−3.072", "1.7712", "2.3593"],
          ["5", "1.7712", "−2.4576", "2.0170", "1.5099"],
        ],
      },
      {
        type: "p",
        text: "Each step multiplies the distance to the minimum by 1 − 0.1 × 2 = 0.8, so after t steps w = 3 − 3 × 0.8ᵗ. With η = 1 the factor would be −1 (bouncing between 0 and 6 forever); with η above 1 the distance would grow every step.",
      },
      {
        type: "p",
        text: "**A narrow valley.** L(w₁, w₂) = ½(w₁² + 10w₂²) has curvature 1 along w₁ and 10 along w₂. Starting from (−2.5, 2), for 100 steps:",
      },
      {
        type: "table",
        caption: "Gradient descent on the narrow valley, 100 steps from (−2.5, 2)",
        head: ["Learning rate", "Momentum", "Result"],
        rows: [
          ["0.01", "0", "Still far away: loss 0.419 after 100 steps"],
          ["0.05", "0", "Within 0.001 of the minimum after 79 steps"],
          ["0.1", "0", "After 39 steps"],
          ["0.15", "0", "After 25 steps"],
          ["0.19", "0", "After 47 steps, zig-zagging across the valley"],
          ["0.2", "0", "Bounces between the walls forever (loss stays at 20)"],
          ["0.21", "0", "Diverges: the loss passes 1,000,000 at step 57"],
          ["0.1", "0.5", "After 14 steps"],
        ],
      },
      {
        type: "p",
        text: "The limit is 2 ÷ 10 = 0.2, set by the steep direction. Momentum gets there in 14 steps at a rate that took 39 without it.",
      },
      {
        type: "p",
        text: "**Two valleys.** The third surface has a shallow valley at w₁ ≈ 0.946 (loss 0.889) and a deeper one at w₁ ≈ −1.047 (loss 0.090), separated by a ridge near w₁ = 0.1. From (0.4, 1.5), every learning rate and momentum in the experiment that converges ends in the shallow valley; from (0.1, 1.5) it reaches the deep one. Nothing in the gradient warns you that the other valley exists.",
      },
    ],
  },

  math: {
    blocks: [
      { type: "equation", expression: "w ← w − η · ∇L(w)", meaning: "One step of gradient descent with learning rate η." },
      { type: "equation", expression: "w − w* ← (1 − ηλ) · (w − w*)", meaning: "On a quadratic with curvature λ, each step multiplies the distance to the minimum w* by 1 − ηλ." },
      { type: "equation", expression: "converges  ⇔  0 < η < 2 / λ_max", meaning: "The steepest direction sets the largest usable learning rate. Here: bowl 2/2 = 1, valley 2/10 = 0.2." },
      { type: "equation", expression: "κ = λ_max / λ_min", meaning: "The condition number. Large κ means a narrow valley and slow progress along its floor." },
      { type: "equation", expression: "v ← β·v − η·∇L(w),   w ← w + v", meaning: "Gradient descent with momentum β; β = 0 is plain gradient descent." },
      { type: "equation", expression: "L(θa + (1 − θ)b) ≤ θL(a) + (1 − θ)L(b)  for 0 ≤ θ ≤ 1", meaning: "Convexity: the chord between any two points lies above the graph. Then any local minimum is the global one." },
    ],
    notation: [
      { symbol: "w", meaning: "The parameters being optimised" },
      { symbol: "η", meaning: "Learning rate (“eta”)" },
      { symbol: "∇L(w)", meaning: "Gradient of the loss at w" },
      { symbol: "λ", meaning: "Curvature (second derivative) along a direction" },
      { symbol: "β, v", meaning: "Momentum coefficient and velocity" },
      { symbol: "w*", meaning: "The minimiser" },
    ],
  },

  process: {
    title: "Choosing and checking a learning rate",
    steps: [
      { title: "Plot the loss every step", text: "Training loss against step, on a log scale if it spans orders of magnitude." },
      { title: "Sweep the learning rate", text: "Try values a factor of about 3 apart (0.001, 0.003, 0.01, 0.03, …) for a short run each." },
      { title: "Read the curves", text: "Flat: too small. Smooth and falling: good. Saw-tooth: near the edge. Rising or NaN: too large." },
      { title: "Pick just below the edge", text: "The fastest rate that is still smooth; then consider a schedule that lowers it over time." },
      { title: "Consider momentum or Adam", text: "Especially if progress is slow but larger rates bounce." },
      { title: "Try several starts", text: "For non-convex models, different seeds can end in different minima. Report the spread." },
    ],
  },

  interactive: {
    component: "optimization-lab",
    kind: "computation",
    intro:
      "Gradient descent runs in your browser on three loss surfaces drawn as contour maps (darker is lower). The path shows one dot per step; the chart below shows how far the loss is above its lowest value at each step.",
    tryThis: [
      "On the narrow valley, move the learning rate through 0.01, 0.1, 0.19, 0.2 and 0.21, watching the path and the loss curve.",
      "At η = 0.1, set momentum to 0.5, then 0.9. Count the steps to the minimum.",
      "Switch to the round bowl. Which learning rate reaches the minimum in one step? What happens at 1 and 1.05?",
      "Switch to two valleys. From the default start, where does it end? Move the start’s first weight to 0.1.",
      "On two valleys, can any learning rate or momentum get from (0.4, 1.5) into the deeper valley?",
    ],
    expect: [
      { action: "Narrow valley, η = 0.01", result: "Still on its way after 100 steps (loss 0.419)." },
      { action: "η = 0.1, then 0.19", result: "Minimum in 39 steps; at 0.19 the path zig-zags and takes 47." },
      { action: "η = 0.2 and 0.21", result: "At 0.2 it bounces forever between the walls; at 0.21 it diverges." },
      { action: "η = 0.1 with momentum 0.5", result: "Minimum in 14 steps." },
      { action: "Round bowl, η = 0.5", result: "One step lands exactly on the minimum; η = 1 bounces forever and 1.05 diverges." },
      { action: "Two valleys", result: "From (0.4, 1.5) it settles in the shallow valley at loss 0.889; from (0.1, 1.5) it reaches the deep one at 0.090." },
    ],
  },

  code: {
    label: "gradient_descent.py",
    language: "Python",
    source: `import numpy as np

# Gradient descent by hand on f(w) = (w - 3)**2, whose derivative is 2(w - 3)
w, lr = 0.0, 0.1
for step in range(5):
    w = w - lr * 2 * (w - 3)
    print(f"step {step + 1}: w = {w:.4f}")

# The narrow valley: L(w) = 0.5 * (w1**2 + 10 * w2**2)
grad = lambda w: np.array([w[0], 10 * w[1]])

def descend(lr, steps=100, momentum=0.0):
    w, v = np.array([-2.5, 2.0]), np.zeros(2)
    for _ in range(steps):
        v = momentum * v - lr * grad(w)
        w = w + v
    return 0.5 * (w[0] ** 2 + 10 * w[1] ** 2)

for lr in [0.01, 0.1, 0.19, 0.21]:
    print(f"lr={lr}: loss after 100 steps {descend(lr):.3g}")
print(f"lr=0.1, momentum 0.5: {descend(0.1, momentum=0.5):.3g}")`,
    walkthrough: [
      { lines: "4–7", text: "The update rule from the worked example: subtract the learning rate times the derivative." },
      { lines: "10", text: "The valley’s gradient: (w₁, 10·w₂). The factor 10 makes the w₂ direction ten times steeper." },
      { lines: "12–17", text: "Gradient descent with optional momentum, exactly as in the experiment, from the same starting point." },
      { lines: "19–21", text: "Four learning rates, then momentum. At 0.21 the loss grows to billions over 100 steps." },
    ],
    shapes: [
      { name: "w, v", shape: "(2,)", meaning: "The two parameters and their velocity" },
      { name: "grad(w)", shape: "(2,)", meaning: "One partial derivative per parameter" },
    ],
    output: {
      label: "Output",
      text: "step 1: w = 0.6000\nstep 2: w = 1.0800\nstep 3: w = 1.4640\nstep 4: w = 1.7712\nstep 5: w = 2.0170\nlr=0.01: loss after 100 steps 0.419\nlr=0.1: loss after 100 steps 2.2e-09\nlr=0.19: loss after 100 steps 1.41e-08\nlr=0.21: loss after 100 steps 3.8e+09\nlr=0.1, momentum 0.5: 1.15e-29",
      note: "Produced by running the script with NumPy 2.5. The experiment computes the same paths; it stops a run once the loss passes 1,000,000.",
    },
  },

  useCases: [
    { title: "Training any neural network", text: "Mini-batch stochastic gradient descent, usually with momentum or Adam, is how practically every network is trained." },
    { title: "Learning-rate schedules", text: "Warm-up and decay schedules start small, rise, then fall — staying below the edge of stability as curvature changes during training." },
    { title: "Fitting classic models", text: "Logistic regression with many features is often fitted by gradient methods; its convex loss guarantees one minimum." },
    { title: "Reading training curves", text: "A spiking or NaN loss usually means the learning rate is too high for the current curvature." },
  ],

  mistakes: [
    { kind: "mistake", title: "Raising the learning rate to go faster", text: "Past 2/λ_max the run diverges. Faster progress on a narrow valley needs momentum or better conditioning, not a bigger step." },
    { kind: "mistake", title: "Unscaled features", text: "Features in very different units make the loss a narrow valley. Standardising them is the cheapest way to improve conditioning." },
    { kind: "mistake", title: "Judging one run", text: "On non-convex losses the result depends on the start. Compare several seeds." },
    { kind: "misconception", title: "“Gradient descent finds the best parameters”", text: "It finds a point where the gradient is (nearly) zero — the global minimum only for convex losses." },
    { kind: "misconception", title: "“Lower training loss is always better”", text: "Optimisation minimises training loss; generalisation is a separate question (see the overfitting lesson)." },
    { kind: "limitation", title: "Two dimensions are only a sketch", text: "Real losses have millions of dimensions, where saddle points are far more common than in these pictures." },
  ],

  exercise: {
    prompt: [
      { type: "p", text: "Minimise f(w) = 2(w + 1)², starting from w = 1." },
      {
        type: "list",
        ordered: true,
        items: [
          "Find f′(w) and the curvature (second derivative). What is the largest learning rate that converges?",
          "Do two steps with η = 0.1. By what factor does the distance to the minimum shrink each step?",
          "What happens with η = 0.5? And with η = 0.6?",
        ],
      },
    ],
    hints: ["f′(w) = 4(w + 1); the second derivative is 4.", "Distance factor: 1 − η × 4."],
    solution: [
      { type: "p", text: "1. f′(w) = 4(w + 1), curvature 4, so the limit is η < 2/4 = 0.5. The minimum is at w = −1." },
      { type: "p", text: "2. Step 1: w = 1 − 0.1 × 8 = 0.2. Step 2: w = 0.2 − 0.1 × 4.8 = −0.28. The distance (2, then 1.2, then 0.72) shrinks by 1 − 0.4 = 0.6 each step." },
      { type: "p", text: "3. η = 0.5: factor 1 − 2 = −1, so w bounces between 1 and −3 forever. η = 0.6: factor −1.4, so the distance grows by 40% every step — divergence." },
    ],
  },

  quiz: [
    {
      question: "The gradient at the current point is 4 and the learning rate is 0.25. What is the update?",
      options: ["w increases by 1", "w decreases by 1", "w decreases by 4", "w is multiplied by 0.25"],
      answer: 1,
      explanation: "w ← w − η·gradient = w − 0.25 × 4 = w − 1.",
    },
    {
      question: "A training loss curve rises steadily and then shows NaN. What is the most likely cause?",
      options: ["The learning rate is too small", "The learning rate is too large", "The model is underfitting", "Too few epochs"],
      answer: 1,
      explanation: "Steps that overshoot by more than they correct grow until the numbers overflow.",
    },
    {
      question: "A quadratic loss has curvatures 1 and 50. Roughly what learning rates converge?",
      options: ["Below 2", "Below 0.04", "Below 1", "Any positive rate"],
      answer: 1,
      explanation: "η < 2/λ_max = 2/50 = 0.04. The gentle direction will then be slow — a narrow valley.",
    },
    {
      question: "What does momentum do on a narrow valley?",
      options: [
        "Makes every step smaller",
        "Builds speed along the consistent downhill direction while side-to-side oscillations partly cancel",
        "Finds the global minimum of any function",
        "Removes the need for a learning rate",
      ],
      answer: 1,
      explanation: "The velocity accumulates gradients that agree from step to step and damps those that flip sign.",
    },
    {
      question: "Why might two training runs of the same neural network, with different random seeds, end at different losses?",
      options: [
        "Gradient descent is broken",
        "The loss is non-convex, so different starts can settle in different minima",
        "The learning rate changed",
        "Neural networks have only one minimum",
      ],
      answer: 1,
      explanation: "As on the two-valley surface, where gradient descent ends depends on where it starts (and, with mini-batches, on the noise along the way).",
    },
  ],

  glossary: [
    { term: "Loss function", definition: "The quantity training minimises: a measure of how wrong the model is." },
    { term: "Gradient descent", definition: "Repeatedly stepping against the gradient to reduce a function." },
    { term: "Learning rate", definition: "The step size multiplier η in gradient descent." },
    { term: "Divergence", definition: "When steps overshoot more and more and the loss grows without bound." },
    { term: "Curvature", definition: "How quickly the slope changes; the second derivative along a direction." },
    { term: "Condition number", definition: "The ratio of the largest to the smallest curvature; large means a narrow valley." },
    { term: "Momentum", definition: "Adding a fraction of the previous step to the current one." },
    { term: "Convex function", definition: "A function whose chords lie above its graph; it has no separate local minima." },
    { term: "Local minimum", definition: "A point lower than everything near it, but not necessarily the lowest overall." },
    { term: "Stochastic gradient descent", definition: "Gradient descent using the gradient on a random mini-batch at each step." },
  ],

  references: [
    {
      title: "Why Momentum Really Works",
      source: "Gabriel Goh, Distill, 2017",
      url: "https://distill.pub/2017/momentum/",
      note: "Interactive explanation of gradient descent on ill-conditioned problems, the condition number, and how momentum changes the convergence rate.",
    },
    {
      title: "Mathematics for Machine Learning, chapter 7 (Continuous Optimization)",
      source: "Deisenroth, Faisal & Ong, Cambridge University Press, 2020",
      url: "https://mml-book.github.io/",
      note: "Free PDF. Gradient descent, step sizes, momentum, stochastic gradient descent and convexity.",
    },
    {
      title: "Deep Learning, chapter 8 (Optimization for Training Deep Models)",
      source: "Goodfellow, Bengio & Courville, MIT Press, 2016",
      url: "https://www.deeplearningbook.org/",
      note: "Ill-conditioning, local minima and saddle points, momentum and adaptive methods in neural-network training.",
    },
  ],

  next: [
    { pathSlug: "deep-learning", topicSlug: "gradient-descent-optimizers", reason: "Mini-batches, Adam and learning-rate schedules in real networks." },
    { pathSlug: "ml-foundations", topicSlug: "learning-from-data", reason: "Gradient descent fitting a real (small) model, with feature scaling." },
    { pathSlug: "deep-learning", topicSlug: "backpropagation", reason: "How the gradient that drives each step is computed for a whole network." },
  ],

  teaching: {
    notes: [
      "Do the five hand steps on the board first; the factor 0.8 per step makes the stability rule obvious before any formula.",
      "In the experiment, have the class predict each learning rate’s behaviour on the narrow valley before revealing it.",
      "Connect “unscaled features” to the narrow valley: standardising is a way of making the valley round.",
    ],
    demo: "Roll a marble in a long, narrow trough (a folded sheet of card) from one corner. It rattles from side to side and creeps along. Tilt it more and it rattles harder without going faster — the steep direction limits the step. Then roll a heavier ball: it keeps moving along the trough, like momentum.",
    discussion: [
      "Why might a learning rate that works early in training cause trouble later, or the reverse?",
      "If you could rescale the parameters to make every curvature equal, what learning rate would you choose, and how fast would it converge?",
      "Is it a problem that neural networks end in different minima with different seeds? When would it matter?",
    ],
    misconceptions: [
      "“A smaller learning rate is always safer.” It can be too slow to reach a useful solution in the time available.",
      "“Gradient descent will eventually find the global minimum if run long enough.” Not on non-convex losses.",
      "“Momentum is a different optimiser that doesn’t need tuning.” It adds a setting that interacts with the learning rate.",
    ],
    challenge: {
      prompt:
        "For the valley L = ½(w₁² + 10w₂²) without momentum, which learning rate makes the slower of the two directions shrink fastest, and what is that per-step factor? Counting steps from (−2.5, 2) with the experiment’s code, η = 0.17 reaches the minimum in 22 steps, while the rate you found takes 26. Why isn’t the best worst-case rate the fastest here?",
      answer: [
        {
          type: "p",
          text: "Each step multiplies w₁ by 1 − η and w₂ by 1 − 10η. The worse of the two factors is smallest when they have equal size: 1 − η = 10η − 1, so η = 2/11 ≈ 0.18, where both shrink by 9/11 ≈ 0.82 per step.",
        },
        {
          type: "p",
          text: "That rate is best for the slowest possible start. From (−2.5, 2), the steep w₂ direction carries 20 of the starting loss of 23.1. At η = 0.17 it shrinks by |1 − 1.7| = 0.7 per step instead of 0.82, while w₁ shrinks only a little more slowly (0.83 instead of 0.82) — so for this start, the loss falls below 0.001 sooner.",
        },
      ],
    },
  },
};
