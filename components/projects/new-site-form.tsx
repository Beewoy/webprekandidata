"use client";

import Link from "next/link";
import { useActionState } from "react";
import { AlertCircle, ArrowLeft, ArrowRight, LoaderCircle } from "lucide-react";
import { createSiteAction } from "@/app/actions/sites";
import { initialSiteState } from "@/lib/validation/site";

function ProjectError({ errors, id }: { errors?: string[]; id: string }) {
  if (!errors?.length) return null;
  return <span className="field-error" id={id} role="alert"><AlertCircle size={14} />{errors[0]}</span>;
}

export function NewSiteForm() {
  const [state, formAction, pending] = useActionState(createSiteAction, initialSiteState);

  return (
    <main className="new-site-shell">
      <div className="new-site-container">
        <Link className="back-link" href="/app"><ArrowLeft size={17} /> Späť na projekty</Link>
        <div className="new-site-heading"><p className="eyebrow">Nový projekt</p><h1>Začnime základnými údajmi</h1><p>Všetko môžete neskôr zmeniť v editore. Tieto údaje nám pomôžu pripraviť prvú verziu webu.</p></div>
        <form className="new-site-card" action={formAction} noValidate>
          <label className="auth-field"><span>Názov projektu</span><input name="internalName" defaultValue="Komunálne voľby 2026" required aria-invalid={Boolean(state.errors?.internalName)} aria-describedby={state.errors?.internalName ? "internalName-error" : undefined} /><small>Uvidíte ho iba vy, napríklad „Komunálne voľby 2026“.</small><ProjectError errors={state.errors?.internalName} id="internalName-error" /></label>
          <label className="auth-field"><span>Meno a priezvisko kandidáta</span><input name="candidateName" autoComplete="name" required aria-invalid={Boolean(state.errors?.candidateName)} aria-describedby={state.errors?.candidateName ? "candidateName-error" : undefined} /><ProjectError errors={state.errors?.candidateName} id="candidateName-error" /></label>
          <div className="new-site-row">
            <label className="auth-field"><span>Obec alebo mesto</span><input name="locality" required aria-invalid={Boolean(state.errors?.locality)} aria-describedby={state.errors?.locality ? "locality-error" : undefined} /><ProjectError errors={state.errors?.locality} id="locality-error" /></label>
            <label className="auth-field"><span>Funkcia</span><input name="position" placeholder="Napr. kandidát na primátora" required aria-invalid={Boolean(state.errors?.position)} aria-describedby={state.errors?.position ? "position-error" : undefined} /><ProjectError errors={state.errors?.position} id="position-error" /></label>
          </div>
          {state.message && <div className="form-message form-message--error" role="alert"><AlertCircle size={18} />{state.message}</div>}
          <div className="new-site-actions"><Link className="button button--secondary" href="/app">Zrušiť</Link><button className="button button--primary" type="submit" disabled={pending}>{pending ? <><LoaderCircle className="spin" size={18} />Vytváram…</> : <>Vytvoriť web <ArrowRight size={18} /></>}</button></div>
        </form>
      </div>
    </main>
  );
}
