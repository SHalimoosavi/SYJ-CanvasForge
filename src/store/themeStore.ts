import { create } from "zustand";
import type { Theme } from "@/types";

const STORAGE_KEY = "syj-canvasforge:theme";

function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "light";
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === "light" || stored === "dark") return stored;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyThemeToDocument(theme: Theme): void {
  if (typeof document === "undefined") return;
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
}

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

export const useThemeStore = create<ThemeState>((set, get) => {
  const initial = getInitialTheme();
  applyThemeToDocument(initial);

  return {
    theme: initial,
    setTheme: (theme) => {
      window.localStorage.setItem(STORAGE_KEY, theme);
      applyThemeToDocument(theme);
      set({ theme });
    },
    toggleTheme: () => {
      const next: Theme = get().theme === "light" ? "dark" : "light";
      get().setTheme(next);
    },
  };
});
