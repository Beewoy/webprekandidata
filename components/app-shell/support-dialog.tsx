"use client";

import { useActionState, useEffect, useId, useRef } from "react";
import { CheckCircle2, Phone, Send } from "lucide-react";
import { submitSupportForm } from "@/app/actions/support";
import { supportPhoneDisplay, supportPhoneTel } from "@/lib/support";
import { initialSupportFormState, type SupportFormState } from "@/lib/validation/support";

type SupportDialogProps = {
  open: boolean;
  onClose: () => void;
  defaultEmail?: string;
};

export function SupportDialog({ open, onClose, defaultEmail = "" }: SupportDialogProps) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, pending] = useActionState(
    async (previousState: SupportFormState, formData: FormData) => {
      const nextState = await submitSupportForm(previousState, formData);
      return nextState;
    },
    initialSupportFormState,
  );

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    panelRef.current?.querySelector<HTMLElement>("a, button, input, textarea")?.focus();
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    if (state.status === "success") formRef.current?.reset();
  }, [state.status]);

  if (!open) return null;

  return (
    <div className="admin-dialog support-dialog" role="dialog" aria-modal="true" aria-labelledby={titleId}>
      <div className="admin-dialog__panel panel" ref={panelRef}>
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Kontaktujte nás</p>
            <h2 id={titleId}>Pomoc a podpora</h2>
          </div>
          <button className="button button--ghost button--small" type="button" onClick={onClose}>
            Zavrieť
          </button>
        </div>

        <div className="support-dialog__phone">
          <p>Preferujete telefonát? Zavolajte nám na</p>
          <a className="support-dialog__phone-link" href={`tel:${supportPhoneTel}`}>
            <Phone aria-hidden="true" size={18} />
            <span>{supportPhoneDisplay}</span>
          </a>
        </div>

        <form className="field-stack support-dialog__form" action={formAction} noValidate ref={formRef}>
          <p className="admin-dialog__intro">
            Alebo nám napíšte správu. Odpovieme na e-mail, ktorý uvediete.
          </p>

          <label className="field">
            <span>Váš e-mail</span>
            <input
              aria-describedby={state.errors?.email ? "support-email-error" : undefined}
              aria-invalid={Boolean(state.errors?.email)}
              autoComplete="email"
              defaultValue={defaultEmail}
              maxLength={254}
              name="email"
              required
              type="email"
            />
            {state.errors?.email?.[0] ? (
              <small className="support-dialog__error" id="support-email-error" role="alert">
                {state.errors.email[0]}
              </small>
            ) : null}
          </label>

          <label className="field">
            <span>Správa</span>
            <textarea
              aria-describedby={state.errors?.message ? "support-message-error" : undefined}
              aria-invalid={Boolean(state.errors?.message)}
              maxLength={5000}
              minLength={10}
              name="message"
              required
              rows={5}
            />
            {state.errors?.message?.[0] ? (
              <small className="support-dialog__error" id="support-message-error" role="alert">
                {state.errors.message[0]}
              </small>
            ) : null}
          </label>

          <label hidden>
            Webová stránka
            <input autoComplete="off" name="website" tabIndex={-1} type="text" />
          </label>

          {state.message ? (
            <p
              className={`support-dialog__status support-dialog__status--${state.status}`}
              role={state.status === "error" ? "alert" : "status"}
            >
              {state.status === "success" ? <CheckCircle2 aria-hidden="true" size={17} /> : null}
              {state.message}
            </p>
          ) : null}

          <div className="admin-dialog__actions">
            <button className="button button--ghost" type="button" onClick={onClose} disabled={pending}>
              Zrušiť
            </button>
            <button className="button button--primary" type="submit" disabled={pending}>
              <Send aria-hidden="true" size={16} />
              {pending ? "Odosielam…" : "Odoslať správu"}
            </button>
          </div>
        </form>
      </div>
      <button className="admin-dialog__backdrop" type="button" aria-label="Zavrieť dialóg" onClick={onClose} />
    </div>
  );
}
