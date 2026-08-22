"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Mail,
  MapPin,
  MessageSquare,
  Send,
} from "lucide-react";

import Navbar from "@/components/public/Navbar";
import Footer from "@/components/public/Footer";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setSubmitting(true);

    // Contact backend can be connected here later.
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
    }, 700);
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <main>
        {/* HERO */}
        <section className="relative overflow-hidden border-b border-border/60">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.08] via-background to-background" />

          <div className="relative mx-auto max-w-7xl px-5 pb-14 pt-14 sm:px-8 sm:pb-18 sm:pt-20">
            <div className="mx-auto max-w-3xl text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-xl shadow-primary/20">
                <MessageSquare className="h-6 w-6" />
              </div>

              <p className="mt-6 text-xs font-extrabold uppercase tracking-[0.2em] text-primary">
                Contact iSkole
              </p>

              <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">
                We&apos;d love to hear from you.
              </h1>

              <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
                Have a question, suggestion or something you think we
                should improve? Send us a message and we&apos;ll get back
                to you.
              </p>
            </div>
          </div>
        </section>

        {/* CONTACT AREA */}
        <section className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16 lg:py-20">
          <div className="grid gap-6 lg:grid-cols-[0.75fr_1.25fr]">
            {/* INFO */}
            <aside className="rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8">
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-primary">
                Get in touch
              </p>

              <h2 className="mt-3 text-2xl font-black tracking-tight">
                Let&apos;s talk.
              </h2>

              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                Whether you are a student, teacher or simply interested
                in iSkole, we&apos;re happy to hear from you.
              </p>

              <div className="mt-8 space-y-3">
                <ContactInfo
                  icon={<Mail className="h-5 w-5" />}
                  title="Email"
                  value="iskoleonline68@gmail.com"
                  href="mailto:iskoleonline68@gmail.com"
                />

                <ContactInfo
                  icon={<MapPin className="h-5 w-5" />}
                  title="Location"
                  value="Sri Lanka"
                />
              </div>

              <div className="mt-8 rounded-2xl bg-primary/[0.06] p-5">
                <p className="text-sm font-bold">
                  Looking for your teachers?
                </p>

                <p className="mt-2 text-xs leading-5 text-muted-foreground">
                  Visit our mentors page to discover teachers and the
                  subjects they teach.
                </p>

                <Link
                  href="/mentors"
                  className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
                >
                  Meet our mentors
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </aside>

            {/* FORM */}
            <section className="rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8">
              {submitted ? (
                <SuccessState
                  onReset={() => setSubmitted(false)}
                />
              ) : (
                <>
                  <div>
                    <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-primary">
                      Send a message
                    </p>

                    <h2 className="mt-2 text-2xl font-black tracking-tight">
                      How can we help?
                    </h2>

                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      Fill in the form below and tell us what&apos;s on
                      your mind.
                    </p>
                  </div>

                  <form
                    onSubmit={handleSubmit}
                    className="mt-7 space-y-5"
                  >
                    <div className="grid gap-5 sm:grid-cols-2">
                      <Field
                        label="Name"
                        name="name"
                        placeholder="Your name"
                        required
                      />

                      <Field
                        label="Email"
                        name="email"
                        type="email"
                        placeholder="you@example.com"
                        required
                      />
                    </div>

                    <Field
                      label="Subject"
                      name="subject"
                      placeholder="What would you like to ask?"
                      required
                    />

                    <label className="block">
                      <span className="text-sm font-bold">
                        Message
                      </span>

                      <textarea
                        name="message"
                        required
                        rows={7}
                        placeholder="Tell us how we can help..."
                        className="mt-2 w-full resize-none rounded-xl border border-input bg-background px-4 py-3 text-sm leading-6 outline-none transition placeholder:text-muted-foreground/60 focus:border-primary focus:ring-2 focus:ring-primary/10"
                      />
                    </label>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="button-primary inline-flex h-12 w-full items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {submitting ? (
                        <>
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                          Sending...
                        </>
                      ) : (
                        <>
                          Send message
                          <Send className="h-4 w-4" />
                        </>
                      )}
                    </button>

                    <p className="text-center text-xs leading-5 text-muted-foreground">
                      By submitting this form, you agree that we may
                      use the information provided to respond to your
                      enquiry.
                    </p>
                  </form>
                </>
              )}
            </section>
          </div>
        </section>

        {/* BOTTOM CTA */}
        <section className="border-t border-border bg-primary/[0.035]">
          <div className="mx-auto max-w-7xl px-5 py-14 text-center sm:px-8 sm:py-16">
            <h2 className="text-2xl font-black tracking-tight sm:text-3xl">
              Ready to start learning?
            </h2>

            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
              You don&apos;t need to wait. Explore the Question Bank
              and start practising today.
            </p>

            <Link
              href="/question-bank"
              className="button-primary mt-6 inline-flex items-center gap-2"
            >
              Explore Question Bank
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
  placeholder,
  required = false,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-sm font-bold">{label}</span>

      <input
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        className="mt-2 h-12 w-full rounded-xl border border-input bg-background px-4 text-sm outline-none transition placeholder:text-muted-foreground/60 focus:border-primary focus:ring-2 focus:ring-primary/10"
      />
    </label>
  );
}

function ContactInfo({
  icon,
  title,
  value,
  href,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  href?: string;
}) {
  const content = (
    <div className="flex items-center gap-4 rounded-2xl border border-border bg-background p-4 transition hover:border-primary/30">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-xs font-semibold text-muted-foreground">
          {title}
        </p>

        <p className="mt-0.5 truncate text-sm font-bold">
          {value}
        </p>
      </div>
    </div>
  );

  return href ? <a href={href}>{content}</a> : content;
}

function SuccessState({
  onReset,
}: {
  onReset: () => void;
}) {
  return (
    <div className="flex min-h-[520px] flex-col items-center justify-center text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600">
        <CheckCircle2 className="h-8 w-8" />
      </div>

      <p className="mt-6 text-xs font-extrabold uppercase tracking-[0.18em] text-primary">
        Message sent
      </p>

      <h2 className="mt-2 text-2xl font-black tracking-tight">
        Thanks for reaching out.
      </h2>

      <p className="mt-3 max-w-md text-sm leading-6 text-muted-foreground">
        Your message has been received. We&apos;ll get back to you
        as soon as possible.
      </p>

      <button
        type="button"
        onClick={onReset}
        className="button-secondary mt-7"
      >
        Send another message
      </button>
    </div>
  );
}