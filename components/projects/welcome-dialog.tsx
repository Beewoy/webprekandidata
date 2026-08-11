"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { AlertCircle, ArrowLeft, ArrowRight, Check, LoaderCircle, Sparkles, WandSparkles, X } from "lucide-react";
import { createWelcomeSiteAction, generateWelcomeDraftAction } from "@/app/actions/onboarding";
import type { WelcomeSuggestion } from "@/lib/validation/onboarding";

type WelcomeDialogProps = {
  defaultName: string;
};

const SUMMARY_MIN_LENGTH = 40;
const SUMMARY_MAX_LENGTH = 2000;

function updateSuggestion(
  suggestion: WelcomeSuggestion,
  setSuggestion: (value: WelcomeSuggestion) => void,
  field: keyof Omit<WelcomeSuggestion, "priorities">,
  value: string,
) {
  setSuggestion({ ...suggestion, [field]: value });
}

export function WelcomeDialog({ defaultName }: WelcomeDialogProps) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDivElement>(null);
  const summaryRef = useRef<HTMLTextAreaElement>(null);
  const reviewHeadingRef = useRef<HTMLHeadingElement>(null);
  const [step, setStep] = useState<"intro" | "review">("intro");
  const [summary, setSummary] = useState("");
  const [suggestion, setSuggestion] = useState<WelcomeSuggestion | null>(null);
  const [aiGenerated, setAiGenerated] = useState(false);
  const [aiReceipt, setAiReceipt] = useState<string>();
  const [notice, setNotice] = useState<string>();
  const [error, setError] = useState<string>();
  const [generating, startGenerating] = useTransition();
  const [creating, startCreating] = useTransition();

  function closeDialog() {
    if ((summary.trim() || suggestion) && !window.confirm("Chcete onboarding zavrieť? Rozpracovaný návrh sa neuloží.")) return;
    router.replace("/app");
  }

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    summaryRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        closeDialog();
        return;
      }
      if (event.key !== "Tab") return;

      const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled])',
      );
      if (!focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  // closeDialog intentionally reads the current draft when Escape is pressed.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [summary, suggestion]);

  function generateDraft() {
    setError(undefined);
    if (summary.trim().length < SUMMARY_MIN_LENGTH) {
      setError(`Napíšte aspoň ${SUMMARY_MIN_LENGTH} znakov, aby sme vedeli pripraviť užitočný návrh.`);
      summaryRef.current?.focus();
      return;
    }

    startGenerating(async () => {
      const result = await generateWelcomeDraftAction({ summary });
      if (!result.ok) {
        setError(result.message);
        return;
      }
      setSuggestion(result.suggestion);
      setAiGenerated(result.aiGenerated);
      setAiReceipt(result.aiReceipt);
      setNotice(result.notice);
      setStep("review");
      requestAnimationFrame(() => {
        dialogRef.current?.scrollTo({ top: 0 });
        reviewHeadingRef.current?.focus();
      });
    });
  }

  function createSite() {
    if (!suggestion) return;
    setError(undefined);
    const requiredFields: Array<[keyof WelcomeSuggestion, string]> = [
      ["candidateName", "Doplňte meno kandidáta."],
      ["locality", "Doplňte obec alebo mesto."],
      ["position", "Doplňte funkciu, na ktorú kandidujete."],
      ["internalName", "Pomenujte svoj projekt."],
    ];
    const missing = requiredFields.find(([field]) => String(suggestion[field]).trim().length < (field === "candidateName" || field === "locality" ? 2 : 3));
    if (missing) {
      setError(missing[1]);
      dialogRef.current?.querySelector<HTMLInputElement>(`input[name="${missing[0]}"]`)?.focus();
      return;
    }
    startCreating(async () => {
      const result = await createWelcomeSiteAction({ summary, suggestion, aiReceipt });
      if (result?.ok === false) setError(result.message);
    });
  }

  return (
    <div className="welcome-overlay" aria-hidden="false">
      <div
        ref={dialogRef}
        className="welcome-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="welcome-title"
        aria-describedby="welcome-description"
      >
        <button className="welcome-close" type="button" onClick={closeDialog} aria-label="Zavrieť uvítanie">
          <X size={20} />
        </button>

        <div className="welcome-progress" aria-label={`Krok ${step === "intro" ? 1 : 2} z 2`}>
          <span className="welcome-progress__item welcome-progress__item--active"><i>1</i><strong>O vás</strong></span>
          <span className={step === "review" ? "welcome-progress__line welcome-progress__line--active" : "welcome-progress__line"} />
          <span className={step === "review" ? "welcome-progress__item welcome-progress__item--active" : "welcome-progress__item"}><i>{step === "review" ? <Check size={13} /> : "2"}</i><strong>Návrh webu</strong></span>
        </div>

        {step === "intro" ? (
          <div className="welcome-step">
            <div className="welcome-heading">
              <span className="welcome-heading__icon"><WandSparkles size={25} /></span>
              <p className="eyebrow">Vitajte, {defaultName.split(/\s+/)[0] || "kandidát"}</p>
              <h1 id="welcome-title">Povedzte nám stručne o sebe</h1>
              <p id="welcome-description">Napíšte pár viet prirodzene, ako by ste sa predstavili voličovi. Z vašich faktov pripravíme prvý návrh webu.</p>
            </div>

            <label className="welcome-field" htmlFor="candidate-summary">
              <span>Krátke predstavenie</span>
              <textarea
                ref={summaryRef}
                id="candidate-summary"
                value={summary}
                onChange={(event) => setSummary(event.target.value)}
                rows={7}
                maxLength={SUMMARY_MAX_LENGTH}
                aria-invalid={Boolean(error)}
                aria-describedby={error ? "welcome-error" : "welcome-summary-hint"}
                placeholder="Napríklad: Volám sa Jana Nováková, kandidujem na starostku v obci... Posledných desať rokov sa venujem... Kandidujem preto, že... Mojimi prioritami sú..."
              />
              <span className="welcome-field__meta" id="welcome-summary-hint"><small>Pomôže 3 až 6 viet o skúsenostiach, motivácii a prioritách.</small><small>{summary.length} / {SUMMARY_MAX_LENGTH}</small></span>
            </label>

            <div className="welcome-ai-note">
              <Sparkles size={18} />
              <p><strong>AI vytvorí iba návrh.</strong> Pri AI režime odošleme text poskytovateľovi iba na vytvorenie návrhu. V našej databáze celý text požiadavky samostatne neukladáme. Výsledok pred uložením uvidíte a môžete upraviť.</p>
            </div>

            {error && <div className="form-message form-message--error" id="welcome-error" role="alert"><AlertCircle size={18} />{error}</div>}

            <div className="welcome-actions">
              <Link className="button button--ghost" href="/app/novy-web">Preskočiť a vyplniť ručne</Link>
              <button className="button button--primary button--large" type="button" onClick={generateDraft} disabled={generating}>
                {generating ? <><LoaderCircle className="spin" size={19} />Pripravujem návrh…</> : <>Pripraviť návrh pomocou AI <Sparkles size={18} /></>}
              </button>
            </div>
          </div>
        ) : suggestion ? (
          <div className="welcome-step welcome-step--review">
            <div className="welcome-heading welcome-heading--review">
              <p className="eyebrow">Návrh je pripravený</p>
              <h1 ref={reviewHeadingRef} id="welcome-title" tabIndex={-1}>Skontrolujte údaje pred uložením</h1>
              <p id="welcome-description">Každé pole môžete upraviť. Prázdne údaje AI nevedela bezpečne určiť z vášho textu.</p>
            </div>

            {notice && <div className="welcome-manual-note" role="status"><AlertCircle size={18} /><span>{notice}</span></div>}
            {aiGenerated && <div className="welcome-generated-badge"><Sparkles size={15} /> AI návrh – pred publikovaním ho skontrolujte</div>}

            <section className="welcome-review-section" aria-labelledby="welcome-project-fields">
              <div><h2 id="welcome-project-fields">Základ projektu</h2><p>Tieto údaje použijeme na vytvorenie webu a jeho adresy.</p></div>
              <div className="welcome-review-grid">
                <label className="welcome-field"><span>Meno a priezvisko</span><input name="candidateName" value={suggestion.candidateName} onChange={(event) => updateSuggestion(suggestion, setSuggestion, "candidateName", event.target.value)} maxLength={120} required /></label>
                <label className="welcome-field"><span>Obec alebo mesto</span><input name="locality" value={suggestion.locality} onChange={(event) => updateSuggestion(suggestion, setSuggestion, "locality", event.target.value)} maxLength={120} required /></label>
                <label className="welcome-field"><span>Funkcia</span><input name="position" value={suggestion.position} onChange={(event) => updateSuggestion(suggestion, setSuggestion, "position", event.target.value)} maxLength={160} required /></label>
                <label className="welcome-field"><span>Názov projektu</span><input name="internalName" value={suggestion.internalName} onChange={(event) => updateSuggestion(suggestion, setSuggestion, "internalName", event.target.value)} maxLength={100} required /></label>
              </div>
            </section>

            <section className="welcome-review-section" aria-labelledby="welcome-content-fields">
              <div><h2 id="welcome-content-fields">Prvé texty webu</h2><p>Uložia sa do konceptu a neskôr ich môžete kedykoľvek zmeniť.</p></div>
              <div className="welcome-review-stack">
                <label className="welcome-field"><span>Hlavný nadpis</span><input value={suggestion.heroHeadline} onChange={(event) => updateSuggestion(suggestion, setSuggestion, "heroHeadline", event.target.value)} maxLength={100} /></label>
                <label className="welcome-field"><span>Úvodný text</span><textarea value={suggestion.heroSubheadline} onChange={(event) => updateSuggestion(suggestion, setSuggestion, "heroSubheadline", event.target.value)} rows={3} maxLength={260} /></label>
                <label className="welcome-field"><span>Text „O mne“</span><textarea value={suggestion.aboutBody} onChange={(event) => updateSuggestion(suggestion, setSuggestion, "aboutBody", event.target.value)} rows={5} maxLength={1800} /></label>
                <label className="welcome-field"><span>Prečo kandidujem</span><textarea value={suggestion.motivation} onChange={(event) => updateSuggestion(suggestion, setSuggestion, "motivation", event.target.value)} rows={4} maxLength={900} /></label>
              </div>
            </section>

            {suggestion.priorities.length > 0 && (
              <section className="welcome-review-section" aria-labelledby="welcome-priorities">
                <div><h2 id="welcome-priorities">Navrhnuté priority</h2><p>AI ich použila iba vtedy, keď boli priamo uvedené vo vašom texte.</p></div>
                <div className="welcome-priority-list">
                  {suggestion.priorities.map((priority, index) => (
                    <div className="welcome-priority" key={index}>
                      <span>{index + 1}</span>
                      <label className="welcome-field"><span>Názov priority</span><input value={priority.title} onChange={(event) => setSuggestion({ ...suggestion, priorities: suggestion.priorities.map((item, itemIndex) => itemIndex === index ? { ...item, title: event.target.value } : item) })} maxLength={90} /></label>
                      <label className="welcome-field"><span>Krátky popis</span><textarea value={priority.text} onChange={(event) => setSuggestion({ ...suggestion, priorities: suggestion.priorities.map((item, itemIndex) => itemIndex === index ? { ...item, text: event.target.value } : item) })} rows={2} maxLength={400} /></label>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {error && <div className="form-message form-message--error" id="welcome-error" role="alert"><AlertCircle size={18} />{error}</div>}

            <div className="welcome-actions welcome-actions--sticky">
              <button className="button button--secondary" type="button" onClick={() => { setStep("intro"); setError(undefined); }} disabled={creating}><ArrowLeft size={17} /> Upraviť zadanie</button>
              <button className="button button--primary button--large" type="button" onClick={createSite} disabled={creating}>
                {creating ? <><LoaderCircle className="spin" size={19} />Vytváram váš web…</> : <>Použiť návrh a vytvoriť web <ArrowRight size={18} /></>}
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
