import "./globals.css";
import Header from "@/components/Header";
import { Separator } from "@/components/ui/separator";
import Navbar from "@/components/Navbar";
import { ThemeProvider } from "@/components/theme-provider";

export const metadata = {
  title: "Abhiram Pai",
  description: "Blogs by Abhiram Pai",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <nav className="sticky top-0 flex items-center py-4 px-6 w-full justify-between bg-gray-900 lg:bg-transparent z-10">
            <Navbar />
          </nav>
          <div className="w-4/5 md:w-1/2 mx-auto flex flex-col [&:not(:first-child)]:space-y-6 pb-5">
            <Header />
            <Separator className="my-4 mx-auto" />
            {children}
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
