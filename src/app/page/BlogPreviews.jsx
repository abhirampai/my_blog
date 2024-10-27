import { blogs } from "./constants";
import BlogPreview from "./BlogPreview";
import { sortBlogsByPublishedDates } from "@/lib/utils";

const BlogPreviews = () => {
  return sortBlogsByPublishedDates(blogs).map((blog) => (
    <BlogPreview key={blog.slug} {...blog} />
  ));
};

export default BlogPreviews;
