import type { Lesson } from "../../types/content";

/*
 * Image classification and transfer learning. Lab numbers come from src/lib/transfer.ts
 * (four methods trained on seeded draws of the 8 × 8 digits, with source weights trained in
 * PyTorch by tests/fixtures/make_digits.py) and are checked in tests/vision.test.ts; the code
 * output was produced by running the script with PyTorch and torchvision.
 */
export const classificationTransferLearning: Lesson = {
  id: "classification-transfer-learning",
  pathSlug: "computer-vision",
  topicSlug: "classification-transfer-learning",
  title: "Image classification and transfer learning",
  summary:
    "Transfer learning starts from a network already trained on a large dataset and adapts it to a new task with few labels — by training only a new head, or by fine-tuning some layers too. It is the default for small image datasets, but it is a hypothesis to test: in the lab’s tiny experiment, pretraining barely helps.",
  level: "intermediate",
  minutes: [55, 75],
  objectives: [
    "Adapt a pretrained CNN to a new task as a **frozen feature extractor** and by **fine-tuning**",
    "Decide **which layers to freeze** from the amount of data and how close the tasks are",
    "Compare against a **training-from-scratch baseline** and a simple model, over several random draws",
    "Set up the parameter groups, learning rates and batch-norm behaviour for fine-tuning in PyTorch",
  ],
  prerequisites: [
    { label: "Pooling and CNN architectures", href: "/learn/computer-vision/pooling-cnn-architectures" },
    { label: "Regularization and training diagnostics", href: "/learn/deep-learning/regularization-diagnostics" },
    { label: "Training, validation and testing", href: "/learn/ml-foundations/train-validation-test" },
  ],

  intro: [
    {
      type: "p",
      text: "An image **classifier** maps an image to one of a fixed set of labels: a CNN backbone turns the pixels into a feature vector, and a final linear layer (the **head**) turns the features into one score per class. Trained from random weights, it needs many labelled images.",
    },
    {
      type: "p",
      text: "**Transfer learning** reuses a backbone trained on another, usually much larger, dataset — classically ImageNet’s 1,000 classes. You replace the head with one for your classes and train either the head alone (**feature extraction**) or the head plus some or all of the backbone (**fine-tuning**).",
    },
  ],

  why: [
    {
      type: "p",
      text: "Most real projects have hundreds or a few thousand labelled images, not millions. A pretrained backbone brings features — edges, textures, parts — that would take far more data to learn. The PyTorch tutorial on the subject notes that very few people train an entire CNN from scratch.",
    },
    {
      type: "p",
      text: "But transfer is not guaranteed to help, and the only way to know is a baseline. In the lab, filters pretrained on digits 0–4 are reused for digits 5–9. Averaged over ten random draws they beat training from scratch by at most 1.8 points — while one draw of training examples to the next moves each method by as much as 35 points.",
    },
  ],

  explanation: {
    beginner: [
      {
        type: "p",
        text: "**Feature extraction.** Keep the pretrained network fixed and use it as a feature maker: images go in, feature vectors come out, and only a new final layer is trained on them. Fast, and safe with very little data.",
      },
      {
        type: "p",
        text: "**Fine-tuning.** Also let some pretrained layers change, usually the last ones, with a small learning rate so the useful features are adjusted rather than destroyed.",
      },
      {
        type: "p",
        text: "**Which layers to freeze.** Early layers find generic patterns (edges, colours) and transfer to almost anything; late layers are specific to the original task. Little data and a similar task: freeze nearly everything. More data or a different kind of image: fine-tune more layers.",
      },
      {
        type: "p",
        text: "**Always compare.** Train the same network from scratch, and a simple model, on the same data. If the pretrained version is not clearly better on validation data — across several random draws — pretraining is not what is helping.",
      },
    ],
    technical: [
      {
        type: "p",
        text: "**Mechanics in PyTorch.** Load the backbone with its weights and use the weights’ own preprocessing; set `requires_grad = False` on frozen parameters; replace `model.fc` with a new `nn.Linear(in_features, n_classes)`; pass only trainable parameters to the optimiser, or use parameter groups with a lower learning rate for unfrozen backbone layers (for example 10× lower than the head). Batch-norm layers keep updating their running statistics in training mode even when frozen; keep frozen ones in `eval()` mode when the new data are few or different.",
      },
      {
        type: "p",
        text: "**What the evidence says.** Yosinski et al. found first-layer features general, transferability falling as tasks grow apart, and transferred initialisations improving generalisation even after fine-tuning. Kornblith et al. found ImageNet accuracy strongly predicts transfer accuracy across 12 datasets (r = 0.99 for fixed features, 0.96 fine-tuned), but with minimal benefit on two small fine-grained datasets. He, Girshick and Dollár showed that on COCO detection, training from scratch can match ImageNet pretraining given enough iterations, even with 10% of the data; pretraining mainly speeds up convergence.",
      },
      {
        type: "p",
        text: "**Why the lab finds little benefit.** The network is tiny (eight 3 × 3 filters on 8 × 8 images), so the features it needs are few and quick to learn from 25 examples, and a linear model on raw pixels already reaches about 91% with 5 examples per digit. Transfer pays off when the features are expensive to learn — large networks, large and varied pretraining data — and the target data are scarce. The lab shows the method of checking, not the size of the effect in real projects.",
      },
      {
        type: "p",
        text: "**Evaluating fairly.** Few-shot results vary enormously with which examples are drawn. Report the mean and spread over several draws (and seeds), use the same draws for every method, and keep a held-out test set untouched by all of them.",
      },
    ],
  },

  analogy: {
    title: "Hiring an experienced cook",
    blocks: [
      {
        type: "p",
        text: "A restaurant opening a new menu can train a novice from nothing or hire a cook trained in another cuisine. The experienced cook already knows knife skills and heat control (early layers) and only needs the new recipes (the head) — or, for a very different cuisine, some retraining of habits too (fine-tuning).",
      },
      {
        type: "p",
        text: "If the new menu is three simple dishes, though, a novice learns it just as fast, and the experience barely shows. Where the analogy fails: a network’s “experience” is a set of weights that can be measured and compared, so you can — and should — test whether it helps.",
      },
    ],
  },

  workedExample: {
    title: "Does pretraining help? Ten random draws",
    blocks: [
      {
        type: "p",
        text: "Source task: digits 0–4, learned beforehand by the small CNN. Target task: digits 5–9 from only k labelled training images per digit, drawn at random (draws 1–10, the same draws for every method). Every method trains for 150 full-batch Adam steps and is scored on all 269 test images of 5–9.",
      },
      {
        type: "table",
        caption: "Target-task test accuracy, averaged over ten draws",
        head: ["Examples per digit", "linear on pixels", "CNN from scratch", "pretrained, frozen", "pretrained, fine-tuned"],
        rows: [
          ["1", "68.6%", "69.4%", "71.1%", "**71.2%**"],
          ["2", "81.9%", "82.5%", "**83.1%**", "**83.1%**"],
          ["5", "90.7%", "91.6%", "**91.8%**", "**91.8%**"],
          ["10", "93.7%", "94.3%", "94.2%", "**94.4%**"],
          ["20", "95.6%", "95.6%", "96.0%", "**96.2%**"],
        ],
      },
      {
        type: "p",
        text: "The better of the two pretrained versions is ahead of training from scratch on average, by 0.1 to 1.8 points. Now the spread: with one example per digit, the CNN from scratch scores between 50.9% and 79.9% depending on the draw, and fine-tuning between 55.0% and 87.4%. Even with 20 per digit, scratch ranges from 92.2% to 97.8%.",
      },
      {
        type: "p",
        text: "Conclusion for this problem: the method matters less than which examples you happen to have. A single run comparing two methods would be a coin toss; the averages over draws are the honest comparison, and they show a small effect.",
      },
    ],
  },

  math: {
    blocks: [
      { type: "equation", expression: "p(y | x) = softmax( W · φ_θ(x) + b )", meaning: "A classifier: backbone φ with parameters θ, then a linear head (W, b)." },
      { type: "equation", expression: "feature extraction:  min_(W,b) L,   θ = θ_pretrained fixed", meaning: "Only the head is trained." },
      { type: "equation", expression: "fine-tuning:  min_(W,b,θ) L,   θ initialised at θ_pretrained,  η_θ < η_head", meaning: "Everything is trained, the backbone with a smaller learning rate." },
      { type: "equation", expression: "trainable parameters (ResNet-18, new 5-class head) = 512 × 5 + 5 = 2,565", meaning: "Feature extraction trains only the head’s weights and biases." },
    ],
    notation: [
      { symbol: "φ_θ(x)", meaning: "The backbone’s feature vector for image x (512 numbers for ResNet-18)" },
      { symbol: "W, b", meaning: "The head’s weights and biases, one row per class" },
      { symbol: "η_θ, η_head", meaning: "Learning rates for the backbone and the head" },
      { symbol: "k", meaning: "Labelled training examples per class" },
    ],
  },

  process: {
    title: "A transfer-learning project",
    steps: [
      { title: "Split carefully", text: "Training, validation and test sets with no near-duplicates across them (the same object, patient or scene in two splits inflates scores)." },
      { title: "Set baselines", text: "A simple model and the same architecture trained from scratch, on the same splits." },
      { title: "Start with feature extraction", text: "Freeze the backbone, replace the head, use the pretrained weights’ preprocessing, train the head." },
      { title: "Fine-tune if it helps", text: "Unfreeze the last stage (then more) with a lower learning rate; keep frozen batch-norm layers in eval mode." },
      { title: "Compare over several draws or seeds", text: "Report mean and spread on validation data; choose by those, not by one lucky run." },
      { title: "Test once", text: "Evaluate the chosen model on the untouched test set." },
    ],
  },

  interactive: {
    component: "transfer-lab",
    kind: "computation",
    intro:
      "Four models learn digits 5–9 from a handful of examples, all trained in your browser one after another: a linear model on the pixels, the small CNN from scratch, the CNN with filters pretrained on digits 0–4 kept frozen, and the same fine-tuned. Draw new examples to build up a tally.",
    tryThis: [
      "With 5 examples per digit (draw 1), read the four accuracies.",
      "Press “Draw different examples” four or five times and watch the tally’s ranges.",
      "Switch to 1 example per digit and draw several times.",
      "Switch to 20 per digit. Do the methods get closer together or further apart?",
      "Before each draw, predict which method will win. How often are you right?",
    ],
    expect: [
      { action: "5 per digit, draw 1", result: "Linear 87.4%, scratch 85.5%, frozen 87.7%, fine-tuned 88.1%." },
      { action: "More draws", result: "The winner changes from draw to draw; the ranges overlap almost completely." },
      { action: "1 per digit", result: "Accuracies swing between about 50% and 87% depending on the draw." },
      { action: "20 per digit", result: "All four methods reach about 95–96% and the spread shrinks." },
      { action: "Overall", result: "Averaged over ten draws, pretraining is ahead by at most 1.8 points (1 example per digit: 71.2% against 69.4%)." },
    ],
  },

  code: {
    label: "transfer.py",
    language: "Python",
    source: `import torch
from torch import nn
from torchvision import models

count = lambda params: sum(p.numel() for p in params)

# In a real project: models.resnet18(weights=models.ResNet18_Weights.DEFAULT) downloads the
# ImageNet weights. weights=None builds the same network with random weights.
net = models.resnet18(weights=None)
print("ImageNet head:", net.fc)

# 1. Feature extraction: freeze everything, then replace the head for 5 classes.
for p in net.parameters():
    p.requires_grad = False
net.fc = nn.Linear(net.fc.in_features, 5)      # new layers are trainable by default
trainable = [p for p in net.parameters() if p.requires_grad]
print("frozen:", count(p for p in net.parameters() if not p.requires_grad), "| trainable:", count(trainable))
opt = torch.optim.AdamW(trainable, lr=1e-3)

# 2. Fine-tuning: unfreeze the last stage too, with a smaller learning rate than the head.
for p in net.layer4.parameters():
    p.requires_grad = True
opt = torch.optim.AdamW([
    {"params": net.layer4.parameters(), "lr": 1e-4},
    {"params": net.fc.parameters(), "lr": 1e-3},
])
print("trainable after unfreezing layer4:", count(p for p in net.parameters() if p.requires_grad))

# Batch norm keeps updating its running statistics in train mode even when frozen;
# put frozen BN layers in eval mode if the new data are few or different.
net.train()
for m in net.modules():
    if isinstance(m, nn.BatchNorm2d) and not m.weight.requires_grad:
        m.eval()
logits = net(torch.randn(4, 3, 224, 224))
print("output:", tuple(logits.shape))`,
    walkthrough: [
      { lines: "7–10", text: "Build ResNet-18. With weights=ResNet18_Weights.DEFAULT it would download ImageNet weights; this sandboxed run uses weights=None, which gives the same architecture and parameter counts." },
      { lines: "13–18", text: "Feature extraction: freeze every parameter, swap the 1,000-class head for a 5-class one (new layers are trainable), and give the optimiser only the trainable parameters." },
      { lines: "21–27", text: "Fine-tuning: unfreeze the last stage and use two parameter groups, the backbone at a tenth of the head’s learning rate." },
      { lines: "31–34", text: "Training mode for the trainable parts, evaluation mode for frozen batch-norm layers so their running statistics stay as pretrained." },
      { lines: "35–36", text: "A forward pass on a dummy batch of four images gives five scores each." },
    ],
    shapes: [
      { name: "input batch", shape: "(4, 3, 224, 224)", meaning: "Four RGB images at the pretrained input size" },
      { name: "features before fc", shape: "(4, 512)", meaning: "ResNet-18’s pooled feature vector per image" },
      { name: "net.fc.weight", shape: "(5, 512)", meaning: "The new head: one row of weights per class" },
      { name: "logits", shape: "(4, 5)", meaning: "Five class scores per image" },
    ],
    output: {
      label: "Output",
      text: "ImageNet head: Linear(in_features=512, out_features=1000, bias=True)\nfrozen: 11176512 | trainable: 2565\ntrainable after unfreezing layer4: 8396293\noutput: (4, 5)",
      note: "Produced by running the script with PyTorch and torchvision. Feature extraction trains 2,565 of ResNet-18’s parameters (512 × 5 weights + 5 biases); unfreezing the last stage raises that to 8,396,293 — most of the network’s weights live in its last stage.",
    },
  },

  useCases: [
    {
      title: "Small specialised datasets",
      text: "Product photos, plant diseases, manufacturing defects: a few hundred labelled images per class are typical, and fine-tuning an ImageNet backbone is the usual starting point.",
    },
    {
      title: "Medical imaging",
      text: "Pretrained backbones are widely fine-tuned on X-rays and scans; because those images differ from everyday photos, comparing against training from scratch matters even more.",
    },
    {
      title: "Fast prototyping",
      text: "A frozen backbone plus a linear head trains in minutes and gives a quick estimate of how separable the classes are before investing in fine-tuning.",
    },
  ],

  mistakes: [
    {
      kind: "mistake",
      title: "No baseline",
      text: "Without a from-scratch and a simple-model baseline on the same data, there is no evidence that pretraining helped at all.",
    },
    {
      kind: "mistake",
      title: "Wrong preprocessing for the pretrained weights",
      text: "Different normalisation or input size from what the backbone was trained with silently costs accuracy; take it from the weights’ transforms().",
    },
    {
      kind: "mistake",
      title: "A learning rate that wipes out the pretrained features",
      text: "Fine-tuning the backbone with the head’s (large) learning rate can destroy what it learned in the first steps. Use a smaller rate for pretrained layers, or train the head first.",
    },
    {
      kind: "misconception",
      title: "“One run shows which method is better”",
      text: "With few examples, results swing by tens of points between draws. Compare means over several draws or seeds.",
    },
    {
      kind: "limitation",
      title: "Pretraining data shape what the model notices",
      text: "Features learned on everyday photos may be poor for very different images, and they carry the biases of the pretraining dataset into the new task.",
    },
  ],

  exercise: {
    prompt: [
      {
        type: "list",
        ordered: true,
        items: [
          "You replace ResNet-18’s head with a 12-class layer and freeze everything else. How many parameters are trained?",
          "You have 150 labelled images of 3 kinds of industrial defect, which look nothing like everyday photos. Describe the experiments you would run, in order.",
          "Method A beats method B by 2 points on one draw of 5 examples per class. Over ten draws, both methods range over about 10 points. What can you conclude, and what would you report?",
        ],
      },
    ],
    hints: ["The head is a 512-input linear layer.", "Think baselines first, then feature extraction, then fine-tuning.", "Compare the gap with the spread."],
    solution: [
      { type: "p", text: "512 × 12 + 12 = **6,156**." },
      { type: "p", text: "Split carefully (several images of the same part never in two splits). Train a simple baseline and a from-scratch CNN. Then a frozen pretrained backbone with a new head, then fine-tuning the last stage (lower learning rate), then more stages. Compare all on validation data over several seeds, choose, and test once. Because the images are unlike ImageNet, fine-tuning more layers — or training from scratch — may win." },
      { type: "p", text: "Nothing yet: a 2-point gap on one draw is well within a 10-point spread. Report the mean and spread over the ten draws for both methods (same draws for each), and say whether the difference is consistent." },
    ],
  },

  quiz: [
    {
      question: "In feature extraction, which parameters are trained?",
      options: ["All of them", "Only the new head", "Only the first layer", "None"],
      answer: 1,
      explanation: "The pretrained backbone is frozen and acts as a fixed feature maker; only the new final layer learns.",
    },
    {
      question: "Why use a smaller learning rate for pretrained layers when fine-tuning?",
      options: [
        "To save memory",
        "So the useful pretrained features are adjusted rather than overwritten",
        "Because frozen layers need it",
        "PyTorch requires different rates",
      ],
      answer: 1,
      explanation: "Large updates early in fine-tuning can destroy what the backbone learned.",
    },
    {
      question: "Which layers of a CNN transfer best to a very different task?",
      options: ["The final layers", "The early layers, which detect generic patterns", "None", "Only the head"],
      answer: 1,
      explanation: "Early features (edges, colour blobs) are general; later ones are increasingly specific to the original task.",
    },
    {
      question: "In the lab, pretrained filters beat training from scratch by at most 1.8 points on average, while single draws vary by as much as 35 points. What is the right conclusion?",
      options: [
        "Transfer learning never works",
        "On this small problem pretraining helps little; comparisons must average over draws",
        "Training from scratch is always better",
        "The test set is wrong",
      ],
      answer: 1,
      explanation: "The effect is small relative to the variation, so only averages over draws can show it — and they show it is small here.",
    },
    {
      question: "What did He, Girshick and Dollár find about ImageNet pretraining for COCO detection?",
      options: [
        "It is required for good results",
        "Training from scratch can match it given enough iterations; pretraining mainly speeds up convergence",
        "It always hurts",
        "It only matters for classification",
      ],
      answer: 1,
      explanation: "Randomly initialised models reached comparable accuracy with longer training, even with 10% of the data.",
    },
  ],

  glossary: [
    { term: "Transfer learning", definition: "Reusing a model trained on one task as the starting point for another." },
    { term: "Backbone", definition: "The pretrained feature-extracting part of the network." },
    { term: "Head", definition: "The final task-specific layer(s), replaced for the new task." },
    { term: "Feature extraction", definition: "Training only a new head on top of a frozen backbone." },
    { term: "Fine-tuning", definition: "Continuing to train some or all pretrained layers on the new task." },
    { term: "Freezing", definition: "Excluding parameters from training, e.g. with requires_grad = False." },
    { term: "Parameter group", definition: "A set of parameters given its own optimiser settings, such as a lower learning rate." },
    { term: "Few-shot", definition: "Learning from very few labelled examples per class." },
  ],

  references: [
    {
      title: "How transferable are features in deep neural networks?",
      source: "Jason Yosinski, Jeff Clune, Yoshua Bengio & Hod Lipson, arXiv:1411.1792",
      url: "https://arxiv.org/abs/1411.1792",
      note: "General first-layer features; transferability falls with task distance; transferred initialisation helps even after fine-tuning.",
    },
    {
      title: "Do Better ImageNet Models Transfer Better?",
      source: "Simon Kornblith, Jonathon Shlens & Quoc V. Le, arXiv:1805.08974",
      url: "https://arxiv.org/abs/1805.08974",
      note: "ImageNet accuracy predicts transfer accuracy across 12 datasets, with little benefit on two small fine-grained ones.",
    },
    {
      title: "Rethinking ImageNet Pre-training",
      source: "Kaiming He, Ross Girshick & Piotr Dollár, arXiv:1811.08883",
      url: "https://arxiv.org/abs/1811.08883",
      note: "On COCO, training from scratch matches pretraining given enough iterations; pretraining speeds up convergence.",
    },
    {
      title: "Transfer Learning for Computer Vision Tutorial",
      source: "PyTorch tutorials",
      url: "https://docs.pytorch.org/tutorials/beginner/transfer_learning_tutorial",
      note: "Fine-tuning versus a fixed feature extractor, with requires_grad = False and a replaced final layer.",
    },
    {
      title: "Models and pre-trained weights",
      source: "torchvision documentation",
      url: "https://docs.pytorch.org/vision/stable/models.html",
      note: "Loading weights, their bundled transforms, and model.eval() for layers such as batch norm.",
    },
  ],

  next: [
    { pathSlug: "computer-vision", topicSlug: "vision-evaluation-interpretation", reason: "Finding where a classifier fails, and what it looks at." },
    { pathSlug: "computer-vision", topicSlug: "detection-segmentation", reason: "Pretrained backbones under detection and segmentation heads." },
    { pathSlug: "ml-foundations", topicSlug: "metrics-cross-validation", reason: "Comparing models fairly when results vary between runs." },
  ],

  teaching: {
    notes: [
      "Ask students to predict the lab’s winner before each draw, and keep a class tally on the board; the variation makes the point better than any slide.",
      "Separate the two claims: transfer learning is usually the right starting point in practice, and it must still be tested against a baseline.",
      "The code’s parameter counts show where a ResNet’s weights live: almost all in the last stages.",
    ],
    demo: "Fine-tune a pretrained ResNet-18 on a small public dataset with feature extraction and with fine-tuning, and train the same network from scratch, all for a few epochs, then compare validation accuracy over three seeds.",
    discussion: [
      "Why might pretraining help much more for 224 × 224 photos than for 8 × 8 digits?",
      "If pretrained and scratch models end at the same accuracy, is there still a reason to pretrain?",
      "What could go wrong if images of the same object end up in both training and test sets?",
    ],
    misconceptions: [
      "Treating one run as evidence that a method is better.",
      "Assuming pretrained features suit any kind of image.",
      "Fine-tuning with the head’s learning rate on every layer.",
    ],
    challenge: {
      prompt:
        "Design an experiment that would make the lab’s pretraining effect larger. Change one thing about the source task, the target task or the network, and explain why it should help.",
      answer: [
        { type: "p", text: "Several answers work if they make the features harder to learn from the target examples alone: a much larger network or larger images (more features to learn), far fewer target examples, or a source task with many more images and classes than the target." },
        { type: "p", text: "The test is the same: compare against the from-scratch baseline over several draws and see whether the gap now exceeds the spread." },
      ],
    },
  },
};
