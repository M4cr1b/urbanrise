"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { isThemePreference, THEME_STORAGE_KEY, type ThemePreference } from "@/lib/theme";

const ThemeContext = createContext<{
  preference: ThemePreference;
  setPreference: (preference: ThemePreference) => void;
} | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [preference, setPreference] = useState<ThemePreference>("system");
  const [ready, setReady] = useState(false);

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
      document.documentElement.dataset.theme = preference === "system"
        ? (media.matches ? "dark" : "light")
        : preference;
    };
    apply();
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, [preference, ready]);

  function chooseTheme(next: ThemePreference) {
    setPreference(next);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // Keep the selection for this visit when persistence is unavailable.
    }
  }

  return <ThemeContext.Provider value={{ preference, setPreference: chooseTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const theme = useContext(ThemeContext);
  if (!theme) throw new Error("useTheme must be used within ThemeProvider");
  return theme;
}
