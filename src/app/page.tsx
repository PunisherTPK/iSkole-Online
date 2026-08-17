import Link from "next/link";
import { ArrowRight, BookOpen, GraduationCap, LayoutDashboard, PenLine } from "lucide-react";

const services = [
  { href: "/notes", icon: BookOpen, title: "Notes", text: "Find focused learning material without digging through endless pages." },
  { href: "/question-bank", icon: PenLine, title: "Question Bank", text: "Practice MCQs, structured questions, answers, and more." },
  { href: "/mentor", icon: GraduationCap, title: "Mentor", text: "Get guidance when you need help understanding what you learn." },
  { href: "/dashboard", icon: LayoutDashboard, title: "Dashboard", text: "Keep your learning activity, account and progress in one place." },
];

export default function HomePage() {
  return (
    <div className="home-page">
      <section className="home-hero">
        <div className="home-hero-content">
          <div className="home-hero-copy">
            <p className="home-eyebrow">A focused learning workspace</p>
            <h1>Learn with purpose.</h1>
            <p className="home-description">iSkole brings notes, questions, practice and learning support together in one clean space built around your subjects.</p>
            <div className="home-actions">
              <Link href="/question-bank" className="primary-button">Explore Question Bank <ArrowRight className="ml-2 h-4 w-4" /></Link>
              <Link href="/notes" className="secondary-button">Find Notes</Link>
            </div>
            <div className="home-proof"><span>Built for focused study</span><span>•</span><span>Question-led learning</span><span>•</span><span>Student-first</span></div>
          </div>
          <div className="home-hero-panel" aria-hidden="true">
            <div className="hero-panel-top"><span>iSkole workspace</span><span className="hero-live-dot" /></div>
            <div className="hero-panel-content"><div className="hero-panel-label">Your learning space</div><div className="hero-panel-title">Questions, notes and progress — together.</div><div className="hero-panel-line" /><div className="hero-panel-row"><span>Question Bank</span><strong>Explore</strong></div><div className="hero-panel-row"><span>Practice</span><strong>Continue</strong></div><div className="hero-panel-row"><span>Notes</span><strong>Browse</strong></div></div>
          </div>
        </div>
      </section>

      <section className="home-services">
        <div className="section-heading"><p>Everything in one place</p><h2>A calmer way to learn.</h2><span>Move between resources without losing the thread of what you are studying.</span></div>
        <div className="service-grid">
          {services.map(({ href, icon: Icon, title, text }) => <Link key={href} href={href} className="service-card"><span className="service-icon"><Icon className="h-5 w-5" /></span><div><h3>{title}</h3><p>{text}</p></div><ArrowRight className="service-arrow h-4 w-4" /></Link>)}
        </div>
      </section>
    </div>
  );
}
