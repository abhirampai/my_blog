import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

import Link from "next/link";

const Header = () => {
  return (
    <div className="w-full">
      <div className="flex flex-col items-center space-y-2">
        <Avatar className="w-16 h-16">
          <AvatarImage
            src="https://github.com/abhirampai.png"
            alt="@abhirampai"
          />
          <AvatarFallback>AP</AvatarFallback>
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
      </div>
    </div>
  );
};

export default Header;
