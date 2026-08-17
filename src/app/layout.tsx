import type { Metadata } from "next";
import AppChrome from "@/components/layout/AppChrome";
import "./globals.css";

export const metadata: Metadata = {
  title: "iSkole.online",
  description: "Learn. Practice. Connect.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AppChrome>{children}</AppChrome>
      </body>
    </html>
  );
}