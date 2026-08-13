"use client";

import { CheckCircle2, MailCheck, RefreshCw, X } from "lucide-react";
import { useActionState, useEffect, useId, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  initialResendVerificationState,
  type ResendVerificationState,
} from "@/lib/validation/auth";
import { resendVerificationEmailAction } from "@/app/actions/auth";
import { cn } from "@/lib/cn";

type EmailVerificationBannerProps = {
  email: string;
  verified: boolean;
  /** When set, prefer this notice over the URL query (e.g. projects list). */
  notice?: string;
  className?: string;
};

type SnackbarTone = "success" | "error" | "warning";

type SnackbarState = {
  key: string;
  tone: SnackbarTone;
  message: string;
};

function noticeToSnackbar(notice: string | undefined): SnackbarState | null {
  if (notice === "odoslany") {
    return { key: `url:${notice}`, tone: "success", message: "Overovací e-mail sme odoslali." };
  }
  if (notice === "neodoslany") {
    return {
      key: `url:${notice}`,
      tone: "error",
      message: "Overovací e-mail sa nepodarilo odoslať. Skúste to znova.",
    };
  }
  if (notice === "skoro") {
    return {
      key: `url:${notice}`,
      tone: "warning",
      message: "Ďalší overovací odkaz môžete poslať po jednej minúte.",
    };
  }
  return null;
}

function actionStateToSnackbar(state: ResendVerificationState): SnackbarState | null {
  if (state.status === "idle" || !state.message) return null;
  const key = `action:${state.status}:${state.message}`;
  if (state.status === "success" || state.status === "already_verified") {
    return { key, tone: "success", message: state.message };
  }
  if (state.status === "rate_limit") {
    return { key, tone: "warning", message: state.message };
  }
  return { key, tone: "error", message: state.message };
}

function resolveNotice(notice: string | undefined, searchNotice: string | null) {
  return notice ?? searchNotice ?? undefined;
}

function FeedbackSnackbar({
  snackbar,
  onDismiss,
}: {
  snackbar: SnackbarState | null;
  onDismiss: (key: string) => void;
}) {
  const titleId = useId();

  useEffect(() => {
    if (!snackbar) return;
    const timer = window.setTimeout(() => onDismiss(snackbar.key), 5000);
    return () => window.clearTimeout(timer);
  }, [snackbar, onDismiss]);

  if (!snackbar) return null;

  return (
    <div
      className={cn("app-snackbar", `app-snackbar--${snackbar.tone}`)}
      role="status"
      aria-live="polite"
      aria-labelledby={titleId}
    >
      <p id={titleId}>{snackbar.message}</p>
      <button
        className="app-snackbar__close"
        type="button"
        onClick={() => onDismiss(snackbar.key)}
        aria-label="Zavrieť hlášku"
      >
        <X size={16} />
      </button>
    </div>
  );
}

export function EmailVerificationBanner({
  email,
  verified,
  notice,
  className,
}: EmailVerificationBannerProps) {
  const searchParams = useSearchParams();
  const emailNotice = resolveNotice(notice, searchParams.get("email"));
  const [state, formAction, pending] = useActionState(
    resendVerificationEmailAction,
    initialResendVerificationState,
  );
  const [dismissedKey, setDismissedKey] = useState<string | null>(null);

  const candidateSnackbar = actionStateToSnackbar(state) ?? noticeToSnackbar(emailNotice);
  const snackbar = candidateSnackbar && candidateSnackbar.key !== dismissedKey
    ? candidateSnackbar
    : null;

  if (verified) {
    if (emailNotice !== "overeny" && emailNotice !== "uz-overeny") return null;
    return (
      <div className={className ? `${className} email-verification-notice email-verification-notice--success` : "email-verification-notice email-verification-notice--success"} role="status">
        <CheckCircle2 size={20} />
        <span><strong>E-mail je overený.</strong> Ďakujeme, vaša adresa bola úspešne potvrdená.</span>
      </div>
    );
  }

  const inlineHint = state.status === "success"
    ? " Nový overovací odkaz sme práve odoslali."
    : state.status === "error"
      ? " Správu sa nepodarilo odoslať; skúste ju poslať znova."
      : state.status === "rate_limit"
        ? " Ďalší odkaz môžete poslať po jednej minúte."
        : emailNotice === "odoslany"
          ? " Nový overovací odkaz sme práve odoslali."
          : emailNotice === "neodoslany"
            ? " Správu sa nepodarilo odoslať; skúste ju poslať znova."
            : emailNotice === "skoro"
              ? " Ďalší odkaz môžete poslať po jednej minúte."
              : null;

  return (
    <>
      <section
        className={className ? `${className} email-verification-banner` : "email-verification-banner"}
        aria-labelledby="verify-email-heading"
      >
        <span className="email-verification-banner__icon"><MailCheck size={22} /></span>
        <div>
          <h2 id="verify-email-heading">Overte svoj e-mail</h2>
          <p>
            Účet je aktívny a môžete pokračovať. Overovací odkaz sme poslali na <strong>{email}</strong>.
            {inlineHint}
          </p>
        </div>
        <form action={formAction}>
          <button className="button button--secondary button--small" type="submit" disabled={pending} aria-busy={pending}>
            <RefreshCw size={15} className={pending ? "spin" : undefined} aria-hidden="true" />
            {pending ? "Odosielam…" : "Poslať znova"}
          </button>
        </form>
      </section>
      <FeedbackSnackbar snackbar={snackbar} onDismiss={setDismissedKey} />
    </>
  );
}
