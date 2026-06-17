import type { Metadata } from "next";
import type { ReactNode } from "react";
import { ConfirmForms } from "@/components/admin/ConfirmForms";
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
  description: "Search Sri Lankan educational resources by curriculum, level, subject, and past paper.",
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
        <ConfirmForms />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
