"use client";

import { useTheme } from "next-themes";
import { Button } from "./ui/button";
import { MoonIcon, SunIcon } from "@radix-ui/react-icons";
import { useEffect, useState } from "react";
import { Skeleton } from "./ui/skeleton";

export const ThemeToggle = () => {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true)
    setTheme(document.documentElement.classList.contains("dark") ? "dark" : "light");
  }, [setTheme]);

  if (!mounted) {
    return <Skeleton className="w-6 h-6 rounded-md" />;
  }

  return theme==="dark" ? (
    <Button onClick={() => setTheme("light")} variant="ghost">
      <MoonIcon />
    </Button>
  ) : (
    <Button onClick={() => setTheme("dark")} variant="ghost">
      <SunIcon />
    </Button>
  );
};
