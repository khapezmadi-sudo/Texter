import { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark" | "blue" | "green" | "purple";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    const saved = localStorage.getItem("theme") as Theme;
    return saved || "light";
  });

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove(
      "light",
      "dark",
      "theme-blue",
      "theme-green",
      "theme-purple",
    );

    if (theme === "dark") {
      root.classList.add("dark");
    } else if (theme === "blue") {
      root.classList.add("theme-blue");
    } else if (theme === "green") {
      root.classList.add("theme-green");
    } else if (theme === "purple") {
      root.classList.add("theme-purple");
    } else {
      root.classList.add("light");
    }

    localStorage.setItem("theme", theme);
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
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
