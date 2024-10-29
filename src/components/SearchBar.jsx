"use client";
import { useEffect } from "react";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { blogs } from "@/app/page/constants";
import Link from "next/link";
import { FileIcon, SunIcon, MoonIcon, HomeIcon } from "@radix-ui/react-icons";
import { sortBlogsByPublishedDates } from "@/lib/utils";
import { useTheme } from "next-themes";

export const SearchBar = ({ open, setOpen }) => {
  const { setTheme } = useTheme();
  const themes = {
    light: <SunIcon />,
    dark: <MoonIcon />,
    system: <HomeIcon />,
  };

  useEffect(() => {
    const down = (event) => {
      if (event.key === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No blogs found.</CommandEmpty>
        <CommandGroup heading="Blogs">
          {sortBlogsByPublishedDates(blogs).map((blog) => (
            <CommandItem key={blog.name}>
              <Link
                href={`/${blog.slug}`}
                onClick={() => setOpen(false)}
                className="w-full"
              >
                <div className="flex items-center gap-2">
                  <FileIcon />
                  <span>{blog.name}</span>
                </div>
              </Link>
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandGroup heading="Themes">
          {Object.entries(themes).map(([theme, icon]) => (
            <CommandItem key={theme}>
              <div
                className="flex items-center gap-2 w-full cursor-pointer"
                onClick={() => {
                  setTheme(theme);
                  setOpen(false);
                }}
              >
                {icon}
                <span>{theme}</span>
              </div>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
};
