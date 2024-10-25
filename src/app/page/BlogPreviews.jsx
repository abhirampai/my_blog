import { blogs } from "./constants";
import BlogPreview from "./BlogPreview";
import { sortBlogsByPublishedDates } from "@/lib/utils";

const BlogPreviews = () => {
  return (
    <div className="w-4/5 md:w-1/2 mx-auto flex flex-col space-y-6 pb-5">
      {sortBlogsByPublishedDates(blogs).map((blog) => (
        <BlogPreview key={blog.slug} {...blog} />
      ))}
    </div>
  );
};

export default BlogPreviews;
