"use client";

import { useActionState, useEffect, useRef } from "react";
import { CheckCircle2, Send } from "lucide-react";
import { submitContactForm, type ContactFormState } from "@/app/actions/contact";

type ContactFormProps = {
  preview?: boolean;
  siteId: string;
};

export function ContactForm({ preview = false, siteId }: ContactFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const action = submitContactForm.bind(null, siteId);
  const initialState: ContactFormState = { status: "idle", message: "" };
  const [state, formAction, pending] = useActionState(action, initialState);

  useEffect(() => {
    if (state.status === "success") formRef.current?.reset();
  }, [state.status]);

  return (
    <form
      action={formAction}
      className="candidate-contact-form"
      onSubmit={preview ? (event) => event.preventDefault() : undefined}
      ref={formRef}
    >
      <div className="candidate-contact-form__heading">
        <h3>Napíšte správu</h3>
        <p>Odpoveď vám príde priamo od kandidáta alebo jeho tímu.</p>
      </div>

      <div className="candidate-contact-form__fields">
        <label>
          <span>Meno</span>
          <input aria-describedby={state.errors?.name ? "contact-name-error" : undefined} aria-invalid={Boolean(state.errors?.name)} autoComplete="name" maxLength={120} name="name" required type="text" />
          {state.errors?.name?.[0] && <small className="candidate-contact-form__error" id="contact-name-error">{state.errors.name[0]}</small>}
        </label>
        <label>
          <span>E-mail</span>
          <input aria-describedby={state.errors?.email ? "contact-email-error" : undefined} aria-invalid={Boolean(state.errors?.email)} autoComplete="email" maxLength={254} name="email" required type="email" />
          {state.errors?.email?.[0] && <small className="candidate-contact-form__error" id="contact-email-error">{state.errors.email[0]}</small>}
        </label>
        <label>
          <span>Telefón <small>(voliteľné)</small></span>
          <input aria-describedby={state.errors?.phone ? "contact-phone-error" : undefined} aria-invalid={Boolean(state.errors?.phone)} autoComplete="tel" inputMode="tel" maxLength={40} name="phone" type="tel" />
          {state.errors?.phone?.[0] && <small className="candidate-contact-form__error" id="contact-phone-error">{state.errors.phone[0]}</small>}
        </label>
        <label>
          <span>Popis</span>
          <textarea aria-describedby={state.errors?.message ? "contact-message-error" : undefined} aria-invalid={Boolean(state.errors?.message)} maxLength={5000} minLength={10} name="message" required rows={5} />
          {state.errors?.message?.[0] && <small className="candidate-contact-form__error" id="contact-message-error">{state.errors.message[0]}</small>}
        </label>
      </div>

      <label hidden>
        Webová stránka
        <input autoComplete="off" name="website" tabIndex={-1} type="text" />
      </label>

      <p className="candidate-contact-form__privacy">Odoslaním správy súhlasíte s jej doručením kandidátovi. Údaje sa použijú iba na vybavenie vášho podnetu.</p>
      {preview && <p className="candidate-contact-form__preview-note">Toto je náhľad. Odosielanie bude aktívne po zverejnení webu.</p>}
      {!preview && state.message && (
        <p className={`candidate-contact-form__status candidate-contact-form__status--${state.status}`} role={state.status === "error" ? "alert" : "status"}>
          {state.status === "success" && <CheckCircle2 aria-hidden="true" size={17} />}
          {state.message}
        </p>
      )}
      <button disabled={pending || preview} type="submit">
        <Send aria-hidden="true" size={17} />
        {pending ? "Odosielam…" : "Odoslať správu"}
      </button>
    </form>
  );
}
