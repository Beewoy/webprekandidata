"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import {
  AlertTriangle,
  ArrowRight,
  Check,
  Copy,
  Globe2,
  Info,
  LoaderCircle,
  LockKeyhole,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import {
  attachCustomDomainAction,
  checkCustomDomainAction,
  removeCustomDomainAction,
  setPrimaryDomainAction,
  updateSiteSlugAction,
} from "@/app/actions/domains";
import { PageHeading } from "@/components/ui/page-heading";
import { SaveSuccessNotice } from "@/components/editor/save-success-notice";
import { DomainDnsGuide } from "@/components/editor/domain-dns-guide";
import { getPlatformPathHostname, getPlatformSiteDisplayUrl } from "@/lib/domains/platform";
import type { SiteDomainRecord, SiteDomainState } from "@/lib/data/domains";
import { sanitizeSlugDraftInput } from "@/lib/validation/slug";

function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button aria-label={label} className="icon-button" onClick={copy} type="button">
      {copied ? <Check size={17} /> : <Copy size={17} />}
    </button>
  );
}

function DnsTable({ records }: { records: SiteDomainRecord["dns"] }) {
  if (records.length === 0) {
    return (
      <p className="domain-empty-note">
        DNS inštrukcie sa nepodarilo načítať. Skúste znova Skontrolovať DNS alebo doplňte A záznam @ → 76.76.21.21 u registrátora.
      </p>
    );
  }

  return (
    <div className="domain-dns-table-wrap">
      <table className="domain-dns-table">
        <caption className="sr-only">DNS záznamy na nastavenie u registrátora (napr. Websupport)</caption>
        <thead>
          <tr>
            <th scope="col">Typ</th>
            <th scope="col">Názov</th>
            <th scope="col">Hodnota</th>
            <th scope="col">Účel</th>
            <th scope="col"><span className="sr-only">Kopírovať</span></th>
          </tr>
        </thead>
        <tbody>
          {records.map((record) => (
            <tr key={`${record.type}-${record.name}-${record.value}`}>
              <td><code>{record.type}</code></td>
              <td><code>{record.name}</code></td>
              <td><code>{record.value}</code></td>
              <td>{record.purpose === "verification" ? "Overenie" : "Smerovanie"}</td>
              <td><CopyButton label={`Kopírovať hodnotu ${record.type}`} value={record.value} /></td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="domain-empty-note">
        Tieto záznamy nastavte vo Websupporte (alebo u iného registrátora). Potom kliknite na Skontrolovať DNS.
        Ak overenie zlyhá, skontrolujte aj odporúčania hostingu — niekedy treba odstrániť konfliktný AAAA záznam na root (@).
      </p>
    </div>
  );
}

export function DomainEditor({ siteId, state }: { siteId: string; state: SiteDomainState }) {
  const [mode, setMode] = useState<"platform" | "custom">(state.customDomain ? "custom" : "platform");
  const [hostname, setHostname] = useState(state.customDomain?.hostname ?? "");
  const [slug, setSlug] = useState(state.slug);
  const [slugFieldError, setSlugFieldError] = useState("");
  const [message, setMessage] = useState("");
  const messageTimeoutRef = useRef<number | null>(null);
  const [error, setError] = useState("");
  const [fieldError, setFieldError] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const custom = state.customDomain;
  const locked = !state.canUseCustomDomain;
  const platformLabel = getPlatformPathHostname();
  const previewUrl = getPlatformSiteDisplayUrl(slug.trim() || state.slug);
  const slugChanged = slug.trim().toLowerCase() !== state.slug;

  function refresh(nextMessage: string, nextSlug?: string) {
    setMessage(nextMessage);
    setError("");
    if (messageTimeoutRef.current !== null) window.clearTimeout(messageTimeoutRef.current);
    messageTimeoutRef.current = window.setTimeout(() => {
      setMessage("");
      messageTimeoutRef.current = null;
    }, 4000);
    if (nextSlug !== undefined) setSlug(nextSlug);
    router.refresh();
  }

  function attachDomain() {
    setError("");
    setFieldError("");
    setMessage("");
    startTransition(async () => {
      const result = await attachCustomDomainAction({ hostname, siteId });
      if (!result.ok) {
        setError(result.message);
        setFieldError(result.fieldErrors?.hostname?.[0] ?? "");
        return;
      }
      refresh(result.message ?? "Doména bola pripojená.");
    });
  }

  function checkDomain(domain: SiteDomainRecord) {
    setError("");
    setMessage("");
    startTransition(async () => {
      const result = await checkCustomDomainAction({ domainId: domain.id, siteId });
      if (!result.ok) {
        setError(result.message);
        return;
      }
      refresh(result.message ?? "Kontrola dokončená.");
    });
  }

  function removeDomain(domain: SiteDomainRecord) {
    if (!window.confirm(`Odstrániť doménu ${domain.hostname}?`)) return;
    setError("");
    setMessage("");
    startTransition(async () => {
      const result = await removeCustomDomainAction({ domainId: domain.id, siteId });
      if (!result.ok) {
        setError(result.message);
        return;
      }
      setHostname("");
      setMode("platform");
      refresh(result.message ?? "Doména bola odstránená.");
    });
  }

  function makePrimary(domain: SiteDomainRecord) {
    setError("");
    setMessage("");
    startTransition(async () => {
      const result = await setPrimaryDomainAction({ domainId: domain.id, siteId });
      if (!result.ok) {
        setError(result.message);
        return;
      }
      refresh(result.message ?? "Hlavná adresa bola nastavená.");
    });
  }

  function savePlatformSlug() {
    setError("");
    setSlugFieldError("");
    setMessage("");
    startTransition(async () => {
      const result = await updateSiteSlugAction({ siteId, slug });
      if (!result.ok) {
        setError(result.message);
        setSlugFieldError(result.fieldErrors?.slug?.[0] ?? "");
        return;
      }
      refresh(result.message ?? "Adresa webu bola uložená.", slug.trim().toLowerCase());
    });
  }

  function normalizeSlugInput(value: string) {
    return sanitizeSlugDraftInput(value);
  }

  return (
    <div className="page-container">
      <PageHeading
        eyebrow="Adresa webu"
        title="Doména"
        description="Vyberte, na akej adrese návštevníci váš web nájdu."
      />

      {message && <SaveSuccessNotice message={message} visible={!!message} />}
      {error && <div className="autosave-error" role="alert">{error}</div>}

      <section className="editor-card">
        <div className="domain-options">
          <button
            type="button"
            className={mode === "platform" ? "domain-option domain-option--active" : "domain-option"}
            onClick={() => setMode("platform")}
          >
            <span className="domain-radio">{mode === "platform" && <Check size={14} />}</span>
            <span>
              <strong>Adresa na WebPreKandidata.sk</strong>
              <small>Súčasť balíka Basic aj Plus</small>
            </span>
          </button>
          <button
            type="button"
            className={mode === "custom" ? "domain-option domain-option--active" : "domain-option"}
            onClick={() => setMode("custom")}
          >
            <span className="domain-radio">{mode === "custom" && <Check size={14} />}</span>
            <span>
              <strong>Vlastná doména</strong>
              <small>Napríklad martin-novak.sk · balík Plus</small>
            </span>
          </button>
        </div>

        {mode === "platform" ? (
          <div className="domain-form">
            <label className="field">
              <span>Adresa webu</span>
              <div className="slug-input">
                <span>{platformLabel}/</span>
                <input
                  autoComplete="off"
                  aria-describedby={slugFieldError ? "platform-slug-error" : "platform-slug-help"}
                  aria-invalid={Boolean(slugFieldError)}
                  disabled={isPending}
                  id="platform-slug"
                  onChange={(event) => setSlug(normalizeSlugInput(event.target.value))}
                  value={slug}
                />
              </div>
              {slugFieldError
                ? <small className="field-error" id="platform-slug-error" role="alert">{slugFieldError}</small>
                : <small id="platform-slug-help">Používajte malé písmená, číslice a pomlčky. Adresa sa zmení okamžite po uložení.</small>}
            </label>

            <div className="domain-result">
              <Globe2 size={20} />
              <span>
                <small>Náhľad verejnej adresy</small>
                <strong>{previewUrl}</strong>
              </span>
              <CopyButton label="Kopírovať adresu" value={previewUrl} />
            </div>

            {state.siteStatus === "published" && slugChanged && (
              <div className="info-box" role="note">
                <AlertTriangle size={18} />
                <span>
                  <strong>Stará adresa prestane fungovať</strong>
                  <small>Odkazy, ktoré ste už zdieľali, bude treba aktualizovať. Presmerovanie zo starej adresy neposkytujeme.</small>
                </span>
              </div>
            )}

            <div className="info-box">
              <Info size={18} />
              <span>
                <strong>Funguje po zverejnení webu</strong>
                <small>HTTPS a hosting zabezpečujeme my. Vlastnú doménu môžete doplniť neskôr v balíku Plus.</small>
              </span>
            </div>

            <div className="editor-card__footer domain-form-footer">
              <span><ShieldCheck size={16} /> HTTPS certifikát a bezpečné pripojenie zabezpečíme automaticky.</span>
              <button
                className="button button--primary"
                disabled={isPending || !slug.trim() || !slugChanged}
                onClick={savePlatformSlug}
                type="button"
              >
                {isPending ? <LoaderCircle className="spin" size={17} /> : null}
                Uložiť adresu
              </button>
            </div>
          </div>
        ) : (
          <div className="domain-form">
            {locked ? (
              <div className="info-box">
                <LockKeyhole size={18} />
                <span>
                  <strong>Vlastná doména je v balíku Plus</strong>
                  <small>Po aktivácii Plus pripojíte jednu existujúcu doménu a dostanete presné DNS inštrukcie.</small>
                </span>
              </div>
            ) : custom ? (
              <>
                <div className={`domain-status-banner domain-status-banner--${custom.status}`}>
                  <span>
                    <small>Stav</small>
                    <strong>{custom.statusLabel}</strong>
                  </span>
                  <span>
                    <small>HTTPS</small>
                    <strong>{custom.sslReady ? "Pripravené" : "Čaká na overenie"}</strong>
                  </span>
                  <span>
                    <small>Hostname</small>
                    <strong>{custom.hostname}</strong>
                  </span>
                </div>

                <DnsTable records={custom.dns} />
                <DomainDnsGuide hostname={custom.hostname} />

                <div className="domain-actions">
                  <button className="button button--secondary" disabled={isPending} onClick={() => checkDomain(custom)} type="button">
                    {isPending ? <LoaderCircle className="spin" size={17} /> : <ShieldCheck size={17} />}
                    Skontrolovať DNS
                  </button>
                  {custom.status === "active" && !custom.isPrimary && (
                    <button className="button button--secondary" disabled={isPending} onClick={() => makePrimary(custom)} type="button">
                      Nastaviť ako hlavnú
                    </button>
                  )}
                  <button className="button button--secondary" disabled={isPending} onClick={() => removeDomain(custom)} type="button">
                    <Trash2 size={17} />
                    Odstrániť
                  </button>
                </div>
              </>
            ) : (
              <>
                <label className="field">
                  <span>Vaša doména</span>
                  <input
                    autoComplete="off"
                    disabled={isPending}
                    onChange={(event) => setHostname(event.target.value)}
                    placeholder="martin-novak.sk"
                    value={hostname}
                  />
                  {fieldError ? <small className="field-error">{fieldError}</small> : <small>Doménu musíte vlastniť. Registráciu za vás zatiaľ neriešime.</small>}
                </label>
                <div className="info-box">
                  <Info size={18} />
                  <span>
                    <strong>Po pripojení dostanete DNS údaje</strong>
                    <small>
                      Doménu nastavíte u registrátora (Websupport a pod.). Pri root doméne často treba odstrániť predvolený AAAA záznam.
                      Bežné sprevádzkovanie trvá od niekoľkých minút do 24 hodín.
                    </small>
                  </span>
                </div>
                <div className="editor-card__footer domain-form-footer">
                  <span><ShieldCheck size={16} /> HTTPS certifikát zabezpečíme automaticky po overení DNS.</span>
                  <button className="button button--primary" disabled={isPending || !hostname.trim()} onClick={attachDomain} type="button">
                    {isPending ? <LoaderCircle className="spin" size={17} /> : null}
                    Pripojiť doménu
                  </button>
                </div>
              </>
            )}

            {locked && (
              <Link className="text-link" href={`/app/web/${siteId}/objednavky`}>
                Pozrieť balík Plus <ArrowRight size={15} />
              </Link>
            )}
          </div>
        )}

      </section>
    </div>
  );
}
