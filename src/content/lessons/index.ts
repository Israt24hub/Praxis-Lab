import type { Lesson } from "../../types/content";

import { backpropagation } from "./backpropagation.ts";
import { clusteringDimensionalityReduction } from "./clustering-dimensionality-reduction.ts";
import { derivativesGradients } from "./derivatives-gradients.ts";
import { featuresLabelsDatasets } from "./features-labels-datasets.ts";
import { forwardPropagation } from "./forward-propagation.ts";
import { gradientDescentOptimizers } from "./gradient-descent-optimizers.ts";
import { layersActivations } from "./layers-activations.ts";
import { learningFromData } from "./learning-from-data.ts";
import { linearAlgebraEssentials } from "./linear-algebra-essentials.ts";
import { lossFunctions } from "./loss-functions.ts";
import { metricsCrossValidation } from "./metrics-cross-validation.ts";
import { optimizationFundamentals } from "./optimization-fundamentals.ts";
import { overfittingGeneralization } from "./overfitting-generalization.ts";
import { perceptronsNeurons } from "./perceptrons-neurons.ts";
import { probabilityStatistics } from "./probability-statistics.ts";
import { regressionClassification } from "./regression-classification.ts";
import { regularizationDiagnostics } from "./regularization-diagnostics.ts";
import { supervisedUnsupervised } from "./supervised-unsupervised.ts";
import { trainValidationTest } from "./train-validation-test.ts";
import { treesEnsembles } from "./trees-ensembles.ts";
import { vectorsMatricesTensors } from "./vectors-matrices-tensors.ts";

/*
 * Complete lessons, keyed by id. To publish a lesson: add its file here and set
 * `lessonId` on the matching topic in src/content/paths.ts.
 */
export const lessons: Record<string, Lesson> = {
  [linearAlgebraEssentials.id]: linearAlgebraEssentials,
  [vectorsMatricesTensors.id]: vectorsMatricesTensors,
  [probabilityStatistics.id]: probabilityStatistics,
  [derivativesGradients.id]: derivativesGradients,
  [optimizationFundamentals.id]: optimizationFundamentals,
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
  [layersActivations.id]: layersActivations,
  [forwardPropagation.id]: forwardPropagation,
  [lossFunctions.id]: lossFunctions,
  [backpropagation.id]: backpropagation,
  [gradientDescentOptimizers.id]: gradientDescentOptimizers,
  [regularizationDiagnostics.id]: regularizationDiagnostics,
};
