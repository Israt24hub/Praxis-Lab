import type { Lesson } from "../../types/content";

/*
 * Regularization and training diagnostics. Lab numbers come from
 * src/lib/regularization.ts (seeded data and training) and are checked in
 * tests/deep-learning.test.ts; the code output was produced by running the script with
 * PyTorch on its own randomly generated data.
 */
export const regularizationDiagnostics: Lesson = {
  id: "regularization-diagnostics",
  pathSlug: "deep-learning",
  topicSlug: "regularization-diagnostics",
  title: "Regularization and training diagnostics",
  summary:
    "A network big enough to learn is big enough to memorise. Weight decay, dropout and early stopping keep it honest, and a few habits — reading the two loss curves, overfitting one batch on purpose — find most training bugs before they cost a day.",
  level: "intermediate",
  minutes: [55, 75],
  objectives: [
    "Apply **weight decay**, **dropout** and **early stopping**, and say what each one changes",
    "Read **training and validation curves** to tell overfitting, underfitting and a broken run apart",
    "**Overfit a single batch** on purpose, and recognise common bugs from how that check fails",
    "Explain what **batch normalisation** does and why it behaves differently in training and evaluation",
  ],
  prerequisites: [
    { label: "Overfitting, underfitting and generalization", href: "/learn/ml-foundations/overfitting-generalization" },
    { label: "Gradient descent and optimizers", href: "/learn/deep-learning/gradient-descent-optimizers" },
    { label: "Training, validation and testing", href: "/learn/ml-foundations/train-validation-test" },
  ],

  intro: [
    {
      type: "p",
      text: "Neural networks usually have far more parameters than they strictly need. Given enough training, they can fit the training data almost perfectly — including its noise — and then do worse on anything new. **Regularization** is the set of techniques that trade a little training fit for better generalisation.",
    },
    {
      type: "p",
      text: "The second half of this lesson is about **diagnostics**: how to tell from a training run whether the problem is overfitting, underfitting, or simply a bug.",
    },
  ],

  why: [
    {
      type: "p",
      text: "In the experiment, a network with 193 parameters learns from just 15 points. Its validation loss is best after 327 epochs and then doubles while the training loss keeps falling — the classic sign of a network memorising noise. Each regularizer in this lesson pulls that validation loss back down.",
    },
    {
      type: "p",
      text: "Training runs fail silently. A missing `zero_grad()`, a flipped sign or a forgotten activation rarely raises an error; the loss just behaves oddly. Knowing what each failure looks like on a loss curve saves hours, and a five-minute sanity check catches most of them before a long run.",
    },
  ],

  explanation: {
    beginner: [
      {
        type: "p",
        text: "**Weight decay** gently shrinks every weight a little at each step. Large weights let a network bend sharply to pass through every noisy point; keeping them small keeps the fitted curve smoother.",
      },
      {
        type: "p",
        text: "**Dropout** switches off a random fraction of hidden units at every training step, so the network cannot rely on any one unit. It must spread what it learns across many, which tends to generalise better. At evaluation time every unit is used.",
      },
      {
        type: "p",
        text: "**Early stopping** watches the validation loss and keeps the weights from the epoch where it was lowest, stopping once it has not improved for a while.",
      },
      {
        type: "p",
        text: "**Reading the curves.** Both losses high: the model is too weak or not trained enough (underfitting). Training falls but validation rises: overfitting. Loss jumping around, growing, or flat from the very first step: probably a bug or a bad learning rate.",
      },
    ],
    technical: [
      {
        type: "p",
        text: "**L2 regularisation** adds (λ/2)‖w‖² to the loss, so the gradient gains λw. **Weight decay** in its decoupled form (AdamW) instead multiplies the weights by (1 − ηλ) at each step, separately from the adaptive gradient step. For plain SGD the two are the same; for Adam they differ, and decoupled decay usually works better. PyTorch’s AdamW applies it to every parameter it is given, biases included, unless you put them in a separate parameter group.",
      },
      {
        type: "p",
        text: "**Dropout** with rate p multiplies each unit’s output by a mask m ∈ {0, 1/(1−p)} drawn independently at each step (inverted dropout), so the expected value is unchanged and evaluation needs no rescaling. It can be seen as training an ensemble of thinned networks that share weights. `model.train()` and `model.eval()` switch it on and off.",
      },
      {
        type: "p",
        text: "**Early stopping** treats the number of epochs as a hyperparameter chosen on validation data: keep the best checkpoint and stop after a patience of P epochs without improvement. Because it uses the validation set to choose, that set is no longer an unbiased estimate; report final results on a separate test set.",
      },
      {
        type: "p",
        text: "**Batch normalisation** standardises each unit’s pre-activations over the batch, ẑ = (z − μ_B)/√(σ²_B + ε), then rescales with learned γ and β. It usually makes deep networks easier to train, allowing larger learning rates. In training mode it uses batch statistics and updates running averages; in evaluation mode it uses the running averages — another reason `model.eval()` matters.",
      },
    ],
  },

  analogy: {
    title: "Preparing for an exam",
    blocks: [
      {
        type: "p",
        text: "A student who memorises last year’s answers scores perfectly on last year’s paper and badly on this year’s: overfitting. Weight decay is preferring simple explanations; dropout is studying in a group where any member might be absent, so no one becomes the only person who knows a topic; early stopping is taking practice tests and stopping revision when the scores stop improving.",
      },
      {
        type: "p",
        text: "Unlike a student, a network never gets bored: without these limits it will keep memorising for as long as you let it.",
      },
    ],
  },

  workedExample: {
    title: "What each regularizer did in the experiment",
    blocks: [
      {
        type: "p",
        text: "All runs use the same 15 training points, the same 60 validation points and the same starting weights, for 2,000 epochs of full-batch AdamW (learning rate 0.01). The noise in the data alone gives a loss of about 0.06, so no model can do much better than that.",
      },
      {
        type: "table",
        caption: "Training and validation loss (mean squared error) after training",
        head: ["Setting", "training loss", "validation loss", "best validation (epoch)", "sum of squared weights"],
        rows: [
          ["No regularization", "0.018", "**0.183**", "0.093 (327)", "171.7"],
          ["Weight decay λ = 0.3", "0.027", "0.104", "0.094 (390)", "24.5"],
          ["Weight decay λ = 1", "0.038", "**0.097**", "0.092 (about 1,170)", "about 8"],
          ["Dropout p = 0.2", "0.031", "0.098", "0.089 (808)", "257.0"],
          ["Early stopping (patience 200)", "0.030", "**0.093**", "0.093 (327)", "42.8"],
        ],
      },
      {
        type: "p",
        text: "Every regularizer lowers the validation loss by trading away some training fit. Weight decay works by keeping the weights small (the sum of squares falls from 171.7 to about 8). Dropout does not shrink the weights — they are larger than without it — but makes the network rely on many units at once. Early stopping simply stops at epoch 527 and restores the weights from epoch 327.",
      },
      {
        type: "p",
        text: "Dropout by hand: with p = 0.5, hidden outputs (2, 4, 6, 8) and a mask that keeps units 1 and 3 become (4, 0, 12, 0) — kept units are doubled, so the expected value of each unit is unchanged.",
      },
    ],
  },

  math: {
    blocks: [
      { type: "equation", expression: "L_reg(w) = L(w) + (λ/2)‖w‖²   ⇒   ∇L_reg = ∇L + λw", meaning: "L2 regularisation: a penalty on large weights." },
      { type: "equation", expression: "w ← (1 − ηλ) w − η · adam_step(∇L)", meaning: "Decoupled weight decay (AdamW): shrink, then take Adam’s step." },
      { type: "equation", expression: "h̃ = m ⊙ h,   mⱼ = 0 with probability p, else 1/(1−p)", meaning: "Inverted dropout during training; E[h̃] = h, so evaluation uses h unchanged." },
      { type: "equation", expression: "stop at epoch e when e − e_best ≥ P; keep the weights from e_best", meaning: "Early stopping with patience P." },
      { type: "equation", expression: "ẑ = γ (z − μ_B) / √(σ²_B + ε) + β", meaning: "Batch normalisation of one unit over a batch, with learned scale γ and shift β." },
    ],
    notation: [
      { symbol: "λ", meaning: "Weight decay (regularisation) strength" },
      { symbol: "p", meaning: "Dropout probability" },
      { symbol: "m", meaning: "Dropout mask, redrawn at every training step" },
      { symbol: "P, e_best", meaning: "Patience and the epoch with the best validation loss" },
      { symbol: "μ_B, σ²_B", meaning: "Mean and variance of a unit’s pre-activations over the batch" },
    ],
  },

  process: {
    title: "A debugging routine before and during training",
    steps: [
      { title: "Check the starting loss", text: "With K balanced classes it should be about ln K; for regression, about the variance of the targets." },
      { title: "Overfit one batch", text: "Train on 8–32 examples; the loss should fall towards zero. If it does not, there is a bug." },
      { title: "Train and plot both curves", text: "Training and validation loss every epoch, on a log scale." },
      { title: "Diagnose", text: "Both high: bigger model or longer training. Gap growing: regularise. Jumping or exploding: lower the learning rate or look for a bug." },
      { title: "Regularise one thing at a time", text: "Weight decay, dropout, more data or augmentation, early stopping — and compare on validation data." },
      { title: "Test once", text: "Report the chosen model on the untouched test set." },
    ],
  },

  interactive: {
    component: "regularization-lab",
    kind: "computation",
    intro:
      "Two panels, both trained in your browser. The first fits an over-sized network to 15 points with weight decay, dropout and early stopping. The second runs the overfit-one-batch check, correctly and with four simulated bugs.",
    tryThis: [
      "With no regularization and 2,000 epochs, read the two curves. When was validation loss lowest?",
      "Lower the epochs to 250, then raise them step by step back to 2,000. Watch the fitted curve.",
      "At 2,000 epochs, raise weight decay to 0.3, then 1. Watch the sum of squared weights.",
      "Set weight decay back to 0 and try dropout 0.2.",
      "Turn on early stopping with no other regularization.",
      "In panel 2, step through the five versions of the training code and match each curve to its bug.",
    ],
    expect: [
      { action: "No regularization, 2,000 epochs", result: "Training loss 0.018, validation 0.183; validation was best (0.093) at epoch 327 — overfitting." },
      { action: "250 epochs", result: "Validation 0.093, close to its best: stopping early by hand." },
      { action: "Weight decay 0.3 and 1", result: "Validation 0.104 and 0.097; sum of squared weights 24.5 and about 8 (from 171.7)." },
      { action: "Dropout 0.2", result: "Validation 0.098, with larger weights than without dropout (257.0)." },
      { action: "Early stopping", result: "Stops at epoch 527 and keeps epoch 327: validation 0.093, training 0.030." },
      { action: "Panel 2", result: "Correct code: 0.440 → 0.0022. Forgot zero_grad: jumps between about 0.13 and 4.4. Sign flipped: diverges at step 221. No activation: stalls at 0.115. Every ReLU off: stays at 0.439." },
    ],
  },

  code: {
    label: "regularization.py",
    language: "Python",
    source: `import copy
import torch
from torch import nn
F = nn.functional

torch.manual_seed(0)
f = lambda x: torch.sin(2.5 * x)                 # invented data, as in the experiment
x_train = torch.rand(15, 1) * 2 - 1
y_train = f(x_train) + 0.25 * torch.randn(15, 1)
x_val = torch.rand(60, 1) * 2 - 1
y_val = f(x_val) + 0.25 * torch.randn(60, 1)

def train(weight_decay=0.0, p_drop=0.0, epochs=2000, patience=None):
    torch.manual_seed(1)
    model = nn.Sequential(nn.Linear(1, 64), nn.Tanh(), nn.Dropout(p_drop), nn.Linear(64, 1))
    opt = torch.optim.AdamW(model.parameters(), lr=0.01, weight_decay=weight_decay)
    best, best_epoch, best_state = float("inf"), 0, None
    for epoch in range(1, epochs + 1):
        model.train()                            # dropout on
        opt.zero_grad()
        F.mse_loss(model(x_train), y_train).backward()
        opt.step()
        model.eval()                             # dropout off
        with torch.no_grad():
            val = F.mse_loss(model(x_val), y_val).item()
        if val < best:
            best, best_epoch, best_state = val, epoch, copy.deepcopy(model.state_dict())
        if patience and epoch - best_epoch >= patience:
            model.load_state_dict(best_state)    # early stopping: restore the best
            break
    with torch.no_grad():
        return (round(F.mse_loss(model(x_train), y_train).item(), 3),
                round(F.mse_loss(model(x_val), y_val).item(), 3), best_epoch)

print("plain        ", train())
print("weight decay ", train(weight_decay=1.0))
print("dropout 0.2  ", train(p_drop=0.2))
print("early stop   ", train(patience=200))

# Sanity check: a network should be able to memorise one small batch.
xb = torch.linspace(-1, 1, 8).unsqueeze(1)
yb = f(xb) + 0.25 * torch.randn(8, 1)
model = nn.Sequential(nn.Linear(1, 64), nn.ReLU(), nn.Linear(64, 1))
opt = torch.optim.Adam(model.parameters(), lr=0.01)
losses = []
for step in range(501):
    opt.zero_grad()
    loss = F.mse_loss(model(xb), yb)
    losses.append(loss.item())
    loss.backward()
    opt.step()
print("one batch: loss", round(losses[0], 3), "->", round(losses[-1], 5))`,
    walkthrough: [
      { lines: "6–11", text: "Invented data like the experiment’s: 15 training and 60 validation points around y = sin(2.5x), with noise of standard deviation 0.25." },
      { lines: "13–16", text: "The same network each time (a fixed seed), with optional dropout after the tanh layer and AdamW’s weight decay. Note AdamW’s default decay is 0.01, so 0 is passed explicitly." },
      { lines: "18–22", text: "One full-batch training step, with model.train() so dropout is active." },
      { lines: "23–27", text: "Validation with model.eval() (dropout off), remembering the best weights." },
      { lines: "28–30", text: "Early stopping: after patience epochs without a new best, restore the best weights and stop." },
      { lines: "35–38", text: "Four runs: no regularization, weight decay 1.0, dropout 0.2, early stopping with patience 200." },
      { lines: "41–52", text: "The sanity check: eight evenly spaced points, a ReLU network and 500 Adam steps. A working setup memorises them." },
    ],
    shapes: [
      { name: "x_train, y_train", shape: "(15, 1)", meaning: "15 examples, one feature and one target each" },
      { name: "x_val, y_val", shape: "(60, 1)", meaning: "Held-out validation data" },
      { name: "model[0].weight", shape: "(64, 1)", meaning: "The hidden layer: 64 units reading one input" },
      { name: "xb, yb", shape: "(8, 1)", meaning: "The single batch for the sanity check" },
    ],
    output: {
      label: "Output",
      text: "plain         (0.019, 0.229, 34)\nweight decay  (0.064, 0.213, 35)\ndropout 0.2   (0.047, 0.196, 703)\nearly stop    (0.123, 0.172, 34)\none batch: loss 0.535 -> 8e-05",
      note: "Produced by running the script with PyTorch. Each line is (training loss, validation loss, best validation epoch). The data comes from PyTorch’s own random numbers, so it differs from the experiment’s, and so do the numbers: here validation loss is lowest very early (epoch 34). The pattern is the same — every regularizer lowers the final validation loss (0.229 without one), early stopping most of all — and the one-batch check drives the loss from 0.535 to 0.00008.",
    },
  },

  useCases: [
    {
      title: "Fine-tuning on small datasets",
      text: "Adapting a large pretrained model to a few thousand labelled examples overfits easily; weight decay, dropout and early stopping on a validation set are the standard defences.",
    },
    {
      title: "Batch normalisation in image models",
      text: "Convolutional networks such as ResNets place batch normalisation after most convolutions; forgetting `model.eval()` at test time is a common source of mysteriously bad results.",
    },
    {
      title: "Debugging a new architecture",
      text: "Before a long run on a new model, practitioners check the starting loss and overfit one batch. Both take minutes and catch most wiring bugs.",
    },
  ],

  mistakes: [
    {
      kind: "mistake",
      title: "Forgetting model.eval()",
      text: "Dropout stays on and batch normalisation keeps using batch statistics during evaluation, so validation numbers are noisy and pessimistic. Switch back with model.train() before training again.",
    },
    {
      kind: "mistake",
      title: "Early stopping on the test set",
      text: "Choosing the stopping epoch with test data makes the test score optimistic. Stop on validation data and test once at the end.",
    },
    {
      kind: "mistake",
      title: "Regularising a model that underfits",
      text: "If training loss is already high, weight decay and dropout make it worse. Fix underfitting first: a bigger model, longer training or a better learning rate.",
    },
    {
      kind: "misconception",
      title: "“Passing the one-batch check means the pipeline is correct”",
      text: "It tests the model, loss, backward pass and optimizer. A network can memorise eight wrongly labelled examples just as easily as eight correct ones, so data bugs need their own checks.",
    },
    {
      kind: "limitation",
      title: "The best settings depend on the problem",
      text: "In the experiment, weight decay 1 helps; on another dataset it could cripple the model. Regularization strengths are hyperparameters to tune on validation data.",
    },
  ],

  exercise: {
    prompt: [
      { type: "p", text: "You train a network and record these losses (mean squared error):" },
      {
        type: "table",
        caption: "Three training runs",
        head: ["Run", "training loss at epochs 10 / 100 / 1,000", "validation loss at epochs 10 / 100 / 1,000"],
        rows: [
          ["A", "0.90 / 0.85 / 0.84", "0.92 / 0.88 / 0.87"],
          ["B", "0.50 / 0.10 / 0.01", "0.55 / 0.20 / 0.60"],
          ["C", "0.50 / 3.10 / NaN", "0.52 / 3.40 / NaN"],
        ],
      },
      {
        type: "list",
        ordered: true,
        items: [
          "Diagnose each run and suggest one change for each.",
          "AdamW with learning rate 0.01 and weight decay 0.5 runs for 100 steps. Ignoring the gradient steps, by what factor does decay alone shrink a weight?",
          "Dropout with p = 0.2 is applied to hidden outputs (5, 10, 15, 20) with a mask that drops the second unit. What does the layer output during training, and during evaluation?",
        ],
      },
    ],
    hints: [
      "Look at the gap between training and validation, and at whether the training loss itself goes down.",
      "Each step multiplies the weight by (1 − ηλ).",
      "Kept units are divided by 1 − p.",
    ],
    solution: [
      { type: "p", text: "**A: underfitting** — both losses high and flat. Use a bigger model, train longer, or raise the learning rate. **B: overfitting** — training keeps falling while validation turns up after epoch 100. Add weight decay or dropout, get more data, or stop early. **C: diverging** — the loss grows and becomes NaN. Lower the learning rate (and check for bugs, or clip gradients)." },
      { type: "p", text: "1 − 0.01 × 0.5 = 0.995 per step; 0.995¹⁰⁰ ≈ **0.606**." },
      { type: "p", text: "Training: kept units are divided by 0.8, giving **(6.25, 0, 18.75, 25)**. Evaluation: dropout is off, so **(5, 10, 15, 20)**." },
    ],
  },

  quiz: [
    {
      question: "Training loss keeps falling while validation loss has been rising for 500 epochs. What is happening?",
      options: ["Underfitting", "Overfitting", "The learning rate is too low", "The data is too easy"],
      answer: 1,
      explanation: "The network is fitting the training data, including its noise, better and better while generalising worse.",
    },
    {
      question: "Why does inverted dropout scale the kept units by 1/(1 − p) during training?",
      options: [
        "To make training faster",
        "So each unit’s expected output is unchanged, and evaluation needs no rescaling",
        "To make the weights smaller",
        "Because PyTorch requires it",
      ],
      answer: 1,
      explanation: "A unit kept with probability 1 − p and scaled by 1/(1 − p) has the same expected value as without dropout.",
    },
    {
      question: "What does decoupled weight decay (AdamW) do at each step?",
      options: [
        "Adds noise to the weights",
        "Multiplies the weights by (1 − ηλ), separately from the gradient step",
        "Removes the smallest weights",
        "Divides the learning rate by λ",
      ],
      answer: 1,
      explanation: "The weights shrink by a fixed fraction each step, independent of Adam’s adaptive scaling of the gradient.",
    },
    {
      question: "On one small batch, your network’s loss does not move at all from the first step. Which bug fits best?",
      options: ["A learning rate slightly too high", "Every hidden ReLU outputs 0 (or the parameters are not given to the optimizer)", "Dropout is on", "Too much data"],
      answer: 1,
      explanation: "A completely flat loss means the updates are zero or not applied: dead units, detached parameters or an optimizer that does not hold them.",
    },
    {
      question: "Why should early stopping use validation data rather than test data?",
      options: [
        "Validation data is larger",
        "Using test data to choose the epoch makes the final test score optimistically biased",
        "Test data cannot be evaluated during training",
        "Early stopping needs labels",
      ],
      answer: 1,
      explanation: "Any choice made using a dataset leaks information from it; the test set must stay untouched until the end.",
    },
  ],

  glossary: [
    { term: "Regularization", definition: "Any change to training that aims to improve generalisation rather than training fit." },
    { term: "Weight decay", definition: "Shrinking weights towards zero at every step; equivalent to an L2 penalty for SGD." },
    { term: "L2 regularisation", definition: "Adding (λ/2)‖w‖² to the loss." },
    { term: "Dropout", definition: "Randomly zeroing units during training, scaling the rest by 1/(1 − p)." },
    { term: "Early stopping", definition: "Keeping the weights from the epoch with the best validation loss and stopping after a patience period." },
    { term: "Patience", definition: "How many epochs without improvement early stopping waits before stopping." },
    { term: "Batch normalisation", definition: "Standardising each unit over the batch, then rescaling with learned parameters." },
    { term: "Sanity check", definition: "A quick test, such as overfitting one batch, that a training setup can learn at all." },
  ],

  references: [
    {
      title: "Dropout: A Simple Way to Prevent Neural Networks from Overfitting",
      source: "Nitish Srivastava, Geoffrey Hinton, Alex Krizhevsky, Ilya Sutskever & Ruslan Salakhutdinov, JMLR 15(56):1929–1958, 2014",
      url: "https://www.jmlr.org/papers/v15/srivastava14a.html",
      note: "The dropout paper, with the ensemble interpretation.",
    },
    {
      title: "Decoupled Weight Decay Regularization",
      source: "Ilya Loshchilov & Frank Hutter, arXiv:1711.05101",
      url: "https://arxiv.org/abs/1711.05101",
      note: "Shows that L2 regularisation and weight decay differ for Adam, and proposes AdamW.",
    },
    {
      title: "Batch Normalization: Accelerating Deep Network Training by Reducing Internal Covariate Shift",
      source: "Sergey Ioffe & Christian Szegedy, arXiv:1502.03167",
      url: "https://arxiv.org/abs/1502.03167",
      note: "Introduces batch normalisation and its training/evaluation behaviour.",
    },
    {
      title: "Deep Learning, chapter 7 (Regularization for Deep Learning)",
      source: "Goodfellow, Bengio & Courville, MIT Press, 2016",
      url: "https://www.deeplearningbook.org/",
      note: "Parameter norm penalties, early stopping as regularisation, and dropout.",
    },
    {
      title: "torch.nn.Dropout and torch.optim.AdamW",
      source: "PyTorch documentation",
      url: "https://docs.pytorch.org/docs/stable/generated/torch.nn.Dropout.html",
      note: "Dropout’s 1/(1 − p) scaling and identity behaviour in evaluation; AdamW’s default weight decay of 0.01.",
    },
  ],

  next: [
    { pathSlug: "computer-vision", topicSlug: "image-representation", reason: "Path D: the same training loop, applied to images." },
    { pathSlug: "ml-foundations", topicSlug: "train-validation-test", reason: "Why the validation and test sets must stay separate." },
    { pathSlug: "deep-learning", topicSlug: "gradient-descent-optimizers", reason: "Learning rates and schedules, the other half of a healthy run." },
  ],

  teaching: {
    notes: [
      "Show the unregularised run first and ask students to predict the best epoch from the curves before reading it.",
      "Keep one variable changing at a time in the experiment; the comparison table in the worked example is the model to follow.",
      "Spend real time on panel 2: recognising failure shapes is a skill students will use every week.",
    ],
    demo: "Print five loss curves without labels — correct, forgotten zero_grad, flipped sign, missing activation, dead units — and have small groups match each to its bug, then check with the experiment.",
    discussion: [
      "Why might dropout make the weights larger rather than smaller, as in the experiment?",
      "If early stopping already picks the best epoch, why use weight decay as well?",
      "Which of the four bugs would the starting-loss check catch, and which need the one-batch check?",
    ],
    misconceptions: [
      "Believing regularization always lowers the training loss (it raises it).",
      "Leaving dropout on when evaluating.",
      "Treating a passed sanity check as proof that results are correct.",
    ],
    challenge: {
      prompt:
        "The experiment’s early stopping uses a patience of 200 epochs. Explain what could go wrong with a patience of 5 on a noisy validation curve, and with a patience of 5,000.",
      answer: [
        { type: "p", text: "Patience 5: a few noisy epochs without improvement stop training long before the true minimum, often while the model still underfits." },
        { type: "p", text: "Patience 5,000: training runs far past the best epoch, wasting computation (the best weights are still restored, so the result is the same, only slower). Patience trades compute against the risk of stopping on noise." },
      ],
    },
  },
};
