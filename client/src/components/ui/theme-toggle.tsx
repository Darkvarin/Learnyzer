import { useTheme } from "@/components/ui/theme-provider";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="text-gray-400 hover:text-white transition-colors"
    >
      {theme === "dark" ? (
        <i className="ri-sun-line text-xl" />
      ) : (
        <i className="ri-moon-fill text-xl" />
      )}
    </Button>
  );
}
