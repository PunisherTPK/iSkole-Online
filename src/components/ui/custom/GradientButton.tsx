"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type GradientButtonProps = HTMLMotionProps<"button"> & {
  children: ReactNode;
};

export function GradientButton({ children, className, ...props }: GradientButtonProps) {
  return (
    <motion.button
      className={cn(
        "inline-flex h-11 items-center justify-center rounded-xl bg-brand-gradient px-6 text-sm font-semibold text-white shadow-brand transition-all hover:shadow-brand-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        className,
      )}
      whileTap={{ scale: 0.98 }}
      {...props}
    >
      {children}
    </motion.button>
  );
}
