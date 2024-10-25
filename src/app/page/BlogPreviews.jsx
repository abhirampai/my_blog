import { blogs } from "./constants";
import BlogPreview from "./BlogPreview";

const BlogPreviews = () => {
  return (
    <div className="w-1/2 mx-auto">
      {blogs.map((blog) => (
        <BlogPreview key={blog.slug} {...blog} />
      ))}
    </div>
  );
};

export default BlogPreviews;
