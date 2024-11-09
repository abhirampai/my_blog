import { getBlogData } from "@/lib/blogs";

import Blog from "../page/Blog";
import { blogs } from "../page/constants";
import Pagination from "../page/Pagination";

export async function generateStaticParams() {
  return blogs.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const blog = blogs.find((blog) => blog.slug === slug);
  const ogImageUrl = `/api/og?title=${encodeURIComponent(blog.name)}&keywords=${encodeURIComponent(blog.keywords)}`;

  return {
    title: blog.name,
    description: blog.summary,
    keywords: blog.keywords,
    openGraph: {
      images: [ogImageUrl],
    },
  };
}

export default async function page({ params }) {
  const { slug } = await params;

  if (slug) {
    const blogData = await getBlogData(slug);

    return (
      <>
      <Pagination slug={slug} />
      <Blog {...blogData} />
      </>
    )
  }
}
