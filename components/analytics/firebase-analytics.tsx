"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { disableFirebaseAnalytics, enableFirebaseAnalytics } from "@/lib/analytics/firebase";

const CONSENT_STORAGE_KEY = "webprekandidata_analytics_consent";
const GA_COOKIE_NAMES = ["_ga", "_ga_0LPPHZCVXB"];

type ConsentState = "loading" | "unset" | "accepted" | "declined";

export function FirebaseAnalytics() {
  const pathname = usePathname();
  const [consent, setConsent] = useState<ConsentState>("loading");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [hasExternalSettingsButton, setHasExternalSettingsButton] = useState(false);

  useEffect(() => {
    const storedConsent = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    const nextConsent = storedConsent === "accepted" || storedConsent === "declined" ? storedConsent : "unset";

    if (storedConsent === "accepted") {
      void enableFirebaseAnalytics();
    }

    function updateExternalButtonState() {
      setHasExternalSettingsButton(Boolean(document.querySelector("[data-cookie-settings]")));
    }

    function handleSettingsClick(event: MouseEvent) {
      const target = event.target instanceof Element ? event.target.closest("[data-cookie-settings]") : null;
      if (!target) return;

      event.preventDefault();
      setIsSettingsOpen(true);
    }

    const updateState = window.setTimeout(() => {
      setConsent(nextConsent);
      updateExternalButtonState();
    }, 0);
    const observer = new MutationObserver(updateExternalButtonState);
    observer.observe(document.body, { childList: true, subtree: true });
    document.addEventListener("click", handleSettingsClick);

    return () => {
      window.clearTimeout(updateState);
      observer.disconnect();
      document.removeEventListener("click", handleSettingsClick);
    };
  }, []);

  function saveConsent(nextConsent: "accepted" | "declined") {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, nextConsent);
    setConsent(nextConsent);
    setIsSettingsOpen(false);

    if (nextConsent === "accepted") {
      void enableFirebaseAnalytics();
      return;
    }

    void disableFirebaseAnalytics();
    removeAnalyticsCookies();
  }

  if (consent === "loading") return null;

  if (consent !== "unset" && !isSettingsOpen) {
    if (hasExternalSettingsButton) return null;

    return (
      <button
        className={`cookie-settings-button${pathname.startsWith("/app") ? " cookie-settings-button--app" : ""}`}
        type="button"
        onClick={() => setIsSettingsOpen(true)}
      >
        Nastavenia cookies
      </button>
    );
  }

  return (
    <aside className="cookie-consent" role="dialog" aria-labelledby="cookie-consent-title">
      <div>
        <strong id="cookie-consent-title">
          {isSettingsOpen ? "Nastavenia cookies" : "Pomôžete nám zlepšovať službu?"}
        </strong>
        <p>
          S vaším súhlasom používame Google Analytics cez Firebase na súhrnné meranie
          návštevnosti. Nevyhnutné cookies fungujú vždy. Viac v{" "}
          <Link href="/ochrana-sukromia">zásadách ochrany súkromia</Link>.
        </p>
        {isSettingsOpen && consent !== "unset" && (
          <p className="cookie-consent__current" role="status">
            Aktuálne nastavenie: analytika je {consent === "accepted" ? "povolená" : "odmietnutá"}.
          </p>
        )}
      </div>
      <div className="cookie-consent__actions">
        <button className="button button--secondary" type="button" onClick={() => saveConsent("declined")}>
          Odmietnuť
        </button>
        <button className="button button--primary" type="button" onClick={() => saveConsent("accepted")}>
          Povoliť analytiku
        </button>
      </div>
    </aside>
  );
}

function removeAnalyticsCookies() {
  for (const name of GA_COOKIE_NAMES) {
    document.cookie = `${name}=; Max-Age=0; path=/; SameSite=Lax`;
    document.cookie = `${name}=; Max-Age=0; path=/; domain=.${window.location.hostname}; SameSite=Lax`;
  }
}
