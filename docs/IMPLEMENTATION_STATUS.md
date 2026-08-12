# Stav implementácie

Aktualizované: 12. august 2026

Tento dokument je operatívny prehľad skutočne implementovaných funkcií. Produktový plán môže obsahovať aj budúci rozsah.

## Hotové

### Základ projektu

- Next.js 16, React 19 a TypeScript,
- vlastný responzívny dizajn systém,
- pracovné logo a brand tokeny,
- demo režim bez externých služieb,
- health endpoint `/api/health`,
- lint, typecheck, test a produkčný build.

### Marketingová landing page

- samostatná responzívna landing page pre slovenských kandidátov v komunálnych a župných voľbách 2026,
- SEO a konverzný obsah pre frázy „web pre kandidáta“, „volebný web“ a súvisiace typy kandidatúry,
- canonical, Open Graph a Twitter metadata bez odkazov na neexistujúce obrázky,
- JSON-LD pre organizáciu, webovú aplikáciu, ponuky Basic/Plus a viditeľné FAQ,
- hlavné výzvy smerujú priamo na registráciu a presne oddeľujú bezplatný súkromný náhľad od platenej publikácie,
- samostatný SEO audit s odporúčaniami pre obsah, meranie a ostré nasadenie,
- landing je integrovaný do Next.js rootu `/`, má generovaný Open Graph obrázok 1200 × 630 px, favicon, `robots.txt`, sitemapu a funkčné odkazy na právne routy,
- hero na root landing page zobrazuje kompaktný odpočet celých kalendárnych dní do volieb 24. októbra 2026, obnovovaný cez hodinové ISR; v deň volieb použije neutrálny text a po termíne sa skryje,
- root landing page obsahuje responzívnu inline MP4 ukážku administrácie s posterom, natívnymi ovládacími prvkami, prístupným zväčšením vo focus-trap modálnom dialógu a priamym CTA na hotový ukážkový web cez verejnú cestu `/ukazka`,
- päť samostatných indexovateľných kampanových stránok pre starostu, primátora, poslanca, komunálne voľby 2026 a spoločnú kandidatúru na predsedu kraja alebo poslanca VÚC; stránky zdieľajú responzívny marketingový komponent, ceny, interné prepojenia, metadata a JSON-LD,
- sezónne stránky uvádzajú oficiálny termín komunálnych a krajských volieb 24. októbra 2026 a prístupný živý odpočet s bezpečným stavom po volebnom dni,
- právne routy sú implementované ako pracovné znenie; obchodné podmienky pokrývajú reálny bezplatný náhľad, balíky, Stripe platbu, publikovanie, vlastnú doménu, AI a spotrebiteľské práva, samostatný reklamačný poriadok upravuje oznámenie vady, lehoty, spôsoby vybavenia a ARS, pričom dokumenty zostávajú `noindex`, kým právnik nepotvrdí obsah a produkcia nenastaví `LEGAL_DOCUMENTS_APPROVED=true`.

### Dashboard kandidáta

- responzívny app shell a mobilný drawer,
- viditeľný aktívny balík Free, Basic alebo Plus v sidebare, mobilnej hlavičke, prehľade webu a zozname projektov; nový web má predvolene Free,
- prehľad projektu a stav dokončenia odvodený z aktuálne uloženého konceptu,
- všetkých 14 plánovaných navigačných sekcií vrátane samostatnej Galérie,
- obsahové formuláre,
- prístupný WYSIWYG editor pre dlhý text „O mne“ a voliteľné podrobné popisy bodov programu s autosave a serverovou sanitizáciou,
- UI pre vzhľad, obrázky, aktuality, SEO, doménu a publikovanie,
- plnohodnotný zoznam aktualít a editor článku pre Basic aj Plus: koncept, zverejnenie, skrytie, mazanie, krátky popis, TipTap obsah a titulný obrázok,
- verejný model aktualít bez samostatných URL: karty v náhľade otvárajú detail v modálnej vrstve bez zmeny adresy,
- Plus AI návrh článku z podkladov kandidáta s kvótou 20 návrhov na projekt; návrh sa iba vloží do editora a nikdy sa automaticky neuloží ani nezverejní,
- výber z troch responzívnych celostránkových šablón s prístupnými stavmi a živým náhľadom: občiansko-editoriálny Horizont, dynamický Impulz a reprezentatívna Dôvera,
- samostatná ukážková cesta `/app/web/demo` a jej verejný alias `/ukazka` prezentujú vyplnený kandidátsky web v šablóne Horizont vrátane hlavného portrétu kandidáta, profilového loga, fotografie v sekcii O mne, aktualít, trojfotkovej galérie a neaktívneho náhľadu kontaktného formulára aj pri zapnutom produkčnom dátovom režime,
- verejné šablóny používajú spoločný 1200 px obsahový kontajner, verejnú typografickú mierku, responzívne menu a lokálne načítanú serifovú display typografiu pre Dôveru,
- načítanie a automatické ukladanie vybranej šablóny aj farby do `site_drafts.theme` s ochranou revízie,
- desktopový a mobilný náhľad,
- dátový náhľad celého kandidátskeho webu z aktuálneho `site_drafts` s manuálnym obnovením revízie,
- kompaktný náhľad na prehľade projektu napojený na rovnaký koncept, šablónu, farbu, znak kampane a portrét ako úplný náhľad webu,
- kontaktný formulár nad pätičkou v náhľade verejnej šablóny a prepínač jeho viditeľnosti v sekcii Kontakt,
- balíky Basic 49,99 € a Plus 89,99 € ako konečné jednorazové ceny,
- stránka publikovania číta balík a reálne oprávnenie aktuálneho projektu zo servera: Free účtu zobrazí výber Basic/Plus, aktívnemu Basic/Plus účtu pripravenosť obsahu, stav verejnej verzie a akcie zverejniť, publikovať zmeny, pozastaviť alebo obnoviť,
- verejná kandidátska cesta `/:slug` používa posledný nemenný snapshot; koncept ani automaticky uložené rozpracované zmeny nikdy nečíta,
- verejný web zdieľa sanitizovaný zobrazovací model s náhľadom, pričom články zostávajú v modálnej vrstve bez samostatnej URL a kontaktný formulár sa aktivuje iba vo verejnom režime,
- dvojkrokový uvítací dialóg po registrácii s možnosťou preskočenia,
- editovateľná kontrola prvého návrhu pred vytvorením webu,
- dialóg Pomoc a podpora v sidebare editora s telefónom +421 948 473 255 a formulárom, ktorý cez Brevo SMTP pošle správu na podporné e-maily.

### AI onboarding

- serverové generovanie prvého konceptu cez OpenAI Responses API a Structured Outputs,
- doplnenie základných údajov, úvodného banneru, textu „O mne“, motivácie a najviac troch priorít,
- zákaz vymýšľania faktov, opätovná Zod validácia a explicitné prijatie návrhu,
- `store: false`, pseudonymizovaný identifikátor, limit 3 požiadaviek za minútu a minimalizovaný audit bez promptu,
- bezpečný manuálny fallback v demo režime a bez AI kľúča.

### Autentifikácia

- registrácia a prihlásenie,
- odhlásenie,
- okamžité prihlásenie po registrácii a odložené overenie e-mailu,
- jednorazový overovací odkaz, 24-hodinová expirácia a opätovné odoslanie,
- žiadosť o obnovu hesla,
- nastavenie nového hesla,
- serverová validácia a prístupné chybové stavy,
- demo fallback, keď Supabase nie je nakonfigurovaný.

### Projekty a dáta

- zoznam projektov,
- formulár nového projektu,
- serverová kontrola používateľa a vlastníctva,
- atómové vytvorenie projektu cez PostgreSQL RPC,
- načítanie konceptu sekcie,
- serverové autosave s optimistic concurrency cez číslo revízie,
- funkčné pridávanie, mazanie a zoraďovanie hodnôt, dôvodov a bodov programu s autosave,
- opätovné načítanie dynamických položiek z konceptu po refreshi,
- presúvanie opakovaných položiek myšou, dotykom aj klávesnicou s prístupnými oznámeniami,
- výber a ukladanie tematických občianskych ikoniek pre hodnoty, dôvody a program vrátane zobrazenia v náhľade,
- základná databázová schéma a RLS politiky,
- lokálny Supabase stack (Docker) pre vývoj; produkčný cloud projekt `Webprekandidata` (`iozvohajbtzxviytpufp`) s credentials iba vo Vercel a GitHub Secrets,
- migrácie `0001` až `0019` v repozitári; produkčné nasadenie migrácií cez GitHub Actions workflow `Supabase migrations` pri pushi do `main`,
- `.env.local.example` a aktualizovaný `.env.example` pre lokálny vývoj na `127.0.0.1:54321`,
- politika zero prod from Mac: na vývojárskom Macu sa nespúšťa `supabase link` ani `db push` proti produkcii,
- reálna produkčná Supabase konfigurácia vo Vercel env; lokálny `.env.local` smeruje na Docker stack,
- samostatný Brevo SMTP key `WebPreKandidata.sk` vytvorený a bezpečne pripojený k Supabase Auth,
- Brevo SMTP tajné údaje pre kontaktný formulár môžu byť v ignorovanom lokálnom `.env.local`; produkčný Auth SMTP je v Supabase Dashboard,
- doména `webprekandidata.sk` autentifikovaná v Brevo cez overovací TXT a dva DKIM CNAME záznamy vo Websupport DNS,
- odosielateľ `Web pre kandidáta <noreply@webprekandidata.sk>` v Brevo vytvorený a overený,
- existujúci SPF pre Websupport poštu a DMARC politika `p=quarantine` zachované,
- migrácie `0004` a `0005` pre hashované overovacie tokeny, 24-hodinovú expiráciu a server-only vydávanie aplikované,
- TypeScript databázové typy generované z lokálnej schémy (`npm run supabase:types --local`) a použité v oboch Supabase klientoch,
- Supabase CLI 2.113.0 a lokálny `config.toml`,
- súkromný Storage bucket `candidate-media` s vlastníckymi RLS politikami.

### Publikovanie

- kontrola povinného obsahu pred publikovaním a neblokujúce odporúčania pre SEO a hlavnú fotografiu,
- databázové oprávnenie vyžaduje zhodný balík projektu a zaplatenú, neexpirovanú objednávku Basic alebo Plus,
- transakčná RPC vytvorí očíslovaný nemenný snapshot obsahu, témy, SEO, publikovaných článkov a media manifestu a atómovo ho nastaví ako aktuálnu verejnú verziu,
- použité médiá sa pred potvrdením snapshotu kopírujú zo súkromného `candidate-media` do samostatného verejného bucketu `published-media` pod cestu konkrétnej publikácie,
- zlyhané publikovanie odstráni skopírované objekty a ponechá predchádzajúcu verejnú verziu bez zmeny,
- opätovné publikovanie vytvorí novú verziu; zmeny konceptu sa na verejnom webe neprejavia automaticky,
- pozastavenie skryje verejnú cestu bez odstránenia snapshotu a obnovenie znova sprístupní poslednú verziu,
- verejná stránka poskytuje vlastné SEO metadata, canonical adresu, Open Graph obrázok a povolené indexovanie iba pri stave `published`,
- audit log zaznamenáva publikovanie, pozastavenie a obnovenie.

### Interný admin prevádzkovateľa

- oddelený strom `/admin` pre účty s `profiles.role = admin`,
- v demo režime panel nie je dostupný,
- prehľad metrík, používatelia, weby, objednávky, domény, AI použitie (bez promptov) a audit,
- read-only detail webu s náhľadom konceptu,
- administrátorské pozastavenie (`admin_hold`) s povinným dôvodom, kategóriou, rozsahom, trvaním a správou pre kandidáta; zásah je auditovaný,
- manuálne udelenie balíka Basic alebo Plus cez `/admin/weby/[siteId]` (zaplatená objednávka bez expirácie, aktualizácia `plan_code`, audit `admin_plan_granted`),
- kandidát nemôže sám obnoviť web pod aktívnym admin hold,
- migrácia `0011_platform_admin.sql` (GRANT na `audit_logs`, RPC `admin_set_site_hold`, `admin_search_users`, `admin_dashboard_metrics`),
- migrácia `0013_admin_grant_site_plan.sql` (RPC `admin_grant_site_plan`),
- bez moderátorskej fronty, bez reprocess webhookov a bez manuálneho prepisu paid stavu Stripe objednávok.

### Domény a DNS

- Basic aj Plus používajú platformovú adresu `https://{ROOT}/{slug}` (bez wildcard DNS),
- pri vytvorení projektu sa rezervuje záznam `domains` typu subdomain so stavom `active`,
- Plus s zaplatenou objednávkou môže pripojiť jednu vlastnú doménu cez Vercel Domains API,
- editor Doména zobrazuje platformovú URL, DNS inštrukcie, stavy overenia a SSL,
- po pripojení custom domény UI vždy ukáže aspoň smerovací DNS záznam (A/CNAME); prázdne metadáta sa doplnia fallbackom alebo obnovou z Vercel API,
- stav po attachi pri ešte nenastavenom DNS je `verifying` (nie okamžité `failed`),
- editor obsahuje krok-za-krokom návod pre registrátora (Websupport) vrátane varovania o konfliktnom AAAA zázname pri root doméne a o zachovaní e-mailových záznamov,
- serverové akcie pripoja, skontrolujú, odstránia a nastavia hlavnú doménu; zápisy idú cez RPC s Plus entitlementom,
- `proxy.ts` prepisuje aktívny custom hostname na internú cestu `/{slug}`; app cesty na custom hoste idú na platformovú app URL,
- canonical a Open Graph URL preferujú aktívnu primary custom doménu, inak platformovú cestu,
- migrácia `0014_domain_management.sql`,
- demo režim Vercel nevolá; bez `VERCEL_TOKEN` / `VERCEL_PROJECT_ID` produkčné pripojenie custom domény odmietne.
### Kontaktný formulár

- viditeľné polia meno, e-mail, voliteľný telefón a popis,
- prístupné labely, textové chyby, stav odosielania a úspešné potvrdenie,
- serverová Zod validácia, honeypot a limit troch správ za 15 minút pre rovnaký e-mail a web,
- odoslanie je povolené iba pre stav `published` a aktívny `current_publication_id`,
- cieľový e-mail sa vždy načíta zo sekcie Kontakt aktuálneho publikovaného snapshotu; klient ho neposiela ani neurčuje,
- prepínač formulára sa tiež vyhodnocuje z publikovaného snapshotu, takže nepublikovaná zmena neovplyvní verejný web,
- Brevo SMTP doručenie s bezpečným `replyTo` na návštevníka a stavom `pending`, `sent` alebo `failed` v `contact_submissions`,
- telo správy sa uchováva najviac podľa existujúcej 90-dňovej retenčnej lehoty; voliteľný telefón sa použije iba v doručovanom e-maile a ďalej sa neukladá.

### Médiá

- upload JPEG, PNG a WebP do súkromného bucketu `candidate-media`,
- klientská kontrola podpisu súboru, veľkosti a rozmerov,
- prístupný orez s posunom, zoomom a cieľovým pomerom podľa typu obrázka,
- export optimalizovaného WebP bez pôvodných EXIF metadát,
- vlastnícka kontrola cez Storage RLS a serverové overenie objektu pred zápisom metadata,
- synchronizácia aktívneho obrázka v `media_assets`, sidebare a dátovom náhľade,
- časovo obmedzené odkazy pre náhľad súkromných obrázkov,
- migrácia `0008_candidate_media_formats.sql` odstraňuje SVG z povolených formátov bucketu a nových metadata záznamov bez porušenia prípadných starších dát.
- samostatná sekcia Galéria s viacnásobným nahrávaním, automatickým zmenšením na maximálne 1920 × 1440 px a exportom WebP,
- najviac 12 fotografií a spoločný 15 MiB limit aktívnych médií projektu kontrolovaný v klientovi aj na serveri,
- titulky do 160 znakov, mazanie a uložené poradie cez vlastnícky chránenú databázovú RPC,
- galéria v dátovom náhľade webu s desktopovým aj mobilným rozložením a lightboxom ovládateľným myšou aj klávesnicou.
- titulný obrázok článku so serverovým overením WebP, vlastníctva a spoločného 15 MiB limitu projektu.
- voliteľná textová politická príslušnosť / podpora v Základných údajoch (`politicalAffiliation`); zobrazuje sa decentne v hero sekcii, nie ako logo,
- staršie `party_logo` médiá sa už nenahrávajú ani nezobrazujú; DB constraint z `0018_party_logo_media.sql` ostáva kvôli spätnej kompatibilite.

### Aktuality a AI články

- vlastnícky chránené vytváranie, načítanie a soft-delete článkov,
- optimistická revízia zabraňujúca tichému prepísaniu súbežnej zmeny,
- publikované články sa v náhľade načítajú z databázy vrátane podpísaného titulného obrázka,
- Basic má celý manuálny editor; AI je viazaná na reálne zaplatenú Plus objednávku,
- databázová rezervácia kvóty odolná voči súbežným požiadavkám,
- minimalizovaný AI audit bez uloženia promptu a odpovede, `store: false` a pseudonymizovaný bezpečnostný identifikátor.
- ručný testovací / admin grant balíka sa eviduje ako zaplatená objednávka bez expirácie aj ako auditovaná operácia (`admin_grant_site_plan`); produkčné odomknutie prebieha cez Stripe fulfillment.

### Stripe Checkout a objednávky

- výber Basic 49,99 € / Plus 89,99 € ako konečných cien na stránke Publikovanie,
- fakturačné údaje kupujúceho a súhlas pred Checkoutom,
- server vytvorí pending `orders`, reálneho Stripe Customer s fakturačnou adresou a Stripe Checkout Session,
- jednorazový Checkout používa post-purchase invoice; po úspešnej platbe Stripe automaticky vytvorí paid Invoice s voliteľným zákazníckym IČO a dodávateľským footerom bez výpočtu DPH,
- podpísaný webhook `/api/webhooks/stripe` idempotentne splní objednávku a nastaví `sites.plan_code`,
- samostatný `invoice.paid` webhook idempotentne uloží Invoice ID, PDF URL a Hosted Invoice URL bez vplyvu na aktiváciu balíka,
- návrat do aplikácie obnoví Publikovanie; aktivácia balíka čaká na webhook,
- história objednávok na stránke Publikovanie (vlastník cez RLS),
- demo režim platbu neponúka,
- migrácia `0012_stripe_fulfillment.sql` (`fulfill_stripe_checkout`, `mark_checkout_session_status`) a append-only migrácia `0017_stripe_invoices.sql` (`record_stripe_invoice` a nullable invoice referencie).

### Overenie

- 99 jednotkových testov,
- TypeScript bez chýb,
- ESLint bez chýb a varovaní,
- úspešný produkčný build,
- cloudový REST smoke test potvrdil dostupnosť API a anonymnú izoláciu tabuľky `sites`,
- verejné Auth nastavenia potvrdili zapnutú registráciu a okamžité vytvorenie relácie,
- všetky tri verejné šablóny vizuálne overené pri šírkach 375, 768, 1024 a 1440 px,
- pri každej šablóne a overenej šírke potvrdené nulové horizontálne pretečenie.
- nové kampanové stránky vizuálne overené v Chromium pri šírkach 375, 768, 1024 a 1440 px bez viditeľného horizontálneho pretečenia.

### Produkčná prevádzka

- Vercel projekt `beewoy/webprekandidata` je vytvorený, linkovaný, používa Next.js preset a Node.js 24,
- apex `webprekandidata.sk` a `www.webprekandidata.sk` sú pridané do Vercel projektu; DNS ešte musí byť zosúladené vo Websupporte,
- produkčné Supabase, Brevo a AI premenné sú nastavené vo Verceli; demo režim je vypnutý,
- Supabase Auth Site URL je `https://webprekandidata.sk`, produkčné callbacky sú povolené a limit Auth e-mailov je 10 za hodinu,
- bezpečnostné HTTP hlavičky vrátane CSP, frame protection, nosniff, Referrer Policy a HSTS sú nakonfigurované,
- Sentry SDK je zapojené pre client, server aj edge runtime bez odosielania predvolených PII; začne odosielať až po nastavení DSN,
- globálna chybová obrazovka obnovuje celú stránku a pri dostupnom Next.js digest zobrazí bezpečný referenčný kód; Sentry záznam zachová digest, cestu a pôvodnú príčinu zlyhaného načítania dashboardu,
- Firebase Analytics je zapojené pre celý web cez GA4 stream `G-0LPPHZCVXB`; SDK sa načíta až po dobrovoľnom súhlase a návštevník môže uloženú voľbu kedykoľvek zmeniť cez nastavenia cookies v pätičke landing page alebo cez dostupné náhradné tlačidlo na ostatných routach,
- denný Vercel Cron volá autorizovaný retenčný endpoint a maže expirované kontaktné a AI záznamy cez service-role RPC,
- checkout sa fail-closed nezapne bez live Stripe secretu, webhook secretu, kompletných údajov predávajúceho a schválených právnych dokumentov.

## Pripravené v UI, ale ešte bez produkčného backendu

- transakčné e-maily (vrátane potvrdenia platby),

## Externé závislosti

Supabase, Brevo, OpenAI a Vercel sú pripojené. AI onboarding bez `OPENAI_API_KEY` naďalej používa označený manuálny fallback. V Stripe live mode existujú Products Basic/Plus so správnymi jednorazovými cenami, ale platený launch zostáva zablokovaný, kým sa doplní:

- live `STRIPE_SECRET_KEY` a produkčný `STRIPE_WEBHOOK_SECRET`,
- kompletné `SELLER_*` údaje a právne schválenie,
- projektový `VERCEL_TOKEN` pre pripájanie Plus custom domén,
- Sentry DSN, org, project a CI auth token.

## Najbližší odporúčaný míľnik

1. Zosúladiť DNS apexu a `www` vo Websupporte podľa Vercelu bez odstránenia poštových záznamov.
2. Doplniť live Stripe secret, webhook secret, `SELLER_*`, právne schválenie, Vercel token a Sentry konfiguráciu.
3. Nasadiť produkciu a end-to-end overiť registráciu, Checkout Basic/Plus, webhook fulfillment, publikovanie a Plus custom doménu.
4. Po úspešnom overení nastaviť `LEGAL_DOCUMENTS_APPROVED=true` a odoslať sitemapu do Search Console.

## Otvorené produktové rozhodnutia

- presný koniec kampane,
- pravidlá predĺženia a cena predĺženia,
- kompletné fakturačné údaje SZČO,
- produkčné právne a retenčné potvrdenie OpenAI spracovania a výber modelu po evaloch,
- monitoring a produktová analytika,
- právne potvrdenie rozsahu pravidiel politickej reklamy.

## Pravidlo aktualizácie

Po každom väčšom míľniku:

1. presunúť hotové položky do sekcie „Hotové“,
2. zapísať známe obmedzenia,
3. upraviť najbližší odporúčaný míľnik,
4. ak sa zmenila architektúra alebo invariant, aktualizovať aj `docs/ARCHITECTURE.md`.
