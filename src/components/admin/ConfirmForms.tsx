"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

type PendingConfirmation = {
  form: HTMLFormElement;
  submitter: HTMLElement | null;
  message: string;
  itemName: string;
};

export function ConfirmForms() {
  const [pending, setPending] = useState<PendingConfirmation | null>(null);
  const bypassRef = useRef<HTMLFormElement | null>(null);

  useEffect(() => {
    function confirmSubmit(event: SubmitEvent) {
      const form = event.target instanceof HTMLFormElement ? event.target : null;
      if (!form || bypassRef.current === form) {
        bypassRef.current = null;
        return;
      }

      const message = form.dataset.confirm;
      if (!message) return;

      event.preventDefault();
      const submitter = event.submitter instanceof HTMLElement ? event.submitter : null;
      setPending({
        form,
        submitter,
        message,
        itemName: form.dataset.confirmName ?? findItemName(form),
      });
    }

    document.addEventListener("submit", confirmSubmit);
    return () => document.removeEventListener("submit", confirmSubmit);
  }, []);

  if (!pending) return null;

  return (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-background/80 p-4 backdrop-blur-sm" role="alertdialog" aria-modal="true">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-brand-lg">
        <p className="text-sm font-semibold uppercase tracking-wide text-destructive">Confirm Delete</p>
        <h2 className="mt-2 text-xl font-bold text-foreground">{pending.itemName}</h2>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">{pending.message}</p>
        <p className="mt-3 text-sm font-semibold text-destructive">This action cannot be undone.</p>
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" className="rounded-xl" onClick={() => setPending(null)}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            className="rounded-xl"
            onClick={() => {
              const { form, submitter } = pending;
              bypassRef.current = form;
              setPending(null);
              if (submitter instanceof HTMLButtonElement || submitter instanceof HTMLInputElement) {
                form.requestSubmit(submitter);
              } else {
                form.requestSubmit();
              }
            }}
          >
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
}

function findItemName(form: HTMLFormElement) {
  const explicit = form.querySelector<HTMLInputElement>("[name='name'], [name='title']");
  if (explicit?.value) return explicit.value;
  const heading = form.closest("article,div,section")?.querySelector("h2,h3,p");
  return heading?.textContent?.trim() || "Selected item";
}
