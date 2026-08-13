import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BackButton from "@/components/layout/BackButton";
import { createClient } from "@/lib/supabase/server";
import "./globals.css";

export const metadata: Metadata = { title: "iSkole.online", description: "Learn. Practice. Connect." };

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = user ? await supabase.from("profiles").select("full_name, role").eq("id", user.id).maybeSingle() : { data: null };
  return <html lang="en"><body><Navbar user={user ? { email: user.email ?? "", name: profile?.full_name ?? "", role: profile?.role ?? "student" } : null}/><BackButton/><main className="site-main">{children}</main><Footer/></body></html>;
}
