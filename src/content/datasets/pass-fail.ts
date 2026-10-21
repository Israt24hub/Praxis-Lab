/*
 * Teaching data for "Regression and classification". Invented.
 * 20 students: hours studied and whether they passed (1) or failed (0).
 * The classes overlap between about 2.5 and 5 hours, as real data usually does.
 * The optional extra student studied 25 hours and passed.
 */
export interface PassFailRow {
  hours: number;
  passed: 0 | 1;
}

const hours = [0.5, 1, 1.5, 2, 2.5, 3, 3, 3.5, 4, 4, 4.5, 5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 9];
const passed: Array<0 | 1> = [0, 0, 0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1];

export const passFail: PassFailRow[] = hours.map((h, i) => ({ hours: h, passed: passed[i] }));

export const extraStudent: PassFailRow = { hours: 25, passed: 1 };
