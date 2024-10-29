import "./globals.css";
import Header from "@/components/Header";
import { Separator } from "@/components/ui/separator";
import Navbar from "@/components/Navbar";
import { ThemeProvider } from "@/components/theme-provider";
import { SpeedInsights } from "@vercel/speed-insights/next";

export const metadata = {
  title: "Abhiram Pai",
  description: "Blogs by Abhiram Pai",
  referrer: "origin-when-cross-origin",
  keywords: ["Next.js", "React", "JavaScript"],
  authors: [{ name: "Abhiram Pai" }],
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  robots: {
    index: false,
    follow: true,
    nocache: true,
    googleBot: {
      index: true,
      follow: false,
      noimageindex: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  manifest: "/manifest.json",
  category: "blog",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-mono">
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
            <Separator className="my-4 mx-auto dark:bg-white" />
            {children}
          </div>
          <SpeedInsights />
        </ThemeProvider>
      </body>
    </html>
  );
}
