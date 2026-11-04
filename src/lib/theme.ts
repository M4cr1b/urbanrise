export type ThemePreference = "system" | "light" | "dark";

export const THEME_STORAGE_KEY = "urbanrise-theme";

export function isThemePreference(value: unknown): value is ThemePreference {
  return value === "system" || value === "light" || value === "dark";
}

// Run in the head before the page paints, so a saved dark theme never flashes light.
export const THEME_INIT_SCRIPT = `(() => {
  let preference = "system";
  try {
    const saved = localStorage.getItem("${THEME_STORAGE_KEY}");
    if (saved === "light" || saved === "dark") preference = saved;
  } catch {}
  document.documentElement.dataset.theme = preference === "system"
    ? (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
    : preference;
})();`;
