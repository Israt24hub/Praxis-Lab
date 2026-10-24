import type { Lesson } from "../../types/content";

/*
 * Convolution and feature maps. Lab numbers come from src/lib/vision.ts (conv2d, checked
 * against PyTorch in tests/vision.test.ts) on the 8 × 8 digits; the code output was produced
 * by running the script with PyTorch.
 */
export const convolutionFeatureMaps: Lesson = {
  id: "convolution-feature-maps",
  pathSlug: "computer-vision",
  topicSlug: "convolution-feature-maps",
  title: "Convolution and feature maps",
  summary:
    "A convolution slides a small grid of weights across an image and records, at every position, how well the patch under it matches. The same few weights are reused everywhere, so a pattern is found wherever it appears — the idea that makes networks for images practical.",
  level: "intermediate",
  minutes: [50, 70],
  objectives: [
    "**Compute a convolution by hand** on a small grid",
    "Predict a layer’s **output size** from kernel size, **stride** and **padding**",
    "Explain **weight sharing**, and count a convolutional layer’s parameters",
    "Describe what feature maps at different depths of a network respond to",
  ],
  prerequisites: [
    { label: "Image representation and tensors", href: "/learn/computer-vision/image-representation" },
    { label: "Neural network layers and activations", href: "/learn/deep-learning/layers-activations" },
  ],

  intro: [
    {
      type: "p",
      text: "A **filter** (or **kernel**) is a small grid of weights, typically 3 × 3. Place it on the image, multiply each weight by the pixel under it, add the nine products: that is one output number. Move the filter one step and repeat. The grid of outputs is a **feature map**: high where the patch looks like the filter, low or negative where it looks like the opposite.",
    },
    {
      type: "p",
      text: "A convolutional layer applies several filters at once, each producing its own feature map, and it learns the filters’ weights by gradient descent like any other layer.",
    },
  ],

  why: [
    {
      type: "p",
      text: "Images are large and their patterns can be anywhere. A fully connected layer that turns an 8 × 8 digit into 8 maps of 6 × 6 needs 18,720 weights; a convolutional layer with eight 3 × 3 filters does it with 80, and still needs only 80 on a 224 × 224 photo. Fewer weights means less data needed and less overfitting.",
    },
    {
      type: "p",
      text: "Stride and padding decide the size of every layer’s output. Getting the arithmetic right is what lets you design a network, read an architecture diagram, or debug a shape error.",
    },
  ],

  explanation: {
    beginner: [
      {
        type: "p",
        text: "**Sliding and multiplying.** Put the 3 × 3 filter over the top-left 3 × 3 patch of pixels, multiply matching cells, add them up, write the sum down. Slide one pixel right and do it again. At the end of the row, go down one pixel and start again from the left.",
      },
      {
        type: "p",
        text: "**What a filter detects.** A filter with negative weights on the left and positive weights on the right gives a large output where the image is dark on the left and bright on the right — a vertical edge. Nine equal weights of 1/9 average the patch: a blur.",
      },
      {
        type: "p",
        text: "**Size.** A 3 × 3 filter fits in 6 positions along an 8-pixel row, so an 8 × 8 image gives a 6 × 6 map. **Padding** adds a border of zeros so the filter can also sit at the edges (8 × 8 stays 8 × 8). **Stride** 2 jumps two pixels at a time, roughly halving the size.",
      },
      {
        type: "p",
        text: "**Weight sharing.** The same nine weights are used at every position, so a filter that finds a vertical stroke finds it anywhere in the image.",
      },
    ],
    technical: [
      {
        type: "p",
        text: "**Definition.** For an input x with C_in channels and a filter w of size C_in × k × k, the output at (i, j) is b + Σ_c Σ_a Σ_b w[c, a, b] · x[c, i·s + a − p, j·s + b − p], with zeros outside the image. Strictly this is a cross-correlation (the filter is not flipped); PyTorch’s `Conv2d` documents exactly that, and deep learning calls it convolution anyway.",
      },
      {
        type: "p",
        text: "**Output size.** ⌊(n + 2p − k)/s⌋ + 1 along each axis. A layer with C_out filters outputs C_out feature maps, and has C_out × (C_in × k × k + 1) parameters — independent of the image size.",
      },
      {
        type: "p",
        text: "**Equivariance.** Because weights are shared, shifting the input shifts the feature map by the same amount (away from the borders, and for shifts that are multiples of the stride). Combined with pooling this gives some tolerance to position; the next lesson measures how much.",
      },
      {
        type: "p",
        text: "**Depth.** Learned first-layer filters tend to be general edge and colour detectors (Yosinski et al. found them similar across datasets). Zeiler and Fergus’s visualisations show the hierarchy above: layer 2 responds to corners and edge–colour conjunctions, layer 3 to textures, layer 4 to more class-specific patterns, layer 5 to whole objects. Each layer combines the maps of the one below over a larger area.",
      },
    ],
  },

  analogy: {
    title: "A stencil moved across a page",
    blocks: [
      {
        type: "p",
        text: "Imagine a small transparent stencil with a shape on it, slid over a printed page square by square. At each square you note how well the print lines up with the stencil. The notes form a map of where that shape occurs. A different stencil gives a different map; a stack of stencils gives a stack of maps.",
      },
      {
        type: "p",
        text: "Where the analogy fails: a filter’s weights can be negative (penalising ink where the stencil wants paper), and a network does not choose its stencils — it learns them from the training data.",
      },
    ],
  },

  workedExample: {
    title: "One output of the vertical-edge filter, by hand",
    blocks: [
      {
        type: "p",
        text: "The lab’s default digit is a 4 from the test set. Its stored values run from 0 to 16 (divide by 16 for the network’s 0–1 scale). The window for output row 2, column 4 covers input rows 2–4 and columns 4–6 (counting from 1):",
      },
      {
        type: "table",
        caption: "The 3 × 3 window (raw values) and the vertical-edge filter",
        head: ["Window row", "pixels", "filter weights", "products"],
        rows: [
          ["1", "16, 10, 0", "−1, 0, 1", "−16, 0, 0"],
          ["2", "13, 11, 12", "−2, 0, 2", "−26, 0, 24"],
          ["3", "10, 15, 16", "−1, 0, 1", "−10, 0, 16"],
        ],
      },
      {
        type: "p",
        text: "Sum: −16 − 26 + 24 − 10 + 16 = −12. On the 0–1 scale, −12/16 = **−0.75**: slightly more ink on the left of this window than on the right. The largest value on this digit is 3.875, at row 3, column 1, where the left side of a stroke begins.",
      },
      {
        type: "p",
        text: "Output sizes for this 8 × 8 input and a 3 × 3 filter: stride 1, no padding: (8 − 3)/1 + 1 = **6**. Padding 1: (8 + 2 − 3)/1 + 1 = **8**. Stride 2: ⌊5/2⌋ + 1 = **3**. Stride 2 with padding 1: ⌊7/2⌋ + 1 = **4**.",
      },
    ],
  },

  math: {
    blocks: [
      { type: "equation", expression: "y[i, j] = b + Σ_a Σ_b w[a, b] · x[i·s + a − p, j·s + b − p]", meaning: "One output of a single-channel convolution (cross-correlation) with stride s and padding p." },
      { type: "equation", expression: "n_out = ⌊(n + 2p − k) / s⌋ + 1", meaning: "Output size along one axis for kernel size k." },
      { type: "equation", expression: "parameters = C_out × (C_in × k × k + 1)", meaning: "Weights plus one bias per filter; independent of the image size." },
      { type: "equation", expression: "shift(x) ⇒ shift(conv(x))", meaning: "Equivariance: moving the input moves the feature map (away from borders, stride 1)." },
    ],
    notation: [
      { symbol: "w, b", meaning: "A filter’s weights and its bias" },
      { symbol: "k", meaning: "Kernel (filter) size, e.g. 3 for 3 × 3" },
      { symbol: "s, p", meaning: "Stride and padding" },
      { symbol: "C_in, C_out", meaning: "Input channels and number of filters (output channels)" },
      { symbol: "n, n_out", meaning: "Input and output size along one axis" },
    ],
  },

  process: {
    title: "Working out a convolutional layer",
    steps: [
      { title: "Read the input shape", text: "(N, C_in, H, W). The filter must have C_in channels." },
      { title: "Choose kernel, stride, padding", text: "3 × 3 with stride 1 and padding 1 keeps the size; stride 2 halves it." },
      { title: "Compute the output shape", text: "(N, C_out, ⌊(H + 2p − k)/s⌋ + 1, ⌊(W + 2p − k)/s⌋ + 1)." },
      { title: "Count the parameters", text: "C_out × (C_in × k × k + 1)." },
      { title: "Check one value by hand", text: "Multiply one window by the filter and compare with the framework’s output." },
    ],
  },

  interactive: {
    component: "convolution-lab",
    kind: "computation",
    intro:
      "Slide a 3 × 3 filter over a real handwritten digit and see every multiplication behind the selected output. Choose a classic filter, one of the eight a trained network learned, or type your own; change stride and padding and watch the output size.",
    tryThis: [
      "With the vertical-edge filter on the 4, read the multiplications for the default position, then find the largest value in the feature map.",
      "Switch to the horizontal-edge filter: which strokes light up now?",
      "Try padding 1, then stride 2, then both, and check the size against the formula.",
      "Choose “Learned by the CNN” and step through the eight filters. Look at filter 1.",
      "Choose “Your own”: it starts as a single 1 in the centre. Move the 1 to the top-left corner. What happens to the picture?",
      "Read the parameter counts in panel 2.",
    ],
    expect: [
      { action: "Vertical edge, default position", result: "Row 2, column 4: the nine products sum to −0.75. The largest value is 3.88 (row 3, column 1); the smallest −3.50." },
      { action: "Horizontal edge", result: "Positive along the tops of strokes, negative along their bottoms." },
      { action: "Padding and stride", result: "6 × 6, 8 × 8 with padding 1, 3 × 3 with stride 2, 4 × 4 with both." },
      { action: "Learned filter 1", result: "Negative at every position: with its bias it never responds to any test digit, so after the ReLU it is always 0 — a dead filter." },
      { action: "A single 1, centre then corner", result: "With the 1 in the centre the feature map is the image (minus its border); in the corner, the same picture moved one pixel down and right. A one-hot filter shifts the image." },
      { action: "Parameters", result: "10 for one filter, 80 for the layer of eight, 18,720 for a dense layer with the same outputs." },
    ],
  },

  code: {
    label: "convolution.py",
    language: "Python",
    source: `import torch
import torch.nn.functional as F
from sklearn.datasets import load_digits
from torch import nn

digits = load_digits()
x = torch.tensor(digits.images[4:5] / 16.0, dtype=torch.float32).unsqueeze(1)  # (1, 1, 8, 8): a 4
print("input:", tuple(x.shape), "label", digits.target[4])

# A hand-made vertical-edge filter, as a (out_channels, in_channels, 3, 3) weight.
edge = torch.tensor([[-1., 0., 1.], [-2., 0., 2.], [-1., 0., 1.]]).view(1, 1, 3, 3)
y = F.conv2d(x, edge)
print("feature map:", tuple(y.shape))

# The strongest response, recomputed by hand: its 3x3 window times the weights, summed.
i, j = divmod(y.argmax().item(), 6)
by_hand = (x[0, 0, i:i + 3, j:j + 3] * edge[0, 0]).sum()
print(f"largest at row {i}, col {j}: by hand {by_hand.item():.4f}, conv2d {y[0, 0, i, j].item():.4f}")

# Stride and padding change the output size: floor((n + 2p - k) / s) + 1.
for stride, padding in [(1, 0), (1, 1), (2, 0), (2, 1)]:
    out = F.conv2d(x, edge, stride=stride, padding=padding)
    print(f"stride {stride}, padding {padding}: {tuple(out.shape[2:])}")

# Weight sharing: a conv layer's parameters do not depend on the image size.
conv = nn.Conv2d(in_channels=1, out_channels=8, kernel_size=3)
dense = nn.Linear(64, 8 * 6 * 6)               # the same number of outputs, fully connected
count = lambda m: sum(p.numel() for p in m.parameters())
print("conv parameters:", count(conv), "| dense parameters:", count(dense))
print("conv on a 224x224 image:", tuple(conv(torch.zeros(1, 1, 224, 224)).shape), "- still", count(conv), "parameters")`,
    walkthrough: [
      { lines: "6–8", text: "One digit (scikit-learn’s fifth image, a 4) as a batch of one: (1, 1, 8, 8)." },
      { lines: "11–13", text: "The vertical-edge filter as a PyTorch weight of shape (1, 1, 3, 3), applied with F.conv2d (stride 1, no padding)." },
      { lines: "16–18", text: "Find the largest output and recompute it by hand: slice the 3 × 3 window, multiply by the filter, sum." },
      { lines: "21–23", text: "The same filter with the four stride and padding combinations from the worked example." },
      { lines: "26–30", text: "Count parameters: eight 3 × 3 filters against a dense layer with the same 288 outputs, and the same conv layer on a far larger image." },
    ],
    shapes: [
      { name: "x", shape: "(1, 1, 8, 8)", meaning: "Batch, channels, height, width" },
      { name: "edge", shape: "(1, 1, 3, 3)", meaning: "Out channels, in channels, kernel height, kernel width" },
      { name: "y", shape: "(1, 1, 6, 6)", meaning: "One feature map" },
      { name: "conv.weight", shape: "(8, 1, 3, 3)", meaning: "Eight learned filters" },
    ],
    output: {
      label: "Output",
      text: "input: (1, 1, 8, 8) label 4\nfeature map: (1, 1, 6, 6)\nlargest at row 3, col 0: by hand 3.3750, conv2d 3.3750\nstride 1, padding 0: (6, 6)\nstride 1, padding 1: (8, 8)\nstride 2, padding 0: (3, 3)\nstride 2, padding 1: (4, 4)\nconv parameters: 80 | dense parameters: 18720\nconv on a 224x224 image: (1, 8, 222, 222) - still 80 parameters",
      note: "Produced by running the script with PyTorch. The digit is a different 4 from the lab’s (scikit-learn’s fifth image), so its largest response differs (3.375, at row 3, column 0 counting from 0); the hand calculation matches conv2d exactly. The output sizes and parameter counts are those of the worked example and the lab.",
    },
  },

  useCases: [
    {
      title: "Image classifiers",
      text: "Every CNN classifier, from LeNet for digits to ResNet for photos, is built from stacks of convolutional layers that turn pixels into increasingly abstract feature maps.",
    },
    {
      title: "Classic image processing",
      text: "Blurring, sharpening and edge detection in photo editors are convolutions with hand-designed filters, the same operation with fixed instead of learned weights.",
    },
    {
      title: "Beyond images",
      text: "1-D convolutions slide over audio and sensor signals, 3-D ones over video and medical volumes; the arithmetic of this lesson carries over with one more or one fewer axis.",
    },
  ],

  mistakes: [
    {
      kind: "mistake",
      title: "Getting the output size wrong",
      text: "Forgetting padding or stride in ⌊(n + 2p − k)/s⌋ + 1 leads to shape errors at the first dense layer. Print shapes after each layer when building a network.",
    },
    {
      kind: "mistake",
      title: "Mismatched input channels",
      text: "A layer built with in_channels=3 cannot take a greyscale (1-channel) image, and vice versa. Convert the image or the layer.",
    },
    {
      kind: "misconception",
      title: "“Each position has its own filter”",
      text: "One filter’s weights are shared across all positions; that is why the parameter count does not grow with the image.",
    },
    {
      kind: "misconception",
      title: "“Deep learning convolution flips the kernel”",
      text: "Frameworks compute cross-correlation. Since the weights are learned, the flip makes no practical difference — but it matters when copying a filter from a signal-processing textbook.",
    },
    {
      kind: "limitation",
      title: "Learned filters are not always useful",
      text: "In the lab, one of the trained network’s eight filters never fires on any test digit. Dead or redundant filters are common; inspecting them is part of understanding a model.",
    },
  ],

  exercise: {
    prompt: [
      { type: "p", text: "A 4 × 4 single-channel image and a 2 × 2 filter:" },
      {
        type: "table",
        caption: "Image (left) and filter (right)",
        head: ["Image row", "values", "Filter row", "weights"],
        rows: [
          ["1", "1, 2, 0, 1", "1", "1, 0"],
          ["2", "0, 1, 3, 1", "2", "0, −1"],
          ["3", "2, 0, 1, 2", "", ""],
          ["4", "1, 1, 0, 0", "", ""],
        ],
      },
      {
        type: "list",
        ordered: true,
        items: [
          "Compute the full output with stride 1 and no padding (no bias).",
          "What size is the output with stride 2? With padding 1 and stride 1?",
          "A layer takes 64-channel feature maps and has 128 filters of 3 × 3. How many parameters does it have?",
        ],
      },
    ],
    hints: ["The output is 3 × 3; each value is top-left minus bottom-right of a 2 × 2 window.", "Use ⌊(n + 2p − k)/s⌋ + 1 with k = 2.", "C_out × (C_in × k × k + 1)."],
    solution: [
      { type: "p", text: "Each output = top-left − bottom-right. Row 1: 1 − 1 = **0**, 2 − 3 = **−1**, 0 − 1 = **−1**. Row 2: 0 − 0 = **0**, 1 − 1 = **0**, 3 − 2 = **1**. Row 3: 2 − 1 = **1**, 0 − 0 = **0**, 1 − 0 = **1**." },
      { type: "p", text: "Stride 2: ⌊(4 − 2)/2⌋ + 1 = **2 × 2**. Padding 1, stride 1: (4 + 2 − 2)/1 + 1 = **5 × 5**." },
      { type: "p", text: "128 × (64 × 3 × 3 + 1) = **73,856**." },
    ],
  },

  quiz: [
    {
      question: "What output size does a 3 × 3 filter with stride 1 and padding 1 give on a 32 × 32 image?",
      options: ["30 × 30", "32 × 32", "16 × 16", "34 × 34"],
      answer: 1,
      explanation: "(32 + 2 − 3)/1 + 1 = 32: padding 1 exactly compensates a 3 × 3 filter.",
    },
    {
      question: "A conv layer with 16 filters of 3 × 3 reads 3-channel images. How many parameters does it have?",
      options: ["144", "448", "432", "It depends on the image size"],
      answer: 1,
      explanation: "16 × (3 × 3 × 3 + 1) = 448, whatever the image size.",
    },
    {
      question: "Why does a convolutional layer need far fewer parameters than a dense layer on images?",
      options: [
        "It uses smaller numbers",
        "Each filter’s weights are shared across all positions and only see a small patch",
        "It skips half the pixels",
        "It has no biases",
      ],
      answer: 1,
      explanation: "Local connections plus weight sharing: a few weights per filter, reused everywhere.",
    },
    {
      question: "A filter has −1 in its left column, 0 in the middle and +1 in its right column. Where is its output largest on a dark digit drawn on white paper (ink = high values)?",
      options: ["In plain background", "Where paper on the left meets ink on the right: the left edge of a stroke", "In the middle of thick strokes", "Everywhere equally"],
      answer: 1,
      explanation: "It computes right minus left, which is largest where values rise from left to right.",
    },
    {
      question: "What do Zeiler and Fergus report that deeper layers of an image CNN respond to?",
      options: ["Only edges, at every layer", "Increasingly complex patterns: corners, then textures, then class-specific parts and whole objects", "Random noise", "The image’s colour histogram"],
      answer: 1,
      explanation: "Their visualisations show a hierarchy, from edge–colour conjunctions in layer 2 to whole objects in layer 5.",
    },
  ],

  glossary: [
    { term: "Filter (kernel)", definition: "A small grid of learned weights slid across the input." },
    { term: "Feature map", definition: "The grid of outputs one filter produces across the input." },
    { term: "Stride", definition: "How many pixels the filter moves between positions." },
    { term: "Padding", definition: "A border of zeros added around the input so the filter can be centred on edge pixels." },
    { term: "Weight sharing", definition: "Using the same filter weights at every position." },
    { term: "Cross-correlation", definition: "Sliding and multiplying without flipping the filter; what deep learning frameworks call convolution." },
    { term: "Equivariance", definition: "Shifting the input shifts the output by the same amount." },
    { term: "Channel (of a feature map)", definition: "One of the C_out maps a layer outputs, one per filter." },
  ],

  references: [
    {
      title: "A guide to convolution arithmetic for deep learning",
      source: "Vincent Dumoulin & Francesco Visin, arXiv:1603.07285",
      url: "https://arxiv.org/abs/1603.07285",
      note: "Output shapes for every combination of kernel size, padding and stride, with diagrams.",
    },
    {
      title: "torch.nn.Conv2d",
      source: "PyTorch documentation",
      url: "https://docs.pytorch.org/docs/2.14/generated/torch.nn.Conv2d.html",
      note: "Defines the layer as a 2-D cross-correlation and gives the output-size formula and defaults (stride 1, padding 0).",
    },
    {
      title: "CS231n: Convolutional Neural Networks for Visual Recognition — Convolutional Networks",
      source: "Stanford University course notes",
      url: "https://cs231n.github.io/convolutional-networks/",
      note: "The (W − F + 2P)/S + 1 formula and parameter sharing, explained with worked examples.",
    },
    {
      title: "Gradient-Based Learning Applied to Document Recognition",
      source: "Yann LeCun, Léon Bottou, Yoshua Bengio & Patrick Haffner, Proceedings of the IEEE 86(11):2278–2324, 1998",
      url: "https://leon.bottou.org/papers/lecun-98h",
      note: "LeNet-5: convolutional networks with shared weights for handwritten digits.",
    },
    {
      title: "Visualizing and Understanding Convolutional Networks",
      source: "Matthew D. Zeiler & Rob Fergus, arXiv:1311.2901",
      url: "https://arxiv.org/abs/1311.2901",
      note: "Visualises what each layer responds to, from edge–colour conjunctions to whole objects.",
    },
    {
      title: "How transferable are features in deep neural networks?",
      source: "Jason Yosinski, Jeff Clune, Yoshua Bengio & Hod Lipson, arXiv:1411.1792",
      url: "https://arxiv.org/abs/1411.1792",
      note: "First-layer features (Gabor-like filters, colour blobs) appear general rather than specific to one dataset.",
    },
  ],

  next: [
    { pathSlug: "computer-vision", topicSlug: "pooling-cnn-architectures", reason: "Pooling, receptive fields and how layers are stacked into LeNet, VGG and ResNet." },
    { pathSlug: "computer-vision", topicSlug: "vision-evaluation-interpretation", reason: "Looking inside a trained network’s feature maps to explain its answers." },
    { pathSlug: "deep-learning", topicSlug: "backpropagation", reason: "How the filters’ weights are learned." },
  ],

  teaching: {
    notes: [
      "Do one window by hand on the board before touching any code; the worked example’s table is designed for that.",
      "Write the output-size formula once and use it for every example in the lesson.",
      "Show the dense-layer parameter count next to the conv count: the contrast is the argument for CNNs.",
    ],
    demo: "Apply the vertical-edge, horizontal-edge and blur filters to a photo with any image library and show the three feature maps side by side, then show a trained network’s first-layer filters.",
    discussion: [
      "Why might a learned filter end up “dead”? What could you change in training to avoid it?",
      "Is there any information an image could contain that a stack of 3 × 3 convolutions could never use?",
      "How does weight sharing relate to the augmentation of the previous lesson?",
    ],
    misconceptions: [
      "Thinking a filter is applied once to the whole image.",
      "Believing the parameter count grows with image size.",
      "Assuming every learned filter is meaningful.",
    ],
    challenge: {
      prompt:
        "Design a 3 × 3 filter that responds most to a single bright pixel surrounded by dark ones, and explain what it outputs on a uniform region. Then check your answer with “Your own” in the lab.",
      answer: [
        { type: "p", text: "Put 8 in the centre and −1 in the eight neighbours (a Laplacian-style filter). The weights sum to 0, so on a uniform region the output is 0; on a lone bright pixel of value v it is 8v, and on its neighbours −v." },
        { type: "p", text: "In the lab it fits the −9…9 limits exactly. On a digit it is largest wherever a pixel is much brighter than the average of its neighbours, and negative just beside bright pixels." },
      ],
    },
  },
};
