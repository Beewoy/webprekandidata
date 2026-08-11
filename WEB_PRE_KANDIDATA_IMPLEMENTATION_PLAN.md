# WebPreKandidata.sk — kompletný implementačný návrh

> Pracovný návrh produktového jadra aplikácie. Landing page nie je súčasťou tohto dokumentu a bude riešená samostatne.

> Skutočný aktuálny stav implementácie je vedený v [docs/IMPLEMENTATION_STATUS.md](docs/IMPLEMENTATION_STATUS.md) a technická architektúra v [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## 1. Výsledok, ktorý ideme vytvoriť

WebPreKandidata.sk bude self-service aplikácia, v ktorej si kandidát bez technických znalostí:

1. vytvorí účet a projekt volebného webu,
2. doplní údaje o sebe a kandidatúre,
3. s pomocou AI pripraví texty,
4. vyberie vzhľad a nahrá fotografie,
5. priebežne vidí presný náhľad výsledného webu,
6. zaplatí za publikovanie,
7. zverejní web na subdoméne,
8. počas kampane obsah ďalej upravuje a publikuje nové verzie.

Produkt nebude voľný drag-and-drop builder. Platforma kontroluje štruktúru, kvalitu, responzivitu a technické fungovanie. Kandidát upravuje obsah, fotografie, farbu a obmedzený vizuálny variant.

## 2. Potvrdené produktové rozhodnutia

- Najskôr implementujeme aplikáciu a dashboard kandidáta.
- Landing page sa bude riešiť neskôr ako samostatná časť.
- Používateľ musí dostať kvalitný súkromný náhľad ešte pred zaplatením.
- Verejné publikovanie sa odomkne až po úspešnej platbe.
- MVP bude mať jednu kvalitnú šablónu s niekoľkými kontrolovanými variantmi.
- Produkt bude mať dva balíky: Basic za 49,99 € s DPH a Plus za 89,99 € s DPH.
- Každý publikovaný web dostane subdoménu `slug.webprekandidata.sk`.
- Plus obsahuje pripojenie vlastnej domény, AI pomoc s aktualitami a prioritnú podporu.
- Kontaktný formulár a aktuality budú súčasťou prvého release.
- Podporované sociálne siete v prvom release sú Facebook a Instagram.
- Prevádzkovateľom a predávajúcim bude SZČO Ing. Tibor Antal; kompletné fakturačné identifikátory sa doplnia pred produkciou.
- Dátum konca kampane a pravidlá predĺženia zatiaľ nie sú určené a nesmú byť natvrdo zapísané v kóde.
- Referenčné screenshoty určujú funkčné oblasti a základnú informačnú architektúru. Nebudeme kopírovať branding, texty ani vizuálne detaily Volebka.sk.

## 3. Používatelia a roly

### 3.1 Návštevník kandidátskeho webu

- prezerá verejný web kandidáta,
- otvorí program, kontakty a sociálne siete,
- môže zdieľať stránku,
- nemá prístup do editora.

### 3.2 Kandidát

- vlastní jeden alebo viac projektov,
- upravuje iba svoje weby,
- generuje a schvaľuje AI návrhy,
- nahráva médiá,
- platí a publikuje web,
- spravuje svoj účet a objednávky.

### 3.3 Prevádzkovateľ platformy

- vidí používateľov, projekty, stav publikovania a platby,
- môže riešiť podporu, blokovanie zneužitia a technické incidenty,
- nemá bežne meniť politický obsah kandidáta bez jeho vedomia,
- všetky citlivé administrátorské operácie sa auditujú.

### 3.4 Budúca rola spolupracovníka

Tímové roly nie sú súčasťou MVP. Dátový model však nesmie zabrániť neskoršiemu pridaniu editora alebo správcu kampane.

## 4. Rozsah produktu

### 4.1 P0 — implementovať v prvom predajnom MVP

- registrácia, prihlásenie, overenie e-mailu a obnova hesla,
- zoznam projektov a vytvorenie nového webu,
- dashboard projektu s postupom dokončenia,
- základné údaje kandidáta,
- kontaktné údaje, Facebook, Instagram a verejný kontaktný formulár,
- obsah úvodnej sekcie,
- sekcia „O mne“ vrátane hodnôt,
- dôvody kandidatúry,
- volebný program a zoradené body programu,
- výber farby a kontrolovaného variantu šablóny,
- upload, orez a optimalizácia fotografií,
- SEO titulok, popis a náhľad zdieľania,
- AI interview a pomoc s textami,
- aktuality a základný editor článkov,
- AI pomoc s článkami pre balík Plus,
- automatické ukladanie konceptu,
- presný mobilný a desktopový náhľad,
- oddelenie konceptu od publikovanej verzie,
- checkout, webhook a evidencia objednávky,
- publikovanie na subdoméne,
- pripojenie existujúcej vlastnej domény pre balík Plus,
- transakčné e-maily,
- základný interný admin,
- audit, monitoring, zálohy a bezpečnostné limity.

### 4.2 P1 — pripraviť dátovo, aktivovať po pilotnom overení

- jednoduchá návštevnosť,
- generovanie QR kódu,
- automatický Open Graph obrázok,
- ďalšie šablóny,
- export textov pre sociálne siete,
- obnova alebo predĺženie kampane,
- spolupracovníci a roly.

### 4.3 Balíky a ceny

#### Basic — 49,99 € s DPH

- verejný web na subdoméne `slug.webprekandidata.sk`,
- všetky základné obsahové sekcie a editor,
- AI pomoc pri prvotnom obsahu kandidátskeho webu,
- správa aktualít bez AI generovania článkov,
- kontaktný formulár,
- základné SEO a zdieľanie,
- hosting počas dohodnutého obdobia kampane,
- štandardná e-mailová podpora.

#### Plus — 89,99 € s DPH

- všetko z balíka Basic,
- pripojenie jednej existujúcej vlastnej domény,
- AI pomoc s tvorbou článkov,
- prioritná e-mailová podpora.

Registrácia novej domény nie je automaticky zahrnutá v cene Plus. Kandidát môže vlastniť doménu a platforma ju pripojí. Registráciu domény za kandidáta možno neskôr ponúknuť ako samostatný doplnok po overení nákladov a procesu.

Obe ceny sa v rozhraní uvádzajú ako ceny s DPH. Pred ostrým predajom treba potvrdiť daňové postavenie predávajúceho a správne fakturačné znenie.

### 4.4 Zatiaľ neimplementovať

- voľný drag-and-drop editor,
- newsletter a hromadné kampane,
- CRM voličov,
- automatické publikovanie na sociálne siete,
- prijímanie politických darov,
- pokročilé A/B testovanie,
- natívna mobilná aplikácia,
- plnohodnotný doménový registrátor.

## 5. Informačná architektúra aplikácie

### 5.1 Autentifikácia

- `/prihlasenie`
- `/registracia`
- `/overenie-emailu`
- `/zabudnute-heslo`
- `/obnova-hesla`

### 5.2 Aplikácia kandidáta

- `/app` — zoznam webov alebo presmerovanie na posledný projekt,
- `/app/novy-web` — založenie projektu,
- `/app/web/[siteId]` — prehľad a checklist,
- `/app/web/[siteId]/zakladne-udaje`,
- `/app/web/[siteId]/kontakt`,
- `/app/web/[siteId]/uvod`,
- `/app/web/[siteId]/o-mne`,
- `/app/web/[siteId]/preco-kandidujem`,
- `/app/web/[siteId]/program`,
- `/app/web/[siteId]/vzhlad`,
- `/app/web/[siteId]/obrazky`,
- `/app/web/[siteId]/seo`,
- `/app/web/[siteId]/aktuality`,
- `/app/web/[siteId]/aktuality/[postId]`,
- `/app/web/[siteId]/domena`,
- `/app/web/[siteId]/nahlad`,
- `/app/web/[siteId]/publikovanie`,
- `/app/ucet`.

P1 cesty:

- `/app/web/[siteId]/analytika`.

### 5.3 Interný admin prevádzkovateľa

- `/admin` — základné metriky a incidenty,
- `/admin/pouzivatelia`,
- `/admin/weby`,
- `/admin/objednavky`,
- `/admin/domeny`,
- `/admin/ai-pouzitie`,
- `/admin/audit`.

### 5.4 Verejné weby

Verejný obsah sa nebude riešiť samostatným deployom pre každého kandidáta. Jeden multi-tenant projekt vyberie publikovanú verziu podľa hostname:

- `jan-novak.webprekandidata.sk`,
- pri balíku Plus aj `jannovak.sk`.

## 6. UX koncept dashboardu

### 6.1 Desktop

- pevný ľavý sidebar s hlavným stavom projektu,
- horná lišta s názvom projektu, stavom uloženia a tlačidlom Náhľad,
- obsahový panel pre konkrétnu sekciu,
- na širokých obrazovkách voliteľný živý náhľad napravo,
- samostatný celoobrazovkový náhľad pre detailnú kontrolu,
- publikovanie dostupné ako výrazná, ale nie rušivá akcia.

### 6.2 Mobil

- sidebar sa zmení na navigačný drawer,
- formulár bude vždy jednosĺpcový,
- náhľad sa otvorí na samostatnej obrazovke,
- hlavné akcie budú mať minimálne 44 × 44 px,
- žiadny horizontálny scroll,
- dlhé zoznamy programu sa budú skladať do kariet.

### 6.3 Stav dokončenia

Každá sekcia bude mať stav:

- nezačaté,
- rozpracované,
- pripravené,
- vyžaduje opravu.

Dashboard ukáže celkový postup a presne povie, čo ešte bráni publikovaniu. Stav nebude komunikovaný iba farbou; použije sa ikona aj text.

### 6.4 Automatické ukladanie

- zmeny sa uložia po krátkej pauze v písaní a pri opustení poľa,
- používateľ vždy vidí stav „Ukladám“, „Uložené“ alebo „Nepodarilo sa uložiť“,
- pri chybe zostanú lokálne zmeny zachované a zobrazí sa možnosť opakovať uloženie,
- server používa číslo revízie, aby neprepísal novší obsah staršou požiadavkou,
- pred odchodom sa používateľ upozorní iba vtedy, keď naozaj existujú neuložené zmeny.

### 6.5 Formuláre

- každé pole má viditeľný label,
- zložitejšie polia majú trvalú nápovedu,
- validácia sa zobrazí po opustení poľa, nie agresívne pri každom znaku,
- chyba vysvetlí príčinu aj spôsob opravy,
- po hromadnej chybe sa fokus presunie na prvé neplatné pole,
- povinné polia sú jednoznačne označené,
- dĺžkové limity chránia šablónu a zobrazujú počítadlo,
- mazanie položiek podporí krátke „Vrátiť späť“.

### 6.6 Vizuálny smer

- svetlé, pokojné a dôveryhodné rozhranie,
- vlastná identita, nie fialová kópia referencie,
- primárna farba `#163B65`, odlišovací akcent `#0F766E`, svetlé neutrálne povrchy,
- typografia Inter pre celý dashboard,
- minimálne dekoratívne efekty a iba jemné animácie 150–300 ms,
- jednotná sada SVG ikon,
- kontrast textu minimálne WCAG AA,
- kandidátska farba nikdy nemení ovládacie prvky platformy.

Pracovné logo a úplné tokeny sú v [BRAND_GUIDE.md](BRAND_GUIDE.md) a [design-system/webprekandidata/MASTER.md](design-system/webprekandidata/MASTER.md).

## 7. Špecifikácia obrazoviek kandidáta

### 7.1 Prehľad projektu

- názov projektu, kandidát a lokalita,
- stav: koncept, pripravený, čaká na platbu, publikovaný, pozastavený,
- checklist povinných sekcií,
- percento dokončenia,
- adresa náhľadu alebo verejného webu,
- posledná uložená a posledná publikovaná zmena,
- primárna ďalšia odporúčaná akcia.

### 7.2 Základné údaje

- meno a tituly,
- typ kandidatúry,
- obec, mesto alebo región,
- politická príslušnosť alebo nezávislý kandidát, ak sa rozhodneme údaj zobrazovať,
- krátky identifikátor projektu a navrhnutý slug.

### 7.3 Kontakt

- verejný e-mail,
- telefón,
- Facebook a Instagram,
- prepínač viditeľnosti jednotlivých kontaktov,
- validácia a normalizácia URL aj telefónneho čísla,
- zapnutie kontaktného formulára,
- cieľový e-mail pre doručenie správ,
- stav doručenia a ochrana proti spamu.

Kontaktný formulár je súčasťou prvého release. Použije honeypot, rate limiting, serverovú validáciu a podľa reálneho spamu nenápadnú CAPTCHA alternatívu. Správy sa nebudú dlhodobo uchovávať v platforme; po úspešnom doručení zostane iba nevyhnutné technické metadata podľa retenčnej politiky.

### 7.4 Úvod

- hlavný nadpis,
- zvýraznená fráza,
- podnadpis,
- automatický náhľad zalomenia na mobile aj desktope,
- limity dĺžky a návrhy skrátenia pomocou AI.

### 7.5 O mne

- malý nadpis sekcie,
- hlavný nadpis,
- štruktúrovaný text s obmedzeným formátovaním,
- podpis,
- 3–6 hodnôt: ikona, názov, krátky popis,
- AI interview a návrh textu založený výhradne na odpovediach kandidáta.

### 7.6 Prečo kandidujem

- názov sekcie,
- krátky úvod,
- 3–6 dôvodov s ikonou, názvom a vysvetlením,
- možnosť meniť poradie,
- AI návrhy bez vymýšľania faktov alebo sľubov.

### 7.7 Program

- názov a úvodný text,
- zoradené programové priority,
- krátky názov, zhrnutie a voliteľný detail,
- pridanie, zmazanie, zmena poradia a zbalenie položiek,
- obmedzený rich-text editor,
- AI transformácia poznámok na čitateľnú prioritu,
- kontrola príliš všeobecných alebo fakticky nepodložených formulácií ako upozornenie, nie automatická cenzúra.

### 7.8 Vzhľad

- hlavná farba z kontrolovaného výberu a možnosť vlastného odtieňa v bezpečnom rozsahu,
- 2–3 varianty rozloženia tej istej šablóny,
- 2 úrovne zaoblenia,
- 1–2 schválené typografické páry,
- okamžitý náhľad,
- automatická kontrola kontrastu farby.

Voľby musia byť dostatočné na personalizáciu, ale nesmú umožniť rozbitie vizuálu.

### 7.9 Obrázky

- portrét do úvodu,
- fotografia do sekcie „O mne“,
- logo alebo erb, ak má používateľ právo ho použiť,
- obrázok pri zdieľaní,
- náhľad, výmena, odstránenie a orez,
- odporúčané pomery strán a kontrola minimálneho rozlíšenia,
- alt text pre obsahové fotografie.

### 7.10 SEO a zdieľanie

- SEO titulok s počítadlom,
- meta popis s počítadlom,
- editovateľný slug,
- kanonická URL,
- náhľad výsledku vo vyhľadávaní,
- náhľad zdieľania na sociálnych sieťach,
- automatický základ z mena, funkcie a lokality,
- sitemap, robots pravidlá a štruktúrované dáta generované systémom.

Samostatné pole „kľúčové slová“ nebude prioritou; moderné vyhľadávače ho na hodnotenie bežne nepotrebujú a používateľa zbytočne zaťažuje.

### 7.11 Náhľad

- prepínač desktop, tablet a mobil,
- presne rovnaké komponenty ako verejný web,
- viditeľné označenie súkromného náhľadu,
- možnosť prejsť na konkrétnu sekciu editora,
- náhľad pracuje s konceptom, nie s poslednou publikovanou verziou.

### 7.12 Publikovanie

- kontrolný zoznam blokujúcich a odporúčaných položiek,
- porovnanie konceptu s publikovanou verziou,
- stav oprávnenia z objednávky,
- výber a kontrola subdomény,
- checkout pri nezaplatenom projekte,
- publikovanie novej nemennej verzie po zaplatení,
- možnosť web dočasne skryť,
- zmazanie projektu oddelené v nebezpečnej zóne s potvrdením.

### 7.13 Aktuality

- zoznam konceptov a publikovaných článkov,
- nadpis, krátky popis, obsah, titulný obrázok a slug,
- koncept, naplánované, publikované a skryté,
- dátum publikovania a poslednej úpravy,
- SEO metadata odvodené z článku,
- AI pomoc s článkom iba pre balík Plus,
- náhľad článku pred publikovaním.

### 7.14 Môj účet

- meno používateľa,
- prihlasovací e-mail a stav overenia,
- zmena hesla,
- história objednávok a dokladov,
- export osobných údajov a žiadosť o zmazanie účtu,
- odhlásenie zo všetkých zariadení, ak to zvolená autentifikácia podporí.

## 8. Verejná kandidátska šablóna

Prvý template bude obsahovať:

1. navigáciu s menom kandidáta,
2. hero s portrétom, funkciou, lokalitou a hlavnou myšlienkou,
3. sekciu „O mne“ a hodnoty,
4. dôvody kandidatúry,
5. volebný program,
6. najnovšie aktuality a samostatné stránky článkov,
7. kontakty, Facebook, Instagram a kontaktný formulár,
8. pätičku s povinnými informáciami, odkazmi na súkromie a prípadným transparentným označením politickej reklamy.

Vlastnosti šablóny:

- mobile-first,
- serverovo renderovaná a indexovateľná,
- bez závislosti od JavaScriptu pre základné čítanie,
- optimalizované obrázky AVIF/WebP,
- rezervovaný priestor pre médiá bez posúvania layoutu,
- klávesnicová navigácia a skip link,
- rýchle načítanie aj na slabšom mobilnom pripojení,
- jedna zdrojová sada komponentov pre náhľad aj verejný web.

## 9. Technická architektúra

### 9.1 Aplikácia

- Next.js App Router a TypeScript,
- React komponenty zdieľané editorom a verejným webom,
- Tailwind CSS a vlastné design tokeny,
- serverové komponenty ako predvolený režim,
- klientské komponenty iba pre interaktívny editor, upload, náhľad a autosave,
- Server Actions pre interné formulárové mutácie,
- Route Handlers pre Stripe webhooky, externé callbacky a verejné technické endpointy,
- serverová validácia a autorizácia pri každej mutácii.

### 9.2 Dáta a autentifikácia

- Supabase PostgreSQL,
- Supabase Auth so server-side session cookies,
- Supabase Storage pre médiá,
- Row Level Security ako ďalšia ochranná vrstva,
- migračné súbory verzované v repozitári,
- Zod schémy alebo ekvivalent pre validáciu vstupov a JSON dokumentov.

### 9.3 Hosting

- Vercel pre Next.js aplikáciu,
- wildcard DNS a SSL pre `*.webprekandidata.sk`,
- middleware alebo serverová host resolver vrstva priradí hostname k projektu,
- autentifikované app routes nebudú staticky cacheované spolu s používateľskou session,
- publikované snapshoty môžu používať bezpečnú CDN cache a cielenú revalidáciu.

### 9.4 Integrácie

- Stripe Checkout pre platbu,
- e-mailová služba typu Resend alebo Postmark,
- server-side AI provider adaptér,
- monitoring chýb typu Sentry,
- jednoduchý privacy-friendly produktový monitoring bez reklamného trackingu v MVP.

## 10. Dátový model

Odporúčaný prístup je kombinácia relačných prevádzkových tabuliek a verzovaného JSONB dokumentu pre obsah webu. Výhodou je atómové publikovanie, presná zhoda náhľadu s verejnou verziou a jednoduchšie pridávanie sekcií.

### 10.1 `profiles`

- `id` — väzba na používateľa autentifikácie,
- `full_name`,
- `role` — candidate alebo admin,
- `email_verified_at`,
- `created_at`, `updated_at`.

### 10.2 `sites`

- `id`,
- `owner_user_id`,
- `internal_name`,
- `candidate_name`,
- `locality`,
- `slug`,
- `status` — draft, ready, payment_pending, published, suspended, archived,
- `plan_code`,
- `campaign_ends_at`,
- `current_publication_id`,
- `created_at`, `updated_at`, `deleted_at`.

Slug musí byť unikátny, normalizovaný, rezervovať systémové názvy a meniť sa kontrolovaným spôsobom.

### 10.3 `site_drafts`

- `site_id`,
- `content` JSONB,
- `theme` JSONB,
- `seo` JSONB,
- `revision`,
- `validation_state` JSONB,
- `updated_by`, `updated_at`.

`content` obsahuje verziované, typované sekcie: základné údaje, kontakt, hero, about, reasons a program. Schéma dokumentu bude mať vlastné číslo verzie a migračnú funkciu.

### 10.4 `site_publications`

- `id`, `site_id`,
- `version_number`,
- nemenný snapshot `content`, `theme` a `seo`,
- odkazy na použité médiá,
- `published_by`, `published_at`,
- `unpublished_at`.

Publikovaný web nikdy nečíta neuložený koncept priamo.

### 10.5 `media_assets`

- `id`, `site_id`, `owner_user_id`,
- `kind`,
- storage path,
- mime type, veľkosť, rozmery,
- crop metadata,
- alt text,
- spracované varianty,
- `created_at`, `deleted_at`.

### 10.6 `domains`

- `id`, `site_id`,
- `hostname`, `type` — subdomain alebo custom,
- `status`,
- overovacie a SSL metadata,
- `is_primary`,
- `created_at`, `verified_at`.

### 10.7 `orders`

- `id`, `site_id`, `user_id`,
- `status`, `currency`, cena s DPH, základ a daňové údaje,
- `plan_code`,
- `valid_until` ako nullable údaj, kým sa neurčí koniec kampane,
- Stripe customer a checkout session identifikátory,
- fakturačné údaje kupujúceho a predávajúceho ako snapshot,
- `paid_at`, `fulfilled_at`, `created_at`.

### 10.8 `payment_events`

- externé event ID s unikátnym indexom,
- typ udalosti,
- stav spracovania,
- čas prijatia a spracovania,
- bezpečne minimalizovaný payload alebo referencia.

Tabuľka zabezpečí idempotentné spracovanie opakovane doručených webhookov.

### 10.9 `ai_generations`

- `id`, `site_id`, `user_id`,
- typ úlohy,
- model/provider identifikátor,
- stav, spotreba a odhad nákladov,
- HMAC fingerprint bez možnosti spätne získať prompt,
- bezpečnostná kategória iba pri aktivácii ochrany,
- bez trvalého ukladania celého promptu a celého neupraveného výsledku,
- `accepted_at`, `retention_expires_at`, `created_at`.

Prijatý výsledok sa uloží ako bežný obsah do `site_drafts`; odmietnutý výsledok sa neuchováva. Podrobnosti určuje [AI_DATA_RETENTION_POLICY_DRAFT.md](AI_DATA_RETENTION_POLICY_DRAFT.md).

### 10.10 Ďalšie tabuľky

- `audit_logs`,
- `email_deliveries`,
- `contact_submissions` s krátkou retenčnou lehotou a stavom doručenia,
- `posts` pre P0 aktuality,
- `content_reports`, `moderation_cases`, `moderation_actions` a `moderation_appeals`,
- `political_ad_disclosures` po právnom potvrdení presného rozsahu,
- `analytics_daily` pre P1 agregované návštevy,
- `site_members` pre budúce tímové roly.

## 11. Koncept, náhľad a publikovanie

Tok dát bude striktne oddelený:

```text
Editor → autosave → site_drafts → súkromný náhľad
                                  ↓
                          validačná kontrola
                                  ↓
                        platba / platný nárok
                                  ↓
                    site_publications snapshot
                                  ↓
                  verejný web podľa hostname
```

Pravidlá:

- náhľad vždy zobrazuje aktuálny koncept,
- verejný web vždy zobrazuje posledný úspešne publikovaný snapshot,
- chyba pri ukladaní alebo publikovaní nesmie poškodiť verejnú verziu,
- každé publikovanie zvýši číslo verzie,
- návrat na predchádzajúcu verziu je možný vytvorením nového snapshotu zo starej verzie,
- po úprave sa pri projekte zobrazí stav „Máte nepublikované zmeny“.

## 12. AI funkcionalita

### 12.1 Prvý rozsah

- interview o motivácii, skúsenostiach a prioritách,
- prvý návrh textu „O mne“,
- návrh dôvodov kandidatúry,
- premena bodových poznámok na položky programu,
- skrátenie, rozšírenie a zmena tónu,
- jazyková korektúra,
- návrh hero textu a SEO popisu,
- návrh aktuality alebo článku pre balík Plus.

### 12.2 Bezpečný produktový tok

1. kandidát poskytne fakty a poznámky,
2. systém ukáže, aké údaje použije,
3. AI vytvorí označený návrh,
4. kandidát porovná návrh s pôvodným textom,
5. text sa zapíše do konceptu až po explicitnom prijatí,
6. kandidát ho stále môže manuálne upraviť,
7. publikovanie vyžaduje jeho finálne schválenie.

### 12.3 Pravidlá

- AI nesmie dopĺňať biografické fakty, čísla, úspechy ani konkrétne sľuby, ktoré kandidát neposkytol,
- pri chýbajúcom fakte sa opýta alebo nechá jasné miesto na doplnenie,
- citlivé údaje sa neposielajú bez potreby,
- prompt aj výsledok majú veľkostné a frekvenčné limity,
- AI endpoint je iba serverový,
- spotreba sa meria na projekt a používateľa,
- celý prompt a odmietnutý výsledok sa v našej databáze predvolene neuchovávajú,
- zlyhanie AI nesmie blokovať manuálnu tvorbu webu.

Retenčný návrh je v [AI_DATA_RETENTION_POLICY_DRAFT.md](AI_DATA_RETENTION_POLICY_DRAFT.md).

## 13. Médiá

Upload tok:

1. klient overí typ, veľkosť a základné rozmery,
2. server autorizuje upload pre konkrétny projekt,
3. súbor sa uloží pod náhodným názvom mimo verejne hádateľnej cesty,
4. systém vytvorí optimalizované varianty,
5. používateľ nastaví orez a alt text,
6. publikovaný snapshot odkáže na konkrétnu verziu média.

Bezpečnostné pravidlá:

- povoliť iba JPEG, PNG, WebP a podľa overenia AVIF,
- nepoužívať iba príponu súboru na určenie typu,
- limitovať veľkosť aj pixelové rozmery,
- odstrániť nepotrebné EXIF metadata,
- zabrániť SVG uploadu v prvom release,
- mazať nepoužívané súbory až po ochrannej lehote.

## 14. Platba a nárok na publikovanie

### 14.1 Tok

1. používateľ otvorí Publikovanie,
2. systém skontroluje povinný obsah,
3. používateľ vyberie Basic 49,99 € alebo Plus 89,99 € s DPH,
4. používateľ vyplní fakturačné údaje a potvrdí podmienky,
5. server vytvorí Stripe Checkout Session s konkrétnym balíkom,
6. Stripe vykoná platbu,
7. podpísaný webhook potvrdí výsledok,
8. idempotentná fulfillment funkcia označí objednávku za zaplatenú,
9. projekt dostane nárok na funkcie zvoleného balíka,
10. systém publikuje alebo ponúkne finálne tlačidlo Publikovať.

Nárok sa nikdy neodomkne iba podľa návratovej URL z platobnej stránky. Webhook musí overiť podpis a rovnaká udalosť sa môže bezpečne spracovať opakovane.

### 14.2 Fakturácia

- predávajúci: SZČO Ing. Tibor Antal,
- pred produkciou doplniť oficiálne obchodné meno, adresu, IČO, DIČ, IČ DPH podľa skutočného stavu a kontaktné údaje,
- fakturačné údaje sa ukladajú ako snapshot k objednávke,
- presný daňový a fakturačný proces sa potvrdí s účtovníkom pred ostrým predajom,
- aplikácia nebude označovať bežné potvrdenie Stripe za slovenskú faktúru bez overenia procesu,
- ceny 49,99 € a 89,99 € sa pracovne zobrazujú ako ceny s DPH; ich správne daňové znenie sa musí potvrdiť podľa postavenia prevádzkovateľa.

## 15. E-maily

P0 šablóny:

- overenie e-mailu,
- obnova hesla,
- potvrdenie vytvorenia webu,
- potvrdenie platby alebo problém s platbou,
- potvrdenie publikovania,
- upozornenie na koniec kampane,
- bezpečnostné upozornenie pri zmene e-mailu alebo hesla.

Každý e-mail bude mať evidovaný stav doručenia bez zbytočného ukladania celého obsahu správy.

## 16. Bezpečnosť a ochrana súkromia

- serverová autorizácia pri každom čítaní a zápise,
- RLS politiky podľa vlastníctva projektu,
- admin service kľúče iba na serveri,
- žiadne tajné kľúče v klientskom bundle,
- rate limiting pre prihlásenie, AI, upload a citlivé akcie,
- ochrana webhookov podpisom,
- kontrola pôvodu Server Actions,
- bezpečné cookies a server-side session,
- audit administrátorských zásahov,
- potvrdenie pred zmazaním a ochranná lehota na obnovu,
- minimálne oprávnenia a oddelené testovacie a produkčné prostredie,
- zálohy databázy a pravidelne overovaná obnova,
- CSP a bezpečnostné HTTP hlavičky,
- sanitizácia rich textu pred renderovaním,
- politika zakázaného obsahu a postup nahlasovania zneužitia,
- export a zmazanie osobných údajov,
- evidencia súhlasov s verziou právneho dokumentu.

Právne texty, cookies, politický obsah, fakturácia a pravidlá priameho oslovovania musí pred ostrým spustením skontrolovať príslušný odborník.

Pracovný proces nahlasovania, zásahov, odvolania a politicky neutrálnej moderácie je v [CONTENT_MODERATION_POLICY_DRAFT.md](CONTENT_MODERATION_POLICY_DRAFT.md). Keďže služba za odplatu pripravuje a zverejňuje politické posolstvá, pred spustením sa musí osobitne posúdiť jej postavenie podľa nariadenia (EÚ) 2024/900 o transparentnosti politickej reklamy. Dátový model bude pripravený na sponzora, súvisiace voľby, cenu, obdobie, označenie a verzie transparentného oznámenia.

## 17. Interný admin

Prvý admin má byť účelový operačný nástroj, nie rozsiahly backoffice.

### Dashboard

- počet registrácií, rozpracovaných a publikovaných webov,
- úspešné a zlyhané platby,
- chybné webhooky, e-maily a AI generovania,
- weby vyžadujúce zásah.

### Používatelia a weby

- vyhľadanie podľa e-mailu, mena, slug alebo domény,
- stav účtu a overenia,
- stav projektu, objednávky a publikácie,
- read-only náhľad obsahu,
- pozastavenie webu s dôvodom,
- auditovaný support prístup.

### Platby

- objednávka, externé ID a fulfillment stav,
- opätovné bezpečné spracovanie zlyhaného webhooku,
- odkaz do platobného dashboardu,
- bez manuálneho prepisovania zaplateného stavu bez auditovanej núdzovej operácie.

### Moderácia

- fronta hlásení nezákonného obsahu,
- moderátorský prípad s históriou a dôkazmi,
- primerané zásahy od upozornenia po dočasné znepublikovanie,
- povinný konkrétny dôvod pri každom obmedzení,
- správa kandidátovi s možnosťou nápravy a odvolania,
- evidencia prípadných transparentných údajov politickej reklamy,
- oddelenie moderácie od nezaplateného alebo technicky neaktívneho webu.

## 18. Testovanie

### Unit testy

- validácia obsahu a slugov,
- výpočet dokončenia projektu,
- publish readiness pravidlá,
- migrácie verzií obsahového dokumentu,
- autorizácia a cenové výpočty,
- idempotentné spracovanie webhooku.

### Integračné testy

- registrácia a session,
- RLS izolácia medzi dvoma používateľmi,
- autosave a konflikt revízií,
- upload a spracovanie obrázka,
- AI limit a prijatie návrhu,
- platba, webhook a odomknutie publikovania,
- vytvorenie publikovaného snapshotu,
- hostname routing.

### End-to-end testy

- nový kandidát vytvorí prvý náhľad,
- obnoví rozpracovaný projekt,
- zaplatí v testovacom režime a publikuje,
- upraví text a publikuje novú verziu,
- admin nájde projekt a vidí jeho technický stav,
- základné toky fungujú pri 375, 768, 1024 a 1440 px.

### Kvalita

- TypeScript bez chýb,
- lint a formátovanie,
- automatizované testy v CI,
- kontrola klávesnicou a screen readerom,
- Lighthouse alebo ekvivalent pre verejnú šablónu,
- kontrola výkonu a layout shiftu pri obrázkoch.

## 19. Monitoring a prevádzka

- zachytávanie serverových a klientskych chýb,
- anonymizované korelačné ID požiadaviek,
- monitoring dostupnosti verejných webov,
- upozornenie na zlyhané webhooky a e-maily,
- sledovanie nákladov AI a storage,
- denné databázové zálohy podľa možností zvoleného plánu,
- retenčné pravidlá pre logy a citlivé dáta,
- runbook pre výpadok platby, publikovania, domény a e-mailov.

## 20. Navrhovaná štruktúra repozitára

```text
app/
  (auth)/
  app/
    web/[siteId]/
    ucet/
  admin/
  api/
    webhooks/stripe/
  public-site/
components/
  app-shell/
  forms/
  editor/
  preview/
  public-site/
  ui/
features/
  auth/
  sites/
  content/
  publishing/
  billing/
  ai/
  media/
  admin/
lib/
  supabase/
  validation/
  auth/
  security/
  email/
  payments/
  ai/
  observability/
supabase/
  migrations/
  seed.sql
tests/
  unit/
  integration/
  e2e/
```

Konkrétne členenie sa môže mierne upraviť podľa scaffoldingu, ale doménová logika nebude roztrúsená priamo po UI komponentoch.

## 21. Implementačné fázy

### Fáza 0 — dizajn systému a technický základ

- použiť potvrdený názov WebPreKandidata.sk, pracovné logo, navy/teal paletu a Inter,
- založiť Next.js projekt a prostredia,
- pripraviť design tokeny a základné UI komponenty,
- nastaviť testy, lint, CI a konvencie,
- vytvoriť databázové migrácie a seed dáta.

Výstup: stabilný základ aplikácie a reprodukovateľné lokálne prostredie.

### Fáza 1 — účty a app shell

- autentifikácia,
- profil používateľa,
- vytvorenie a výber projektu,
- responzívna navigácia,
- dashboard projektu a stav dokončenia,
- základ RLS a autorizácie.

Výstup: používateľ sa prihlási, vytvorí projekt a bezpečne vidí iba svoje dáta.

### Fáza 2 — obsahový editor

- všetky P0 formulárové sekcie,
- autosave, validácia a revízie,
- zoznamové položky a radenie,
- základný rich text,
- stav dokončenia.

Výstup: kandidát vyplní celý obsah bez AI a bez straty údajov.

### Fáza 3 — šablóna a náhľad

- verejné komponenty kandidátskeho webu,
- theme tokeny a varianty,
- desktop/mobil náhľad,
- host resolver,
- draft a publication snapshot model.

Výstup: koncept sa zobrazí ako kvalitný súkromný náhľad a testovacia publikácia.

### Fáza 4 — médiá, SEO, aktuality, kontakt a AI

- upload a orez obrázkov,
- optimalizované varianty,
- SEO a social preview,
- editor a verejný výpis aktualít,
- kontaktný formulár, ochrana proti spamu a doručenie,
- AI interview a textové akcie,
- AI články podľa oprávnenia balíka Plus,
- limity, audit a chybové stavy.

Výstup: používateľ vie pripraviť kompletný obsah a vizuál samostatne.

### Fáza 5 — platba a produkčné publikovanie

- checkout a fakturačné údaje,
- podpísané webhooky a idempotentný fulfillment,
- publish entitlement,
- wildcard subdomény a SSL,
- dva balíky a vynútenie ich funkcií,
- pripojenie vlastnej domény pre Plus,
- e-maily,
- základný interný admin a moderátorské prípady.

Výstup: celý platený tok od účtu po verejný web.

### Fáza 6 — stabilizácia a pilot

- kompletné testy kritických tokov,
- prístupnosť, výkon a mobilné ladenie,
- monitoring, zálohy a incident runbook,
- bezpečnostná a právna kontrola,
- pilot s reálnymi kandidátmi,
- opravy na základe pozorovaného správania.

Výstup: MVP pripravené na obmedzený ostrý predaj.

### Fáza 7 — rast podľa dát

- jednoduchá analytika,
- QR a social exporty,
- ďalšie šablóny,
- referral a tímové roly.

## 22. Akceptačné kritériá MVP

MVP je pripravené na pilot, keď:

- nový používateľ vytvorí účet a projekt bez manuálneho zásahu,
- bez pomoci dokončí kvalitný náhľad do 15–30 minút,
- refresh, odhlásenie ani zmena zariadenia nespôsobia stratu uloženého konceptu,
- používateľ A nikdy neuvidí ani neupraví dáta používateľa B,
- náhľad presne zodpovedá výslednej šablóne,
- platba sa spracuje bezpečne aj pri opakovanom webhooku,
- verejný web sa odomkne iba po potvrdenej platbe,
- zlyhané publikovanie nepoškodí poslednú verejnú verziu,
- verejný web funguje na mobile, je indexovateľný a prístupný,
- prevádzkovateľ vie diagnostikovať zlyhanú platbu, e-mail, AI alebo publikovanie,
- existuje záloha a overený postup obnovy.

## 23. Stav rozhodnutí

| Oblasť | Stav | Rozhodnutie alebo ďalší krok |
|---|---|---|
| Značka | rozhodnuté pracovne | WebPreKandidata.sk, pracovné SVG logo, navy `#163B65`, teal `#0F766E`, Inter |
| Cena | rozhodnuté | Basic 49,99 € a Plus 89,99 €, obe komunikované s DPH |
| Koniec kampane | otvorené | `campaign_ends_at` a `valid_until` zostanú nullable; pred predajom určiť trvanie a predĺženie |
| Predávajúci | čiastočne rozhodnuté | SZČO Ing. Tibor Antal; doplniť oficiálne fakturačné identifikátory a proces |
| Doména | rozhodnuté | webprekandidata.sk, wildcard subdomény a vlastná doména v Plus |
| Externé účty | čaká na používateľa | používateľ vytvorí Supabase, Vercel, Stripe, e-mail a AI účty |
| Kontaktný formulár | rozhodnuté | súčasť P0 |
| Sociálne siete | rozhodnuté | Facebook a Instagram |
| Moderácia | navrhnuté | implementovať podľa `CONTENT_MODERATION_POLICY_DRAFT.md`, finálne právne skontrolovať |
| AI audit | navrhnuté | bez trvalých promptov a odmietnutých odpovedí; metadata podľa `AI_DATA_RETENTION_POLICY_DRAFT.md` |

Pred ostrým predajom zostáva povinné uzavrieť najmä trvanie služby, kompletné údaje SZČO, daňové znenie cien, fakturačný nástroj a právne posúdenie politickej reklamy.

## 24. Odporúčané realizačné rozhodnutie

Začať fázou 0 a 1, následne vybudovať celý editor bez externých platených integrácií. To nám umožní skoro overiť informačnú architektúru, použiteľnosť formulárov a kvalitu kandidátskej šablóny. AI, platbu a produkčné publikovanie zapojíme až na stabilný obsahový a bezpečnostný základ.

Týmto poradím sa landing page ani pokročilé P1 funkcie nestanú podmienkou pre dokončenie jadra produktu.

## 25. Technické podklady

- Next.js odporúča Server Actions pre formulárové mutácie, pričom ich treba považovať za verejne volateľné serverové endpointy a vždy autorizovať aj validovať: <https://nextjs.org/docs/app/getting-started/mutating-data>
- Supabase podporuje Next.js App Router, cookie-based server-side autentifikáciu a RLS na izoláciu dát: <https://supabase.com/docs/guides/auth/quickstarts/nextjs>
- Vercel podporuje wildcard domény pre multi-tenant aplikácie: <https://vercel.com/docs/domains/working-with-domains>
- Stripe vyžaduje spoľahlivý fulfillment cez webhook; návrat používateľa z Checkout stránky nestačí: <https://docs.stripe.com/checkout/fulfillment>
- GDPR vyžaduje minimalizáciu a časové obmedzenie uchovávania a politické názory zaraďuje medzi osobitné kategórie údajov: <https://eur-lex.europa.eu/eli/reg/2016/679/oj>
- DSA zavádza nahlasovanie nezákonného obsahu a odôvodnenie moderátorských zásahov: <https://digital-strategy.ec.europa.eu/en/policies/dsa-notice-and-action-mechanism>
- Transparentnosť politickej reklamy upravuje nariadenie (EÚ) 2024/900: <https://eur-lex.europa.eu/eli/reg/2024/900/oj>
