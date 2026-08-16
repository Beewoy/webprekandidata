"use client";

import { Check, CircleCheckBig, LoaderCircle, LockKeyhole, ReceiptText, Rocket, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { createCheckoutSessionAction } from "@/app/actions/checkout";
import { startAuthenticatedWithdrawalAction } from "@/app/actions/withdrawal";
import { cn } from "@/lib/cn";
import type { SiteOrderRow } from "@/lib/data/orders";
import { EARLY_PERFORMANCE_STATEMENT } from "@/lib/legal/checkout-statements";
import { formatServiceDurationLabel } from "@/lib/legal/service-duration";
import {
  ADMIN_GRANT_NOTE,
  ADMIN_GRANT_STATUS_LABEL,
} from "@/lib/payments/admin-grant";
import type { CheckoutReturnNotice } from "@/lib/payments/checkout-return";
import {
  PAID_PLAN_CODES,
  PLAN_DESCRIPTIONS,
  PLAN_FEATURES,
  PLAN_LABELS,
  PLAN_PRICE_LABELS,
  type PaidPlanCode,
} from "@/lib/payments/plans";
import type { PublishingState } from "@/lib/publishing";
import { PageHeading } from "@/components/ui/page-heading";
import { PlanBadge } from "@/components/ui/plan-badge";

const serviceDurationLabel = formatServiceDurationLabel();

const plans = PAID_PLAN_CODES.map((id) => ({
  id,
  name: PLAN_LABELS[id],
  price: PLAN_PRICE_LABELS[id],
  note: PLAN_DESCRIPTIONS[id],
  features: PLAN_FEATURES[id],
}));

type OrdersEditorProps = {
  checkoutEnabled: boolean;
  checkoutNotice: CheckoutReturnNotice | null;
  defaultEmail: string;
  defaultFullName: string;
  isDemo: boolean;
  orders: SiteOrderRow[];
  publishingState: PublishingState;
  seller: { address: string; ico: string; name: string; vatStatusLabel: string };
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
  return new Intl.DateTimeFormat("sk-SK", { dateStyle: "medium", timeStyle: "short", timeZone: "Europe/Bratislava" }).format(new Date(value));
}

function orderDisplayStatus(order: SiteOrderRow) {
  if (order.isAdminGrant && order.status === "paid") {
    return { className: "order-status--admin-grant", label: ADMIN_GRANT_STATUS_LABEL };
  }
  return { className: `order-status--${order.status}`, label: orderStatusLabels[order.status] };
}

function OrderHistory({ orders }: { orders: SiteOrderRow[] }) {
  const [withdrawalMessage, setWithdrawalMessage] = useState<string | null>(null);
  const [withdrawalPending, startWithdrawal] = useTransition();

  return (
    <section aria-labelledby="order-history-title" className={cn("order-history", orders.length === 0 && "order-history--empty")}>
      <div className="order-history__heading"><p className="eyebrow">Prehľad</p><h2 id="order-history-title">História objednávok</h2></div>
      {orders.length === 0 ? (
        <div className="order-history__empty"><ReceiptText aria-hidden="true" size={22} /><div><strong>Zatiaľ tu nie je žiadna objednávka</strong><p>Po vytvorení objednávky tu nájdete jej stav a dostupný doklad.</p></div></div>
      ) : (
        <div className="order-history__list" role="list">
          {orders.map((order) => {
            const displayStatus = orderDisplayStatus(order);
            return (
              <div className="order-history__item" key={order.id} role="listitem">
                <div>
                  <strong>{order.planLabel}</strong>
                  <small>{order.orderNumber} · {formatOrderDate(order.createdAt)}</small>
                  {order.isAdminGrant ? <p className="order-history__grant-note">{ADMIN_GRANT_NOTE}</p> : null}
                </div>
                <div className="order-history__meta">
                  <span>{order.priceLabel}</span>
                  <span className={cn("order-status", displayStatus.className)}>{displayStatus.label}</span>
                  {order.invoiceUrl ? <a href={order.invoiceUrl} target="_blank" rel="noopener noreferrer">Doklad</a> : null}
                  {order.status === "paid" && !order.isAdminGrant && (
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
            );
          })}
        </div>
      )}
      {withdrawalMessage && <p role="status">{withdrawalMessage}</p>}
      <p className="secure-note">Odstúpenie bez prihlásenia: <Link href="/odstupenie">Odstúpiť od zmluvy tu</Link></p>
    </section>
  );
}

export function OrdersEditor({
  checkoutEnabled,
  checkoutNotice,
  defaultEmail,
  defaultFullName,
  isDemo,
  orders,
  publishingState,
  seller,
  siteId,
}: OrdersEditorProps) {
  const [plan, setPlan] = useState<PaidPlanCode>("basic");
  const [customerType, setCustomerType] = useState<"b2c" | "b2b">("b2c");
  const [checkoutMessage, setCheckoutMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [checkoutPending, startCheckout] = useTransition();
  const router = useRouter();
  const selected = plans.find((item) => item.id === plan)!;
  const currentPlan = publishingState.planCode ? plans.find((item) => item.id === publishingState.planCode)! : null;
  const activePlanOrder = orders.find(
    (order) => order.status === "paid" && order.planCode === publishingState.planCode,
  );
  const activePlanIsAdminGrant = Boolean(activePlanOrder?.isAdminGrant);

  useEffect(() => {
    if (checkoutNotice?.kind !== "success_pending" || publishingState.entitled) return;
    const timer = window.setTimeout(() => router.refresh(), 2500);
    return () => window.clearTimeout(timer);
  }, [checkoutNotice?.kind, publishingState.entitled, router]);

  function submitCheckout(formData: FormData) {
    setCheckoutMessage(null);
    setFieldErrors({});
    startCheckout(async () => {
      const response = await createCheckoutSessionAction({
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
          country: "SK",
          companyName: String(formData.get("companyName") ?? ""),
          ico: String(formData.get("ico") ?? ""),
          icDph: String(formData.get("icDph") ?? ""),
          acceptTerms: formData.get("acceptTerms") === "on",
        },
      });
      if (!response.ok) {
        setCheckoutMessage(response.message);
        setFieldErrors(response.fieldErrors ?? {});
        return;
      }
      window.location.assign(response.url);
    });
  }

  const notice = checkoutNotice && <p className={cn("checkout-notice", checkoutNotice.kind === "cancelled" ? "checkout-notice--cancelled" : "checkout-notice--success")} role="status">{checkoutNotice.message}</p>;

  if (currentPlan) {
    return (
      <div className="page-container">
        <PageHeading eyebrow="Platby" title="Objednávky" description="Aktívny balík, stav platieb, doklady a možnosti odstúpenia na jednom mieste." />
        {notice}
        <section className="current-order-plan panel" aria-labelledby="current-order-plan-title">
          <span aria-hidden="true"><Check size={20} /></span>
          <div>
            <p className="eyebrow">Aktívny balík</p>
            <h2 id="current-order-plan-title">{currentPlan.name}</h2>
            <p>
              {currentPlan.note}{" "}
              {activePlanIsAdminGrant
                ? ADMIN_GRANT_NOTE
                : `Cena ${currentPlan.price} jednorazovo.`}
            </p>
          </div>
          <PlanBadge plan={publishingState.planCode} />
          <Link className="button button--secondary" href={`/app/web/${siteId}/publikovanie`}><Rocket size={17} /> Pokračovať k publikovaniu</Link>
        </section>
        <OrderHistory orders={orders} />
      </div>
    );
  }

  const canCheckout = checkoutEnabled && !isDemo;

  return (
    <div className="page-container">
      <PageHeading eyebrow="Platby" title="Objednávky" description="Vyberte si balík. O platbu požiadame až po kontrole údajov." />
      {notice}
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

      <form className="checkout-form" onSubmit={(event) => { event.preventDefault(); submitCheckout(new FormData(event.currentTarget)); }}>
        <section className="order-summary order-summary--checkout" aria-labelledby="billing-title">
          <div><p className="eyebrow">Vybraný balík</p><h2 id="billing-title">{selected.name}</h2><p>{selected.note} Jednorazová konečná cena {selected.price}, trvanie služby {serviceDurationLabel}, bez automatického obnovenia.</p></div>
          <div className="order-total"><small>Celkom vrátane všetkých daní a poplatkov</small><strong>{selected.price}</strong></div>

          <fieldset className="checkout-customer-type">
            <legend>Nakupujem ako</legend>
            <div className="checkout-customer-type__options">
              <label className={cn("checkout-radio-option", customerType === "b2c" && "checkout-radio-option--active")}>
                <input checked={customerType === "b2c"} className="sr-only" name="customerType" onChange={() => setCustomerType("b2c")} type="radio" value="b2c" />
                <span className="checkout-radio-option__control" aria-hidden="true" /><span className="checkout-radio-option__copy"><strong>Spotrebiteľ</strong><small>Súkromná osoba mimo podnikania</small></span>
              </label>
              <label className={cn("checkout-radio-option", customerType === "b2b" && "checkout-radio-option--active")}>
                <input checked={customerType === "b2b"} className="sr-only" name="customerType" onChange={() => setCustomerType("b2b")} type="radio" value="b2b" />
                <span className="checkout-radio-option__control" aria-hidden="true" /><span className="checkout-radio-option__copy"><strong>Podnikateľ / právnická osoba</strong><small>Nákup v súvislosti s podnikaním alebo za firmu</small></span>
              </label>
            </div>
          </fieldset>

          <div className="checkout-form__fields">
            <label className="field"><span>Meno a priezvisko / názov</span><input autoComplete="name" defaultValue={defaultFullName} name="fullName" required type="text" />{fieldErrors["billing.fullName"] && <span className="field-error" role="alert">{fieldErrors["billing.fullName"][0]}</span>}</label>
            <label className="field"><span>Fakturačný e-mail</span><input autoComplete="email" defaultValue={defaultEmail} name="email" required type="email" />{fieldErrors["billing.email"] && <span className="field-error" role="alert">{fieldErrors["billing.email"][0]}</span>}</label>
            <label className="field"><span>Ulica a číslo</span><input autoComplete="street-address" name="street" required type="text" />{fieldErrors["billing.street"] && <span className="field-error" role="alert">{fieldErrors["billing.street"][0]}</span>}</label>
            <div className="checkout-form__row">
              <label className="field"><span>PSČ</span><input autoComplete="postal-code" inputMode="numeric" name="postalCode" placeholder="123 45" required type="text" />{fieldErrors["billing.postalCode"] && <span className="field-error" role="alert">{fieldErrors["billing.postalCode"][0]}</span>}</label>
              <label className="field"><span>Mesto</span><input autoComplete="address-level2" name="city" required type="text" />{fieldErrors["billing.city"] && <span className="field-error" role="alert">{fieldErrors["billing.city"][0]}</span>}</label>
            </div>
            <label className="field"><span>Obchodné meno {customerType === "b2b" ? "" : <small>(voliteľné)</small>}</span><input autoComplete="organization" name="companyName" required={customerType === "b2b"} type="text" />{fieldErrors["billing.companyName"] && <span className="field-error" role="alert">{fieldErrors["billing.companyName"][0]}</span>}</label>
            <label className="field"><span>IČO {customerType === "b2b" ? "" : <small>(voliteľné)</small>}</span><input inputMode="numeric" name="ico" required={customerType === "b2b"} type="text" />{fieldErrors["billing.ico"] && <span className="field-error" role="alert">{fieldErrors["billing.ico"][0]}</span>}</label>
            {customerType === "b2b" && <label className="field"><span>IČ DPH <small>(ak máte)</small></span><input name="icDph" type="text" /></label>}

            <div className="checkout-precontract" role="region" aria-label="Predzmluvný súhrn">
              <p><strong>Pred objednávkou:</strong> balík {selected.name}, konečná cena {selected.price}, trvanie {serviceDurationLabel}, aktivácia po potvrdení platby{customerType === "b2c" ? " (alebo po lehote odstúpenia, ak nepožiadate o skoršie plnenie)" : ""}.</p>
              <p>Predávajúci: {seller.name}, {seller.address}, IČO {seller.ico}, {seller.vatStatusLabel}. Platba kartou cez Stripe. <a href="/obchodne-podmienky" target="_blank" rel="noreferrer">VOP</a>{" · "}<a href="/ochrana-sukromia" target="_blank" rel="noreferrer">Ochrana súkromia</a>{" · "}<a href="/reklamacny-poriadok" target="_blank" rel="noreferrer">Reklamácie</a></p>
            </div>

            <label className="checkout-terms"><input name="acceptTerms" type="checkbox" /><span>Oboznámil(a) som sa s <a href="/obchodne-podmienky" target="_blank" rel="noreferrer">VOP vo verzii 2026.1</a>{" "}a beriem na vedomie informácie o <a href="/ochrana-sukromia" target="_blank" rel="noreferrer">ochrane súkromia</a>.</span></label>
            {fieldErrors["billing.acceptTerms"] && <span className="field-error" role="alert">{fieldErrors["billing.acceptTerms"][0]}</span>}
            {customerType === "b2c" && <><label className="checkout-terms"><input name="earlyPerformance" type="checkbox" /><span>{EARLY_PERFORMANCE_STATEMENT}</span></label>{fieldErrors.earlyPerformanceRequested && <span className="field-error" role="alert">{fieldErrors.earlyPerformanceRequested[0]}</span>}</>}
          </div>

          <button className="button button--primary button--large" disabled={!canCheckout || checkoutPending} type="submit">{checkoutPending ? <LoaderCircle className="spin" size={18} /> : <Rocket size={18} />}{checkoutPending ? "Presmerúvam na platbu…" : "Objednávka s povinnosťou platby"}</button>
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
