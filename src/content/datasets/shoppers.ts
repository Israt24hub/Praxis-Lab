/*
 * Teaching data for "Clustering and dimensionality reduction". Invented.
 *
 * shoppers: 60 customers of a shop — visits per month and spend per month ($).
 * Generated with NumPy, rng = default_rng(1), from three groups of 20:
 *   0 frequent visitors who spend little (about 15 visits, $800),
 *   1 rare visitors who spend little (about 3 visits, $900),
 *   2 regular visitors who spend a lot (about 9 visits, $2,200).
 * The group is kept only so the lab can reveal it; clustering never sees it.
 *
 * effort: 40 students — hours studied in a month and practice questions answered,
 * strongly correlated (questions ≈ 20 × hours + noise). NumPy, rng = default_rng(5).
 */
export const shoppers = {
  visits: [
    16, 17, 16, 11, 18, 16, 13, 17, 16, 16, 15, 17, 13, 15, 14, 17, 15, 14, 13, 14,
    2, 2, 3, 2, 3, 3, 3, 2, 4, 4, 3, 2, 4, 2, 4, 2, 4, 3, 2, 3,
    11, 9, 6, 7, 11, 10, 8, 9, 10, 10, 11, 10, 9, 8, 11, 4, 9, 9, 6, 10,
  ],
  spend: [
    800, 760, 990, 950, 390, 520, 770, 740, 830, 830, 1120, 630, 740, 1110, 900,
    900, 720, 550, 830, 820, 910, 950, 720, 700, 940, 820, 940, 1040, 600, 950,
    1120, 850, 750, 1040, 950, 1060, 840, 630, 880, 820, 2000, 2460, 2160, 2400, 2570,
    2310, 1940, 1750, 2730, 2170, 1990, 2240, 2140, 2460, 2210, 2200, 1990, 2340, 1890, 2400,
  ],
  group: [
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
    2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2,
  ],
};

export const effort = {
  hours: [
    15, 15, 10, 6.5, 3, 8, 8.5, 2.5, 3, 18, 12.5, 6, 9, 17.5, 16.5, 15.5, 8.5, 10, 13, 3,
    11, 6.5, 16, 3, 13, 16, 5.5, 16.5, 16, 2.5, 13.5, 2, 10, 9, 5.5, 7, 15, 7, 4.5, 13,
  ],
  questions: [
    353, 332, 110, 142, 10, 161, 172, 0, 49, 348, 293, 67, 213, 301, 315, 272, 235, 226, 369, 89,
    258, 168, 293, 57, 321, 302, 118, 329, 347, 34, 263, 51, 205, 141, 150, 82, 246, 82, 134, 244,
  ],
};
