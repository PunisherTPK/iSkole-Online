"use client";

import { Home, Menu, Search, Users, UserCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { SearchBar } from "@/components/ui/custom/SearchBar";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase";

type UserSummary = { name: string; role: string };

export function Topbar() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [user, setUser] = useState<UserSummary | null>(null);
  const isHome = pathname === "/";

  useEffect(() => {
    const updateVisibility = () => setVisible(!isHome || window.scrollY > 120);
    updateVisibility();
    window.addEventListener("scroll", updateVisibility, { passive: true });
    return () => window.removeEventListener("scroll", updateVisibility);
  }, [isHome]);

  useEffect(() => {
    let mounted = true;
    const supabase = createClient();
    const loadUser = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!mounted) return;
      if (!authUser) {
        setUser(null);
        return;
      }
      const { data: profile } = await supabase.from("profiles").select("full_name, role").eq("id", authUser.id).maybeSingle();
      if (!mounted) return;
      setUser({
        name: profile?.full_name?.trim() || authUser.email?.split("@")[0] || "Account",
        role: profile?.role || "student",
      });
    };
    void loadUser();
    const { data: listener } = supabase.auth.onAuthStateChange(() => void loadUser());
    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const initials = user?.name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase() || "";

  return (
    <header className={cn("fixed top-0 z-40 w-full border-b border-border/70 bg-background/70 shadow-brand backdrop-blur-xl transition-all duration-300", visible ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-4 opacity-0")}>
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link href="/" className="flex shrink-0 items-center gap-3 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" aria-label="iSkole Online home">
          <Image src="/iskole-logo.png" alt="iSkole Online" width={40} height={40} className="h-10 w-auto" priority />
          <span className="hidden sm:block"><span className="block text-base font-bold text-foreground">iSkole Online</span><span className="block text-xs text-muted-foreground">Learn Every Lesson, One Question at a Time</span></span>
        </Link>

        <div className="hidden flex-1 justify-center lg:flex lg:max-w-md"><SearchBar compact /></div>

        <nav className="flex items-center gap-2">
          <Button variant="ghost" asChild className="hidden sm:inline-flex"><Link href="/"><Home className="mr-2 h-4 w-4" />Home</Link></Button>
          <Button variant="ghost" asChild className="hidden sm:inline-flex"><Link href="/teachers"><Users className="mr-2 h-4 w-4" />Mentors</Link></Button>
          <Button variant="ghost" asChild className="hidden sm:inline-flex"><Link href="/search"><Search className="mr-2 h-4 w-4" />Search</Link></Button>
          <ThemeToggle />

          {user ? (
            <Link href="/profile" className="hidden items-center gap-2 rounded-xl border border-border bg-card/70 px-2.5 py-1.5 transition-colors hover:bg-muted sm:flex" aria-label="Open profile">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary">{initials}</span>
              <span className="max-w-28 truncate text-sm font-semibold text-foreground">{user.name}</span>
            </Link>
          ) : (
            <Button variant="ghost" asChild className="hidden sm:inline-flex"><Link href="/login">Login</Link></Button>
          )}

          <Sheet>
            <SheetTrigger asChild><Button variant="outline" size="icon" className="lg:hidden" aria-label="Open menu"><Menu className="h-5 w-5" /></Button></SheetTrigger>
            <SheetContent side="right" className="w-full sm:max-w-sm">
              <SheetHeader><SheetTitle>Menu</SheetTitle></SheetHeader>
              <div className="mt-6 grid gap-6">
                <SearchBar compact />
                <Link className="flex items-center gap-2 text-base font-semibold text-foreground hover:text-primary" href="/"><Home className="h-5 w-5" />Home</Link>
                <Link className="flex items-center gap-2 text-base font-semibold text-foreground hover:text-primary" href="/teachers"><Users className="h-5 w-5" />Mentors</Link>
                <Link className="flex items-center gap-2 text-base font-semibold text-foreground hover:text-primary" href="/search"><Search className="h-5 w-5" />Search</Link>
                {user ? <Link className="flex items-center gap-2 text-base font-semibold text-foreground hover:text-primary" href="/profile"><UserCircle className="h-5 w-5" />My Profile</Link> : <Link className="text-base font-semibold text-foreground hover:text-primary" href="/login">Login</Link>}
              </div>
            </SheetContent>
          </Sheet>
        </nav>
      </div>
    </header>
  );
}
