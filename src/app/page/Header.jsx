import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

import Link from "next/link";

const Header = () => {
  return (
    <div className="w-full">
      <div className="flex flex-col mt-10 items-center space-y-2">
        <Avatar className="w-16 h-16">
          <AvatarImage
            src="https://github.com/abhirampai.png"
            alt="@abhirampai"
          />
          <AvatarFallback>AP</AvatarFallback>
        </Avatar>
        <h4 className="scroll-m-20 text-lg font-thin text-gray-600">
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
      <Separator className="my-4 w-1/2 mx-auto" />
    </div>
  );
};

export default Header;
