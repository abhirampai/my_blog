import { blogs } from "./page/constants";

export default function sitemap() {
  return [
    {
      url: 'https://abhirampai.com',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    ...blogs.map((blog) => ({
      url: `https://abhirampai.com/${blog.slug}`,
      lastModified: new Date(blog.publishedDate),
      changeFrequency: 'monthly',
      priority: 0.8,
    })),
  ]
}