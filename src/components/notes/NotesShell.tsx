import Link from "next/link";
import { ArrowRight, BookOpen, Search } from "lucide-react";

export default function NotesShell() {
  return (
    <div className="notes-app">
      <header className="app-header">
        <div><p className="app-eyebrow">Learning resources</p><h1>Notes</h1><p>Find focused learning material by curriculum, level, subject or topic.</p></div>
        <div className="app-header-actions"><Link href="/" className="app-secondary-button">Back to iSkole</Link></div>
      </header>
      <section className="notes-finder">
        <div className="notes-search-box"><Search className="notes-search-icon h-4 w-4" /><input type="search" placeholder="Search notes..." aria-label="Search notes" /><button type="button">Search</button></div>
        <div className="notes-filters" aria-label="Note filters"><button type="button">Curriculum</button><button type="button">Level</button><button type="button">Subject</button><button type="button">Topic</button></div>
      </section>
      <section className="app-placeholder notes-empty"><div><span><BookOpen className="h-6 w-6" /></span><h2>Your notes library</h2><p>Notes will appear here as the Notes application connects its learning resources.</p><Link href="/question-bank" className="notes-empty-link">Explore Question Bank <ArrowRight className="h-4 w-4" /></Link></div></section>
    </div>
  );
}
