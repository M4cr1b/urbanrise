"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { isThemePreference } from "@/lib/theme";
import { useTheme } from "./ThemeProvider";

export function ThemeSelect() {
  const { preference, setPreference } = useTheme();
  const Icon = preference === "system" ? Monitor : preference === "dark" ? Moon : Sun;

  return (
    <label title={`Appearance: ${preference}`} className="relative flex min-h-11 min-w-11 shrink-0 items-center justify-center gap-1.5 rounded-full border border-current/20 px-2.5 hover:bg-current/5 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-current">
      <Icon className="pointer-events-none size-4" aria-hidden />
      <span className="sr-only">Appearance</span>
      <select
        value={preference}
        onChange={(event) => {
          if (isThemePreference(event.target.value)) setPreference(event.target.value);
        }}
        className="absolute inset-0 min-h-11 w-full cursor-pointer bg-transparent text-xs font-medium opacity-0 sm:static sm:w-[4.5rem] sm:opacity-100"
      >
        <option value="system" className="bg-surface text-on-surface">System</option>
        <option value="light" className="bg-surface text-on-surface">Light</option>
        <option value="dark" className="bg-surface text-on-surface">Dark</option>
      </select>
    </label>
  );
}
