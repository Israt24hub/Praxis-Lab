/*
 * Colour themes. The value is written to <html data-theme="…"> and saved in
 * localStorage under THEME_STORAGE_KEY. CSS values live in src/app/globals.css.
 */
export const themes = [
  { id: "light", label: "Light", description: "Warm ivory, the default" },
  { id: "dark", label: "Dark", description: "Ink navy" },
  { id: "system", label: "System", description: "Follows your device setting" },
  { id: "chalkboard", label: "Chalkboard", description: "The original green board" },
] as const;

export type ThemeId = (typeof themes)[number]["id"];

export const DEFAULT_THEME: ThemeId = "light";
export const THEME_STORAGE_KEY = "praxis-theme";
export const THEME_EVENT = "praxis-theme-change";

/**
 * Runs in <head> before first paint so a saved theme never flashes the default.
 * Kept tiny and dependency-free on purpose.
 */
export const themeInitScript = `(function(){try{var t=localStorage.getItem("${THEME_STORAGE_KEY}");var ok=${JSON.stringify(
  themes.map((t) => t.id),
)};if(t&&ok.indexOf(t)!==-1){document.documentElement.setAttribute("data-theme",t)}}catch(e){}})()`;
