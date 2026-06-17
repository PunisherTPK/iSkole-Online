import type { PastPaper, Resource } from "@/lib/types";

export function ResourceCard({ resource, typeName }: { resource: Resource; typeName: string }) {
  return (
    <article id={resource.id} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-blue-600">{typeName}</p>
          <h3 className="mt-2 text-lg font-bold text-slate-950">{resource.title}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">{resource.description}</p>
        </div>
        <div className="flex gap-2">
          {resource.file_url ? <ResourceLink href={resource.file_url} label="File" /> : null}
          {resource.youtube_url ? <ResourceLink href={resource.youtube_url} label="Video" /> : null}
        </div>
      </div>
      {resource.content ? <p className="mt-4 whitespace-pre-line text-sm leading-6 text-slate-700">{resource.content}</p> : null}
    </article>
  );
}

export function PastPaperCard({ paper }: { paper: PastPaper }) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-wide text-blue-600">Past Paper</p>
      <h3 className="mt-2 text-lg font-bold text-slate-950">
        {paper.year} {paper.session}
      </h3>
      <div className="mt-4 flex flex-wrap gap-2">
        {paper.paper_file_url ? <ResourceLink href={paper.paper_file_url} label="Paper" /> : null}
        {paper.mark_scheme_file_url ? <ResourceLink href={paper.mark_scheme_file_url} label="Mark Scheme" /> : null}
        {!paper.paper_file_url && !paper.mark_scheme_file_url ? <span className="text-sm text-slate-500">Files coming soon</span> : null}
      </div>
    </article>
  );
}

function ResourceLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700"
      href={href}
      target="_blank"
      rel="noreferrer"
    >
      {label}
    </a>
  );
}
