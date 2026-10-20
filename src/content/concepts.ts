import type { Concept } from "../types/content";

/*
 * "Learn by visualizing" concepts. Diagrams for these are explanatory
 * illustrations with example values — they do not run a model.
 */
export const concepts: Concept[] = [
  {
    id: "data-to-prediction",
    title: "Data to prediction",
    question: "How does raw data become a prediction?",
    explanation: [
      "A model never sees “a customer” or “a photo”. It sees a vector of numbers — features — computed from the raw data by a preprocessing step.",
      "Training finds parameters that map those numbers to an output. At prediction time, new data must go through exactly the same preprocessing, or the model receives inputs unlike anything it was trained on.",
    ],
    caveat: "Feature values shown are examples, not taken from a trained model.",
    pathSlug: "ml-foundations",
  },
  {
    id: "learning-weights",
    title: "Learning weights",
    question: "How does a neural network learn by adjusting weights?",
    explanation: [
      "A loss function scores how wrong a prediction is. Backpropagation uses the chain rule to compute each weight’s gradient: how the loss would change if that weight changed slightly.",
      "The optimizer moves every weight a small step against its gradient, scaled by the learning rate η. Repeated over many batches, the loss usually falls — too large a step makes it bounce or diverge instead.",
    ],
    caveat: "The curve is a single weight on a simple bowl-shaped loss; real losses have millions of dimensions.",
    pathSlug: "deep-learning",
  },
  {
    id: "image-features",
    title: "Image features",
    question: "How do image models extract features?",
    explanation: [
      "A convolutional layer slides small grids of weights — kernels — across the image. Each kernel responds strongly where the image matches its pattern, producing a feature map.",
      "Early layers tend to respond to edges and textures. Later layers combine earlier feature maps into larger, more specific patterns. The kernels are learned during training, not designed by hand.",
    ],
    caveat: "The kernel shown is a hand-picked vertical-edge detector, used because it is easy to read.",
    pathSlug: "computer-vision",
  },
  {
    id: "tokens-embeddings",
    title: "Tokens and embeddings",
    question: "How does text become tokens and embeddings?",
    explanation: [
      "A tokenizer splits text into pieces from a fixed vocabulary — often subwords, so rare words become several common pieces — and maps each piece to an integer ID.",
      "An embedding layer looks up a learned vector for each ID. Tokens used in similar contexts tend to end up with similar vectors, which helps the model generalise.",
    ],
    caveat: "The split, IDs and vectors are illustrative; every tokenizer and model produces different ones.",
    pathSlug: "nlp-language-models",
  },
  {
    id: "attention",
    title: "Attention",
    question: "How does attention help a transformer use context?",
    explanation: [
      "In self-attention, each token forms a query and compares it with every token’s key. A softmax turns those scores into weights that sum to 1.",
      "The token’s new representation is a weighted mix of all tokens’ values. So the representation of “it” can draw mostly on “animal” when that is what “it” refers to.",
    ],
    caveat: "Weights are illustrative. Real models use many heads and layers, and one head rarely tells the whole story.",
    pathSlug: "nlp-language-models",
  },
  {
    id: "fine-tuning",
    title: "Fine-tuning",
    question: "How does fine-tuning adapt a pretrained model?",
    explanation: [
      "A pretrained model has already learned general patterns from a large dataset. Fine-tuning continues training on a smaller, task-specific dataset.",
      "You can update every weight, train only a new output head, or add small trainable modules such as LoRA adapters while the original weights stay frozen. Fewer trainable weights means less memory and less risk of overwriting what the model already knew.",
    ],
    caveat: "Layer counts are schematic; the right strategy depends on data size and compute.",
    pathSlug: "training-fine-tuning",
  },
];
