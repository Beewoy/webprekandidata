"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef, useState } from "react";
import { AlertCircle, ArrowRight, CheckCircle2, Eye, EyeOff, LoaderCircle } from "lucide-react";
import { loginAction, registerAction, resetPasswordAction, updatePasswordAction } from "@/app/actions/auth";
import { initialAuthState } from "@/lib/validation/auth";

type AuthMode = "login" | "register" | "reset" | "update";

const config = {
  login: {
    title: "Vitajte späť",
    description: "Prihláste sa a pokračujte v príprave svojho webu.",
    submit: "Prihlásiť sa",
    pending: "Prihlasujem…",
    action: loginAction,
  },
  register: {
    title: "Vytvorte si účet",
    description: "Začnite bez platby. Web si najskôr celý pripravíte a pozriete.",
    submit: "Vytvoriť účet",
    pending: "Vytváram účet…",
    action: registerAction,
  },
  reset: {
    title: "Obnova hesla",
    description: "Zadajte e-mail a pošleme vám bezpečný odkaz na nastavenie nového hesla.",
    submit: "Poslať odkaz",
    pending: "Posielam…",
    action: resetPasswordAction,
  },
  update: {
    title: "Nastavte nové heslo",
    description: "Zvoľte si nové heslo s minimálne ôsmimi znakmi.",
    submit: "Uložiť nové heslo",
    pending: "Ukladám…",
    action: updatePasswordAction,
  },
} as const;

function FieldError({ errors, id }: { errors?: string[]; id: string }) {
  if (!errors?.length) return null;
  return <span className="field-error" id={id} role="alert"><AlertCircle size={14} />{errors[0]}</span>;
}

function PasswordField({ name, label, error, newPassword = false }: { name: string; label: string; error?: string[]; newPassword?: boolean }) {
  const [visible, setVisible] = useState(false);
  const errorId = `${name}-error`;

  return (
    <label className="auth-field">
      <span>{label}</span>
      <div className="password-input">
        <input name={name} type={visible ? "text" : "password"} autoComplete={newPassword || name === "passwordConfirmation" ? "new-password" : "current-password"} required aria-invalid={Boolean(error?.length)} aria-describedby={error?.length ? errorId : undefined} />
        <button type="button" onClick={() => setVisible((value) => !value)} aria-label={visible ? "Skryť heslo" : "Zobraziť heslo"}>{visible ? <EyeOff size={19} /> : <Eye size={19} />}</button>
      </div>
      <FieldError errors={error} id={errorId} />
    </label>
  );
}

export function AuthForm({ mode, notice }: { mode: AuthMode; notice?: { type: "success" | "error"; text: string } }) {
  const current = config[mode];
  const [state, formAction, pending] = useActionState(current.action, initialAuthState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.status === "error") {
      formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
    }
  }, [state]);

  return (
    <div className="auth-form-wrap">
      <div className="auth-heading"><h1>{current.title}</h1><p>{current.description}</p></div>

      {notice && <div className={notice.type === "success" ? "form-message form-message--success auth-notice" : "form-message form-message--error auth-notice"} role="status">{notice.type === "success" ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}<span>{notice.text}</span></div>}

      <form ref={formRef} className="auth-form" action={formAction} noValidate>
        {mode === "register" && (
          <label className="auth-field">
            <span>Meno a priezvisko</span>
            <input name="fullName" type="text" autoComplete="name" required aria-invalid={Boolean(state.errors?.fullName?.length)} aria-describedby={state.errors?.fullName ? "fullName-error" : undefined} />
            <FieldError errors={state.errors?.fullName} id="fullName-error" />
          </label>
        )}

        <label className="auth-field">
          <span>E-mail</span>
          <input name="email" type="email" autoComplete="email" required aria-invalid={Boolean(state.errors?.email?.length)} aria-describedby={state.errors?.email ? "email-error" : undefined} />
          <FieldError errors={state.errors?.email} id="email-error" />
        </label>

        {mode !== "reset" && <PasswordField name="password" label={mode === "update" ? "Nové heslo" : "Heslo"} error={state.errors?.password} newPassword={mode === "register" || mode === "update"} />}
        {(mode === "register" || mode === "update") && <PasswordField name="passwordConfirmation" label="Zopakujte heslo" error={state.errors?.passwordConfirmation} newPassword />}

        {mode === "login" && <Link className="auth-forgot" href="/zabudnute-heslo">Zabudli ste heslo?</Link>}

        {state.message && (
          <div className={state.status === "success" ? "form-message form-message--success" : "form-message form-message--error"} role="status">
            {state.status === "success" ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            <span>{state.message}</span>
          </div>
        )}

        <button className="button button--primary auth-submit" type="submit" disabled={pending}>
          {pending ? <><LoaderCircle className="spin" size={18} />{current.pending}</> : <>{current.submit}<ArrowRight size={18} /></>}
        </button>
      </form>

      <div className="auth-switch">
        {mode === "login" && <p>Ešte nemáte účet? <Link href="/registracia">Vytvoriť účet</Link></p>}
        {mode === "register" && <p>Už máte účet? <Link href="/prihlasenie">Prihlásiť sa</Link></p>}
        {mode === "reset" && <p><Link href="/prihlasenie">Späť na prihlásenie</Link></p>}
        {mode === "update" && <p><Link href="/prihlasenie">Späť na prihlásenie</Link></p>}
      </div>

      {mode !== "update" && <div className="demo-entry"><span>alebo</span><Link className="button button--secondary" href="/app/web/demo">Otvoriť ukážkový projekt</Link></div>}
    </div>
  );
}
