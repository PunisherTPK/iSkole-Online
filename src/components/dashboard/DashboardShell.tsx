export default function DashboardShell() {
  return (
    <div className="dashboard-app">
      <header className="app-header">
        <div>
          <p className="app-eyebrow">Your Learning</p>

          <h1>Dashboard</h1>

          <p>
            Track your learning activity, progress, saved content,
            and practice results.
          </p>
        </div>
      </header>

      <section className="dashboard-grid">
        <div className="dashboard-card dashboard-card-large">
          <span>📈</span>

          <h2>Progress</h2>

          <p>
            Your learning progress will appear here.
          </p>
        </div>

        <div className="dashboard-card">
          <span>⭐</span>

          <h2>Saved</h2>

          <p>
            Questions and notes you save will appear here.
          </p>
        </div>

        <div className="dashboard-card">
          <span>📝</span>

          <h2>Recent Activity</h2>

          <p>
            Your recent activity will appear here.
          </p>
        </div>

        <div className="dashboard-card">
          <span>🎯</span>

          <h2>Practice</h2>

          <p>
            Your practice results will appear here.
          </p>
        </div>
      </section>
    </div>
  );
}