import { ArrowRight, GraduationCap, MessageCircle } from "lucide-react";

export default function MentorPage() {
  return (
    <div className="app-page mentor-page">
      <div className="app-page-content">
        <div className="mentor-mark"><GraduationCap className="h-6 w-6" /></div>
        <p className="app-eyebrow">Learning support</p>
        <h1>Learn with guidance.</h1>
        <p>Find a mentor who can help you work through difficult topics and keep your learning journey moving.</p>
        <div className="mentor-actions"><button type="button" className="primary-button">Find a mentor <ArrowRight className="ml-2 h-4 w-4" /></button><div className="mentor-note"><MessageCircle className="h-4 w-4" /> Mentor matching is coming soon.</div></div>
      </div>
    </div>
  );
}
