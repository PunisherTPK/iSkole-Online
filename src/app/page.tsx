import Image from "next/image";
import { BookOpen, GraduationCap, Sparkles } from "lucide-react";

export default function HomePage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-[-18rem] h-[38rem] w-[38rem] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-[-12rem] left-[-10rem] h-[28rem] w-[28rem] rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute right-[-10rem] top-1/3 h-[24rem] w-[24rem] rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute inset-0 opacity-[0.035]" style={{ backgroundImage: "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)", backgroundSize: "48px 48px" }} />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center px-5 py-16 text-center sm:px-8 lg:py-20">
        <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-sm font-semibold text-primary shadow-sm">
          <Sparkles size={15} /> Something better is coming
        </div>

        <div className="mb-8">
          <Image src="/branding/iskole-logo.png" alt="iSkole" width={190} height={72} priority className="mx-auto h-auto w-[150px] sm:w-[190px]" />
        </div>

        <h1 className="max-w-4xl text-4xl font-black tracking-tight text-foreground sm:text-6xl lg:text-7xl">
          Learning is about to get
          <span className="block bg-gradient-to-r from-primary via-primary/80 to-primary/50 bg-clip-text text-transparent">a whole lot better.</span>
        </h1>

        <p className="mt-7 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
          iSkole is being rebuilt into a modern learning platform for students and teachers. Question banks, learning resources, teacher-created content and much more — all in one place.
        </p>

        <div className="mt-10 w-full max-w-2xl rounded-3xl border border-border bg-card/80 p-6 shadow-xl shadow-primary/5 backdrop-blur-xl sm:p-8">
          <div className="flex flex-col items-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary"><GraduationCap size={28} /></div>
            <p className="mt-5 text-xs font-bold uppercase tracking-[0.2em] text-primary">Coming Soon</p>
            <h2 className="mt-2 text-2xl font-bold text-foreground sm:text-3xl">iSkole.online is getting ready.</h2>
            <p className="mt-3 max-w-lg text-sm leading-6 text-muted-foreground">We&apos;re putting the finishing touches on the new platform. The new iSkole experience will be available soon.</p>
            <div className="mt-7 w-full">
              <div className="mb-2 flex items-center justify-between text-xs font-medium text-muted-foreground"><span>Building the future of iSkole</span><span>Almost there</span></div>
              <div className="h-2 overflow-hidden rounded-full bg-muted"><div className="h-full w-[78%] rounded-full bg-primary" /></div>
            </div>
          </div>
        </div>

        <div className="mt-10 grid w-full max-w-3xl gap-3 sm:grid-cols-3">
          <Feature icon={<BookOpen size={20} />} title="Question Bank" description="Practice from teacher-created questions." />
          <Feature icon={<GraduationCap size={20} />} title="Teacher Content" description="Learning material built around your subjects." />
          <Feature icon={<Sparkles size={20} />} title="Better Learning" description="A cleaner, smarter learning experience." />
        </div>

        <p className="mt-14 text-xs text-muted-foreground">© {new Date().getFullYear()} iSkole.online · Learn. Practice. Connect.</p>
      </div>
    </main>
  );
}

function Feature({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="group rounded-2xl border border-border bg-card/60 p-5 text-left backdrop-blur transition hover:-translate-y-1 hover:border-primary/20 hover:shadow-lg">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary transition group-hover:bg-primary group-hover:text-primary-foreground">{icon}</div>
      <h3 className="mt-4 font-semibold text-foreground">{title}</h3>
      <p className="mt-1 text-sm leading-6 text-muted-foreground">{description}</p>
    </div>
  );
}
