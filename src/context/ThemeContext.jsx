import React, { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("nqp_theme") || "dark";
  });

  const [accent, setAccent] = useState(() => {
    return localStorage.getItem("nqp_accent") || "emerald";
  });

  const [arabicFontSize, setArabicFontSize] = useState(() => {
    return parseInt(localStorage.getItem("nqp_arabic_size") || "28", 10);
  });

  // Apply theme class to <html>
  useEffect(() => {
    const root = document.documentElement;
    const isDark =
      theme === "dark" ||
      (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);

    if (isDark) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("nqp_theme", theme);
  }, [theme]);

  // Apply accent class to <html>
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("theme-emerald", "theme-gold", "theme-blue", "theme-purple");
    if (accent !== "emerald") {
      root.classList.add(`theme-${accent}`);
    }
    localStorage.setItem("nqp_accent", accent);
  }, [accent]);

  // Save font size
  useEffect(() => {
    localStorage.setItem("nqp_arabic_size", arabicFontSize.toString());
  }, [arabicFontSize]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        toggleTheme,
        isDark: theme === "dark",
        accent,
        setAccent,
        arabicFontSize,
        setArabicFontSize
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
