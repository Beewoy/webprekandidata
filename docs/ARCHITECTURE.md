# Technická architektúra

Tento dokument popisuje implementovanú architektúru aplikácie. Produktové rozhodnutia a budúci rozsah sú v `WEB_PRE_KANDIDATA_IMPLEMENTATION_PLAN.md`.

## 1. Základné princípy

- Jeden multi-tenant Next.js projekt obsluhuje dashboard aj budúce verejné weby kandidátov.
- Používateľ môže čítať a meniť iba projekty, ktoré vlastní. Izoláciu vynucujú serverové kontroly aj PostgreSQL RLS.
- Koncept webu a publikovaná verzia sú oddelené. Verejný web nikdy nesmie čítať rozpracovaný koncept.
- Platba odomyká publikovanie, nie vytvorenie účtu, editor ani súkromný náhľad.
- Dátum ukončenia kampane zostáva nullable a nesmie byť natvrdo zapísaný v aplikácii.
- Demo režim musí zostať funkčný bez Supabase, Stripe, e-mailu a AI účtu.

## 2. Režimy aplikácie

### Demo režim

Je aktívny, keď chýba Supabase konfigurácia alebo `DEMO_MODE` nie je nastavené na `false`.

- projekt má ID `demo`,
- prihlasovacie formuláre zobrazia informáciu, že Supabase ešte nie je pripojený,
- vytvorenie projektu presmeruje na demo projekt,
- autosave prebehne cez rovnakú serverovú akciu, ale bez zápisu do databázy,
- UI a používateľské toky sa dajú kompletne testovať lokálne.

Zdroj: `lib/env.ts`.

### Produkčný režim

Vyžaduje Supabase premenné a `DEMO_MODE=false`.

- `/app` vyžaduje autentifikovaného používateľa,
- projekty sa načítajú zo Supabase,
- RLS filtruje údaje podľa `auth.uid()`,
- vytvorenie projektu a autosave používajú databázové RPC funkcie.

## 2.1 Prostredia a databáza

```mermaid
flowchart TB
  subgraph mac [Mac — lokálny vývoj]
    Dev["next dev"]
    LocalEnv[".env.local\n127.0.0.1:54321"]
    LocalDB["Supabase Docker"]
    Dev --> LocalEnv --> LocalDB
  end

  subgraph ci [GitHub Actions]
    Merge["merge do main"]
    Migrate["supabase db push"]
    Merge --> Migrate
  end

  subgraph prod [Produkcia]
    Vercel["Vercel deploy"]
    CloudDB["Supabase cloud"]
    Vercel --> CloudDB
    Migrate --> CloudDB
  end
```

| Prostredie | Databáza | Credentials |
|---|---|---|
| Lokálny vývoj | Docker Supabase na `:54321` | `.env.local` (nikdy `*.supabase.co`) |
| Demo bez DB | Žiadna (in-memory fallback) | `DEMO_MODE=true` alebo chýbajúce Supabase env |
| Produkcia | Cloud Supabase `iozvohajbtzxviytpufp` | Vercel env + GitHub Secrets |

**Zero prod from Mac:** vývojár na Macu nespúšťa `supabase link`, `supabase db push` ani `supabase config push`. Nové migrácie sa testujú cez `npm run supabase:reset` a do produkcie idú workflow `.github/workflows/supabase-migrate.yml`.

Lokálny `supabase/config.toml` má `site_url` na localhost a vypnutý Brevo SMTP; auth maily pri lokálnom stacku idú do Inbucketu. Produkčný Brevo SMTP zostáva v Supabase Dashboard.

### Production safety checklist

Pred každým lokálnym vývojom overte:

- Docker beží a `npm run supabase:status` ukazuje lokálny stack,
- `.env.local` obsahuje `http://127.0.0.1:54321`, nie cloud URL,
- `supabase/.temp/linked-project.json` neexistuje.

Zakázané príkazy na Macu: `supabase link`, `supabase db push`, `supabase config push`, `supabase db reset --linked`.

## 3. Rozdelenie kódu

```text
app/
  page.tsx                indexovateľná marketingová landing page
  kampanovy-web-pre-*/    statické SEO stránky podľa typu komunálnej kandidatúry
  komunalne-volby-2026/   sezónna komunálna SEO stránka
  volby-do-vuc-2026/      spoločná SEO stránka pre predsedu kraja a poslanca VÚC
  [slug]/                 verejný web z aktuálneho publikovaného snapshotu
  (auth)/                 prihlasovacie a obnovovacie obrazovky
  actions/                serverové mutácie a autorizácia
  admin/                  interný admin prevádzkovateľa (role=admin)
  app/                    chránená aplikácia kandidáta
  ukazka/                 interný cieľ verejnej ukážky šablóny Horizont
  auth/callback/          výmena Supabase auth kódu za reláciu
components/
  marketing/              zdieľaný kampanový web, odpočet a izolované štýly
  admin/                  shell, tabuľky a dialóg admin hold
  app-shell/              sidebar, mobilná navigácia a horná lišta
  auth/                   interaktívne auth formuláre
  dashboard/              prehľad projektu
  editor/                 editory jednotlivých sekcií
  projects/               zoznam a vytvorenie projektov
  ui/                     malé zdieľané prezentačné komponenty
lib/
  ai/                     serverové AI volanie, fallback a podpísané potvrdenie výsledku
  data/                   serverové čítanie dát vrátane admin loaderov
  marketing/              obsah, metadata, JSON-LD a zoznam verejných SEO ciest
  supabase/               typované browser/server Supabase klienty a generované DB typy
  validation/             Zod schémy a typy stavov formulárov
supabase/migrations/      verzovaná databázová schéma a RPC
tests/                    jednotkové testy
```

Root `/` sa staticky generuje zo zdrojového dokumentu `landing-page/index.html`, ale metadata, Open Graph obrázok, robots a sitemap používa Next.js Metadata API. `/app` a `/admin` zostávajú samostatné chránené stromy. Platformové `www` sa v `proxy.ts` presmeruje 308 na apex; custom hostname sa naďalej prepisuje iba na publikovaný snapshot.

Výnimkou z autentifikácie stromu `/app` je verejná ukážka `/app/web/demo`. `proxy.ts` ju na platformovom hoste interne prepisuje na noindex cestu `/ukazka`, takže odkaz z prihlasovacej stránky funguje bez účtu a nedotýka sa produkčných konceptov ani publikovaných snapshotov.

Päť kampanových SEO ciest je implementovaných ako explicitné statické segmenty, ktoré zdieľajú serverový komponent a dátovú konfiguráciu v `lib/marketing/campaign-pages.ts`. Každá cesta má vlastný obsah, canonical, Open Graph metadata a JSON-LD zhodné s viditeľným FAQ. Explicitné segmenty majú pred dynamickým `[slug]` prednosť, preto migrácia `0016_reserve_marketing_slugs.sql` pridáva všetky marketingové a chýbajúce systémové cesty do rezervovaného zoznamu `create_candidate_site`. Sitemap, robots a interné odkazy používajú spoločný zoznam `MARKETING_ROUTES`.

## 4. Serverové a klientské hranice

Stránky a layouty sú predvolene React Server Components. Na serveri zostáva:

- načítanie používateľa a projektov,
- kontrola vlastníctva,
- prístup k databáze,
- validácia všetkých mutácií,
- redirecty po autentifikácii.

Client Components sa používajú iba tam, kde je potrebný stav alebo interakcia:

- auth formuláre,
- mobilný drawer,
- autosave formulára,
- výber vzhľadu, domény a balíka,
- publikovanie, pozastavenie a obnovenie webu,
- dvojkrokový uvítací dialóg a kontrola AI návrhu,
- nahrávanie, titulky a zoraďovanie fotografií v galérii,
- verejné modálne zobrazenie článkov a lightbox galérie.

Zo servera do klienta sa smú posielať iba serializovateľné údaje. React komponenty, triedy ani funkcie nesmú byť súčasťou dátového objektu poslaného do Client Component.

## 5. Autentifikácia

Tok registrácie:

```text
registrácia → serverová Zod validácia → Supabase signUp
           → okamžitá relácia a presmerovanie do /app
           → server vytvorí náhodný token a do DB uloží iba SHA-256 odtlačok
           → Brevo odošle odkaz /auth/overit-email?token=...
           → jednorazové spotrebovanie tokenu → profiles.email_verified_at
```

Supabase `enable_confirmations` je vypnuté, pretože jeho vstavaný režim nevie súčasne povoliť prihlásenie a zachovať adresu ako neoverenú. Zdrojom pravdy pre aplikáciu je preto `profiles.email_verified_at`, nie `auth.users.email_confirmed_at`.

Token platí 24 hodín, v databáze sa nikdy neukladá v čitateľnom tvare a po použití sa označí ako spotrebovaný. Vydanie a zrušenie tokenu môže volať iba serverový `service_role`; anonymný callback má prístup len k funkcii, ktorá pozná správny hash a token atómovo spotrebuje. Opätovné odoslanie je obmedzené na raz za minútu.

Obnova hesla:

```text
žiadosť o obnovu → reset e-mail → /auth/callback?next=/obnova-hesla
                 → aktívna recovery session → updateUser(password)
                 → odhlásenie → /prihlasenie
```

Serverové akcie sú v `app/actions/auth.ts`. UI je v `components/auth/auth-form.tsx`.

Obnovu hesla a ďalšie vstavané Auth e-maily odosiela Supabase cez Brevo SMTP. Aplikačný overovací e-mail odosiela server cez rovnaké Brevo SMTP spojenie (`smtp-relay.brevo.com:587`). SMTP prihlasovacie údaje sú iba v serverovom prostredí. Doména `webprekandidata.sk` je autentifikovaná overovacím TXT a dvomi DKIM CNAME záznamami vo Websupport DNS. Odosielateľ je `Web pre kandidáta <noreply@webprekandidata.sk>`. Existujúci SPF záznam Websupportu a DMARC politika `p=quarantine` sa pri tejto integrácii nemenia. Dialóg Pomoc a podpora v dashboarde odosiela podporné správy cez rovnaké Brevo SMTP na pevné interné inboxy; vyžaduje prihláseného používateľa (okrem demo režimu) a má limity na počet odoslaní.

Ochrana nesmie byť iba v proxy alebo UI. Každá mutácia musí samostatne overiť používateľa a databázová operácia musí byť chránená RLS alebo bezpečnou RPC funkciou.

### Uvítací AI onboarding

Bezprostredne po úspešnej registrácii smeruje používateľ na `/app?welcome=1`. Parameter iba otvorí uvítací dialóg; nie je zdrojom oprávnenia ani uloženého stavu. Kandidát môže tok zavrieť alebo prejsť na pôvodný ručný formulár.

```text
krátke predstavenie
  → serverová validácia dĺžky a autentifikácia
  → limit najviac 3 požiadavky za minútu a používateľa
  → OpenAI Responses API so Structured Outputs a store=false
  → editovateľný návrh v klientovi
  → explicitné potvrdenie kandidáta
  → create_candidate_site RPC
  → vlastnícky RLS update počiatočného site_drafts
```

OpenAI kľúč, model a podpisovací secret sú iba serverové premenné. Model dostáva pseudonymizovaný `safety_identifier`, nemá prístup k nástrojom ani webu a prompt mu zakazuje dopĺňať neposkytnuté fakty. Neznáme údaje vracia prázdne a kandidát ich pred uložením doplní. Štruktúrovaný výsledok sa po návrate opäť validuje cez Zod.

Pred vytvorením projektu sa frekvencia kontroluje cez minimalizované záznamy v `audit_logs`, pretože `ai_generations` vyžaduje existujúce `site_id`. Po prijatí návrhu sa do `ai_generations` uloží provider, model, spotreba a HMAC fingerprint podpísané krátkodobým serverovým potvrdením; prompt ani neupravený výstup sa neukladajú. Bez AI kľúča sa obsah nevydáva za AI výstup a dialóg použije označený manuálny prenos textu.

## 6. Projekty

Zoznam projektov načítava `getSites()` z `lib/data/sites.ts`.

Vytvorenie projektu používa RPC `create_candidate_site`, ktorá v jednej transakcii:

1. vytvorí záznam v `sites`,
2. vytvorí počiatočný `site_drafts`,
3. rezervuje subdoménu v `domains`,
4. vráti ID projektu.

Tým sa predíde napoly vytvorenému projektu.

## 7. Autosave a revízie

Editor po zmene poľa počká približne 700 ms (autosave). Uloženie sa nespúšťa pri opustení poľa — iba po debounce zmene, okamžitých akciách (pridať/zmazať/presunúť položku) alebo pri téme po výbere.

```text
zmena poľa
  → klient zozbiera FormData
  → saveSectionAction
  → Zod validácia vstupu
  → kontrola relácie
  → RPC update_site_section(site_id, section, payload, expected_revision)
  → atómový update iba pri zhodnej revízii
  → JSON výsledok `{ ok, revision, conflict? }` (bez RAISE pri konflikte)
  → nová revízia sa vráti klientovi
```

Ak revízia nesedí, RPC vráti `{ ok: false, conflict: true, revision }` a zapíše DB cooldown (transakcia sa commitne — výnimka by cooldown rollbackla). Server action konflikt zaznamená, nastaví krátky in-process cooldown pre `(userId, siteId)` (zdieľaný pre ukladanie sekcie aj témy), vráti `conflict` + `currentRevision` a UI vypne autosave až do obnovenia stránky. UI nesmie konflikt potichu prepísať.

Incidentová analýza (2026-08-12): `docs/incidents/revision-conflict-burst-2026-08-12.md` — Service Health ukázal ~3,3 M Postgres ERROR logov/h pri ~231 API Gateway requestoch; chart počíta `postgres_logs`, nie HTTP. Migrácia `0020` dopĺňala DETAIL; `0021` cooldown + RAISE bola neúčinná (rollback); `0022` vracia JSON bez RAISE, aby cooldown prežil a ERROR spam ustal.

Hlavné súbory:

- `components/editor/section-form.tsx`,
- `components/editor/appearance-editor.tsx`,
- `app/actions/sites.ts`,
- `lib/draft-save-guard.ts`,
- `supabase/migrations/0002_site_functions.sql`,
- `supabase/migrations/0020_revision_conflict_detail.sql`,
- `supabase/migrations/0021_draft_revision_cooldown.sql`,
- `supabase/migrations/0022_revision_conflict_json_result.sql`.

Opakované položky používajú v klientskom stave stabilné ID, podporujú pridanie, odstránenie a zmenu poradia úchytom, dotykom aj šípkami na klávesnici. Autosave serializuje autoritatívny klientsky stav, nie ešte neaktualizované DOM prvky: posiela aktuálny počet v `items_count` a položky ako ploché kľúče `item_{index}_title`, `item_{index}_text`, `item_{index}_icon` a pri programe aj `item_{index}_detail`. Načítanie konceptu zachová všetky reťazcové kľúče sekcie vrátane dynamických položiek. Databázová RPC vždy nahradí celý payload sekcie, takže odstránené položky nezostávajú v koncepte. Pri budúcom rozšírení o samostatné entity alebo zdieľané odkazy sa má úložisko migrovať na položky s perzistentným ID.

## 8. Dátový model

Kľúčové tabuľky:

- `profiles` — profil a rola používateľa,
- `sites` — projekt, vlastník, stav a balík,
- `site_drafts` — aktuálny koncept, téma, SEO a revízia,
- `site_publications` — nemenné publikované snapshoty,
- `media_assets` — metadata nahratých obrázkov,
- `domains` — subdomény a vlastné domény,
- `orders` a `payment_events` — objednávky a idempotentné webhooky,
- `posts` — aktuality,
- `contact_submissions` — správy s retenčnou lehotou,
- `ai_generations` — minimalizovaný AI audit bez plného promptu,
- `audit_logs` — citlivé prevádzkové operácie.

Po pripojení produkčnej databázy sa existujúce migrácie nemenia. Každá zmena schémy dostane nový očíslovaný súbor.

Cloudová schéma je zdrojom pre generovaný súbor `lib/supabase/database.types.ts`. Po každej lokálnej zmene schémy sa obnoví cez `npm run supabase:types` (z lokálneho Docker stacku); browserový aj serverový klient používajú typ `Database`. Generovaný súbor sa neupravuje ručne.

Balík je vlastnosť konkrétneho webu, nie globálna vlastnosť prihlasovacieho účtu. `sites.plan_code = null` znamená Free; hodnoty `basic` a `plus` sa v dashboarde zobrazujú ako aktívny balík. Samotný textový stav v `sites` nie je bezpečnostným oprávnením na platené funkcie. Plus AI sa odomkne iba vtedy, keď pre ten istý web a vlastníka existuje zaplatená, stále platná Plus objednávka v `orders`. Produkčné odomknutie ide výhradne cez overený Stripe fulfillment (`fulfill_stripe_checkout`); admin môže výnimočne udeliť balík cez auditovanú RPC `admin_grant_site_plan`.

## 8.1 Platba Stripe Checkout

Tok nákupu Basic/Plus:

1. kandidát na Publikovanie vyberie balík a vyplní fakturačné údaje,
2. server overí vlastníctvo, Free stav a Zod vstup, vytvorí `orders` so stavom `pending` (buyer/seller snapshot) a číslom `order_number` vo formáte `WPK-YYYY-NNNNN`,
3. server vytvorí Stripe Customer z buyer snapshotu; názov firmy má prednosť pred menom a IČO zostáva v Customer metadata,
4. server vytvorí Stripe Checkout Session s Price ID z env, `mode=payment`, konkrétnym Customerom a zapnutou post-purchase Invoice; rovnaké mapovacie metadata (`order_id`, `order_number`, …) sú na Session, PaymentIntente aj budúcej Invoice,
5. uloží `stripe_customer_id` a `stripe_checkout_session_id`, kandidát zaplatí na Stripe-hosted Checkout,
6. `checkout.session.completed` alebo `checkout.session.async_payment_succeeded` overený webhook volá `fulfill_stripe_checkout` (service role),
7. RPC idempotentne podľa `payment_events.provider_event_id` označí objednávku `paid`, nastaví `sites.plan_code` a zapíše audit `order.fulfilled`,
8. pri prvom (neidempotentnom) fulfill aplikácia pošle Brevo potvrdenie s číslom objednávky; `orders.confirmation_email_sent_at` bráni duplicite a zlyhanie e-mailu nevracia webhook na retry,
9. samostatný `invoice.paid` webhook mapuje Invoice cez `invoice.metadata.order_id`; `record_stripe_invoice` uloží Invoice ID, PDF URL a Hosted Invoice URL a skontroluje zhodu Customer ID,
10. návratová URL iba obnoví UI; balík sa z nej ani z Invoice eventu nikdy neaktivuje. História objednávok (Publikovanie aj `/admin/objednavky`) zobrazuje `order_number` a odkaz na doklad.

Ceny sú viazané na `STRIPE_PRICE_BASIC` / `STRIPE_PRICE_PLUS` a zároveň na DB constraint `total_cents in (4999, 8999)`. `valid_until` ostáva `null` do schválenia pravidiel kampane. Demo režim Checkout nevolá.

Post-purchase Invoice preberá meno/názov a billing adresu z Customer objektu. Custom field obsahuje číslo objednávky a voliteľné zákaznícke IČO; Invoice metadata slúžia iba na spoľahlivé interné mapovanie a na PDF sa nezobrazujú. Footer obsahuje dodávateľské IČO, DIČ a text „Nie sme platiteľom DPH“. Stripe Tax, tax rates, customer tax ID collection ani výpočet DPH nie sú zapnuté. Identitu, adresu, podporu a branding dodávateľa dopĺňa Stripe z konfigurácie účtu.

`invoice.paid` môže prísť pred alebo po checkout fulfillment evente. Obe vetvy používajú spoločnú tabuľku `payment_events`, ale samostatné RPC a nezávislé side effects: Checkout fulfillment aktivuje plán, Invoice RPC iba uloží dokladové referencie. Opakovaný event s rovnakým Stripe event ID sa vráti ako idempotentne spracovaný.

Hlavné súbory: `lib/payments/*`, `lib/validation/checkout.ts`, `app/actions/checkout.ts`, `app/api/webhooks/stripe/route.ts`, `lib/data/orders.ts`, migrácie `0012_stripe_fulfillment.sql`, `0017_stripe_invoices.sql` a `0024_order_numbers_and_confirmation.sql`.

## 8.2 Domény, DNS a SSL

Kandidátsky web má v MVP dve adresy:

1. **Platformová cesta** `https://{NEXT_PUBLIC_ROOT_DOMAIN}/{slug}` — súčasť Basic aj Plus. Nevyžaduje wildcard DNS ani Vercel nameservers; apex môže ostať vo Websupporte (Brevo mailové záznamy).
2. **Vlastná doména** — iba Plus so zaplatenou objednávkou (`has_plus_entitlement`). Jedna custom doména na projekt.

```text
Plus kandidát
  → attach_custom_domain RPC
  → Vercel Domains API add domain
  → DNS inštrukcie v verification_metadata
  → manuálna kontrola / verify
  → status active + ssl_metadata + is_primary
  → proxy.ts rewrite Host → /{slug}
```

Pri vytvorení projektu `create_candidate_site` rezervuje subdomain hostname `{slug}.webprekandidata.sk` so stavom `active` (rezervácia pre budúci wildcard). Verejná kanonická Basic adresa je však platformová cesta. `proxy.ts` na platformovom hoste nemení správanie; na custom hoste prepisuje `/` na `/{slug}` a app cesty (`/app`, `/admin`, auth) redirectuje na `NEXT_PUBLIC_APP_URL`.

Vercel tajomstvá (`VERCEL_TOKEN`, `VERCEL_PROJECT_ID`, voliteľne `VERCEL_TEAM_ID`) sú iba serverové. Demo režim Vercel nevolá. Canonical/OG URL berie aktívnu primary custom doménu, inak platformovú cestu.

Po attachi alebo kontrole sa DNS inštrukcie vždy uložia (minimálne apex A `76.76.21.21` alebo CNAME na `cname.vercel-dns.com`). Ak metadáta v DB chýbajú, načítanie editora ich doplní z Vercel API alebo fallbackom. Nesprávne DNS pred dokončením u registrátora zostáva v stave `verifying`, nie okamžité `failed`.

Hlavné súbory: `lib/domains/*`, `lib/data/domains.ts`, `app/actions/domains.ts`, `components/editor/domain-editor.tsx`, `proxy.ts`, migrácia `0014_domain_management.sql`.

Stránka publikovania načíta vlastnený projekt na serveri a do klientského UI odovzdá iba jeho serializovateľné `planCode`. Pri Free stave ponúka nákupný výber, fakturačný formulár a históriu objednávok. Pri Basic alebo Plus sa nákupný výber aj objednávkové CTA skryjú a zobrazí sa iba aktívny balík s jeho benefitmi a funkčným odkazom na kontrolu náhľadu. Tým UI nežiada už zaplateného kandidáta o ďalšiu objednávku; oprávnenia platených funkcií však naďalej overuje databáza, nie tento vizuálny stav.

Publikovanie nepovažuje samotný `sites.plan_code` za oprávnenie. RPC `has_publish_entitlement` vyžaduje vlastníctvo projektu a zhodnú zaplatenú, neexpirovanú objednávku. UI navyše dostáva serverom odvodenú pripravenosť obsahu, stav poslednej publikácie a informáciu, či sa fingerprint konceptu líši od verejnej verzie.

Médiá konceptu sa ukladajú do súkromného bucketu `candidate-media`. Cesta objektu musí začínať ID projektu (`<siteId>/<assetId>/<filename>`). Storage RLS z prvého priečinka odvodí projekt a cez `owns_site()` overí vlastníka. Súkromný bucket sa nikdy nesprístupňuje celý. Pri publikovaní serverový klient skopíruje iba aktívne médiá použité snapshotom do verejného bucketu `published-media` pod cestu `<siteId>/<publicationId>/<assetId>.webp`; media manifest potom odkazuje iba na túto nemennú sadu.

Editor obrázkov prijíma iba JPEG, PNG a WebP do 15 MiB. Pred uploadom kontroluje signatúru súboru a rozmery, po orezaní cez canvas vytvorí optimalizovaný WebP, čím sa zároveň odstránia pôvodné EXIF metadata. Klient nahráva objekt cez autentifikovaný Supabase Storage klient; vlastníctvo cesty vynucuje Storage RLS. `registerMediaAssetAction()` následne znova autentifikuje používateľa, overí projekt a presnú cestu, stiahne uložený objekt a overí jeho veľkosť aj skutočnú WebP signatúru. Až potom zapíše metadata do `media_assets` a starší aktívny obrázok rovnakého typu označí ako zmazaný. Staré objekty zostávajú do budúceho retenčného cleanupu obnoviteľné.

Galéria je samostatná obsahová sekcia, pretože na rozdiel od systémových obrázkov (znak kampane, hero, „O mne“ a náhľad pre sociálne siete) obsahuje opakované verejné položky. Kandidát môže nahrať najviac 12 fotografií. Klient ich zmenší najviac na 1920 × 1440 px, odstráni pôvodné EXIF metadata a exportuje WebP. Server znovu overí skutočnú WebP signatúru, vlastníctvo projektu, počet položiek a spoločný 15 MiB limit aktívnych médií projektu. Titulok má najviac 160 znakov a zároveň slúži ako alternatívny text; pri prázdnom titulku sa použije neutrálny popis.

Poradie galérie sa ukladá v `media_assets.sort_order`. Celý zoznam sa mení jedinou vlastnícky chránenou RPC `reorder_gallery_assets`, ktorá odmietne duplicity, cudzie ID aj neúplný zoznam. Odstránenie najprv záznam označí cez `deleted_at` a potom odstráni objekt zo Storage. Náhľady sa čítajú iba cez krátkodobé podpísané URL. `getSiteGallery()` poskytuje editoru položky v uloženom poradí aj súčet využitého aktívneho úložiska.

Súkromné náhľady nepoužívajú verejné URL bucketu. `getSiteMedia()` vytvára krátkodobé podpísané odkazy a `getSitePreviewData()` ich pridáva do sanitizovaného modelu náhľadu pre znak kampane, hero a fotografiu „O mne“. Verejný web skladá rovnaký zobrazovací model iba z `site_publications` a jeho samostatného media manifestu; aktuálny koncept ani aktívne objekty súkromného bucketu nečíta. Politická príslušnosť je voliteľný text v základných údajoch (`politicalAffiliation`) a zobrazuje sa v hero sekcii, nie ako logo.

## 9. Stav obsahu

Aktuálne formuláre používajú pracovné polia definované v `lib/site-sections.ts`. V produkčnom režime ich počiatočné hodnoty prekrývajú údaje zo `site_drafts`.

Dlhý obsah označený typom `richtext` sa edituje cez TipTap a ukladá ako obmedzené HTML. Platí to pre hlavný text „O mne“ a voliteľné dynamické kľúče `item_{index}_detail` pri bodoch programu. Server pred zápisom povoľuje iba `p`, `br`, `strong`, `em`, `h3`, `ul`, `ol` a `li` bez atribútov. Verejná šablóna musí pri implementácii používať tento očistený obsah; nesmie renderovať ľubovoľné nesanitizované HTML z iných polí. Krátke podnadpisy, SEO texty a kontaktné údaje ostávajú obyčajný text.

Programové položky držia krátky názov a opis priamo v zozname. Dlhý popis je progresívne zobrazený až po rozbalení a TipTap sa načíta dynamicky iba vtedy, keď ho používateľ potrebuje. `serializeRepeatableItems()` ukladá detail spolu s položkou, preto pri presúvaní zostáva priradený správnemu bodu programu.

Opakované položky v sekciách „O mne“, „Prečo kandidujem“ a „Program“ ukladajú aj neutrálny občiansky symbol v kľúči `item_{index}_icon`. Povolené hodnoty a ich Lucide komponenty definuje `lib/civic-icons.ts`. Koncept ukladá iba stabilný textový identifikátor, nie názov React komponentu; editor aj náhľad ho preto vedia zobraziť jednotne. Neznáma alebo staršia hodnota sa pri načítaní bezpečne nahradí predvolenou ikonkou sekcie.

Náhľad webu sa neskladá z ukážkového JSX. Serverová funkcia `getSitePreviewData()` načíta vlastnený projekt a celý `site_drafts`, potom `buildSitePreviewData()` vytvorí typovaný, sanitizovaný model kandidátskeho webu. Model obsahuje základné údaje, hero, „O mne“, dôvody, program, galériu, kontakt, tému a číslo revízie. Galéria sa v tomto modeli zobrazuje v uloženom poradí a fotografie sa otvárajú v prístupnom lightboxe ovládateľnom tlačidlami, šípkami klávesnice a klávesom Escape. Náhľad používa rovnaký model pre desktopovú aj mobilnú simuláciu. Verejná cesta `/:slug` skladá ten istý model zo snapshotu, takže rozloženie a sanitizácia zostávajú zhodné, ale zdroj dát je striktne oddelený. Každé uloženie obsahovej sekcie alebo galérie revaliduje iba súkromný náhľad; verejná cesta sa revaliduje až publikačnou akciou.

Prehľad projektu načítava rovnaký `SitePreviewData` a jeho kompaktná karta z neho preberá adresu, kandidáta, hero texty, zvolenú šablónu, farbu, znak kampane a portrét. Karta preto nesmie obsahovať samostatné natvrdo zapísané ukážkové dáta, ktoré by sa mohli rozísť s úplným náhľadom.

Editor vzhľadu načítava `theme` a spoločnú `revision` z `site_drafts`. Serverová akcia ukladá normalizovaný objekt `{ layout, primaryColor }` priamym vlastnícky chráneným update-om s podmienkou na očakávanú revíziu. Zmena šablóny alebo platnej HEX farby sa ukladá automaticky; pri súbežnej úprave sa update nevykoná a klient zobrazí konflikt. Po úspechu sa revaliduje layout projektu aj úplný náhľad.

Sekcie editorov:

- `zakladne-udaje`,
- `kontakt`,
- `uvod`,
- `o-mne`,
- `preco-kandidujem`,
- `program`,
- `aktuality`,
- `vzhlad`,
- `obrazky`,
- `galeria`,
- `seo`,
- `domena`,
- `nahlad`,
- `publikovanie`.

Nie všetky špeciálne editory už zapisujú do databázy. Presný stav je v `docs/IMPLEMENTATION_STATUS.md`.

Sidebar a prehľad nepracujú s ukážkovými stavmi. `getSiteSectionStatuses()` načíta vlastnený koncept a dostupné projektové záznamy, potom čistá funkcia v `lib/site-section-status.ts` odvodí stav `empty`, `started` alebo `complete`. Obsahová sekcia je dokončená až po vyplnení jej minimálneho zmysluplného obsahu; pri dôvodoch a programe je potrebná aj aspoň jedna úplná zoznamová položka. Po úspešnom autosave serverová akcia revaliduje layout projektu, takže sidebar aj prehľad dostanú nový stav v tom istom serverovom roundtripe.

## 10. Aktuality a Plus AI návrhy

Aktuality sú samostatné záznamy v `posts`, nie súčasťou JSON konceptu. Kandidát v Basic aj Plus môže články vytvárať, upravovať, ukladať ako koncept, zverejniť, skryť a odstrániť. Text sa ukladá ako `{ html }`, na serveri sa sanitizuje rovnakým zoznamom povolených značiek ako ostatný dlhý obsah a zápis používa optimistickú `revision`. Titulný obrázok je súkromné médium typu `post`, započítava sa do spoločného 15 MiB limitu projektu a v náhľade sa načítava podpísaným odkazom.

Článok nemá verejnú samostatnú URL. Verejný kandidátsky web aj jeho náhľad zobrazujú zverejnené články v sekcii Aktuality. Kliknutie otvorí detail ako modálnu vrstvu nad tou istou stránkou, bez navigácie a bez zmeny adresy. Interná dashboard cesta `/app/web/:siteId/aktuality/:postId` slúži iba na editovanie.

Balík Plus pridáva AI návrh textu, manuálny editor neobmedzuje. Oprávnenie sa nečíta z klienta ani z meniteľného `sites.plan_code`; databázová funkcia ho odvodí zo zaplatenej a stále platnej Plus objednávky. RPC `reserve_post_ai_generation` pod transakčným zámkom atómovo rezervuje jednu z 20 požiadaviek projektu, čím sa kvóta nedá obísť súbežnými požiadavkami.

```text
podklady kandidáta
  → serverová validácia a kontrola vlastníctva
  → zaplatený Plus + atómová rezervácia kvóty 20
  → OpenAI Responses API, Structured Outputs, store=false
  → sanitizovaný návrh nadpisu, zhrnutia a tela
  → vloženie do editora ako neuložená zmena
  → ľudská kontrola a až potom explicitné uloženie/zverejnenie
```

Do `ai_generations` sa ukladá iba cieľové ID článku, provider, model, stav, spotreba tokenov a HMAC fingerprint podkladov. Plný prompt ani odpoveď sa do auditu neukladajú. Model nemá nástroje ani web, podklady považuje za nedôveryhodné dáta a nesmie dopĺňať neposkytnuté fakty. AI návrh nikdy automaticky nemení databázový článok ani jeho stav.

Hlavné súbory:

- `components/editor/news-editor.tsx`,
- `components/editor/post-editor.tsx`,
- `app/actions/posts.ts`,
- `lib/ai/article.ts`,
- `supabase/migrations/0009_candidate_posts.sql`.

## 11. Kontaktný formulár

Sekcia Kontakt ukladá prepínač `contactFormEnabled` ako súčasť obsahu konceptu. Staršie koncepty bez tohto kľúča majú formulár predvolene zapnutý. Náhľad vykresľuje spoločný komponent formulára tesne pred pätičkou, ale odosielanie je v náhľade zámerne vypnuté.

Verejné odoslanie je neautentifikovaná mutácia a preto sa považuje za nedôveryhodný vstup:

```text
návštevník → serverová Zod validácia + honeypot
            → kontrola limitu podľa site_id a normalizovaného e-mailu
            → sites.status = published + current_publication_id
            → načítanie kontaktu iba z aktuálneho site_publications snapshotu
            → contact_submissions(pending)
            → Brevo SMTP na publikovaný kontaktný e-mail
            → contact_submissions(sent | failed)
```

Klient posiela iba ID webu a polia správy; cieľovú adresu ani stav prepínača neposiela. Server nikdy nečíta cieľový e-mail zo `site_drafts`, takže rozpracovaná zmena kontaktu sa na verejnom webe prejaví až po novom publikovaní. Pre rovnaký e-mail a web sú povolené najviac tri pokusy za 15 minút. Viditeľné polia sú meno, e-mail, voliteľný telefón a popis; telefón sa minimalizuje na doručovaný e-mail a neukladá sa do databázy. Záznam správy používa existujúcu 90-dňovú retenčnú lehotu.

Hlavné súbory:

- `components/public-site/contact-form.tsx`,
- `app/actions/contact.ts`,
- `lib/email/brevo.ts`.

## 12. Publikovanie

Tok zverejnenia:

```text
uložený koncept + publikované články + aktívne médiá
  → serverová kontrola vlastníctva, povinného obsahu a objednávky
  → stabilný SHA-256 fingerprint zdrojových dát
  → kópia použitých WebP médií do published-media/<siteId>/<publicationId>/
  → publish_candidate_site RPC pod zámkom projektu
  → nový nemenný site_publications snapshot a vyššie version_number
  → atómová zmena sites.current_publication_id + status=published
  → revalidácia dashboardu a verejnej /:slug cesty
```

Snapshot obsahuje `content`, `theme`, `seo`, zoznam publikovaných článkov, `media_manifest`, zdrojovú revíziu a fingerprint. Predchádzajúci snapshot sa pri novej publikácii označí cez `unpublished_at`, ale nemaže sa. Ak kopírovanie alebo transakcia zlyhá, verejný pointer sa nezmení a novovytvorené verejné objekty sa odstránia.

Verejný loader používa serverový Supabase klient, vyžaduje `sites.status = published`, zhodný `current_publication_id` a snapshot bez `unpublished_at`. Z neho vytvorí sanitizovaný `SitePreviewData`, verejné URL immutable médií a SEO metadata. Pri stave `suspended` rovnaká cesta vráti 404, no snapshot zostane pripravený na obnovenie. Kontaktný formulár vykonáva totožnú kontrolu publikovaného projektu a cieľový e-mail číta iba zo snapshotu.

Migrácia: `supabase/migrations/0010_candidate_publications.sql`. Hlavné súbory: `app/actions/publishing.ts`, `lib/data/publishing.ts`, `lib/data/public-site.ts`, `lib/publishing.ts`, `app/[slug]/page.tsx` a `components/editor/publishing-editor.tsx`.

## 13. Interný admin prevádzkovateľa

Oddelený strom `/admin` nie je kandidátsky dashboard. Layout vyžaduje produkčný režim a `requirePlatformAdmin()` (`profiles.role = 'admin'`). V demo režime sa namiesto panelu zobrazí informácia o nedostupnosti. Kandidát bez admin role je presmerovaný na `/app`.

Čítanie ide cez user-scoped Supabase klienta a existujúce RLS politiky s `is_platform_admin()`. Mutácie idú cez server actions a RPC, nie cez service-role UI.

`sites.admin_hold` oddeľuje administrátorské pozastavenie od dobrovoľného pozastavenia kandidáta. RPC `set_candidate_site_visibility` odmietne obnovenie, kým je hold aktívny. RPC `admin_set_site_hold` vyžaduje dôvod, kategóriu, rozsah, trvanie (pri hold) a náhľad správy pre kandidáta; všetko ide do `audit_logs`. Transakčný e-mail sa v MVP ešte neodosiela.

RPC `admin_grant_site_plan` udeľuje Basic alebo Plus konkrétnemu webu: vytvorí zaplatenú objednávku (`valid_until` null), nastaví `sites.plan_code` a zapíše audit `admin_plan_granted`. Balík ostáva vlastnosťou projektu, nie globálneho účtu; zoznam používateľov odkazuje na weby cez filter `?owner=`.

Ďalšie admin RPC: `admin_search_users` (join na `auth.users.email`) a `admin_dashboard_metrics`. `audit_logs` má `GRANT SELECT` pre `authenticated`; RLS stále obmedzuje čítanie na adminov.

Routy: `/admin`, `/admin/pouzivatelia`, `/admin/weby`, `/admin/weby/[siteId]`, `/admin/objednavky`, `/admin/domeny`, `/admin/ai-pouzitie`, `/admin/audit`. AI stránka zobrazuje iba metadata bez promptov a výstupov.

Migrácie: `supabase/migrations/0011_platform_admin.sql`, `supabase/migrations/0013_admin_grant_site_plan.sql`. Hlavné súbory: `lib/data/admin.ts`, `app/actions/admin.ts`, `components/admin/*`, `app/admin/**`.

Prvý admin účet sa nastaví mimo UI:

```sql
update public.profiles set role = 'admin' where id = '<user-uuid>';
```

## 14. Bezpečnostné invarianty

- Nikdy neveriť `siteId`, `userId`, cene, plánu ani oprávneniu poslanému klientom.
- Každú mutáciu validovať na serveri.
- Service role key nikdy neposielať do prehliadača.
- Stripe webhook spracovať idempotentne podľa externého event ID; balík nikdy neaktivovať iba z return URL.
- Stripe Invoice je dokladový následok platby, nie podmienka fulfillmentu; `invoice.paid` nesmie meniť objednávku na paid ani aktivovať plán.
- Stripe tajomstvá (`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, Price IDs) iba na serveri.
- Vercel Domains tajomstvá (`VERCEL_TOKEN`, `VERCEL_PROJECT_ID`, `VERCEL_TEAM_ID`) iba na serveri.
- Custom doménu smie pripojiť iba vlastník so zaplatenou Plus objednávkou; zápisy idú cez RPC.
- Publikovanie vytvára snapshot; verejný web nečíta `site_drafts`.
- AI výstup je návrh a nesmie sa automaticky publikovať.
- Kontaktné správy a AI audit musia mať automatické retenčné mazanie.
- Admin zásahy a pozastavenia webu sa auditujú.
- `profiles.role` nie je upraviteľné kandidátom; admin hold kandidát sám neuvoľní.

## 15. Produkčná prevádzka

Vercel nasadzuje jeden Next.js projekt s Node.js 24. Produkčné premenné sú oddelené od lokálneho `.env.local`; serverové kľúče nemajú prefix `NEXT_PUBLIC_`. Checkout je fail-closed: `isStripeConfigured()` vyžaduje live prevádzkové tajomstvá, ceny, kompletný snapshot predávajúceho a `LEGAL_DOCUMENTS_APPROVED=true`.

Retenčný tok:

```text
Vercel Cron
  → GET /api/cron/retention + Bearer CRON_SECRET
  → service-role Supabase klient
  → purge_expired_operational_data RPC
  → delete contact_submissions a ai_generations po retention_expires_at
```

RPC je dostupná iba `service_role`. Endpoint používa konštantné porovnanie secretu, nevracia citlivé dáta a chybu odošle do Sentry, ak je DSN nakonfigurované.

Sentry inicializuje client, Node aj edge runtime, neodosiela predvolené PII a v produkcii vzorkuje 10 % trace záznamov. Bez `NEXT_PUBLIC_SENTRY_DSN` je SDK neaktívne. CSP povoľuje iba potrebné platformové, Supabase, Stripe a Sentry spojenia; aplikácia navyše posiela HSTS, `nosniff`, zákaz framovania, Referrer Policy a Permissions Policy.

Firebase Analytics používa verejnú webovú konfiguráciu projektu `web-pre-kandidatov` a GA4 measurement ID `G-0LPPHZCVXB`. Malý Client Component v root layoute najprv načíta voľbu z lokálneho úložiska. Firebase SDK a Google Analytics skript sa dynamicky načítajú až po dobrovoľnom súhlase; odmietnutie nevytvorí analytické cookies. Návštevník môže uloženú voľbu zmeniť cez nastavenie cookies v pätičke landing page; delegovaný handler funguje aj pri klientskom prechode medzi routami a na ostatných stránkach zostáva dostupné náhradné pevné tlačidlo. Odvolanie súhlasu zastaví zber a odstráni cookies `_ga` a `_ga_0LPPHZCVXB`. CSP povoľuje iba konkrétne Google Analytics a Google Tag Manager endpointy potrebné na zber.

## 16. UI invarianty

- Platforma používa navy `#163B65`, teal `#0F766E` a Inter.
- Farba kampane nesmie prefarbiť ovládacie prvky platformy.
- Viditeľné labely, fokus a textová chyba sú povinné.
- Stav nesmie byť komunikovaný iba farbou.
- Dotykové prvky majú minimálne 44 × 44 px.
- Rozhranie sa kontroluje minimálne pri šírkach 375, 768, 1024 a 1440 px.
- Používajú sa Lucide SVG ikony, nie emoji.
- Sidebar, mobilná hlavička, karta projektu a prehľad vždy zobrazujú textový badge Free, Basic alebo Plus; stav sa nesmie komunikovať iba farbou.
