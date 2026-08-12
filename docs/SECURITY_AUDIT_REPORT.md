# Security Audit Report — WebPreKandidata.sk

**Dátum auditu:** 12. august 2026  
**Typ:** Pre-production security, architecture & GDPR risk review (read-only)  
**Metodika:** Analýza zdrojového kódu, migrácií `0001`–`0022`, server actions, API routes, konfigurácie. Hodnotenie podľa reálneho rizika MVP (únik dát, prevzatie účtu, finančná škoda, GDPR).  
**Súvisiace:** [DATA_FLOW_MAP.md](./DATA_FLOW_MAP.md), [PRODUCTION_READINESS.md](./PRODUCTION_READINESS.md)

**Legenda stavu overenia**
- **Potvrdené z kódu** — overiteľné v repozitári
- **Vyžaduje manuálne overenie** — Dashboard, DNS, zmluvy, produkčné env, git história

---

## Zhrnutie

Aplikácia má silný základ: RLS na všetkých tabuľkách (vrátane `draft_revision_cooldowns` bez klientského prístupu), ownership cez `owns_site()`, Stripe fulfillment s podpisom a idempotenciou, oddelenie draft/publish, sanitizácia rich textu, fail-closed checkout a retenčný cron pre kontaktné/AI záznamy.

Najväčšie produkčné riziká pred spustením:

1. **CRITICAL** — predvolený demo režim môže vypnúť autentifikáciu `/app`
2. **HIGH** — overenie e-mailu neblokuje platbu ani publikovanie
3. **HIGH** — RPC domény umožňuje ownerovi nastaviť `active` bez provider dôkazu
4. **HIGH** — chýba app-level rate limiting na auth a neúčinný in-memory limit na support

| Priorita | Počet |
|----------|-------|
| CRITICAL | 1 |
| HIGH | 4 |
| MEDIUM | 8 |
| LOW | 7 |

---

# Časť A — Nálezy

## CRITICAL

### C1 — Demo režim ako predvolený stav môže vypnúť produkčnú autentifikáciu

**Status: FIXED**  
**Date:** 12. august 2026  

**Oprava:** `isDemoMode()` v `NODE_ENV=production` vždy vracia `false` (žiadny demo fallback). `assertProductionConfig()` v `/app` a `/admin` layoutoch hard-failuje pri `DEMO_MODE !== false` alebo nekompletnom Supabase. Soft report pre Stripe/CRON bez logovania hodnôt secretov (`lib/production-config.ts`).

**Popis:**  
`isDemoMode()` vracia `true`, ak `DEMO_MODE !== "false"` **alebo** chýba Supabase konfigurácia. `.env.example` nastavuje `DEMO_MODE=true`. V demo režime layout `/app` nevolá `requireCurrentUser()`, takže editor je prístupný bez prihlásenia.

**Riziko:**  
Pri chybnom Vercel env (chýbajúce `DEMO_MODE=false` alebo chýbajúce Supabase kľúče) produkcia beží ako demo: autentifikácia `/app` je vypnutá, mutácie na `siteId === "demo"` no-opujú, ale UI pôsobí „živo“. Maskuje aj výpadok DB ako „demo“.

**Dotknutá časť:**  
`lib/env.ts`, `app/app/layout.tsx`, `.env.example`, demo vetvy v `app/actions/sites.ts`, `posts.ts`, `support.ts`

**Odporúčanie:**  
1. Vo Vercel Production explicitne `DEMO_MODE=false` + kompletné Supabase env.  
2. Pridať runtime guard: ak `NODE_ENV=production && isDemoMode()`, logovať kritickú chybu / zablokovať citlivé routy.  
3. Deploy checklist pred každým launchom.

**Priorita:** CRITICAL  
**Stav overenia:** Potvrdené z kódu; produkčné Vercel env **vyžaduje manuálne overenie**

---

## HIGH

### H1 — Overenie e-mailu neblokuje checkout ani publikovanie

**Status: FIXED**  
**Date:** 12. august 2026  

**Oprava:** Serverový guard `requireVerifiedUser()` číta `profiles.email_verified_at` a je vynútený v `createCheckoutSessionAction`, `publishSiteAction` a pri obnovení viditeľnosti (`visible=true`).

**Popis:**  
Registrácia vytvorí okamžitú session (`enable_confirmations=false`). Aplikačné overenie e-mailu nastaví `profiles.email_verified_at`, ale checkout, publish a onboarding túto hodnotu nekontrolujú. Existuje len UI banner.

**Riziko:**  
Útočník zaregistruje cudzí e-mail, získa plný prístup k editoru, môže zaplatiť a publikovať pred overením vlastníctva schránky. Obmedzuje aj ochranu pred spam účtami.

**Dotknutá časť:**  
`app/actions/auth.ts`, `app/actions/checkout.ts`, `app/actions/publishing.ts`, `supabase/migrations/0004_*.sql`, `components/projects/projects-overview.tsx`

**Odporúčanie:**  
Pred `createCheckoutSessionAction` a `publishSiteAction` (príp. aj AI) vyžadovať `email_verified_at IS NOT NULL`. Banner nechať ako UX, nie ako jedinú ochranu.

**Priorita:** HIGH  
**Stav overenia:** Potvrdené z kódu

---

### H2 — `sync_domain_provider_state` umožňuje ownerovi nastaviť stav `active`

**Status: FIXED**  
**Date:** 12. august 2026  

**Oprava:** Migrácia `0023` REVOKE EXECUTE pre `authenticated`/`anon`; GRANT iba `service_role`. App sync ide cez `syncDomainProviderStateWithAdmin()` po Vercel API snapshote.

**Popis:**  
RPC `sync_domain_provider_state` je grantnutá `authenticated` a kontroluje `owns_site`, ale neviaže prechod na `active` na dôkaz z Vercel API. Aplikácia volá Vercel pred sync, databáza to však nevynucuje. Priamy RPC call (PostgREST s user JWT) môže nastaviť custom doménu ako aktívnu bez DNS overenia.

**Riziko:**  
Obchádzanie DNS/SSL overenia; `proxy.ts` môže začať routovať hostname podľa DB stavu. Vplyv na dostupnosť / phishing cez nesprávne namapovanú doménu je stredný; Plus entitlement sa stále kontroluje pri attach.

**Dotknutá časť:**  
`supabase/migrations/0014_domain_management.sql`, `app/actions/domains.ts`, `proxy.ts`

**Odporúčanie:**  
Obmedziť RPC na `service_role`, alebo povoliť `active` len z serverovej cesty po úspešnom Vercel verify; client-callable RPC nech akceptuje len `verifying` / `failed`.

**Priorita:** HIGH  
**Stav overenia:** Potvrdené z kódu (DB grant); exploitačná cesta cez PostgREST **vyžaduje manuálne overenie** dostupnosti RPC z anon/authenticated API

---

### H3 — Chýba aplikčná rate limiting na login / registráciu / reset hesla

**Status: FIXED**  
**Date:** 12. august 2026  

**Oprava:** DB-backed `consume_rate_limit` (migrácia `0023`) pre login/register (10/15 min) a reset (5/15 min) podľa SHA-256 e-mailu. Resend verification ostáva na existujúcom RPC rate limite. Supabase Auth limity zostávajú spodnou vrstvou.

**Popis:**  
`loginAction`, `registerAction` a `resetPasswordAction` nemajú app-level rate limit. Spoľahnutie je na Supabase (dokumentovaný limit Auth e-mailov 10/hod v produkcii) a infraštruktúru Vercel.

**Riziko:**  
Credential stuffing, e-mail bombing cez reset, enumerácia účtov. Pre MVP s malým počtom kandidátov je praktické riziko stredné–vysoké podľa viditeľnosti služby.

**Dotknutá časť:**  
`app/actions/auth.ts`, Supabase Auth konfigurácia

**Odporúčanie:**  
Zapnúť/overiť Supabase rate limits a CAPTCHA ak dostupné; alebo edge/DB counter (podobne ako kontaktný formulár). Minimálne monitoring failed loginov v Sentry/logs.

**Priorita:** HIGH  
**Stav overenia:** Potvrdené z kódu (chýba limit); produkčné Supabase Auth limity **vyžadujú manuálne overenie**

---

### H4 — Support formulár: rate limit v process pamäti (serverless)

**Status: FIXED**  
**Date:** 12. august 2026  

**Oprava:** In-memory `Map` nahradený `consume_rate_limit('support:'+userId, 3, 900)` cez service_role — konzistentné naprieč Vercel inštanciami.

**Popis:**  
`submitSupportForm` používa `Map` v pamäti procesu (3 / 15 min / user). Na Vercel serverless sa limity neshare-ujú medzi inštanciami a resetujú sa pri cold starte.

**Riziko:**  
Spam na interné inboxy cez Brevo; zneužitie SMTP kvóty; možný doxing cez opakované správy s userId v tele.

**Dotknutá časť:**  
`app/actions/support.ts`, `lib/email/brevo.ts`

**Odporúčanie:**  
Presunúť limit do DB (ako `contact_submissions`) alebo `audit_logs` counter, rovnaký pattern ako AI onboarding.

**Priorita:** HIGH  
**Stav overenia:** Potvrdené z kódu

---

## MEDIUM

### M1 — `AI_AUDIT_HMAC_KEY` padá na SERVICE_ROLE / OPENAI kľúč

**Popis:**  
Ak chýba `AI_AUDIT_HMAC_KEY`, podpis AI receiptov používa `SUPABASE_SERVICE_ROLE_KEY` alebo `OPENAI_API_KEY`.

**Riziko:**  
Zväčšuje blast radius: únik receiptov / HMAC kontextu zvyšuje hodnotu kompromitovaného materiálu. Samotná forgery stále vyžaduje znalosť kľúča.

**Dotknutá časť:**  
`lib/ai/receipt.ts`

**Odporúčanie:**  
Vyžadovať dedikovaný `AI_AUDIT_HMAC_KEY` bez fallbacku; fail-closed pri absencii.

**Priorita:** MEDIUM  
**Stav overenia:** Potvrdené z kódu

---

### M2 — CSP povoľuje `script-src 'unsafe-inline'`

**Popis:**  
`next.config.ts` nastavuje CSP s `'unsafe-inline'` pre scripty (a v dev aj `'unsafe-eval'`). Ostatné hlavičky (frame-ancestors, nosniff, HSTS v prod) sú v poriadku.

**Riziko:**  
Oslabuje XSS mitigation. Aplikácia sanitizuje rich text serverovo, ale CSP nie je defense-in-depth na úrovni nonce/hash.

**Dotknutá časť:**  
`next.config.ts`, TipTap / marketing analytics skripty

**Odporúčanie:**  
Po spustení prejsť na nonces; do launchu ponechať, ak GA/Firebase vyžadujú inline — dokumentovať ako známy kompromis.

**Priorita:** MEDIUM  
**Stav overenia:** Potvrdené z kódu

---

### M3 — `/auth/callback` relatívny open redirect

**Popis:**  
Parameter `next` musí začínať `/` a nesmie `//`, ale nie je allowlist (`/app`, `/obnova-hesla`). Same-origin path redirect zostáva možný.

**Riziko:**  
Nízke–stredné phishing cez `https://webprekandidata.sk/auth/callback?next=/nejaka-cesta` po výmene kódu. Nie je klasický open redirect na cudzí host.

**Dotknutá časť:**  
`app/auth/callback/route.ts`

**Odporúčanie:**  
Allowlist: `/app`, `/obnova-hesla` (+ prefix `/app/`).

**Priorita:** MEDIUM  
**Stav overenia:** Potvrdené z kódu

---

### M4 — `posts.cover_asset_id` bez same-site integrity

**Popis:**  
FK na `media_assets` existuje, ale nie je vynútené `media_assets.site_id = posts.site_id`.

**Riziko:**  
Vlastník s znalosťou UUID by teoreticky mohol odkázať na asset iného svojho/cudzieho webu podľa RLS write path. Praktický dopad pre MVP je obmedzený (owner musí vlastniť post aj mať prístup k asset ID); skôr integrity bug.

**Dotknutá časť:**  
`supabase/migrations/0009_candidate_posts.sql` (a 0001), `app/actions/posts.ts`

**Odporúčanie:**  
TRIGGER/CHECK alebo validácia v `savePostAction` / cover register, že asset.site_id = post.site_id.

**Priorita:** MEDIUM  
**Stav overenia:** Potvrdené z kódu

---

### M5 — Orphan objekty v `candidate-media`

**Popis:**  
Klient uploaduje do Storage pred `registerMediaAssetAction`. Ak registrácia zlyhá, objekt môže ostať bez DB riadku. Soft-deleted objekty sa nemusia okamžite mazať zo Storage.

**Riziko:**  
Úložiskové náklady; potenciálne obnoviteľné staré súbory. Nie priamy cross-tenant leak (path viazaný na site_id + RLS).

**Dotknutá časť:**  
`components/editor/*-editor.tsx`, `app/actions/sites.ts`, Storage policies

**Odporúčanie:**  
Periodický cleanup: objekty bez aktívneho `media_assets` riadku staršie ako N dní.

**Priorita:** MEDIUM  
**Stav overenia:** Potvrdené z kódu (pattern); existencia orphanov v produkcii **vyžaduje manuálne overenie**

---

### M6 — `email_verification_tokens` bez automatického purge

**Popis:**  
Tokeny expirujú za 24h a po použití majú `used_at`, ale `purge_expired_operational_data` ich nemaže.

**Riziko:**  
Akumulácia hashov (nízka citlivosť — nie plaintext). GDPR minimalizácia / hygiena.

**Dotknutá časť:**  
`supabase/migrations/0004_*.sql`, `0005_*.sql`, `0015_production_operations.sql`

**Odporúčanie:**  
Rozšíriť purge RPC o `expires_at < now()` alebo `used_at IS NOT NULL` staršie než X dní.

**Priorita:** MEDIUM  
**Stav overenia:** Potvrdené z kódu

---

### M7 — `audit_logs` bez retenčnej politiky

**Popis:**  
Audit rastie neobmedzene; metadata môže obsahovať admin dôvody a správy pre kandidáta.

**Riziko:**  
GDPR (uchovávanie dlhšie než potrebné); veľkosť tabuľky. Bezpečnostne sú logy užitočné — treba politiku, nie okamžité mazanie všetkého.

**Dotknutá časť:**  
`audit_logs`, admin stránka `/admin/audit`

**Odporúčanie:**  
Definovať retenciu (napr. 12–24 mesiacov) a archiváciu; zosúladiť s ochranou súkromia.

**Priorita:** MEDIUM  
**Stav overenia:** Potvrdené z kódu

---

### M8 — Firebase web API key v klientskom bundle

**Popis:**  
Firebase konfigurácia (apiKey, projectId, measurementId) je hardcoded v `lib/analytics/firebase.ts`. Bežné pre Firebase Web; SDK sa načítava až po súhlase.

**Riziko:**  
Kľúč nie je secret; bez Domain/API restrictions môže byť zneužitý na kvótu Analytics API.

**Dotknutá časť:**  
`lib/analytics/firebase.ts`, `components/analytics/firebase-analytics.tsx`

**Odporúčanie:**  
V Google Cloud / Firebase Console obmedziť HTTP referrers na `webprekandidata.sk` a localhost.

**Priorita:** MEDIUM  
**Stav overenia:** Potvrdené z kódu; konzolové restrictions **vyžadujú manuálne overenie**

---

## LOW

### L1 — Registrácia odhaľuje možný duplicitný e-mail

**Popis:**  
Chybová správa typu „E-mail už môže byť zaregistrovaný“ umožňuje enumeráciu.

**Riziko:**  
Privacy / phishing targeting. Bežné kompromisné správanie MVP.

**Dotknutá časť:**  
`app/actions/auth.ts`

**Odporúčanie:**  
Generická správa + interný log; alebo rovnaká UX cesta ako pri úspechu s „skontrolujte e-mail“.

**Priorita:** LOW  
**Stav overenia:** Potvrdené z kódu

---

### L2 — `/api/health` bez autentifikácie

**Popis:**  
Vracia `{ status: "ok", service: "webprekandidata" }`.

**Riziko:**  
Minimálny info disclosure; užitočné pre uptime.

**Dotknutá časť:**  
`app/api/health/route.ts`

**Odporúčanie:**  
Ponechať; nepridávať interné verzie DB / env.

**Priorita:** LOW  
**Stav overenia:** Potvrdené z kódu

---

### L3 — `published-media` je verejne čitateľný

**Popis:**  
Zámer: publikované WebP pod predvídateľnou cestou.

**Riziko:**  
Enumeration UUID ciest; obsah je aj tak na verejnom webe.

**Dotknutá časť:**  
Migrácia `0010_candidate_publications.sql`, publish flow

**Odporúčanie:**  
Dokumentovať ako zámerné; nepoužívať pre súkromné draft médiá.

**Priorita:** LOW  
**Stav overenia:** Potvrdené z kódu

---

### L4 — `verify_email_token` volateľný z `anon` bez rate limitu na verify

**Popis:**  
RPC je grantnutá anon; formát tokenu je vysoká entropia (43 znakov → SHA-256).

**Riziko:**  
Brute force prakticky neuskutočniteľný. Online guessing môže zaťažiť DB.

**Dotknutá časť:**  
`0004_deferred_email_verification.sql`, `app/auth/overit-email/route.ts`

**Odporúčanie:**  
Voliteľne WAF / edge rate limit na `/auth/overit-email`.

**Priorita:** LOW  
**Stav overenia:** Potvrdené z kódu

---

### L5 — Seller name fallback v kóde

**Popis:**  
`getSellerSnapshot()` má default meno ak chýba env; checkout gate však vyžaduje kompletné `SELLER_*`.

**Riziko:**  
Nízke v produkcii vďaka fail-closed.

**Dotknutá časť:**  
`lib/payments/stripe.ts`

**Odporúčanie:**  
Odstrániť hardcoded fallback alebo fail hard vždy.

**Priorita:** LOW  
**Stav overenia:** Potvrdené z kódu

---

### L6 — Cron endpoint závisí od `CRON_SECRET`

**Popis:**  
Bearer secret s `timingSafeEqual`. Bez secretu vždy 401 — purge nebeží. Žiadny IP allowlist.

**Riziko:**  
Ak secret unikne, útočník môže spúšťať purge (mazanie expirovaných kontaktov/AI, nie celú DB). Ak secret chýba, retencia nefunguje (GDPR).

**Dotknutá časť:**  
`app/api/cron/retention/route.ts`, `vercel.json`

**Odporúčanie:**  
Overiť env + úspešný denný run v logoch; silný náhodný secret.

**Priorita:** LOW (operatívne MEDIUM ak secret nie je nastavený)  
**Stav overenia:** Potvrdené z kódu; produkčný beh **vyžaduje manuálne overenie**

---

### L7 — `ai_generations.target_id` bez FK na `posts`

**Popis:**  
Orphan referencie možné.

**Riziko:**  
Integrita dát, nie priamy security bypass.

**Dotknutá časť:**  
Migrácia `0009_candidate_posts.sql`

**Odporúčanie:**  
FK `ON DELETE SET NULL` v ďalšej migrácii.

**Priorita:** LOW  
**Stav overenia:** Potvrdené z kódu

---

# Časť B — Tematické hodnotenie

## 1. Authentication a autorizácia

### Pozitíva
- Server actions + Zod; generic login/reset správy (reset)
- Session cez `@supabase/ssr`; refresh v `proxy.ts`
- Token e-mailu: 32-byte random, SHA-256 at rest, 24h, issuance len `service_role`, rate limit 1/min
- `profiles.role` nie je klientom nastaviteľné (column grant + RLS CHECK)
- `/admin` + RPC `is_platform_admin()`; kandidát neobíde admin hold pri restore
- Ownership: `requireCurrentUser` / `getUser` + RLS / `owns_site` RPC
- Custom domain hosty redirectujú `/app`, `/admin`, `/api` na platformovú URL

### Medzery
- C1 demo mode, H1 unverified email, H3 auth rate limits, M3 callback redirect
- Proxy **nechráni** routy auth-om (by design — layouty a actions)

### Session / cookies
- Auth cookies spravuje Supabase SSR (`createServerClient` cookie adapter)
- Aplikácia nenastavuje vlastné session cookie flags ručne
- **HttpOnly / Secure / SameSite v produkcii vyžadujú manuálne overenie** (HTTP response z `webprekandidata.sk`)

### Admin bypass
- Žiadny hard-coded admin bypass v kóde
- `admin_grant_site_plan` môže udeliť balík bez Stripe — zámerné, auditované
- Prvý admin: manuálne SQL mimo UI

---

## 2. Inventory API, Server Actions, Webhooky

### API routes

| Endpoint | Metóda | Auth | Autorizácia | Riziká |
|----------|--------|------|-------------|--------|
| `/api/health` | GET | žiadna | public | L2 |
| `/api/cron/retention` | GET | Bearer `CRON_SECRET` | secret | L6 |
| `/api/webhooks/stripe` | POST | Stripe signature | valid event | pozri Stripe sekciu |

### Auth route handlers

| Endpoint | Auth | Poznámka |
|----------|------|----------|
| `GET /auth/callback` | OAuth/PKCE code | M3 redirect |
| `GET /auth/overit-email` | one-time token | L4 |

### Server actions (33)

| Súbor | Akcie | Auth | Autorizácia | Validácia | Rate limit |
|-------|-------|------|-------------|-----------|------------|
| `auth.ts` | login, register, resend, reset, updatePassword, logout | podľa akcie | Supabase | Zod | žiadny app (H3) |
| `admin.ts` | setHold, grantPlan | `requirePlatformAdmin` | RPC admin | Zod | nie |
| `sites.ts` | create, saveSection, saveTheme, media×5 | `requireCurrentUser` | RLS/RPC | Zod + WEBP | nie |
| `domains.ts` | attach, check, remove, setPrimary | `getUser` | Plus RPC + Vercel | Zod | nie |
| `checkout.ts` | createCheckoutSession | `getUser` | ownership + Free | Zod | nie |
| `publishing.ts` | publish, setVisibility | cez `getSite` | entitlement RPC | Zod | nie |
| `posts.ts` | CRUD + AI + cover | `requireCurrentUser` | RLS/RPC Plus | Zod + sanitize | AI kvóta 20 |
| `onboarding.ts` | generateWelcome, createWelcome | `requireCurrentUser` | own | Zod + HMAC | 3/min/user |
| `contact.ts` | submitContactForm | public | published snapshot | Zod + honeypot | 3/15min email+site |
| `support.ts` | submitSupportForm | logged-in (okrem demo) | user | Zod + honeypot | in-memory (H4) |

### Injection / XSS / CSRF / SSRF / mass assignment

| Hrozba | Stav |
|--------|------|
| SQL injection | Nízke — Supabase client / RPC parametre; žiadne raw SQL z user inputu v app |
| XSS | Rich text cez `sanitize-html` whitelist; verejný render sanitizovaného HTML |
| CSRF | Next.js Server Actions (origin checks); Stripe webhook = signature |
| SSRF | Vercel Domains API s pevnými endpointmi; kontaktný formulár neberie cieľovú URL od klienta |
| Mass assignment | Zod schémy; ceny/plány zo servera; `plan_code` nie z klienta pri entitlement |
| Error handling | Generické správy používateľovi; Sentry bez default PII |

---

## 3. Stripe / platby

### Pozitíva
- Signature verification `constructEvent`
- Idempotencia `payment_events.provider_event_id`
- `fulfill_stripe_checkout`: amount, currency EUR, order pending, owner match
- `invoice.paid` len doklad (`record_stripe_invoice`), nie aktivácia plánu
- Return URL neaktivuje balík
- Fail-closed `isStripeConfigured()`
- Ceny viazané na env Price ID + DB `total_cents IN (4999, 8999)`
- Checkout vytvorí pending order **pred** session; ownership check

### Riziká
- Orphan pending orders / Stripe Customer pri partial failure (operatívne LOW)
- Live keys / webhook endpoint v Stripe Dashboard — **vyžaduje manuálne overenie**
- Admin grant môže aktivovať bez platby (zámerné, auditované) — nie je to bug, ale abuse path pri kompromitovanom admin účte

### Stavový automat objednávky
```text
pending → paid (fulfill) | failed | cancelled
paid → (refunded v enum, admin Stripe flow mimo app UI)
```
Opakovaný webhook s rovnakým event ID = idempotent OK.

---

## 4. Admin a interné prístupy

| Položka | Hodnotenie |
|---------|------------|
| Oddelený `/admin` strom | OK |
| Layout + action + RPC triple check | OK |
| Demo vypína admin | OK |
| Seed heslá | Žiadne v kóde |
| AI admin stránka bez promptov | OK |
| Manuálny SQL pre role | Dokumentované; riziko = prístup k DB |

**Riziko kompromitovaného admina:** hold všetkých webov, grant Plus zdarma, čítanie e-mailov cez `admin_search_users`. Primerané pre MVP s 1–2 operátormi; vyžaduje silný admin účet a 2FA v Supabase — **vyžaduje manuálne overenie**.

---

## 5. Secrets a konfigurácia

### Pozitíva
- Žiadne Stripe/service_role tajomstvá v `NEXT_PUBLIC_*`
- `server-only` na admin/stripe/brevo/ai
- `.env.local` má byť v `.gitignore`
- Separácia local Docker vs cloud documented

### Medzery
- C1 DEMO_MODE default
- M1 HMAC fallback
- Git história na committed secrets — **vyžaduje manuálne overenie** (`git log --all --full-history -- .env .env.local`)
- Produkčné Vercel env hodnoty — **vyžaduje manuálne overenie**

---

## 6. Security headers a web ochrana

| Header | Stav |
|--------|------|
| CSP | Áno; `unsafe-inline` scripts (M2) |
| HSTS | Áno v production |
| X-Frame-Options DENY / frame-ancestors none | Áno |
| X-Content-Type-Options nosniff | Áno |
| Referrer-Policy strict-origin-when-cross-origin | Áno |
| Permissions-Policy | camera/mic/geo off |
| poweredByHeader | false |
| CORS | Žiadny široký CORS API; same-origin app |
| HTTPS | Vercel TLS — **vyžaduje manuálne overenie** DNS/TLS na apex |
| Cookie flags | Supabase defaults — **vyžaduje manuálne overenie** |

---

## 7. Logy a monitoring

### Stav
- Sentry zapojené; bez DSN neaktívne
- `sendDefaultPii: false`, traces 10 % v prod
- Žiadne bežné `console.log` s PII v app TS
- Support e-mail obsahuje `userId` (zámerné)
- global-error posiela pathname do Sentry

### Návrh
1. Nastaviť DSN + alerty na 5xx a Stripe webhook failures  
2. Externý uptime na `/api/health`  
3. Overovať denný retention cron  
4. Audit log už existuje — doplniť retenciu (M7)

---

## 8. Backup a recovery

| Položka | Stav |
|---------|------|
| Kód zálohy | nie |
| Supabase backups | **vyžaduje manuálne overenie** plánu a PITR |
| Storage | **vyžaduje manuálne overenie** scope |
| Test obnovy | nie je v CI |

Runbook: [PRODUCTION_READINESS.md](./PRODUCTION_READINESS.md).

---

## 9. GDPR — zhrnutie rizík

| Oblasť | Riziko | Poznámka |
|--------|--------|----------|
| Prenos mimo EÚ | vysoké | OpenAI, potenciálne Supabase región, Vercel, Stripe, Google, Sentry — DPA/SCC **vyžadujú manuálne overenie** |
| Minimalizácia AI | dobré | store=false, bez promptu v DB |
| Kontakt 90 dní | dobré | cron purge |
| Telefón návštevníka | dobré | neukladá sa |
| Analytics | dobré | consent-gated |
| Právne dokumenty | blokované | `LEGAL_DOCUMENTS_APPROVED` |
| Retencia audit/tokenov | medzera | M6, M7 |
| Práva subjektov | procesné | žiadosť e-mailom — **proces vyžaduje manuálne overenie** |

---

## 10. Body vyžadujúce manuálne overenie

1. Vercel Production: `DEMO_MODE=false`, Stripe live keys, `CRON_SECRET`, Sentry DSN, `AI_AUDIT_HMAC_KEY`, `VERCEL_TOKEN`
2. Supabase cloud región (EÚ?) a backup / PITR frekvencia
3. Git história — či niekedy neboli commitnuté secrets
4. Cookie flags v produkčnom Set-Cookie
5. DPA/SCC so všetkými procesormi
6. Stripe live webhook endpoint + test payment
7. SPF/DKIM/DMARC a DNS apex/www (Websupport)
8. Firebase API key HTTP referrer restrictions
9. Supabase Auth 2FA pre admin účet; Auth rate limits
10. Dostupnosť RPC `sync_domain_provider_state` cez PostgREST pre authenticated role

---

## Production readiness checklist (súhrn)

Detailný checklist je v [PRODUCTION_READINESS.md](./PRODUCTION_READINESS.md).

### PRED SPUSTENÍM MUSÍ BYŤ HOTOVÉ
- Demo off + secrets + live Stripe + právne schválenie + DNS + cron + Sentry + admin účet + E2E + DPA + backup politika

### MALO BY BYŤ HOTOVÉ
- Email verify gate, domain RPC harden, support rate limit DB, auth rate limit, token purge, callback allowlist, HMAC key, orphan cleanup, transakčné e-maily, uptime

### MÔŽE POČKAŤ
- CSP nonces, FK/CHECK integrity, audit retencia, produktová analytika, campaign extension, admin webhook tools
