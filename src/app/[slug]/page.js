import fs from "fs";
import { join } from "path";

import Blog from "../page/Blog";
import { blogs } from "../page/constants";

export async function generateStaticParams() {
  return blogs.map((post) => ({
    slug: post.slug,
  }));
}

export default async function page({ params }) {
  const { slug } = await params;

  if (slug) {
    const blog = blogs.find((blog) => blog.slug === slug);
    const postFilePath = join(`${process.cwd()}/src/_blogs`, `${slug}.md`);
    const blogContent = fs.readFileSync(postFilePath, { encoding: "utf8" });

    return (
      <>
        <Blog
          publishedDate={blog.publishedDate}
          name={blog.name}
          blogContent={blogContent}
        />
      </>
    );
  }
}
