import Image from "next/image";
import { Avatar } from "./ui/avatar";

import Link from "next/link";

const Header = () => {
  return (
    <div className="w-full">
      <div className="flex flex-col items-center space-y-2 mt-2 lg:mt-0">
        <Avatar className="w-16 h-16">
          <Image
            src="/abhirampai.jpeg"
            alt="@abhirampai"
            width={100}
            height={100}
            className="h-full w-fullrounded-full"
            priority
          />
        </Avatar>
        <h4 className="scroll-m-20 text-lg font-thin text-gray-700 dark:text-gray-500">
          Abhiram R Pai
        </h4>
        <p className="leading-7 font-extralight">
          Software Engineer @{" "}
          <Link
            className="underline"
            href="https://www.bigbinary.com"
            target="_blank"
            rel="no_referrer"
          >
            BigBinary
          </Link>
        </p>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          Grab the {""}
          <Link
            href="/feed.xml"
            target="_blank"
            rel="no_referrer"
            className="underline"
          >
            Rss feed
          </Link>{" "}
          here
        </span>
      </div>
    </div>
  );
};

export default Header;
