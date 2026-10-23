import type { Lesson } from "../../types/content";

/*
 * Every number below was computed with NumPy and is checked against the lab's own
 * arithmetic (src/lib/linalg.ts) in tests/lab-math.test.ts.
 */
export const linearAlgebraEssentials: Lesson = {
  id: "linear-algebra-essentials",
  pathSlug: "math-foundations",
  topicSlug: "linear-algebra-essentials",
  title: "Linear algebra essentials",
  summary:
    "Vectors are lists of numbers, matrices are tables of them, and almost everything a neural network does is multiplying one by the other. This lesson builds the three operations you will meet everywhere — adding, the dot product and matrix–vector multiplication — and shows what each one does to the plane.",
  level: "beginner",
  minutes: [40, 55],
  objectives: [
    "Add and scale **vectors**, and compute a **dot product** two ways",
    "Multiply a **matrix** by a vector, row by row",
    "Describe what a 2 × 2 matrix does to the plane, and what its **determinant** measures",
    "Read the notation `Wx + b` in machine learning papers and code",
  ],
  prerequisites: [{ label: "School algebra: multiplying and adding numbers, coordinates on a graph" }, { label: "Basic NumPy (for the code section only)" }],

  intro: [
    {
      type: "p",
      text: "Open any machine learning paper and you will meet lines like `h = σ(Wx + b)`. The letters hide something simple: x is a list of numbers, W is a table of numbers, and the whole expression is a few multiplications and additions done in bulk.",
    },
    {
      type: "p",
      text: "This lesson gives those symbols meaning. You will compute every operation by hand on small examples, then see each one as a picture — because the pictures are what make later ideas (similarity, projections, layers, PCA) feel natural.",
    },
  ],

  why: [
    {
      type: "p",
      text: "A row of a dataset is a vector. A layer of a neural network is a matrix. Embeddings, attention scores and cosine similarity are all dot products. Linear algebra is the language the rest of the curriculum is written in.",
    },
    {
      type: "p",
      text: "It is also what makes models fast: a GPU multiplies large matrices very efficiently, so expressing a computation as matrix operations — instead of loops over numbers — is how real models train in hours rather than years.",
    },
  ],

  explanation: {
    beginner: [
      {
        type: "p",
        text: "A **vector** is an ordered list of numbers, such as u = (3, 1). You can draw it as an arrow from the origin to the point (3, 1). A vector with n numbers lives in n-dimensional space; a student described by 5 features is a point in 5 dimensions, even though we can only draw two or three.",
      },
      {
        type: "p",
        text: "**Adding** vectors adds matching entries: (3, 1) + (1, 2) = (4, 3) — place the arrows head to tail. **Scaling** multiplies every entry: 2 × (3, 1) = (6, 2), the same direction, twice as long.",
      },
      {
        type: "p",
        text: "The **dot product** multiplies matching entries and adds the results: (3, 1) · (1, 2) = 3 × 1 + 1 × 2 = 5. It is large and positive when two vectors point the same way, zero when they are at right angles, and negative when they point apart. A neuron’s first step, weights · inputs, is exactly a dot product.",
      },
      {
        type: "p",
        text: "A **matrix** is a grid of numbers. Multiplying a matrix W by a vector x means taking the dot product of each **row** of W with x. A 2 × 2 matrix turns 2 numbers into 2 new numbers — and seen as a picture, it moves every point of the plane: stretching, rotating, shearing, flipping or flattening it.",
      },
    ],
    technical: [
      {
        type: "p",
        text: "Vectors in ℝⁿ form a vector space under addition and scalar multiplication. The dot product u · v = Σᵢ uᵢvᵢ = ‖u‖‖v‖ cos θ, where ‖u‖ = √(u · u) is the Euclidean norm and θ the angle between the vectors. The scalar projection of v onto u is u · v / ‖u‖.",
      },
      {
        type: "p",
        text: "An m × n matrix W defines a linear map ℝⁿ → ℝᵐ: (Wx)ᵢ = Σⱼ Wᵢⱼ xⱼ. Equivalently, Wx is a weighted sum of W’s **columns** with weights x — so the columns are where the basis vectors (1, 0, …) and (0, 1, …) land.",
      },
      {
        type: "p",
        text: "For a 2 × 2 matrix, det W = ad − bc is the factor by which W scales areas; its sign says whether orientation flips. det W = 0 means the columns are parallel, the map flattens the plane onto a line (rank 1), and W has no inverse.",
      },
      {
        type: "p",
        text: "Matrix products compose maps: (AB)x = A(Bx), so AB is defined when A’s column count matches B’s row count, and in general AB ≠ BA. A fully connected layer computes Wx + b, an **affine** map (linear plus a shift), followed by a non-linear activation.",
      },
    ],
  },

  analogy: {
    title: "A recipe card and a shopping basket",
    blocks: [
      {
        type: "p",
        text: "Think of x as a shopping basket: 2 apples and 1 loaf. A price list (3, 2) — 3 for an apple, 2 for a loaf — dotted with the basket gives the bill: 3 × 2 + 2 × 1 = 8. A matrix is several price lists stacked as rows, one per shop; multiplying it by the basket gives the bill at every shop at once.",
      },
      {
        type: "p",
        text: "Where it breaks down: prices are never negative and baskets don’t point in directions. The geometric view — arrows, angles, a moving plane — is the one that carries over to models.",
      },
    ],
  },

  workedExample: {
    title: "Two vectors and one matrix, by hand",
    blocks: [
      { type: "p", text: "Take u = (3, 1) and v = (1, 2)." },
      {
        type: "table",
        caption: "Operations on u = (3, 1) and v = (1, 2)",
        head: ["Operation", "Working", "Result"],
        rows: [
          ["u + v", "(3 + 1, 1 + 2)", "(4, 3)"],
          ["2u", "(2 × 3, 2 × 1)", "(6, 2)"],
          ["u · v", "3 × 1 + 1 × 2", "5"],
          ["‖u‖", "√(3² + 1²) = √10", "3.162"],
          ["‖v‖", "√(1² + 2²) = √5", "2.236"],
          ["cos θ", "5 ÷ (3.162 × 2.236)", "0.707, so θ = 45°"],
          ["shadow of v on u", "u · v ÷ ‖u‖", "1.581 along u’s direction"],
        ],
      },
      {
        type: "p",
        text: "Now a matrix: W = [[1, 2], [3, −1]] and x = (2, 1). Row 1 · x = 1 × 2 + 2 × 1 = 4; row 2 · x = 3 × 2 + (−1) × 1 = 5. So Wx = (4, 5). Adding a bias b = (0.5, −1) gives Wx + b = (4.5, 4) — the computation inside a layer with two inputs and two outputs.",
      },
      {
        type: "p",
        text: "What does W do to the whole plane? Its columns (1, 3) and (2, −1) are where (1, 0) and (0, 1) land. det W = 1 × (−1) − 2 × 3 = −7: every area is multiplied by 7, and the plane is flipped over.",
      },
      {
        type: "table",
        caption: "What some 2 × 2 matrices do",
        head: ["Matrix", "Effect", "det", "Rank"],
        rows: [
          ["[[2, 0], [0, 0.5]]", "Stretch across, squash up and down", "1", "2"],
          ["[[0, −1], [1, 0]]", "Rotate 90° anticlockwise", "1", "2"],
          ["[[1, 1], [0, 1]]", "Shear sideways", "1", "2"],
          ["[[−1, 0], [0, 1]]", "Mirror left–right", "−1", "2"],
          ["[[1, 2], [0.5, 1]]", "Flatten the plane onto a line", "0", "1"],
        ],
      },
    ],
  },

  math: {
    blocks: [
      { type: "equation", expression: "u + v = (u₁ + v₁, u₂ + v₂),   c·u = (c·u₁, c·u₂)", meaning: "Entry by entry. Head-to-tail arrows; scaling changes length, not direction (unless c < 0)." },
      { type: "equation", expression: "u · v = u₁v₁ + u₂v₂ + … + uₙvₙ = ‖u‖ ‖v‖ cos θ", meaning: "Two views of one number: a sum of products, and lengths times the cosine of the angle." },
      { type: "equation", expression: "‖u‖ = √(u · u)", meaning: "Length (Euclidean norm), by Pythagoras." },
      {
        type: "equation",
        expression: "(Wx)ᵢ = Wᵢ₁x₁ + Wᵢ₂x₂ + … + Wᵢₙxₙ",
        meaning: "Each output is one row of W dotted with x. An m × n matrix turns n numbers into m.",
      },
      { type: "equation", expression: "det [[a, b], [c, d]] = ad − bc", meaning: "How a 2 × 2 matrix scales area. Negative: orientation flips. Zero: the plane collapses." },
      { type: "equation", expression: "h = σ(Wx + b)", meaning: "A neural-network layer: a matrix–vector product, plus a bias vector, then an activation applied to each entry." },
    ],
    notation: [
      { symbol: "u, v, x", meaning: "Vectors (lists of numbers); often bold in printed papers" },
      { symbol: "uᵢ", meaning: "The i-th entry of u" },
      { symbol: "W", meaning: "A matrix; Wᵢⱼ is the entry in row i, column j" },
      { symbol: "‖u‖", meaning: "The length (norm) of u" },
      { symbol: "θ", meaning: "The angle between two vectors" },
      { symbol: "b, σ", meaning: "A bias vector, and an activation function such as the sigmoid" },
    ],
  },

  process: {
    title: "Multiplying a matrix by a vector, safely",
    steps: [
      { title: "Check the sizes", text: "An m × n matrix needs a vector with n entries. The result has m entries." },
      { title: "Take row 1", text: "Multiply it entry by entry with the vector and add: that is output 1." },
      { title: "Repeat for every row", text: "One dot product per row gives one output per row." },
      { title: "Add the bias", text: "If there is a b, add it entry by entry." },
      { title: "Sense-check with the columns", text: "Wx is x₁ times column 1 plus x₂ times column 2 (and so on). Both views must agree." },
    ],
  },

  interactive: {
    component: "linear-algebra-lab",
    kind: "computation",
    intro:
      "Two panels, computed in your browser. In the first, set two vectors and watch their sum, dot product, angle and projection. In the second, set the four entries of a 2 × 2 matrix and see it act on the whole grid, on the unit square and on one vector x.",
    tryThis: [
      "Keep u = (3, 1) and v = (1, 2) and check every number against the worked example.",
      "Move v until the dot product is exactly 0. What angle do you see?",
      "Make v point the opposite way to u. What sign does the dot product take?",
      "In the matrix panel, try each preset and read its determinant and rank.",
      "From the identity, change one entry at a time and watch where (1, 0) and (0, 1) go.",
      "Choose **Collapse**. Find two different vectors x that give the same Wx.",
    ],
    expect: [
      { action: "u = (3, 1), v = (1, 2)", result: "u + v = (4, 3), u · v = 5, angle 45.0°, and the shadow of v on u is 1.581 long." },
      { action: "v = (−1, 3)", result: "u · v = 0: the vectors are at right angles and the shadow disappears." },
      { action: "Example W with x = (2, 1)", result: "Wx = (4, 5); det W = −7: areas grow sevenfold and the grid is flipped." },
      { action: "Collapse preset", result: "det = 0 and rank 1: the whole grid lands on one line, so different inputs give the same output." },
    ],
  },

  code: {
    label: "linear_algebra.py",
    language: "Python",
    source: `import numpy as np

u = np.array([3, 1])
v = np.array([1, 2])
print("u + v  =", u + v)
print("2u     =", 2 * u)
print("u . v  =", u @ v)                     # 3*1 + 1*2
print("|u|    =", round(np.linalg.norm(u), 3))
cos = (u @ v) / (np.linalg.norm(u) * np.linalg.norm(v))
print("angle  =", round(np.degrees(np.arccos(cos)), 1), "degrees")

W = np.array([[1, 2],
              [3, -1]])
x = np.array([2, 1])
b = np.array([0.5, -1])
print("Wx     =", W @ x)                     # each row of W dotted with x
print("Wx + b =", W @ x + b)
print("det W  =", round(np.linalg.det(W), 3))`,
    walkthrough: [
      { lines: "3–4", text: "`np.array` turns a Python list into a vector NumPy can do arithmetic on." },
      { lines: "5–6", text: "`+` and `*` work entry by entry, exactly as in the definitions." },
      { lines: "7", text: "`@` is matrix multiplication. Between two vectors it is the dot product." },
      { lines: "8–10", text: "`np.linalg.norm` is the length; the angle comes from cos θ = u · v ÷ (‖u‖ ‖v‖)." },
      { lines: "12–17", text: "`W @ x` computes one dot product per row of W. Adding `b` gives the layer’s pre-activation, Wx + b." },
      { lines: "18", text: "`np.linalg.det` computes the determinant numerically, which is why it is rounded before printing." },
    ],
    shapes: [
      { name: "u, v, x, b", shape: "(2,)", meaning: "Vectors with two entries" },
      { name: "W", shape: "(2, 2)", meaning: "Two rows, two columns" },
      { name: "W @ x", shape: "(2,)", meaning: "One output per row of W" },
    ],
    output: {
      label: "Output",
      text: "u + v  = [4 3]\n2u     = [6 2]\nu . v  = 5\n|u|    = 3.162\nangle  = 45.0 degrees\nWx     = [4 5]\nWx + b = [4.5 4. ]\ndet W  = -7.0",
      note: "Produced by running the script with NumPy 2.5. The experiment computes the same values.",
    },
  },

  useCases: [
    { title: "Every neural-network layer", text: "A dense layer with 784 inputs and 10 outputs is a 10 × 784 matrix W and a bias b: one matrix–vector product per example." },
    { title: "Similarity search", text: "Documents, images and words are stored as vectors; the dot product or cosine of two vectors scores how similar they are." },
    { title: "Linear regression", text: "A prediction ŷ = w · x + b is one dot product; for all rows at once it is ŷ = Xw + b." },
    { title: "Computer graphics", text: "Rotating, scaling and shearing images and 3D scenes are matrix multiplications — the same pictures as in the experiment." },
  ],

  mistakes: [
    {
      kind: "mistake",
      title: "Multiplying matrices entry by entry",
      text: "W @ x (matrix product) and W * x (elementwise, with broadcasting) are different operations. In NumPy and PyTorch, `@` is the matrix product.",
    },
    { kind: "mistake", title: "Mixing up rows and columns", text: "Output i comes from row i of W. Columns are where basis vectors land. Confusing the two transposes the map." },
    { kind: "misconception", title: "“AB is the same as BA”", text: "Matrix multiplication is not commutative. Rotating then stretching differs from stretching then rotating." },
    {
      kind: "misconception",
      title: "“A dot product of 0 means one vector is zero”",
      text: "It usually means they are perpendicular: (3, 1) · (−1, 3) = 0, and neither is zero.",
    },
    {
      kind: "limitation",
      title: "Two dimensions are only a picture",
      text: "Real feature vectors have hundreds or thousands of entries. The rules are identical; only the drawing stops working.",
    },
  ],

  exercise: {
    prompt: [
      { type: "p", text: "Let a = (2, −1), c = (1, 2) and M = [[0, 1], [−2, 3]]." },
      {
        type: "list",
        ordered: true,
        items: ["Compute a + c, 3a and a · c. What does a · c tell you about the angle?", "Compute Ma, row by row.", "Compute det M. Does M flip the plane? Can two different vectors x give the same Mx?"],
      },
    ],
    hints: ["Dot product: multiply matching entries, then add.", "Row 1 of M is (0, 1); row 2 is (−2, 3).", "det [[a, b], [c, d]] = ad − bc."],
    solution: [
      { type: "p", text: "1. a + c = (3, 1); 3a = (6, −3); a · c = 2 × 1 + (−1) × 2 = 0, so the vectors are perpendicular (90°)." },
      { type: "p", text: "2. Row 1: 0 × 2 + 1 × (−1) = −1. Row 2: (−2) × 2 + 3 × (−1) = −7. So Ma = (−1, −7)." },
      {
        type: "p",
        text: "3. det M = 0 × 3 − 1 × (−2) = 2. It is positive, so there is no flip; areas double. Because det ≠ 0, M has rank 2 and different inputs always give different outputs.",
      },
    ],
  },

  quiz: [
    {
      question: "What is (2, 5) · (3, −1)?",
      options: ["1", "(6, −5)", "11", "−1"],
      answer: 0,
      explanation: "2 × 3 + 5 × (−1) = 6 − 5 = 1. A dot product is a single number, not a vector.",
    },
    {
      question: "W has 3 rows and 4 columns. Which vectors x can it multiply, and what comes out?",
      options: ["x with 3 entries; 4 come out", "x with 4 entries; 3 come out", "Any x; the same length comes out", "x with 12 entries; 1 comes out"],
      answer: 1,
      explanation: "Each row (4 entries) is dotted with x, so x needs 4 entries; there is one output per row, so 3 come out.",
    },
    {
      question: "Two vectors have a dot product of 0. What is true?",
      options: ["They are equal", "At least one is zero, or they are at right angles", "They point the same way", "Their lengths are equal"],
      answer: 1,
      explanation: "u · v = ‖u‖‖v‖ cos θ is zero when a length is zero or cos θ = 0, i.e. θ = 90°.",
    },
    {
      question: "A 2 × 2 matrix has determinant 0. What does it do to the plane?",
      options: ["Rotates it", "Leaves it unchanged", "Flattens it onto a line or a point, losing information", "Doubles every area"],
      answer: 2,
      explanation: "Area is scaled by 0: the columns are parallel and every output lies on one line, so the input can’t be recovered.",
    },
    {
      question: "In h = σ(Wx + b), what is computed first?",
      options: ["σ(x)", "The matrix–vector product Wx", "σ(b)", "x + b"],
      answer: 1,
      explanation: "Wx first (one dot product per row), then add b, then apply σ to each entry.",
    },
  ],

  glossary: [
    { term: "Scalar", definition: "A single number." },
    { term: "Vector", definition: "An ordered list of numbers; also an arrow from the origin." },
    { term: "Dot product", definition: "The sum of the products of matching entries; ‖u‖‖v‖ cos θ." },
    { term: "Norm (length)", definition: "‖u‖ = √(u · u), the length of a vector." },
    { term: "Matrix", definition: "A rectangular grid of numbers; acts on vectors by matrix–vector multiplication." },
    { term: "Linear map", definition: "A function that preserves addition and scaling; every matrix defines one." },
    { term: "Determinant", definition: "For a square matrix, the factor by which it scales area or volume (sign: orientation)." },
    { term: "Rank", definition: "The number of dimensions the outputs of a matrix fill." },
    { term: "Affine map", definition: "A linear map plus a shift: Wx + b." },
    { term: "Projection", definition: "The part of one vector that lies along another’s direction." },
  ],

  references: [
    {
      title: "Mathematics for Machine Learning, chapters 2 (Linear Algebra) and 3 (Analytic Geometry)",
      source: "Deisenroth, Faisal & Ong, Cambridge University Press, 2020",
      url: "https://mml-book.github.io/",
      note: "Free PDF. Vectors, matrices, norms, inner products and projections, written for machine learning.",
    },
    {
      title: "Essence of linear algebra",
      source: "3Blue1Brown (Grant Sanderson), video series, 2016",
      url: "https://www.3blue1brown.com/lessons/eola-preview",
      note: "Matrices as transformations of the plane — the picture the experiment is built on.",
    },
    {
      title: "numpy.matmul",
      source: "NumPy documentation",
      url: "https://numpy.org/doc/2.0/reference/generated/numpy.matmul.html",
      note: "What `@` does, including for 1-D vectors and stacks of matrices.",
    },
  ],

  next: [
    { pathSlug: "math-foundations", topicSlug: "vectors-matrices-tensors", reason: "From single vectors to arrays of any shape, and the shape rules that cause most bugs." },
    { pathSlug: "deep-learning", topicSlug: "perceptrons-neurons", reason: "A neuron is a dot product plus a bias, passed through an activation." },
    { pathSlug: "ml-foundations", topicSlug: "clustering-dimensionality-reduction", reason: "PCA uses projections and directions — this lesson’s geometry in many dimensions." },
  ],

  teaching: {
    notes: [
      "Do the worked example on the board before opening the experiment; then use the experiment to check every number.",
      "Insist on saying “row of W dotted with x” aloud while computing Wx; it prevents most row/column mistakes.",
      "Use the Collapse preset to connect determinant 0 with “information is lost” — it returns in PCA and in layers that squeeze many inputs into few outputs.",
    ],
    demo: "Draw a square grid on a transparent sheet over graph paper. Ask students to move the sheet to show “stretch”, “rotate” and “shear”, writing down where (1, 0) and (0, 1) land each time. Those two images are the matrix’s columns.",
    discussion: [
      "Why might a model represent words as vectors rather than as single numbers?",
      "A layer maps 784 inputs to 10 outputs. Can it be undone (inverted)? What does that say about information?",
      "When is the cosine of two vectors a better similarity score than their dot product?",
    ],
    misconceptions: [
      "“Vectors are only arrows in physics.” Any list of numbers — features, pixels, word counts — is a vector.",
      "“Matrix multiplication is entry-by-entry multiplication.”",
      "“A larger dot product always means more similar.” It also grows with length; cosine removes that.",
    ],
    challenge: {
      prompt: "Show that the dot product of u = (a, b) with its own 90° rotation, (−b, a), is always zero. Then explain why rotating every vector by the same matrix doesn’t change any dot product between them.",
      answer: [
        { type: "p", text: "(a, b) · (−b, a) = −ab + ba = 0 for every a and b, so a vector is always perpendicular to its 90° rotation." },
        {
          type: "p",
          text: "A rotation keeps every length and every angle the same. Since u · v = ‖u‖‖v‖ cos θ depends only on lengths and the angle, rotating both vectors leaves it unchanged. (In matrix terms: for a rotation R, RᵀR = I, so (Ru) · (Rv) = uᵀRᵀRv = u · v.)",
        },
      ],
    },
  },
};
