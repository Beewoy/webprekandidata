import Link from "next/link";
import type { ReactNode } from "react";

export function FeedbackPage({
  title,
  intro,
  children,
}: {
  title: string;
  intro: string;
  children: ReactNode;
}) {
  return (
    <main className="feedback-shell">
      <nav className="feedback-nav" aria-label="Navigácia">
        <Link href="/">WebPreKandidata.sk</Link>
        <Link href="/prihlasenie">Prihlásiť sa</Link>
      </nav>
      <article className="feedback-document">
        <p className="eyebrow">Spätná väzba</p>
        <h1>{title}</h1>
        <p className="feedback-intro">{intro}</p>
        {children}
      </article>
    </main>
  );
}
