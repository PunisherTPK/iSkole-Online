import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "iSkole — Learn. Practice. Succeed.",
    template: "%s | iSkole",
  },
  description:
    "iSkole is an online learning platform for students to learn, practice, and achieve their academic goals.",
  icons: {
    icon: "/iskole_logo_i.png",
    shortcut: "/iskole_logo_i.png",
    apple: "/iskole_logo_i.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body><div className="site-background" aria-hidden="true"><div className="site-background-pattern"><span className="symbol symbol-a">π</span><span className="symbol symbol-b">∑</span><span className="symbol symbol-c">E=mc²</span><span className="symbol symbol-d">λ</span><span className="symbol symbol-e">∫</span><span className="symbol symbol-f">F=ma</span><span className="symbol symbol-g">∞</span></div></div><div className="site-content">{children}</div></body>
    </html>
  );
}