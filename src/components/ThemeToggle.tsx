"use client";

import { useTheme } from "@/providers/ThemeProvider";
import { Moon, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  const cycleTheme = () => {
    if (theme === "dark") {
      toggleTheme("black-and-white");
    } else if (theme === "black-and-white") {
      toggleTheme("dark");
    } else {
      toggleTheme("dark");
    }
    // if (theme === "light") {
    //   toggleTheme("dark");
    // } else if (theme === "dark") {
    //   toggleTheme("black-and-white");
    // } else {
    //   toggleTheme("light");
    // }
  };

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="text-white"
        onClick={cycleTheme}
        aria-label="Toggle theme"
      >
        {theme === "black-and-white" ? (
          <span className="h-5 w-5 text-xs font-bold">BN</span> // Скорочено від "Black & White"
        ) : (
          <>
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </>
        )}
      </Button>
    </>
  );
}
