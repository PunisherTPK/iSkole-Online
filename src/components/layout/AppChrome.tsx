"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import Footer from "./Footer";

type UserInfo = { email: string; name: string; role: string };

export default function AppChrome({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [user, setUser] = useState<UserInfo | null>(null);
  const hideChrome = pathname === "/";

  useEffect(() => {
    if (hideChrome) return;
    let cancelled = false;
    fetch("/api/auth/me", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled) setUser(data?.user ?? null);
      })
      .catch(() => {
        if (!cancelled) setUser(null);
      });
    return () => {
      cancelled = true;
    };
  }, [hideChrome]);

  return (
    <>
      {!hideChrome && <Navbar user={user} />}
      <main className="site-main">{children}</main>
      {!hideChrome && <Footer />}
    </>
  );
}
