import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type PageContainerProps = {
  children: ReactNode;
  className?: string;
  size?: "default" | "narrow" | "wide";
};

const sizes = {
  default: "max-w-6xl",
  narrow: "max-w-4xl",
  wide: "max-w-7xl",
};

export function PageContainer({ children, className, size = "default" }: PageContainerProps) {
  return (
    <div className={cn("mx-auto w-full px-4 py-10 sm:px-6", sizes[size], className)}>
      {children}
    </div>
  );
}
