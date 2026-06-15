import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://iskole.online";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "iSkole Online - Sri Lankan Past Papers and Question Bank",
    template: "%s | iSkole Online",
  },
  description: "Search Sri Lankan school past papers, lessons, questions, answers, and explanations by grade and subject.",
  openGraph: {
    type: "website",
    siteName: "iSkole Online",
    title: "iSkole Online",
    description: "Learn Every Lesson, One Question at a Time",
    url: siteUrl,
  },
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body className="min-h-screen font-sans antialiased">
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
