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
  Plus,
  ShieldCheck,
  Sparkles,
  Trash2,
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

type CartItem = {
  curriculumId: string;
  levelId: string;
  subjectId: string;
  curriculumName: string;
  levelName: string;
  subjectName: string;
  subjectCode: string | null;
  amount: number;
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

  const [cart, setCart] = useState<CartItem[]>([]);

  const [settings, setSettings] =
    useState<PaymentSettings | null>(null);

  const [reference, setReference] = useState("");
  const [proof, setProof] = useState<File | null>(null);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const requestedPlan = params.get("plan");

    if (
      requestedPlan === "premium" ||
      requestedPlan === "subject"
    ) {
      setPlan(requestedPlan);
    }
  }, []);

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

      const [
        curriculumResult,
        levelResult,
        subjectResult,
        settingsResult,
      ] = await Promise.all([
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
          queryError.message ||
            "Unable to load payment information."
        );
        setLoading(false);
        return;
      }

      setCurriculums(
        (curriculumResult.data ?? []) as Curriculum[]
      );

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

  const availableLevels = useMemo(
    () =>
      levels.filter(
        (level) => level.curriculum_id === curriculumId
      ),
    [levels, curriculumId]
  );

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

  const currency = settings?.currency || "LKR";

  const subjectPrice = Number(
    settings?.subject_price ?? 0
  );

  const premiumPrice = Number(
    settings?.premium_price ?? 0
  );

  const cartTotal = cart.reduce(
    (total, item) => total + item.amount,
    0
  );

  const total =
    plan === "premium" ? premiumPrice : cartTotal;

  const formattedTotal = `${currency} ${total.toLocaleString(
    "en-LK"
  )}`;

  const selectionComplete = Boolean(
    curriculumId && levelId && subjectId
  );

  const alreadyInCart = cart.some(
    (item) =>
      item.curriculumId === curriculumId &&
      item.levelId === levelId &&
      item.subjectId === subjectId
  );

  function handleCurriculumChange(value: string) {
    setCurriculumId(value);
    setLevelId("");
    setSubjectId("");
    setError("");
  }

  function handleLevelChange(value: string) {
    setLevelId(value);
    setSubjectId("");
    setError("");
  }

  function selectPlan(value: Plan) {
    setPlan(value);
    setError("");

    setCurriculumId("");
    setLevelId("");
    setSubjectId("");
  }

  function addSubject() {
    setError("");

    if (!selectionComplete) {
      setError(
        "Please select a curriculum, level and subject."
      );
      return;
    }

    if (
      !selectedCurriculum ||
      !selectedLevel ||
      !selectedSubject
    ) {
      setError(
        "The selected subject could not be found."
      );
      return;
    }

    if (alreadyInCart) {
      setError(
        "This subject combination is already in your selection."
      );
      return;
    }

    setCart((current) => [
      ...current,
      {
        curriculumId,
        levelId,
        subjectId,
        curriculumName: selectedCurriculum.name,
        levelName: selectedLevel.name,
        subjectName: selectedSubject.name,
        subjectCode: selectedSubject.code,
        amount: subjectPrice,
      },
    ]);

    setCurriculumId("");
    setLevelId("");
    setSubjectId("");
  }

  function removeSubject(
    curriculum: string,
    level: string,
    subject: string
  ) {
    setCart((current) =>
      current.filter(
        (item) =>
          !(
            item.curriculumId === curriculum &&
            item.levelId === level &&
            item.subjectId === subject
          )
      )
    );
  }

  async function uploadProof(userId: string) {
    if (!proof) return null;

    if (!proof.type.startsWith("image/")) {
      throw new Error(
        "Payment proof must be an image."
      );
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

    const path = `${userId}/${crypto.randomUUID()}-${safeName}`;

    const upload = await supabase.storage
      .from("payment-proofs")
      .upload(path, proof, {
        upsert: false,
        contentType: proof.type,
      });

    if (upload.error) {
      throw upload.error;
    }

    return supabase.storage
      .from("payment-proofs")
      .getPublicUrl(path).data.publicUrl;
  }

  async function submitPaymentRequest() {
    setError("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError(
        "Your session has expired. Please log in again."
      );
      return;
    }

    if (!settings?.is_active) {
      setError(
        "Payments are currently unavailable."
      );
      return;
    }

    if (plan === "subject" && cart.length === 0) {
      setError(
        "Add at least one subject before continuing."
      );
      return;
    }

    if (plan === "premium" && premiumPrice <= 0) {
      setError(
        "Premium pricing is currently unavailable."
      );
      return;
    }

    if (plan === "subject" && subjectPrice <= 0) {
      setError(
        "Subject pricing is currently unavailable."
      );
      return;
    }

    if (!reference.trim()) {
      setError(
        "Please enter your payment reference."
      );
      return;
    }

    setSubmitting(true);

    try {
      const proofUrl = await uploadProof(user.id);

      /*
       * One payment request represents the entire checkout.
       *
       * For a subject checkout the academic fields on the
       * parent request remain NULL. The exact selections live
       * in payment_request_items.
       */
      const { data: request, error: requestError } =
        await supabase
          .from("payment_requests")
          .insert({
            user_id: user.id,
            plan_type: plan,

            curriculum_id: null,
            level_id: null,
            subject_id: null,

            amount: total,
            currency,

            payment_reference: reference.trim(),
            proof_image_url: proofUrl,

            status: "pending",
          })
          .select("id")
          .single();

      if (requestError) {
        throw requestError;
      }

      if (!request) {
        throw new Error(
          "Payment request could not be created."
        );
      }

      /*
       * Subject cart:
       * create one item for every selected combination.
       */
      if (plan === "subject") {
        const items = cart.map((item) => ({
          payment_request_id: request.id,
          curriculum_id: item.curriculumId,
          level_id: item.levelId,
          subject_id: item.subjectId,
          amount: item.amount,
        }));

        const { error: itemsError } = await supabase
          .from("payment_request_items")
          .insert(items);

        if (itemsError) {
          /*
           * Best-effort cleanup. The request should not remain
           * orphaned if its cart items cannot be inserted.
           */
          await supabase
            .from("payment_requests")
            .delete()
            .eq("id", request.id);

          throw itemsError;
        }
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

  if (loading) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center bg-background">
        <Loader2 className="h-7 w-7 animate-spin text-primary" />
      </main>
    );
  }

  if (success) {
    return (
      <main className="min-h-screen bg-background px-5 py-12 sm:px-8">
        <div className="mx-auto flex min-h-[70vh] max-w-xl items-center">
          <section className="w-full rounded-3xl border border-border bg-card p-8 text-center shadow-sm sm:p-10">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10">
              <CheckCircle2 className="h-8 w-8 text-emerald-600" />
            </div>

            <p className="mt-6 text-sm font-bold uppercase tracking-[0.15em] text-primary">
              Request submitted
            </p>

            <h1 className="mt-2 text-3xl font-extrabold tracking-tight">
              Payment is under review
            </h1>

            <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-muted-foreground">
              Your payment request has been submitted
              successfully. Your subscription will become
              active after an administrator approves the
              payment.
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
        </div>
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
              Build your access, review your order, and submit
              your payment for approval.
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-2xl border border-destructive/20 bg-destructive/5 px-5 py-4 text-sm font-medium text-destructive">
            {error}
          </div>
        )}

        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
          {/* LEFT */}
          <section className="space-y-6">
            {/* PLAN */}
            <section className="rounded-3xl border border-border bg-card p-5 shadow-sm sm:p-7">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
                Step 01
              </p>

              <h2 className="mt-1 text-xl font-extrabold">
                Choose your access
              </h2>

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

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <BookIcon />
                  </div>

                  <p className="mt-4 font-extrabold">
                    Subject access
                  </p>

                  <p className="mt-1 text-sm leading-5 text-muted-foreground">
                    Choose one or more specific curriculum,
                    level and subject combinations.
                  </p>

                  <p className="mt-4 text-sm font-bold text-primary">
                    {currency}{" "}
                    {subjectPrice.toLocaleString("en-LK")}{" "}
                    / subject
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

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Sparkles className="h-5 w-5" />
                  </div>

                  <p className="mt-4 font-extrabold">
                    Premium
                  </p>

                  <p className="mt-1 text-sm leading-5 text-muted-foreground">
                    One subscription for all available subjects.
                  </p>

                  <p className="mt-4 text-sm font-bold text-primary">
                    {currency}{" "}
                    {premiumPrice.toLocaleString("en-LK")}
                  </p>
                </button>
              </div>
            </section>

            {/* SUBJECT BUILDER */}
            {plan === "subject" && (
              <section className="rounded-3xl border border-border bg-card p-5 shadow-sm sm:p-7">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
                  Step 02
                </p>

                <h2 className="mt-1 text-xl font-extrabold">
                  Add subjects
                </h2>

                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Select the exact curriculum, level and subject
                  combination you want to add to your checkout.
                </p>

                <div className="mt-6 grid gap-4">
                  <SelectField
                    label="Curriculum"
                    value={curriculumId}
                    onChange={handleCurriculumChange}
                    placeholder="Select curriculum"
                    disabled={false}
                    options={curriculums.map((item) => ({
                      value: item.id,
                      label: item.name,
                    }))}
                  />

                  <SelectField
                    label="Level"
                    value={levelId}
                    onChange={handleLevelChange}
                    placeholder={
                      curriculumId
                        ? "Select level"
                        : "Select curriculum first"
                    }
                    disabled={!curriculumId}
                    options={availableLevels.map((item) => ({
                      value: item.id,
                      label: item.name,
                    }))}
                  />

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
                    disabled={!levelId}
                    options={availableSubjects.map((item) => ({
                      value: item.id,
                      label: item.code
                        ? `${item.name} (${item.code})`
                        : item.name,
                    }))}
                  />
                </div>

                <button
                  type="button"
                  onClick={addSubject}
                  disabled={
                    !selectionComplete ||
                    alreadyInCart ||
                    subjectPrice <= 0
                  }
                  className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-primary bg-primary/5 px-4 text-sm font-bold text-primary transition hover:bg-primary/10 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Plus className="h-4 w-4" />

                  {alreadyInCart
                    ? "Already added"
                    : "Add subject"}
                </button>

                {cart.length > 0 && (
                  <div className="mt-6 rounded-2xl bg-muted/30 p-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-extrabold">
                        Selected subjects
                      </p>

                      <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary">
                        {cart.length}
                      </span>
                    </div>

                    <div className="mt-3 space-y-2">
                      {cart.map((item) => (
                        <CartItemCard
                          key={`${item.curriculumId}-${item.levelId}-${item.subjectId}`}
                          item={item}
                          currency={currency}
                          onRemove={() =>
                            removeSubject(
                              item.curriculumId,
                              item.levelId,
                              item.subjectId
                            )
                          }
                        />
                      ))}
                    </div>
                  </div>
                )}
              </section>
            )}

            {/* PAYMENT */}
            <section className="rounded-3xl border border-border bg-card p-5 shadow-sm sm:p-7">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
                Step {plan === "subject" ? "03" : "02"}
              </p>

              <h2 className="mt-1 text-xl font-extrabold">
                Payment details
              </h2>

              <div className="mt-6 space-y-5">
                <label className="block">
                  <span className="text-sm font-bold">
                    Payment reference
                  </span>

                  <span className="mt-1 block text-xs leading-5 text-muted-foreground">
                    Enter the transaction or bank transfer
                    reference.
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
                      optional
                    </span>
                  </span>

                  <input
                    id="payment-proof"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(event) =>
                      setProof(
                        event.target.files?.[0] ?? null
                      )
                    }
                  />

                  <label
                    htmlFor="payment-proof"
                    className="mt-3 flex cursor-pointer items-center gap-4 rounded-2xl border border-dashed border-border bg-muted/20 p-5 transition hover:border-primary/40 hover:bg-primary/[0.03]"
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-background text-muted-foreground shadow-sm">
                      {proof ? (
                        <FileImage className="h-5 w-5 text-primary" />
                      ) : (
                        <Upload className="h-5 w-5" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold">
                        {proof
                          ? proof.name
                          : "Upload payment receipt"}
                      </p>

                      <p className="mt-1 text-xs text-muted-foreground">
                        {proof
                          ? "Click to replace"
                          : "JPG, PNG or WEBP · Maximum 5 MB"}
                      </p>
                    </div>
                  </label>
                </label>
              </div>
            </section>
          </section>

          {/* RIGHT */}
          <aside className="space-y-6">
            {/* ORDER SUMMARY */}
            <section className="rounded-3xl border border-border bg-card p-5 shadow-sm sm:p-7">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
                Order summary
              </p>

              <div className="mt-1 flex items-end justify-between gap-4">
                <h2 className="text-xl font-extrabold">
                  Your order
                </h2>

                {plan === "subject" &&
                  cart.length > 0 && (
                    <span className="text-xs font-bold text-muted-foreground">
                      {cart.length}{" "}
                      {cart.length === 1
                        ? "subject"
                        : "subjects"}
                    </span>
                  )}
              </div>

              {/* This is the ONLY scrollable area in the summary */}
              <div className="mt-5 max-h-[min(45vh,420px)] space-y-2 overflow-y-auto pr-1">
                {plan === "premium" ? (
                  <div className="rounded-2xl border border-primary/15 bg-primary/5 p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <Sparkles className="h-4 w-4" />
                      </div>

                      <div className="min-w-0">
                        <p className="text-sm font-extrabold">
                          Premium
                        </p>

                        <p className="mt-1 text-xs leading-5 text-muted-foreground">
                          All available subjects
                        </p>
                      </div>

                      <span className="ml-auto shrink-0 text-sm font-bold">
                        {currency}{" "}
                        {premiumPrice.toLocaleString(
                          "en-LK"
                        )}
                      </span>
                    </div>
                  </div>
                ) : cart.length > 0 ? (
                  cart.map((item) => (
                    <CartItemCard
                      key={`${item.curriculumId}-${item.levelId}-${item.subjectId}`}
                      item={item}
                      currency={currency}
                      compact
                      onRemove={() =>
                        removeSubject(
                          item.curriculumId,
                          item.levelId,
                          item.subjectId
                        )
                      }
                    />
                  ))
                ) : (
                  <div className="rounded-2xl border border-dashed border-border p-6 text-center">
                    <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                      <CreditCard className="h-4 w-4" />
                    </div>

                    <p className="mt-3 text-sm font-bold">
                      Your checkout is empty
                    </p>

                    <p className="mt-1 text-xs leading-5 text-muted-foreground">
                      Add subjects to see them here.
                    </p>
                  </div>
                )}
              </div>

              <div className="my-5 border-t border-border" />

              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-muted-foreground">
                    Total
                  </p>

                  <p className="mt-1 text-3xl font-extrabold tracking-tight">
                    {formattedTotal}
                  </p>
                </div>
              </div>

              <div className="mt-5 flex items-start gap-3 rounded-2xl bg-muted/40 p-4">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />

                <p className="text-xs leading-5 text-muted-foreground">
                  Your payment is manually reviewed. Access is
                  activated only after an administrator approves
                  the request.
                </p>
              </div>
            </section>

            {/* PAYMENT METHOD */}
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
                  (plan === "subject" && cart.length === 0) ||
                  (plan === "premium" &&
                    premiumPrice <= 0)
                }
                onClick={() =>
                  void submitPaymentRequest()
                }
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

              {plan === "subject" &&
                cart.length === 0 && (
                  <p className="mt-3 text-center text-xs text-muted-foreground">
                    Add at least one subject to continue.
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
/* Components                                                                 */
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
      <span className="text-sm font-bold">
        {label}
      </span>

      <div className="relative mt-2">
        <select
          value={value}
          onChange={(event) =>
            onChange(event.target.value)
          }
          disabled={disabled}
          className="h-12 w-full appearance-none rounded-xl border border-input bg-background px-4 pr-11 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <option value="">
            {placeholder}
          </option>

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

function CartItemCard({
  item,
  currency,
  onRemove,
  compact = false,
}: {
  item: CartItem;
  currency: string;
  onRemove: () => void;
  compact?: boolean;
}) {
  return (
    <div
      className={`group flex items-center gap-3 rounded-2xl border border-border bg-background ${
        compact ? "p-3" : "p-4"
      }`}
    >
      <div
        className={`flex shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ${
          compact ? "h-8 w-8" : "h-9 w-9"
        }`}
      >
        <Check
          className={
            compact ? "h-3.5 w-3.5" : "h-4 w-4"
          }
        />
      </div>

      <div className="min-w-0 flex-1">
        <p
          className={`truncate font-bold ${
            compact ? "text-xs" : "text-sm"
          }`}
        >
          {item.subjectName}
          {item.subjectCode
            ? ` (${item.subjectCode})`
            : ""}
        </p>

        <p
          className={`mt-0.5 truncate text-muted-foreground ${
            compact ? "text-[10px]" : "text-xs"
          }`}
        >
          {item.curriculumName} · {item.levelName}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <span
          className={`font-bold ${
            compact ? "text-xs" : "text-sm"
          }`}
        >
          {currency}{" "}
          {item.amount.toLocaleString("en-LK")}
        </span>

        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove ${item.subjectName}`}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

function BookIcon() {
  return (
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
  );
}