/*
 * Feature flags for capabilities planned after Phase 1.
 * Pages read these instead of hard-coding "coming soon", so turning a
 * capability on later is a one-line change plus the feature itself.
 */
export const features = {
  /** 3D model explorers (e.g. react-three-fiber), lazy-loaded per experiment. */
  threeD: false,
  /** Sign-in and saved learning progress. */
  accounts: false,
  /** Paid plans and premium access checks. */
  billing: false,
} as const;

export type FeatureFlag = keyof typeof features;
