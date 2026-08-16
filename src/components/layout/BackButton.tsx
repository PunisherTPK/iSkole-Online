"use client";
import { ArrowLeft } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
export default function BackButton(){const pathname=usePathname();const router=useRouter();if(pathname==="/")return null;return <div className="mx-auto max-w-7xl px-4 pt-4 sm:px-6 lg:px-8"><button type="button" onClick={()=>router.back()} className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-3.5 py-2 text-sm font-semibold text-foreground shadow-sm transition hover:bg-muted"><ArrowLeft size={16}/>Back</button></div>}
