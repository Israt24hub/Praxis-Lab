/*
 * Content model. Everything in src/content conforms to these types so the
 * local mock data can later be replaced by a CMS or API without touching pages.
 */

export type Level = "beginner" | "intermediate" | "advanced";

/** Who can access an item once the platform has accounts. */
export type Access = "free" | "premium";

/**
 * How far along an item is. Pages must show this honestly.
 * - live: works now
 * - outline: structure/syllabus published, lessons not written yet
 * - planned: on the roadmap, nothing usable yet
 */
export type Availability = "live" | "outline" | "planned";

/** One topic in a learning path. It has a full lesson only when `lessonId` is set. */
export interface Topic {
  slug: string;
  title: string;
  summary: string;
  /** What a learner will be able to do after the lesson. */
  outcomes: string[];
  /** Id of a complete lesson in src/content/lessons. Absent = planned. */
  lessonId?: string;
  /** Existing material on the site that covers this topic in the meantime. */
  seeAlso?: { label: string; href: string };
}

export interface LearningPath {
  slug: string;
  /** Curriculum letter, A–H. */
  code: string;
  title: string;
  /** What the learner will be able to do at the end. */
  destination: string;
  summary: string;
  level: Level;
  /** Slugs of paths to finish first. */
  prerequisitePaths: string[];
  /** Skills assumed beyond the prerequisite paths. */
  prerequisiteSkills: string[];
  topics: Topic[];
  /** The project a learner completes in this path. */
  capstone: string;
  /** Planned premium additions on top of the free core. */
  premiumExtras: string[];
}

/* ---------- Lessons ---------- */

/**
 * Inline text supports `code` in backticks and **bold**. Keep it plain otherwise;
 * structure belongs in blocks, not in the string.
 */
export type RichText = string;

export type Block =
  | { type: "p"; text: RichText }
  | { type: "list"; items: RichText[]; ordered?: boolean }
  | { type: "table"; caption: string; head: string[]; rows: RichText[][] }
  | { type: "callout"; tone: "note" | "warning" | "honesty"; title: string; text: RichText }
  | { type: "equation"; expression: string; meaning: RichText };

export interface QuizQuestion {
  question: RichText;
  options: RichText[];
  /** Index into options. */
  answer: number;
  explanation: RichText;
}

export interface Lesson {
  id: string;
  pathSlug: string;
  topicSlug: string;
  title: string;
  summary: string;
  level: Level;
  /** Planned study time, a rough guide rather than a measurement. */
  minutes: [number, number];
  objectives: RichText[];
  prerequisites: { label: string; href?: string }[];

  intro: Block[];
  why: Block[];
  /** Two explanations of the same idea; the learner switches between them. */
  explanation: { beginner: Block[]; technical: Block[] };
  analogy: { title: string; blocks: Block[] };
  workedExample: { title: string; blocks: Block[] };
  math?: { blocks: Block[]; notation: { symbol: string; meaning: RichText }[] };
  process: { title: string; steps: { title: string; text: RichText }[] };
  interactive: {
    /** Key into the interactive registry (src/components/lessons/interactive-registry.tsx). */
    component: string;
    intro: RichText;
    /** Real computation in the browser, or a conceptual simulation. */
    kind: "computation" | "simulation";
    tryThis: RichText[];
    expect: { action: RichText; result: RichText }[];
  };
  code: {
    label: string;
    language: string;
    source: string;
    walkthrough: { lines: string; text: RichText }[];
    shapes: { name: string; shape: string; meaning: RichText }[];
    output?: { label: string; text: string; note: RichText };
  };
  useCases: { title: string; text: RichText }[];
  mistakes: { title: string; text: RichText; kind: "mistake" | "limitation" | "misconception" }[];
  exercise: { prompt: Block[]; hints: RichText[]; solution: Block[] };
  quiz: QuizQuestion[];
  glossary: { term: string; definition: RichText }[];
  references: { title: string; source: string; url?: string; note: RichText }[];
  next: { pathSlug: string; topicSlug: string; reason: RichText }[];
  teaching: {
    notes: RichText[];
    demo: RichText;
    discussion: RichText[];
    misconceptions: RichText[];
    challenge: { prompt: RichText; answer: Block[] };
  };
}

export type ConceptId =
  | "data-to-prediction"
  | "learning-weights"
  | "image-features"
  | "tokens-embeddings"
  | "attention"
  | "fine-tuning";

export interface Concept {
  id: ConceptId;
  title: string;
  question: string;
  explanation: string[];
  /** Short caveat that keeps the simplified diagram honest. */
  caveat: string;
  pathSlug: string;
}

export type Renderer = "2d" | "3d";

export interface Experiment {
  id: string;
  title: string;
  summary: string;
  /** What the learner can change and observe. */
  interactions: string[];
  renderer: Renderer;
  access: Access;
  status: Availability;
  pathSlug: string;
  /** Registry key of the component, for live experiments. */
  component?: string;
  /** The lesson this experiment belongs to, if any. */
  lesson?: { pathSlug: string; topicSlug: string };
}

export type PhaseId = "frame" | "data" | "model" | "evaluate" | "report";

export interface WorkflowPhase {
  id: PhaseId;
  title: string;
  summary: string;
}

export interface WorkflowStep {
  number: number;
  slug: string;
  phase: PhaseId;
  title: string;
  summary: string;
  /** Why the step exists. */
  purpose: RichText;
  /** What you need before starting the step. */
  input: RichText;
  /** What you should have in hand when the step is done. */
  output: RichText;
  tools: RichText[];
  mistakes: RichText[];
  /** How this step's output feeds the next step. */
  next: RichText;
  /** Extra teaching content for steps that need it (e.g. preprocessing by data type). */
  details?: Block[];
  examples?: { label: string; language: string; code: string; note: RichText }[];
  /** True when the step also has a full long-form guide. */
  hasGuide: boolean;
}

export interface ResearchStage {
  number: number;
  title: string;
  summary: string;
  produces: string;
}

export interface PaperSection {
  id: string;
  title: string;
  purpose: string;
  include: string[];
  avoid: string;
  /** Placeholder text showing the shape of the section, never invented results. */
  example: string;
}

export interface PlanFeature {
  label: string;
  note?: string;
}

export interface Plan {
  id: Access;
  name: string;
  status: string;
  summary: string;
  features: PlanFeature[];
}
