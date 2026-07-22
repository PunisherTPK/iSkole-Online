"use client";

import { ExternalLink, FileQuestion, Play } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import type { DiscussionVideo, QuestionSet } from "@/lib/types";

export function QuestionSetCard({ questionSet, href, count }: { questionSet: QuestionSet; href: string; count: number }) {
  return (
    <motion.article className="rounded-2xl border border-border bg-card p-6 shadow-brand" whileHover={{ y: -4 }} transition={{ duration: 0.3 }}>
      <Badge variant="outline" className="border-primary/20 text-primary">MCQ Section</Badge>
      <h3 className="mt-3 text-lg font-semibold text-foreground">{questionSet.title}</h3>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{questionSet.description || "Attempt topical questions and review your score instantly."}</p>
      <a className="mt-5 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90" href={href}>
        <FileQuestion className="h-4 w-4" aria-hidden="true" />
        Start {count} Questions
      </a>
    </motion.article>
  );
}

export function DiscussionVideoCard({ video }: { video: DiscussionVideo }) {
  return (
    <motion.article className="rounded-2xl border border-border bg-card p-6 shadow-brand" whileHover={{ y: -4 }} transition={{ duration: 0.3 }}>
      <Badge variant="outline" className="border-primary/20 text-primary">Discussion Video</Badge>
      <h3 className="mt-3 text-lg font-semibold text-foreground">{video.title}</h3>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{video.description}</p>
      <a className="mt-5 inline-flex items-center gap-2 rounded-xl border border-primary/20 bg-primary/5 px-4 py-2 text-sm font-semibold text-primary transition hover:bg-primary/10" href={video.youtube_url} target="_blank" rel="noreferrer">
        <Play className="h-4 w-4" aria-hidden="true" />
        Open Video
        <ExternalLink className="h-3 w-3 opacity-60" aria-hidden="true" />
      </a>
    </motion.article>
  );
}
