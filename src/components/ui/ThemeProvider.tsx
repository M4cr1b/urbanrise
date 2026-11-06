"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { isThemePreference, THEME_STORAGE_KEY, type ThemePreference } from "@/lib/theme";

const ThemeContext = createContext<{
  preference: ThemePreference;
  resolvedTheme: "light" | "dark";
  setPreference: (preference: ThemePreference, origin?: { x: number; y: number }) => void;
} | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [preference, setPreference] = useState<ThemePreference>("system");
  const [ready, setReady] = useState(false);
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light");
  const transitionRef = useRef<ViewTransition | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY);
      if (isThemePreference(saved)) setPreference(saved);
    } catch {
      // Device detection and manual selection still work when storage is blocked.
    }
    setReady(true);

    const sync = (event: StorageEvent) => {
      if (event.key === THEME_STORAGE_KEY || event.key === null) {
        setPreference(isThemePreference(event.newValue) ? event.newValue : "system");
      }
    };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);

  useEffect(() => {
    if (!ready) return;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = () => {
      const resolved = preference === "system"
        ? (media.matches ? "dark" : "light")
        : preference;
      document.documentElement.dataset.theme = resolved;
      setResolvedTheme(resolved);
    };
    apply();
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, [preference, ready]);

  useEffect(() => () => transitionRef.current?.skipTransition(), []);

  function chooseTheme(next: ThemePreference, origin?: { x: number; y: number }) {
    const root = document.documentElement;
    const resolved = next === "system"
      ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
      : next;
    transitionRef.current?.skipTransition();
    const apply = () => {
      root.dataset.theme = resolved;
      setPreference(next);
      setResolvedTheme(resolved);
    };
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // Keep the selection for this visit when persistence is unavailable.
    }

    if (!document.startViewTransition || window.matchMedia("(prefers-reduced-motion: reduce)").matches || root.dataset.theme === resolved) {
      apply();
      return;
    }

    const x = origin?.x ?? window.innerWidth / 2;
    const y = origin?.y ?? 40;
    root.style.setProperty("--theme-reveal-x", `${x}px`);
    root.style.setProperty("--theme-reveal-y", `${y}px`);
    root.style.setProperty("--theme-reveal-radius", `${Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y))}px`);
    root.dataset.themeTransition = "true";
    const transition = document.startViewTransition(() => flushSync(apply));
    transitionRef.current = transition;
    // Hidden tabs and newer selections can skip the visual transition.
    void transition.ready.catch(() => {});
    void transition.finished.catch(() => {}).then(() => {
      if (transitionRef.current === transition) {
        delete root.dataset.themeTransition;
        transitionRef.current = null;
      }
    });
  }

  return <ThemeContext.Provider value={{ preference, resolvedTheme, setPreference: chooseTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const theme = useContext(ThemeContext);
  if (!theme) throw new Error("useTheme must be used within ThemeProvider");
  return theme;
}
