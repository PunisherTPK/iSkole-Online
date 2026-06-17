"use client";

import { Search } from "lucide-react";
import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type SearchBarProps = {
  compact?: boolean;
  defaultValue?: string;
  className?: string;
};

export function SearchBar({ compact = false, defaultValue = "", className }: SearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        inputRef.current?.focus();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <form
      action="/search"
      className={cn("flex w-full gap-2", compact ? "sm:max-w-xs lg:max-w-sm" : "mx-auto max-w-2xl", className)}
    >
      <label className="sr-only" htmlFor={compact ? "nav-search" : "global-search"}>
        Search educational resources
      </label>
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
        <Input
          ref={inputRef}
          id={compact ? "nav-search" : "global-search"}
          name="q"
          defaultValue={defaultValue}
          placeholder="Search curriculum, level, subject..."
          className="h-12 rounded-2xl border-border pl-11 pr-20 shadow-brand"
        />
        <kbd className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 rounded-md border border-border bg-muted/10 px-2 py-0.5 text-xs font-medium text-muted-foreground sm:inline-block">
          ⌘K
        </kbd>
      </div>
      {!compact ? (
        <Button type="submit" className="h-12 rounded-2xl px-6">
          Search
        </Button>
      ) : (
        <Button type="submit" size="icon" className="h-12 w-12 shrink-0 rounded-2xl" aria-label="Search">
          <Search className="h-4 w-4" />
        </Button>
      )}
    </form>
  );
}
