"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="sk">
      <body>
        <main className="error-page">
          <div>
            <p className="eyebrow">Technická chyba</p>
            <h1>Stránku sa nepodarilo načítať.</h1>
            <p>Skúste požiadavku zopakovať. Ak problém pretrváva, napíšte nám na ahoj@beewoy.sk.</p>
            <button className="button button--primary" type="button" onClick={reset}>
              Skúsiť znova
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
