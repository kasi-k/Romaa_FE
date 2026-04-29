import { Sun } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { TbMoonStars } from "react-icons/tb";

const ThemeToggle = () => {
  const { isDark, setIsDark } = useTheme();

  return (
    <button
      onClick={() => setIsDark((prev) => !prev)}
      className="p-2 w-9 h-9 rounded-full dark:bg-overall_bg-dark bg-light-blue transition"
    >
      {isDark ? (
        <TbMoonStars className="h-5 w-5 dark:text-white text-darkest-blue" />
      ) : (
        <Sun className="h-5 w-5  dark:text-white text-darkest-blue" />
      )}
    </button>
  );
};

export default ThemeToggle;
