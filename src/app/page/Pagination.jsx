import { blogs } from "../page/constants";
import Link from "next/link";
import { sortBlogsByPublishedDates } from "@/lib/utils";
import { ArrowLeftIcon, ArrowRightIcon, HomeIcon } from "@radix-ui/react-icons"

const Pagination = ({ slug }) => {
  const slugIndex = sortBlogsByPublishedDates(blogs)
                    .findIndex(({slug:blogSlug}) => blogSlug === slug)

  const previousBlogSlug = blogs[slugIndex + 1]?.slug
  const nextBlogSlug = blogs[slugIndex - 1]?.slug

  const HomeButton = () => (
    <Link href="/" className="flex items-center">
      Home
      <HomeIcon className="ml-2"/>
    </Link>)

  return (
    <div className="flex justify-between w-full">
    {previousBlogSlug ? (
          <Link href={previousBlogSlug} className="flex items-center">
            <ArrowLeftIcon className="mr-2"/>
            Previous blog
          </Link>
      ) : (
          <HomeButton/>
      )}
    {nextBlogSlug ? (
          <Link href={nextBlogSlug} className="flex items-center">
            Next blog
            <ArrowRightIcon className="ml-2"/>
          </Link>
      ): (
      <HomeButton/>
      )}
    </div>
  )
}

export default Pagination;
