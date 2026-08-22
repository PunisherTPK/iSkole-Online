import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Database,
  FileText,
  Lock,
  Mail,
  ShieldCheck,
  UserCheck,
} from "lucide-react";

import Navbar from "@/components/public/Navbar";
import Footer from "@/components/public/Footer";

export default function PrivacyPage() {
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
                <Lock className="h-6 w-6" />
              </div>

              <p className="mt-6 text-xs font-extrabold uppercase tracking-[0.2em] text-primary">
                Legal
              </p>

              <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">
                Privacy Policy
              </h1>

              <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
                Your privacy matters. This policy explains what information
                iSkole collects, why we use it, and how we protect it.
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
                    ["1", "Overview"],
                    ["2", "Information we collect"],
                    ["3", "How we use information"],
                    ["4", "Accounts and profiles"],
                    ["5", "Payments"],
                    ["6", "Payment proof"],
                    ["7", "Contact messages"],
                    ["8", "Teachers and students"],
                    ["9", "Cookies and local storage"],
                    ["10", "Third-party services"],
                    ["11", "Data security"],
                    ["12", "Data retention"],
                    ["13", "Your rights"],
                    ["14", "Children and minors"],
                    ["15", "Changes"],
                    ["16", "Contact us"],
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

            {/* POLICY */}
            <article className="min-w-0 space-y-10">
              <Intro />

              <PrivacySection
                id="section-1"
                number="1"
                title="Overview"
                icon={<ShieldCheck className="h-4 w-4" />}
              >
                <p>
                  iSkole is an online educational platform that provides
                  learning resources, question-based practice, teacher
                  content and related educational services.
                </p>

                <p>
                  This Privacy Policy explains how information may be
                  collected and processed when you visit the iSkole website,
                  create an account, use our services, communicate with us
                  or purchase a subscription.
                </p>

                <p>
                  By using iSkole, you acknowledge that your information may
                  be handled as described in this policy.
                </p>
              </PrivacySection>

              <PrivacySection
                id="section-2"
                number="2"
                title="Information we collect"
                icon={<Database className="h-4 w-4" />}
              >
                <p>
                  Depending on how you use iSkole, we may collect the
                  following categories of information:
                </p>

                <InfoGroup title="Account information">
                  <Bullet>Full name</Bullet>
                  <Bullet>Email address</Bullet>
                  <Bullet>Account role, such as student, teacher or admin</Bullet>
                  <Bullet>Account authentication information</Bullet>
                </InfoGroup>

                <InfoGroup title="Profile information">
                  <Bullet>Profile picture</Bullet>
                  <Bullet>Teacher or mentor information you choose to provide</Bullet>
                  <Bullet>Educational or subject-related information associated with your profile</Bullet>
                </InfoGroup>

                <InfoGroup title="Platform activity">
                  <Bullet>Question-bank activity</Bullet>
                  <Bullet>Content and subjects you access</Bullet>
                  <Bullet>Subscription and access information</Bullet>
                  <Bullet>Information needed to operate platform features</Bullet>
                </InfoGroup>
              </PrivacySection>

              <PrivacySection
                id="section-3"
                number="3"
                title="How we use information"
              >
                <p>
                  Information collected through iSkole may be used to:
                </p>

                <div className="rounded-2xl border border-border bg-muted/30 p-5">
                  <ul className="space-y-3">
                    <Bullet>Provide and operate your iSkole account.</Bullet>
                    <Bullet>Authenticate users and maintain secure sessions.</Bullet>
                    <Bullet>Provide access to educational content and subscriptions.</Bullet>
                    <Bullet>Process and verify payment requests.</Bullet>
                    <Bullet>Display relevant teacher and mentor information.</Bullet>
                    <Bullet>Respond to enquiries submitted through the contact form.</Bullet>
                    <Bullet>Maintain, troubleshoot and improve the platform.</Bullet>
                    <Bullet>Detect misuse, fraud or attempts to bypass access controls.</Bullet>
                    <Bullet>Communicate important service-related information.</Bullet>
                  </ul>
                </div>

                <p>
                  We do not intend to collect personal information that is
                  unnecessary for operating the services described above.
                </p>
              </PrivacySection>

              <PrivacySection
                id="section-4"
                number="4"
                title="Accounts and profiles"
                icon={<UserCheck className="h-4 w-4" />}
              >
                <p>
                  When you create an iSkole account, information such as
                  your name and email address is associated with your
                  account.
                </p>

                <p>
                  Users may also provide optional profile information,
                  including a profile picture or teacher-related
                  information.
                </p>

                <p>
                  Teachers who are publicly displayed as mentors may have
                  selected profile information visible to visitors and
                  students. We aim to limit public profile information to
                  information relevant to the educational purpose of the
                  platform.
                </p>
              </PrivacySection>

              <PrivacySection
                id="section-5"
                number="5"
                title="Payments and subscriptions"
                icon={<ShieldCheck className="h-4 w-4" />}
              >
                <p>
                  When you purchase or request a subscription, iSkole may
                  store information necessary to manage the payment request
                  and subscription.
                </p>

                <p>
                  This may include the selected plan, selected subjects,
                  payment amount, payment reference, payment status and
                  dates associated with the request.
                </p>

                <p>
                  Subscription access is linked to your iSkole account so
                  that the platform can determine which educational content
                  you are entitled to access.
                </p>

                <p>
                  iSkole does not need to store your banking password,
                  card PIN or other private banking credentials in order to
                  manage a payment request.
                </p>
              </PrivacySection>

              <PrivacySection
                id="section-6"
                number="6"
                title="Payment proof"
                icon={<FileText className="h-4 w-4" />}
              >
                <p>
                  If a payment requires proof of payment, you may upload an
                  image or document containing information about that
                  transaction.
                </p>

                <p>
                  Payment proof is used for the purpose of verifying the
                  associated payment request and activating the applicable
                  subscription.
                </p>

                <div className="rounded-2xl border border-primary/15 bg-primary/[0.045] p-5">
                  <p className="text-sm font-bold">
                    Please protect your sensitive information.
                  </p>

                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    Do not upload documents containing unrelated passwords,
                    PINs, security codes or other sensitive information that
                    is not necessary to verify your payment.
                  </p>
                </div>

                <p>
                  Payment proof may be accessible to authorised iSkole
                  administrators responsible for reviewing payment requests.
                </p>
              </PrivacySection>

              <PrivacySection
                id="section-7"
                number="7"
                title="Contact messages"
                icon={<Mail className="h-4 w-4" />}
              >
                <p>
                  When you use the iSkole contact form, we collect the
                  information you provide, which may include your name,
                  email address, subject and message.
                </p>

                <p>
                  Contact messages are stored so authorised administrators
                  can review and respond to enquiries.
                </p>

                <p>
                  Your contact information is used primarily for responding
                  to your enquiry and managing communications related to
                  iSkole.
                </p>
              </PrivacySection>

              <PrivacySection
                id="section-8"
                number="8"
                title="Teachers and students"
              >
                <p>
                  iSkole supports different account roles, including
                  students and teachers. Certain information may therefore
                  be visible to other users where required for the platform
                  to function.
                </p>

                <p>
                  For example, authorised teacher profile information may
                  appear on the public mentors page, while student account
                  information is generally kept private and is used to
                  provide the student&apos;s account and learning experience.
                </p>

                <p>
                  Teachers may receive access to information necessary to
                  manage students or educational content where the platform
                  provides such functionality.
                </p>
              </PrivacySection>

              <PrivacySection
                id="section-9"
                number="9"
                title="Cookies and local storage"
              >
                <p>
                  iSkole may use browser storage technologies, including
                  cookies or local storage, where necessary to maintain
                  authentication sessions, remember appropriate preferences
                  and provide core functionality.
                </p>

                <p>
                  These technologies may allow the website to recognise
                  your active session and keep you signed in while you use
                  the platform.
                </p>

                <p>
                  Disabling certain browser storage technologies may cause
                  some iSkole features, particularly authentication-related
                  features, to stop working correctly.
                </p>
              </PrivacySection>

              <PrivacySection
                id="section-10"
                number="10"
                title="Third-party services"
              >
                <p>
                  iSkole may rely on third-party infrastructure and
                  services to provide parts of the platform.
                </p>

                <p>
                  These services may include hosting, database storage,
                  authentication, file storage and other infrastructure
                  required to operate the website.
                </p>

                <p>
                  iSkole does not control the privacy practices of
                  independent third-party services. Where applicable, those
                  services may process information according to their own
                  privacy policies and terms.
                </p>
              </PrivacySection>

              <PrivacySection
                id="section-11"
                number="11"
                title="Data security"
                icon={<Lock className="h-4 w-4" />}
              >
                <p>
                  We take reasonable measures to protect information
                  stored and processed through iSkole.
                </p>

                <p>
                  Access to sensitive platform data is restricted using
                  authentication and role-based access controls where
                  appropriate.
                </p>

                <p>
                  However, no internet service or method of electronic
                  storage can be guaranteed to be completely secure. We
                  therefore cannot guarantee absolute security of
                  information transmitted to or stored by the service.
                </p>
              </PrivacySection>

              <PrivacySection
                id="section-12"
                number="12"
                title="Data retention"
              >
                <p>
                  We retain information for as long as reasonably necessary
                  to provide the services, maintain account records,
                  process transactions, resolve disputes, maintain security
                  and comply with applicable obligations.
                </p>

                <p>
                  Different types of information may therefore be retained
                  for different periods depending on its purpose.
                </p>

                <p>
                  When information is no longer reasonably required, it may
                  be deleted, anonymised or otherwise disposed of in a
                  reasonable manner.
                </p>
              </PrivacySection>

              <PrivacySection
                id="section-13"
                number="13"
                title="Your rights"
              >
                <p>
                  Depending on applicable law, you may have rights relating
                  to your personal information, including the ability to:
                </p>

                <div className="rounded-2xl border border-border bg-muted/30 p-5">
                  <ul className="space-y-3">
                    <Bullet>Request access to personal information associated with your account.</Bullet>
                    <Bullet>Request correction of inaccurate information.</Bullet>
                    <Bullet>Request deletion of information where legally applicable.</Bullet>
                    <Bullet>Ask questions about how your information is used.</Bullet>
                    <Bullet>Contact us regarding privacy concerns.</Bullet>
                  </ul>
                </div>

                <p>
                  Some information may need to be retained where required
                  for legitimate operational, security, legal or
                  transaction-related purposes.
                </p>
              </PrivacySection>

              <PrivacySection
                id="section-14"
                number="14"
                title="Children and minors"
              >
                <p>
                  iSkole is an educational platform that may be used by
                  students who are under the age of 18.
                </p>

                <p>
                  Where a student is a minor, parents, guardians, schools
                  or teachers may be involved in the student&apos;s use of the
                  platform depending on the circumstances.
                </p>

                <p>
                  Users should not submit unnecessary sensitive information
                  about themselves or another person. Parents or guardians
                  who have concerns about a minor&apos;s information may contact
                  us through the contact page.
                </p>
              </PrivacySection>

              <PrivacySection
                id="section-15"
                number="15"
                title="Changes to this policy"
              >
                <p>
                  We may update this Privacy Policy when the platform,
                  services, technology or applicable requirements change.
                </p>

                <p>
                  When changes are made, the updated policy will be
                  published on this page together with a revised update
                  date.
                </p>

                <p>
                  We encourage users to periodically review this page to
                  remain informed about how information is handled.
                </p>
              </PrivacySection>

              <PrivacySection
                id="section-16"
                number="16"
                title="Contact us"
                icon={<Mail className="h-4 w-4" />}
              >
                <p>
                  If you have a question, concern or request relating to
                  your privacy or personal information, please contact
                  iSkole.
                </p>

                <Link
                  href="/contact"
                  className="button-secondary mt-2 inline-flex items-center gap-2"
                >
                  Contact iSkole
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </PrivacySection>

              {/* CLOSING CARD */}
              <div className="rounded-3xl border border-primary/20 bg-primary/[0.045] p-6 sm:p-8">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>

                  <div>
                    <h2 className="font-extrabold">
                      Your information should serve your learning.
                    </h2>

                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      iSkole aims to collect and use information only as
                      reasonably necessary to provide, secure and improve
                      the platform.
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
              Learn with confidence.
            </h2>

            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
              Explore the Question Bank and keep your learning moving
              forward.
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
        At iSkole, we understand that using an educational platform
        involves trust. This Privacy Policy describes the types of
        information that may be collected through iSkole and how that
        information is used to provide the service.
      </p>

      <p className="mt-4 text-sm leading-7 text-muted-foreground">
        We aim to keep information collection proportionate to the
        services we provide and to protect information using reasonable
        technical and organisational measures.
      </p>
    </div>
  );
}

function PrivacySection({
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

function InfoGroup({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border bg-muted/30 p-5">
      <p className="text-sm font-bold text-foreground">{title}</p>

      <ul className="mt-3 space-y-2">
        {children}
      </ul>
    </div>
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