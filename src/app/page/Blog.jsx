"use client";

import MDEditor from "@uiw/react-md-editor";
import rehypeSanitize from "rehype-sanitize";
import Header from "./Header";

const Blog = ({ publishedDate, name, blogContent }) => {
  return (
    <>
      <Header />
      <div className="w-1/2 mx-auto flex flex-col space-y-4">
        <p className="leading-7 [&:not(:first-child)]:mt-6 self-center text-sm font-thin">
          {publishedDate}
        </p>
        <h2 className="scroll-m-20 text-3xl font-semibold tracking-tight first:mt-0 self-center">
          {name}
        </h2>
        <div className="pb-4">
          <MDEditor.Markdown
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
