import type { Lesson } from "../../types/content";

import { clusteringDimensionalityReduction } from "./clustering-dimensionality-reduction.ts";
import { featuresLabelsDatasets } from "./features-labels-datasets.ts";
import { learningFromData } from "./learning-from-data.ts";
import { metricsCrossValidation } from "./metrics-cross-validation.ts";
import { overfittingGeneralization } from "./overfitting-generalization.ts";
import { perceptronsNeurons } from "./perceptrons-neurons.ts";
import { regressionClassification } from "./regression-classification.ts";
import { supervisedUnsupervised } from "./supervised-unsupervised.ts";
import { trainValidationTest } from "./train-validation-test.ts";
import { treesEnsembles } from "./trees-ensembles.ts";

/*
 * Complete lessons, keyed by id. To publish a lesson: add its file here and set
 * `lessonId` on the matching topic in src/content/paths.ts.
 */
export const lessons: Record<string, Lesson> = {
  [learningFromData.id]: learningFromData,
  [featuresLabelsDatasets.id]: featuresLabelsDatasets,
  [supervisedUnsupervised.id]: supervisedUnsupervised,
  [regressionClassification.id]: regressionClassification,
  [treesEnsembles.id]: treesEnsembles,
  [clusteringDimensionalityReduction.id]: clusteringDimensionalityReduction,
  [trainValidationTest.id]: trainValidationTest,
  [overfittingGeneralization.id]: overfittingGeneralization,
  [metricsCrossValidation.id]: metricsCrossValidation,
  [perceptronsNeurons.id]: perceptronsNeurons,
};
