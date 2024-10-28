import Link from "next/link";

const BlogPreview = ({ publishedDate, name, summary, slug }) => {
  return (
    <Link href={`/${slug}`}>
      <div className="border rounded-lg flex flex-col shadow-sm border-blue-200 dark:border-white space-y-3 p-5 hover:shadow-md hover:cursor-pointer items-center dark:hover:shadow-gray-500">
        <p className="leading-7 [&:not(:first-child)]:mt-6 text-sm font-thin">
          {publishedDate}
        </p>
        <h2 className="scroll-m-20 pb-2 text-3xl font-semibold tracking-tight first:mt-0">
          {name}
        </h2>
        <p className="leading-7 [&:not(:first-child)]:mt-6 self-center">
          {summary}
        </p>
      </div>
    </Link>
  );
};

export default BlogPreview;
