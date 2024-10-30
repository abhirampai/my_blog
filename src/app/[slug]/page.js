import { getBlogData } from "@/lib/blogs";

import Blog from "../page/Blog";
import { blogs } from "../page/constants";

export async function generateStaticParams() {
  return blogs.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }, parent) {
  const { slug } = await params;
  const blog = blogs.find((blog) => blog.slug === slug);
  const previewImages = (await parent).openGraph?.images || [];

  return {
    title: blog.name,
    description: blog.summary,
    keywords: blog.keywords,
    openGraph: {
      images: [blog.thumbnail, ...previewImages],
    },
  };
}

export default async function page({ params }) {
  const { slug } = await params;

  if (slug) {
    const blogData = await getBlogData(slug);

    return <Blog {...blogData} />;
  }
}
