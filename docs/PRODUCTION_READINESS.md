# Production Readiness — WebPreKandidata.sk

**Dátum:** 12. august 2026  
**Účel:** Checklist pred verejným spustením na základe [SECURITY_AUDIT_REPORT.md](./SECURITY_AUDIT_REPORT.md) a [DATA_FLOW_MAP.md](./DATA_FLOW_MAP.md).  
**Princíp:** Reálne MVP riziko (únik dát, prevzatie účtu, finančná škoda, GDPR) — bez zbytočných enterprise požiadaviek.

Položky označené **(manuálne)** nie sú overiteľné len z kódu.

---

## PRED SPUSTENÍM MUSÍ BYŤ HOTOVÉ

Tieto body blokujú bezpečný alebo legálny launch.

### Konfigurácia a režim aplikácie

- [x] Vo Vercel Production je `DEMO_MODE=false` **(manuálne)** — nález C1 — **kód fail-closed** (`assertProductionConfig`); hodnota vo Vercel env stále **(manuálne)**
- [x] Sú nastavené `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (cloud, nie localhost) **(manuálne)** — hard gate v kóde; hodnoty **(manuálne)**
- [ ] `NEXT_PUBLIC_APP_URL` a `NEXT_PUBLIC_ROOT_DOMAIN` ukazujú na produkčný apex
- [ ] Po deployi `/app` vyžaduje prihlásenie (nie demo shell) **(manuálne E2E)**

### Platby a právne

- [ ] Live `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_BASIC`, `STRIPE_PRICE_PLUS` **(manuálne)**
- [ ] Stripe webhook endpoint `https://webprekandidata.sk/api/webhooks/stripe` (alebo produkčná app URL) je registrovaný a doručuje eventy **(manuálne)**
- [ ] Kompletné `SELLER_NAME`, `SELLER_ADDRESS`, `SELLER_ICO`, `SELLER_DIC`, `SELLER_EMAIL`
- [ ] Právnik potvrdil obchodné podmienky, ochranu súkromia a reklamačný poriadok **(manuálne)**
- [ ] Až potom `LEGAL_DOCUMENTS_APPROVED=true` (checkout fail-closed + indexácia právnych stránok)
- [ ] Testovacia live platba Basic aj Plus: pending → webhook → `paid` → `plan_code` **(manuálne E2E)**
- [ ] Overené, že return URL **neaktivuje** balík bez webhooku **(manuálne)**

### DNS, e-mail, domény

- [ ] Apex `webprekandidata.sk` a `www` smerujú na Vercel bez zničenia Brevo TXT/DKIM a Websupport pošty **(manuálne)**
- [ ] HTTPS/TLS na apex a www funguje **(manuálne)**
- [ ] Auth Site URL v Supabase = `https://webprekandidata.sk`, povolené callbacky **(manuálne)**
- [ ] Overovací a reset e-mail prichádzajú z `noreply@webprekandidata.sk` **(manuálne)**
- [ ] Pre Plus custom domény: `VERCEL_TOKEN`, `VERCEL_PROJECT_ID` (voliteľne `VERCEL_TEAM_ID`) **(manuálne)**

### Prevádzka a monitoring

- [ ] `CRON_SECRET` nastavený vo Vercel; denný job `/api/cron/retention` prebehne úspešne **(manuálne)**
- [ ] `NEXT_PUBLIC_SENTRY_DSN` (+ org/project/token pre CI podľa potreby); chyby sa objavia v Sentry **(manuálne)**
- [ ] `/api/health` odpovedá 200 **(manuálne)**

### Prístupy a GDPR

- [ ] Prvý admin účet: `update profiles set role = 'admin' where id = '…'` **(manuálne)**
- [ ] Admin účet má silné heslo; 2FA v Supabase Auth ak dostupné **(manuálne)**
- [ ] DPA / SCC (alebo ekvivalent) so spracovateľmi: Supabase, Vercel, Stripe, Brevo, OpenAI, Google, Sentry **(manuálne)**
- [ ] Supabase projekt región overený (preferencia EÚ/EHP) **(manuálne)**
- [ ] Backup / PITR politika v Supabase Dashboard overená a zapísaná **(manuálne)**

### End-to-end smoke (produkcia alebo staging klon)

- [ ] Registrácia → overovací e-mail → `/app`
- [ ] Vytvorenie projektu → autosave sekcie → náhľad
- [ ] Checkout Basic → webhook → publikovanie → verejná `/:slug`
- [ ] Checkout Plus (alebo admin grant na test) → custom domain attach flow (ak token je ready)
- [ ] Kontaktný formulár na publikovanom webe → e-mail kandidátovi
- [ ] Admin hold → kandidát neobnoví; release → obnoví
- [ ] Odhlásenie a obnova hesla

---

## MALO BY BYŤ HOTOVÉ

Silne odporúčané pred alebo tesne po soft-launchi; znižujú HIGH/MEDIUM riziká.

### Bezpečnosť (z auditu)

- [x] Vynútiť `email_verified_at` pred checkout a publish (H1) — **FIXED v kóde**
- [x] Harden `sync_domain_provider_state`: len `service_role` alebo zakázať client-side `active` (H2) — **FIXED migrácia 0023**
- [x] DB-backed rate limit pre support formulár (H4) — **FIXED**
- [x] Rate limiting / CAPTCHA na login, registráciu, reset hesla (H3) — **FIXED** DB buckets; CAPTCHA stále voliteľné
- [ ] Allowlist redirectov v `/auth/callback` (M3)
- [ ] Dedikovaný `AI_AUDIT_HMAC_KEY` bez fallbacku na service role (M1)
- [ ] Purge expirovaných / použitých `email_verification_tokens` v cron RPC (M6)
- [ ] Job na orphan objekty v `candidate-media` (M5)
- [ ] Firebase / GA API key HTTP referrer restrictions (M8) **(manuálne)**

### Produkt a prevádzka

- [x] Transakčné e-maily po úspešnej platbe (Brevo potvrdenie po fulfill + `confirmation_email_sent_at`)
- [ ] Externý uptime monitoring na `/api/health` s alertom **(manuálne)**
- [ ] Sentry alerty na Stripe webhook 5xx a retention job failures **(manuálne)**
- [ ] Overiť cookie flags (HttpOnly, Secure, SameSite) na produkčnej session **(manuálne)**
- [ ] Skontrolovať git históriu, či neboli commitnuté `.env` / secrets **(manuálne)**
- [ ] Proces vybavenia GDPR žiadostí (prístup, výmaz) — kontakt a SLA **(manuálne)**

---

## MÔŽE POČKAŤ

Neblokuje MVP launch; naplánovať do backlogu.

- [ ] CSP nonces namiesto `script-src 'unsafe-inline'` (M2)
- [ ] FK `ai_generations.target_id → posts(id)` (L7)
- [ ] CHECK/trigger: `posts.cover_asset_id` same `site_id` (M4)
- [ ] Retenčná politika pre `audit_logs` (M7)
- [ ] Generickejšia správa pri duplicitnej registrácii (L1)
- [ ] Soft-delete purge pre `sites` / `posts` / `media_assets`
- [ ] Produktová analytika nad rámec GA4
- [ ] Pravidlá `campaign_ends_at` / predĺženie balíka
- [ ] Admin nástroje: webhook reprocess, moderátorská fronta
- [ ] VALIDATE CONSTRAINT pre historické SVG MIME riadky

---

## Recovery runbook

**Scenár:** „Zajtra zmažeme databázu — ako obnovíme službu?“

### 1. Zastaviť zápisy (voliteľné)
- Vo Vercel dočasne vypnúť deploy alebo nastaviť maintenance (ak existuje) **(manuálne)**
- Overiť, že Stripe webhooky môžu chvíľu retryovať (Stripe opakuje pri 5xx)

### 2. Obnoviť databázu
1. V Supabase Dashboard obnoviť z posledného **Point-in-Time Recovery** alebo denného backupu **(manuálne — overiť, že PITR je zapnuté pred incidentom)**
2. Overiť, že schéma sedí s `main` (migrácie `0001`–`0022` a novšie append-only súbory)
3. Ak restore je starší než posledná migrácia: znova spustiť GitHub Action `Supabase migrations` alebo `supabase db push` z CI (nie z Macu proti prod podľa projektovej politiky)

### 3. Storage
1. Overiť, či restore zahŕňa Storage buckety `candidate-media` a `published-media` **(manuálne)**
2. Ak nie: publikované weby môžu mať broken obrázky — znova publikovať zo draftov, alebo obnoviť objekty zo Storage backupu
3. Draft médiá bez DB riadkov = orphan (pozri M5)

### 4. Aplikácia
1. Redeploy Vercel z `main`
2. Overiť env: `DEMO_MODE=false`, všetky secrets, `LEGAL_DOCUMENTS_APPROVED`
3. Smoke: `/api/health` → login → zoznam projektov → jedna verejná `/:slug` → Stripe Dashboard posledné eventy

### 5. Platby po restore
- Ak DB restore je pred fulfillmentom, Stripe mohol už označiť platbu; webhook replay alebo manuálna kontrola `orders` vs Stripe Sessions **(manuálne)**
- **NIKDY** neaktivovať plán len z return URL — použiť overený webhook / `fulfill_stripe_checkout`

### 6. Komunikácia
- Informovať dotknutých kandidátov, ak boli verejné weby nedostupné
- Zaznamenať incident do interného audit trail (mimo alebo v `audit_logs`)

### RTO / RPO (návrh na doplnenie)
| Metrika | Odporúčanie MVP | Stav |
|---------|-----------------|------|
| RPO (max strata dát) | ≤ 24 h (denný backup) alebo minúty (PITR) | **vyžaduje manuálne overenie** |
| RTO (obnova služby) | ≤ 4 h pri jednej osobe | **vyžaduje cvičný test** |

**Odporúčanie:** pred launchom raz vykonať cvičný restore na branch/staging projekte (nie nutne full prod wipe).

---

## Mapovanie checklist ↔ nálezy auditu

| Checklist | Nález |
|-----------|-------|
| DEMO_MODE=false | C1 |
| Email verify pred platbou/publish | H1 |
| Domain RPC harden | H2 |
| Auth rate limit | H3 |
| Support DB rate limit | H4 |
| AI_AUDIT_HMAC_KEY | M1 |
| CSP nonces | M2 |
| Callback allowlist | M3 |
| Cover same-site | M4 |
| Orphan cleanup | M5 |
| Token purge | M6 |
| Audit retention | M7 |
| Firebase restrictions | M8 |
| Cron secret + beh | L6 |
| Health / uptime | L2 |

---

## Rýchly launch gate (jedna strana)

```text
DEMO_MODE=false
+ Supabase cloud env
+ Live Stripe + webhook test OK
+ LEGAL_DOCUMENTS_APPROVED=true (po právnikovi)
+ SELLER_* komplet
+ DNS/TLS + pošta OK
+ CRON_SECRET + úspešný purge
+ Sentry DSN
+ Admin účet
+ E2E: register → pay → publish → public page
+ DPA procesori + backup politika zapísaná
```

Ak ktorýkoľvek bod z tohto boxu chýba, **nespúšťať** platený verejný predaj.
