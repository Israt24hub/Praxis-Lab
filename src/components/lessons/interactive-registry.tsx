import type { ComponentType } from "react";

import { NeuronLab } from "@/components/playground/neuron-lab";

import { BackpropLab } from "./backprop-lab";
import { ClusteringLab } from "./clustering-lab";
import { DatasetBuilderLab } from "./dataset-builder-lab";
import { DerivativesLab } from "./derivatives-lab";
import { ForwardLab } from "./forward-lab";
import { LayersLab } from "./layers-lab";
import { LearningFromDataLab } from "./learning-from-data-lab";
import { LinearAlgebraLab } from "./linear-algebra-lab";
import { LearningTypesLab } from "./learning-types-lab";
import { LossLab } from "./loss-lab";
import { OptimizationLab } from "./optimization-lab";
import { OptimizersLab } from "./optimizers-lab";
import { OverfittingLab } from "./overfitting-lab";
import { PassFailLab } from "./pass-fail-lab";
import { ProbabilityLab } from "./probability-lab";
import { RegularizationLab } from "./regularization-lab";
import { ShapesLab } from "./shapes-lab";
import { SplitsLab } from "./splits-lab";
import { ThresholdLab } from "./threshold-lab";
import { TreeLab } from "./tree-lab";

/*
 * Interactive experiments a lesson can embed, keyed by Lesson.interactive.component.
 * Future 3D experiences register here too, loaded with next/dynamic when
 * features.threeD is enabled (see DECISIONS.md).
 */
export const interactiveRegistry: Record<string, ComponentType> = {
  "linear-algebra-lab": LinearAlgebraLab,
  "shapes-lab": ShapesLab,
  "probability-lab": ProbabilityLab,
  "derivatives-lab": DerivativesLab,
  "optimization-lab": OptimizationLab,
  "learning-from-data-lab": LearningFromDataLab,
  "dataset-builder-lab": DatasetBuilderLab,
  "learning-types-lab": LearningTypesLab,
  "pass-fail-lab": PassFailLab,
  "overfitting-lab": OverfittingLab,
  "threshold-lab": ThresholdLab,
  "tree-lab": TreeLab,
  "clustering-lab": ClusteringLab,
  "splits-lab": SplitsLab,
  "neuron-lab": NeuronLab,
  "layers-lab": LayersLab,
  "forward-lab": ForwardLab,
  "loss-lab": LossLab,
  "backprop-lab": BackpropLab,
  "optimizers-lab": OptimizersLab,
  "regularization-lab": RegularizationLab,
};
