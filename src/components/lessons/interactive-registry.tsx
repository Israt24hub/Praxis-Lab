import type { ComponentType } from "react";

import { NeuronLab } from "@/components/playground/neuron-lab";

import { DatasetBuilderLab } from "./dataset-builder-lab";
import { LearningFromDataLab } from "./learning-from-data-lab";
import { OverfittingLab } from "./overfitting-lab";
import { PassFailLab } from "./pass-fail-lab";
import { ThresholdLab } from "./threshold-lab";

/*
 * Interactive experiments a lesson can embed, keyed by Lesson.interactive.component.
 * Future 3D experiences register here too, loaded with next/dynamic when
 * features.threeD is enabled (see DECISIONS.md).
 */
export const interactiveRegistry: Record<string, ComponentType> = {
  "learning-from-data-lab": LearningFromDataLab,
  "dataset-builder-lab": DatasetBuilderLab,
  "pass-fail-lab": PassFailLab,
  "overfitting-lab": OverfittingLab,
  "threshold-lab": ThresholdLab,
  "neuron-lab": NeuronLab,
};
