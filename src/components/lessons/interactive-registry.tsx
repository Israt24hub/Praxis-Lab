import type { ComponentType } from "react";

import { NeuronLab } from "@/components/playground/neuron-lab";

import { AugmentationLab } from "./augmentation-lab";
import { BackpropLab } from "./backprop-lab";
import { ClusteringLab } from "./clustering-lab";
import { ConvolutionLab } from "./convolution-lab";
import { DatasetBuilderLab } from "./dataset-builder-lab";
import { DerivativesLab } from "./derivatives-lab";
import { DetectionLab } from "./detection-lab";
import { ForwardLab } from "./forward-lab";
import { ImageLab } from "./image-lab";
import { LayersLab } from "./layers-lab";
import { LearningFromDataLab } from "./learning-from-data-lab";
import { LearningTypesLab } from "./learning-types-lab";
import { LinearAlgebraLab } from "./linear-algebra-lab";
import { LossLab } from "./loss-lab";
import { OptimizationLab } from "./optimization-lab";
import { OptimizersLab } from "./optimizers-lab";
import { OverfittingLab } from "./overfitting-lab";
import { PassFailLab } from "./pass-fail-lab";
import { PoolingLab } from "./pooling-lab";
import { ProbabilityLab } from "./probability-lab";
import { RegularizationLab } from "./regularization-lab";
import { ShapesLab } from "./shapes-lab";
import { SplitsLab } from "./splits-lab";
import { ThresholdLab } from "./threshold-lab";
import { TransferLab } from "./transfer-lab";
import { TreeLab } from "./tree-lab";
import { VisionEvalLab } from "./vision-eval-lab";

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
  "image-lab": ImageLab,
  "augmentation-lab": AugmentationLab,
  "convolution-lab": ConvolutionLab,
  "pooling-lab": PoolingLab,
  "transfer-lab": TransferLab,
  "detection-lab": DetectionLab,
  "vision-eval-lab": VisionEvalLab,
};
