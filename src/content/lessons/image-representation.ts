import type { Lesson } from "../../types/content";

/*
 * Image representation and tensors. Lab numbers come from src/lib/images.ts (a generated
 * 16 × 16 scene) and are checked against torchvision in tests/vision.test.ts; the code output
 * was produced by running the script with PyTorch and torchvision.
 */
export const imageRepresentation: Lesson = {
  id: "image-representation",
  pathSlug: "computer-vision",
  topicSlug: "image-representation",
  title: "Image representation and tensors",
  summary:
    "To a network, a photo is a block of numbers with a shape, a type and a range. Getting those three right — channels in the expected order, values scaled and normalised the way the model was trained — is the first step of every vision project, and the source of some of its quietest bugs.",
  level: "intermediate",
  minutes: [40, 60],
  objectives: [
    "Explain an image tensor’s **shape**, **data type** and **value range**",
    "Convert between **channel-last** (H × W × C) and **channel-first** (C × H × W) layouts, and find one value in memory",
    "Scale and **normalise** images with the statistics a pretrained model expects",
    "Estimate how much memory a batch of images needs, and what lowering the resolution costs",
  ],
  prerequisites: [
    { label: "Vectors, matrices and tensors", href: "/learn/math-foundations/vectors-matrices-tensors" },
    { label: "Regularization and training diagnostics", href: "/learn/deep-learning/regularization-diagnostics" },
  ],

  intro: [
    {
      type: "p",
      text: "A digital image is a grid of **pixels**. In a greyscale image each pixel is one number, its brightness; in a colour image it is three numbers, the amounts of **red, green and blue**. Stack those grids and you have a 3-dimensional array — a tensor — with a height, a width and a number of channels.",
    },
    {
      type: "p",
      text: "This lesson follows one picture from the bytes in an image file to the floating-point tensor a network reads, and looks at every choice along the way: the order of the axes, the scale of the values, the normalisation, and the resolution.",
    },
  ],

  why: [
    {
      type: "p",
      text: "A network never complains about its input. Feed a pretrained model raw bytes instead of scaled values and it receives numbers up to about 1,111 where it was trained on at most 2.64 — and still returns a confident answer. Swap the channel order and it sees blue skies as red. None of these mistakes raises an error; they just make results quietly worse.",
    },
    {
      type: "p",
      text: "Shapes and memory also decide what you can train. One 224 × 224 colour image is 150,528 numbers; a batch of 32 of them as 32-bit floats is 18.4 MiB before the network has computed anything.",
    },
  ],

  explanation: {
    beginner: [
      {
        type: "p",
        text: "**Pixels and channels.** Each pixel of a colour image has a red, a green and a blue value. Image files usually store each value as one byte, a whole number from 0 (none) to 255 (full). (250, 205, 60) is a warm yellow; (0, 0, 0) is black.",
      },
      {
        type: "p",
        text: "**Shape.** A 16 × 16 colour image is 16 rows × 16 columns × 3 channels = 768 numbers. Image files and NumPy keep the channels last, (height, width, channels). PyTorch keeps them first, (channels, height, width), and adds a batch axis in front: (batch, channels, height, width).",
      },
      {
        type: "p",
        text: "**Scaling and normalising.** Networks work best on small numbers centred near zero. So the bytes are divided by 255 to give values from 0 to 1, and then each channel is shifted and scaled: subtract the channel’s average over the training images, divide by its standard deviation.",
      },
      {
        type: "p",
        text: "**Resolution.** Fewer pixels means less memory and faster training, but details smaller than a pixel disappear. Halving the width and height keeps only a quarter of the numbers.",
      },
    ],
    technical: [
      {
        type: "p",
        text: "**Layout and indexing.** An array is stored as one flat run of memory. In H × W × C order the value of channel c at row y, column x is at index (y·W + x)·C + c: the three channels of a pixel are neighbours. In C × H × W order it is at c·H·W + y·W + x: each channel is a separate plane. `permute` (PyTorch) or `transpose` (NumPy) changes the order of the axes; torchvision expects tensor images as (C, H, W) and batches as (N, C, H, W).",
      },
      {
        type: "p",
        text: "**Type and scale.** Decoded images are usually `uint8`. torchvision’s v2 pipeline converts with `ToImage()` (which does not scale) followed by `ToDtype(torch.float32, scale=True)`, which maps [0, 255] to [0, 1]; the older `ToTensor()` did both and is deprecated in v2.",
      },
      {
        type: "p",
        text: "**Normalisation.** `Normalize(mean, std)` computes (x − mean_c)/std_c for each channel c. Pretrained torchvision models expect the ImageNet statistics mean = (0.485, 0.456, 0.406) and std = (0.229, 0.224, 0.225), which their weights record in `weights.transforms()`. Inputs in [0, 1] then land between −2.12 and +2.64. For a model you train yourself, compute the statistics on the training split only.",
      },
      {
        type: "p",
        text: "**Greyscale and resolution.** torchvision’s `rgb_to_grayscale` uses 0.2989 R + 0.587 G + 0.114 B, weighting green most because the eye is most sensitive to it. Downsampling by averaging f × f blocks divides the number of values by f²; a 224 × 224 × 3 float32 tensor is 588.0 KiB.",
      },
    ],
  },

  analogy: {
    title: "A spreadsheet per colour",
    blocks: [
      {
        type: "p",
        text: "Picture three spreadsheets of the same size: one holds how much red each pixel has, one green, one blue. Channel-first storage keeps the three sheets one after another; channel-last storage interleaves them, writing each cell’s red, green and blue side by side. Same numbers, different order — and a program that reads one order as the other mixes up the sheets.",
      },
      {
        type: "p",
        text: "Normalising is like converting every sheet to the same units before comparing them, using the conversion the model learned with. Where the analogy fails: real tensors have no labelled rows or columns; only the shape tells you which axis is which.",
      },
    ],
  },

  workedExample: {
    title: "One pixel, from bytes to model input",
    blocks: [
      {
        type: "p",
        text: "The lab’s 16 × 16 picture has a house whose wall pixels are (200, 60, 50). Follow the red value of the pixel at row 10, column 3.",
      },
      {
        type: "table",
        caption: "The wall pixel through the standard pipeline",
        head: ["Step", "red", "green", "blue"],
        rows: [
          ["Bytes in the file", "200", "60", "50"],
          ["÷ 255", "0.784", "0.235", "0.196"],
          ["− ImageNet mean", "0.299", "−0.221", "−0.210"],
          ["÷ ImageNet std", "**1.307**", "**−0.985**", "**−0.933**"],
          ["Bug: normalise the bytes directly", "871.2", "265.8", "220.4"],
        ],
      },
      {
        type: "p",
        text: "Red: 200 / 255 = 0.784; (0.784 − 0.485) / 0.229 = 1.307. Without the division by 255, (200 − 0.485) / 0.229 = 871.2 — hundreds of times larger than anything the model saw in training.",
      },
      {
        type: "p",
        text: "Where is that red value in memory? In H × W × C order: (10 × 16 + 3) × 3 + 0 = **489**. In C × H × W order: 0 × 256 + 10 × 16 + 3 = **163**. Its green value is next door (490) in the first layout and 256 places later (419) in the second.",
      },
    ],
  },

  math: {
    blocks: [
      { type: "equation", expression: "index_HWC(y, x, c) = (y·W + x)·C + c", meaning: "Channel-last: the channels of one pixel are adjacent." },
      { type: "equation", expression: "index_CHW(y, x, c) = c·H·W + y·W + x", meaning: "Channel-first: each channel is a contiguous plane." },
      { type: "equation", expression: "x̂_c = (v / 255 − μ_c) / σ_c", meaning: "Scale a byte v to [0, 1], then standardise with channel c’s mean μ_c and standard deviation σ_c." },
      { type: "equation", expression: "grey = 0.2989 R + 0.587 G + 0.114 B", meaning: "Luminance weights used by torchvision’s rgb_to_grayscale." },
      { type: "equation", expression: "bytes = N × C × H × W × (bytes per value)", meaning: "Memory for a batch: 1 per value for uint8, 4 for float32." },
    ],
    notation: [
      { symbol: "N, C, H, W", meaning: "Batch size, channels, height and width" },
      { symbol: "y, x, c", meaning: "Row, column and channel of one value" },
      { symbol: "μ_c, σ_c", meaning: "Per-channel mean and standard deviation used for normalisation" },
      { symbol: "v", meaning: "A byte value from 0 to 255" },
    ],
  },

  process: {
    title: "Preparing images for a model",
    steps: [
      { title: "Check what you loaded", text: "Print the shape, dtype, minimum and maximum. A decoded photo is usually (H, W, 3), uint8, 0–255." },
      { title: "Match the model’s layout", text: "PyTorch wants (C, H, W) per image and (N, C, H, W) per batch; convert with permute or with torchvision’s ToImage." },
      { title: "Scale to [0, 1]", text: "ToDtype(torch.float32, scale=True) divides by 255 for uint8 input." },
      { title: "Normalise with the right statistics", text: "For a pretrained model, use its weights’ transforms; for your own model, the training split’s mean and standard deviation." },
      { title: "Check again", text: "After normalising, values should be roughly between −3 and 3. Values in the hundreds mean a step was skipped." },
      { title: "Budget the memory", text: "N × C × H × W × 4 bytes for float32 inputs; activations inside the network take far more." },
    ],
  },

  interactive: {
    component: "image-lab",
    kind: "computation",
    intro:
      "Three panels on a 16 × 16 picture generated in your browser: read any pixel in both memory layouts, follow one pixel from bytes to normalised input (with the most common bug), and lower the resolution.",
    tryThis: [
      "Move the selected pixel into the sun and read its red, green and blue values. Switch the view to Red, then Blue.",
      "Switch the memory layout between H × W × C and C × H × W and watch where the pixel’s three values sit.",
      "In panel 2, pick the Sun pixel, then tick “Forget to divide by 255”.",
      "Compare the Sky and Grass pixels after normalising: which channel stands out for each?",
      "In panel 3, go from 16 × 16 to 8 × 8 to 4 × 4. When do the windows disappear? The house?",
    ],
    expect: [
      { action: "Pixel (4, 11), in the sun", result: "R 250, G 205, B 60. In H × W × C its values are at 225, 226, 227; in C × H × W at 75, 331 and 587, 256 apart." },
      { action: "Red view, then Blue view", result: "The sun is bright in red and dark in blue; the sky is brightest in blue." },
      { action: "Sun pixel, normalised", result: "2.163, 1.553, −0.759 — inside the −2.12 to 2.64 range any [0, 1] input maps to." },
      { action: "Forget to divide by 255", result: "1,089.6, 913.1, 264.9: values the model has never seen, and no error message." },
      { action: "8 × 8 and 4 × 4", result: "192 and 48 values instead of 768. The windows blur into the wall at 8 × 8; at 4 × 4 the house is a single reddish square." },
    ],
  },

  code: {
    label: "image_tensors.py",
    language: "Python",
    source: `import numpy as np
import torch
from PIL import Image
from torchvision import models
from torchvision.transforms import v2

# A small RGB picture as an image file decodes: height x width x channels, one byte per value.
img = np.zeros((16, 16, 3), dtype=np.uint8)
img[:10] = [110, 160, 215]                      # sky
img[10:] = [70, 150, 70]                        # grass
img[8:13, 3:8] = [200, 60, 50]                  # a red house
print("array:", img.shape, img.dtype, img.min(), img.max())
print("pixel (row 9, col 4):", img[9, 4])

to_tensor = v2.Compose([v2.ToImage(), v2.ToDtype(torch.float32, scale=True)])
t = to_tensor(Image.fromarray(img))             # channels first, floats in [0, 1]
print("tensor:", tuple(t.shape), t.dtype, round(t.min().item(), 3), round(t.max().item(), 3))
print("same pixel:", t[:, 9, 4])

normalize = v2.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
x = normalize(t)
print("normalised:", x[:, 9, 4])
raw = torch.from_numpy(img).permute(2, 0, 1).float()       # the bug: bytes, not 0..1
print("forgot to scale:", normalize(raw)[:, 9, 4])

batch = x.unsqueeze(0)                          # models take a batch: (N, C, H, W)
print("batch:", tuple(batch.shape), "| channels last:", tuple(batch.permute(0, 2, 3, 1).shape))
print("bytes as uint8:", img.nbytes, "| as float32:", t.nelement() * t.element_size())

# Pretrained weights record the preprocessing they expect (shown without downloading them).
print(models.ResNet18_Weights.DEFAULT.transforms())`,
    walkthrough: [
      { lines: "8–13", text: "Build a picture the way a decoder returns one: a (16, 16, 3) array of bytes. Indexing [9, 4] reads row 9, column 4 — all three channels." },
      { lines: "15–18", text: "torchvision’s v2 conversion: ToImage moves the channels first, ToDtype(…, scale=True) turns bytes into floats in [0, 1]." },
      { lines: "20–22", text: "Normalise with the ImageNet statistics, as a pretrained model expects." },
      { lines: "23–24", text: "The common bug, reproduced on purpose: normalising raw bytes." },
      { lines: "26–28", text: "Add the batch axis, convert back to channel-last with permute, and compare memory for uint8 and float32." },
      { lines: "31", text: "Every set of pretrained weights carries its own preprocessing; printing it shows the resize, crop and statistics." },
    ],
    shapes: [
      { name: "img", shape: "(16, 16, 3) uint8", meaning: "Height, width, channels — as decoded from a file" },
      { name: "t", shape: "(3, 16, 16) float32", meaning: "Channels first, values in [0, 1]" },
      { name: "x", shape: "(3, 16, 16) float32", meaning: "Normalised per channel" },
      { name: "batch", shape: "(1, 3, 16, 16)", meaning: "A batch of one, the layout models take" },
    ],
    output: {
      label: "Output",
      text: "array: (16, 16, 3) uint8 50 215\npixel (row 9, col 4): [200  60  50]\ntensor: (3, 16, 16) torch.float32 0.196 0.843\nsame pixel: tensor([0.7843, 0.2353, 0.1961])\nnormalised: tensor([ 1.3070, -0.9853, -0.9330])\nforgot to scale: tensor([871.2445, 265.8214, 220.4178])\nbatch: (1, 3, 16, 16) | channels last: (1, 16, 16, 3)\nbytes as uint8: 768 | as float32: 3072\nImageClassification(\n    crop_size=[224]\n    resize_size=[256]\n    mean=[0.485, 0.456, 0.406]\n    std=[0.229, 0.224, 0.225]\n    interpolation=InterpolationMode.BILINEAR\n)",
      note: "Produced by running the script with PyTorch and torchvision. The wall pixel gives the same 1.307, −0.985, −0.933 as the worked example, and the same 871.2, 265.8, 220.4 when the scaling step is skipped. The last lines are the inference preprocessing recorded with torchvision’s ResNet-18 weights: resize to 256, crop to 224, then the ImageNet mean and standard deviation.",
    },
  },

  useCases: [
    {
      title: "Using a pretrained model",
      text: "Every pretrained torchvision model expects its own input size and statistics. Taking them from `weights.transforms()` instead of retyping them avoids silent mismatches.",
    },
    {
      title: "Medical and scientific images",
      text: "CT scans, microscopy and satellite images often have one or many channels and values outside 0–255 (for example 16-bit). The same questions apply: what shape, what type, what range, and which statistics to normalise with.",
    },
    {
      title: "Planning a training run",
      text: "Input resolution and batch size set the memory a run needs. Halving the resolution divides the input memory by four, which is why many models are trained at 224 × 224 rather than at full camera resolution.",
    },
  ],

  mistakes: [
    {
      kind: "mistake",
      title: "Normalising bytes instead of [0, 1] values",
      text: "The model receives numbers in the hundreds. Nothing crashes; accuracy just collapses. Check the minimum and maximum after preprocessing.",
    },
    {
      kind: "mistake",
      title: "Mixing up channel order",
      text: "H × W × C data reshaped (rather than permuted) to C × H × W scrambles the pixels; BGR images from OpenCV fed as RGB swap red and blue. Use permute for axes and convert colour order explicitly.",
    },
    {
      kind: "mistake",
      title: "Computing normalisation statistics on all the data",
      text: "For a model you train, the mean and standard deviation must come from the training split only; using validation or test images leaks information about them.",
    },
    {
      kind: "misconception",
      title: "“Normalisation changes what the image shows”",
      text: "It is a fixed shift and scale per channel. Nothing is lost; it only puts the numbers on the scale the network’s weights expect.",
    },
    {
      kind: "limitation",
      title: "ImageNet statistics are not universal",
      text: "They describe everyday photos. For X-rays or satellite bands, a model trained from scratch should use statistics of its own training data — and a pretrained model may not transfer well at all.",
    },
  ],

  exercise: {
    prompt: [
      { type: "p", text: "An image is stored as a (480, 640, 3) uint8 array: 480 rows, 640 columns." },
      {
        type: "list",
        ordered: true,
        items: [
          "What shape does it have after torchvision’s ToImage, and after adding a batch axis?",
          "At which flat index is the blue value of the pixel at row 2, column 5 in the original layout? And in C × H × W order?",
          "That pixel is (30, 120, 240). Normalise its blue value with the ImageNet statistics (mean 0.406, std 0.225).",
          "How many bytes does a batch of 16 such images take as float32?",
        ],
      },
    ],
    hints: ["ToImage puts the channels first.", "Use (y·W + x)·C + c and c·H·W + y·W + x with W = 640, H = 480.", "Divide by 255 first.", "N × C × H × W × 4."],
    solution: [
      { type: "p", text: "**(3, 480, 640)**, then **(1, 3, 480, 640)**." },
      { type: "p", text: "H × W × C: (2 × 640 + 5) × 3 + 2 = **3,857**. C × H × W: 2 × 480 × 640 + 2 × 640 + 5 = **615,685**." },
      { type: "p", text: "240 / 255 = 0.941; (0.941 − 0.406) / 0.225 ≈ **2.38**." },
      { type: "p", text: "16 × 3 × 480 × 640 × 4 = **58,982,400 bytes**, about 56.3 MiB." },
    ],
  },

  quiz: [
    {
      question: "A PyTorch model expects a batch of colour images. Which shape is right for 8 images of 224 × 224 pixels?",
      options: ["(8, 224, 224, 3)", "(8, 3, 224, 224)", "(3, 8, 224, 224)", "(224, 224, 3, 8)"],
      answer: 1,
      explanation: "PyTorch uses (N, C, H, W): batch, channels, height, width.",
    },
    {
      question: "What does ToDtype(torch.float32, scale=True) do to a uint8 image?",
      options: ["Nothing but change the type", "Maps 0–255 to 0–1", "Subtracts the ImageNet mean", "Converts it to greyscale"],
      answer: 1,
      explanation: "With scale=True, integer images are rescaled to [0, 1] as they are converted to floats.",
    },
    {
      question: "You normalise with the ImageNet statistics but forget to divide by 255 first. What happens?",
      options: [
        "PyTorch raises an error",
        "The model receives values in the hundreds and its predictions silently degrade",
        "Nothing, because normalisation fixes the scale",
        "The image becomes greyscale",
      ],
      answer: 1,
      explanation: "Normalisation assumes inputs in [0, 1]; on bytes it produces values up to about 1,111. No error is raised.",
    },
    {
      question: "In C × H × W storage, how far apart in memory are the red and green values of one pixel in a 16 × 16 image?",
      options: ["1", "3", "16", "256"],
      answer: 3,
      explanation: "Each channel is a plane of H × W = 256 values, so the same pixel’s next channel is 256 places later.",
    },
    {
      question: "Why should a model you train yourself be normalised with statistics from the training split only?",
      options: [
        "They are faster to compute",
        "Using validation or test images leaks information about data the model must not see",
        "The test set has no mean",
        "PyTorch requires it",
      ],
      answer: 1,
      explanation: "Any statistic computed on held-out data makes the evaluation slightly optimistic.",
    },
  ],

  glossary: [
    { term: "Pixel", definition: "One cell of the image grid, holding one value per channel." },
    { term: "Channel", definition: "One component of every pixel, such as red, green or blue." },
    { term: "Channel-first (C × H × W)", definition: "Layout with each channel stored as a contiguous plane; PyTorch’s convention." },
    { term: "Channel-last (H × W × C)", definition: "Layout with a pixel’s channels stored together; used by image files, PIL and NumPy." },
    { term: "uint8", definition: "Unsigned 8-bit integer: whole numbers from 0 to 255, one byte each." },
    { term: "Normalisation", definition: "Subtracting a per-channel mean and dividing by a per-channel standard deviation." },
    { term: "Resolution", definition: "The number of pixels in height and width." },
    { term: "Batch axis", definition: "The leading dimension N that stacks several images for one forward pass." },
  ],

  references: [
    {
      title: "Transforming images, videos, boxes and more (torchvision.transforms)",
      source: "torchvision documentation",
      url: "https://docs.pytorch.org/vision/stable/transforms.html",
      note: "Recommends the v2 transforms; tensor images are (C, H, W) and batches (N, C, H, W); ToImage plus ToDtype(scale=True) replaces the deprecated ToTensor.",
    },
    {
      title: "Models and pre-trained weights",
      source: "torchvision documentation",
      url: "https://docs.pytorch.org/vision/stable/models.html",
      note: "Each set of weights bundles its inference preprocessing, available as weights.transforms().",
    },
    {
      title: "torchvision.transforms.functional.rgb_to_grayscale",
      source: "torchvision documentation",
      url: "https://docs.pytorch.org/vision/0.29/generated/torchvision.transforms.functional.rgb_to_grayscale.html",
      note: "The greyscale conversion the lab reproduces (its weights are checked against torchvision in this site’s tests).",
    },
    {
      title: "ImageNet Classification with Deep Convolutional Neural Networks",
      source: "Alex Krizhevsky, Ilya Sutskever & Geoffrey E. Hinton, NIPS 25, 2012",
      url: "https://papers.nips.cc/paper/2012/hash/c399862d3b9d6b76c8436e924a68c45b-Abstract.html",
      note: "The network that made ImageNet’s 1,000-class benchmark the standard source of pretrained vision models.",
    },
    {
      title: "CS231n: Deep Learning for Computer Vision — Convolutional Neural Networks",
      source: "Stanford University course notes",
      url: "https://cs231n.github.io/convolutional-networks/",
      note: "Images as volumes of width × height × depth, the starting point for the next lessons.",
    },
  ],

  next: [
    { pathSlug: "computer-vision", topicSlug: "image-preprocessing-augmentation", reason: "Resizing, cropping and augmentation build on the same pipeline." },
    { pathSlug: "computer-vision", topicSlug: "convolution-feature-maps", reason: "What a network does with the tensor once it has it." },
    { pathSlug: "math-foundations", topicSlug: "vectors-matrices-tensors", reason: "A refresher on shapes, axes and broadcasting." },
  ],

  teaching: {
    notes: [
      "Start with one pixel on the board and its three numbers; the rest of the lesson is bookkeeping around that idea.",
      "Have students print shape, dtype, min and max at every step of a pipeline. It is the habit that catches the bugs in this lesson.",
      "The two memory-index formulas are worth deriving together: they explain why permute is needed and why reshape is wrong.",
    ],
    demo: "Load any photo, normalise it correctly and incorrectly (without ÷ 255, and with red and blue swapped), and show a pretrained model’s top prediction for each. Students are usually surprised that all three run without errors.",
    discussion: [
      "Why might a model trained on ImageNet photos do badly on X-rays even with the right normalisation?",
      "When would you keep more than three channels? (Satellite bands, depth, infrared.)",
      "What is lost when you average pixels to lower the resolution, and what is kept?",
    ],
    misconceptions: [
      "Thinking reshape and permute are interchangeable.",
      "Believing normalisation statistics must be recomputed for a pretrained model on new data (they come with the weights).",
      "Assuming an error will tell you when preprocessing is wrong.",
    ],
    challenge: {
      prompt:
        "A colleague’s pipeline gives a pretrained model inputs whose minimum is −2.1 and maximum is 2.6, but accuracy is still poor. Their images come from OpenCV. What is the most likely bug, and how would you confirm it?",
      answer: [
        { type: "p", text: "The range is right, so scaling and normalisation are probably fine. OpenCV decodes images in **BGR** order, so red and blue are likely swapped, and each is normalised with the other’s statistics." },
        { type: "p", text: "Confirm by printing a known-coloured pixel (sky should be high in blue) or by reversing the channel axis and checking whether accuracy recovers." },
      ],
    },
  },
};
