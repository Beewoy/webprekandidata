"use client";

import { useActionState, useEffect, useRef } from "react";
import { CheckCircle2, Send } from "lucide-react";
import { submitFeedbackForm } from "@/app/actions/feedback";
import { ChoiceChips } from "@/components/feedback/choice-chips";
import { StarRating } from "@/components/feedback/star-rating";
import {
  FEEDBACK_HIGHLIGHT_OPTIONS,
  FEEDBACK_IMPROVEMENT_OPTIONS,
} from "@/lib/feedback/options";
import { initialFeedbackFormState } from "@/lib/validation/feedback";

export function FeedbackForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, pending] = useActionState(
    submitFeedbackForm,
    initialFeedbackFormState,
  );
  const submitted = state.status === "success";

  useEffect(() => {
    if (submitted) formRef.current?.reset();
  }, [submitted]);

  return (
    <form action={formAction} className="feedback-form" noValidate ref={formRef}>
      <StarRating
        disabled={submitted}
        error={state.errors?.overallRating?.[0]}
        id="feedback-overall"
        label="Celková spokojnosť"
        name="overallRating"
      />

      <StarRating
        disabled={submitted}
        error={state.errors?.editorRating?.[0]}
        id="feedback-editor"
        label="Jednoduchosť editora"
        name="editorRating"
      />

      <ChoiceChips
        disabled={submitted}
        error={state.errors?.highlights?.[0]}
        key={submitted ? "highlights-done" : "highlights-active"}
        legend="Čo sa vám najviac páčilo?"
        name="highlights"
        options={FEEDBACK_HIGHLIGHT_OPTIONS}
      />

      <ChoiceChips
        disabled={submitted}
        error={state.errors?.improvements?.[0]}
        key={submitted ? "improvements-done" : "improvements-active"}
        legend="Kde vidíte priestor na zlepšenie?"
        name="improvements"
        options={FEEDBACK_IMPROVEMENT_OPTIONS}
      />

      <label className="field">
        <span>Váš komentár <small>(voliteľné)</small></span>
        <textarea
          aria-describedby={state.errors?.comment ? "feedback-comment-error" : undefined}
          aria-invalid={Boolean(state.errors?.comment)}
          disabled={submitted}
          maxLength={1500}
          name="comment"
          placeholder="Čo by ste nám ešte povedali?"
          rows={4}
        />
        {state.errors?.comment?.[0] ? (
          <small className="feedback-form__error" id="feedback-comment-error" role="alert">
            {state.errors.comment[0]}
          </small>
        ) : null}
      </label>

      <label className="field">
        <span>E-mail <small>(voliteľné, ak chcete odpoveď)</small></span>
        <input
          aria-describedby={state.errors?.email ? "feedback-email-error" : undefined}
          aria-invalid={Boolean(state.errors?.email)}
          autoComplete="email"
          disabled={submitted}
          maxLength={254}
          name="email"
          type="email"
        />
        {state.errors?.email?.[0] ? (
          <small className="feedback-form__error" id="feedback-email-error" role="alert">
            {state.errors.email[0]}
          </small>
        ) : null}
      </label>

      <label className="checkout-terms feedback-form__consent">
        <input defaultChecked disabled={submitted} name="consentPublic" type="checkbox" />
        <span>Súhlasím s použitím mojej spätnej väzby na webe.</span>
      </label>

      <label hidden>
        Webová stránka
        <input autoComplete="off" name="website" tabIndex={-1} type="text" />
      </label>

      {state.message ? (
        <p
          className={`feedback-form__status feedback-form__status--${state.status}`}
          role={state.status === "error" ? "alert" : "status"}
        >
          {state.status === "success" ? <CheckCircle2 aria-hidden="true" size={17} /> : null}
          {state.message}
        </p>
      ) : null}

      <button className="button button--primary feedback-form__submit" disabled={pending || submitted} type="submit">
        <Send aria-hidden="true" size={16} />
        {pending ? "Odosielam…" : submitted ? "Odoslané" : "Odoslať spätnú väzbu"}
      </button>
    </form>
  );
}
