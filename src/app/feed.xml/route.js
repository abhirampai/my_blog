import Rss from "rss";

import { blogs } from "../page/constants";

const siteUrl = process.env.SITE_URL;

const feedOptions = {
  title: "Abhiram Pai",
  description: "Blogs by Abhiram Pai",
  feed_url: `${siteUrl}/rss.xml`,
  site_url: siteUrl,
  image_url: `${siteUrl}/icon.png`,
  pubDate: new Date(),
  copyright: `All rights reserved ${new Date().getFullYear()}`,
};

const feed = new Rss(feedOptions);

blogs.map((blog) => {
  feed.item({
    title: blog.name,
    description: blog.summary,
    url: `${siteUrl}/${blog.slug}`,
    date: blog.publishedDate,
  });
});

export async function GET() {
  return new Response(feed.xml({ indent: true }), {
    headers: {
      "Content-Type": "application/atom+xml; charset=utf-8",
    },
  });
}
