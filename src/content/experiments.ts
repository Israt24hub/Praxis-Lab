import type { Experiment } from "../types/content";

/*
 * AI Playground registry. Each experiment declares its renderer so that
 * 3D experiences can later be lazy-loaded per experiment (see DECISIONS.md).
 * Only "live" experiments have an implementation in Phase 1.
 */
export const experiments: Experiment[] = [
  {
    id: "single-neuron",
    title: "A single neuron",
    summary:
      "Set two inputs, two weights and a bias, pick an activation, and watch the output change. The arithmetic runs in your browser.",
    interactions: ["Inputs and weights", "Bias", "Sigmoid, ReLU or tanh"],
    renderer: "2d",
    access: "free",
    status: "live",
    pathSlug: "deep-learning",
    component: "neuron-lab",
    lesson: { pathSlug: "deep-learning", topicSlug: "perceptrons-neurons" },
  },
  {
    id: "learning-from-data",
    title: "Train a line with gradient descent",
    summary:
      "Fit a line to fifteen students’ study hours and exam scores — by hand, then with real gradient descent — and watch training and test error change as you adjust the learning rate.",
    interactions: ["Fit by hand", "Learning rate", "Feature scaling", "Step, run, pause and reset"],
    renderer: "2d",
    access: "free",
    status: "live",
    pathSlug: "ml-foundations",
    component: "learning-from-data-lab",
    lesson: { pathSlug: "ml-foundations", topicSlug: "learning-from-data" },
  },
  {
    id: "dataset-builder",
    title: "Build a dataset from raw records",
    summary:
      "Give each column of a student record a role — feature, target or not used — and see the encoded feature matrix, and whether a prediction for a new student is even possible.",
    interactions: ["Column roles", "One-hot encoding options", "New-student row"],
    renderer: "2d",
    access: "free",
    status: "live",
    pathSlug: "ml-foundations",
    component: "dataset-builder-lab",
    lesson: { pathSlug: "ml-foundations", topicSlug: "features-labels-datasets" },
  },
  {
    id: "pass-fail",
    title: "Logistic regression versus a straight line",
    summary:
      "Fit both models to pass/fail data, move the decision threshold, and add one unusual student to see which model it disturbs.",
    interactions: ["Decision threshold", "Show or hide each model", "Add an extreme student", "Query any number of hours"],
    renderer: "2d",
    access: "free",
    status: "live",
    pathSlug: "ml-foundations",
    component: "pass-fail-lab",
    lesson: { pathSlug: "ml-foundations", topicSlug: "regression-classification" },
  },
  {
    id: "overfitting",
    title: "Overfitting explorer",
    summary:
      "Fit polynomials of degree 0 to 11 to noisy data and watch training and validation error part ways. Then tame the wild fits with a penalty or more data.",
    interactions: ["Polynomial degree", "Penalty strength λ", "12 or 48 training points", "Show the true curve"],
    renderer: "2d",
    access: "free",
    status: "live",
    pathSlug: "ml-foundations",
    component: "overfitting-lab",
    lesson: { pathSlug: "ml-foundations", topicSlug: "overfitting-generalization" },
  },
  {
    id: "threshold",
    title: "Thresholds and metrics",
    summary:
      "Slide a decision threshold over a simulated screening model where only 10% of cases are positive, and watch the confusion matrix, precision, recall, F1 and both curves respond.",
    interactions: ["Decision threshold", "Presets for accuracy, F1 and recall", "ROC and precision–recall curves"],
    renderer: "2d",
    access: "free",
    status: "live",
    pathSlug: "ml-foundations",
    component: "threshold-lab",
    lesson: { pathSlug: "ml-foundations", topicSlug: "metrics-cross-validation" },
  },
  {
    id: "decision-boundary",
    title: "Decision boundaries",
    summary:
      "Place points of two classes and train a logistic regression or small network in the browser to see how the boundary forms.",
    interactions: ["Add and move points", "Model capacity", "Training steps"],
    renderer: "2d",
    access: "free",
    status: "planned",
    pathSlug: "ml-foundations",
  },
  {
    id: "gradient-descent",
    title: "Gradient descent",
    summary:
      "Roll a parameter downhill on a loss surface and find the learning rates that converge, crawl or diverge.",
    interactions: ["Learning rate", "Starting point", "Momentum"],
    renderer: "2d",
    access: "free",
    status: "planned",
    pathSlug: "deep-learning",
  },
  {
    id: "forward-backward",
    title: "Forward and backward pass",
    summary:
      "Step through a small network with real numbers: weighted sums forward, gradients backward, one weight update.",
    interactions: ["Step through layers", "Edit any weight", "Inspect gradients"],
    renderer: "2d",
    access: "premium",
    status: "planned",
    pathSlug: "deep-learning",
  },
  {
    id: "convolution",
    title: "Convolution explorer",
    summary: "Draw a kernel, slide it over an image and see the feature map it produces.",
    interactions: ["Edit kernel values", "Stride and padding", "Choose an image"],
    renderer: "2d",
    access: "free",
    status: "planned",
    pathSlug: "computer-vision",
  },
  {
    id: "tokenizer",
    title: "Tokenizer inspector",
    summary: "Type text and compare how different tokenizers split it, including for Bangla and mixed-script text.",
    interactions: ["Your own text", "Compare tokenizers", "Token counts"],
    renderer: "2d",
    access: "free",
    status: "planned",
    pathSlug: "nlp-language-models",
  },
  {
    id: "attention-viewer",
    title: "Attention viewer",
    summary: "Inspect attention weights from a small pretrained model head by head, layer by layer.",
    interactions: ["Select a token", "Switch heads and layers"],
    renderer: "2d",
    access: "premium",
    status: "planned",
    pathSlug: "nlp-language-models",
  },
  {
    id: "architecture-3d",
    title: "3D architecture explorer",
    summary:
      "Rotate, zoom and select the layers of real architectures — an MLP, a CNN, a transformer block — and inspect tensor shapes as data flows through.",
    interactions: ["Rotate and zoom", "Select a layer", "Change parameters"],
    renderer: "3d",
    access: "premium",
    status: "planned",
    pathSlug: "deep-learning",
  },
  {
    id: "fine-tuning-sim",
    title: "Fine-tuning simulator",
    summary:
      "Compare frozen, partially unfrozen and LoRA fine-tuning on the same small task and see trainable parameters and validation curves side by side.",
    interactions: ["Choose strategy", "Learning rate", "Dataset size"],
    renderer: "2d",
    access: "premium",
    status: "planned",
    pathSlug: "llms-generative-ai",
  },
];
