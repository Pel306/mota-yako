"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useSyncExternalStore,
  type ReactNode,
} from "react";

interface ThemeContextType {
  isDarkMode: boolean;
  setIsDarkMode: (dark: boolean) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const themeStorageKey = "zimpost-theme";
const colorSchemeQuery = "(prefers-color-scheme: dark)";
const themeListeners = new Set<() => void>();

function subscribeToThemeChanges(callback: () => void) {
  const mediaQuery = window.matchMedia(colorSchemeQuery);
  themeListeners.add(callback);
  mediaQuery.addEventListener("change", callback);
  window.addEventListener("storage", callback);

  return () => {
    themeListeners.delete(callback);
    mediaQuery.removeEventListener("change", callback);
    window.removeEventListener("storage", callback);
  };
}

function getThemeSnapshot() {
  const savedTheme = localStorage.getItem(themeStorageKey);
  return savedTheme === null
    ? window.matchMedia(colorSchemeQuery).matches
    : savedTheme === "dark";
}

function getServerThemeSnapshot() {
  return false;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const isDarkMode = useSyncExternalStore(
    subscribeToThemeChanges,
    getThemeSnapshot,
    getServerThemeSnapshot,
  );
  const setIsDarkMode = useCallback((dark: boolean) => {
    localStorage.setItem(themeStorageKey, dark ? "dark" : "light");
    themeListeners.forEach((listener) => listener());
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [isDarkMode]);

  const toggleTheme = useCallback(() => {
    setIsDarkMode(!isDarkMode);
  }, [isDarkMode, setIsDarkMode]);

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
