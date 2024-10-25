"use client";

import MDEditor from "@uiw/react-md-editor";
import rehypeSanitize from "rehype-sanitize";
import Header from "./Header";
import { Badge } from "@/components/ui/badge";

const Blog = ({ readingTimeText, publishedDate, name, blogContent }) => {
  return (
    <>
      <Header />
      <div className="w-1/2 mx-auto flex flex-col space-y-4 items-center">
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
            }}
          />
        </div>
      </div>
    </>
  );
};

export default Blog;
