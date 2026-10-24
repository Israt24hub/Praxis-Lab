import type { Lesson } from "../../types/content";

/*
 * Model evaluation and interpretation. Lab numbers come from the shipped digit CNN
 * (src/content/datasets/digits-cnn.ts) through src/lib/vision.ts — confusion matrix, gradient
 * saliency, Grad-CAM, occlusion — checked against PyTorch in tests/vision.test.ts. The code output
 * was produced by running the script with PyTorch and scikit-learn.
 */
export const visionEvaluationInterpretation: Lesson = {
  id: "vision-evaluation-interpretation",
  pathSlug: "computer-vision",
  topicSlug: "vision-evaluation-interpretation",
  title: "Model evaluation and interpretation",
  summary:
    "One accuracy number hides which classes fail and why. A confusion matrix and the model’s most confident mistakes show where it goes wrong; explanation maps such as Grad-CAM suggest what it looked at — but different methods disagree, and a map can look convincing even for an untrained network.",
  level: "intermediate",
  minutes: [55, 75],
  objectives: [
    "Find the **classes and images** a model gets wrong, with a confusion matrix, per-class recall and its most confident mistakes",
    "Produce and interpret **gradient saliency**, **Grad-CAM** and **occlusion** maps",
    "Run a **sanity check** on an explanation by randomising the model’s weights",
    "Explain why saliency maps are **hypotheses, not proof**, of what a model relies on",
  ],
  prerequisites: [
    { label: "Image classification and transfer learning", href: "/learn/computer-vision/classification-transfer-learning" },
    { label: "Metrics and cross-validation", href: "/learn/ml-foundations/metrics-cross-validation" },
    { label: "Backpropagation", href: "/learn/deep-learning/backpropagation" },
  ],

  intro: [
    {
      type: "p",
      text: "Evaluating a vision model has two halves. **Error analysis** asks where the model is wrong: which classes, which images, how confidently. **Interpretation** asks why: which parts of the image drove a prediction. Both are needed before trusting a model with real decisions.",
    },
    {
      type: "p",
      text: "This lesson uses the small CNN trained on handwritten digits throughout the path, so every number can be checked in the lab: its confusion matrix, its seven test mistakes, and three explanation maps for any image.",
    },
  ],

  why: [
    {
      type: "p",
      text: "98.7% accuracy sounds finished. But the network’s single most confident mistake calls a 9 a 5 with 99.8% confidence, and its recall is lowest (96%) for 1s and 5s. A confident wrong answer is the kind a user cannot catch, and averages do not show it.",
    },
    {
      type: "p",
      text: "Explanation maps are easy to make and easy to over-read. In the lab, the eight pixels that gradient saliency and occlusion rank highest overlap by only about 2 on average, and an untrained network’s gradient map follows the strokes of the digit at least as closely as the trained network’s. Researchers have found the same in larger models: popular methods often disagree, and some ignore the model altogether.",
    },
  ],

  explanation: {
    beginner: [
      {
        type: "p",
        text: "**Confusion matrix.** A table counting, for each true class (row), how often each class was predicted (column). The diagonal is correct; everything else is a specific confusion, such as 1s read as 9s. **Recall** per class is the diagonal cell divided by its row total.",
      },
      {
        type: "p",
        text: "**Look at the mistakes.** Sort the wrong predictions by the model’s confidence and look at the images. Some will be genuinely ambiguous or mislabelled; others reveal a real weakness.",
      },
      {
        type: "p",
        text: "**Explanation maps.** A **gradient map** shows which pixels would change the class score most if nudged. **Grad-CAM** weights the last convolutional layer’s feature maps by how much the score depends on them and shows where those maps are active. **Occlusion** covers small patches one at a time and records how much the score drops.",
      },
      {
        type: "p",
        text: "**Hypotheses, not proof.** A map that highlights the digit looks reassuring, but it may say little about the model. Check it: does it change if the model is replaced by an untrained one? Do different methods agree? Does hiding the highlighted region really change the prediction?",
      },
    ],
    technical: [
      {
        type: "p",
        text: "**Error analysis.** Beyond accuracy, report per-class precision and recall, the confusion matrix, and calibration-sensitive views such as the most confident errors. Slice results by conditions (lighting, source, device) and compare with a test set from a different time or place: Recht et al. built new test sets for CIFAR-10 and ImageNet following the original procedures and found accuracy drops of 3–15% and 11–14%.",
      },
      {
        type: "p",
        text: "**Gradient saliency** (Simonyan et al.): |∂y_c/∂x| per pixel, one backward pass. **Grad-CAM** (Selvaraju et al.): for feature maps A^k of the final convolutional layer, α_k = mean over positions of ∂y_c/∂A^k, map = ReLU(Σ_k α_k A^k), the same size as the feature maps and upsampled for display. **Occlusion** (Zeiler & Fergus): slide a grey or zero patch and record the score change; model-agnostic but needs one forward pass per position. The lab explains the class logit with all three so they explain the same number.",
      },
      {
        type: "p",
        text: "**Sanity checks** (Adebayo et al.): the *model-parameter randomisation test* compares an explanation of the trained model with one of a randomly initialised network of the same architecture; the *data randomisation test* trains on permuted labels. A method whose maps barely change is independent of what the model learned. In their tests gradients and Grad-CAM passed, while Guided Backpropagation and Guided Grad-CAM did not, yet still produced plausible-looking maps.",
      },
      {
        type: "p",
        text: "**Disagreement and shortcuts.** Krishna et al. found that state-of-the-art explanation methods often disagree, and that practitioners resolve the conflicts with ad hoc rules. Geirhos et al. describe *shortcut learning*: decision rules that score well on benchmarks but fail under realistic conditions. Explanations help form hypotheses about shortcuts (a watermark, a background); targeted tests — editing that region, evaluating on images without it — are what confirm them.",
      },
    ],
  },

  analogy: {
    title: "Asking a witness what they noticed",
    blocks: [
      {
        type: "p",
        text: "A witness says they recognised a suspect “by the coat”. That is useful — but people often explain decisions with whatever is easy to point at. To trust it, you test it: show the coat on someone else, or the suspect without it. Explanation maps are the network’s witness statement, and occlusion is one of those tests.",
      },
      {
        type: "p",
        text: "Where the analogy fails: the network is not trying to explain itself. Each method is an external calculation with its own assumptions, which is why two methods can give two different statements about the same decision.",
      },
    ],
  },

  workedExample: {
    title: "Reading the digit network’s errors",
    blocks: [
      {
        type: "p",
        text: "The trained CNN on the 539 test digits: 532 correct (98.7%), 7 wrong. Recall per digit is 100% for 0, 3, 4, 7 and 8; 98% for 2, 6 and 9 (one miss each); 96% for 1 and 5 (two misses each, out of 55).",
      },
      {
        type: "table",
        caption: "The seven mistakes, most confident first",
        head: ["Test image", "true digit", "predicted", "confidence"],
        rows: [
          ["1662", "9", "5", "**99.8%**"],
          ["1495", "1", "9", "94.9%"],
          ["792", "6", "4", "85.1%"],
          ["1274", "5", "2", "81.1%"],
          ["421", "5", "9", "74.8%"],
          ["1522", "1", "9", "65.6%"],
          ["77", "2", "7", "51.7%"],
        ],
      },
      {
        type: "p",
        text: "Two of the seven are 1s read as 9s — the confusion to investigate first. Then explanations: for test image 77 (a 2 read as a 7), the top-8 pixels of the gradient and occlusion maps share 2, Grad-CAM and occlusion share none, gradient and Grad-CAM share 2. Averaged over all 539 test images the overlaps are 2.20, 1.14 and 1.35 pixels; eight pixels picked at random out of 64 would share 1 on average.",
      },
      {
        type: "p",
        text: "The sanity check: with the weights replaced by random ones (explaining the true digit), the gradient maps change (their rank correlation with the trained maps averages 0.21), so the method depends on the model — but the untrained network’s maps correlate with the digit’s ink at 0.30, against 0.23 for the trained network. Looking like the digit is not evidence of having learned it.",
      },
    ],
  },

  math: {
    blocks: [
      { type: "equation", expression: "recall_c = C[c, c] / Σ_j C[c, j],   precision_c = C[c, c] / Σ_i C[i, c]", meaning: "Per-class scores from the confusion matrix C (rows true, columns predicted)." },
      { type: "equation", expression: "S(x) = | ∂y_c / ∂x |", meaning: "Gradient saliency: sensitivity of the class score y_c to each pixel." },
      { type: "equation", expression: "α_k = (1/Z) Σ_(i,j) ∂y_c / ∂A^k_(ij),   L_GradCAM = ReLU( Σ_k α_k A^k )", meaning: "Grad-CAM on feature maps A^k with Z positions each." },
      { type: "equation", expression: "O(p) = mean over windows w ∋ p of [ y_c(x) − y_c(x with w blanked) ]", meaning: "Occlusion: the average score drop when pixel p is covered." },
    ],
    notation: [
      { symbol: "C[i, j]", meaning: "Number of images of true class i predicted as j" },
      { symbol: "y_c", meaning: "The score (logit) of the class being explained" },
      { symbol: "A^k", meaning: "Feature map k of the last convolutional layer (here 8 maps of 6 × 6)" },
      { symbol: "α_k", meaning: "Grad-CAM’s importance weight for map k" },
      { symbol: "w", meaning: "An occlusion window (here 2 × 2, sliding by 1)" },
    ],
  },

  process: {
    title: "Evaluating and interpreting an image classifier",
    steps: [
      { title: "Score on the held-out test set", text: "Overall accuracy plus per-class precision and recall." },
      { title: "Read the confusion matrix", text: "Find the largest off-diagonal cells: those are the confusions to investigate." },
      { title: "Look at the mistakes", text: "Sorted by confidence. Note mislabelled and ambiguous images separately from real errors." },
      { title: "Explain a sample with more than one method", text: "Gradient, Grad-CAM and occlusion on correct and wrong cases; note where they agree." },
      { title: "Sanity-check the explanations", text: "Repeat with randomised weights; a map that does not change explains nothing about training." },
      { title: "Test the hypothesis directly", text: "Edit or remove the suspected region, or evaluate on data without it, and measure the change." },
    ],
  },

  interactive: {
    component: "vision-eval-lab",
    kind: "computation",
    intro:
      "The trained digit CNN on all 539 test images, computed in your browser. Panel 1 is its confusion matrix: select a cell to see the images. Panel 2 explains any selected image with gradient, Grad-CAM and occlusion maps, and can swap in an untrained network as a sanity check.",
    tryThis: [
      "Read the recall column. Which digits does the network miss most?",
      "Select the cell for true 1, predicted 9. Then look at all seven mistakes and find the most confident.",
      "Pick image 77 (a 2 read as 7) and compare the three maps for its answer, then for the true digit.",
      "Count the outlined top pixels the maps share, then try two or three correctly classified digits.",
      "Tick “Use an untrained network” and compare the maps and the correlations.",
    ],
    expect: [
      { action: "Confusion matrix", result: "532 of 539 right (98.7%). Recall is lowest, 96%, for 1 and 5." },
      { action: "True 1, predicted 9", result: "Two images; the most confident mistake overall is test image 1662, a 9 read as 5 with 99.8% confidence." },
      { action: "Image 77, its answer (7)", result: "The trained model says 7 with 52% confidence. The top-8 pixels shared: gradient & occlusion 2, Grad-CAM & occlusion 0, gradient & Grad-CAM 2." },
      { action: "Across the test set", result: "Gradient and occlusion share about 2 of their top 8 pixels on average (random choice: 1)." },
      { action: "Untrained network", result: "Its predictions are meaningless, but its gradient map still traces the strokes. Its correlation with the trained map is low (about 0.2 on average): the map depends on the weights, yet looking plausible does not." },
    ],
  },

  code: {
    label: "evaluate_explain.py",
    language: "Python",
    source: `import torch
import torch.nn.functional as F
from sklearn.datasets import load_digits
from sklearn.metrics import confusion_matrix
from sklearn.model_selection import train_test_split
from torch import nn

d = load_digits()
X = torch.tensor(d.images / 16.0, dtype=torch.float32).unsqueeze(1)
y = torch.tensor(d.target)
tr, te = train_test_split(torch.arange(len(y)), test_size=0.3, stratify=y, random_state=0)

class SmallCNN(nn.Module):                         # the lab's architecture
    def __init__(self):
        super().__init__()
        self.conv, self.head = nn.Conv2d(1, 8, 3), nn.Linear(72, 10)
    def forward(self, x):
        self.maps = F.relu(self.conv(x))           # keep the feature maps for Grad-CAM
        return self.head(F.max_pool2d(self.maps, 2).flatten(1))

torch.manual_seed(1)
net = SmallCNN()
opt = torch.optim.Adam(net.parameters(), lr=0.01)
for _ in range(300):
    opt.zero_grad()
    F.cross_entropy(net(X[tr]), y[tr]).backward()
    opt.step()

with torch.no_grad():
    probs = F.softmax(net(X[te]), 1)
pred = probs.argmax(1)
print("test accuracy:", round((pred == y[te]).float().mean().item(), 4))
cm = confusion_matrix(y[te], pred)
print("recall per digit:", [round(float(cm[i, i] / cm[i].sum()), 2) for i in range(10)])
wrong = (pred != y[te]).nonzero().flatten()
worst = wrong[probs[wrong].max(1).values.argsort(descending=True)][:3]
for i in worst:
    print(f"image {te[i].item()}: true {y[te][i].item()}, said {pred[i].item()} with p = {probs[i].max().item():.3f}")

# Grad-CAM for the most confident mistake, explaining the class it predicted.
i = te[worst[0]]
x = X[i:i + 1]
score = net(x)[0, pred[worst[0]]]
grads = torch.autograd.grad(score, net.maps)[0][0]  # d score / d feature maps: (8, 6, 6)
alpha = grads.mean((1, 2))                         # one weight per feature map
cam = F.relu((alpha[:, None, None] * net.maps[0]).sum(0)).detach()
cam = F.interpolate(cam[None, None], size=(8, 8), mode="bilinear", align_corners=False)[0, 0]
for img_row, cam_row in zip(x[0, 0], cam):
    print("".join("#" if v > 0.4 else "." for v in img_row), "  ",
          "".join("@" if v > 0.66 * cam.max() else "+" if v > 0.33 * cam.max() else "." for v in cam_row))`,
    walkthrough: [
      { lines: "8–11", text: "The digits with a stratified 70/30 split (scikit-learn’s, so a different split from the lab’s)." },
      { lines: "13–19", text: "The lab’s architecture, keeping its rectified feature maps (8 × 6 × 6) for Grad-CAM." },
      { lines: "21–27", text: "Full-batch Adam for 300 steps, as the lab’s network was trained." },
      { lines: "29–34", text: "Test probabilities, accuracy, the confusion matrix and recall per digit." },
      { lines: "35–38", text: "The wrong predictions sorted by confidence: the three most confident mistakes." },
      { lines: "41–47", text: "Grad-CAM by hand: gradient of the predicted class’s score with respect to the feature maps, averaged per map, weighted sum, ReLU, then bilinear upsampling to 8 × 8." },
      { lines: "48–50", text: "Print the digit and its Grad-CAM map side by side as text." },
    ],
    shapes: [
      { name: "X", shape: "(1797, 1, 8, 8)", meaning: "All digits in [0, 1]" },
      { name: "probs", shape: "(540, 10)", meaning: "Class probabilities for the 540 test images of this split" },
      { name: "cm", shape: "(10, 10)", meaning: "Confusion matrix, rows true, columns predicted" },
      { name: "net.maps", shape: "(1, 8, 6, 6)", meaning: "The rectified feature maps Grad-CAM weights" },
      { name: "cam", shape: "(8, 8)", meaning: "The Grad-CAM map at input resolution" },
    ],
    output: {
      label: "Output",
      text: "test accuracy: 0.9852\nrecall per digit: [1.0, 0.98, 0.98, 0.95, 1.0, 1.0, 0.98, 1.0, 0.96, 1.0]\nimage 905: true 8, said 1 with p = 0.923\nimage 77: true 2, said 8 with p = 0.743\nimage 1551: true 6, said 8 with p = 0.735\n...##...    .+@@....\n...##...    .++.....\n..###...    ........\n..###...    ........\n..###...    ........\n...###..    ........\n...#.##.    ........\n...###..    ........",
      note: "Produced by running the script with PyTorch and scikit-learn. This split differs from the lab’s, so the numbers do too (98.5% here, 98.7% in the lab), and different images are hardest. The most confident mistake is an 8 squeezed so narrow that it resembles a 1; Grad-CAM for “1” highlights only the top of the stroke — a hypothesis about what drove the answer, to be tested, for instance by occluding that region.",
    },
  },

  useCases: [
    {
      title: "Debugging a classifier before release",
      text: "The confusion matrix and the most confident mistakes point to the classes needing more or cleaner data, and often to labelling errors.",
    },
    {
      title: "Detecting shortcuts",
      text: "Explanation maps that concentrate on a hospital’s text marker, a watermark or the background suggest a shortcut; evaluating on images without that cue confirms or rules it out.",
    },
    {
      title: "Communicating with domain experts",
      text: "A clinician or inspector can judge whether highlighted regions are plausible — provided everyone treats the maps as prompts for questions rather than as proof.",
    },
  ],

  mistakes: [
    {
      kind: "mistake",
      title: "Stopping at overall accuracy",
      text: "A class with few examples can fail completely while the average stays high. Report per-class results and look at the confusion matrix.",
    },
    {
      kind: "mistake",
      title: "Trusting one explanation method",
      text: "Different methods answer different questions and often disagree, as the lab shows. Compare several, and test the hypothesis directly.",
    },
    {
      kind: "misconception",
      title: "“The map highlights the object, so the model understands it”",
      text: "An untrained network’s gradient map can also follow the object’s edges. Plausibility is not evidence; sanity checks and interventions are.",
    },
    {
      kind: "mistake",
      title: "Explaining with the wrong layer or class",
      text: "Grad-CAM depends on the layer used and on which class score is explained. State both, and compare the predicted class with the true one for mistakes.",
    },
    {
      kind: "limitation",
      title: "Resolution of the maps",
      text: "Grad-CAM is as coarse as the feature maps (6 × 6 here, 7 × 7 for ResNet’s last stage) and is only upsampled for display; fine detail in it is interpolation, not evidence.",
    },
  ],

  exercise: {
    prompt: [
      { type: "p", text: "A three-class classifier’s confusion matrix (rows true, columns predicted):" },
      {
        type: "table",
        caption: "Confusion matrix",
        head: ["True ↓ / predicted →", "cat", "dog", "fox"],
        rows: [
          ["cat", "45", "3", "2"],
          ["dog", "4", "40", "6"],
          ["fox", "1", "9", "10"],
        ],
      },
      {
        type: "list",
        ordered: true,
        items: [
          "Compute the accuracy and the recall for each class.",
          "Compute the precision for “dog”.",
          "Grad-CAM for the fox images mostly highlights snowy backgrounds. Describe one experiment that tests whether the model relies on snow.",
          "A saliency method gives nearly the same maps for the trained model and a randomly initialised copy. What does that tell you?",
        ],
      },
    ],
    hints: ["Accuracy is the diagonal over the total.", "Precision uses the column.", "Change the background, keep the animal.", "Think about what the map depends on."],
    solution: [
      { type: "p", text: "Accuracy = (45 + 40 + 10)/120 = **79.2%**. Recall: cat 45/50 = **90%**, dog 40/50 = **80%**, fox 10/20 = **50%**." },
      { type: "p", text: "Precision for dog = 40/(3 + 40 + 9) = **76.9%**." },
      { type: "p", text: "Evaluate on foxes photographed without snow (and on cats and dogs in snow), or paste the same foxes onto other backgrounds, and compare accuracy. A large change confirms the shortcut." },
      { type: "p", text: "The method does not depend on what the model learned, so its maps cannot explain the trained model’s decisions — it fails the model-randomisation sanity check." },
    ],
  },

  quiz: [
    {
      question: "In a confusion matrix with true classes as rows, what is a class’s recall?",
      options: ["Its diagonal cell divided by its column total", "Its diagonal cell divided by its row total", "Its row total divided by all images", "The largest off-diagonal cell"],
      answer: 1,
      explanation: "Of the images truly in the class (the row), the fraction predicted correctly.",
    },
    {
      question: "How does Grad-CAM weight the feature maps of the last convolutional layer?",
      options: [
        "Equally",
        "By the average gradient of the class score with respect to each map",
        "By each map’s maximum activation",
        "At random",
      ],
      answer: 1,
      explanation: "α_k is the global average of ∂y_c/∂A^k; the map is ReLU(Σ α_k A^k).",
    },
    {
      question: "What does the model-parameter randomisation test check?",
      options: [
        "Whether the model is accurate",
        "Whether an explanation changes when the trained weights are replaced by random ones",
        "Whether training is reproducible",
        "Whether the dataset has random labels",
      ],
      answer: 1,
      explanation: "An explanation that stays the same for an untrained network cannot be explaining what the model learned.",
    },
    {
      question: "In the lab, an untrained network’s gradient map follows the digit’s strokes. What follows?",
      options: [
        "The untrained network has learned the digits",
        "A map that looks plausible is not, by itself, evidence of what the model relies on",
        "Gradient maps are always wrong",
        "The trained network is broken",
      ],
      answer: 1,
      explanation: "Edges dominate gradients even without training; plausibility needs to be backed by checks and interventions.",
    },
    {
      question: "Which is the strongest evidence that a model relies on a watermark?",
      options: [
        "Grad-CAM highlights the watermark",
        "Accuracy drops sharply when the watermark is removed from test images",
        "Two saliency methods agree",
        "The model is very confident",
      ],
      answer: 1,
      explanation: "An intervention on the input tests the hypothesis directly; maps only suggest it.",
    },
  ],

  glossary: [
    { term: "Confusion matrix", definition: "Counts of true class against predicted class." },
    { term: "Per-class recall", definition: "The fraction of a class’s images predicted correctly." },
    { term: "Saliency map", definition: "A per-pixel map of how much each pixel matters to a prediction, by some method." },
    { term: "Gradient saliency", definition: "The magnitude of the class score’s gradient with respect to each pixel." },
    { term: "Grad-CAM", definition: "Feature maps of a convolutional layer weighted by their average gradient, then rectified." },
    { term: "Occlusion sensitivity", definition: "The change in score when parts of the image are covered." },
    { term: "Sanity check (for explanations)", definition: "A test that an explanation depends on the model and data, e.g. by randomising weights." },
    { term: "Shortcut learning", definition: "Relying on cues that work on the benchmark but not under real conditions." },
  ],

  references: [
    {
      title: "Grad-CAM: Visual Explanations from Deep Networks via Gradient-based Localization",
      source: "Ramprasaath R. Selvaraju, Michael Cogswell, Abhishek Das, Ramakrishna Vedantam, Devi Parikh & Dhruv Batra, arXiv:1610.02391 (ICCV 2017; IJCV 2019)",
      url: "https://arxiv.org/abs/1610.02391",
      note: "Global-average-pooled gradients weight the final convolutional layer’s maps, followed by a ReLU; the map is coarse and upsampled.",
    },
    {
      title: "Sanity Checks for Saliency Maps",
      source: "Julius Adebayo, Justin Gilmer, Michael Muelly, Ian Goodfellow, Moritz Hardt & Been Kim, arXiv:1810.03292",
      url: "https://arxiv.org/abs/1810.03292",
      note: "Model-parameter and data randomisation tests; gradients and Grad-CAM pass, Guided Backpropagation and Guided Grad-CAM fail.",
    },
    {
      title: "Deep Inside Convolutional Networks: Visualising Image Classification Models and Saliency Maps",
      source: "Karen Simonyan, Andrea Vedaldi & Andrew Zisserman, arXiv:1312.6034",
      url: "https://arxiv.org/abs/1312.6034",
      note: "Class saliency maps from the gradient of the class score with respect to the input.",
    },
    {
      title: "Visualizing and Understanding Convolutional Networks",
      source: "Matthew D. Zeiler & Rob Fergus, arXiv:1311.2901",
      url: "https://arxiv.org/abs/1311.2901",
      note: "Section 4.2, occlusion sensitivity: systematically covering parts of the image with a grey square.",
    },
    {
      title: "The Disagreement Problem in Explainable Machine Learning: A Practitioner’s Perspective",
      source: "Satyapriya Krishna, Tessa Han, Alex Gu, Steven Wu, Shahin Jabbari & Himabindu Lakkaraju, arXiv:2202.01602",
      url: "https://arxiv.org/abs/2202.01602",
      note: "State-of-the-art explanation methods often disagree, and practitioners resolve it with heuristics.",
    },
    {
      title: "Shortcut Learning in Deep Neural Networks",
      source: "Robert Geirhos, Jörn-Henrik Jacobsen, Claudio Michaelis, Richard Zemel, Wieland Brendel, Matthias Bethge & Felix A. Wichmann, arXiv:2004.07780",
      url: "https://arxiv.org/abs/2004.07780v3",
      note: "Decision rules that do well on benchmarks but fail under more realistic conditions.",
    },
    {
      title: "Do ImageNet Classifiers Generalize to ImageNet?",
      source: "Benjamin Recht, Rebecca Roelofs, Ludwig Schmidt & Vaishaal Shankar, arXiv:1902.10811",
      url: "https://arxiv.org/abs/1902.10811",
      note: "New test sets built like the originals: accuracy drops of 3–15% on CIFAR-10 and 11–14% on ImageNet.",
    },
  ],

  next: [
    { pathSlug: "computer-vision", topicSlug: "classification-transfer-learning", reason: "Evaluating fine-tuned models fairly across runs." },
    { pathSlug: "ml-foundations", topicSlug: "metrics-cross-validation", reason: "Precision, recall and thresholds in more depth." },
    { pathSlug: "computer-vision", topicSlug: "detection-segmentation", reason: "Evaluation when the output is boxes and masks." },
  ],

  teaching: {
    notes: [
      "Start from the most confident mistake in the lab (a 9 read as a 5 at 99.8%): it motivates everything that follows.",
      "Show all three maps for the same image before discussing any of them; the disagreement is the lesson.",
      "Run the randomised-weights check live; students’ surprise is the point to discuss.",
    ],
    demo: "Fine-tune or load a pretrained classifier, compute Grad-CAM for a few photos with a library such as Captum or pytorch-grad-cam, then repeat with the final layers re-initialised and compare.",
    discussion: [
      "If two explanation methods disagree, which, if either, should you believe? How would you find out?",
      "Is a model with 98.7% accuracy and a 99.8%-confident mistake better or worse than one with 98% and no confident mistakes?",
      "What would a sanity check look like for an explanation given to a doctor?",
    ],
    misconceptions: [
      "Treating a heat map as the model’s reasoning.",
      "Assuming agreement between maps proves they are right.",
      "Evaluating only on a test set drawn exactly like the training data.",
    ],
    challenge: {
      prompt:
        "Design an evaluation that would reveal whether the digit network relies on stroke thickness rather than shape. Use only transformations of the existing test images.",
      answer: [
        { type: "p", text: "Thicken and thin the strokes of the test digits (for example by dilating and eroding the ink by one pixel), keeping their shapes, and measure accuracy per class on each version." },
        { type: "p", text: "If accuracy drops sharply, or particular confusions (such as thin 8s read as 1s) increase, thickness matters to the model. Explanation maps can suggest where to look, but this intervention is the test." },
      ],
    },
  },
};
