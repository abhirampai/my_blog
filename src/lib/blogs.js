import fs from "fs";
import { join } from "path";
import { blogs } from "@/app/page/constants";
import { getReadingTime } from "@/lib/utils";
import pluralize from "pluralize";

export const getBlogData = async (slug) => {
  const blog = blogs.find((blog) => blog.slug === slug);
  const postFilePath = join(`${process.cwd()}/src/_blogs`, `${slug}.md`);
  const blogContent = fs.readFileSync(postFilePath, { encoding: "utf8" });
  const readingTime = getReadingTime(blogContent);
  const readingTimeText = pluralize(`${readingTime} min`, readingTime);

  return {
    readingTimeText,
    publishedDate: blog.publishedDate,
    name: blog.name,
    blogContent,
  };
};
