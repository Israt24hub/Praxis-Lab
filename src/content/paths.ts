import type { LearningPath } from "../types/content";

/*
 * The curriculum: eight learning paths (A–H) and their topics.
 * A topic is a complete lesson only when it has a `lessonId`; every other
 * topic is planned and its page says so. Add lessons in src/content/lessons.
 */
export const paths: LearningPath[] = [
  {
    slug: "math-foundations",
    code: "A",
    title: "Mathematics and Foundations",
    destination:
      "Read the notation in ML code and papers, reason about shapes and uncertainty, and follow how gradients drive learning.",
    summary: "The mathematics machine learning actually uses, taught through the operations you will meet in code.",
    level: "beginner",
    prerequisitePaths: [],
    prerequisiteSkills: ["School algebra", "Basic Python is helpful but not required"],
    topics: [
      {
        slug: "linear-algebra-essentials",
        title: "Linear algebra essentials",
        summary: "Scalars, vectors and matrices, and the operations models perform on them.",
        outcomes: [
          "Add and scale vectors and compute a dot product",
          "Multiply a matrix by a vector and describe what it does geometrically",
          "Read notation such as `Wx + b` in ML papers",
        ],
        lessonId: "linear-algebra-essentials",
      },
      {
        slug: "vectors-matrices-tensors",
        title: "Vectors, matrices and tensors",
        summary: "How data is stored as arrays with shapes, and why shape errors are the most common bug in ML code.",
        outcomes: [
          "Predict array shapes such as `(batch, channels, height, width)`",
          "Explain broadcasting and when it silently does the wrong thing",
          "Reshape and index arrays in NumPy and PyTorch",
        ],
        lessonId: "vectors-matrices-tensors",
      },
      {
        slug: "probability-statistics",
        title: "Probability and statistics",
        summary: "Distributions, expectation, variance and conditional probability for reasoning about noisy data and results.",
        outcomes: [
          "Summarise data with means, variances and distributions",
          "Apply conditional probability and Bayes’ rule to small problems",
          "Explain why results vary between random seeds and how to report it",
        ],
        lessonId: "probability-statistics",
      },
      {
        slug: "derivatives-gradients",
        title: "Derivatives and gradients",
        summary: "How an output changes when its inputs change, and the chain rule that makes backpropagation possible.",
        outcomes: [
          "Compute derivatives of simple functions",
          "Describe a gradient as the direction of steepest increase",
          "Apply the chain rule to a composition of functions",
        ],
        lessonId: "derivatives-gradients",
      },
      {
        slug: "optimization-fundamentals",
        title: "Optimization fundamentals",
        summary: "Minimising a loss: gradient descent, learning rates, convexity and local minima.",
        outcomes: [
          "Run gradient descent by hand on a one-variable function",
          "Explain how the learning rate causes slow progress or divergence",
          "Distinguish convex losses from the non-convex losses of neural networks",
        ],
        lessonId: "optimization-fundamentals",
      },
    ],
    capstone: "Implement gradient descent from scratch in NumPy and use it to fit a line, checking every array shape along the way.",
    premiumExtras: ["Interactive vector and matrix playground", "Gradient field visualiser"],
  },
  {
    slug: "ml-foundations",
    code: "B",
    title: "Machine Learning",
    destination:
      "Frame a prediction problem, train and evaluate classic models with scikit-learn, and explain why a model works or fails.",
    summary: "What a model learns from data, how to measure it honestly, and how to avoid fooling yourself.",
    level: "beginner",
    prerequisitePaths: [],
    prerequisiteSkills: ["Python basics: variables, functions, lists", "School algebra (path A helps alongside)"],
    topics: [
      {
        slug: "learning-from-data",
        title: "What does learning from data mean?",
        summary: "Features, targets, predictions and errors — and what changes inside a model when it trains.",
        outcomes: [
          "Identify features, targets and predictions in a dataset",
          "Explain the difference between training and inference",
          "Train a one-feature model and judge it on held-out data",
        ],
        lessonId: "learning-from-data",
      },
      {
        slug: "features-labels-datasets",
        title: "Features, labels, datasets and predictions",
        summary: "How raw records become a table a model can learn from, and what exactly a prediction is.",
        outcomes: [
          "Turn raw records into feature columns and a target column",
          "Spot features that would not exist at prediction time",
          "Describe a dataset by its rows, columns and label distribution",
        ],
        lessonId: "features-labels-datasets",
      },
      {
        slug: "supervised-unsupervised",
        title: "Supervised and unsupervised learning",
        summary: "Learning with labels versus finding structure without them, and how to tell which a problem needs.",
        outcomes: [
          "Classify a problem as supervised, unsupervised or neither",
          "Give examples of each from real applications",
          "Explain why unsupervised results are harder to evaluate",
        ],
        lessonId: "supervised-unsupervised",
      },
      {
        slug: "regression-classification",
        title: "Regression and classification",
        summary: "Predicting a number versus predicting a category, with linear and logistic regression as first models.",
        outcomes: [
          "Choose between regression and classification for a problem",
          "Fit linear and logistic regression in scikit-learn",
          "Read predicted probabilities and choose a decision threshold",
        ],
        lessonId: "regression-classification",
      },
      {
        slug: "trees-ensembles",
        title: "Decision trees and ensemble methods",
        summary: "Trees that split data with simple questions, and forests and boosting that combine many of them.",
        outcomes: [
          "Trace how a decision tree makes a prediction",
          "Explain why random forests and gradient boosting usually beat a single tree",
          "Control tree depth to limit overfitting",
        ],
        lessonId: "trees-ensembles",
      },
      {
        slug: "clustering-dimensionality-reduction",
        title: "Clustering and dimensionality reduction",
        summary: "k-means and PCA: finding groups and structure in data without labels.",
        outcomes: [
          "Run k-means and interpret its clusters cautiously",
          "Use PCA to reduce and visualise high-dimensional data",
          "Explain why scaling features changes both methods’ results",
        ],
        lessonId: "clustering-dimensionality-reduction",
      },
      {
        slug: "train-validation-test",
        title: "Training, validation and testing",
        summary: "Why data is split three ways, and how to keep the test set untouched until the end.",
        outcomes: [
          "Explain the job of each split",
          "Choose a random, grouped or time-based split",
          "Recognise the common forms of data leakage",
        ],
        lessonId: "train-validation-test",
        seeAlso: { label: "Project Lab: splitting without leakage", href: "/project-lab/split-without-leakage" },
      },
      {
        slug: "overfitting-generalization",
        title: "Overfitting, underfitting and generalization",
        summary: "Why a model can be perfect on training data and poor on new data, and what to do about it.",
        outcomes: [
          "Diagnose under- and overfitting from training and validation scores",
          "Explain the bias–variance trade-off in plain terms",
          "Apply regularization, simpler models or more data as remedies",
        ],
        lessonId: "overfitting-generalization",
      },
      {
        slug: "metrics-cross-validation",
        title: "Evaluation metrics and cross-validation",
        summary: "Accuracy, precision, recall, F1, ROC-AUC and PR-AUC, and k-fold cross-validation.",
        outcomes: [
          "Pick a metric that matches the cost of each kind of error",
          "Explain why accuracy misleads on imbalanced data",
          "Run k-fold cross-validation without leaking preprocessing",
        ],
        lessonId: "metrics-cross-validation",
      },
    ],
    capstone:
      "Predict term-deposit sign-ups on the UCI Bank Marketing dataset, then find the feature that leaks the answer and measure how much it inflated the score.",
    premiumExtras: ["Interactive decision-boundary lab", "Graded capstone review"],
  },
  {
    slug: "deep-learning",
    code: "C",
    title: "Deep Learning",
    destination:
      "Build and train neural networks in PyTorch, read a training curve, and fix a model that refuses to learn.",
    summary: "From a single neuron to multi-layer networks, with backpropagation explained step by step.",
    level: "intermediate",
    prerequisitePaths: ["ml-foundations", "math-foundations"],
    prerequisiteSkills: ["NumPy arrays"],
    topics: [
      {
        slug: "perceptrons-neurons",
        title: "Perceptrons and single neurons",
        summary: "Weighted sums, biases and activation functions — the unit every neural network is built from.",
        outcomes: [
          "Compute a neuron’s output by hand",
          "Explain what weights, bias and activation each contribute",
          "Describe the decision boundary of a single neuron",
        ],
        lessonId: "perceptrons-neurons",
      },
      {
        slug: "layers-activations",
        title: "Neural network layers and activations",
        summary: "Stacking neurons into layers, and why non-linear activations are what make depth useful.",
        outcomes: [
          "Write a layer as a matrix multiplication plus a bias",
          "Compare ReLU, sigmoid, tanh and GELU",
          "Explain why a stack of linear layers is still linear",
        ],
        lessonId: "layers-activations",
      },
      {
        slug: "forward-propagation",
        title: "Forward propagation",
        summary: "Tracing one batch through a network, layer by layer, with every shape written down.",
        outcomes: [
          "Compute a forward pass for a small network by hand",
          "Track tensor shapes through each layer",
          "Implement the same forward pass in NumPy and PyTorch",
        ],
        lessonId: "forward-propagation",
      },
      {
        slug: "loss-functions",
        title: "Loss functions",
        summary: "Turning predictions into a single error number: mean squared error and cross-entropy.",
        outcomes: [
          "Choose a loss for regression and for classification",
          "Compute MSE and cross-entropy by hand",
          "Explain why the loss you train on is not always the metric you report",
        ],
        lessonId: "loss-functions",
      },
      {
        slug: "backpropagation",
        title: "Backpropagation",
        summary: "The chain rule applied layer by layer, done by hand once and then with autograd.",
        outcomes: [
          "Compute gradients for a two-layer network by hand",
          "Check hand-computed gradients against PyTorch autograd",
          "Explain vanishing gradients",
        ],
        lessonId: "backpropagation",
      },
      {
        slug: "gradient-descent-optimizers",
        title: "Gradient descent and optimizers",
        summary: "SGD, momentum and Adam, learning-rate schedules, and what divergence looks like.",
        outcomes: [
          "Implement mini-batch SGD",
          "Explain what momentum and Adam change",
          "Recognise a learning rate that is too high or too low from the loss curve",
        ],
        lessonId: "gradient-descent-optimizers",
      },
      {
        slug: "regularization-diagnostics",
        title: "Regularization and training diagnostics",
        summary: "Weight decay, dropout, batch normalization and early stopping, and how to debug a training run.",
        outcomes: [
          "Apply dropout, weight decay and early stopping",
          "Read training and validation curves to diagnose problems",
          "Overfit a single batch on purpose to find bugs",
        ],
        lessonId: "regularization-diagnostics",
      },
    ],
    capstone: "Train a multilayer perceptron and a small CNN on Fashion-MNIST and compare them under the same evaluation protocol.",
    premiumExtras: ["Interactive backpropagation lab", "Optimizer comparison simulator"],
  },
  {
    slug: "computer-vision",
    code: "D",
    title: "Computer Vision",
    destination:
      "Build image classifiers with CNNs and transfer learning, and check which parts of an image they actually rely on.",
    summary: "How convolutional networks turn pixels into features, and how to adapt pretrained models to small datasets.",
    level: "intermediate",
    prerequisitePaths: ["deep-learning"],
    prerequisiteSkills: ["PyTorch tensors and training loops"],
    topics: [
      {
        slug: "image-representation",
        title: "Image representation and tensors",
        summary: "Pixels, channels and resolution, and how an image becomes a tensor.",
        outcomes: [
          "Explain an image tensor’s shape and value range",
          "Convert between channel-first and channel-last layouts",
          "Normalise images with the statistics a model expects",
        ],
      },
      {
        slug: "image-preprocessing-augmentation",
        title: "Image preprocessing and augmentation",
        summary: "Resizing, normalisation and augmentation — and augmentations that accidentally change the label.",
        outcomes: [
          "Build separate training and evaluation transforms",
          "Choose augmentations that preserve the label",
          "Avoid augmenting validation and test images",
        ],
      },
      {
        slug: "convolution-feature-maps",
        title: "Convolution and feature maps",
        summary: "Kernels, stride and padding, and what feature maps at different depths respond to.",
        outcomes: [
          "Compute a convolution by hand on a small grid",
          "Predict output size from kernel, stride and padding",
          "Explain why convolution shares weights across positions",
        ],
      },
      {
        slug: "pooling-cnn-architectures",
        title: "Pooling and CNN architectures",
        summary: "Pooling, receptive fields, and the ideas behind LeNet, VGG and ResNet.",
        outcomes: [
          "Explain what pooling does to resolution and invariance",
          "Describe how receptive fields grow with depth",
          "Explain the residual connection in ResNet",
        ],
      },
      {
        slug: "classification-transfer-learning",
        title: "Image classification and transfer learning",
        summary: "Training a classifier and adapting a pretrained backbone when you have little data.",
        outcomes: [
          "Fine-tune a pretrained CNN on a small dataset",
          "Decide which layers to freeze",
          "Compare against a training-from-scratch baseline",
        ],
      },
      {
        slug: "detection-segmentation",
        title: "Detection and segmentation",
        summary: "Finding where objects are, not just what they are: boxes, masks and how they are evaluated.",
        outcomes: [
          "Distinguish classification, detection and segmentation",
          "Explain intersection over union (IoU)",
          "Read mean average precision (mAP) results",
        ],
      },
      {
        slug: "vision-evaluation-interpretation",
        title: "Model evaluation and interpretation",
        summary: "Confusion matrices, per-class errors, and saliency methods such as Grad-CAM — with their limits.",
        outcomes: [
          "Find the classes and images a model gets wrong",
          "Produce and interpret a Grad-CAM heatmap",
          "Explain why saliency maps are not proof of reasoning",
        ],
      },
    ],
    capstone:
      "Fine-tune a pretrained ResNet on a small image dataset, with a split that keeps images of the same object out of both train and test.",
    premiumExtras: ["Feature-map explorer", "Grad-CAM lab"],
  },
  {
    slug: "nlp-language-models",
    code: "E",
    title: "Natural Language Processing",
    destination:
      "Turn text into model inputs, train text classifiers, and explain how sequence models led to the transformer.",
    summary: "Tokenization, embeddings and attention, built up from strong simple baselines — including for low-resource languages.",
    level: "intermediate",
    prerequisitePaths: ["deep-learning"],
    prerequisiteSkills: ["PyTorch tensors and training loops"],
    topics: [
      {
        slug: "text-preprocessing",
        title: "Text preprocessing",
        summary: "Normalisation, cleaning and the decisions that quietly change meaning, such as removing negations.",
        outcomes: [
          "Clean text without destroying meaningful signals",
          "Handle Unicode, mixed scripts and code-switching",
          "Match preprocessing to the model you will use",
        ],
      },
      {
        slug: "tokenization",
        title: "Tokenization",
        summary: "Words, characters and subwords: how BPE and WordPiece build a vocabulary.",
        outcomes: [
          "Compare word, character and subword tokenization",
          "Explain how byte-pair encoding merges frequent pairs",
          "Measure how many tokens a language needs for the same sentence",
        ],
      },
      {
        slug: "vocabulary-token-ids",
        title: "Vocabulary and token IDs",
        summary: "Mapping tokens to integers, special tokens, padding and unknown words.",
        outcomes: [
          "Build a vocabulary from training text only",
          "Explain padding, truncation and attention masks",
          "Handle out-of-vocabulary words",
        ],
      },
      {
        slug: "word-sentence-representations",
        title: "Word and sentence representations",
        summary: "Bag-of-words and TF-IDF baselines, and why you should always try them first.",
        outcomes: [
          "Build TF-IDF features inside a pipeline",
          "Train a linear text classifier as a baseline",
          "Explain what these representations cannot capture",
        ],
      },
      {
        slug: "embeddings",
        title: "Embeddings",
        summary: "Dense vectors for tokens and sentences, and what similarity between them does and does not mean.",
        outcomes: [
          "Explain an embedding layer as a lookup table",
          "Compute cosine similarity between vectors",
          "Recognise biases that embeddings inherit from their training text",
        ],
      },
      {
        slug: "sequence-models-attention",
        title: "Sequence models and attention",
        summary: "RNNs and LSTMs, the long-range dependency problem, and the attention mechanism that addressed it.",
        outcomes: [
          "Describe how an RNN processes a sequence",
          "Explain why long sequences were hard for RNNs",
          "Compute a simple attention weighting by hand",
        ],
      },
      {
        slug: "nlp-evaluation-applications",
        title: "NLP evaluation and practical applications",
        summary: "Metrics for classification and generation, and building NLP systems that work beyond English.",
        outcomes: [
          "Choose metrics for classification, tagging and generation tasks",
          "Evaluate on data that matches real use, including dialects",
          "Report results per class and per language",
        ],
      },
    ],
    capstone:
      "Build a sentiment classifier twice — a TF-IDF baseline and a fine-tuned transformer encoder — and report where each one fails.",
    premiumExtras: ["Tokenizer inspector", "Attention viewer"],
  },
  {
    slug: "llms-generative-ai",
    code: "F",
    title: "Transformers and LLMs",
    destination:
      "Explain how transformers and large language models work, adapt them to tasks, and evaluate their output critically.",
    summary: "From self-attention to retrieval-augmented generation, with evaluation and responsible use built in.",
    level: "advanced",
    prerequisitePaths: ["nlp-language-models"],
    prerequisiteSkills: ["Comfort reading research papers"],
    topics: [
      {
        slug: "transformer-architecture",
        title: "Transformer architecture",
        summary: "The blocks of a transformer: attention, feed-forward layers, residual connections and normalisation.",
        outcomes: [
          "Draw a transformer block and label each part",
          "Track tensor shapes through a block",
          "Explain why transformers parallelise better than RNNs",
        ],
      },
      {
        slug: "self-attention-positional",
        title: "Self-attention and positional information",
        summary: "Queries, keys and values, multiple heads, and how models know the order of tokens.",
        outcomes: [
          "Compute scaled dot-product attention for a few tokens",
          "Explain what multiple heads add",
          "Compare absolute and relative positional encodings",
        ],
      },
      {
        slug: "encoder-decoder",
        title: "Encoder and decoder concepts",
        summary: "Encoder-only, decoder-only and encoder–decoder models, and which tasks suit each.",
        outcomes: [
          "Distinguish BERT-style, GPT-style and T5-style models",
          "Explain causal masking",
          "Match a model family to a task",
        ],
      },
      {
        slug: "next-token-prediction",
        title: "Next-token prediction",
        summary: "The training objective of language models, and how sampling turns probabilities into text.",
        outcomes: [
          "Explain the next-token objective",
          "Compare greedy decoding, temperature, top-k and top-p",
          "Explain why fluent output is not evidence of correctness",
        ],
      },
      {
        slug: "pretraining-instruction-tuning",
        title: "Pretraining and instruction tuning",
        summary: "Where pretraining data comes from, and how instruction tuning and preference training change behaviour.",
        outcomes: [
          "Describe the stages from pretraining to an assistant model",
          "Explain what instruction data looks like",
          "Discuss data quality, licensing and contamination concerns",
        ],
      },
      {
        slug: "fine-tuning-peft",
        title: "Fine-tuning and parameter-efficient methods",
        summary: "Full fine-tuning versus LoRA and adapters, and fitting training into limited GPU memory.",
        outcomes: [
          "Compare full fine-tuning with LoRA",
          "Estimate trainable parameter counts",
          "Fine-tune a small model with LoRA on modest hardware",
        ],
      },
      {
        slug: "retrieval-augmented-generation",
        title: "Retrieval-augmented generation",
        summary: "Chunking, embedding search and grounding answers in retrieved sources.",
        outcomes: [
          "Build a small retrieval pipeline over your own documents",
          "Explain how chunk size and retrieval quality affect answers",
          "Measure whether answers are supported by the retrieved text",
        ],
      },
      {
        slug: "llm-evaluation-responsible-use",
        title: "LLM evaluation, limitations and responsible use",
        summary: "Benchmarks and their contamination, human evaluation, hallucination, bias and safe deployment.",
        outcomes: [
          "Design an evaluation that matches a real use case",
          "Explain benchmark contamination",
          "Identify risks before deploying a generative system",
        ],
      },
    ],
    capstone:
      "Build a small retrieval-augmented question-answering system over your own course notes and measure how often its answers are supported by the retrieved text.",
    premiumExtras: ["Sampling playground", "RAG evaluation workbench", "Fine-tuning simulator"],
  },
  {
    slug: "ai-engineering",
    code: "G",
    title: "Practical AI Engineering",
    destination:
      "Run a machine learning project end to end — data, baselines, training, evaluation and deployment — in a way someone else can reproduce.",
    summary: "The engineering habits that make results trustworthy, built around the Project Lab workflow.",
    level: "intermediate",
    prerequisitePaths: ["ml-foundations"],
    prerequisiteSkills: ["Comfort with pandas and scikit-learn"],
    topics: [
      {
        slug: "dataset-selection-inspection",
        title: "Dataset selection and inspection",
        summary: "Choosing a dataset, reading its documentation and licence, and inspecting it before modelling.",
        outcomes: [
          "Write a datasheet for a dataset you use",
          "Find duplicates, label noise and missing groups",
          "Decide whether a dataset can answer your question",
        ],
        seeAlso: { label: "Project Lab: find a dataset", href: "/project-lab/find-a-dataset" },
      },
      {
        slug: "preprocessing-leakage",
        title: "Data preprocessing and leakage prevention",
        summary: "Preprocessing for tabular, text and image data, fitted on training data only.",
        outcomes: [
          "Build preprocessing pipelines for different data types",
          "Identify target, preprocessing, group and temporal leakage",
          "Structure code so leakage is hard to introduce",
        ],
        seeAlso: { label: "Project Lab: splitting without leakage", href: "/project-lab/split-without-leakage" },
      },
      {
        slug: "baselines-experiment-design",
        title: "Baselines and experiment design",
        summary: "Trivial and simple baselines, and planning experiments before running them.",
        outcomes: [
          "Score a trivial and a simple baseline first",
          "Write down the comparisons an experiment must make",
          "Fix the evaluation protocol before seeing results",
        ],
      },
      {
        slug: "training-pipelines",
        title: "Training pipelines",
        summary: "Configs, seeds, checkpoints and logging: training code you can rerun next month.",
        outcomes: [
          "Separate configuration from code",
          "Make runs reproducible with seeds and versions",
          "Log metrics, configs and artefacts for every run",
        ],
      },
      {
        slug: "hyperparameter-tuning",
        title: "Hyperparameter tuning",
        summary: "Search spaces, grid and random search, and tuning without touching the test set.",
        outcomes: [
          "Define a sensible search space",
          "Run random search with cross-validation",
          "Report how much tuning each method received",
        ],
      },
      {
        slug: "evaluation-error-analysis",
        title: "Evaluation and error analysis",
        summary: "Final test evaluation, confidence intervals, and looking hard at what the model gets wrong.",
        outcomes: [
          "Evaluate once on held-out data with suitable metrics",
          "Report variation across seeds",
          "Group errors into categories that suggest fixes",
        ],
      },
      {
        slug: "deployment-monitoring",
        title: "Deployment and monitoring",
        summary: "Serving a model, and watching for drift and failures once real data arrives.",
        outcomes: [
          "Package a model with its preprocessing",
          "Monitor inputs and predictions for drift",
          "Plan for retraining and rollback",
        ],
      },
    ],
    capstone:
      "Take one dataset through the full Project Lab workflow and publish a repository whose README reproduces every reported number.",
    premiumExtras: ["Run-comparison dashboard", "Graded project review"],
  },
  {
    slug: "research-paper-writing",
    code: "H",
    title: "AI Research and Paper Writing",
    destination:
      "Turn a project into a research question, design fair experiments, and write a paper that reports exactly what you did.",
    summary: "Finding a gap, testing a claim properly, and writing it up so others can check it.",
    level: "intermediate",
    prerequisitePaths: ["ml-foundations"],
    prerequisiteSkills: ["At least one completed ML project"],
    topics: [
      {
        slug: "research-questions-gaps",
        title: "Research questions and research gaps",
        summary: "Reading around a problem until you can say what is unknown and why it matters.",
        outcomes: [
          "State a gap backed by specific papers",
          "Turn a gap into an answerable question",
          "Write a one-sentence contribution statement",
        ],
      },
      {
        slug: "literature-reviews",
        title: "Literature reviews",
        summary: "Searching, reading in passes, and keeping a literature matrix you can write from.",
        outcomes: [
          "Search systematically and record what you searched",
          "Read a paper in multiple passes",
          "Organise related work by theme rather than paper by paper",
        ],
      },
      {
        slug: "experimental-design",
        title: "Experimental design",
        summary: "Controls, variables and deciding the evaluation before seeing any results.",
        outcomes: [
          "Identify what is varied and what is held fixed",
          "Plan the tables and figures before running experiments",
          "Pre-commit to metrics and splits",
        ],
      },
      {
        slug: "baselines-comparisons",
        title: "Baselines and comparisons",
        summary: "Choosing strong baselines and comparing fairly under the same budget.",
        outcomes: [
          "Include the strongest reasonable baseline",
          "Give every method the same tuning effort",
          "Check whether differences exceed run-to-run variation",
        ],
      },
      {
        slug: "ablation-studies",
        title: "Ablation studies",
        summary: "Removing one component at a time to learn which parts of a method matter.",
        outcomes: [
          "Design an ablation table",
          "Interpret ablations without over-claiming",
          "Report ablations that hurt your story too",
        ],
      },
      {
        slug: "reproducibility-tracking",
        title: "Reproducibility and result tracking",
        summary: "Seeds, versions, configs and logs, so every number in a paper traces back to a run.",
        outcomes: [
          "Track every run with its configuration",
          "Package code and data access instructions",
          "Complete a reproducibility checklist",
        ],
        seeAlso: { label: "Research & Papers: reproducibility checklist", href: "/research#reproducibility" },
      },
      {
        slug: "paper-structure",
        title: "Academic paper structure",
        summary: "What each section of an ML paper is for, and how structure varies by venue.",
        outcomes: [
          "Explain the purpose of each standard section",
          "Adapt structure to a venue’s template",
          "Outline a paper from your experiment log",
        ],
        seeAlso: { label: "Research & Papers: sample outline", href: "/research#outline" },
      },
      {
        slug: "writing-methodology-results",
        title: "Writing methodology and results",
        summary: "Describing what you did precisely, and reporting results before interpreting them.",
        outcomes: [
          "Write a methodology someone could reimplement",
          "Report results with variation and without spin",
          "Separate findings from interpretation",
        ],
      },
      {
        slug: "references-figures-tables",
        title: "References, figures and tables",
        summary: "Verifying every citation, and making figures and tables that can be read on their own.",
        outcomes: [
          "Check each reference against its source",
          "Generate figures from logged results with code",
          "Write captions that stand alone",
        ],
      },
      {
        slug: "limitations-ethics",
        title: "Limitations and ethical reporting",
        summary: "Stating where conclusions stop applying, and the ethical duties of reporting research.",
        outcomes: [
          "Write specific, honest limitations",
          "Distinguish a finding from a hypothesis",
          "Identify ethical issues in data and deployment",
        ],
        seeAlso: { label: "Research & Papers: findings, hypotheses and limitations", href: "/research#claims" },
      },
    ],
    capstone: "Write a workshop-style paper from your Project Lab work, with a completed reproducibility checklist.",
    premiumExtras: ["Interactive paper checklist", "Section-by-section writing templates"],
  },
];
