"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronDown,
  CreditCard,
  FileImage,
  Loader2,
  ShieldCheck,
  Sparkles,
  Upload,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Plan = "subject" | "premium";

type Curriculum = {
  id: string;
  name: string;
};

type Level = {
  id: string;
  name: string;
  curriculum_id: string;
};

type Subject = {
  id: string;
  name: string;
  code: string | null;
  level_id: string;
};

type PaymentSettings = {
  payment_method: string;
  qr_image_url: string | null;
  account_name: string | null;
  instructions: string | null;
  subject_price: number | null;
  premium_price: number | null;
  currency: string;
  is_active: boolean;
};

export default function PaymentPage() {
  const supabase = useMemo(() => createClient(), []);

  const [plan, setPlan] = useState<Plan>("subject");

  const [curriculums, setCurriculums] = useState<Curriculum[]>([]);
  const [levels, setLevels] = useState<Level[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);

  const [curriculumId, setCurriculumId] = useState("");
  const [levelId, setLevelId] = useState("");
  const [subjectId, setSubjectId] = useState("");

  const [settings, setSettings] = useState<PaymentSettings | null>(null);

  const [reference, setReference] = useState("");
  const [proof, setProof] = useState<File | null>(null);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  /*
   * Load the currently selected plan from the pricing page.
   *
   * Examples:
   * /student/payment?plan=subject
   * /student/payment?plan=premium
   */
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const requestedPlan = params.get("plan");

    if (requestedPlan === "premium" || requestedPlan === "subject") {
      setPlan(requestedPlan);
    }
  }, []);

  /*
   * Load payment data and the complete academic hierarchy.
   */
  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      setError("");

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        if (mounted) {
          setError("Please log in to continue.");
          setLoading(false);
        }
        return;
      }

      const [curriculumResult, levelResult, subjectResult, settingsResult] =
        await Promise.all([
          supabase
            .from("curriculums")
            .select("id,name")
            .eq("is_active", true)
            .order("name"),

          supabase
            .from("levels")
            .select("id,name,curriculum_id")
            .eq("is_active", true)
            .order("name"),

          supabase
            .from("subjects")
            .select("id,name,code,level_id")
            .eq("is_active", true)
            .order("name"),

          supabase
            .from("payment_settings")
            .select(
              "payment_method,qr_image_url,account_name,instructions,subject_price,premium_price,currency,is_active"
            )
            .limit(1)
            .maybeSingle(),
        ]);

      if (!mounted) return;

      const queryError =
        curriculumResult.error ||
        levelResult.error ||
        subjectResult.error ||
        settingsResult.error;

      if (queryError) {
        setError(
          queryError.message || "Unable to load payment information."
        );
        setLoading(false);
        return;
      }

      setCurriculums((curriculumResult.data ?? []) as Curriculum[]);
      setLevels((levelResult.data ?? []) as Level[]);
      setSubjects((subjectResult.data ?? []) as Subject[]);
      setSettings(
        settingsResult.data
          ? (settingsResult.data as PaymentSettings)
          : null
      );

      setLoading(false);
    }

    void load();

    return () => {
      mounted = false;
    };
  }, [supabase]);

  /*
   * Only show levels belonging to the selected curriculum.
   */
  const availableLevels = useMemo(
    () =>
      levels.filter(
        (level) => level.curriculum_id === curriculumId
      ),
    [levels, curriculumId]
  );

  /*
   * Only show subjects belonging to the selected level.
   */
  const availableSubjects = useMemo(
    () =>
      subjects.filter(
        (subject) => subject.level_id === levelId
      ),
    [subjects, levelId]
  );

  const selectedCurriculum = curriculums.find(
    (item) => item.id === curriculumId
  );

  const selectedLevel = levels.find(
    (item) => item.id === levelId
  );

  const selectedSubject = subjects.find(
    (item) => item.id === subjectId
  );

  const price =
    plan === "premium"
      ? settings?.premium_price
      : settings?.subject_price;

  const currency = settings?.currency || "LKR";

  const formattedPrice =
    price != null
      ? `${currency} ${Number(price).toLocaleString("en-LK")}`
      : "—";

  /*
   * Changing curriculum resets level + subject.
   */
  function handleCurriculumChange(value: string) {
    setCurriculumId(value);
    setLevelId("");
    setSubjectId("");
    setError("");
  }

  /*
   * Changing level resets subject.
   */
  function handleLevelChange(value: string) {
    setLevelId(value);
    setSubjectId("");
    setError("");
  }

  function selectPlan(value: Plan) {
    setPlan(value);
    setError("");

    if (value === "premium") {
      setCurriculumId("");
      setLevelId("");
      setSubjectId("");
    }
  }

  /*
   * Subject purchases require the complete
   * Curriculum → Level → Subject combination.
   */
  const selectionComplete =
    plan === "premium" ||
    Boolean(curriculumId && levelId && subjectId);

  async function submitPaymentRequest() {
    setError("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("Your session has expired. Please log in again.");
      return;
    }

    if (!settings?.is_active) {
      setError("Payments are currently unavailable.");
      return;
    }

    if (!price || Number(price) <= 0) {
      setError("This plan does not currently have a valid price.");
      return;
    }

    if (
      plan === "subject" &&
      (!curriculumId || !levelId || !subjectId)
    ) {
      setError(
        "Please select a curriculum, level and subject before continuing."
      );
      return;
    }

    if (!reference.trim()) {
      setError("Please enter your payment reference.");
      return;
    }

    setSubmitting(true);

    try {
      let proofUrl: string | null = null;

      /*
       * Upload payment proof if supplied.
       */
      if (proof) {
        if (!proof.type.startsWith("image/")) {
          throw new Error("Payment proof must be an image.");
        }

        if (proof.size > 5 * 1024 * 1024) {
          throw new Error(
            "Payment proof must be 5 MB or smaller."
          );
        }

        const safeName = proof.name.replace(
          /[^a-zA-Z0-9._-]/g,
          "_"
        );

        const path = `${user.id}/${crypto.randomUUID()}-${safeName}`;

        const upload = await supabase.storage
          .from("payment-proofs")
          .upload(path, proof, {
            upsert: false,
            contentType: proof.type,
          });

        if (upload.error) {
          throw upload.error;
        }

        proofUrl = supabase.storage
          .from("payment-proofs")
          .getPublicUrl(path).data.publicUrl;
      }

      /*
       * Create the payment request.
       *
       * Subject:
       *   curriculum_id + level_id + subject_id
       *
       * Premium:
       *   all three are NULL.
       */
      const { error: insertError } = await supabase
        .from("payment_requests")
        .insert({
          user_id: user.id,
          plan_type: plan,

          curriculum_id:
            plan === "subject"
              ? curriculumId
              : null,

          level_id:
            plan === "subject"
              ? levelId
              : null,

          subject_id:
            plan === "subject"
              ? subjectId
              : null,

          amount: Number(price),
          currency,

          payment_reference: reference.trim(),

          proof_image_url: proofUrl,

          status: "pending",
        });

      if (insertError) {
        throw insertError;
      }

      setSuccess(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to submit payment request."
      );
    } finally {
      setSubmitting(false);
    }
  }

  /*
   * Loading state.
   */
  if (loading) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center">
        <Loader2 className="h-7 w-7 animate-spin text-primary" />
      </main>
    );
  }

  /*
   * Success state.
   */
  if (success) {
    return (
      <main className="mx-auto flex min-h-[70vh] max-w-xl items-center px-5 py-16">
        <section className="w-full rounded-3xl border border-border bg-card p-8 text-center shadow-sm sm:p-10">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10">
            <CheckCircle2 className="h-8 w-8 text-emerald-600" />
          </div>

          <p className="mt-6 text-sm font-bold uppercase tracking-wider text-primary">
            Request submitted
          </p>

          <h1 className="mt-2 text-3xl font-extrabold tracking-tight">
            Payment is under review
          </h1>

          <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-muted-foreground">
            Your payment request has been submitted successfully.
            Your subscription will become active after an admin
            approves the payment.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/student/subscription"
              className="inline-flex h-11 items-center justify-center rounded-xl bg-primary px-5 text-sm font-bold text-primary-foreground"
            >
              View subscription
            </Link>

            <Link
              href="/question-bank"
              className="inline-flex h-11 items-center justify-center rounded-xl border border-border bg-background px-5 text-sm font-bold"
            >
              Back to Question Bank
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-12">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground transition hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to pricing
          </Link>

          <div className="mt-7">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              iSkole Subscription
            </div>

            <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">
              Complete your subscription
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              Choose what you want access to, complete the payment,
              and submit the transaction for review.
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-2xl border border-destructive/20 bg-destructive/5 px-5 py-4 text-sm font-medium text-destructive">
            {error}
          </div>
        )}

        {/* Main layout */}
        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          {/* LEFT */}
          <section className="space-y-6">
            {/* Plan selector */}
            <section className="rounded-3xl border border-border bg-card p-5 shadow-sm sm:p-7">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Step 01
                  </p>

                  <h2 className="mt-1 text-xl font-extrabold">
                    Choose your access
                  </h2>
                </div>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => selectPlan("subject")}
                  className={`relative rounded-2xl border p-5 text-left transition ${
                    plan === "subject"
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "border-border hover:border-primary/30"
                  }`}
                >
                  {plan === "subject" && (
                    <span className="absolute right-4 top-4 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <Check className="h-3.5 w-3.5" />
                    </span>
                  )}

                  <BookIcon />

                  <p className="mt-4 font-extrabold">
                    One Subject
                  </p>

                  <p className="mt-1 text-sm leading-5 text-muted-foreground">
                    Get access to one specific curriculum, level
                    and subject.
                  </p>

                  <p className="mt-4 text-sm font-bold text-primary">
                    {settings?.subject_price != null
                      ? `${currency} ${Number(
                          settings.subject_price
                        ).toLocaleString("en-LK")}`
                      : "—"}
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => selectPlan("premium")}
                  className={`relative rounded-2xl border p-5 text-left transition ${
                    plan === "premium"
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "border-border hover:border-primary/30"
                  }`}
                >
                  {plan === "premium" && (
                    <span className="absolute right-4 top-4 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <Check className="h-3.5 w-3.5" />
                    </span>
                  )}

                  <Sparkles className="h-5 w-5 text-primary" />

                  <p className="mt-4 font-extrabold">
                    Premium
                  </p>

                  <p className="mt-1 text-sm leading-5 text-muted-foreground">
                    Get access to all available subjects through
                    one subscription.
                  </p>

                  <p className="mt-4 text-sm font-bold text-primary">
                    {settings?.premium_price != null
                      ? `${currency} ${Number(
                          settings.premium_price
                        ).toLocaleString("en-LK")}`
                      : "—"}
                  </p>
                </button>
              </div>
            </section>

            {/* Academic selection */}
            {plan === "subject" && (
              <section className="rounded-3xl border border-border bg-card p-5 shadow-sm sm:p-7">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Step 02
                  </p>

                  <h2 className="mt-1 text-xl font-extrabold">
                    Choose your subject
                  </h2>

                  <p className="mt-2 text-sm leading-5 text-muted-foreground">
                    Select the exact curriculum, level and subject
                    you want to subscribe to.
                  </p>
                </div>

                <div className="mt-6 space-y-4">
                  {/* Curriculum */}
                  <SelectField
                    label="Curriculum"
                    value={curriculumId}
                    onChange={handleCurriculumChange}
                    placeholder="Select curriculum"
                    options={curriculums.map((item) => ({
                      value: item.id,
                      label: item.name,
                    }))}
                    disabled={false}
                  />

                  {/* Level */}
                  <SelectField
                    label="Level"
                    value={levelId}
                    onChange={handleLevelChange}
                    placeholder={
                      curriculumId
                        ? "Select level"
                        : "Select curriculum first"
                    }
                    options={availableLevels.map((item) => ({
                      value: item.id,
                      label: item.name,
                    }))}
                    disabled={!curriculumId}
                  />

                  {/* Subject */}
                  <SelectField
                    label="Subject"
                    value={subjectId}
                    onChange={(value) => {
                      setSubjectId(value);
                      setError("");
                    }}
                    placeholder={
                      levelId
                        ? "Select subject"
                        : "Select level first"
                    }
                    options={availableSubjects.map((item) => ({
                      value: item.id,
                      label: item.code
                        ? `${item.name} (${item.code})`
                        : item.name,
                    }))}
                    disabled={!levelId}
                  />
                </div>

                {selectionComplete && selectedSubject && (
                  <div className="mt-6 rounded-2xl bg-primary/5 p-5">
                    <div className="flex items-start gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <Check className="h-4 w-4" />
                      </div>

                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-primary">
                          Selected subscription
                        </p>

                        <p className="mt-1 font-extrabold">
                          {selectedSubject.name}
                        </p>

                        <p className="mt-1 text-sm text-muted-foreground">
                          {selectedCurriculum?.name} ·{" "}
                          {selectedLevel?.name}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </section>
            )}

            {/* Payment details */}
            <section className="rounded-3xl border border-border bg-card p-5 shadow-sm sm:p-7">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Step {plan === "subject" ? "03" : "02"}
                </p>

                <h2 className="mt-1 text-xl font-extrabold">
                  Confirm payment
                </h2>
              </div>

              <div className="mt-6 space-y-5">
                <label className="block">
                  <span className="text-sm font-bold">
                    Payment reference
                  </span>

                  <span className="mt-1 block text-xs text-muted-foreground">
                    Enter the bank transfer or transaction reference.
                  </span>

                  <input
                    value={reference}
                    onChange={(event) =>
                      setReference(event.target.value)
                    }
                    placeholder="e.g. TXN123456789"
                    className="mt-3 h-12 w-full rounded-xl border border-input bg-background px-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-bold">
                    Payment proof
                    <span className="ml-1 font-normal text-muted-foreground">
                      (optional)
                    </span>
                  </span>

                  <div className="mt-3 rounded-2xl border border-dashed border-border bg-muted/20 p-5">
                    <input
                      id="payment-proof"
                      type="file"
                      accept="image/*"
                      onChange={(event) =>
                        setProof(
                          event.target.files?.[0] ?? null
                        )
                      }
                      className="hidden"
                    />

                    <label
                      htmlFor="payment-proof"
                      className="flex cursor-pointer flex-col items-center justify-center text-center"
                    >
                      {proof ? (
                        <>
                          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                            <FileImage className="h-5 w-5" />
                          </div>

                          <p className="mt-3 max-w-full truncate text-sm font-bold">
                            {proof.name}
                          </p>

                          <p className="mt-1 text-xs text-muted-foreground">
                            Click to replace
                          </p>
                        </>
                      ) : (
                        <>
                          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-background text-muted-foreground shadow-sm">
                            <Upload className="h-5 w-5" />
                          </div>

                          <p className="mt-3 text-sm font-bold">
                            Upload payment receipt
                          </p>

                          <p className="mt-1 text-xs text-muted-foreground">
                            JPG, PNG or WEBP · Maximum 5 MB
                          </p>
                        </>
                      )}
                    </label>
                  </div>
                </label>
              </div>
            </section>
          </section>

          {/* RIGHT */}
          <aside className="space-y-6">
            {/* Order summary */}
            <section className="rounded-3xl border border-border bg-card p-5 shadow-sm sm:p-7 lg:sticky lg:top-6">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Your order
              </p>

              <h2 className="mt-1 text-xl font-extrabold">
                Subscription summary
              </h2>

              <div className="mt-6 space-y-4">
                <SummaryRow
                  label="Plan"
                  value={
                    plan === "premium"
                      ? "Premium"
                      : "One Subject"
                  }
                />

                {plan === "subject" && (
                  <>
                    <SummaryRow
                      label="Curriculum"
                      value={
                        selectedCurriculum?.name || "Not selected"
                      }
                    />

                    <SummaryRow
                      label="Level"
                      value={
                        selectedLevel?.name || "Not selected"
                      }
                    />

                    <SummaryRow
                      label="Subject"
                      value={
                        selectedSubject?.name || "Not selected"
                      }
                    />
                  </>
                )}
              </div>

              <div className="my-6 border-t border-border" />

              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-muted-foreground">
                    Total
                  </p>

                  <p className="mt-1 text-3xl font-extrabold tracking-tight">
                    {formattedPrice}
                  </p>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <CreditCard className="h-5 w-5" />
                </div>
              </div>

              <div className="mt-6 flex items-start gap-3 rounded-2xl bg-muted/40 p-4">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />

                <p className="text-xs leading-5 text-muted-foreground">
                  Your payment is reviewed manually. Access is
                  activated only after an administrator confirms
                  the payment.
                </p>
              </div>
            </section>

            {/* Payment method */}
            <section className="rounded-3xl border border-border bg-card p-5 shadow-sm sm:p-7">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <CreditCard className="h-5 w-5" />
                </div>

                <div>
                  <p className="text-xs font-semibold text-muted-foreground">
                    Payment method
                  </p>

                  <p className="font-extrabold">
                    {settings?.payment_method ||
                      "Manual payment"}
                  </p>
                </div>
              </div>

              {settings?.qr_image_url && (
                <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-white p-4">
                  <Image
                    src={settings.qr_image_url}
                    alt="Payment QR code"
                    width={420}
                    height={420}
                    className="mx-auto aspect-square w-full max-w-xs object-contain"
                    unoptimized
                  />
                </div>
              )}

              {settings?.account_name && (
                <div className="mt-5 rounded-2xl bg-muted/40 p-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Account
                  </p>

                  <p className="mt-1 text-sm font-bold">
                    {settings.account_name}
                  </p>
                </div>
              )}

              {settings?.instructions && (
                <div className="mt-5">
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Instructions
                  </p>

                  <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
                    {settings.instructions}
                  </p>
                </div>
              )}

              <button
                type="button"
                disabled={
                  submitting ||
                  !settings?.is_active ||
                  !selectionComplete
                }
                onClick={() => void submitPaymentRequest()}
                className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-bold text-primary-foreground shadow-sm transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    Submit payment request
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>

              {!selectionComplete && plan === "subject" && (
                <p className="mt-3 text-center text-xs text-muted-foreground">
                  Select a curriculum, level and subject to
                  continue.
                </p>
              )}
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}

/* -------------------------------------------------------------------------- */
/* Small reusable UI pieces                                                   */
/* -------------------------------------------------------------------------- */

function SelectField({
  label,
  value,
  onChange,
  placeholder,
  options,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  options: { value: string; label: string }[];
  disabled: boolean;
}) {
  return (
    <label className="block">
      <span className="text-sm font-bold">{label}</span>

      <div className="relative mt-2">
        <select
          value={value}
          onChange={(event) =>
            onChange(event.target.value)
          }
          disabled={disabled}
          className="h-12 w-full appearance-none rounded-xl border border-input bg-background px-4 pr-11 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <option value="">{placeholder}</option>

          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
            >
              {option.label}
            </option>
          ))}
        </select>

        <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      </div>
    </label>
  );
}

function SummaryRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4 text-sm">
      <span className="text-muted-foreground">
        {label}
      </span>

      <span
        className={`max-w-[60%] text-right font-bold ${
          value === "Not selected"
            ? "text-muted-foreground"
            : "text-foreground"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

function BookIcon() {
  return (
    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="h-5 w-5"
      >
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" />
      </svg>
    </div>
  );
}