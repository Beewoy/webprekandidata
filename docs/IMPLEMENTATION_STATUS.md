# Stav implementácie

Aktualizované: 11. august 2026

Tento dokument je operatívny prehľad skutočne implementovaných funkcií. Produktový plán môže obsahovať aj budúci rozsah.

## Hotové

### Základ projektu

- Next.js 16, React 19 a TypeScript,
- vlastný responzívny dizajn systém,
- pracovné logo a brand tokeny,
- demo režim bez externých služieb,
- health endpoint `/api/health`,
- lint, typecheck, test a produkčný build.

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
- výber z troch responzívnych variantov kandidátskej šablóny s prístupnými stavmi a živým náhľadom,
- načítanie a automatické ukladanie vybranej šablóny aj farby do `site_drafts.theme` s ochranou revízie,
- desktopový a mobilný náhľad,
- dátový náhľad celého kandidátskeho webu z aktuálneho `site_drafts` s manuálnym obnovením revízie,
- kompaktný náhľad na prehľade projektu napojený na rovnaký koncept, šablónu, farbu, logo a portrét ako úplný náhľad webu,
- kontaktný formulár nad pätičkou v náhľade verejnej šablóny a prepínač jeho viditeľnosti v sekcii Kontakt,
- balíky Basic 49,99 € a Plus 89,99 € s DPH,
- stránka publikovania číta balík a reálne oprávnenie aktuálneho projektu zo servera: Free účtu zobrazí výber Basic/Plus, aktívnemu Basic/Plus účtu pripravenosť obsahu, stav verejnej verzie a akcie zverejniť, publikovať zmeny, pozastaviť alebo obnoviť,
- verejná kandidátska cesta `/:slug` používa posledný nemenný snapshot; koncept ani automaticky uložené rozpracované zmeny nikdy nečíta,
- verejný web zdieľa sanitizovaný zobrazovací model s náhľadom, pričom články zostávajú v modálnej vrstve bez samostatnej URL a kontaktný formulár sa aktivuje iba vo verejnom režime,
- dvojkrokový uvítací dialóg po registrácii s možnosťou preskočenia,
- editovateľná kontrola prvého návrhu pred vytvorením webu.

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
- cloudový Supabase projekt `Webprekandidata` linkovaný cez CLI,
- migrácie `0001` až `0009` aplikované a cloudová databáza zosynchronizovaná; migrácia `0010_candidate_publications.sql` je pripravená lokálne a čaká na aplikovanie do cloudového projektu,
- reálna verejná Supabase konfigurácia v ignorovanom `.env.local` a vypnutý demo režim,
- cloudové Auth callbacky, okamžitá relácia po registrácii a bezpečnostné limity zosynchronizované z `supabase/config.toml`,
- samostatný Brevo SMTP key `WebPreKandidata.sk` vytvorený a bezpečne pripojený k Supabase Auth,
- Brevo SMTP tajné údaje uložené iba v ignorovanom lokálnom `.env.local`,
- doména `webprekandidata.sk` autentifikovaná v Brevo cez overovací TXT a dva DKIM CNAME záznamy vo Websupport DNS,
- odosielateľ `Web pre kandidáta <noreply@webprekandidata.sk>` v Brevo vytvorený a overený,
- existujúci SPF pre Websupport poštu a DMARC politika `p=quarantine` zachované,
- migrácie `0004` a `0005` pre hashované overovacie tokeny, 24-hodinovú expiráciu a server-only vydávanie aplikované,
- TypeScript databázové typy generované z cloudovej schémy a použité v oboch Supabase klientoch,
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

### Aktuality a AI články

- vlastnícky chránené vytváranie, načítanie a soft-delete článkov,
- optimistická revízia zabraňujúca tichému prepísaniu súbežnej zmeny,
- publikované články sa v náhľade načítajú z databázy vrátane podpísaného titulného obrázka,
- Basic má celý manuálny editor; AI je viazaná na reálne zaplatenú Plus objednávku,
- databázová rezervácia kvóty odolná voči súbežným požiadavkám,
- minimalizovaný AI audit bez uloženia promptu a odpovede, `store: false` a pseudonymizovaný bezpečnostný identifikátor.
- ručný testovací grant balíka sa eviduje ako zaplatená objednávka bez expirácie aj ako auditovaná operácia; produkčné odomknutie neskôr prevezme Stripe fulfillment.

### Overenie

- 55 jednotkových testov,
- TypeScript bez chýb,
- ESLint bez chýb a varovaní,
- úspešný produkčný build,
- cloudový REST smoke test potvrdil dostupnosť API a anonymnú izoláciu tabuľky `sites`,
- verejné Auth nastavenia potvrdili zapnutú registráciu a okamžité vytvorenie relácie,
- vizuálne overené desktopové a mobilné toky,
- overené bez horizontálneho pretečenia pri 375 px.

## Pripravené v UI, ale ešte bez produkčného backendu

- správa domény a DNS,
- Stripe Checkout a webhook,
- transakčné e-maily,
- analytika,
- interný admin prevádzkovateľa.

## Externé závislosti

Supabase a Brevo sú pripojené. AI onboarding bez `OPENAI_API_KEY` používa označený manuálny fallback; Plus AI články bez kľúča zobrazia bezpečný chybový stav a neodpočítajú úspešný návrh. Používateľ ešte vytvorí a poskytne konfiguráciu pre:

- Vercel,
- Stripe,
- OpenAI API kľúč, model a samostatný HMAC secret,
- monitoring chýb.

## Najbližší odporúčaný míľnik

1. Aplikovať migráciu `0010_candidate_publications.sql`, obnoviť generované databázové typy a end-to-end overiť prvé publikovanie, opätovné publikovanie, pozastavenie a obnovenie.
2. End-to-end overiť registráciu, doručenie a spotrebovanie overovacieho odkazu proti reálnej databáze.
3. Pripojiť Vercel a nastaviť produkčné Auth redirect URL.

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
