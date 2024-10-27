import localFont from "next/font/local";
import { ThemeProvider } from "next-themes";

import "./globals.css";
import Header from "@/components/header";
import { Separator } from "@/components/ui/separator";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata = {
  title: "Abhiram Pai",
  description: "Blogs by Abhiram Pai",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased w-4/5 md:w-1/2 mx-auto flex flex-col space-y-6 pb-5`}
      >
        <Header />
        <Separator className="my-4 mx-auto" />
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
