import type { Lesson } from "../../types/content";

/*
 * Image preprocessing and augmentation. The digit counts come from the shipped CNNs
 * (src/content/datasets/digits-cnn*.ts, trained in PyTorch by tests/fixtures) evaluated with
 * src/lib/augmentation.ts, and are checked in tests/vision.test.ts; the code output was
 * produced by running the script with PyTorch and torchvision.
 */
export const imagePreprocessingAugmentation: Lesson = {
  id: "image-preprocessing-augmentation",
  pathSlug: "computer-vision",
  topicSlug: "image-preprocessing-augmentation",
  title: "Image preprocessing and augmentation",
  summary:
    "Training images get random, label-preserving changes so the model learns what does not matter; evaluation images get only the fixed steps every real input gets. The art is choosing changes that really keep the label — a 6 turned upside down is a 9.",
  level: "intermediate",
  minutes: [45, 65],
  objectives: [
    "Build **separate training and evaluation transforms**, and say which steps belong in each",
    "Choose **label-preserving** augmentations for a task, and recognise ones that change the label",
    "Explain why validation and test images are **never augmented**, and how a shifted test set differs from a stress test",
    "Read what augmentation buys and costs from a with/without comparison",
  ],
  prerequisites: [
    { label: "Image representation and tensors", href: "/learn/computer-vision/image-representation" },
    { label: "Overfitting, underfitting and generalization", href: "/learn/ml-foundations/overfitting-generalization" },
  ],

  intro: [
    {
      type: "p",
      text: "**Preprocessing** is what every image gets before the model sees it: decode, resize or crop to the model’s input size, convert to floats, normalise. It must be identical in training and in use, or the model sees one kind of input while learning and another when it matters.",
    },
    {
      type: "p",
      text: "**Augmentation** is extra, random variation applied only while training: a slight shift, rotation, crop, flip or colour change, drawn fresh every time an image is used. The model sees many versions of each training image and learns that those changes do not affect the answer.",
    },
  ],

  why: [
    {
      type: "p",
      text: "In the lab, a small CNN trained on centred handwritten digits gets 98.7% of test digits right — and 57.0% when the same digits are moved one pixel to the right. Trained again with shifted copies, it gets 94.6% on the moved digits. One pixel is an eighth of these images’ width; real photos vary in position, scale, lighting and angle far more.",
    },
    {
      type: "p",
      text: "Augmentation is also cheap regularisation: it makes the training set effectively larger without collecting a single new label. The catch is that each change must keep the label true. Rotate a 6 by 180° and the network itself reads 51 of 54 test sixes as 9.",
    },
  ],

  explanation: {
    beginner: [
      {
        type: "p",
        text: "**Two pipelines.** The training pipeline adds random changes; the evaluation pipeline does only the fixed steps. Validation and test images go through the evaluation pipeline, because they must look like the real images the model will meet.",
      },
      {
        type: "p",
        text: "**Label-preserving.** Before using a change, ask: would a person still give this image the same label? A mirrored photo of a dog is still a dog. A mirrored 3 is not a digit at all, and an upside-down 6 is a 9. Survey authors call this the *safety* of an augmentation.",
      },
      {
        type: "p",
        text: "**Amount matters as much as kind.** Handwriting is often tilted by a few degrees, so small rotations are realistic. A quarter turn is not: in the lab the network reads almost every digit turned 90° as a 4.",
      },
      {
        type: "p",
        text: "**Augmentation protects against the variation it shows.** A network trained on one-pixel shifts handles one-pixel shifts well, diagonal shifts partly, and two-pixel shifts much less.",
      },
    ],
    technical: [
      {
        type: "p",
        text: "**Resizing and cropping.** Pretrained classifiers take a fixed size. A common recipe (the PyTorch transfer-learning tutorial’s) trains on `RandomResizedCrop(224)` plus `RandomHorizontalFlip()` and evaluates with `Resize(256)` then `CenterCrop(224)`, with the same normalisation in both. Random crops double as scale and position augmentation.",
      },
      {
        type: "p",
        text: "**Where the randomness lives.** Each call to a random transform draws new parameters, so each epoch sees a different version of every image; nothing is precomputed or stored. The lab’s shifted-copies training is a fixed, enlarged dataset instead (originals plus four one-pixel shifts), which is simpler to reproduce but the same idea.",
      },
      {
        type: "p",
        text: "**Invariance has to be learnable.** Augmentation asks the model to give the same output for transformed inputs. A small CNN can (shift-trained, its accuracy on unshifted digits drops only from 98.7% to 96.8%). A linear model on raw pixels has one weight per pixel and class, cannot represent “this stroke, anywhere”, and pays more: 95.4% → 89.8% on unshifted digits for a gain from 43.2% to 80.9% on shifted ones.",
      },
      {
        type: "p",
        text: "**Never on the test set.** The test score estimates performance on real inputs, so test images must be processed exactly as real inputs will be. Evaluating on deliberately shifted or blurred test images is a separate, clearly labelled **robustness check**, not a replacement for the test score. Normalisation statistics come from the training split, computed on unaugmented images.",
      },
    ],
  },

  analogy: {
    title: "Practising in all weathers",
    blocks: [
      {
        type: "p",
        text: "A driving student who only ever practises on a sunny afternoon struggles in rain. Practising in rain, at dusk and in traffic — while the road rules stay the same — prepares them for the variation they will meet. That is augmentation: change the conditions, keep the answer.",
      },
      {
        type: "p",
        text: "But the driving test itself is taken on real roads, not in a simulator set to “extra difficult”. And some changes are not just harder conditions: practise on mirrored roads and you have learned to drive on the wrong side. Where the analogy fails: a network does not know which changes are absurd; you have to decide for it.",
      },
    ],
  },

  workedExample: {
    title: "What one-pixel shifts did to two networks",
    blocks: [
      {
        type: "p",
        text: "Both CNNs have the same architecture, starting weights and 300 full-batch Adam steps. One trained on the 1,258 training digits as they are; the other on those plus copies moved one pixel left, right, up and down (6,290 images). Both are scored on the 539 test digits, moved as listed — a stress test, not the reported score.",
      },
      {
        type: "table",
        caption: "Test accuracy of the small CNN, with every test digit shifted",
        head: ["Test digits", "trained on originals", "trained with shifted copies"],
        rows: [
          ["As they are", "**98.7%**", "96.8%"],
          ["1 pixel right", "57.0%", "**94.6%**"],
          ["1 pixel left", "56.6%", "93.9%"],
          ["1 pixel down", "65.3%", "91.5%"],
          ["1 pixel up", "54.0%", "94.1%"],
          ["1 right and 1 down (never seen in training)", "24.1%", "64.2%"],
          ["2 pixels right (never seen in training)", "19.3%", "43.0%"],
        ],
      },
      {
        type: "p",
        text: "The shifted copies cost 1.9 points on unshifted digits and gain 26 to 40 points on one-pixel moves. They help less on moves the training data never showed: a diagonal move, or two pixels.",
      },
      {
        type: "p",
        text: "Which transforms keep the label? The table in the lab answers it for this network: after a 180° turn it reads 51 of 54 sixes as 9 and 34 of 54 nines as 6; after mirroring, none of 55 threes as 3 (44 as 8) but 52 of 53 zeros as 0.",
      },
    ],
  },

  math: {
    blocks: [
      { type: "equation", expression: "x̃ = T_θ(x),   θ ~ p(θ),   label(x̃) = label(x)", meaning: "Augmentation: a random transform T with fresh parameters θ each time, assumed to keep the label." },
      { type: "equation", expression: "min_w  E_(x,y) E_θ [ L( f_w(T_θ(x)), y ) ]", meaning: "Training then minimises the expected loss over both the data and the random transforms." },
      { type: "equation", expression: "shift_(dx,dy)(x)[i, j] = x[i − dy, j − dx]  (0 outside the image)", meaning: "A translation by dx pixels right and dy down, filling the uncovered edge with zeros." },
      { type: "equation", expression: "evaluation: x̂ = normalise(crop(resize(x)))", meaning: "No randomness: the same fixed steps for validation, test and real use." },
    ],
    notation: [
      { symbol: "T_θ", meaning: "A transform (crop, flip, rotation, shift, colour change) with parameters θ" },
      { symbol: "p(θ)", meaning: "The distribution the parameters are drawn from, such as a rotation of up to ±10°" },
      { symbol: "f_w", meaning: "The model with weights w" },
      { symbol: "dx, dy", meaning: "Shift in pixels to the right and downwards" },
    ],
  },

  process: {
    title: "Designing a preprocessing and augmentation pipeline",
    steps: [
      { title: "Write the evaluation pipeline first", text: "Exactly what a real input will get: decode, resize, crop, convert, normalise. Validation and test use it unchanged." },
      { title: "List the variation real inputs have", text: "Position, scale, lighting, blur, angle, background. Augment for those, in realistic amounts." },
      { title: "Check each transform keeps the label", text: "Look at transformed examples of every class. Flips and large rotations are the usual offenders." },
      { title: "Build the training pipeline", text: "The random transforms, then the same conversion and normalisation as evaluation." },
      { title: "Compare with and without", text: "Train both ways and compare on the untouched validation set; augmentation is a hyperparameter." },
      { title: "Stress-test separately", text: "If robustness matters, report accuracy on shifted, blurred or darker test images as an extra, labelled number." },
    ],
  },

  interactive: {
    component: "augmentation-lab",
    kind: "computation",
    intro:
      "Two panels on the 8 × 8 digits, all evaluated in your browser. The first applies five transforms to every test digit and shows what the trained CNN reads. The second compares networks trained with and without shifted copies on shifted test digits — the CNN trained beforehand in PyTorch, and a linear model you can train here.",
    tryThis: [
      "Panel 1: choose “Turn 180°” and look at the sixes, then the nines.",
      "Choose “Mirror left–right” and compare the rows for 0, 3 and 8.",
      "Choose “Turn 90°” and read the “most often read as” column.",
      "Choose “Move 1 pixel right”. Which digits suffer most?",
      "Panel 2: step through the test shifts and compare the two CNN columns.",
      "Press the button to train the linear model both ways, then look at “As they are”.",
    ],
    expect: [
      { action: "Turn 180°", result: "Sixes are read as 9 (51 of 54) and nines as 6 (34 of 54): the label itself changes." },
      { action: "Mirror left–right", result: "0 survives (52 of 53) and 8 mostly does (42 of 52); no mirrored 3 is read as 3 (44 of 55 become 8)." },
      { action: "Turn 90°", result: "Nearly everything is read as 4 — even 53 of 55 fives." },
      { action: "Move 1 pixel right", result: "Every label survives for a person, yet only 17 of 53 zeros and 9 of 52 eights are still read correctly." },
      { action: "Panel 2, CNN", result: "As they are 98.7% → 96.8%; 1 right 57.0% → 94.6%; 1 right and 1 down 24.1% → 64.2%; 2 right 19.3% → 43.0%." },
      { action: "Panel 2, linear model", result: "As they are 95.4% → 89.8%; 1 right 43.2% → 80.9%. A model that cannot learn the invariance pays more for it." },
    ],
  },

  code: {
    label: "augmentation.py",
    language: "Python",
    source: `import torch
from sklearn.datasets import load_digits
from torchvision.transforms import v2

digits = load_digits()
images = torch.tensor(digits.images / 16.0, dtype=torch.float32).unsqueeze(1)  # (1797, 1, 8, 8)
train_images = images[:1200]                    # pretend split: statistics from training data only
mean, std = train_images.mean().item(), train_images.std().item()
print(f"training mean {mean:.3f}, std {std:.3f}")

# Training: random, label-preserving changes. Evaluation: the fixed steps only.
train_tf = v2.Compose([
    v2.RandomAffine(degrees=10, translate=(0.125, 0.125)),     # up to 10 degrees, up to 1 pixel
    v2.Normalize(mean=[mean], std=[std]),
])
eval_tf = v2.Normalize(mean=[mean], std=[std])

x = images[0]
torch.manual_seed(0)
print("two training views differ:", not torch.equal(train_tf(x), train_tf(x)))
print("evaluation is repeatable:", torch.equal(eval_tf(x), eval_tf(x)))

# A flip suits photos of cats, not digits: a mirrored 3 is not a 3.
three = images[3]
flipped = v2.functional.horizontal_flip(three)
print("digit", digits.target[3], "and mirrored:")
for a, b in zip(three[0], flipped[0]):
    print("".join("#" if v > 0.4 else "." for v in a), "  ", "".join("#" if v > 0.4 else "." for v in b))

# Each split gets its own transform: augment only what the model learns from.
# train_set = MyDataset(train_files, transform=train_tf)
# val_set   = MyDataset(val_files,   transform=eval_tf)
# test_set  = MyDataset(test_files,  transform=eval_tf)`,
    walkthrough: [
      { lines: "5–9", text: "The digits as a (1797, 1, 8, 8) tensor in [0, 1]. Normalisation statistics come from the training part only." },
      { lines: "12–15", text: "The training pipeline: a random affine transform (up to ±10° and up to an eighth of the width, one pixel here), then normalisation." },
      { lines: "16", text: "The evaluation pipeline: normalisation only. Validation, test and real inputs all get this." },
      { lines: "18–21", text: "Calling the training transform twice gives two different views of the same digit; the evaluation transform is deterministic." },
      { lines: "23–28", text: "Mirror a 3 and draw both in text: the result is not a digit, so horizontal flips are not label-preserving here." },
      { lines: "30–33", text: "How the two pipelines are wired to the three splits in a typical Dataset." },
    ],
    shapes: [
      { name: "images", shape: "(1797, 1, 8, 8)", meaning: "All digits: one channel of 8 × 8 values in [0, 1]" },
      { name: "x", shape: "(1, 8, 8)", meaning: "One digit, as transforms receive it" },
      { name: "train_tf(x)", shape: "(1, 8, 8)", meaning: "A random, normalised view — different on every call" },
      { name: "flipped", shape: "(1, 8, 8)", meaning: "The mirrored 3" },
    ],
    output: {
      label: "Output",
      text: "training mean 0.306, std 0.375\ntwo training views differ: True\nevaluation is repeatable: True\ndigit 3 and mirrored:\n..###...    ...###..\n.##.#...    ...#.##.\n...##...    ...##...\n...##...    ...##...\n....##..    ..##....\n.....##.    .##.....\n..#..##.    .##..#..\n..####..    ..####..",
      note: "Produced by running the script with PyTorch and torchvision. The mirrored digit opens to the right like a backwards 3 — a shape that never occurs in real handwriting, which is why the lab’s network reads none of the mirrored test threes as 3.",
    },
  },

  useCases: [
    {
      title: "Photo classifiers",
      text: "Random resized crops, horizontal flips and mild colour changes are the standard training augmentations for everyday photos, where a mirror image or a closer framing shows the same thing.",
    },
    {
      title: "Satellite and microscope images",
      text: "With no natural “up”, rotations by any angle and vertical flips are label-preserving, and are used freely.",
    },
    {
      title: "Documents and digits",
      text: "Small shifts, slight rotations and elastic distortions mimic real handwriting; flips and large rotations are avoided because they change or destroy the meaning.",
    },
  ],

  mistakes: [
    {
      kind: "mistake",
      title: "Augmenting the validation or test set",
      text: "Random changes make the score noisy and describe images the model will not meet. Evaluate on images processed exactly as real inputs; report stress tests separately.",
    },
    {
      kind: "mistake",
      title: "Different fixed steps in training and evaluation",
      text: "Normalising with different statistics, or resizing differently, in the two pipelines gives the model inputs at test time that it never saw while learning.",
    },
    {
      kind: "mistake",
      title: "Label-changing augmentations",
      text: "Flipping traffic signs (left turn becomes right turn), rotating digits by 180° or mirroring text teaches the model contradictions. Look at transformed examples of every class before training.",
    },
    {
      kind: "misconception",
      title: "“More augmentation is always better”",
      text: "Unrealistic or excessive changes can lower accuracy on real inputs, as the shift-trained linear model shows. Treat strength and choice as hyperparameters, tuned on validation data.",
    },
    {
      kind: "limitation",
      title: "Augmentation is not new data",
      text: "It teaches invariance to the changes you thought of. It cannot add backgrounds, viewpoints or kinds of object that the training set lacks.",
    },
  ],

  exercise: {
    prompt: [
      { type: "p", text: "For each task, say whether the augmentation is label-preserving, and why." },
      {
        type: "list",
        ordered: true,
        items: [
          "Classifying photos of cats and dogs: horizontal flip; vertical flip.",
          "Classifying road signs, including “turn left” and “turn right”: horizontal flip.",
          "Classifying land use from satellite tiles: rotation by any multiple of 90°.",
          "A colleague evaluates on test images with random flips “to make the test harder”. What is wrong, and what should they report instead?",
        ],
      },
    ],
    hints: ["Ask whether a person would give the transformed image the same label.", "Some classes are defined by direction.", "Does a satellite tile have an up?", "What does the test score estimate?"],
    solution: [
      { type: "p", text: "**Horizontal flip: yes** — a mirrored cat is still a cat. **Vertical flip: usually no** — upside-down pets are rare in real photos, so it adds unrealistic images (it would not change the label, but it wastes capacity)." },
      { type: "p", text: "**No.** Mirroring a “turn left” sign makes a “turn right” sign: the label changes." },
      { type: "p", text: "**Yes.** Overhead images have no natural orientation, so rotations keep both the label and realism." },
      { type: "p", text: "The test score should estimate performance on real inputs, so test images must get only the evaluation pipeline. Report the normal test score, and if robustness to flips matters, a separate, labelled score on flipped test images." },
    ],
  },

  quiz: [
    {
      question: "Which transforms belong in the evaluation pipeline?",
      options: ["Random crops and flips", "Only the fixed steps every real input gets: resize, crop, convert, normalise", "Whatever was used in training", "None — evaluation images are used raw"],
      answer: 1,
      explanation: "Evaluation must match real use. Random changes belong only in training.",
    },
    {
      question: "In the lab, a CNN trained on centred digits gets 98.7%, but 57.0% on digits moved one pixel right. Trained with shifted copies, it gets 94.6% on those. What does this show?",
      options: [
        "The test set was too small",
        "The network learned to handle a variation it was shown in training",
        "Shifting the test set is the right way to report accuracy",
        "Pooling layers are unnecessary",
      ],
      answer: 1,
      explanation: "Augmentation taught the invariance to one-pixel shifts; the unshifted test score is still the one to report.",
    },
    {
      question: "Why is a 180° rotation a bad augmentation for digit recognition?",
      options: ["It is too slow", "It turns some digits into others (6 into 9), so the label is wrong", "Networks cannot learn rotations", "It changes the image size"],
      answer: 1,
      explanation: "A label-preserving transform must keep the meaning; a turned 6 is a 9.",
    },
    {
      question: "Shift augmentation lowered a linear model’s accuracy on unshifted digits from 95.4% to 89.8% but barely changed the CNN’s. Why the difference?",
      options: [
        "The linear model was trained for too long",
        "A linear model on raw pixels cannot represent the same stroke at several positions; a CNN’s shared filters can",
        "The CNN saw more test images",
        "Augmentation only works for CNNs by definition",
      ],
      answer: 1,
      explanation: "Invariance must be learnable. With one weight per pixel, fitting every shifted copy forces a compromise.",
    },
    {
      question: "Where should normalisation statistics for your own model come from?",
      options: ["All images, augmented", "The training split, without augmentation", "The test split", "ImageNet, always"],
      answer: 1,
      explanation: "Training data only, so no information leaks from held-out images; augmentation would change the statistics randomly.",
    },
  ],

  glossary: [
    { term: "Preprocessing", definition: "The fixed steps applied to every image: decode, resize, crop, convert, normalise." },
    { term: "Data augmentation", definition: "Random, label-preserving changes applied to training images, drawn fresh each time." },
    { term: "Label-preserving (safe)", definition: "A transform after which the image still deserves the same label." },
    { term: "Invariance", definition: "Giving the same output when the input changes in a given way, such as a small shift." },
    { term: "RandomResizedCrop", definition: "Cropping a random area and aspect ratio, then resizing to a fixed size." },
    { term: "Robustness check (stress test)", definition: "Evaluating on deliberately altered test images, reported separately from the test score." },
    { term: "Translation", definition: "Shifting an image by a number of pixels horizontally and vertically." },
  ],

  references: [
    {
      title: "A survey on Image Data Augmentation for Deep Learning",
      source: "Connor Shorten & Taghi M. Khoshgoftaar, Journal of Big Data 6, article 60, 2019",
      url: "https://doi.org/10.1186/s40537-019-0197-0",
      note: "Defines the “safety” of an augmentation as its likelihood of preserving the label, with flips and rotations unsafe for 6 versus 9.",
    },
    {
      title: "Transfer Learning for Computer Vision Tutorial",
      source: "PyTorch tutorials",
      url: "https://docs.pytorch.org/tutorials/beginner/transfer_learning_tutorial",
      note: "Separate training (random resized crop, flip) and validation (resize, centre crop) transforms with the same normalisation.",
    },
    {
      title: "Transforming images, videos, boxes and more (torchvision.transforms)",
      source: "torchvision documentation",
      url: "https://docs.pytorch.org/vision/stable/transforms.html",
      note: "The v2 transforms used in the code, including RandomAffine and Normalize.",
    },
    {
      title: "Optical Recognition of Handwritten Digits",
      source: "E. Alpaydin & C. Kaynak, UCI Machine Learning Repository, 1998, CC BY 4.0, doi:10.24432/C50P49",
      url: "https://archive.ics.uci.edu/dataset/80/optical+recognition+of+handwritten+digits",
      note: "The 8 × 8 digits used in the labs (each value counts the inked pixels in a 4 × 4 block of a 32 × 32 bitmap, 0–16).",
    },
    {
      title: "RandAugment: Practical automated data augmentation with a reduced search space",
      source: "Ekin D. Cubuk, Barret Zoph, Jonathon Shlens & Quoc V. Le, arXiv:1909.13719",
      url: "https://arxiv.org/abs/1909.13719v2",
      note: "Further reading: choosing augmentation policies automatically instead of by hand.",
    },
  ],

  next: [
    { pathSlug: "computer-vision", topicSlug: "convolution-feature-maps", reason: "How the network itself treats a pattern the same wherever it appears." },
    { pathSlug: "computer-vision", topicSlug: "pooling-cnn-architectures", reason: "Pooling gives a little shift tolerance for free — and why it is not enough." },
    { pathSlug: "ml-foundations", topicSlug: "train-validation-test", reason: "Why test data must look like real data." },
  ],

  teaching: {
    notes: [
      "Begin with the 6-and-9 example: it makes “label-preserving” concrete in one picture.",
      "Keep the two-pipeline rule on the board for the whole lesson: random in training, fixed in evaluation.",
      "Use the worked-example table to separate the reported score (first row) from the stress tests (the rest).",
    ],
    demo: "Show twelve augmented versions of one training image from a photo dataset, then the same twelve with an aggressive setting (large rotations, strong colour shifts). Ask which ones a person would still label correctly.",
    discussion: [
      "Is a vertical flip label-preserving for photos of cats? Is it useful even if it is?",
      "Why might augmentation help a small dataset more than a huge one?",
      "Shift-training helped one-pixel moves much more than two-pixel ones. What would you change to handle larger moves?",
    ],
    misconceptions: [
      "Augmenting the test set to make it “harder”.",
      "Assuming any transform that keeps the image recognisable is safe for every class.",
      "Thinking augmentation can replace collecting more varied data.",
    ],
    challenge: {
      prompt:
        "A chest X-ray classifier is trained with random horizontal flips. Give one reason this could be harmless and one reason it could hurt, and say how you would decide.",
      answer: [
        { type: "p", text: "Harmless: most findings (a shadow on a lung) mean the same on either side, so the label is preserved for many classes." },
        { type: "p", text: "Harmful: anatomy is not symmetric — the heart sits on the left, and text markers flip — so flipped images are unrealistic, and any class defined by side would get wrong labels. Decide by checking the classes with a clinician and comparing validation results with and without the flip." },
      ],
    },
  },
};
