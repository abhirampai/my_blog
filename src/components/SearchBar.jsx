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
import { FileIcon } from "@radix-ui/react-icons";
import { sortBlogsByPublishedDates } from "@/lib/utils";

export const SearchBar = ({ open, setOpen }) => {
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
              <Link href={`/${blog.slug}`} onClick={() => setOpen(false)} className="w-full">
                <div className="flex items-center gap-2">
                  <FileIcon />
                  <span>{blog.name}</span>
                </div>
              </Link>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
};
