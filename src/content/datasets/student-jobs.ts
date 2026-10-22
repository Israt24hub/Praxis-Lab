/*
 * Teaching data for "Supervised and unsupervised learning". Invented.
 * Weekly study hours, weekly hours of paid work, whether the student has a job
 * (1) or studies full time (0), and whether they passed (1) or failed (0).
 * Generated with NumPy, rng = default_rng(3): full-time students work about 3 h
 * a week, students with jobs about 20 h; passing depends on study hours plus noise
 * (study + N(0, 1.2) > 8). 40 training students, then 20 held-out students.
 */
export interface StudentJobRow {
  study: number;
  work: number;
  job: 0 | 1;
  passed: 0 | 1;
}

export const studentJobs: StudentJobRow[] = [
  { study: 11.2, work: 7.1, job: 0, passed: 1 },
  { study: 11.6, work: 0, job: 0, passed: 1 },
  { study: 13.5, work: 3.8, job: 0, passed: 1 },
  { study: 8, work: 1.9, job: 0, passed: 1 },
  { study: 12.6, work: 2.1, job: 0, passed: 1 },
  { study: 14.3, work: 2.6, job: 0, passed: 1 },
  { study: 3.4, work: 0, job: 0, passed: 0 },
  { study: 13.9, work: 2.5, job: 0, passed: 1 },
  { study: 7.5, work: 1.3, job: 0, passed: 0 },
  { study: 8.7, work: 9.6, job: 0, passed: 0 },
  { study: 4, work: 3.5, job: 0, passed: 0 },
  { study: 11.8, work: 2.3, job: 0, passed: 1 },
  { study: 6.1, work: 2.4, job: 0, passed: 0 },
  { study: 14.2, work: 1.7, job: 0, passed: 1 },
  { study: 5.9, work: 0.9, job: 0, passed: 0 },
  { study: 9.9, work: 2.2, job: 0, passed: 1 },
  { study: 7.6, work: 4, job: 0, passed: 0 },
  { study: 10.6, work: 2.5, job: 0, passed: 1 },
  { study: 4.8, work: 4.9, job: 0, passed: 0 },
  { study: 4.5, work: 2.6, job: 0, passed: 0 },
  { study: 12.5, work: 20.1, job: 1, passed: 1 },
  { study: 12.5, work: 24.6, job: 1, passed: 1 },
  { study: 9.9, work: 21.6, job: 1, passed: 1 },
  { study: 14.9, work: 18.5, job: 1, passed: 1 },
  { study: 4.9, work: 19.5, job: 1, passed: 0 },
  { study: 13.9, work: 21.6, job: 1, passed: 1 },
  { study: 4.4, work: 25.8, job: 1, passed: 0 },
  { study: 15.5, work: 19.2, job: 1, passed: 1 },
  { study: 10.7, work: 19.3, job: 1, passed: 1 },
  { study: 10.5, work: 23, job: 1, passed: 1 },
  { study: 15.6, work: 17.3, job: 1, passed: 1 },
  { study: 13, work: 19.1, job: 1, passed: 1 },
  { study: 13.1, work: 22.6, job: 1, passed: 1 },
  { study: 2.8, work: 21.7, job: 1, passed: 0 },
  { study: 7.2, work: 20.3, job: 1, passed: 0 },
  { study: 3.2, work: 22, job: 1, passed: 0 },
  { study: 4.7, work: 11.5, job: 1, passed: 0 },
  { study: 5, work: 23.1, job: 1, passed: 0 },
  { study: 14, work: 17.1, job: 1, passed: 1 },
  { study: 3.8, work: 15, job: 1, passed: 0 },
];

export const studentJobsHeldOut: StudentJobRow[] = [
  { study: 11.3, work: 5.1, job: 0, passed: 1 },
  { study: 6.7, work: 0.4, job: 0, passed: 0 },
  { study: 4.8, work: 1, job: 0, passed: 0 },
  { study: 15, work: 1.4, job: 0, passed: 1 },
  { study: 5.4, work: 3.1, job: 0, passed: 0 },
  { study: 4.1, work: 4.3, job: 0, passed: 0 },
  { study: 5.9, work: 7.1, job: 0, passed: 0 },
  { study: 6.8, work: 2.6, job: 0, passed: 0 },
  { study: 5.2, work: 4.5, job: 0, passed: 0 },
  { study: 9.5, work: 3.3, job: 0, passed: 0 },
  { study: 15.1, work: 25.3, job: 1, passed: 1 },
  { study: 3.8, work: 22.2, job: 1, passed: 0 },
  { study: 7.8, work: 24.1, job: 1, passed: 0 },
  { study: 11.4, work: 16.8, job: 1, passed: 1 },
  { study: 14.4, work: 19.4, job: 1, passed: 1 },
  { study: 16, work: 17.6, job: 1, passed: 1 },
  { study: 4, work: 24.5, job: 1, passed: 0 },
  { study: 9.5, work: 22, job: 1, passed: 1 },
  { study: 14.3, work: 19.1, job: 1, passed: 1 },
  { study: 2.7, work: 18.6, job: 1, passed: 0 },
];
