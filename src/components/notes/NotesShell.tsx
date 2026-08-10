import Link from "next/link";

export default function NotesShell() {
  return (
    <div className="notes-app">
      <header className="app-header">
        <div>
          <p className="app-eyebrow">Learn</p>

          <h1>Notes</h1>

          <p>
            Find the notes you need without navigating through hundreds
            of separate pages.
          </p>
        </div>

        <div className="app-header-actions">
          <Link href="/" className="app-secondary-button">
            Back to iSkole
          </Link>
        </div>
      </header>

      <section className="notes-finder">
        <div className="notes-search-box">
          <input
            type="search"
            placeholder="Search notes..."
            aria-label="Search notes"
          />

          <button type="button">
            Search
          </button>
        </div>

        <div className="notes-filters">
          <button type="button">Curriculum</button>
          <button type="button">Level</button>
          <button type="button">Subject</button>
          <button type="button">Topic</button>
        </div>
      </section>

      <section className="app-placeholder">
        <div>
          <span>📚</span>

          <h2>Find what you need</h2>

          <p>
            Notes will be loaded dynamically from the Notes application.
          </p>
        </div>
      </section>
    </div>
  );
}