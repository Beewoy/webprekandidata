# WebPreKandidata.sk

Self-service aplikácia na vytvorenie a publikovanie profesionálneho volebného webu bez potreby programátora. Jeden Next.js projekt obsluhuje verejnú landing page na `/`, kandidátsku aplikáciu na `/app`, interný panel na `/admin` a publikované weby na `/:slug`.

## Rýchly štart

Požiadavky:

- Node.js 24 alebo novší,
- npm 11 alebo novší.

```bash
npm install
npm run dev
```

Lokálna aplikácia je dostupná na:

- `http://localhost:3000/`
- `http://localhost:3000/app/web/demo`
- prihlásenie: `http://localhost:3000/prihlasenie`
- zoznam projektov: `http://localhost:3000/app`

Ak je port 3000 obsadený:

```bash
npm run dev -- -p 3107
```

Repozitár je pripojený ku cloudovému projektu Supabase `Webprekandidata` a lokálny `.env.local` používa reálnu autentifikáciu. Demo režim zostáva podporovaný: bez `.env.local`, prípadne s `DEMO_MODE=true`, funguje aplikácia bez externých účtov.

## Kontrolné príkazy

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

Pred odovzdaním zmeny musia prejsť všetky štyri kontroly.

## Pripojenie Supabase

Cloudový projekt je linkovaný cez Supabase CLI. Pri novom počítači alebo novom Supabase projekte:

1. Skopírujte `.env.example` ako `.env.local` a doplňte URL, publishable key a serverový `SUPABASE_SERVICE_ROLE_KEY`.
2. Nastavte `DEMO_MODE=false`.
3. Prihláste CLI cez `npx supabase login`.
4. Pripojte správny projekt cez `npx supabase link --project-ref <project-ref>`.
5. Najprv skontrolujte migrácie cez `npx supabase db push --linked --dry-run`, potom ich aplikujte cez `npx supabase db push --linked`.
6. Po každej zmene schémy obnovte typy cez `npm run supabase:types`.
7. V Supabase Auth povoľte redirect URL pre `/auth/callback`.

Aktuálna cloudová Auth konfigurácia povoľuje lokálne callbacky na portoch 3000 a 3107 aj budúce produkčné callbacky na `webprekandidata.sk`. Hlavná Site URL je počas lokálneho vývoja `http://localhost:3000`; pred produkčným nasadením sa zmení na finálnu HTTPS adresu.

### Brevo SMTP

Auth e-maily odosiela Brevo cez `smtp-relay.brevo.com:587`. Konfigurácia je v `supabase/config.toml`; SMTP login a SMTP key sa poskytujú cez `BREVO_SMTP_USER` a `BREVO_SMTP_KEY`. SMTP key sa nikdy nezapisuje do repozitára ani do premennej s prefixom `NEXT_PUBLIC_`.

Registrácia vytvorí Supabase reláciu okamžite. Vlastníctvo adresy sa následne overuje aplikačným jednorazovým tokenom s 24-hodinovou platnosťou; v databáze sa uchováva iba jeho SHA-256 odtlačok. Vydávanie tokenov je dostupné iba serverovému `service_role`, zatiaľ čo verejný callback môže token iba spotrebovať. Kandidát môže e-mail odoslať znova najskôr po jednej minúte.

Doména `webprekandidata.sk` je v Brevo autentifikovaná a odosielateľ `Web pre kandidáta <noreply@webprekandidata.sk>` je overený. DNS spravuje Websupport. Nastavené sú Brevo overovacie TXT a dva DKIM CNAME záznamy; pôvodný SPF pre Websupport poštu a existujúci DMARC `p=quarantine` zostali zachované. Pri budúcej zmene DNS sa tieto záznamy nesmú bez náhrady odstrániť.

`SUPABASE_SERVICE_ROLE_KEY` patrí výlučne na server a nesmie byť použitý v klientskom komponente ani premennej s prefixom `NEXT_PUBLIC_`. Používa sa na serverové vydanie overovacieho tokenu; bežný používateľ túto databázovú funkciu volať nemôže.

### Kontaktný formulár kandidáta

Formulár používa rovnaké premenné `BREVO_SMTP_USER` a `BREVO_SMTP_KEY`. Server prijme správu iba vtedy, keď je projekt publikovaný a má aktívny `current_publication_id`; adresu príjemcu aj prepínač viditeľnosti vždy načíta z tohto publikovaného snapshotu. Na bezpečný zápis stavu doručenia do `contact_submissions` potrebuje serverový `SUPABASE_SERVICE_ROLE_KEY`.

V sekcii Kontakt kandidát formulár vypne alebo zapne. Zmena sa na verejnom webe prejaví až po ďalšom publikovaní. Ochranu tvorí serverová validácia, skrytý honeypot a limit troch správ za 15 minút pre rovnaký e-mail a web.

Supabase CLI je pripnuté ako lokálna dev dependency. Používajte `npx supabase ...` alebo npm skripty `supabase:start`, `supabase:status`, `supabase:reset`, `supabase:stop` a `supabase:types`.

### Publikovanie kandidátskeho webu

Po aplikovaní migrácie `0010_candidate_publications.sql` vytvára publikačná akcia nemenný snapshot a verejnú stránku na `http://localhost:3000/<slug>`. Rozpracovaný koncept ostáva oddelený; zmena sa verejne prejaví iba po kliknutí na „Publikovať zmeny“. Použité médiá sa kopírujú zo súkromného bucketu do samostatného verejného bucketu konkrétnej publikácie. Publikovanie aj obnovenie vyžadujú zaplatenú objednávku, ktorá sa zhoduje s balíkom projektu.

### Domény (Basic path + Plus custom)

Migrácia `0014_domain_management.sql` aktivuje správu domén. Basic aj Plus majú platformovú adresu `{NEXT_PUBLIC_ROOT_DOMAIN}/{slug}`. Plus môže pripojiť jednu vlastnú doménu cez Vercel Domains API.

Do `.env.local` doplňte serverové:

```bash
VERCEL_TOKEN=
VERCEL_PROJECT_ID=
VERCEL_TEAM_ID=
```

Na Vercel projekte pridajte apex `webprekandidata.sk` (A/CNAME, bez povinného presunu nameserverov). Wildcard `*.webprekandidata.sk` zatiaľ nie je potrebný. DNS pre poštu (Brevo) ostáva vo Websupporte.

V editore Doména kandidát skopíruje DNS záznamy, spustí kontrolu a po overení dostane HTTPS. Demo režim custom doménu nepripája.

### Interný admin

Po aplikovaní migrácie `0011_platform_admin.sql` je dostupný operačný panel na `/admin` pre účty s `profiles.role = 'admin'`. Prvý admin účet nastavte v SQL editore alebo cez service-role klienta:

```sql
update public.profiles set role = 'admin' where id = '<user-uuid>';
```

Kandidát si rolu sám nenastaví. Admin panel v demo režime nie je dostupný. Pozastavenie webu z adminu nastaví `admin_hold` a kandidát web sám neobnoví, kým hold neuvoľní administrátor. Basic alebo Plus sa udeľuje na konkrétny web v `/admin/weby/[siteId]` (tlačidlo „Udeliť balík“); vytvorí sa zaplatená objednávka bez expirácie.

## Stripe Checkout

Po aplikovaní migrácie `0012_stripe_fulfillment.sql` kandidát na stránke Publikovanie zaplatí Basic alebo Plus cez Stripe-hosted Checkout. Do `.env.local` doplňte:

- `STRIPE_SECRET_KEY`,
- `STRIPE_WEBHOOK_SECRET`,
- `STRIPE_PRICE_BASIC` a `STRIPE_PRICE_PLUS` (konečné jednorazové ceny 49,99 € a 89,99 €),
- voliteľné `SELLER_*` pre fakturačný snapshot predávajúceho.

Lokálny webhook:

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Balík sa aktivuje iba po podpísanom webhooku (`checkout.session.completed` / `async_payment_succeeded`). Návratová URL z Checkoutu nestačí. V demo režime ostáva Checkout vypnutý.

## Produkčné nasadenie na Vercel

Projekt je pripravený pre Vercel s Node.js 24 a Next.js presetom. Produkcia používa:

- `NEXT_PUBLIC_APP_URL=https://webprekandidata.sk`,
- `NEXT_PUBLIC_ROOT_DOMAIN=webprekandidata.sk`,
- `DEMO_MODE=false`,
- premenné Supabase, Brevo, OpenAI, Stripe, predávajúceho a Vercel Domains API z `.env.example`,
- `CRON_SECRET` pre denný retenčný job `/api/cron/retention`,
- voliteľný Sentry projekt cez `NEXT_PUBLIC_SENTRY_DSN`, `SENTRY_ORG`, `SENTRY_PROJECT` a `SENTRY_AUTH_TOKEN`.

Checkout sa zámerne nezapne, kým chýba live Stripe secret/webhook, kompletné `SELLER_*` údaje alebo `LEGAL_DOCUMENTS_APPROVED=true`. Túto poistku neobchádzajte do právnej a fakturačnej kontroly.

Po pripojení apexu a `www` nastavte DNS podľa výstupu `vercel domains inspect`; poštové TXT, DKIM, SPF a DMARC záznamy vo Websupporte musia zostať zachované. `www` sa v `proxy.ts` presmeruje stavom 308 na apex.

Databázová migrácia `0015_production_operations.sql` rezervuje platformové slugy a pridáva service-role retenčnú RPC. Vercel Cron ju spúšťa denne o 03:17 UTC. Neúspešný alebo neautorizovaný job údaje nemaže.

## AI onboarding po registrácii

Po úspešnej registrácii sa otvorí dvojkrokové uvítanie. Kandidát napíše krátke predstavenie, server z neho cez OpenAI Responses API pripraví štruktúrovaný návrh a kandidát pred vytvorením projektu upraví alebo potvrdí každé pole.

Pre reálne generovanie nastavte iba na serveri:

- `OPENAI_API_KEY`,
- voliteľné `OPENAI_MODEL` (predvolene `gpt-5.6-luna`),
- `AI_AUDIT_HMAC_KEY` ako samostatný náhodný secret pre nereverzibilný fingerprint požiadavky.

Požiadavka používa `store: false`; celý prompt ani odmietnutý výsledok sa do aplikačnej databázy neukladajú. Bez OpenAI kľúča zostane onboarding funkčný v transparentne označenom manuálnom režime a text sa iba prenesie do editovateľného konceptu.

## Dokumentácia

- [Technická architektúra](docs/ARCHITECTURE.md)
- [Aktuálny stav implementácie](docs/IMPLEMENTATION_STATUS.md)
- [Kompletný produktový návrh](WEB_PRE_KANDIDATA_IMPLEMENTATION_PLAN.md)
- [Brand a vizuálny systém](BRAND_GUIDE.md)
- [Moderovanie obsahu](CONTENT_MODERATION_POLICY_DRAFT.md)
- [Uchovávanie AI údajov](AI_DATA_RETENTION_POLICY_DRAFT.md)

## Technológie

- Next.js 16 App Router,
- React 19,
- TypeScript,
- Supabase Auth, PostgreSQL a Storage,
- Stripe Checkout,
- Zod,
- Vitest,
- Lucide icons,
- vlastný CSS dizajn systém s fontom Inter.
