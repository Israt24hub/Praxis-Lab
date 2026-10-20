import type { Lesson } from "../../types/content";

import { learningFromData } from "./learning-from-data.ts";
import { perceptronsNeurons } from "./perceptrons-neurons.ts";

/*
 * Complete lessons, keyed by id. To publish a lesson: add its file here and set
 * `lessonId` on the matching topic in src/content/paths.ts.
 */
export const lessons: Record<string, Lesson> = {
  [learningFromData.id]: learningFromData,
  [perceptronsNeurons.id]: perceptronsNeurons,
};
