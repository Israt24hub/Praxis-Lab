import type { Lesson } from "../../types/content";

/*
 * Pooling and CNN architectures. Lab numbers come from the shipped digit CNN
 * (src/content/datasets/digits-cnn.ts) via src/lib/vision.ts and from src/lib/receptive.ts,
 * checked in tests/vision.test.ts; the code output was produced by running the script with
 * PyTorch and torchvision.
 */
export const poolingCnnArchitectures: Lesson = {
  id: "pooling-cnn-architectures",
  pathSlug: "computer-vision",
  topicSlug: "pooling-cnn-architectures",
  title: "Pooling and CNN architectures",
  summary:
    "Pooling shrinks feature maps and forgets exactly where a feature was; stacking layers lets each output see a wider patch of the image; residual connections let networks go hundreds of layers deep. Three ideas that turn single convolutions into LeNet, VGG and ResNet.",
  level: "intermediate",
  minutes: [50, 70],
  objectives: [
    "Explain what **max** and **average pooling** do to resolution, and how much **shift tolerance** they give",
    "Compute how the **receptive field** and output size grow through a stack of layers",
    "Explain the **residual connection** in ResNet and the problem it solves",
    "Read an architecture such as ResNet-18 stage by stage",
  ],
  prerequisites: [
    { label: "Convolution and feature maps", href: "/learn/computer-vision/convolution-feature-maps" },
    { label: "Backpropagation", href: "/learn/deep-learning/backpropagation" },
  ],

  intro: [
    {
      type: "p",
      text: "A **pooling** layer summarises each small window of a feature map by one number — its maximum or its average — usually over 2 × 2 windows with stride 2, which halves the height and width. It has no weights to learn.",
    },
    {
      type: "p",
      text: "Classic CNNs alternate convolutions and pooling: the maps get smaller and more numerous, and each value summarises a larger part of the image. This lesson follows that growth, then looks at the residual connection that made very deep networks trainable.",
    },
  ],

  why: [
    {
      type: "p",
      text: "Pooling is cheap shift tolerance. In the lab, moving a digit one pixel right leaves its raw pixels only weakly correlated with the original (0.435 on average); after the trained network’s convolution and max pooling the features correlate at 0.830. That is tolerance, not invariance: the same network still classifies only 57.0% of moved digits correctly.",
    },
    {
      type: "p",
      text: "Depth is how CNNs see large structures with small filters. A ResNet-18 output after its last stage depends on a 435 × 435 patch of input — more than the 224 × 224 image itself — though every filter in it is at most 7 × 7.",
    },
  ],

  explanation: {
    beginner: [
      {
        type: "p",
        text: "**Max pooling** keeps the strongest response in each window: “this feature appeared somewhere around here”. **Average pooling** keeps how much of the feature the window contains. With 2 × 2 windows, 36 values become 9; three-quarters of the numbers are dropped.",
      },
      {
        type: "p",
        text: "**Receptive field.** The patch of input pixels that one output value depends on. A 3 × 3 convolution sees 3 × 3 pixels; a second 3 × 3 convolution on top sees 5 × 5; after a 2 × 2 pool, every later layer’s step covers twice as many pixels, so the view widens faster.",
      },
      {
        type: "p",
        text: "**Residual connection.** Instead of asking a block of layers to produce its output from scratch, ResNet adds the block’s input back to its output: output = input + F(input). If the block has nothing useful to add, it can learn F = 0 and pass the input through unchanged.",
      },
    ],
    technical: [
      {
        type: "p",
        text: "**Pooling.** Max pooling routes the gradient to the winning position of each window (others get 0); average pooling spreads it equally. Many modern networks downsample with stride-2 convolutions instead, and end with **global average pooling**, which averages each final map to one number regardless of input size (ResNet’s `avgpool`).",
      },
      {
        type: "p",
        text: "**Receptive field arithmetic.** With r the field and j the jump (input pixels between neighbouring outputs), starting from r = j = 1, each layer with kernel k and stride s gives r ← r + (k − 1)·j and j ← j·s. Three stacked 3 × 3 convolutions have a 7 × 7 field, like one 7 × 7 layer, with 27 instead of 49 weights per channel pair and two more ReLUs — the argument behind VGG’s all-3 × 3 design. The *effective* receptive field is smaller: Luo et al. show the influence within it is roughly Gaussian, concentrated in the centre.",
      },
      {
        type: "p",
        text: "**Residual learning.** He et al. observed that deeper plain networks can have *higher training error* than shallower ones (56 against 20 layers on CIFAR-10) — a degradation that is not overfitting. A residual block computes y = ReLU(F(x) + x); identity shortcuts add no parameters. When shapes change (more channels, stride 2), the shortcut is a 1 × 1 convolution. Gradients flow through the addition unchanged, which makes very deep stacks easier to optimise; they trained residual networks of up to 152 layers on ImageNet.",
      },
      {
        type: "p",
        text: "**Reading ResNet-18.** A 7 × 7 stride-2 convolution and a stride-2 max pool take 224 × 224 to 56 × 56 with 64 channels; four stages of two residual blocks follow, each later stage halving the resolution and doubling the channels (56 → 28 → 14 → 7; 64 → 128 → 256 → 512); global average pooling and one linear layer give 1,000 class scores. 11,689,512 parameters in all.",
      },
    ],
  },

  analogy: {
    title: "Reports up a chain of managers",
    blocks: [
      {
        type: "p",
        text: "Each team leader reads four reports and passes on only the most alarming one (max pooling) or a summary of all four (average pooling). After a few levels, the director sees one line that summarises a whole department — a large receptive field — without knowing which desk each detail came from.",
      },
      {
        type: "p",
        text: "A residual connection is a manager who forwards the original report with their comments attached, instead of rewriting it: if they have nothing to add, the original still gets through. Where the analogy fails: in a network every level’s “summary” rule is learned, not chosen.",
      },
    ],
  },

  workedExample: {
    title: "Pooling a map, and tracing a receptive field",
    blocks: [
      {
        type: "p",
        text: "A 4 × 4 feature map, pooled with 2 × 2 windows and stride 2:",
      },
      {
        type: "table",
        caption: "The four windows and their summaries",
        head: ["Window", "values", "max", "average"],
        rows: [
          ["Top left", "1, 3, 2, 4", "**4**", "**2.5**"],
          ["Top right", "0, 0, 0, 1", "**1**", "**0.25**"],
          ["Bottom left", "0, 0, 0, 6", "**6**", "**1.5**"],
          ["Bottom right", "5, 0, 0, 0", "**5**", "**1.25**"],
        ],
      },
      {
        type: "p",
        text: "A single strong response survives max pooling intact (6) but is diluted to a quarter by averaging (1.5).",
      },
      {
        type: "table",
        caption: "Receptive field through three 3 × 3 convolutions and a 2 × 2 pool (r ← r + (k − 1)·j, j ← j·s)",
        head: ["Layer", "k, stride", "receptive field r", "jump j"],
        rows: [
          ["input", "–", "1", "1"],
          ["conv 3 × 3", "3, 1", "1 + 2 × 1 = 3", "1"],
          ["conv 3 × 3", "3, 1", "3 + 2 × 1 = 5", "1"],
          ["conv 3 × 3", "3, 1", "5 + 2 × 1 = **7**", "1"],
          ["max-pool 2 × 2", "2, 2", "7 + 1 × 1 = 8", "2"],
          ["(a next conv 3 × 3)", "3, 1", "8 + 2 × 2 = 12", "2"],
        ],
      },
      {
        type: "p",
        text: "After the pool the jump is 2, so the next 3 × 3 convolution adds 4 pixels to the field instead of 2. In ResNet-18 the jump reaches 32, and each 3 × 3 convolution of the last stage widens the field by 64.",
      },
    ],
  },

  math: {
    blocks: [
      { type: "equation", expression: "maxpool(x)[i, j] = max_(a,b ∈ {0,1}) x[2i + a, 2j + b]", meaning: "2 × 2 max pooling with stride 2; average pooling replaces max with the mean." },
      { type: "equation", expression: "r_l = r_(l−1) + (k_l − 1) · j_(l−1),   j_l = j_(l−1) · s_l,   r_0 = j_0 = 1", meaning: "Receptive field r and jump j after layer l." },
      { type: "equation", expression: "y = ReLU( F(x; W) + x )", meaning: "A residual block: the layers learn the change F to add to their input." },
      { type: "equation", expression: "∂y/∂x = ∂F/∂x + I   (before the ReLU)", meaning: "The identity term carries the gradient through the block even when ∂F/∂x is small." },
    ],
    notation: [
      { symbol: "r, j", meaning: "Receptive field (in input pixels) and jump (input pixels between neighbouring outputs)" },
      { symbol: "k_l, s_l", meaning: "Kernel size and stride of layer l" },
      { symbol: "F(x; W)", meaning: "The residual function: the block’s convolutions with weights W" },
      { symbol: "I", meaning: "The identity" },
    ],
  },

  process: {
    title: "Reading (or designing) a CNN architecture",
    steps: [
      { title: "Follow the shapes", text: "For each layer write (C, H, W) using ⌊(n + 2p − k)/s⌋ + 1. Downsampling layers are where the resolution halves." },
      { title: "Track the receptive field", text: "r ← r + (k − 1)·j, j ← j·s. Check the last layers see the size of object you care about." },
      { title: "Count parameters per stage", text: "Late stages with many channels hold most of the weights." },
      { title: "Find the shortcuts", text: "In residual networks, note where shortcuts need a 1 × 1 convolution because the shape changes." },
      { title: "Look at the head", text: "Global average pooling then a linear layer: the part replaced when adapting the network to a new task." },
    ],
  },

  interactive: {
    component: "pooling-lab",
    kind: "computation",
    intro:
      "Three panels, all computed in your browser: max and average pooling on the trained digit network’s real feature maps; how similar a digit and its shifted copy are at each stage of the network; and output size and receptive field layer by layer, up to ResNet-18.",
    tryThis: [
      "Panel 1: with feature map 2 of the 4, compare max and average pooling for the window in row 1, column 2.",
      "Step through the eight feature maps. What is special about map 1?",
      "Panel 2: compare the three correlations for a 1-pixel shift right, then down, then 2 pixels right.",
      "Panel 3: choose “This course’s digit CNN”, then “Three 3 × 3 convolutions”, then ResNet-18, and read the receptive field of the last layer.",
      "In the ResNet-18 table, find where the jump doubles: which layers change the output size?",
    ],
    expect: [
      { action: "Map 2, window (1, 2)", result: "Max keeps 1.16; average gives 0.40, because the strong value shares its window with zeros." },
      { action: "Map 1", result: "All zeros for every test digit: a dead filter whose output is never positive." },
      { action: "1 pixel right", result: "Average correlation 0.435 for the pixels, 0.744 for the feature maps, 0.830 after max pooling." },
      { action: "1 down; 2 right", result: "0.622 → 0.834 → 0.897; and −0.046 → 0.397 → 0.544: pooling helps, but a 2-pixel move still changes the features a lot." },
      { action: "Receptive fields", result: "Course CNN: 4 × 4 (of an 8 × 8 digit). Three 3 × 3 convolutions: 7 × 7, then 8 × 8 after the pool. ResNet-18: 435 × 435 at a 7 × 7 output." },
    ],
  },

  code: {
    label: "pooling_resnet.py",
    language: "Python",
    source: `import torch
import torch.nn.functional as F
from torch import nn
from torchvision import models

fmap = torch.tensor([[[[1., 3., 0., 0.],
                       [2., 4., 0., 1.],
                       [0., 0., 5., 0.],
                       [0., 6., 0., 0.]]]])
print("max pool:", F.max_pool2d(fmap, 2).flatten().tolist())
print("avg pool:", F.avg_pool2d(fmap, 2).flatten().tolist())

# A residual block (as in ResNet-18): output = relu(F(x) + x).
class Block(nn.Module):
    def __init__(self, ch):
        super().__init__()
        self.conv1 = nn.Conv2d(ch, ch, 3, padding=1, bias=False)
        self.bn1 = nn.BatchNorm2d(ch)
        self.conv2 = nn.Conv2d(ch, ch, 3, padding=1, bias=False)
        self.bn2 = nn.BatchNorm2d(ch)

    def forward(self, x):
        out = F.relu(self.bn1(self.conv1(x)))
        out = self.bn2(self.conv2(out))
        return F.relu(out + x)                  # the shortcut: add the input back

block = Block(64)
nn.init.zeros_(block.bn2.weight)                # zero the last scale, so F(x) = 0
x = torch.relu(torch.randn(1, 64, 56, 56))
print("block with F = 0 passes x through:", torch.allclose(block(x), x))

# The real network: shapes after each stage for one 224x224 image.
net = models.resnet18(weights=None).eval()      # weights=None: random weights, no download
h = torch.randn(1, 3, 224, 224)
for name in ["conv1", "bn1", "relu", "maxpool", "layer1", "layer2", "layer3", "layer4", "avgpool"]:
    h = getattr(net, name)(h)
    if name in ("conv1", "maxpool") or name.startswith(("layer", "avgpool")):
        print(f"{name:8s}", tuple(h.shape))
print("fc      ", tuple(net.fc(torch.flatten(h, 1)).shape))
print("parameters:", sum(p.numel() for p in net.parameters()))`,
    walkthrough: [
      { lines: "6–11", text: "The worked example’s 4 × 4 map, max- and average-pooled with 2 × 2 windows (the stride defaults to the window size)." },
      { lines: "14–25", text: "A residual block like ResNet-18’s: two 3 × 3 convolutions with batch normalisation, then the input added back before the final ReLU." },
      { lines: "27–30", text: "Set the last batch-norm scale to zero so F(x) = 0: the block then passes its (non-negative) input through unchanged — the “do nothing” solution a plain stack would have to learn." },
      { lines: "33–39", text: "Run a 224 × 224 image through torchvision’s ResNet-18 stage by stage and print the shapes." },
      { lines: "40", text: "Count all parameters." },
    ],
    shapes: [
      { name: "fmap", shape: "(1, 1, 4, 4)", meaning: "One 4 × 4 feature map" },
      { name: "x", shape: "(1, 64, 56, 56)", meaning: "A batch of one with 64 channels, the size layer1 works at" },
      { name: "layer4 output", shape: "(1, 512, 7, 7)", meaning: "The last stage: 512 maps of 7 × 7" },
      { name: "avgpool output", shape: "(1, 512, 1, 1)", meaning: "Global average pooling: one number per map" },
    ],
    output: {
      label: "Output",
      text: "max pool: [4.0, 1.0, 6.0, 5.0]\navg pool: [2.5, 0.25, 1.5, 1.25]\nblock with F = 0 passes x through: True\nconv1    (1, 64, 112, 112)\nmaxpool  (1, 64, 56, 56)\nlayer1   (1, 64, 56, 56)\nlayer2   (1, 128, 28, 28)\nlayer3   (1, 256, 14, 14)\nlayer4   (1, 512, 7, 7)\navgpool  (1, 512, 1, 1)\nfc       (1, 1000)\nparameters: 11689512",
      note: "Produced by running the script with PyTorch and torchvision (random weights: the shapes and parameter count do not depend on them). The output sizes match the lab’s ResNet-18 table.",
    },
  },

  useCases: [
    {
      title: "LeNet for digits and documents",
      text: "LeCun et al.’s LeNet-5 alternated convolutions and subsampling layers for handwritten character recognition: the same pattern as this course’s small digit network.",
    },
    {
      title: "Backbones for every vision task",
      text: "ResNets are the standard feature extractors behind many classifiers, detectors and segmentation models; the stage outputs at 1/8, 1/16 and 1/32 resolution feed the task-specific heads.",
    },
    {
      title: "Choosing an input size",
      text: "The receptive field and the total stride tell you how small an object the network can still resolve, and whether the last layers see whole objects.",
    },
  ],

  mistakes: [
    {
      kind: "misconception",
      title: "“Pooling makes a CNN shift-invariant”",
      text: "It gives tolerance to small shifts within a window. The lab’s network, with max pooling, still drops from 98.7% to 57.0% when digits move one pixel. Augmentation and global pooling add more.",
    },
    {
      kind: "mistake",
      title: "Pooling away what you need",
      text: "Aggressive downsampling discards position. For detection and segmentation, where position is the answer, networks keep or recover higher-resolution maps.",
    },
    {
      kind: "misconception",
      title: "“The receptive field is what the layer looks at”",
      text: "It is what it *could* depend on. The effective receptive field is much smaller and weighted towards the centre.",
    },
    {
      kind: "mistake",
      title: "A shortcut with mismatched shapes",
      text: "Adding x to F(x) requires the same shape. When a block changes channels or stride, the shortcut needs a 1 × 1 convolution (and stride) too.",
    },
    {
      kind: "limitation",
      title: "Depth is not free",
      text: "Residual connections make deep networks trainable, not automatically better: each extra stage costs memory and time, and small datasets rarely need ResNet-152.",
    },
  ],

  exercise: {
    prompt: [
      {
        type: "list",
        ordered: true,
        items: [
          "Max- and average-pool this 4 × 4 map with 2 × 2 windows, stride 2: rows (2, 0, 1, 1), (0, 0, 1, 3), (4, 4, 0, 0), (4, 4, 0, 8).",
          "Compute the receptive field after: conv 3 × 3 (stride 1), max-pool 2 × 2 (stride 2), conv 3 × 3 (stride 1), max-pool 2 × 2 (stride 2), conv 3 × 3 (stride 1).",
          "A 64 × 64 input goes through that stack with padding 1 on each convolution. What is the final output size?",
          "A residual block’s convolutions change 64 channels into 128 with stride 2. Why can’t the shortcut simply add x?",
        ],
      },
    ],
    hints: ["Treat each 2 × 2 window separately.", "Start from r = j = 1; only the pools change j.", "Padding-1 convolutions keep the size; each pool halves it.", "Compare the shapes of x and F(x)."],
    solution: [
      { type: "p", text: "Max: **(2, 3; 4, 8)**. Average: **(0.5, 1.5; 4, 2)**." },
      { type: "p", text: "r: 1 → 3 (j 1) → 4 (j 2) → 4 + 2 × 2 = 8 (j 2) → 8 + 1 × 2 = 10 (j 4) → 10 + 2 × 4 = **18**." },
      { type: "p", text: "64 → 64 → 32 → 32 → 16 → **16 × 16**." },
      { type: "p", text: "x is (64, H, W) but F(x) is (128, H/2, W/2); the shapes do not match, so the shortcut uses a 1 × 1 convolution with stride 2 (and usually batch normalisation) to project x." },
    ],
  },

  quiz: [
    {
      question: "What does 2 × 2 max pooling with stride 2 do to a 28 × 28 feature map?",
      options: ["Keeps it 28 × 28", "Makes it 14 × 14, keeping the largest value of each window", "Makes it 27 × 27", "Averages the whole map to one value"],
      answer: 1,
      explanation: "Each non-overlapping 2 × 2 window becomes its maximum, halving height and width.",
    },
    {
      question: "Two stacked 3 × 3 convolutions (stride 1) have what receptive field?",
      options: ["3 × 3", "5 × 5", "6 × 6", "9 × 9"],
      answer: 1,
      explanation: "r = 1 + 2 + 2 = 5.",
    },
    {
      question: "What problem did He et al. find with very deep plain networks?",
      options: [
        "They overfit badly",
        "Deeper ones had higher training error than shallower ones, so they were harder to optimise",
        "They could not use ReLU",
        "They needed larger images",
      ],
      answer: 1,
      explanation: "The degradation problem: a 56-layer plain network trained worse than a 20-layer one, which is not overfitting.",
    },
    {
      question: "Why can a residual block easily represent “do nothing”?",
      options: ["It has no weights", "Its output is F(x) + x, so F = 0 gives the input back", "It skips the ReLU", "It uses average pooling"],
      answer: 1,
      explanation: "With the shortcut, the identity needs F = 0, which is easy to reach; a plain stack would have to learn the identity mapping itself.",
    },
    {
      question: "In the lab, max pooling raises the similarity between a digit and its 1-pixel-shifted copy from 0.744 to 0.830. What is the right conclusion?",
      options: [
        "The network is now shift-invariant",
        "Pooling adds some tolerance to small shifts, but not invariance",
        "Pooling has no effect",
        "The shift was too small to matter",
      ],
      answer: 1,
      explanation: "The features become more alike, yet only 57.0% of shifted digits are still classified correctly.",
    },
  ],

  glossary: [
    { term: "Max pooling", definition: "Replacing each window of a feature map with its largest value." },
    { term: "Average pooling", definition: "Replacing each window with its mean." },
    { term: "Global average pooling", definition: "Averaging each whole feature map to a single number." },
    { term: "Receptive field", definition: "The region of the input that one output value can depend on." },
    { term: "Jump (effective stride)", definition: "The number of input pixels between neighbouring outputs of a layer." },
    { term: "Residual connection (shortcut)", definition: "Adding a block’s input to its output: y = F(x) + x." },
    { term: "Degradation problem", definition: "Deeper plain networks reaching higher training error than shallower ones." },
    { term: "Backbone", definition: "The convolutional feature extractor of a vision model, reused across tasks." },
  ],

  references: [
    {
      title: "Deep Residual Learning for Image Recognition",
      source: "Kaiming He, Xiangyu Zhang, Shaoqing Ren & Jian Sun, arXiv:1512.03385",
      url: "https://arxiv.org/abs/1512.03385",
      note: "Residual learning, the degradation of deeper plain networks (56 vs 20 layers on CIFAR-10), and identity shortcuts that add no parameters.",
    },
    {
      title: "Very Deep Convolutional Networks for Large-Scale Image Recognition",
      source: "Karen Simonyan & Andrew Zisserman, arXiv:1409.1556",
      url: "https://arxiv.org/abs/1409.1556",
      note: "VGG: very small (3 × 3) filters stacked to 16–19 weight layers.",
    },
    {
      title: "Computing Receptive Fields of Convolutional Neural Networks",
      source: "André Araujo, Wade Norris & Jack Sim, Distill, 2019",
      url: "https://distill.pub/2019/computing-receptive-fields/",
      note: "Derives the receptive-field formulas and tabulates them for common networks.",
    },
    {
      title: "Understanding the Effective Receptive Field in Deep Convolutional Neural Networks",
      source: "Wenjie Luo, Yujia Li, Raquel Urtasun & Richard Zemel, arXiv:1701.04128",
      url: "https://arxiv.org/abs/1701.04128",
      note: "The effective receptive field is roughly Gaussian and occupies only a fraction of the theoretical one.",
    },
    {
      title: "CS231n — Convolutional Networks (pooling and layer patterns)",
      source: "Stanford University course notes",
      url: "https://cs231n.github.io/convolutional-networks/",
      note: "2 × 2 max pooling discards 75% of activations; three stacked 3 × 3 layers see 7 × 7 with 27C² instead of 49C² weights.",
    },
    {
      title: "Gradient-Based Learning Applied to Document Recognition",
      source: "Yann LeCun, Léon Bottou, Yoshua Bengio & Patrick Haffner, Proceedings of the IEEE 86(11):2278–2324, 1998",
      url: "https://leon.bottou.org/papers/lecun-98h",
      note: "LeNet-5, alternating convolution and subsampling layers.",
    },
  ],

  next: [
    { pathSlug: "computer-vision", topicSlug: "classification-transfer-learning", reason: "Reusing a pretrained backbone such as ResNet on a new task." },
    { pathSlug: "computer-vision", topicSlug: "detection-segmentation", reason: "Tasks where the position that pooling throws away is the answer." },
    { pathSlug: "computer-vision", topicSlug: "image-preprocessing-augmentation", reason: "Augmentation, the other route to shift tolerance." },
  ],

  teaching: {
    notes: [
      "Do the 4 × 4 pooling example on the board first; then the lab shows the same thing on real feature maps.",
      "Build the receptive-field table row by row with the class before revealing ResNet-18’s 435.",
      "Present residual connections as an optimisation fix, with He et al.’s 56-versus-20-layer result, rather than as magic.",
    ],
    demo: "Print torchvision’s ResNet-18 (print(models.resnet18())) and trace one image’s shape through it with the class, pointing out the 1 × 1 downsample convolutions in the shortcuts.",
    discussion: [
      "If max pooling throws away 75% of the values, why does it often help accuracy?",
      "Why might the lab’s network have a filter that never fires? Would a residual connection change that?",
      "When would you want a smaller receptive field rather than a larger one?",
    ],
    misconceptions: [
      "Equating pooling with shift invariance.",
      "Believing the receptive field must be smaller than the image.",
      "Thinking residual connections exist to reduce overfitting.",
    ],
    challenge: {
      prompt:
        "A network ends with global average pooling and a linear layer. Explain why it can accept images of different sizes, and what changes in its output when the input is 448 × 448 instead of 224 × 224.",
      answer: [
        { type: "p", text: "Convolutions and pooling work on any size; only the spatial size of the final maps changes (14 × 14 instead of 7 × 7 for ResNet-18). Global average pooling reduces each map to one number whatever its size, so the linear layer always receives 512 values." },
        { type: "p", text: "The class scores are computed from averages over more positions, and each position covers a smaller fraction of the image, so accuracy can change even though the code runs unchanged." },
      ],
    },
  },
};
