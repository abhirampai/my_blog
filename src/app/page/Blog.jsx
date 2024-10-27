"use client";

import MDEditor from "@uiw/react-md-editor";
import rehypeSanitize from "rehype-sanitize";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";

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
          <MDEditor.Markdown
            style={{ backgroundColor: "transparent" }}
            source={blogContent}
            previewOptions={{
              rehypePlugins: [[rehypeSanitize]],
              components: {
                img: ({src, alt}) => (
                  <Image
                    src={src}
                    alt={alt}
                    width={500}
                    height={500}
                  />
                ),
              },
            }}
          />
        </div>
      </div>
    </>
  );
};

export default Blog;
