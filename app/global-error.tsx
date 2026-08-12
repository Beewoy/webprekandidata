"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  useEffect(() => {
    Sentry.withScope((scope) => {
      scope.setTag("nextjs.error_digest", error.digest ?? "missing");
      scope.setExtra("pathname", window.location.pathname);
      Sentry.captureException(error);
    });
  }, [error]);

  return (
    <html lang="sk">
      <body>
        <main className="error-page">
          <div>
            <p className="eyebrow">Technická chyba</p>
            <h1>Stránku sa nepodarilo načítať.</h1>
            <p>Skúste požiadavku zopakovať. Ak problém pretrváva, napíšte nám na ahoj@beewoy.sk.</p>
            {error.digest && <p><small>Referenčný kód: <code>{error.digest}</code></small></p>}
            <button className="button button--primary" type="button" onClick={() => window.location.reload()}>
              Skúsiť znova
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
