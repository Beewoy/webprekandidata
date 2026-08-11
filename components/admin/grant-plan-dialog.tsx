"use client";

import { BadgePlus } from "lucide-react";
import { useActionState, useId, useMemo, useState } from "react";
import { grantAdminSitePlanAction } from "@/app/actions/admin";
import { PLAN_LABELS, PLAN_PRICE_LABELS, type PaidPlanCode } from "@/lib/payments/plans";
import {
  initialAdminActionState,
  type AdminActionState,
} from "@/lib/validation/admin";

export type GrantPlanSiteOption = {
  id: string;
  name: string;
  planCode: PaidPlanCode | null;
};

type GrantPlanDialogProps = {
  sites: GrantPlanSiteOption[];
  accountLabel: string;
  trigger?: "button" | "icon";
};

export function GrantPlanDialog({ sites, accountLabel, trigger = "button" }: GrantPlanDialogProps) {
  const titleId = useId();
  const [open, setOpen] = useState(false);
  const defaultSiteId = sites[0]?.id ?? "";
  const [selectedSiteId, setSelectedSiteId] = useState(defaultSiteId);
  const [state, formAction, pending] = useActionState(
    async (previousState: AdminActionState, formData: FormData) => {
      const nextState = await grantAdminSitePlanAction(previousState, formData);
      if (nextState.status === "success") setOpen(false);
      return nextState;
    },
    initialAdminActionState,
  );

  const selectedSite = useMemo(
    () => sites.find((site) => site.id === selectedSiteId) ?? sites[0] ?? null,
    [selectedSiteId, sites],
  );
  const currentPlan = selectedSite?.planCode ?? null;
  const disabled = sites.length === 0;

  function openDialog() {
    setSelectedSiteId(sites[0]?.id ?? "");
    setOpen(true);
  }

  return (
    <>
      {trigger === "icon" ? (
        <button
          className="icon-button"
          type="button"
          onClick={openDialog}
          disabled={disabled}
          title={disabled ? "Účet nemá žiadny web" : `Udeliť balík · ${accountLabel}`}
          aria-label={disabled ? "Udelenie balíka nie je dostupné" : `Udeliť balík pre ${accountLabel}`}
        >
          <BadgePlus size={18} aria-hidden="true" />
        </button>
      ) : (
        <button className="button button--secondary" type="button" onClick={openDialog} disabled={disabled}>
          Udeliť balík
        </button>
      )}

      {open && selectedSite && (
        <div className="admin-dialog" role="dialog" aria-modal="true" aria-labelledby={titleId}>
          <div className="admin-dialog__panel panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">Manuálny grant</p>
                <h2 id={titleId}>Udeliť Basic alebo Plus</h2>
              </div>
              <button className="button button--ghost button--small" type="button" onClick={() => setOpen(false)}>
                Zavrieť
              </button>
            </div>

            <form className="field-stack" action={formAction} noValidate>
              {sites.length === 1 ? (
                <input type="hidden" name="siteId" value={selectedSite.id} />
              ) : (
                <label className="field">
                  <span>Web projektu</span>
                  <select
                    name="siteId"
                    required
                    value={selectedSiteId}
                    onChange={(event) => setSelectedSiteId(event.target.value)}
                  >
                    {sites.map((site) => (
                      <option key={site.id} value={site.id}>
                        {site.name} · {site.planCode ? PLAN_LABELS[site.planCode] : "Free"}
                      </option>
                    ))}
                  </select>
                </label>
              )}

              <p className="admin-dialog__intro">
                Účet <strong>{accountLabel}</strong>, web „{selectedSite.name}“. Vytvorí sa zaplatená
                objednávka bez expirácie a aktualizuje sa aktívny balík projektu. Aktuálny balík:{" "}
                <strong>{currentPlan ? PLAN_LABELS[currentPlan] : "Free"}</strong>.
              </p>

              <fieldset className="admin-plan-choices" key={selectedSite.id}>
                <legend>Balík</legend>
                <label className="admin-plan-choice">
                  <input
                    type="radio"
                    name="planCode"
                    value="basic"
                    defaultChecked={currentPlan !== "plus"}
                    required
                  />
                  <span>
                    <strong>{PLAN_LABELS.basic}</strong>
                    <small>{PLAN_PRICE_LABELS.basic} s DPH · evidencia v objednávke</small>
                  </span>
                </label>
                <label className="admin-plan-choice">
                  <input
                    type="radio"
                    name="planCode"
                    value="plus"
                    defaultChecked={currentPlan === "plus"}
                    required
                  />
                  <span>
                    <strong>{PLAN_LABELS.plus}</strong>
                    <small>{PLAN_PRICE_LABELS.plus} s DPH · evidencia v objednávke</small>
                  </span>
                </label>
                {state.fieldErrors?.planCode ? <small role="alert">{state.fieldErrors.planCode}</small> : null}
              </fieldset>

              <label className="field">
                <span>Dôvod udelenia</span>
                <textarea
                  name="reason"
                  rows={3}
                  required
                  minLength={8}
                  placeholder="Napr. pilotný účet, podpora, interný test"
                  aria-invalid={Boolean(state.fieldErrors?.reason)}
                />
                {state.fieldErrors?.reason ? (
                  <small role="alert">{state.fieldErrors.reason}</small>
                ) : (
                  <small>Minimálne 8 znakov. Uloží sa do auditu a do objednávky.</small>
                )}
              </label>

              {state.status === "error" && state.message ? (
                <p className="admin-form-error" role="alert">{state.message}</p>
              ) : null}

              <div className="admin-dialog__actions">
                <button className="button button--ghost" type="button" onClick={() => setOpen(false)} disabled={pending}>
                  Zrušiť
                </button>
                <button className="button button--primary" type="submit" disabled={pending}>
                  {pending ? "Udeľujem…" : "Potvrdiť udelenie"}
                </button>
              </div>
            </form>
          </div>
          <button className="admin-dialog__backdrop" type="button" aria-label="Zavrieť dialóg" onClick={() => setOpen(false)} />
        </div>
      )}
    </>
  );
}
