"use client";

import { useTheme } from "next-themes";
import { Button } from "./ui/button";
import { MoonIcon, SunIcon } from "@radix-ui/react-icons";

export const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();

  return theme === "dark" ? (
    <Button onClick={() => setTheme("light")} variant="ghost">
      <MoonIcon />
    </Button>
  ) : (
    <Button onClick={() => setTheme("dark")} variant="ghost">
      <SunIcon />
    </Button>
  );
};
