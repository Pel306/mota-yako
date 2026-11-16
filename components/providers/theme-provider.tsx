"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface ThemeContextType {
  isDarkMode: boolean;
  setIsDarkMode: (dark: boolean) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [isDarkMode, setIsDarkMode] = useState(false); // Default light for SSR
  const [mounted, setMounted] = useState(false);

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("zimpost-theme");
    if (saved !== null) {
      setIsDarkMode(saved === "dark");
    } else {
      // Fall back to system preference
      setIsDarkMode(window.matchMedia("(prefers-color-scheme: dark)").matches);
    }
  }, []);

  // Apply theme class to document and save to localStorage
  useEffect(() => {
    if (!mounted) return;

    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("zimpost-theme", isDarkMode ? "dark" : "light");
  }, [isDarkMode, mounted]);

  // Listen for system theme changes (if no saved preference)
  useEffect(() => {
    const saved = localStorage.getItem("zimpost-theme");
    if (saved !== null) return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e: MediaQueryListEvent) => {
      setIsDarkMode(e.matches);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  return (
    <ThemeContext.Provider value={{ isDarkMode, setIsDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
