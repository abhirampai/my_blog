import fs from "fs";
import { join } from "path";

import Blog from "../page/Blog";
import { blogs } from "../page/constants";
import { getReadingTime } from "@/lib/utils";
import pluralize from "pluralize";

export async function generateStaticParams() {
  return blogs.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }, parent) {
  const { slug } = await params;
  const blog = blogs.find((blog) => blog.slug === slug);
  const previewImages = (await parent).openGraph?.images ||[]
  
  return {
    title: blog.name,
    description: blog.summary,
    keywords: blog.keywords,
    openGraph: {
      images: [blog.thumbnail, ...previewImages],
    },
  };
}

const getBlogData = async (slug) => {
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

export default async function page({ params }) {
  const { slug } = await params;

  if (slug) {
    const blogData = await getBlogData(slug);

    return <Blog {...blogData} />;
  }
}
