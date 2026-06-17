"use client";

import { useEffect } from "react";

export function ConfirmForms() {
  useEffect(() => {
    function confirmSubmit(event: SubmitEvent) {
      const form = event.target instanceof HTMLFormElement ? event.target : null;
      const message = form?.dataset.confirm;
      if (message && !window.confirm(message)) {
        event.preventDefault();
      }
    }

    document.addEventListener("submit", confirmSubmit);
    return () => document.removeEventListener("submit", confirmSubmit);
  }, []);

  return null;
}
