"use client";

import { useActionState, useId, useState } from "react";
import { setAdminSiteHoldAction } from "@/app/actions/admin";
import {
  adminHoldCategories,
  adminHoldCategoryLabels,
  adminHoldScopeLabels,
  adminHoldScopes,
  initialAdminActionState,
  type AdminActionState,
} from "@/lib/validation/admin";

type SiteHoldDialogProps = {
  siteId: string;
  siteName: string;
  hold: boolean;
};

export function SiteHoldDialog({ siteId, siteName, hold }: SiteHoldDialogProps) {
  const titleId = useId();
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(
    async (previousState: AdminActionState, formData: FormData) => {
      const nextState = await setAdminSiteHoldAction(previousState, formData);
      if (nextState.status === "success") setOpen(false);
      return nextState;
    },
    initialAdminActionState,
  );
  const nextHold = !hold;

  return (
    <>
      <button
        className={nextHold ? "button button--secondary" : "button button--primary"}
        type="button"
        onClick={() => setOpen(true)}
      >
        {nextHold ? "Pozastaviť web" : "Uvoľniť pozastavenie"}
      </button>

      {open && (
        <div className="admin-dialog" role="dialog" aria-modal="true" aria-labelledby={titleId}>
          <div className="admin-dialog__panel panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">Administrátorský zásah</p>
                <h2 id={titleId}>{nextHold ? "Pozastaviť web" : "Uvoľniť pozastavenie"}</h2>
              </div>
              <button className="button button--ghost button--small" type="button" onClick={() => setOpen(false)}>
                Zavrieť
              </button>
            </div>

            <form className="field-stack" action={formAction} noValidate>
              <input type="hidden" name="siteId" value={siteId} />
              <input type="hidden" name="hold" value={nextHold ? "true" : "false"} />

              <p className="admin-dialog__intro">
                {nextHold
                  ? `Web „${siteName}“ bude skrytý z verejnej cesty. Kandidát ho nebude môcť sám obnoviť, kým pozastavenie neuvoľníte.`
                  : `Administrátorské pozastavenie webu „${siteName}“ bude zrušené. Ak existuje publikovaná verzia, web sa vráti do stavu zverejnený.`}
              </p>

              <label className="field">
                <span>Kategória</span>
                <select name="category" required defaultValue="terms_violation" aria-invalid={Boolean(state.fieldErrors?.category)}>
                  {adminHoldCategories.map((category) => (
                    <option key={category} value={category}>{adminHoldCategoryLabels[category]}</option>
                  ))}
                </select>
                {state.fieldErrors?.category ? <small role="alert">{state.fieldErrors.category}</small> : null}
              </label>

              <label className="field">
                <span>Rozsah</span>
                <select name="scope" required defaultValue="whole_site" aria-invalid={Boolean(state.fieldErrors?.scope)}>
                  {adminHoldScopes.map((scope) => (
                    <option key={scope} value={scope}>{adminHoldScopeLabels[scope]}</option>
                  ))}
                </select>
                {state.fieldErrors?.scope ? <small role="alert">{state.fieldErrors.scope}</small> : null}
              </label>

              {nextHold ? (
                <label className="field">
                  <span>Trvanie (dni)</span>
                  <input
                    type="number"
                    name="durationDays"
                    min={1}
                    max={3650}
                    defaultValue={14}
                    required
                    aria-invalid={Boolean(state.fieldErrors?.durationDays)}
                  />
                  {state.fieldErrors?.durationDays ? <small role="alert">{state.fieldErrors.durationDays}</small> : null}
                </label>
              ) : (
                <input type="hidden" name="durationDays" value="" />
              )}

              <label className="field">
                <span>Interný dôvod</span>
                <textarea
                  name="reason"
                  rows={3}
                  required
                  minLength={8}
                  placeholder="Konkrétny dôvod zásahu pre audit"
                  aria-invalid={Boolean(state.fieldErrors?.reason)}
                />
                {state.fieldErrors?.reason ? <small role="alert">{state.fieldErrors.reason}</small> : (
                  <small>Minimálne 8 znakov. Uloží sa do auditu.</small>
                )}
              </label>

              <label className="field">
                <span>Správa pre kandidáta</span>
                <textarea
                  name="candidateMessage"
                  rows={5}
                  required
                  minLength={8}
                  defaultValue={
                    nextHold
                      ? `Dobrý deň,\n\nváš web bol dočasne pozastavený prevádzkovateľom platformy WebPreKandidata.sk. Po náprave nás kontaktujte alebo počkajte na ďalšie informácie.\n\nĎakujeme.`
                      : `Dobrý deň,\n\nadministrátorské pozastavenie vášho webu bolo uvoľnené. Web je opäť dostupný podľa aktuálneho oprávnenia balíka.\n\nĎakujeme.`
                  }
                  aria-invalid={Boolean(state.fieldErrors?.candidateMessage)}
                />
                {state.fieldErrors?.candidateMessage ? (
                  <small role="alert">{state.fieldErrors.candidateMessage}</small>
                ) : (
                  <small>V MVP sa správa uloží do auditu; transakčný e-mail sa doplní neskôr.</small>
                )}
              </label>

              {state.status === "error" && state.message ? (
                <p className="admin-form-error" role="alert">{state.message}</p>
              ) : null}
              {state.status === "success" && state.message ? (
                <p className="admin-form-success" role="status">{state.message}</p>
              ) : null}

              <div className="admin-dialog__actions">
                <button className="button button--ghost" type="button" onClick={() => setOpen(false)} disabled={pending}>
                  Zrušiť
                </button>
                <button className="button button--primary" type="submit" disabled={pending}>
                  {pending ? "Ukladám…" : nextHold ? "Potvrdiť pozastavenie" : "Potvrdiť uvoľnenie"}
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
