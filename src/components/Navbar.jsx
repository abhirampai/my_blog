"use client";

import { useState } from "react";
import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";
import {
  GitHubLogoIcon,
  LinkedInLogoIcon,
  TwitterLogoIcon,
} from "@radix-ui/react-icons";
import { Button } from "./ui/button";
import { SearchBar } from "./SearchBar";

const Navbar = () => {
  const [openDialog, setOpenDialog] = useState(false);

  return (
    <>
      <Button
        variant="secondary"
        className="flex items-center justify-between w-1/2 md:w-48 bg-muted"
        onClick={() => setOpenDialog(true)}
      >
        Search blogs...
        <p className="text-sm text-muted-foreground hidden lg:block">
          <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
            <span className="text-xs">⌘</span>K
          </kbd>
        </p>
      </Button>
      <SearchBar open={openDialog} setOpen={setOpenDialog} />
      <div className="flex items-center text-white lg:text-inherit">
        <Button variant="ghost" asChild>
          <Link
            href="https://github.com/abhirampai"
            target="_blank"
            rel="noreferrer"
          >
            <GitHubLogoIcon />
            <span className="sr-only">Github</span>
          </Link>
        </Button>
        <Button variant="ghost" asChild>
          <Link
            href="https://x.com/pai_abhiram"
            target="_blank"
            rel="noreferrer"
          >
            <TwitterLogoIcon />
            <span className="sr-only">Twitter</span>
          </Link>
        </Button>
        <Button variant="ghost" asChild>
          <Link
            href="https://linkedin.com/in/abhirampai"
            target="_blank"
            rel="noreferrer"
          >
            <LinkedInLogoIcon />
            <span className="sr-only">LinkedIn</span>
          </Link>
        </Button>
        <ThemeToggle />
      </div>
    </>
  );
};

export default Navbar;
