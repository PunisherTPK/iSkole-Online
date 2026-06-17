"use client";

import { ExternalLink, FileText, Play } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import type { PastPaper, Resource } from "@/lib/types";

export function ResourceCard({ resource, typeName }: { resource: Resource; typeName: string }) {
  return (
    <motion.article
      id={resource.id}
      className="rounded-3xl border border-border bg-card p-6 shadow-brand"
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <Badge variant="outline" className="border-primary/20 text-primary">
            {typeName}
          </Badge>
          <h3 className="mt-3 text-lg font-semibold text-foreground">{resource.title}</h3>
          {resource.description ? (
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{resource.description}</p>
          ) : null}
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          {resource.file_url ? <ResourceLink href={resource.file_url} label="File" icon={FileText} /> : null}
          {resource.youtube_url ? <ResourceLink href={resource.youtube_url} label="Video" icon={Play} /> : null}
        </div>
      </div>
      {resource.content ? (
        <p className="mt-4 whitespace-pre-line rounded-xl bg-muted/5 p-4 text-sm leading-6 text-foreground/80">
          {resource.content}
        </p>
      ) : null}
    </motion.article>
  );
}

export function PastPaperCard({ paper }: { paper: PastPaper }) {
  return (
    <motion.article
      className="rounded-3xl border border-border bg-card p-6 shadow-brand"
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
    >
      <Badge variant="outline" className="border-primary/20 text-primary">
        Past Paper
      </Badge>
      <h3 className="mt-3 text-lg font-semibold text-foreground">
        {paper.year} {paper.session}
      </h3>
      <div className="mt-4 flex flex-wrap gap-2">
        {paper.paper_file_url ? <ResourceLink href={paper.paper_file_url} label="Paper" icon={FileText} /> : null}
        {paper.mark_scheme_file_url ? <ResourceLink href={paper.mark_scheme_file_url} label="Mark Scheme" icon={FileText} /> : null}
        {!paper.paper_file_url && !paper.mark_scheme_file_url ? (
          <span className="text-sm text-muted-foreground">Files coming soon</span>
        ) : null}
      </div>
    </motion.article>
  );
}

function ResourceLink({ href, label, icon: Icon }: { href: string; label: string; icon: typeof FileText }) {
  return (
    <a
      className="inline-flex items-center gap-2 rounded-xl border border-primary/20 bg-primary/5 px-4 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      href={href}
      target="_blank"
      rel="noreferrer"
    >
      <Icon className="h-4 w-4" aria-hidden="true" />
      {label}
      <ExternalLink className="h-3 w-3 opacity-60" aria-hidden="true" />
    </a>
  );
}
