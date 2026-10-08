import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "iSkole — Learn. Practice. Succeed.",
    template: "%s | iSkole",
  },
  description:
    "iSkole is an online learning platform for students to learn, practice, and achieve their academic goals.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body><div className="site-background" aria-hidden="true"><div className="site-background-pattern">π     ∑        E=mc²          λ       √x        ∫          F=ma       Δ          ∞</div></div><div className="site-content">{children}</div></body>
    </html>
  );
}