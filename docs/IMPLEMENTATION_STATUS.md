# Stav implementácie

Aktualizované: 23. august 2026

Tento dokument je operatívny prehľad skutočne implementovaných funkcií. Produktový plán môže obsahovať aj budúci rozsah.

## Hotové

### Právny základ (LB-01 / LB-02 čiastočne, LB-09 skelet)

- kompletná identita prevádzkovateľa (meno, adresa, IČO, DIČ, telefón, živnostenský register `110-253321`, neplatiteľ DPH, SOI) v `lib/legal/seller.ts` a na právnych stránkach,
- trvanie Basic/Plus do **31. 12. 2026** (`lib/legal/service-duration.ts`), ukladané do objednávky,
- centrálny `evaluateLegalLaunchGate` pre checkout aj publikovanie,
- migrácia `0025_legal_foundation_and_consumer_checkout.sql`: `legal_document_versions`, `plan_versions`, `legal_audit_events`, `order_legal_acceptances`, polia skorého plnenia/odloženej aktivácie, úprava `fulfill_stripe_checkout`, RPC `activate_deferred_orders`,
- spotrebiteľský checkout: B2C/B2B vyhlásenie, predzmluvný súhrn, tlačidlo „Objednávka s povinnosťou platby“, voliteľné skoré plnenie, odloženie `plan_code` pri B2C bez skorého plnenia,
- denný retention cron zároveň skúša aktivovať odložené objednávky,
- online odstúpenie: `/odstupenie` + magic link `/odstupenie/[token]`, dvojkrokové potvrdenie, Stripe refund (plná suma), odkaz v histórii objednávok, migrácia `0026_withdrawal_and_complaints.sql` (aj tabuľka `complaints` pripravená).

### Základ projektu

- Next.js 16, React 19 a TypeScript,
- vlastný responzívny dizajn systém,
- pracovné logo a brand tokeny,
- demo režim bez externých služieb,
- health endpoint `/api/health`,
- lint, typecheck, test a produkčný build.

### Marketingová landing page

- samostatná responzívna landing page pre slovenských kandidátov v komunálnych a župných voľbách 2026, implementovaná ako indexovateľný React Server Component s malými klientskými ostrovmi,
- SEO a konverzný obsah pre frázy „web pre kandidáta“, „volebný web“ a súvisiace typy kandidatúry,
- canonical, Open Graph a Twitter metadata bez odkazov na neexistujúce obrázky,
- JSON-LD pre organizáciu, webovú aplikáciu, ponuky Basic/Plus a viditeľné FAQ,
- hlavné výzvy smerujú priamo na registráciu a presne oddeľujú bezplatný súkromný náhľad od platenej publikácie,
- samostatný SEO audit s odporúčaniami pre obsah, meranie a ostré nasadenie,
- landing je integrovaný do Next.js rootu `/`, používa spoločný statický Open Graph obrázok 1536 × 1024 px, favicon, `robots.txt`, sitemapu a funkčné odkazy na právne routy,
- redizajnovaný root používa výraznú typografickú hero kompozíciu, stabilný trojkrokový proces s obsahom viditeľným bez interakcie a asymetrickú sekciu budúcich používateľských referencií; dočasné citáty sú výslovne označené ako ilustračný obsah a pred spustením ich majú nahradiť overené skúsenosti z pilotnej prevádzky; navy/teal/Inter systém, 44 px dotykové ciele a focus stavy zostávajú zachované,
- produktový príbeh používa na desktope natívny CSS sticky text, ktorý zostáva pri obsahu až po poslednú kartu; GSAP ScrollTrigger iba jemne škáluje vizuály pri rolovaní a pri `prefers-reduced-motion` sa animácie nevykonajú,
- hero na root landing page zobrazuje kompaktný odpočet celých kalendárnych dní do volieb 24. októbra 2026, obnovovaný cez hodinové ISR; v deň volieb použije neutrálny text a po termíne sa skryje,
- root landing page obsahuje responzívnu inline MP4 ukážku administrácie s posterom, natívnymi ovládacími prvkami, prístupným zväčšením vo focus-trap modálnom dialógu a priamym CTA na hotový ukážkový web cez verejnú cestu `/ukazka`,
- hero aj výsledná karta produktového príbehu používajú reálny mobilný náhľad kandidátskeho webu; výsledná karta ho kombinuje s desktopovým náhľadom toho istého webu,
- landing page kompaktne predstavuje všetky štyri dostupné šablóny cez živý náhľad hero layoutu (rovnaký `CampaignTemplatePreview` ako v editore, s demo portrétom a logom); karty otvárajú verejné ukážky `/ukazka/horizont`, `/ukazka/impulz`, `/ukazka/dovera` a `/ukazka/vizia`, spodné CTA vedie na prehľad `/sablony`,
- päť samostatných indexovateľných kampanových stránok pre starostu, primátora, poslanca, komunálne voľby 2026 a spoločnú kandidatúru na predsedu kraja alebo poslanca VÚC; stránky zdieľajú responzívny marketingový komponent, ceny, interné prepojenia, metadata a JSON-LD,
- sezónne stránky uvádzajú oficiálny termín komunálnych a krajských volieb 24. októbra 2026 a prístupný živý odpočet s bezpečným stavom po volebnom dni,
- právne routy sú implementované ako pracovné znenie; obchodné podmienky pokrývajú reálny bezplatný náhľad, balíky, Stripe platbu, publikovanie, vlastnú doménu, AI a spotrebiteľské práva, samostatný reklamačný poriadok upravuje oznámenie vady, lehoty, spôsoby vybavenia a ARS, pričom dokumenty zostávajú `noindex`, kým právnik nepotvrdí obsah a produkcia nenastaví `LEGAL_DOCUMENTS_APPROVED=true`.

### Dashboard kandidáta

- responzívny app shell a mobilný drawer,
- viditeľný aktívny balík Free, Basic alebo Plus v sidebare, mobilnej hlavičke, prehľade webu a zozname projektov; nový web má predvolene Free,
- prehľad projektu a stav dokončenia odvodený z aktuálne uloženého konceptu,
- 15 navigačných sekcií vrátane samostatnej Galérie a Objednávok,
- obsahové formuláre,
- prístupný WYSIWYG editor pre dlhý text „O mne“ a voliteľné podrobné popisy bodov programu s manuálnym uložením a serverovou sanitizáciou,
- UI pre vzhľad, obrázky, aktuality, SEO, doménu, objednávky a publikovanie,
- plnohodnotný zoznam aktualít a editor článku pre Basic aj Plus: koncept, zverejnenie, skrytie, mazanie, krátky popis, TipTap obsah a titulný obrázok,
- verejný model aktualít bez samostatných URL: karty v náhľade otvárajú detail v modálnej vrstve bez zmeny adresy,
- Plus AI návrh článku z podkladov kandidáta s kvótou 20 návrhov na projekt; návrh sa iba vloží do editora a nikdy sa automaticky neuloží ani nezverejní,
- výber zo štyroch responzívnych celostránkových šablón s prístupnými stavmi a živým náhľadom: občiansko-editoriálny Horizont, dynamický Impulz, reprezentatívna Dôvera a portrétovo orientovaná Vízia,
- samostatná ukážková cesta `/app/web/demo` a jej verejný alias `/ukazka` prezentujú vyplnený kandidátsky web v šablóne Horizont; rovnaký obsah je dostupný aj ako `/ukazka/horizont`, `/ukazka/impulz`, `/ukazka/dovera` a `/ukazka/vizia` so zmenenou šablónou, platformovým prepínačom a odkazom na `/sablony`,
- indexovateľná podstránka `/sablony` uvádza základné porovnanie štyroch šablón a prekliky do verejných ukážok,
- verejné šablóny používajú spoločný 1200 px obsahový kontajner, verejnú typografickú mierku, responzívne menu a lokálne načítanú serifovú display typografiu pre Dôveru,
- načítanie a manuálne ukladanie vybranej šablóny aj farby do `site_drafts.theme` s ochranou revízie a varovaním pred odchodom pri neuložených zmenách,
- desktopový a mobilný náhľad,
- dátový náhľad celého kandidátskeho webu z aktuálneho `site_drafts` s manuálnym obnovením revízie,
- kompaktný náhľad na prehľade projektu napojený na rovnaký koncept, šablónu, farbu, znak kampane a portrét ako úplný náhľad webu,
- kontaktný e-mail (mailto) nad pätičkou v náhľade verejnej šablóny; hosted kontaktný formulár je dočasne vypnutý (`HOSTED_CONTACT_FORM_ENABLED=false`) do DPA/privacy gate,
- balíky Basic 49,99 € a Plus 89,99 € ako konečné jednorazové ceny,
- názvy, ceny, opisy a zahrnuté funkcie balíkov majú jeden zdroj pravdy v `lib/payments/plans.ts`; root landing, kampanové SEO stránky, Objednávky aj Publikovanie používajú rovnaké produktové údaje,
- zverejňovací tok je rozdelený na samostatné routy: `objednavky` pre balík, platbu a doklady a `publikovanie` pre pripravenosť, stav verejnej verzie a akcie zverejniť, publikovať zmeny, pozastaviť alebo obnoviť,
- verejná kandidátska cesta `/:slug` používa posledný nemenný snapshot; koncept ani neuložené rozpracované zmeny nikdy nečíta,
- verejný web zdieľa sanitizovaný zobrazovací model s náhľadom, pričom články zostávajú v modálnej vrstve bez samostatnej URL; kontakt je cez mailto, kým sa znova nezapne hosted formulár,
- dvojkrokový uvítací dialóg po registrácii s možnosťou preskočenia,
- editovateľná kontrola prvého návrhu pred vytvorením webu,
- dialóg Pomoc a podpora v sidebare editora s telefónom +421 948 473 255 a formulárom, ktorý cez Brevo SMTP pošle správu na podporné e-maily.

### Spätná väzba (pilot)

- verejný formulár `/spatna-vazba` (noindex): dve hviezdičkové hodnotenia, voliteľné chips, komentár a voliteľný e-mail,
- ukladanie do `feedback_submissions`, e-mailová notifikácia podpore a admin prehľad `/admin/spatna-vazba`,
- migrácia `0033_site_feedback.sql` (rezervácia slug `spatna-vazba`, rate limit 2 odoslania / 24 h na IP fingerprint),
- pri prihlásenom používateľovi s jedným webom sa odpoveď automaticky prepojí na `user_id` a `site_id`.

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
- banner „Overte svoj e-mail“ s tlačidlom Poslať znova na zozname projektov aj v editore webu, kým nie je e-mail overený,
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
- pri vytvorení projektu sa do konceptu Kontakt predvyplní e-mail z registrácie (`0028`); kandidát ho môže kedykoľvek zmeniť,
- načítanie konceptu sekcie,
- serverové manuálne uloženie konceptu s optimistic concurrency cez číslo revízie,
- po `revision_conflict` server vráti aktuálnu revíziu bez RAISE (`0022` JSON), DB cooldown sa commitne a UI vypne ukladanie do obnovenia stránky (`0020`–`0022`, `lib/draft-save-guard.ts`),
- funkčné pridávanie, mazanie a zoraďovanie hodnôt, dôvodov a bodov programu s manuálnym uložením a dirty-guard pri navigácii,
- opätovné načítanie dynamických položiek z konceptu po refreshi,
- presúvanie opakovaných položiek myšou, dotykom aj klávesnicou s prístupnými oznámeniami,
- výber a ukladanie tematických občianskych ikoniek pre hodnoty, dôvody a program vrátane zobrazenia v náhľade,
- základná databázová schéma a RLS politiky,
- lokálny Supabase stack (Docker) pre vývoj; produkčný cloud projekt `Webprekandidata` (`iozvohajbtzxviytpufp`) s credentials iba vo Vercel a GitHub Secrets,
- migrácie `0001` až `0032` v repozitári; produkčné nasadenie migrácií cez GitHub Actions workflow `Supabase migrations` pri pushi do `main`,
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
- verejná stránka poskytuje vlastné SEO metadata, canonical adresu, Open Graph aj Twitter obrázok a povolené indexovanie iba pri stave `published`; vlastný publikovaný sociálny obrázok má prednosť, inak sa použije spoločný značkový vizuál platformy,
- audit log zaznamenáva publikovanie, pozastavenie a obnovenie.

### Vlastný web kandidáta a politická reklama

- produkt je vedený ako samoobslužný editor a hosting vlastného webu kandidáta, nie ako platené umiestňovanie, propagácia alebo cielená distribúcia konkrétnych politických správ,
- platforma preto nevyžaduje politicko-reklamný profil sponzora, verejné označenie, transparentný snapshot ani napojenie na európske úložisko,
- WebPreKandidata.sk neposkytuje platený dosah, boosting ani personalizované cielenie; ak sa produkt o takú službu rozšíri, rozsah nariadenia (EÚ) 2024/900 sa musí pred implementáciou znovu posúdiť,
- AI zostáva návrhovým nástrojom: kandidát text kontroluje a publikuje sám.

### Interný admin prevádzkovateľa

- oddelený strom `/admin` pre účty s `profiles.role = admin`,
- v demo režime panel nie je dostupný,
- prehľad metrík, používatelia, weby, objednávky, domény, AI použitie (bez promptov) a audit,
- read-only detail webu s náhľadom konceptu,
- administrátorské pozastavenie (`admin_hold`) s povinným dôvodom, kategóriou, rozsahom, trvaním a správou pre kandidáta; zásah je auditovaný,
- manuálne udelenie balíka Basic alebo Plus cez `/admin/weby/[siteId]` (zaplatená objednávka bez platby / `total_cents = 0`, `buyer_snapshot.source = admin_grant`, aktualizácia `plan_code`, audit `admin_plan_granted`); v Objednávkach sa zobrazí ako „Pridelené administrátorom“ bez odstúpenia od zmluvy,
- kandidát nemôže sám obnoviť web pod aktívnym admin hold,
- migrácia `0011_platform_admin.sql` (GRANT na `audit_logs`, RPC `admin_set_site_hold`, `admin_search_users`, `admin_dashboard_metrics`),
- migrácia `0013_admin_grant_site_plan.sql` (RPC `admin_grant_site_plan`),
- migrácia `0027_fix_admin_grant_order_number_ambiguity.sql` (oprava nejednoznačného `order_number` v RPC, ktoré blokovalo manuálne udelenie balíka),
- migrácia `0029_admin_grant_zero_amount.sql` (admin grant ukladá `total_cents = 0`),
- migrácia `0030_reserve_template_preview_slugs.sql` rezervuje platformové cesty `ukazka` a `sablony`,
- migrácia `0031_admin_grant_total_cents_zero_check.sql` (CHECK na `orders.total_cents` povoľuje aj `0` pre admin grant),
- bez moderátorskej fronty, bez reprocess webhookov a bez manuálneho prepisu paid stavu Stripe objednávok.

### Domény a DNS

- Basic aj Plus používajú platformovú adresu `https://{ROOT}/{slug}` (bez wildcard DNS),
- pri vytvorení projektu sa rezervuje záznam `domains` typu subdomain so stavom `active`,
- Plus s zaplatenou objednávkou môže pripojiť jednu vlastnú doménu cez Vercel Domains API,
- editor Doména zobrazuje platformovú URL, umožňuje zmeniť slug platformovej cesty (`update_site_slug`), DNS inštrukcie, stavy overenia a SSL,
- po pripojení custom domény UI vždy ukáže aspoň smerovací DNS záznam (A/CNAME); prázdne metadáta sa doplnia fallbackom alebo obnovou z Vercel API,
- stav po attachi pri ešte nenastavenom DNS je `verifying` (nie okamžité `failed`),
- editor obsahuje krok-za-krokom návod pre registrátora (Websupport) vrátane varovania o konfliktnom AAAA zázname pri root doméne a o zachovaní e-mailových záznamov,
- serverové akcie pripoja, skontrolujú, odstránia a nastavia hlavnú doménu; zápisy idú cez RPC s Plus entitlementom,
- `proxy.ts` prepisuje aktívny custom hostname na internú cestu `/{slug}`; app cesty na custom hoste idú na platformovú app URL,
- canonical a Open Graph URL preferujú aktívnu primary custom doménu, inak platformovú cestu,
- migrácia `0014_domain_management.sql`,
- migrácia `0032_update_site_slug.sql` (RPC `update_site_slug` — zmena platformovej cesty; stará adresa nepresmerováva),
- demo režim Vercel nevolá; bez `VERCEL_TOKEN` / `VERCEL_PROJECT_ID` produkčné pripojenie custom domény odmietne.
### Kontakt (dočasne mailto)

- hosted kontaktný formulár je dočasne vypnutý prepínačom `HOSTED_CONTACT_FORM_ENABLED` v `lib/contact-form.ts`,
- verejný web zobrazuje zvýraznený mailto odkaz na e-mail zo sekcie Kontakt (povinný pred publikovaním),
- kód formulára, Brevo doručenie a `contact_submissions` ostávajú v repozitári pre neskoršie znovuzapnutie po DPA/privacy gate,
- serverová akcia `submitContactForm` pri vypnutom režime odmietne odoslanie.

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
- ručný testovací / admin grant balíka sa eviduje ako objednávka `paid` s `total_cents = 0` a `buyer_snapshot.source = admin_grant` (bez Stripe platby a bez odstúpenia) aj ako auditovaná operácia (`admin_grant_site_plan`); produkčné odomknutie prebieha cez Stripe fulfillment.

### Stripe Checkout a objednávky

- výber Basic 49,99 € / Plus 89,99 € ako konečných cien v samostatnej sekcii Objednávky,
- fakturačné údaje kupujúceho a súhlas pred Checkoutom,
- server vytvorí pending `orders` s ľudsky čitateľným číslom `WPK-YYYY-NNNNN` (`order_number`), reálneho Stripe Customer s fakturačnou adresou a Stripe Checkout Session,
- jednorazový Checkout používa post-purchase invoice; po úspešnej platbe Stripe automaticky vytvorí paid Invoice s číslom objednávky, voliteľným zákazníckym IČO a dodávateľským footerom bez výpočtu DPH,
- podpísaný webhook `/api/webhooks/stripe` idempotentne splní objednávku a nastaví `sites.plan_code`,
- po prvom (neidempotentnom) fulfill pošle Brevo potvrdenie objednávky; pri admin grante ide samostatný e-mail o pridelení balíka (0 €, bez dokladu); `confirmation_email_sent_at` bráni duplicite; zlyhanie e-mailu nevracia Stripe webhook na retry,
- samostatný `invoice.paid` webhook idempotentne uloží Invoice ID, PDF URL a Hosted Invoice URL bez vplyvu na aktiváciu balíka,
- návrat do aplikácie obnoví sekciu Objednávky; aktivácia balíka čaká na webhook,
- história objednávok v sekcii Objednávky a v `/admin/objednavky` zobrazuje číslo a odkaz na doklad (vlastník cez RLS),
- demo režim platbu neponúka,
- migrácie `0012_stripe_fulfillment.sql`, `0017_stripe_invoices.sql` a `0024_order_numbers_and_confirmation.sql`.

### Overenie

- 147 jednotkových testov,
- TypeScript bez chýb,
- ESLint bez chýb a varovaní,
- úspešný produkčný build,
- cloudový REST smoke test potvrdil dostupnosť API a anonymnú izoláciu tabuľky `sites`,
- verejné Auth nastavenia potvrdili zapnutú registráciu a okamžité vytvorenie relácie,
- všetky štyri verejné šablóny vizuálne overené pri šírkach 375, 768, 1024 a 1440 px,
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

- (žiadne aktuálne položky — potvrdenie platby e-mailom je napojené cez Brevo po fulfill)

## Externé závislosti

Supabase, Brevo, OpenAI a Vercel sú pripojené. AI onboarding bez `OPENAI_API_KEY` naďalej používa označený manuálny fallback. V Stripe live mode existujú Products Basic/Plus so správnymi jednorazovými cenami, ale platený launch zostáva zablokovaný, kým sa doplní:

- live `STRIPE_SECRET_KEY` a produkčný `STRIPE_WEBHOOK_SECRET`,
- kompletné `SELLER_*` údaje a právne schválenie,
- projektový `VERCEL_TOKEN` pre pripájanie Plus custom domén,
- Sentry DSN, org, project a CI auth token.

## Najbližší odporúčaný míľnik

1. Zosúladiť DNS apexu a `www` vo Websupporte podľa Vercelu bez odstránenia poštových záznamov.
2. Doplniť live Stripe secret, webhook secret, `SELLER_*`, právne schválenie, Vercel token a Sentry konfiguráciu.
3. End-to-end overiť registráciu, Checkout Basic/Plus, webhook fulfillment, publikovanie a Plus custom doménu.
4. Po úspešnom overení nastaviť `LEGAL_DOCUMENTS_APPROVED=true` a odoslať sitemapu do Search Console.

## Otvorené produktové rozhodnutia

- presný koniec kampane,
- pravidlá predĺženia a cena predĺženia,
- kompletné fakturačné údaje SZČO,
- produkčné právne a retenčné potvrdenie OpenAI spracovania a výber modelu po evaloch,
- monitoring a produktová analytika,
- opätovné právne posúdenie politickej reklamy iba pred pridaním plateného dosahu, boostingu, cielenia alebo publikovania kampane vo vlastných kanáloch platformy.

## Pravidlo aktualizácie

Po každom väčšom míľniku:

1. presunúť hotové položky do sekcie „Hotové“,
2. zapísať známe obmedzenia,
3. upraviť najbližší odporúčaný míľnik,
4. ak sa zmenila architektúra alebo invariant, aktualizovať aj `docs/ARCHITECTURE.md`.
