"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import Footer from "./Footer";

export default function AppChrome({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const hideChrome = pathname === "/";

  return (
    <>
      {!hideChrome && <Navbar />}
      <main className="site-main">{children}</main>
      {!hideChrome && <Footer />}
    </>
  );
}
