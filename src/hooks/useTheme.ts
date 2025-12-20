import { useEffect, useState } from "react";
import { apiService } from "../services/api.service";

type Theme = "light" | "dark";

export function useTheme(
  user?: { theme?: "light" | "dark" } | null,
  isAuthenticated: boolean = false
) {
  const [theme, setTheme] = useState<Theme>(() => {
    // Priority: 1. User pref (handled in effect) 2. Local Storage 3. System
    const stored = localStorage.getItem("theme");
    if (stored === "light" || stored === "dark") return stored;
    if (window.matchMedia("(prefers-color-scheme: light)").matches)
      return "dark";
    return "light";
  });

  // Sync with user preference from DB when authenticated
  useEffect(() => {
    if (isAuthenticated && user?.theme) {
      setTheme(user.theme);
    }
  }, [isAuthenticated, user?.theme]);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = async () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme); // Optimistic update

    if (isAuthenticated) {
      try {
        await apiService.updateProfile({ theme: newTheme });
      } catch (error) {
        console.error("Failed to persist theme preference:", error);
        // Optionally revert on failure, but likely not critical
      }
    }
  };

  return { theme, toggleTheme };
}
