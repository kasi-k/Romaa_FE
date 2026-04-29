// src/context/ThemeContext.jsx
import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext();

// Helper to calculate black/white text automatically
const getContrastColor = (hex) => {
  if (!hex) return '#ffffff';
  const r = parseInt(hex.substring(1, 3), 16);
  const g = parseInt(hex.substring(3, 5), 16);
  const b = parseInt(hex.substring(5, 7), 16);
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 128 ? '#1e293b' : '#ffffff';
};

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(false);
  
  const [brandColor, setBrandColor] = useState(() => {
    return localStorage.getItem("romaa_brand_color") || "#0f2a47";
  });

  // Dark Mode Logic
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      setIsDark(true);
      document.documentElement.classList.add("dark");
    } else {
      setIsDark(false);
      document.documentElement.classList.remove("dark");
    }
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDark]);

  // Brand Color Logic (Generates TWO variables now)
  useEffect(() => {
    localStorage.setItem("romaa_brand_color", brandColor);
    document.documentElement.style.setProperty("--brand-color", brandColor);
    document.documentElement.style.setProperty("--brand-contrast", getContrastColor(brandColor));
  }, [brandColor]);

  return (
    <ThemeContext.Provider value={{ isDark, setIsDark, brandColor, setBrandColor }}>
      {children}
    </ThemeContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useTheme = () => useContext(ThemeContext);