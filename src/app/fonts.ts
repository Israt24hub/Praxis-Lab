import localFont from "next/font/local";

/*
 * Atkinson Hyperlegible Next (Braille Institute) — chosen for legibility,
 * self-hosted from Fontsource so the site makes no runtime requests to Google.
 */
export const atkinson = localFont({
  src: [
    {
      path: "../../node_modules/@fontsource-variable/atkinson-hyperlegible-next/files/atkinson-hyperlegible-next-latin-wght-normal.woff2",
      weight: "200 800",
      style: "normal",
    },
    {
      path: "../../node_modules/@fontsource-variable/atkinson-hyperlegible-next/files/atkinson-hyperlegible-next-latin-wght-italic.woff2",
      weight: "200 800",
      style: "italic",
    },
  ],
  variable: "--font-atkinson",
  display: "swap",
  fallback: ["ui-sans-serif", "system-ui", "sans-serif"],
});

export const atkinsonMono = localFont({
  src: [
    {
      path: "../../node_modules/@fontsource-variable/atkinson-hyperlegible-mono/files/atkinson-hyperlegible-mono-latin-wght-normal.woff2",
      weight: "200 800",
      style: "normal",
    },
  ],
  variable: "--font-atkinson-mono",
  display: "swap",
  preload: false,
  fallback: ["ui-monospace", "monospace"],
});
