"use client";

import Link from "next/link";
import { Check, Loader2, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import Navbar from "@/components/public/Navbar";
import Footer from "@/components/public/Footer";
import { createClient } from "@/lib/supabase/client";

type Pricing = { subjectPrice: number | null; premiumPrice: number | null; currency: string; active: boolean };

export default function PricingPage() {
  const [pricing, setPricing] = useState<Pricing>({ subjectPrice: null, premiumPrice: null, currency: "LKR", active: true });
  const [loading, setLoading] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    async function load() {
      const [{ data }, { data: auth }] = await Promise.all([
        supabase
          .from("payment_settings")
          .select("subject_price,premium_price,currency,is_active")
          .limit(1)
          .maybeSingle(),

        supabase.auth.getUser(),
      ]);

      if (data) {
        setPricing({
          subjectPrice: data.subject_price,
          premiumPrice: data.premium_price,
          currency: data.currency || "LKR",
          active: data.is_active !== false,
        });
      }

      setLoggedIn(Boolean(auth.user));
      setLoading(false);
    }
    void load();
  }, []);

  const money = (value: number | null) => value == null ? "—" : `${pricing.currency} ${Number(value).toLocaleString("en-LK")}`;
  const subjectFeatures = ["Full access to your subscribed subject", "Unlimited QBank practice", "Instant answer review", "Progress tracking"];
  const premiumFeatures = ["Full access to all available subjects", "Unlimited QBank practice", "Instant answer review", "Progress tracking", "Best value for serious learners"];
  const action = (plan: "subject" | "premium") =>
    loggedIn
      ? `/student/payment?plan=${plan}`
      : `/login?next=/student/payment?plan=${plan}`;  

  return <div className="min-h-screen bg-background"><Navbar /><main><section className="px-5 pb-8 pt-14 sm:px-8 sm:pt-20"><div className="mx-auto max-w-3xl text-center"><p className="text-sm font-bold uppercase tracking-[0.16em] text-primary">Simple pricing</p><h1 className="mt-3 text-4xl font-extrabold tracking-tight sm:text-5xl">Learn more. Practice more. Pay less.</h1><p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">Choose the access that fits your learning. Your subscription unlocks the iSkole Question Bank experience built for focused practice.</p></div></section>{loading ? <div className="flex min-h-[360px] items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div> : <section className="mx-auto grid max-w-5xl gap-5 px-5 pb-16 sm:px-8 lg:grid-cols-2"><article className="rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8"><p className="text-sm font-bold text-primary">Subject access</p><h2 className="mt-2 text-2xl font-extrabold">One subject</h2><div className="mt-6 flex items-end gap-2"><span className="text-4xl font-extrabold tracking-tight">{money(pricing.subjectPrice)}</span><span className="pb-1 text-sm text-muted-foreground">/ subscription</span></div><ul className="mt-7 space-y-3">{subjectFeatures.map((feature) => <li key={feature} className="flex gap-3 text-sm"><Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />{feature}</li>)}</ul><Link href={action("subject")} className="button-secondary mt-8 w-full">{loggedIn ? "Choose subject" : "Get started"}</Link></article><article className="relative rounded-3xl border-2 border-primary/30 bg-card p-6 shadow-lg sm:p-8"><div className="absolute right-5 top-5 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-[11px] font-bold text-primary"><Sparkles className="h-3.5 w-3.5" />Best value</div><p className="text-sm font-bold text-primary">Premium</p><h2 className="mt-2 text-2xl font-extrabold">All subjects</h2><div className="mt-6 flex items-end gap-2"><span className="text-4xl font-extrabold tracking-tight">{money(pricing.premiumPrice)}</span><span className="pb-1 text-sm text-muted-foreground">/ subscription</span></div><ul className="mt-7 space-y-3">{premiumFeatures.map((feature) => <li key={feature} className="flex gap-3 text-sm"><Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />{feature}</li>)}</ul><Link href={action("premium")} className="button-primary mt-8 w-full">Get premium</Link></article></section>}{!pricing.active && <p className="mx-auto max-w-xl px-5 pb-12 text-center text-sm text-muted-foreground">Subscriptions are currently unavailable. Please check back soon.</p>}<section className="border-y border-border bg-primary/[0.035] px-5 py-12 text-center sm:px-8"><h2 className="text-xl font-extrabold">Not sure what you need?</h2><p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-muted-foreground">Start with the Question Bank and choose the access level that makes sense for your subjects.</p><Link href="/question-bank" className="button-secondary mt-5">Explore Question Bank</Link></section></main><Footer /></div>;}
