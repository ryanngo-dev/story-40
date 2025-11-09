import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { QueryProvider } from "@/components/query-provider";
import { FeedbackWidget } from "@/components/feedback-widget";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Story40",
  description: "Write a daily story using three random words",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col bg-stone-100 dark:bg-gray-950`}
      >
        <QueryProvider>
          <Navbar />
          {children}
          <footer className="mt-auto py-6 text-center text-sm text-stone-600 dark:text-gray-400">
            Created by{" "}
            <a
              href="https://ryanngo.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-stone-900 dark:hover:text-gray-100 transition-colors"
            >
              Ryan Ngo
            </a>
          </footer>
          <FeedbackWidget />
        </QueryProvider>
      </body>
    </html>
  );
}
