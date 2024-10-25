import { blogs } from "./constants";
import BlogPreview from "./BlogPreview";

const BlogPreviews = () => {
  return (
    <div className="w-1/2 mx-auto flex flex-col space-y-6 pb-5">
      {blogs
        .sort((a, b) => new Date(b.publishedDate) - new Date(a.publishedDate))
        .map((blog) => (
          <BlogPreview key={blog.slug} {...blog} />
        ))}
    </div>
  );
};

export default BlogPreviews;
