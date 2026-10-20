/*
 * Teaching dataset for "What does learning from data mean?".
 * Invented for the lesson: 15 students, hours studied → exam score (out of 100).
 * The first 12 rows are the training set; the last 3 are held out for testing.
 */
export interface StudyRow {
  id: number;
  hours: number;
  score: number;
  split: "train" | "test";
}

const raw: Array<[number, number]> = [
  [1, 41],
  [2, 44],
  [2.5, 53],
  [3, 50],
  [4, 61],
  [4.5, 58],
  [5, 66],
  [6, 69],
  [6.5, 77],
  [7, 74],
  [8, 85],
  [9, 88],
  [3.5, 57],
  [5.5, 64],
  [7.5, 82],
];

export const studyHours: StudyRow[] = raw.map(([hours, score], i) => ({
  id: i + 1,
  hours,
  score,
  split: i < 12 ? "train" : "test",
}));
