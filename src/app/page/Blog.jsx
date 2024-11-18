"use client";

import MarkdownPreview from "@uiw/react-markdown-preview";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import remarkDirectiveRehype from "remark-directive-rehype";
import remarkDirective from "remark-directive";
import { IMAGE_BLUR_DATA_URL } from "./constants";
import Link from "next/link";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

const Blog = ({ readingTimeText, publishedDate, name, blogContent }) => {
  const [mounted, setMounted] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);
  return (
    <>
      <div className="flex flex-col space-y-4 items-center">
        <p className="leading-7 [&:not(:first-child)]:mt-6 text-sm font-thin">
          {publishedDate}
        </p>
        <h2 className="scroll-m-20 text-3xl font-semibold tracking-tight first:mt-0">
          {name}
        </h2>
        <Badge variant="outline">{readingTimeText} read</Badge>
        {mounted ? (
          <div className="pb-4 w-full" data-color-mode={theme}>
            <MarkdownPreview
              className="!font-mono"
              style={{ backgroundColor: "transparent" }}
              source={blogContent}
              rehypePlugins={[
                [
                  rehypeSanitize,
                  {
                    ...defaultSchema,
                    attributes: {
                      ...defaultSchema.attributes,
                      svg: [
                        "className",
                        "hidden",
                        "viewBox",
                        "fill",
                        "height",
                        "width",
                      ],
                      path: ["fill-rule", "d"],
                      div: [
                        "className",
                        "class",
                        "data-code",
                        ...(defaultSchema.attributes?.div || []),
                      ],
                    },
                    tagNames: [
                      ...(defaultSchema.tagNames || []),
                      "svg",
                      "path",
                      "div",
                    ],
                  },
                ],
                remarkDirectiveRehype,
                remarkDirective,
              ]}
              components={{
                h1: ({ children }) => {
                  return (
                    <h1 className="scroll-m-20 text-4xl font-semibold tracking-tight first:mt-0">
                      {children[children.length - 1]}
                    </h1>
                  )
                },
                h2: ({ children }) => {
                  return (
                    <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight first:mt-0">
                      {children[children.length - 1]}
                    </h2>
                  );
                },
                h3: ({ children }) => {
                  return (
                    <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight first:mt-0">
                      {children[children.length - 1]}
                    </h3>
                  );
                },
                a: ({ children, href }) => {
                  return (
                    <Link
                      href={href}
                      target="_blank"
                      rel="no-referrer"
                      aria-label={href}
                    >
                      {children}
                    </Link>
                  );
                },
                img: ({ src, alt, title }) => {
                  return (
                    <span className="flex flex-col items-center p-2 space-y-2 shadow-sm rounded-md dark:bg-[#161b22] bg-gray-100">
                      <Image
                        src={src}
                        alt={alt}
                        title={title}
                        width={500}
                        height={250}
                        className="w-full h-full rounded-md"
                        placeholder="blur"
                        blurDataURL={IMAGE_BLUR_DATA_URL}
                        loading="lazy"
                      />
                      <span className="text-center text-sm text-black dark:text-white">
                        {title}
                      </span>
                    </span>
                  );
                },
              }}
            />
          </div>
        ) : (
          <>
            <Skeleton className="w-full h-4" />
            <Skeleton className="w-full h-4" />
            <Skeleton className="w-full h-[250px]" />
            <Skeleton className="w-full h-4" />
            <Skeleton className="w-full h-4" />
          </>
        )}
      </div>
    </>
  );
};

export default Blog;
