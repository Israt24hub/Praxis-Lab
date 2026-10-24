import type { Lesson } from "../../types/content";

/*
 * Loss functions. Lab numbers come from src/lib/losses.ts and are checked in
 * tests/deep-learning.test.ts; the code output was produced by running the script
 * with PyTorch. The delivery times are invented.
 */
export const lossFunctions: Lesson = {
  id: "loss-functions",
  pathSlug: "deep-learning",
  topicSlug: "loss-functions",
  title: "Loss functions",
  summary:
    "Training needs one number that says how wrong the network is, and that is smooth enough to follow downhill. The loss you choose decides what “best” means — and it is rarely the same number you report at the end.",
  level: "intermediate",
  minutes: [45, 60],
  objectives: [
    "Choose a loss for **regression** (mean squared or absolute error) and for **classification** (cross-entropy)",
    "Compute **mean squared error**, **binary cross-entropy** and **softmax cross-entropy** by hand",
    "Explain why cross-entropy, not squared error, pairs with a sigmoid or softmax output — using the **gradient**",
    "Explain why the loss you train on is not the **metric** you report, and how one outlier moves the best prediction",
  ],
  prerequisites: [
    { label: "Forward propagation", href: "/learn/deep-learning/forward-propagation" },
    { label: "Probability and statistics", href: "/learn/math-foundations/probability-statistics" },
    { label: "Derivatives and gradients", href: "/learn/math-foundations/derivatives-gradients" },
  ],

  intro: [
    {
      type: "p",
      text: "A forward pass ends with predictions. A **loss function** compares them with the right answers and returns one number: 0 when every prediction is perfect, larger the worse they are. Training is nothing more than adjusting the weights to make that number smaller.",
    },
    {
      type: "p",
      text: "Two losses cover most of deep learning: **mean squared error** for predicting numbers and **cross-entropy** for predicting classes. This lesson shows what each one rewards and why the pairing matters.",
    },
  ],

  why: [
    {
      type: "p",
      text: "Gradient descent needs a number whose slope it can follow. Accuracy — the share of correct answers — does not work: nudging a weight slightly almost never changes it, so its slope is zero almost everywhere. The loss is a smooth stand-in that keeps improving even when accuracy does not move.",
    },
    {
      type: "p",
      text: "The choice is not neutral. Squared error makes one large mistake count more than many small ones, so its best constant prediction is the mean; absolute error’s is the median. Cross-entropy punishes confident wrong answers without limit. These choices shape what the trained model does.",
    },
  ],

  explanation: {
    beginner: [
      {
        type: "p",
        text: "For a number, the natural question is “how far off was I?”. **Squared error** squares that distance, so being 10 minutes late on a delivery estimate costs 100 and being 1 minute late costs 1. Averaged over all examples, that is the mean squared error.",
      },
      {
        type: "p",
        text: "For a yes/no question, the network gives a probability p of “yes”. **Cross-entropy** asks: how much probability did you give to what actually happened? If the answer was yes, the loss is −ln p. Saying 0.9 for something that happened costs 0.11; saying 0.01 costs 4.6. Being sure and wrong is very expensive.",
      },
      {
        type: "p",
        text: "With several classes, softmax turns the network’s scores into probabilities that add up to 1, and cross-entropy is again −ln of the probability given to the true class.",
      },
      {
        type: "p",
        text: "At the end, you still report the thing people care about — accuracy, recall, average error in minutes. The loss is the tool for training, the metric is the result.",
      },
    ],
    technical: [
      {
        type: "p",
        text: "For targets yᵢ and predictions ŷᵢ, MSE = (1/n) Σ (ŷᵢ − yᵢ)² and MAE = (1/n) Σ |ŷᵢ − yᵢ|. Over constant predictions c, MSE is minimised by the mean of the targets and MAE by their median, which is why MAE is robust to outliers. Huber loss is quadratic near zero and linear for large errors, a compromise between the two.",
      },
      {
        type: "p",
        text: "For a binary label y ∈ {0, 1} and p = σ(z), binary cross-entropy is −[y ln p + (1 − y) ln(1 − p)]. It is the negative log-likelihood of a Bernoulli model, so minimising it is maximum-likelihood estimation. Its gradient with respect to the logit simplifies to ∂L/∂z = p − y.",
      },
      {
        type: "p",
        text: "Squared error on a sigmoid output has ∂/∂z (p − y)² = 2(p − y)·p(1 − p). The factor p(1 − p) goes to zero when p is near 0 or 1 — including when the prediction is confidently wrong — so learning stalls exactly when it is most needed. For softmax with logits z and true class k, cross-entropy is log Σⱼ e^(zⱼ) − z_k, with gradient softmax(z) − onehot(k).",
      },
      {
        type: "p",
        text: "Frameworks combine the output activation with the loss for numerical stability: PyTorch’s `BCEWithLogitsLoss` and `CrossEntropyLoss` take logits, not probabilities, and both average over the batch by default.",
      },
    ],
  },

  analogy: {
    title: "Two ways to grade a weather forecaster",
    blocks: [
      {
        type: "p",
        text: "Squared error grades a temperature forecast by how many degrees it missed, squared, so one wildly wrong day dominates the season. Cross-entropy grades a rain forecast by the probability it gave to what happened: a forecaster who said “1% chance” on a day it poured is punished far more than one who said “40%”.",
      },
      {
        type: "p",
        text: "In both cases the grade is designed to reward honest, calibrated forecasts — but neither is the thing the public cares about, which is whether to take an umbrella.",
      },
    ],
  },

  workedExample: {
    title: "Four yes/no predictions, three ways",
    blocks: [
      { type: "p", text: "A network predicts the probability of “yes” for four examples whose true labels are 1, 0, 1, 1." },
      {
        type: "table",
        caption: "Per-example losses",
        head: ["Example", "label y", "predicted p", "cross-entropy", "squared error", "right at 0.5?"],
        rows: [
          ["1", "1", "0.9", "−ln 0.9 = 0.1054", "0.01", "yes"],
          ["2", "0", "0.2", "−ln 0.8 = 0.2231", "0.04", "yes"],
          ["3", "1", "0.6", "−ln 0.6 = 0.5108", "0.16", "yes"],
          ["4", "1", "0.3", "−ln 0.3 = 1.2040", "0.49", "no"],
          ["Mean", "", "", "**0.5108**", "**0.175**", "**75%**"],
        ],
      },
      {
        type: "p",
        text: "If training nudged example 4’s probability from 0.3 to 0.45, its cross-entropy would fall from 1.204 to 0.799 while accuracy stayed at 75%. Only when p crosses 0.5 does accuracy jump to 100%. The loss sees every improvement; the metric sees only threshold crossings.",
      },
      {
        type: "p",
        text: "For three classes with logits (2, 1, 0) when the first class is the true one: softmax gives (0.665, 0.245, 0.090), and the loss is −ln 0.665 = **0.408**. Had the third class been the true one, the loss would be −ln 0.090 = 2.408.",
      },
    ],
  },

  math: {
    blocks: [
      { type: "equation", expression: "MSE = (1/n) Σᵢ (ŷᵢ − yᵢ)²,   MAE = (1/n) Σᵢ |ŷᵢ − yᵢ|", meaning: "Regression losses. The best constant is the mean for MSE and the median for MAE." },
      { type: "equation", expression: "BCE = −(1/n) Σᵢ [yᵢ ln pᵢ + (1 − yᵢ) ln(1 − pᵢ)],   pᵢ = σ(zᵢ)", meaning: "Binary cross-entropy: the negative log-likelihood of the labels." },
      { type: "equation", expression: "∂BCE/∂zᵢ = (pᵢ − yᵢ)/n", meaning: "Sigmoid and log cancel: the gradient is just the error." },
      { type: "equation", expression: "∂(p − y)²/∂z = 2(p − y) · p(1 − p)", meaning: "Squared error through a sigmoid keeps the sigmoid’s slope, which vanishes when p is near 0 or 1." },
      { type: "equation", expression: "CE = log Σⱼ e^(zⱼ) − z_k,   ∂CE/∂z = softmax(z) − onehot(k)", meaning: "Softmax cross-entropy for one example with true class k." },
    ],
    notation: [
      { symbol: "yᵢ, ŷᵢ", meaning: "True value and prediction for example i" },
      { symbol: "zᵢ, pᵢ", meaning: "Logit and predicted probability (pᵢ = σ(zᵢ))" },
      { symbol: "k", meaning: "Index of the true class" },
      { symbol: "onehot(k)", meaning: "A vector of zeros with a 1 in position k" },
      { symbol: "n", meaning: "Number of examples averaged over" },
    ],
  },

  process: {
    title: "Choosing and using a loss",
    steps: [
      { title: "Name the output", text: "A number (regression), one yes/no (binary), or one of K classes (multi-class)." },
      { title: "Pick the matching loss", text: "MSE (or MAE/Huber with outliers); BCEWithLogitsLoss; CrossEntropyLoss." },
      { title: "Feed it logits", text: "Leave the last layer without an activation; the loss applies sigmoid or softmax itself, stably." },
      { title: "Check the starting loss", text: "Untrained, K balanced classes should give about ln K (0.693 for two classes)." },
      { title: "Report a metric separately", text: "Accuracy, recall, error in real units — chosen for the people who use the model." },
    ],
  },

  interactive: {
    component: "loss-lab",
    kind: "computation",
    intro:
      "Three panels, each computed in your browser: one prediction scored by cross-entropy and squared error with their gradients, softmax over three classes, and the effect of one outlier on the mean and the median.",
    tryThis: [
      "In panel 1, keep y = 1 and move p from 0.99 down to 0.01. Compare how the two losses grow.",
      "At p = 0.01, compare the two gradients. Which loss would push the network harder to fix this mistake?",
      "At p = 0.5, read the cross-entropy. Where have you seen that number before?",
      "In panel 2, keep cat as the true class and raise the cat logit from 2 to 3. Does the prediction change? Does the loss?",
      "In panel 2, add 1 to every logit. What happens to the probabilities?",
      "In panel 3, move the eighth delivery from 25 to 120 minutes. Watch the mean and the median.",
    ],
    expect: [
      { action: "y = 1, p = 0.01", result: "Cross-entropy 4.6052, squared error 0.9801; gradients −0.9900 and −0.0196: cross-entropy’s is about 50× larger." },
      { action: "y = 1, p = 0.1", result: "Cross-entropy 2.3026, squared error 0.81; gradients −0.9 and −0.162 (5.6× apart)." },
      { action: "p = 0.5", result: "Cross-entropy 0.6931 = ln 2, the loss of a coin flip." },
      { action: "Logits (2, 1, 0), true class cat", result: "Probabilities 0.665, 0.245, 0.090; loss 0.4076; gradient (−0.3348, 0.2447, 0.0900)." },
      { action: "Cat logit raised to 3", result: "Still right; P(cat) 0.844 and the loss falls to 0.1698. The loss rewards confidence that accuracy ignores." },
      { action: "Eighth delivery at 120 minutes", result: "The mean moves from 24.63 to 36.50; the median stays at 25." },
    ],
  },

  code: {
    label: "losses.py",
    language: "Python",
    source: `import torch
from torch import nn

# Four yes/no predictions, given to the loss as logits.
p = torch.tensor([0.9, 0.2, 0.6, 0.3])
logits = torch.log(p / (1 - p))              # the logits behind these probabilities
y = torch.tensor([1.0, 0.0, 1.0, 1.0])
print(round(nn.BCEWithLogitsLoss()(logits, y).item(), 4))
print(round(nn.MSELoss()(torch.sigmoid(logits), y).item(), 4))
print(((logits > 0).float() == y).float().mean().item())   # accuracy

# Three classes: one example's logits, true class 0.
z = torch.tensor([[2.0, 1.0, 0.0]], requires_grad=True)
loss = nn.CrossEntropyLoss()(z, torch.tensor([0]))
loss.backward()
print(round(loss.item(), 4), z.grad.numpy().round(4))

# A confidently wrong prediction: y = 1, p = 0.01. Gradient with respect to the logit.
for loss_fn in (lambda q: nn.BCEWithLogitsLoss()(q, torch.tensor(1.0)),
                lambda q: nn.MSELoss()(torch.sigmoid(q), torch.tensor(1.0))):
    q = torch.log(torch.tensor(0.01 / 0.99)).requires_grad_()
    loss_fn(q).backward()
    print(round(q.grad.item(), 4))

# Regression: the best constant under squared and absolute error.
times = torch.tensor([22., 25., 24., 27., 23., 26., 25., 120.])
print(times.mean().item(), times.median().item())`,
    walkthrough: [
      { lines: "5–7", text: "The worked example’s probabilities, converted to logits, because the loss expects the network’s raw output." },
      { lines: "8–10", text: "Mean binary cross-entropy, mean squared error and accuracy for the same four predictions." },
      { lines: "13–16", text: "CrossEntropyLoss takes logits and integer class labels; backward() fills z.grad with softmax(z) − onehot." },
      { lines: "19–23", text: "The gradient with respect to the logit for a confidently wrong prediction, under each loss." },
      { lines: "26–27", text: "The mean and median of the delivery times, with one at 120 minutes." },
    ],
    shapes: [
      { name: "logits, y", shape: "(4,)", meaning: "One logit and one label per example" },
      { name: "z", shape: "(1, 3)", meaning: "A batch of one example, three class logits" },
      { name: "class labels", shape: "(1,)", meaning: "Integer index of the true class, not one-hot" },
      { name: "loss", shape: "() scalar", meaning: "Averaged over the batch" },
    ],
    output: {
      label: "Output",
      text: "0.5108\n0.175\n0.75\n0.4076 [[-0.3348  0.2447  0.09  ]]\n-0.99\n-0.0196\n36.5 25.0",
      note: "Produced by running the script with PyTorch, in 32-bit floats. The numbers match the worked example and the experiment.",
    },
  },

  useCases: [
    {
      title: "Image and text classifiers",
      text: "Almost every classifier, from digit recognition to a language model predicting the next token, is trained with softmax cross-entropy over its classes or vocabulary.",
    },
    {
      title: "Forecasting quantities",
      text: "Demand, prices and travel times are often trained with MSE; when a few extreme values would dominate, MAE or Huber loss gives a model that follows the typical case.",
    },
    {
      title: "Imbalanced yes/no problems",
      text: "For rare positives such as fraud, BCEWithLogitsLoss’s `pos_weight` argument makes each missed positive cost more — a way to encode that the two kinds of mistake are not equally bad.",
    },
  ],

  mistakes: [
    {
      kind: "mistake",
      title: "Softmax or sigmoid before the loss",
      text: "CrossEntropyLoss and BCEWithLogitsLoss apply them internally. Applying them again squashes the outputs twice: the model trains, but slowly and to a worse place.",
    },
    {
      kind: "mistake",
      title: "Squared error for classification",
      text: "With a sigmoid output, its gradient fades when the network is confidently wrong (about 50× smaller than cross-entropy’s at p = 0.01 in the experiment), so mistakes are corrected slowly.",
    },
    {
      kind: "mistake",
      title: "Taking the log of 0",
      text: "Computing −ln p from probabilities yourself gives infinity when p rounds to 0. Work from logits with the framework’s combined loss, which uses a stable formula.",
    },
    {
      kind: "misconception",
      title: "“Lower loss always means better accuracy”",
      text: "Usually, but not always: the loss can fall because correct predictions became more confident while a few wrong ones got worse. Always check the metric on validation data.",
    },
    {
      kind: "limitation",
      title: "A loss value has no units you can compare across problems",
      text: "A cross-entropy of 0.4 means different things with 2 classes and with 1,000. Compare a loss with its own starting value (about ln K) and with other models on the same data.",
    },
  ],

  exercise: {
    prompt: [
      { type: "p", text: "A three-class network outputs logits (1, 3, 0) for an example whose true class is the second." },
      {
        type: "list",
        ordered: true,
        items: [
          "Compute the softmax probabilities (to three decimals) and the cross-entropy loss.",
          "Give the gradient of the loss with respect to the three logits.",
          "A binary classifier predicts p = 0.8 for a positive example. Compute its binary cross-entropy and its gradient with respect to the logit.",
          "Five house prices are 200, 210, 190, 205 and 900 (thousands). What constant prediction minimises MSE, and which minimises MAE?",
        ],
      },
    ],
    hints: [
      "e¹ ≈ 2.718, e³ ≈ 20.086, e⁰ = 1.",
      "The gradient is the probabilities minus a one-hot vector for the true class.",
      "Mean and median.",
    ],
    solution: [
      { type: "p", text: "Sum = 2.718 + 20.086 + 1 = 23.804. Probabilities ≈ (**0.114, 0.844, 0.042**). Loss = −ln 0.844 ≈ **0.170**." },
      { type: "p", text: "Gradient = (0.114, 0.844 − 1, 0.042) = **(0.114, −0.156, 0.042)**: push the true class up, the others down." },
      { type: "p", text: "BCE = −ln 0.8 ≈ **0.223**; ∂L/∂z = p − y = **−0.2**." },
      { type: "p", text: "MSE: the mean, (200 + 210 + 190 + 205 + 900) ÷ 5 = **341**. MAE: the median, **205**." },
    ],
  },

  quiz: [
    {
      question: "Which loss should a network predicting one of 10 digit classes use in PyTorch?",
      options: ["MSELoss on the softmax output", "CrossEntropyLoss on the logits", "BCEWithLogitsLoss on the argmax", "L1Loss on the class index"],
      answer: 1,
      explanation: "CrossEntropyLoss takes raw logits and integer labels, applying log-softmax internally.",
    },
    {
      question: "For p = σ(z) and binary cross-entropy, what is ∂L/∂z?",
      options: ["p(1 − p)", "p − y", "2(p − y)", "−ln p"],
      answer: 1,
      explanation: "The sigmoid’s slope cancels with the derivative of the log, leaving the prediction error p − y.",
    },
    {
      question: "An untrained classifier with 4 balanced classes predicts 0.25 for every class. What loss do you expect?",
      options: ["0", "0.25", "ln 4 ≈ 1.386", "4"],
      answer: 2,
      explanation: "−ln 0.25 = ln 4. A starting loss far from this suggests a bug or a bad initialisation.",
    },
    {
      question: "Why is accuracy not used as the training loss?",
      options: [
        "It is too slow to compute",
        "Its slope is zero almost everywhere, so gradient descent cannot follow it",
        "It can be larger than 1",
        "It ignores the labels",
      ],
      answer: 1,
      explanation: "Small weight changes rarely move a prediction across the threshold, so accuracy is flat between jumps.",
    },
    {
      question: "One delivery took 120 minutes instead of about 25. Which constant prediction barely moves?",
      options: ["The one minimising squared error (the mean)", "The one minimising absolute error (the median)", "Both move equally", "Neither moves"],
      answer: 1,
      explanation: "The median depends only on order, so one extreme value moves it little or not at all; the mean moved from 24.6 to 36.5.",
    },
  ],

  glossary: [
    { term: "Loss function", definition: "A function of predictions and targets that training minimises." },
    { term: "Mean squared error (MSE)", definition: "The average of squared errors; minimised by the mean." },
    { term: "Mean absolute error (MAE)", definition: "The average of absolute errors; minimised by the median, robust to outliers." },
    { term: "Cross-entropy", definition: "−ln of the probability given to the true class, averaged over examples." },
    { term: "Logit", definition: "A raw score before sigmoid or softmax; what PyTorch’s classification losses expect." },
    { term: "Negative log-likelihood", definition: "−ln of the probability a model gives the observed data; cross-entropy is an example." },
    { term: "Metric", definition: "The number reported to judge a model (accuracy, recall, error in minutes), which need not be differentiable." },
    { term: "Huber loss", definition: "Squared error for small errors and absolute error for large ones." },
  ],

  references: [
    {
      title: "Deep Learning, section 6.2 (Gradient-Based Learning: cost functions and output units)",
      source: "Goodfellow, Bengio & Courville, MIT Press, 2016",
      url: "https://www.deeplearningbook.org/",
      note: "Losses as maximum likelihood, and why sigmoid and softmax outputs pair with cross-entropy rather than squared error.",
    },
    {
      title: "torch.nn.CrossEntropyLoss",
      source: "PyTorch documentation",
      url: "https://docs.pytorch.org/docs/stable/generated/torch.nn.CrossEntropyLoss.html",
      note: "Expects unnormalised logits; averages over the batch by default.",
    },
    {
      title: "torch.nn.BCEWithLogitsLoss",
      source: "PyTorch documentation",
      url: "https://docs.pytorch.org/docs/stable/generated/torch.nn.BCEWithLogitsLoss.html",
      note: "Sigmoid and binary cross-entropy in one numerically stable function, with a pos_weight option for imbalance.",
    },
  ],

  next: [
    { pathSlug: "deep-learning", topicSlug: "backpropagation", reason: "The loss’s gradient, p − y, is where the backward pass starts." },
    { pathSlug: "ml-foundations", topicSlug: "metrics-cross-validation", reason: "The metrics you report after training with a loss." },
    { pathSlug: "deep-learning", topicSlug: "gradient-descent-optimizers", reason: "Following the loss downhill, step by step." },
  ],

  teaching: {
    notes: [
      "Start from accuracy and ask why we cannot train on it; the flat-between-jumps argument motivates every loss.",
      "Make students compute −ln 0.01 and −ln 0.9 before introducing the formula: the asymmetry is the lesson.",
      "Keep the gradient comparison concrete: the experiment’s 50× difference at p = 0.01 is memorable.",
    ],
    demo: "Ask the class for the probability that it rains tomorrow, on cards. The next day, compute everyone’s −ln of the probability they gave to what happened. The confident wrong forecasters score worst; discuss whether that is fair.",
    discussion: [
      "When might you prefer a model that is right on average (MSE) over one that is right typically (MAE)?",
      "Why might a loss keep falling while validation accuracy stays the same?",
      "If missing a fraud case costs 100 times more than a false alarm, where in training and evaluation should that show up?",
    ],
    misconceptions: [
      "Treating the loss value as a percentage or as directly comparable across tasks.",
      "Applying softmax before CrossEntropyLoss.",
      "Believing a model with lower training loss is always the better model.",
    ],
    challenge: {
      prompt:
        "Show that for constant predictions c, the mean squared error (1/n) Σ (c − yᵢ)² is smallest at the mean of the yᵢ.",
      answer: [
        { type: "p", text: "Differentiate with respect to c: (2/n) Σ (c − yᵢ) = 2c − (2/n) Σ yᵢ." },
        { type: "p", text: "Setting this to zero gives c = (1/n) Σ yᵢ, the mean. The second derivative is 2 > 0, so it is a minimum." },
      ],
    },
  },
};
