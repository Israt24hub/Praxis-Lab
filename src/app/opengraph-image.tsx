import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { ImageResponse } from "next/og";

import { site } from "@/config/site";

/*
 * The link-preview image for every page, generated once at build time in the
 * design-board palette: warm ivory, ink navy, muted indigo and a coral accent.
 * Static Fontsource .woff files are used because the image renderer cannot read
 * the variable .woff2 fonts the site itself loads.
 */
export const alt = `${site.name}: ${site.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const font = (pkg: string, file: string) => readFile(join(process.cwd(), "node_modules/@fontsource", pkg, "files", file));

// Read once when the module loads, as in the Next.js example, so the image can be prerendered.
const [display, sans, sansMedium] = await Promise.all([
  font("playfair-display", "playfair-display-latin-600-normal.woff"),
  font("inter", "inter-latin-400-normal.woff"),
  font("inter", "inter-latin-500-normal.woff"),
]);

export default async function OpenGraphImage() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", background: "#F7F6F2", color: "#202B3C", padding: "64px 80px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <svg width="56" height="56" viewBox="0 0 32 32">
            <path d="M16 2.5 L27.7 9.25 L27.7 22.75 L16 29.5 L4.3 22.75 L4.3 9.25 Z" fill="none" stroke="#202B3C" strokeWidth="2" strokeLinejoin="round" />
            <path d="M13 9.5 V19.5 H20" fill="none" stroke="#5367B7" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <div style={{ fontFamily: "Playfair", fontSize: 40 }}>{site.name}</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", marginTop: 64 }}>
          <div style={{ width: 96, height: 8, background: "#D97960", borderRadius: 4, marginBottom: 32 }} />
          <div style={{ fontFamily: "Playfair", fontSize: 72, lineHeight: 1.08, maxWidth: 960 }}>{site.tagline}</div>
          <div style={{ fontFamily: "Inter", fontSize: 30, lineHeight: 1.4, color: "#4B5567", marginTop: 24, maxWidth: 980 }}>
            AI and machine learning lessons with experiments that run in your browser, a project workflow and honest research writing.
          </div>
        </div>
        <div style={{ display: "flex", gap: 14, marginTop: "auto", fontFamily: "Inter", fontWeight: 500, fontSize: 24 }}>
          {["Learn", "AI Playground", "Project Lab", "Research & Papers"].map((label) => (
            <div key={label} style={{ display: "flex", padding: "10px 20px", borderRadius: 999, background: "#DCE5F5", color: "#202B3C" }}>
              {label}
            </div>
          ))}
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Playfair", data: display, style: "normal", weight: 600 },
        { name: "Inter", data: sans, style: "normal", weight: 400 },
        { name: "Inter", data: sansMedium, style: "normal", weight: 500 },
      ],
    },
  );
}
