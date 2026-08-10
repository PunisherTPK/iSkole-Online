import Link from "next/link";

export default function QuestionBankShell() {
  return (
    <div className="question-bank-app">
      <header className="app-header">
        <div>
          <p className="app-eyebrow">Practice</p>

          <h1>Question Bank</h1>

          <p>
            Find questions, practice MCQs, attempt structured questions,
            and review your answers.
          </p>
        </div>

        <div className="app-header-actions">
          <Link href="/" className="app-secondary-button">
            Back to iSkole
          </Link>
        </div>
      </header>

      <section className="question-bank-controls">
        <div className="question-search-box">
          <input
            type="search"
            placeholder="Search questions..."
            aria-label="Search questions"
          />

          <button type="button">
            Search
          </button>
        </div>

        <div className="question-filters">
          <button type="button">Curriculum</button>
          <button type="button">Level</button>
          <button type="button">Subject</button>
          <button type="button">Unit</button>
          <button type="button">Topic</button>
          <button type="button">Question Type</button>
        </div>
      </section>

      <section className="practice-options">
        <div className="practice-card">
          <span>📝</span>

          <h2>Browse Questions</h2>

          <p>
            Find individual questions and view their answers.
          </p>

          <button type="button">
            Browse
          </button>
        </div>

        <div className="practice-card">
          <span>🎯</span>

          <h2>Practice</h2>

          <p>
            Create a practice session based on your selected subjects
            and topics.
          </p>

          <button type="button">
            Start Practice
          </button>
        </div>

        <div className="practice-card">
          <span>📊</span>

          <h2>Results</h2>

          <p>
            Review your previous practice sessions and performance.
          </p>

          <button type="button">
            View Results
          </button>
        </div>
      </section>
    </div>
  );
}