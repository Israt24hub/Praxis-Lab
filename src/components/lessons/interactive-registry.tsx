import type { ComponentType } from "react";

import { NeuronLab } from "@/components/playground/neuron-lab";

import { LearningFromDataLab } from "./learning-from-data-lab";

/*
 * Interactive experiments a lesson can embed, keyed by Lesson.interactive.component.
 * Future 3D experiences register here too, loaded with next/dynamic when
 * features.threeD is enabled (see DECISIONS.md).
 */
export const interactiveRegistry: Record<string, ComponentType> = {
  "learning-from-data-lab": LearningFromDataLab,
  "neuron-lab": NeuronLab,
};
