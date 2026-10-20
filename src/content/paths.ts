import type { LearningPath } from "../types/content";

/*
 * Learning paths. Syllabi are published; lessons are not written yet,
 * so every path is "outline". Core modules are free; premium items are
 * planned interactive extras on top of the free core.
 */
export const paths: LearningPath[] = [
  {
    slug: "ml-foundations",
    title: "Machine Learning Foundations",
    destination:
      "Frame a prediction problem, train and evaluate classic models with scikit-learn, and explain why a model works or fails.",
    summary:
      "The base everything else builds on: what a model learns from data, how to measure it honestly, and how to avoid fooling yourself.",
    level: "beginner",
    prerequisitePaths: [],
    prerequisiteSkills: ["Python basics: variables, functions, lists", "School algebra"],
    modules: [
      {
        title: "What learning from data means",
        summary: "Supervised and unsupervised learning, features and labels, and what a model actually stores.",
        access: "free",
      },
      {
        title: "Linear and logistic regression",
        summary: "Loss functions, gradient descent, and reading coefficients without over-interpreting them.",
        access: "free",
      },
      {
        title: "Train, validation and test sets",
        summary: "Overfitting, cross-validation, and the common ways information leaks into evaluation.",
        access: "free",
      },
      {
        title: "Trees and ensembles",
        summary: "Decision trees, random forests and gradient boosting, and when they beat linear models.",
        access: "free",
      },
      {
        title: "Choosing evaluation metrics",
        summary: "Accuracy, precision, recall, F1, ROC-AUC and PR-AUC, and which to trust when classes are imbalanced.",
        access: "free",
      },
      {
        title: "Preprocessing and pipelines",
        summary: "Missing values, encoding, scaling, and scikit-learn pipelines that fit on training data only.",
        access: "free",
      },
    ],
    capstone:
      "Predict term-deposit sign-ups on the UCI Bank Marketing dataset, then find the feature that leaks the answer and measure how much it inflated the score.",
    premiumExtras: ["Interactive decision-boundary lab", "Graded capstone review"],
    status: "outline",
  },
  {
    slug: "deep-learning",
    title: "Deep Learning",
    destination:
      "Build and train neural networks in PyTorch, read a training curve, and fix a model that refuses to learn.",
    summary:
      "From a single neuron to multi-layer networks, with backpropagation explained step by step rather than taken on faith.",
    level: "intermediate",
    prerequisitePaths: ["ml-foundations"],
    prerequisiteSkills: ["NumPy arrays", "Derivatives and the chain rule"],
    modules: [
      {
        title: "Neurons, layers and activations",
        summary: "Weighted sums, biases, ReLU and sigmoid, and why stacking linear layers alone is not enough.",
        access: "free",
      },
      {
        title: "The forward pass and the loss",
        summary: "Tracing one batch through a network and turning its predictions into a single error number.",
        access: "free",
      },
      {
        title: "Backpropagation",
        summary: "The chain rule applied layer by layer, computed by hand once and then with autograd.",
        access: "free",
      },
      {
        title: "Optimizers and learning rates",
        summary: "SGD, momentum and Adam, learning-rate schedules, and what divergence looks like.",
        access: "free",
      },
      {
        title: "Regularization",
        summary: "Weight decay, dropout, batch normalization and early stopping.",
        access: "free",
      },
      {
        title: "Debugging training",
        summary: "Loss curves, overfitting a single batch on purpose, and a checklist for silent bugs.",
        access: "free",
      },
    ],
    capstone:
      "Train a multilayer perceptron and a small CNN on Fashion-MNIST and compare them under the same evaluation protocol.",
    premiumExtras: ["Interactive backpropagation lab", "Optimizer comparison simulator"],
    status: "outline",
  },
  {
    slug: "computer-vision",
    title: "Computer Vision",
    destination:
      "Build image classifiers with CNNs and transfer learning, and check which parts of an image they actually rely on.",
    summary:
      "How convolutional networks turn pixels into features, and how to adapt pretrained vision models to small datasets.",
    level: "intermediate",
    prerequisitePaths: ["deep-learning"],
    prerequisiteSkills: ["PyTorch tensors and training loops"],
    modules: [
      {
        title: "Images as tensors",
        summary: "Channels, resolution, normalization, and loading image datasets efficiently.",
        access: "free",
      },
      {
        title: "Convolutions and feature maps",
        summary: "Kernels, stride, padding and pooling, and what early versus late layers respond to.",
        access: "free",
      },
      {
        title: "CNN architectures",
        summary: "From LeNet to ResNet: the design ideas that made deeper networks trainable.",
        access: "free",
      },
      {
        title: "Data augmentation",
        summary: "Flips, crops and colour jitter, and augmentations that accidentally change the label.",
        access: "free",
      },
      {
        title: "Transfer learning",
        summary: "Freezing and unfreezing pretrained backbones for small datasets.",
        access: "free",
      },
      {
        title: "Interpreting vision models",
        summary: "Saliency maps and Grad-CAM, and their limits as explanations.",
        access: "premium",
      },
    ],
    capstone:
      "Fine-tune a pretrained ResNet on a small image dataset, with a split that keeps images of the same object out of both train and test.",
    premiumExtras: ["Feature-map explorer", "Grad-CAM lab"],
    status: "outline",
  },
  {
    slug: "nlp-language-models",
    title: "NLP and Language Models",
    destination:
      "Turn text into model inputs, train text classifiers, and explain how sequence models led to the transformer.",
    summary:
      "Tokenization, embeddings and attention, built up from strong simple baselines rather than skipped past.",
    level: "intermediate",
    prerequisitePaths: ["deep-learning"],
    prerequisiteSkills: ["PyTorch tensors and training loops"],
    modules: [
      {
        title: "Text preprocessing and tokenization",
        summary: "Words, characters and subwords; how BPE and WordPiece build a vocabulary.",
        access: "free",
      },
      {
        title: "Bag-of-words and TF-IDF baselines",
        summary: "Linear models on sparse features, and why you should always try them first.",
        access: "free",
      },
      {
        title: "Word embeddings",
        summary: "Dense vectors, what similarity between them does and does not mean.",
        access: "free",
      },
      {
        title: "Sequence models",
        summary: "RNNs and LSTMs, and the long-range dependency problem that motivated attention.",
        access: "free",
      },
      {
        title: "Attention and the transformer",
        summary: "Queries, keys, values, multi-head attention and positional information.",
        access: "free",
      },
      {
        title: "Fine-tuning pretrained encoders",
        summary: "BERT-style models for classification, including languages with little labelled data.",
        access: "premium",
      },
    ],
    capstone:
      "Build a sentiment classifier twice — a TF-IDF baseline and a fine-tuned transformer encoder — and report where each one fails.",
    premiumExtras: ["Tokenizer inspector", "Attention viewer"],
    status: "outline",
  },
  {
    slug: "llms-generative-ai",
    title: "LLMs and Generative AI",
    destination:
      "Explain how large language models generate text, use them through prompting and retrieval, and evaluate their output critically.",
    summary:
      "What happens between a prompt and a response, and how to measure whether a generative system is actually right.",
    level: "advanced",
    prerequisitePaths: ["nlp-language-models"],
    prerequisiteSkills: ["Comfort reading research papers"],
    modules: [
      {
        title: "Next-token prediction",
        summary: "Decoder-only transformers, causal masking and the training objective.",
        access: "free",
      },
      {
        title: "Pretraining data and scale",
        summary: "Where training text comes from, and what scaling does and does not buy.",
        access: "free",
      },
      {
        title: "Decoding and sampling",
        summary: "Greedy decoding, temperature, top-k and top-p, and how they change outputs.",
        access: "free",
      },
      {
        title: "Prompting and in-context learning",
        summary: "Instructions, examples and structured output, with their failure modes.",
        access: "free",
      },
      {
        title: "Retrieval-augmented generation",
        summary: "Chunking, embedding search and grounding answers in sources.",
        access: "premium",
      },
      {
        title: "Evaluating generative models",
        summary: "Reference-based metrics, human evaluation, and measuring unsupported claims.",
        access: "premium",
      },
      {
        title: "Image generation",
        summary: "An overview of diffusion models and how text conditions an image.",
        access: "free",
      },
    ],
    capstone:
      "Build a small retrieval-augmented question-answering system over your own course notes and measure how often its answers are supported by the retrieved text.",
    premiumExtras: ["Sampling playground", "RAG evaluation workbench"],
    status: "outline",
  },
  {
    slug: "training-fine-tuning",
    title: "Model Training and Fine-Tuning",
    destination:
      "Adapt pretrained models with full or parameter-efficient fine-tuning, on modest hardware, in experiments someone else can reproduce.",
    summary:
      "The practical engineering of training: tuning without touching the test set, fitting into limited GPU memory, and tracking every run.",
    level: "advanced",
    prerequisitePaths: ["deep-learning"],
    prerequisiteSkills: ["Recommended: the Computer Vision or NLP path"],
    modules: [
      {
        title: "Training loops at scale",
        summary: "Mixed precision, gradient accumulation and checkpointing on a single GPU.",
        access: "free",
      },
      {
        title: "Hyperparameter search",
        summary: "Search spaces, validation protocols, and why the test set stays locked.",
        access: "free",
      },
      {
        title: "Full fine-tuning versus feature extraction",
        summary: "What changes in the network under each approach, and the cost of each.",
        access: "free",
      },
      {
        title: "Parameter-efficient fine-tuning",
        summary: "LoRA and adapters: training a small number of added weights instead of all of them.",
        access: "premium",
      },
      {
        title: "Instruction tuning basics",
        summary: "Formatting data for instruction following, and the risks of low-quality examples.",
        access: "premium",
      },
      {
        title: "Experiment tracking and reproducibility",
        summary: "Seeds, configs, environment versions, and logging every run including failed ones.",
        access: "free",
      },
    ],
    capstone:
      "Fine-tune a small pretrained language model with LoRA and compare it with a frozen-encoder baseline across several random seeds.",
    premiumExtras: ["Fine-tuning simulator", "Run-comparison dashboard"],
    status: "outline",
  },
  {
    slug: "research-paper-writing",
    title: "AI Research and Paper Writing",
    destination:
      "Turn a project into a research question, design fair experiments, and write a paper that reports exactly what you did.",
    summary:
      "The research side of ML: finding a gap, testing a claim properly, and writing it up so others can check it.",
    level: "intermediate",
    prerequisitePaths: ["ml-foundations"],
    prerequisiteSkills: ["At least one completed ML project"],
    modules: [
      {
        title: "Finding a research gap",
        summary: "Reading around a problem until you can state what is unknown and why it matters.",
        access: "free",
      },
      {
        title: "Reading papers efficiently",
        summary: "Multiple passes, tracking claims and evidence, and keeping a literature matrix.",
        access: "free",
      },
      {
        title: "Experimental design",
        summary: "Baselines, controls, ablations, and deciding the evaluation before seeing results.",
        access: "free",
      },
      {
        title: "Variance and statistical care",
        summary: "Multiple seeds, confidence intervals, and differences too small to claim.",
        access: "free",
      },
      {
        title: "Writing each section",
        summary: "What each part of a paper is for, and an order of writing that keeps claims honest.",
        access: "free",
      },
      {
        title: "Reproducibility packages",
        summary: "Code, configs, data access notes and a README someone else can follow.",
        access: "premium",
      },
    ],
    capstone:
      "Write a workshop-style paper from your Project Lab work, with a completed reproducibility checklist.",
    premiumExtras: ["Interactive paper checklist", "Section-by-section writing templates"],
    status: "outline",
  },
];
