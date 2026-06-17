"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type ModernCardProps = {
  children: ReactNode;
  className?: string;
  hover?: boolean;
};

export function ModernCard({ children, className, hover = true }: ModernCardProps) {
  return (
    <motion.div
      className={cn(
        "rounded-3xl border border-border bg-card p-6 shadow-brand transition-shadow duration-300",
        className,
      )}
      whileHover={hover ? { y: -4 } : undefined}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
