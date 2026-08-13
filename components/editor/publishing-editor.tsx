"use client";

import {
  AlertTriangle,
  Check,
  CircleCheckBig,
  ExternalLink,
  Eye,
  LoaderCircle,
  LockKeyhole,
  PauseCircle,
  Rocket,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { startAuthenticatedWithdrawalAction } from "@/app/actions/withdrawal";
import { createCheckoutSessionAction } from "@/app/actions/checkout";
import { publishSiteAction, setSiteVisibilityAction, type PublishSiteResult } from "@/app/actions/publishing";
import { cn } from "@/lib/cn";
import type { SiteOrderRow } from "@/lib/data/orders";
import { EARLY_PERFORMANCE_STATEMENT } from "@/lib/legal/checkout-statements";
import { formatServiceDurationLabel } from "@/lib/legal/service-duration";
import { formatVatStatusLabel, getSellerIdentity } from "@/lib/legal/seller";
import type { CheckoutReturnNotice } from "@/lib/payments/checkout-return";
import { PLAN_LABELS, PLAN_PRICE_LABELS, type PaidPlanCode } from "@/lib/payments/plans";
import type { PublishingState } from "@/lib/publishing";
import { PageHeading } from "@/components/ui/page-heading";
import { PlanBadge } from "@/components/ui/plan-badge";

const serviceDurationLabel = formatServiceDurationLabel();

const plans = [
  {
    id: "basic" as const,
    name: PLAN_LABELS.basic,
    price: PLAN_PRICE_LABELS.basic,
    note: "Jednoduchý volebný web",
    features: [
      "Web na našej doméne",
      "Všetky sekcie editora",
      "Aktuality a kontaktný formulár",
      `Trvanie služby ${serviceDurationLabel}`,
      "Jednorazová platba bez automatického obnovenia",
    ],
  },
  {
    id: "plus" as const,
    name: PLAN_LABELS.plus,
    price: PLAN_PRICE_LABELS.plus,
    note: "Vlastná značka a viac AI",
    features: [
      "Všetko z balíka Basic",
      "Vlastná doména (registrácia a poplatky registrátora nie sú zahrnuté)",
      "AI návrhy textov s ľudskou kontrolou",
      `Trvanie služby ${serviceDurationLabel}`,
      "Prioritná podpora",
    ],
  },
];

type PublishingEditorProps = {
  checkoutEnabled: boolean;
  checkoutNotice: CheckoutReturnNotice | null;
  defaultEmail: string;
  defaultFullName: string;
  isDemo: boolean;
  orders: SiteOrderRow[];
  publishingState: PublishingState;
  siteId: string;
};

const orderStatusLabels: Record<SiteOrderRow["status"], string> = {
  pending: "Čaká na platbu",
  paid: "Zaplatená",
  failed: "Zlyhaná",
  refunded: "Vrátená",
  cancelled: "Zrušená",
};

function formatOrderDate(value: string) {
  return new Intl.DateTimeFormat("sk-SK", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Europe/Bratislava",
  }).format(new Date(value));
}

function OrderHistory({ orders }: { orders: SiteOrderRow[] }) {
  const [withdrawalMessage, setWithdrawalMessage] = useState<string | null>(null);
  const [withdrawalPending, startWithdrawal] = useTransition();

  if (orders.length === 0) return null;
  return (
    <section aria-labelledby="order-history-title" className="order-history">
      <div className="order-history__heading">
        <p className="eyebrow">Objednávky</p>
        <h2 id="order-history-title">História objednávok</h2>
      </div>
      <div className="order-history__list" role="list">
        {orders.map((order) => (
          <div className="order-history__item" key={order.id} role="listitem">
            <div>
              <strong>{order.planLabel}</strong>
              <small>{order.orderNumber} · {formatOrderDate(order.createdAt)}</small>
            </div>
            <div className="order-history__meta">
              <span>{order.priceLabel}</span>
              <span className={cn("order-status", `order-status--${order.status}`)}>{orderStatusLabels[order.status]}</span>
              {order.invoiceUrl ? (
                <a href={order.invoiceUrl} target="_blank" rel="noopener noreferrer">
                  Doklad
                </a>
              ) : null}
              {order.status === "paid" && (
                <button
                  className="button button--ghost"
                  disabled={withdrawalPending}
                  onClick={() => {
                    setWithdrawalMessage(null);
                    startWithdrawal(async () => {
                      const result = await startAuthenticatedWithdrawalAction({ orderId: order.id });
                      setWithdrawalMessage(result.message);
                    });
                  }}
                  type="button"
                >
                  Odstúpiť od zmluvy tu
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
      {withdrawalMessage && <p role="status">{withdrawalMessage}</p>}
      <p className="secure-note">
        Odstúpenie bez prihlásenia: <Link href="/odstupenie">Odstúpiť od zmluvy tu</Link>
      </p>
    </section>
  );
}

export function PublishingEditor({
  checkoutEnabled,
  checkoutNotice,
  defaultEmail,
  defaultFullName,
  isDemo,
  orders,
  publishingState,
  siteId,
}: PublishingEditorProps) {
  const [plan, setPlan] = useState<PaidPlanCode>("basic");
  const [customerType, setCustomerType] = useState<"b2c" | "b2b">("b2c");
  const [result, setResult] = useState<PublishSiteResult | null>(null);
  const [checkoutMessage, setCheckoutMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [pending, startTransition] = useTransition();
  const [checkoutPending, startCheckout] = useTransition();
  const router = useRouter();
  const selected = plans.find((item) => item.id === plan)!;
  const seller = getSellerIdentity();
  const currentPlan = publishingState.planCode ? plans.find((item) => item.id === publishingState.planCode)! : null;

  useEffect(() => {
    if (checkoutNotice?.kind !== "success_pending" || publishingState.entitled) return;
    const timer = window.setTimeout(() => router.refresh(), 2500);
    return () => window.clearTimeout(timer);
  }, [checkoutNotice?.kind, publishingState.entitled, router]);

  function runAction(action: () => Promise<PublishSiteResult>) {
    setResult(null);
    startTransition(async () => {
      const nextResult = await action();
      setResult(nextResult);
      if (nextResult.ok) router.refresh();
    });
  }

  function submitCheckout(formData: FormData) {
    setCheckoutMessage(null);
    setFieldErrors({});
    startCheckout(async () => {
      const payload = {
        siteId,
        planCode: plan,
        customerType,
        earlyPerformanceRequested: customerType === "b2c" && formData.get("earlyPerformance") === "on",
        billing: {
          fullName: String(formData.get("fullName") ?? ""),
          email: String(formData.get("email") ?? ""),
          street: String(formData.get("street") ?? ""),
          city: String(formData.get("city") ?? ""),
          postalCode: String(formData.get("postalCode") ?? ""),
          country: "SK" as const,
          companyName: String(formData.get("companyName") ?? ""),
          ico: String(formData.get("ico") ?? ""),
          icDph: String(formData.get("icDph") ?? ""),
          acceptTerms: formData.get("acceptTerms") === "on",
        },
      };
      const response = await createCheckoutSessionAction(payload);
      if (!response.ok) {
        setCheckoutMessage(response.message);
        setFieldErrors(response.fieldErrors ?? {});
        return;
      }
      window.location.assign(response.url);
    });
  }

  if (currentPlan) {
    const isPublished = publishingState.siteStatus === "published";
    const isSuspended = publishingState.siteStatus === "suspended";
    const adminHold = publishingState.adminHold;
    const primaryLabel = !publishingState.currentPublication
      ? "Zverejniť web"
      : isSuspended
        ? adminHold
          ? null
          : publishingState.hasUnpublishedChanges ? "Publikovať zmeny a obnoviť" : "Obnoviť web"
        : publishingState.hasUnpublishedChanges ? "Publikovať zmeny" : null;
    const primaryAction = isSuspended && !publishingState.hasUnpublishedChanges
      ? () => setSiteVisibilityAction({ siteId, visible: true })
      : () => publishSiteAction({ siteId });
    const canPublish = publishingState.entitled && publishingState.readiness.ready && !adminHold;
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
        {checkoutNotice && (
          <p className={cn("checkout-notice", checkoutNotice.kind === "cancelled" ? "checkout-notice--cancelled" : "checkout-notice--success")} role="status">
            {checkoutNotice.message}
          </p>
        )}
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
                <strong>{isPublished ? "Web je verejný" : isSuspended ? (adminHold ? "Web je pozastavený prevádzkovateľom" : "Web je pozastavený") : "Web ešte nie je verejný"}</strong>
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
          {adminHold && <div className="publication-entitlement-warning" role="alert"><LockKeyhole size={18} /><span><strong>Administrátorské pozastavenie</strong><small>Web skryl prevádzkovateľ platformy. Obnovenie je možné až po uvoľnení zo strany admina.</small></span></div>}

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
        <OrderHistory orders={orders} />
      </div>
    );
  }

  const canCheckout = checkoutEnabled && !isDemo;

  return (
    <div className="page-container">
      <PageHeading eyebrow="Posledný krok" title="Zverejnenie webu" description="Vyberte si balík. O platbu požiadame až po kontrole údajov." />
      {checkoutNotice && (
        <p className={cn("checkout-notice", checkoutNotice.kind === "cancelled" ? "checkout-notice--cancelled" : "checkout-notice--success")} role="status">
          {checkoutNotice.message}
        </p>
      )}
      <div className="readiness-card"><span><CircleCheckBig size={23} /></span><div><h2>Web je pripravený na kontrolu</h2><p>Pred platbou môžete obsah ešte ľubovoľne meniť. Web zverejníme až po potvrdení objednávky.</p></div></div>
      <div className="pricing-grid">
        {plans.map((item) => (
          <button className={cn("pricing-card", plan === item.id && "pricing-card--selected")} type="button" key={item.id} onClick={() => setPlan(item.id)}>
            {item.id === "plus" && <span className="recommended-badge"><Sparkles size={13} /> Odporúčame</span>}
            <span className="pricing-radio">{plan === item.id && <Check size={14} />}</span>
            <span className="pricing-title"><strong>{item.name}</strong><small>{item.note}</small></span>
            <strong className="pricing-price">{item.price}<small>konečná cena</small></strong>
            <span className="pricing-features">{item.features.map((feature) => <span key={feature}><Check size={15} />{feature}</span>)}</span>
          </button>
        ))}
      </div>

      <form
        className="checkout-form"
        onSubmit={(event) => {
          event.preventDefault();
          submitCheckout(new FormData(event.currentTarget));
        }}
      >
        <section className="order-summary order-summary--checkout" aria-labelledby="billing-title">
          <div>
            <p className="eyebrow">Vybraný balík</p>
            <h2 id="billing-title">{selected.name}</h2>
            <p>
              {selected.note}. Jednorazová konečná cena {selected.price}, trvanie služby {serviceDurationLabel},
              bez automatického obnovenia.
            </p>
          </div>
          <div className="order-total"><small>Celkom vrátane všetkých daní a poplatkov</small><strong>{selected.price}</strong></div>

          <fieldset className="checkout-customer-type">
            <legend>Nakupujem ako</legend>
            <div className="checkout-customer-type__options">
              <label className={cn("checkout-radio-option", customerType === "b2c" && "checkout-radio-option--active")}>
                <input
                  checked={customerType === "b2c"}
                  className="sr-only"
                  name="customerType"
                  onChange={() => setCustomerType("b2c")}
                  type="radio"
                  value="b2c"
                />
                <span className="checkout-radio-option__control" aria-hidden="true" />
                <span className="checkout-radio-option__copy">
                  <strong>Spotrebiteľ</strong>
                  <small>Súkromná osoba mimo podnikania</small>
                </span>
              </label>
              <label className={cn("checkout-radio-option", customerType === "b2b" && "checkout-radio-option--active")}>
                <input
                  checked={customerType === "b2b"}
                  className="sr-only"
                  name="customerType"
                  onChange={() => setCustomerType("b2b")}
                  type="radio"
                  value="b2b"
                />
                <span className="checkout-radio-option__control" aria-hidden="true" />
                <span className="checkout-radio-option__copy">
                  <strong>Podnikateľ / právnická osoba</strong>
                  <small>Nákup v súvislosti s podnikaním alebo za firmu</small>
                </span>
              </label>
            </div>
          </fieldset>

          <div className="checkout-form__fields">
            <label className="field">
              <span>Meno a priezvisko / názov</span>
              <input autoComplete="name" defaultValue={defaultFullName} name="fullName" required type="text" />
              {fieldErrors["billing.fullName"] && <span className="field-error" role="alert">{fieldErrors["billing.fullName"][0]}</span>}
            </label>
            <label className="field">
              <span>Fakturačný e-mail</span>
              <input autoComplete="email" defaultValue={defaultEmail} name="email" required type="email" />
              {fieldErrors["billing.email"] && <span className="field-error" role="alert">{fieldErrors["billing.email"][0]}</span>}
            </label>
            <label className="field">
              <span>Ulica a číslo</span>
              <input autoComplete="street-address" name="street" required type="text" />
              {fieldErrors["billing.street"] && <span className="field-error" role="alert">{fieldErrors["billing.street"][0]}</span>}
            </label>
            <div className="checkout-form__row">
              <label className="field">
                <span>PSČ</span>
                <input autoComplete="postal-code" inputMode="numeric" name="postalCode" placeholder="123 45" required type="text" />
                {fieldErrors["billing.postalCode"] && <span className="field-error" role="alert">{fieldErrors["billing.postalCode"][0]}</span>}
              </label>
              <label className="field">
                <span>Mesto</span>
                <input autoComplete="address-level2" name="city" required type="text" />
                {fieldErrors["billing.city"] && <span className="field-error" role="alert">{fieldErrors["billing.city"][0]}</span>}
              </label>
            </div>
            <label className="field">
              <span>Obchodné meno {customerType === "b2b" ? "" : <small>(voliteľné)</small>}</span>
              <input autoComplete="organization" name="companyName" required={customerType === "b2b"} type="text" />
              {fieldErrors["billing.companyName"] && <span className="field-error" role="alert">{fieldErrors["billing.companyName"][0]}</span>}
            </label>
            <label className="field">
              <span>IČO {customerType === "b2b" ? "" : <small>(voliteľné)</small>}</span>
              <input inputMode="numeric" name="ico" required={customerType === "b2b"} type="text" />
              {fieldErrors["billing.ico"] && <span className="field-error" role="alert">{fieldErrors["billing.ico"][0]}</span>}
            </label>
            {customerType === "b2b" && (
              <label className="field">
                <span>IČ DPH <small>(ak máte)</small></span>
                <input name="icDph" type="text" />
              </label>
            )}

            <div className="checkout-precontract" role="region" aria-label="Predzmluvný súhrn">
              <p><strong>Pred objednávkou:</strong> balík {selected.name}, konečná cena {selected.price}, trvanie {serviceDurationLabel}, aktivácia po potvrdení platby{customerType === "b2c" ? " (alebo po lehote odstúpenia, ak nepožiadate o skoršie plnenie)" : ""}.</p>
              <p>
                Predávajúci: {seller.name}, {seller.address}, IČO {seller.ico}, {formatVatStatusLabel(seller)}. Platba kartou cez Stripe.
                {" "}
                <a href="/obchodne-podmienky" target="_blank" rel="noreferrer">VOP</a>
                {" · "}
                <a href="/ochrana-sukromia" target="_blank" rel="noreferrer">Ochrana súkromia</a>
                {" · "}
                <a href="/reklamacny-poriadok" target="_blank" rel="noreferrer">Reklamácie</a>
              </p>
            </div>

            <label className="checkout-terms">
              <input name="acceptTerms" type="checkbox" />
              <span>
                Oboznámil(a) som sa s <a href="/obchodne-podmienky" target="_blank" rel="noreferrer">VOP vo verzii 2026.1</a>
                {" "}a beriem na vedomie informácie o <a href="/ochrana-sukromia" target="_blank" rel="noreferrer">ochrane súkromia</a>.
              </span>
            </label>
            {fieldErrors["billing.acceptTerms"] && <span className="field-error" role="alert">{fieldErrors["billing.acceptTerms"][0]}</span>}

            {customerType === "b2c" && (
              <>
                <label className="checkout-terms">
                  <input name="earlyPerformance" type="checkbox" />
                  <span>{EARLY_PERFORMANCE_STATEMENT}</span>
                </label>
                {fieldErrors.earlyPerformanceRequested && (
                  <span className="field-error" role="alert">{fieldErrors.earlyPerformanceRequested[0]}</span>
                )}
              </>
            )}
          </div>

          <button className="button button--primary button--large" disabled={!canCheckout || checkoutPending} type="submit">
            {checkoutPending ? <LoaderCircle className="spin" size={18} /> : <Rocket size={18} />}
            {checkoutPending ? "Presmerúvam na platbu…" : "Objednávka s povinnosťou platby"}
          </button>
          <span className="secure-note"><LockKeyhole size={14} /> Bezpečnú platbu spracúva Stripe. Zmluva vzniká až po potvrdení podpísaným webhookom.</span>
          {isDemo && <p className="checkout-disabled-note" role="status">V demo režime platba nie je dostupná.</p>}
          {!isDemo && !checkoutEnabled && <p className="checkout-disabled-note" role="status">Platobná brána ešte nie je nakonfigurovaná.</p>}
          {checkoutMessage && <p className="publication-result publication-result--error" role="alert">{checkoutMessage}</p>}
        </section>
      </form>
      <OrderHistory orders={orders} />
    </div>
  );
}
