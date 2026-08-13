"use client";

import { useState, useTransition } from "react";
import {
  confirmWithdrawalAction,
  requestWithdrawalLinkAction,
} from "@/app/actions/withdrawal";

export function WithdrawalRequestForm() {
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <form
      className="checkout-form__fields"
      onSubmit={(event) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        setMessage(null);
        startTransition(async () => {
          const result = await requestWithdrawalLinkAction({
            orderNumber: String(formData.get("orderNumber") ?? ""),
            email: String(formData.get("email") ?? ""),
          });
          setMessage(result.message);
        });
      }}
    >
      <label className="field">
        <span>Číslo objednávky</span>
        <input name="orderNumber" required type="text" autoComplete="off" />
      </label>
      <label className="field">
        <span>E-mail z objednávky</span>
        <input name="email" required type="email" autoComplete="email" />
      </label>
      <button className="button button--primary" disabled={pending} type="submit">
        {pending ? "Odosielam…" : "Odstúpiť od zmluvy tu"}
      </button>
      {message && <p role="status">{message}</p>}
    </form>
  );
}

export function WithdrawalConfirmForm({ token }: { token: string }) {
  const [message, setMessage] = useState<string | null>(null);
  const [ok, setOk] = useState<boolean | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <form
      className="checkout-form__fields"
      onSubmit={(event) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        setMessage(null);
        startTransition(async () => {
          const result = await confirmWithdrawalAction({
            token,
            fullName: String(formData.get("fullName") ?? ""),
            email: String(formData.get("email") ?? ""),
            confirm: formData.get("confirm") === "on",
          });
          setOk(result.ok);
          setMessage(result.message);
        });
      }}
    >
      <label className="field">
        <span>Meno a priezvisko</span>
        <input name="fullName" required type="text" autoComplete="name" />
      </label>
      <label className="field">
        <span>Elektronický kontakt</span>
        <input name="email" required type="email" autoComplete="email" />
      </label>
      <label className="checkout-terms">
        <input name="confirm" type="checkbox" required />
        <span>
          Potvrdzujem, že chcem odstúpiť od zmluvy. Obsah žiadosti a čas potvrdenia mi budú
          zaslané e-mailom.
        </span>
      </label>
      <button className="button button--primary" disabled={pending} type="submit">
        {pending ? "Potvrdzujem…" : "Potvrdiť odstúpenie od zmluvy"}
      </button>
      {message && (
        <p role={ok ? "status" : "alert"} className={ok ? undefined : "field-error"}>
          {message}
        </p>
      )}
    </form>
  );
}
