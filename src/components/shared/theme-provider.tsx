"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type Theme = "dark" | "light";
type ThemeContextValue = { theme: Theme; setTheme: (theme: string) => void };
const ThemeContext = createContext<ThemeContextValue | null>(null);
const STORAGE_KEY = "nexora-theme";

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeValue] = useState<Theme>("dark");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let initial: Theme = "dark";
    try { if (localStorage.getItem(STORAGE_KEY) === "light") initial = "light"; }
    catch { /* Dark is the default when browser storage is unavailable. */ }
    setThemeValue(initial);
    document.documentElement.classList.toggle("light", initial === "light");
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    document.documentElement.classList.toggle("light", theme === "light");
    try { localStorage.setItem(STORAGE_KEY, theme); }
    catch { /* Theme still applies for this session without persistent storage. */ }
  }, [theme, ready]);

  function setTheme(next: string) { setThemeValue(next === "light" ? "light" : "dark"); }
  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within ThemeProvider");
  return context;
}
