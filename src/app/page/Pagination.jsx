import { blogs } from "../page/constants";
import Link from "next/link";
import { sortBlogsByPublishedDates } from "@/lib/utils";

const Pagination = ({ slug }) => {
  const slugIndex = sortBlogsByPublishedDates(blogs)
                    .findIndex(({slug:blogSlug}) => blogSlug === slug)

  const previousBlogSlug = blogs[slugIndex - 1]?.slug
  const nextBlogSlug = blogs[slugIndex + 1]?.slug

  return (
    <div className="flex justify-between w-full">
    {previousBlogSlug && (
        <Link href={previousBlogSlug}>Previous blog</Link>
      )}
    {nextBlogSlug && (
        <Link href={nextBlogSlug}>Next blog</Link>
      )}
    </div>
  )
}

export default Pagination;
