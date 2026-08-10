import Link from "next/link";

export default function HomePage() {
  return (
    <div className="home-page">
      <section className="home-hero">
        <div className="home-hero-content">
          <p className="home-eyebrow">Welcome to iSkole</p>

          <h1>
            Learn.
            <br />
            Practice.
            <br />
            Connect.
          </h1>

          <p className="home-description">
            A modern learning platform connecting students with notes,
            questions, mentors, and everything they need to learn better.
          </p>

          <div className="home-actions">
            <Link href="/question-bank" className="primary-button">
              Explore Question Bank
            </Link>

            <Link href="/notes" className="secondary-button">
              Find Notes
            </Link>
          </div>
        </div>
      </section>

      <section className="home-services">
        <div className="section-heading">
          <p>Everything you need</p>
          <h2>One platform. Multiple ways to learn.</h2>
        </div>

        <div className="service-grid">
          <Link href="/notes" className="service-card">
            <span className="service-icon">📚</span>
            <h3>Notes</h3>
            <p>
              Find learning materials quickly without digging through
              countless pages.
            </p>
          </Link>

          <Link href="/question-bank" className="service-card">
            <span className="service-icon">📝</span>
            <h3>Question Bank</h3>
            <p>
              Practice MCQs, structured questions, answers, and more.
            </p>
          </Link>

          <Link href="/mentor" className="service-card">
            <span className="service-icon">👨‍🏫</span>
            <h3>Mentor</h3>
            <p>
              Find people who can help you understand what you're learning.
            </p>
          </Link>

          <Link href="/dashboard" className="service-card">
            <span className="service-icon">📊</span>
            <h3>Dashboard</h3>
            <p>
              Keep track of your learning activity and progress.
            </p>
          </Link>
        </div>
      </section>
    </div>
  );
}