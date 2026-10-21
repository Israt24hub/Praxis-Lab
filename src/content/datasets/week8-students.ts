/*
 * Teaching data for "Features, labels, datasets and predictions". Invented.
 * Ten students' records at the end of a course. The prediction is made in week 8,
 * after the midterm and before the final exam. A student passes when
 * midterm + final exam ≥ 40 (out of 80).
 */

export type ColumnKind = "id" | "category" | "number";

export interface ColumnInfo {
  key: StudentKey;
  label: string;
  kind: ColumnKind;
  /** Known in week 8, when the prediction is made? */
  knownAtPrediction: boolean;
  /** Why this column should or should not be a feature. Shown as feedback in the lab. */
  note: string;
}

export type StudentKey =
  | "studentId"
  | "department"
  | "attendance"
  | "assignments"
  | "residence"
  | "midterm"
  | "finalExam"
  | "passed";

export type StudentRecord = Record<StudentKey, string | number>;

export const studentColumns: ColumnInfo[] = [
  {
    key: "studentId",
    label: "student_id",
    kind: "id",
    knownAtPrediction: true,
    note: "An identifier. It is unique to each student, so a model can only memorise it; it says nothing about a new student.",
  },
  {
    key: "department",
    label: "department",
    kind: "category",
    knownAtPrediction: true,
    note: "A category known from enrolment. One-hot encoding turns it into one 0/1 column per department.",
  },
  {
    key: "attendance",
    label: "attendance (%)",
    kind: "number",
    knownAtPrediction: true,
    note: "A number known by week 8. A reasonable feature.",
  },
  {
    key: "assignments",
    label: "assignments (of 10)",
    kind: "number",
    knownAtPrediction: true,
    note: "Assignments submitted so far. A reasonable feature.",
  },
  {
    key: "residence",
    label: "residence",
    kind: "category",
    knownAtPrediction: true,
    note: "A category known in advance. Whether it helps is for the data to show — but it is allowed.",
  },
  {
    key: "midterm",
    label: "midterm (of 30)",
    kind: "number",
    knownAtPrediction: true,
    note: "The midterm happens before week 8, so its mark is available when predicting.",
  },
  {
    key: "finalExam",
    label: "final_exam (of 50)",
    kind: "number",
    knownAtPrediction: false,
    note: "The final exam happens after week 8. Using it is target leakage: in this data it separates pass from fail perfectly, and it does not exist yet for any student you want to predict.",
  },
  {
    key: "passed",
    label: "passed",
    kind: "category",
    knownAtPrediction: false,
    note: "The outcome we want to predict. It is the target, never a feature.",
  },
];

export const students: StudentRecord[] = [
  { studentId: "S01", department: "CSE", attendance: 92, assignments: 9, residence: "hostel", midterm: 24, finalExam: 41, passed: "yes" },
  { studentId: "S02", department: "EEE", attendance: 65, assignments: 5, residence: "home", midterm: 14, finalExam: 22, passed: "no" },
  { studentId: "S03", department: "BBA", attendance: 78, assignments: 7, residence: "home", midterm: 19, finalExam: 30, passed: "yes" },
  { studentId: "S04", department: "CSE", attendance: 55, assignments: 4, residence: "hostel", midterm: 12, finalExam: 18, passed: "no" },
  { studentId: "S05", department: "CSE", attendance: 88, assignments: 8, residence: "home", midterm: 22, finalExam: 36, passed: "yes" },
  { studentId: "S06", department: "BBA", attendance: 70, assignments: 6, residence: "hostel", midterm: 17, finalExam: 27, passed: "yes" },
  { studentId: "S07", department: "EEE", attendance: 81, assignments: 8, residence: "home", midterm: 20, finalExam: 33, passed: "yes" },
  { studentId: "S08", department: "BBA", attendance: 48, assignments: 3, residence: "home", midterm: 10, finalExam: 15, passed: "no" },
  { studentId: "S09", department: "EEE", attendance: 74, assignments: 6, residence: "hostel", midterm: 18, finalExam: 20, passed: "no" },
  { studentId: "S10", department: "CSE", attendance: 96, assignments: 10, residence: "home", midterm: 27, finalExam: 45, passed: "yes" },
];

/** A student we want a prediction for, in week 8: the final exam and the outcome don't exist yet. */
export const newStudent: Partial<StudentRecord> = {
  studentId: "S11",
  department: "EEE",
  attendance: 85,
  assignments: 7,
  residence: "hostel",
  midterm: 21,
};
