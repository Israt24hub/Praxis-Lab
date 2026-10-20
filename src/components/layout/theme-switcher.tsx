"use client";

import { Check, Monitor, Moon, Presentation, Sun } from "lucide-react";
import { useEffect, useId, useRef, useState, useSyncExternalStore } from "react";

import { DEFAULT_THEME, THEME_EVENT, THEME_STORAGE_KEY, themes, type ThemeId } from "@/config/themes";
import { cx } from "@/lib/cx";

const icons: Record<ThemeId, typeof Sun> = {
  light: Sun,
  dark: Moon,
  system: Monitor,
  chalkboard: Presentation,
};

function readTheme(): ThemeId {
  const value = document.documentElement.getAttribute("data-theme");
  return (themes.find((t) => t.id === value)?.id ?? DEFAULT_THEME) as ThemeId;
}

function subscribe(onChange: () => void) {
  window.addEventListener(THEME_EVENT, onChange);
  return () => window.removeEventListener(THEME_EVENT, onChange);
}

function applyTheme(theme: ThemeId) {
  document.documentElement.setAttribute("data-theme", theme);
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Storage can be unavailable (private mode); the theme still applies for this visit.
  }
  window.dispatchEvent(new Event(THEME_EVENT));
}

export function ThemeSwitcher() {
  const theme = useSyncExternalStore(subscribe, readTheme, () => DEFAULT_THEME);
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const Icon = icons[theme];

  useEffect(() => {
    if (!open) return;
    function onPointer(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("pointerdown", onPointer);
    return () => document.removeEventListener("pointerdown", onPointer);
  }, [open]);

  return (
    <div
      ref={rootRef}
      className="relative"
      onKeyDown={(event) => {
        if (event.key === "Escape" && open) {
          setOpen(false);
          buttonRef.current?.focus();
        }
      }}
    >
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-2 rounded-control border border-line px-3 py-2 text-sm text-fg hover:bg-mist"
      >
        <Icon aria-hidden className="size-4" />
        <span className="sr-only sm:not-sr-only">Theme</span>
        <span className="sr-only">: {themes.find((t) => t.id === theme)?.label}</span>
      </button>

      {open ? (
        <div
          id={panelId}
          className="absolute right-0 top-full z-50 mt-2 w-64 rounded-panel border border-line bg-surface p-2 shadow-lg shadow-black/10"
        >
          <fieldset>
            <legend className="px-2 pb-1 pt-1 text-sm font-semibold">Colour theme</legend>
            {themes.map((t) => {
              const ItemIcon = icons[t.id];
              const selected = theme === t.id;
              return (
                <label
                  key={t.id}
                  className={cx(
                    "flex cursor-pointer items-start gap-3 rounded-control px-2 py-2 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-primary",
                    selected ? "bg-mist" : "hover:bg-sunken",
                  )}
                >
                  <input
                    type="radio"
                    name="praxis-theme"
                    value={t.id}
                    checked={selected}
                    onChange={() => applyTheme(t.id)}
                    className="sr-only"
                  />
                  <ItemIcon aria-hidden className="mt-0.5 size-4 shrink-0 text-fg-muted" />
                  <span className="flex-1">
                    <span className="block text-sm font-medium text-fg">{t.label}</span>
                    <span className="block text-xs text-fg-muted">{t.description}</span>
                  </span>
                  {selected ? <Check aria-hidden className="mt-0.5 size-4 shrink-0 text-link" /> : null}
                </label>
              );
            })}
          </fieldset>
        </div>
      ) : null}
    </div>
  );
}
