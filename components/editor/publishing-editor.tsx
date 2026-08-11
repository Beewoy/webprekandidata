"use client";

import { AlertTriangle, Check, CircleCheckBig, ExternalLink, Eye, LockKeyhole, PauseCircle, Rocket, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { publishSiteAction, setSiteVisibilityAction, type PublishSiteResult } from "@/app/actions/publishing";
import { cn } from "@/lib/cn";
import { PageHeading } from "@/components/ui/page-heading";
import { PlanBadge } from "@/components/ui/plan-badge";
import type { PublishingState } from "@/lib/publishing";

const plans = [
  { id: "basic", name: "Basic", price: "49,99 €", note: "Jednoduchý volebný web", features: ["Web na našej doméne", "Všetky sekcie editora", "Aktuality a kontaktný formulár", "Základná AI pomoc s obsahom"] },
  { id: "plus", name: "Plus", price: "89,99 €", note: "Vlastná značka a viac AI", features: ["Všetko z balíka Basic", "Vlastná doména", "AI generovanie článkov", "Prioritná podpora"] },
] as const;

type PaidPlan = Exclude<PublishingState["planCode"], null>;

type PublishingEditorProps = {
  publishingState: PublishingState;
  siteId: string;
};

export function PublishingEditor({ publishingState, siteId }: PublishingEditorProps) {
  const [plan, setPlan] = useState<PaidPlan>("basic");
  const [result, setResult] = useState<PublishSiteResult | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const selected = plans.find((item) => item.id === plan)!;
  const currentPlan = publishingState.planCode ? plans.find((item) => item.id === publishingState.planCode)! : null;

  function runAction(action: () => Promise<PublishSiteResult>) {
    setResult(null);
    startTransition(async () => {
      const nextResult = await action();
      setResult(nextResult);
      if (nextResult.ok) router.refresh();
    });
  }

  if (currentPlan) {
    const isPublished = publishingState.siteStatus === "published";
    const isSuspended = publishingState.siteStatus === "suspended";
    const primaryLabel = !publishingState.currentPublication
      ? "Zverejniť web"
      : isSuspended
        ? publishingState.hasUnpublishedChanges ? "Publikovať zmeny a obnoviť" : "Obnoviť web"
        : publishingState.hasUnpublishedChanges ? "Publikovať zmeny" : null;
    const primaryAction = isSuspended && !publishingState.hasUnpublishedChanges
      ? () => setSiteVisibilityAction({ siteId, visible: true })
      : () => publishSiteAction({ siteId });
    const canPublish = publishingState.entitled && publishingState.readiness.ready;
    const publishedDate = publishingState.currentPublication
      ? new Intl.DateTimeFormat("sk-SK", { dateStyle: "long", timeStyle: "short", timeZone: "Europe/Bratislava" }).format(new Date(publishingState.currentPublication.publishedAt))
      : null;

    return (
      <div className="page-container">
        <PageHeading
          eyebrow="Posledný krok"
          title="Zverejnenie webu"
          description="Skontrolujte pripravenosť a rozhodnite, ktorá uložená verzia má byť verejná."
        />
        <div className={cn("readiness-card", !publishingState.readiness.ready && "readiness-card--warning")}>
          <span>{publishingState.readiness.ready ? <CircleCheckBig size={23} /> : <AlertTriangle size={23} />}</span>
          <div>
            <h2>{publishingState.readiness.ready ? "Web je pripravený na zverejnenie" : "Pred zverejnením ešte doplňte obsah"}</h2>
            <p>{publishingState.readiness.ready ? "Všetky povinné časti sú vyplnené. Verejná verzia sa zmení iba po vašom potvrdení." : `${publishingState.readiness.blockers.length} povinné ${publishingState.readiness.blockers.length === 1 ? "miesto potrebuje" : "miesta potrebujú"} pozornosť.`}</p>
          </div>
        </div>

        {(publishingState.readiness.blockers.length > 0 || publishingState.readiness.warnings.length > 0) && (
          <section aria-labelledby="publish-check-title" className="publish-checklist">
            <div className="publish-checklist__heading">
              <div><p className="eyebrow">Kontrola obsahu</p><h2 id="publish-check-title">Čo ešte skontrolovať</h2></div>
              <span>{publishingState.readiness.blockers.length} povinné · {publishingState.readiness.warnings.length} odporúčané</span>
            </div>
            <div className="publish-checklist__items">
              {publishingState.readiness.blockers.map((issue) => (
                <Link className="publish-issue publish-issue--blocker" href={`/app/web/${siteId}/${issue.section}`} key={`${issue.section}-${issue.label}`}>
                  <AlertTriangle aria-hidden="true" size={18} /><span><strong>{issue.label}</strong><small>{issue.message}</small></span><ExternalLink aria-hidden="true" size={15} />
                </Link>
              ))}
              {publishingState.readiness.warnings.map((issue) => (
                <Link className="publish-issue" href={`/app/web/${siteId}/${issue.section}`} key={`${issue.section}-${issue.label}`}>
                  <Eye aria-hidden="true" size={18} /><span><strong>{issue.label}</strong><small>{issue.message}</small></span><ExternalLink aria-hidden="true" size={15} />
                </Link>
              ))}
            </div>
          </section>
        )}

        <section aria-labelledby="active-plan-title" className="active-plan-card">
          <div className="active-plan-card__header">
            <span className="active-plan-card__icon" aria-hidden="true"><Check size={19} /></span>
            <div>
              <p className="eyebrow">Aktívny balík</p>
              <h2 id="active-plan-title">{currentPlan.name}</h2>
              <p>{currentPlan.note}</p>
            </div>
            <PlanBadge plan={publishingState.planCode} />
          </div>
          <div className="publication-status">
            <div className={cn("publication-status__indicator", isPublished && "publication-status__indicator--live", isSuspended && "publication-status__indicator--suspended")}>
              <span aria-hidden="true" />
              <div>
                <strong>{isPublished ? "Web je verejný" : isSuspended ? "Web je pozastavený" : "Web ešte nie je verejný"}</strong>
                <small>{publishedDate ? `Posledná publikácia ${publishedDate} · verzia ${publishingState.currentPublication?.versionNumber}` : "Prvá verejná verzia ešte nebola vytvorená."}</small>
              </div>
            </div>
            {publishingState.currentPublication && (
              <span className={cn("publication-change", publishingState.hasUnpublishedChanges && "publication-change--pending")}>
                {publishingState.hasUnpublishedChanges ? "Máte nezverejnené zmeny" : "Verejná verzia je aktuálna"}
              </span>
            )}
          </div>

          {!publishingState.entitled && <div className="publication-entitlement-warning" role="alert"><AlertTriangle size={18} /><span><strong>Balík nie je potvrdený objednávkou</strong><small>Publikovanie sa sprístupní po priradení platnej objednávky Basic alebo Plus.</small></span></div>}

          <div className="active-plan-card__next publication-actions">
            <div>
              <strong>{primaryLabel ? "Verejná verzia sa zmení až po potvrdení" : "Web používa najnovšiu uloženú verziu"}</strong>
              <p>Rozpracované úpravy sa návštevníkom nikdy nezobrazia automaticky.</p>
            </div>
            <div className="publication-actions__buttons">
              <Link className="button button--secondary" href={`/app/web/${siteId}/nahlad`}><Eye size={17} /> Náhľad</Link>
              {isPublished && publishingState.currentPublication && <button className="button button--ghost publication-pause" disabled={pending} onClick={() => runAction(() => setSiteVisibilityAction({ siteId, visible: false }))} type="button"><PauseCircle size={17} /> Pozastaviť</button>}
              {primaryLabel && <button className="button button--primary" disabled={pending || !canPublish} onClick={() => runAction(primaryAction)} type="button"><Rocket size={17} /> {pending ? "Spracúvam…" : primaryLabel}</button>}
              {isPublished && publishingState.currentPublication && <Link className="button button--secondary" href={publishingState.publicPath} target="_blank"><ExternalLink size={17} /> Otvoriť web</Link>}
            </div>
          </div>
          {result && <p className={cn("publication-result", result.ok ? "publication-result--success" : "publication-result--error")} role={result.ok ? "status" : "alert"}>{result.message}</p>}
        </section>
      </div>
    );
  }

  return (
    <div className="page-container">
      <PageHeading eyebrow="Posledný krok" title="Zverejnenie webu" description="Vyberte si balík. O platbu požiadame až po kontrole údajov." />
      <div className="readiness-card"><span><CircleCheckBig size={23} /></span><div><h2>Web je pripravený na kontrolu</h2><p>Pred platbou môžete obsah ešte ľubovoľne meniť. Web zverejníme až po potvrdení objednávky.</p></div></div>
      <div className="pricing-grid">
        {plans.map((item) => (
          <button className={cn("pricing-card", plan === item.id && "pricing-card--selected")} type="button" key={item.id} onClick={() => setPlan(item.id)}>
            {item.id === "plus" && <span className="recommended-badge"><Sparkles size={13} /> Odporúčame</span>}
            <span className="pricing-radio">{plan === item.id && <Check size={14} />}</span>
            <span className="pricing-title"><strong>{item.name}</strong><small>{item.note}</small></span>
            <strong className="pricing-price">{item.price}<small>s DPH</small></strong>
            <span className="pricing-features">{item.features.map((feature) => <span key={feature}><Check size={15} />{feature}</span>)}</span>
          </button>
        ))}
      </div>
      <section className="order-summary">
        <div><p className="eyebrow">Vybraný balík</p><h2>{selected.name}</h2><p>{selected.note}. Jednorazová platba za jedno volebné obdobie.</p></div>
        <div className="order-total"><small>Celkom s DPH</small><strong>{selected.price}</strong></div>
        <button className="button button--primary button--large" type="button"><Rocket size={18} /> Pokračovať k objednávke</button>
        <span className="secure-note"><LockKeyhole size={14} /> Bezpečnú platbu bude spracúvať Stripe</span>
      </section>
    </div>
  );
}
