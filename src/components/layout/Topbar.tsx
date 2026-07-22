"use client";

import { Menu } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { SearchBar } from "@/components/ui/custom/SearchBar";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

export function Topbar() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const updateVisibility = () => setVisible(window.scrollY > 120);
    updateVisibility();
    window.addEventListener("scroll", updateVisibility, { passive: true });
    return () => window.removeEventListener("scroll", updateVisibility);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 z-40 w-full border-b border-border/70 bg-background/70 shadow-brand backdrop-blur-xl transition-all duration-300",
        visible ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-4 opacity-0",
      )}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link href="/" className="flex shrink-0 items-center gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-lg" aria-label="iSkole Online home">
          <Image src="/iskole-logo.png" alt="iSkole Online" width={40} height={40} className="h-10 w-auto" priority />
          <span className="hidden sm:block">
            <span className="block text-base font-bold text-foreground">iSkole Online</span>
            <span className="block text-xs text-muted-foreground">Learn Every Lesson, One Question at a Time</span>
          </span>
        </Link>

        <div className="hidden flex-1 justify-center lg:flex lg:max-w-md">
          <SearchBar compact />
        </div>

        <nav className="flex items-center gap-2">
          <ThemeToggle />
          <Button variant="ghost" asChild className="hidden sm:inline-flex">
            <Link href="/admin">Login</Link>
          </Button>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="lg:hidden" aria-label="Open menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:max-w-sm">
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              <div className="mt-6 grid gap-6">
                <SearchBar compact />
                <Link className="text-base font-semibold text-foreground hover:text-primary" href="/admin">
                  Login
                </Link>
                <Link className="text-base font-semibold text-foreground hover:text-primary" href="/search">
                  Search
                </Link>
              </div>
            </SheetContent>
          </Sheet>
        </nav>
      </div>
    </header>
  );
}
