"use client";

import MarkdownPreview from "@uiw/react-markdown-preview";
import rehypeSanitize from "rehype-sanitize";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import remarkDirectiveRehype from "remark-directive-rehype";
import remarkDirective from "remark-directive";
import { IMAGE_BLUR_DATA_URL } from "./constants";

const Blog = ({ readingTimeText, publishedDate, name, blogContent }) => {
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
        <div className="pb-4 w-full">
          <MarkdownPreview
            style={{ backgroundColor: "transparent" }}
            source={blogContent}
            rehypePlugins={[
              rehypeSanitize,
              remarkDirectiveRehype,
              remarkDirective,
            ]}
            components={{
              img: ({ src, alt, title }) => {
                return (
                  <span className="flex flex-col items-center p-2 border">
                    <Image
                      src={src}
                      alt={alt}
                      title={title}
                      width={500}
                      height={250}
                      className="w-full h-full"
                      placeholder="blur"
                      blurDataURL={IMAGE_BLUR_DATA_URL}
                    />
                    <span className="text-center text-sm text-muted-foreground dark:text-muted">
                      {alt}
                    </span>
                  </span>
                );
              },
            }}
          />
        </div>
      </div>
    </>
  );
};

export default Blog;
