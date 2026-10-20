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

export interface PathModule {
  title: string;
  summary: string;
  access: Access;
}

export interface LearningPath {
  slug: string;
  title: string;
  /** What the learner will be able to do at the end. */
  destination: string;
  summary: string;
  level: Level;
  /** Slugs of paths to finish first. */
  prerequisitePaths: string[];
  /** Skills assumed beyond the prerequisite paths. */
  prerequisiteSkills: string[];
  modules: PathModule[];
  /** The project a learner completes in this path. */
  capstone: string;
  /** Planned premium additions on top of the free core. */
  premiumExtras: string[];
  status: Availability;
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
  /** What you should have in hand when the step is done. */
  output: string;
  /** True when a full guide page exists for this step. */
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
