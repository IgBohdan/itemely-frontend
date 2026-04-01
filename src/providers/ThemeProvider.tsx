"use client";

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

interface ThemeContextType {
  theme: "light" | "dark" | "black-and-white";
  toggleTheme: (theme: "light" | "dark" | "black-and-white") => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<"light" | "dark" | "black-and-white">(
    "light"
  );

  useEffect(() => {
    // Перевіряємо збережену тему в localStorage
    const savedTheme = localStorage.getItem("theme") as
      | "light"
      | "dark"
      | "black-and-white"
      | null;
    if (savedTheme) {
      setTheme(savedTheme);
    } else {
      // Визначаємо тему на основі системних налаштувань
      const systemPrefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      setTheme(systemPrefersDark ? "dark" : "light");
    }
  }, []);

  useEffect(() => {
    // Застосовуємо тему до документа
    document.documentElement.className = theme;

    // Зберігаємо вибрану тему
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = (newTheme: "light" | "dark" | "black-and-white") => {
    setTheme(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
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
