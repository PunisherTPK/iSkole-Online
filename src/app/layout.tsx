import type { Metadata } from "next";
import { Inter } from "next/font/google";
import type { ReactNode } from "react";
import { ConfirmForms } from "@/components/admin/ConfirmForms";
import { Footer } from "@/components/layout/Footer";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import { Topbar } from "@/components/layout/Topbar";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://iskole.online";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "iSkole Online - Topical Questions and Discussion Videos",
    template: "%s | iSkole Online",
  },
  description: "Learn through structured curriculums, topical MCQs, discussion videos, and teacher profiles.",
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
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} min-h-screen font-sans antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <Topbar />
          <ConfirmForms />
          <main>{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
