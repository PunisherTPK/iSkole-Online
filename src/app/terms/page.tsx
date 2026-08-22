import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  CreditCard,
  FileText,
  Lock,
  ShieldCheck,
  UserCheck,
} from "lucide-react";

import Navbar from "@/components/public/Navbar";
import Footer from "@/components/public/Footer";

export default function TermsPage() {
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
                <FileText className="h-6 w-6" />
              </div>

              <p className="mt-6 text-xs font-extrabold uppercase tracking-[0.2em] text-primary">
                Legal
              </p>

              <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">
                Terms of Service
              </h1>

              <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
                These terms explain the rules for using iSkole, including
                accounts, educational content, subscriptions and payments.
              </p>

              <p className="mt-4 text-xs font-semibold text-muted-foreground">
                Last updated: August 2026
              </p>
            </div>
          </div>
        </section>

        {/* CONTENT */}
        <section className="mx-auto max-w-5xl px-5 py-12 sm:px-8 sm:py-16">
          <div className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
            {/* QUICK NAV */}
            <aside className="hidden lg:block">
              <div className="sticky top-24 rounded-2xl border border-border bg-card p-4">
                <p className="px-3 text-[11px] font-extrabold uppercase tracking-[0.15em] text-muted-foreground">
                  On this page
                </p>

                <nav className="mt-3 space-y-1 text-sm">
                  {[
                    ["1", "Acceptance"],
                    ["2", "Accounts"],
                    ["3", "Educational content"],
                    ["4", "Teachers"],
                    ["5", "Subscriptions"],
                    ["6", "Payments"],
                    ["7", "Acceptable use"],
                    ["8", "Intellectual property"],
                    ["9", "Privacy"],
                    ["10", "Termination"],
                    ["11", "Availability"],
                    ["12", "Liability"],
                    ["13", "Changes"],
                    ["14", "Contact"],
                  ].map(([number, title]) => (
                    <a
                      key={number}
                      href={`#section-${number}`}
                      className="block rounded-lg px-3 py-2 text-muted-foreground transition hover:bg-muted hover:text-foreground"
                    >
                      {number}. {title}
                    </a>
                  ))}
                </nav>
              </div>
            </aside>

            {/* TERMS */}
            <article className="min-w-0 space-y-10">
              <Intro />

              <TermsSection
                id="section-1"
                number="1"
                title="Acceptance of these terms"
              >
                <p>
                  By accessing or using iSkole, you agree to be bound by
                  these Terms of Service and any applicable policies
                  referenced within them.
                </p>

                <p>
                  If you do not agree with these terms, you should not use
                  the iSkole website, create an account, purchase a
                  subscription or access its services.
                </p>
              </TermsSection>

              <TermsSection
                id="section-2"
                number="2"
                title="User accounts"
                icon={<UserCheck className="h-4 w-4" />}
              >
                <p>
                  Some iSkole features require an account. You are
                  responsible for providing accurate information and
                  keeping your account credentials secure.
                </p>

                <p>
                  You are responsible for activity carried out through
                  your account. You should not share your password or
                  knowingly allow another person to use your account.
                </p>

                <p>
                  iSkole may restrict or suspend an account if there is
                  reasonable evidence of misuse, fraud, unauthorised
                  access or violation of these terms.
                </p>
              </TermsSection>

              <TermsSection
                id="section-3"
                number="3"
                title="Educational content"
                icon={<BookOpen className="h-4 w-4" />}
              >
                <p>
                  iSkole provides educational resources, questions,
                  explanations and other learning materials for
                  educational and revision purposes.
                </p>

                <p>
                  Educational content may be created, uploaded or
                  maintained by teachers and other authorised contributors.
                  While we aim to maintain useful and accurate content,
                  iSkole does not guarantee that every item is completely
                  error-free, current or suitable for every learner.
                </p>

                <p>
                  iSkole should be used as a learning and practice
                  resource and should not be treated as a replacement for
                  official examination materials, school instruction or
                  professional advice.
                </p>
              </TermsSection>

              <TermsSection
                id="section-4"
                number="4"
                title="Teachers and contributed content"
              >
                <p>
                  Teachers may be given access to tools that allow them
                  to create, manage or publish educational content on
                  iSkole.
                </p>

                <p>
                  Teachers are responsible for ensuring that content they
                  submit is relevant to the intended educational purpose
                  and does not knowingly violate another person's
                  intellectual property or other legal rights.
                </p>

                <p>
                  iSkole may review, modify, restrict or remove content
                  that violates these terms, applicable law or platform
                  standards.
                </p>
              </TermsSection>

              <TermsSection
                id="section-5"
                number="5"
                title="Subscriptions"
                icon={<CreditCard className="h-4 w-4" />}
              >
                <p>
                  Certain iSkole learning features require a paid
                  subscription. Subscription options and prices are
                  displayed on the iSkole pricing page.
                </p>

                <p>
                  Unless otherwise stated at the time of purchase, a
                  subscription provides access for{" "}
                  <strong>30 days</strong> from the date on which the
                  subscription is activated.
                </p>

                <p>
                  Subject subscriptions provide access to the specific
                  curriculum, level and subject selected during checkout.
                  Premium access may provide access to the subjects
                  included in the applicable Premium offering.
                </p>

                <p>
                  Access automatically ends when the applicable
                  subscription period expires unless a new subscription
                  or renewal is activated.
                </p>
              </TermsSection>

              <TermsSection
                id="section-6"
                number="6"
                title="Payments and payment verification"
                icon={<ShieldCheck className="h-4 w-4" />}
              >
                <p>
                  Payments are processed using the payment methods made
                  available by iSkole. Where payment proof is requested,
                  users must provide genuine and readable evidence of
                  payment.
                </p>

                <p>
                  A payment request does not automatically guarantee
                  access. Access is activated only after the payment has
                  been successfully reviewed and approved.
                </p>

                <p>
                  Providing false payment information, altered payment
                  evidence or attempting to obtain access without making
                  the required payment is prohibited.
                </p>

                <p>
                  Subscription pricing, availability and applicable
                  payment instructions may be changed from time to time.
                  Changes will not retroactively alter an already
                  activated subscription period.
                </p>
              </TermsSection>

              <TermsSection
                id="section-7"
                number="7"
                title="Acceptable use"
              >
                <p>
                  You agree to use iSkole only for lawful educational and
                  personal purposes.
                </p>

                <div className="rounded-2xl border border-border bg-muted/30 p-5">
                  <p className="text-sm font-bold">
                    You must not:
                  </p>

                  <ul className="mt-4 space-y-3">
                    <Bullet>
                      Share paid account access with other people.
                    </Bullet>

                    <Bullet>
                      Copy, redistribute, resell or commercially exploit
                      protected iSkole content without permission.
                    </Bullet>

                    <Bullet>
                      Attempt to bypass subscription or access controls.
                    </Bullet>

                    <Bullet>
                      Upload malicious software, harmful content or
                      material intended to compromise the platform.
                    </Bullet>

                    <Bullet>
                      Attempt to access another user's account or
                      private information.
                    </Bullet>

                    <Bullet>
                      Abuse, overload or interfere with the operation of
                      the website.
                    </Bullet>

                    <Bullet>
                      Use iSkole for fraudulent or unlawful activity.
                    </Bullet>
                  </ul>
                </div>
              </TermsSection>

              <TermsSection
                id="section-8"
                number="8"
                title="Intellectual property"
              >
                <p>
                  The iSkole website, branding, interface, software,
                  original graphics and other platform materials are
                  protected by applicable intellectual property laws.
                </p>

                <p>
                  Access to iSkole does not transfer ownership of the
                  platform or its protected materials to you.
                </p>

                <p>
                  Educational content contributed by teachers or other
                  users may remain subject to the rights of its respective
                  creators or rights holders.
                </p>
              </TermsSection>

              <TermsSection
                id="section-9"
                number="9"
                title="Privacy"
                icon={<Lock className="h-4 w-4" />}
              >
                <p>
                  Your use of iSkole is also subject to our Privacy
                  Policy, which explains how information is collected,
                  used and protected.
                </p>

                <p>
                  We encourage you to read the Privacy Policy before
                  creating an account or submitting personal information.
                </p>

                <Link
                  href="/privacy"
                  className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline"
                >
                  Read our Privacy Policy
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </TermsSection>

              <TermsSection
                id="section-10"
                number="10"
                title="Suspension and termination"
              >
                <p>
                  iSkole may suspend or terminate access where necessary
                  to protect the platform, its users or its services, or
                  where a user violates these terms.
                </p>

                <p>
                  Users may stop using their account at any time.
                  Termination of an account does not remove obligations
                  that reasonably continue after termination, including
                  obligations relating to intellectual property, misuse
                  and outstanding matters.
                </p>
              </TermsSection>

              <TermsSection
                id="section-11"
                number="11"
                title="Service availability"
              >
                <p>
                  We aim to keep iSkole available and reliable, but we
                  cannot guarantee uninterrupted access at all times.
                </p>

                <p>
                  The service may occasionally be unavailable because of
                  maintenance, updates, technical problems, infrastructure
                  failures or circumstances outside our reasonable control.
                </p>
              </TermsSection>

              <TermsSection
                id="section-12"
                number="12"
                title="Limitation of liability"
              >
                <p>
                  To the extent permitted by applicable law, iSkole is not
                  responsible for indirect, incidental or consequential
                  losses arising from the use of, or inability to use, the
                  service.
                </p>

                <p>
                  We do not guarantee examination results, grades,
                  admission outcomes or any particular academic result
                  from using the platform.
                </p>

                <p>
                  Nothing in these terms is intended to exclude or limit
                  any liability that cannot legally be excluded or
                  limited under applicable law.
                </p>
              </TermsSection>

              <TermsSection
                id="section-13"
                number="13"
                title="Changes to these terms"
              >
                <p>
                  We may update these Terms of Service when necessary to
                  reflect changes to the platform, services, legal
                  requirements or operating practices.
                </p>

                <p>
                  The updated version will be published on this page with
                  a revised update date. Continued use of iSkole after
                  changes are published constitutes acceptance of the
                  updated terms, to the extent permitted by applicable
                  law.
                </p>
              </TermsSection>

              <TermsSection
                id="section-14"
                number="14"
                title="Contact"
              >
                <p>
                  If you have questions about these Terms of Service,
                  please contact us through the iSkole contact page.
                </p>

                <Link
                  href="/contact"
                  className="button-secondary mt-2 inline-flex items-center gap-2"
                >
                  Contact iSkole
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </TermsSection>

              {/* ACCEPTANCE */}
              <div className="rounded-3xl border border-primary/20 bg-primary/[0.045] p-6 sm:p-8">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>

                  <div>
                    <h2 className="font-extrabold">
                      Using iSkole means accepting these terms.
                    </h2>

                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      Please make sure you understand these terms before
                      using paid features or creating an account.
                    </p>
                  </div>
                </div>
              </div>
            </article>
          </div>
        </section>

        {/* CTA */}
        <section className="border-t border-border bg-primary/[0.035]">
          <div className="mx-auto max-w-7xl px-5 py-14 text-center sm:px-8 sm:py-16">
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-primary">
              iSkole
            </p>

            <h2 className="mx-auto mt-3 max-w-2xl text-2xl font-black tracking-tight sm:text-3xl">
              Learn more. Practise more. Keep moving forward.
            </h2>

            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
              Explore the Question Bank and make your next study session
              count.
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

function Intro() {
  return (
    <div className="rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8">
      <p className="text-sm leading-7 text-muted-foreground">
        Welcome to iSkole. These Terms of Service govern your access to
        and use of the iSkole website and its educational services.
      </p>

      <p className="mt-4 text-sm leading-7 text-muted-foreground">
        These terms are written to explain how the platform is intended
        to be used and what users can expect when using iSkole. Please
        read them carefully, particularly the sections concerning
        subscriptions, payments and acceptable use.
      </p>
    </div>
  );
}

function TermsSection({
  id,
  number,
  title,
  icon,
  children,
}: {
  id: string;
  number: string;
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24">
      <div className="flex items-center gap-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-xs font-black text-primary">
          {number}
        </span>

        <div className="flex items-center gap-2">
          <h2 className="text-xl font-black tracking-tight sm:text-2xl">
            {title}
          </h2>

          {icon && (
            <span className="text-primary">
              {icon}
            </span>
          )}
        </div>
      </div>

      <div className="mt-4 space-y-4 text-sm leading-7 text-muted-foreground sm:text-[15px]">
        {children}
      </div>
    </section>
  );
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex gap-3 text-sm leading-6 text-muted-foreground">
      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
      <span>{children}</span>
    </li>
  );
}