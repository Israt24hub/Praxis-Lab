import type { Lesson } from "../../types/content";

import { featuresLabelsDatasets } from "./features-labels-datasets.ts";
import { learningFromData } from "./learning-from-data.ts";
import { metricsCrossValidation } from "./metrics-cross-validation.ts";
import { overfittingGeneralization } from "./overfitting-generalization.ts";
import { perceptronsNeurons } from "./perceptrons-neurons.ts";
import { regressionClassification } from "./regression-classification.ts";

/*
 * Complete lessons, keyed by id. To publish a lesson: add its file here and set
 * `lessonId` on the matching topic in src/content/paths.ts.
 */
export const lessons: Record<string, Lesson> = {
  [learningFromData.id]: learningFromData,
  [featuresLabelsDatasets.id]: featuresLabelsDatasets,
  [regressionClassification.id]: regressionClassification,
  [overfittingGeneralization.id]: overfittingGeneralization,
  [metricsCrossValidation.id]: metricsCrossValidation,
  [perceptronsNeurons.id]: perceptronsNeurons,
};
