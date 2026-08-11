# WebPreKandidata.sk — súhrn konceptu

> Pracovný produktový brief pre MVP. Dokument sumarizuje doterajšiu diskusiu a dopĺňa ju o odporúčanú technickú architektúru, cenotvorbu, distribúciu a realizačný plán. Položky označené ako **odporúčanie** ešte nie sú finálnym rozhodnutím a majú sa overiť validáciou s kandidátmi.

> Aktualizácia 11. 8. 2026: Najskôr sa implementuje produktové jadro a dashboard; landing page sa bude riešiť neskôr. Potvrdené sú dva balíky Basic 49,99 € a Plus 89,99 € ako konečné jednorazové ceny.

## 1. Cieľ produktu

**WebPreKandidata.sk** má byť jednoduchá self-service platforma, pomocou ktorej si kandidát vytvorí profesionálny volebný web bez agentúry, programátora alebo znalosti webdizajnu.

Primárne cieľové skupiny:

- kandidáti na poslanca obecného alebo mestského zastupiteľstva,
- kandidáti na starostu a primátora,
- kandidáti do VÚC,
- neskôr ďalší lokálni alebo regionálni politickí kandidáti.

Základný prísľub produktu:

> **Vyplním údaje → systém mi pomôže s textami → zaplatím → mám hotový volebný web.**

Produkt nemá byť zákazková tvorba webov. Cieľom je opakovateľná služba s minimom manuálnej práce zo strany prevádzkovateľa.

### Hlavná hodnota pre kandidáta

- spustenie webu v priebehu desiatok minút, nie týždňov,
- výrazne nižšia cena než pri individuálnej tvorbe,
- profesionálny a mobilný dizajn bez rozhodovania o technických detailoch,
- pomoc AI pri formulovaní predstavenia a programu,
- jednoduché úpravy počas kampane,
- hosting, bezpečnosť a technická prevádzka vyriešené v jednej službe.

### Čo produkt nemá byť

- univerzálny drag-and-drop web builder,
- marketingová agentúra na mieru,
- komplexný CRM alebo nástroj na riadenie kampane,
- politická sociálna sieť,
- náhrada za právne, účtovné alebo politické poradenstvo.

## 2. Benchmark: Volebka.sk

Volebka.sk je relevantný benchmark a zároveň validácia toho, že produkt pre jednoduchú tvorbu kandidátskych webov má na slovenskom trhu zmysel.

Je v poriadku prevziať overený princíp produktu:

- onboarding,
- zadanie údajov o kandidátovi,
- AI pomoc s textami,
- šablónový dizajn,
- náhľad webu,
- jednoduchý editor,
- platba,
- publikovanie,
- pripojenie domény.

Nesmie sa kopírovať ich konkrétny dizajn, texty, branding ani zdrojový kód. Cieľom nemusí byť úplne nový produktový model. Stačí vytvoriť porovnateľne kvalitné alebo lepšie riešenie a vyhrať jednoduchosťou, zrozumiteľnosťou a distribúciou.

### Odporúčané odlíšenie

- ešte kratší a zrozumiteľnejší onboarding,
- AI interview namiesto prázdnych textových polí,
- kvalitnejšie východiskové texty v prirodzenej slovenčine,
- dôraz na mobil, rýchlosť, SEO a zdieľanie na sociálnych sieťach,
- jasná cena bez individuálneho nacenenia,
- jednoduché QR a propagačné výstupy,
- aktívny predaj kandidátom, nie iba čakanie na organickú návštevnosť.

## 3. Základný používateľský flow

```text
Landing page WebPreKandidata.sk
        ↓
Ukážky webov + cena + výzva „Vytvoriť web“
        ↓
Registrácia alebo uloženie rozpracovaného návrhu
        ↓
Viackrokový onboarding
        ↓
Meno, kandidatúra, lokalita, fotografia, kontakty
        ↓
AI interview / vlastné texty
        ↓
Vygenerovanie predstavenia a programu
        ↓
Výber vizuálneho variantu a farby
        ↓
Náhľad webu
        ↓
Úpravy v jednoduchom editore
        ↓
Platba
        ↓
Automatické publikovanie na subdoméne
        ↓
Voliteľné pripojenie vlastnej domény
```

### Odporúčanie pre konverziu

Používateľ by mal vidieť kvalitný náhľad svojho webu ešte pred platbou. Verejné publikovanie, odstránenie watermarku a vlastná doména sa odomknú po zaplatení. Kandidát tak najskôr uvidí konkrétnu hodnotu a až potom sa rozhoduje o nákupe.

## 4. MVP funkcie

### P0 — nevyhnutné na predaj

- registrácia a prihlásenie,
- viackrokový onboarding s automatickým ukladaním,
- základné údaje kandidáta:
  - meno, titul a fotografia,
  - typ kandidatúry a lokalita,
  - slogan alebo titulná veta,
  - krátke predstavenie,
  - volebný program,
  - kontakt, Facebook a Instagram,
- AI pomoc pri vytvorení a úprave textov,
- jedna kvalitná responzívna šablóna s niekoľkými farebnými variantmi,
- živý náhľad webu pre desktop a mobil,
- jednoduchý obsahový editor,
- uloženie konceptu a návrat k rozpracovanému webu,
- jednorazová online platba,
- automatické publikovanie na subdoméne,
- kontaktný formulár s ochranou proti spamu,
- aktuality alebo blog,
- pripojenie existujúcej vlastnej domény pre balík Plus,
- AI pomoc s článkami pre balík Plus,
- základné SEO metadata, Open Graph náhľad a sitemap,
- GDPR/cookies riešenie primerané použitým službám,
- administračný pohľad prevádzkovateľa na používateľov, weby a platby,
- automatické transakčné e-maily.

### P1 — krátko po validácii

- generovanie QR kódu,
- jednoduchá návštevnosť bez invazívneho trackingu,
- automaticky vytvorený obrázok pri zdieľaní,
- export krátkeho textu pre Facebook/Instagram bio a príspevok,
- viac dizajnových variantov,
- základné obnovenie predplatného alebo predĺženie prevádzky.

### Mimo prvého MVP

- plnohodnotný drag-and-drop builder,
- tímové roly a schvaľovanie,
- CRM voličov, newsletter a hromadné kampane,
- automatizované sociálne siete,
- e-shop alebo prijímanie darov,
- pokročilá analytika a A/B testovanie,
- veľké množstvo šablón,
- natívna mobilná aplikácia.

## 5. Editor

Editor má byť jednoduchý CMS, nie voľný vizuálny builder. Dizajn a rozloženie kontroluje platforma; kandidát kontroluje obsah.

Kandidát upravuje najmä:

- meno, funkciu, lokalitu a slogan,
- titulnú fotografiu,
- sekciu „O mne“,
- priority a volebný program,
- kontaktné údaje,
- odkazy na sociálne siete,
- aktuality, ak budú súčasťou zvoleného balíka,
- hlavnú farbu a jeden z pripravených vizuálnych variantov.

Odporúčané UX:

- rozdelenie editora podľa sekcií webu,
- formulár naľavo a okamžitý náhľad napravo na desktope,
- samostatné prepínanie mobilného a desktopového náhľadu,
- automatické ukladanie a viditeľný stav „Uložené“,
- bezpečné publikovanie zmien bez práce s technickými pojmami,
- možnosť vrátiť poslednú zmenu alebo obnoviť poslednú publikovanú verziu,
- limity dĺžky a nápovedy, aby kandidát nerozbil vizuál.

## 6. Domény a značka

### Hlavná doména

**WebPreKandidata.sk** je vhodná najmä pre predaj cez cold outreach a vyhľadávanie, pretože okamžite vysvetľuje produkt. Je dlhšia a menej brandová než Volebka.sk, ale má vysokú zrozumiteľnosť a obchodnú použiteľnosť.

Pracovné hodnotenie z diskusie:

- **Volebka.sk:** 9/10 značka,
- **WebPreKandidata.sk:** 8/10 značka, 10/10 zrozumiteľnosť a predaj.

Keďže Volebka.sk patrí konkurentovi, nemá zmysel komplikovať MVP hľadaním za každú cenu „kreatívnejšieho“ názvu. WebPreKandidata.sk je dôveryhodný a opisný názov, ktorý sa dobre používa v telefonáte aj e-maile.

### Domény kandidátov

Odporúčané poradie:

1. Každý zaplatený web dostane subdoménu, napr. `jan-novak.webprekandidata.sk`.
2. Kandidát môže pripojiť vlastnú doménu, napr. `jannovak.sk`.
3. Platforma poskytne jednoduchý návod na DNS alebo doménu pripojí cez podporovaný automatizovaný proces.

V MVP je bezpečnejšie, ak vlastnú doménu vlastní kandidát. Platforma ju iba technicky pripojí. Neskôr možno ponúknuť registráciu a správu domény ako platenú doplnkovú službu.

## 7. Odporúčaná technická architektúra

Architektúra má optimalizovať rýchlosť vývoja, nízke prevádzkové náklady a automatické publikovanie viacerých kandidátskych webov.

### Aplikačná vrstva

- **Next.js + TypeScript** pre landing page, onboarding, editor, admin aj verejné weby,
- **React** komponenty zdieľané medzi editorom a publikovanou šablónou,
- **Tailwind CSS** alebo vlastný tokenový systém pre konzistentný dizajn,
- jeden multi-tenant projekt namiesto samostatného deployu pre každého kandidáta.

### Backend a dáta

- **PostgreSQL** pre používateľov, projekty, obsah, platby a domény,
- na rýchle MVP je vhodný **Supabase** pre databázu, autentifikáciu a úložisko,
- objektové úložisko pre fotografie a generované obrázky,
- row-level oprávnenia alebo ekvivalentná serverová autorizácia, aby kandidát videl iba svoje projekty,
- verzovanie obsahu alebo minimálne uloženie poslednej publikovanej verzie.

### Hosting a publikovanie

- **Vercel** alebo porovnateľná platforma pre Next.js,
- wildcard DNS a wildcard SSL pre `*.webprekandidata.sk`,
- verejný web sa renderuje podľa hostname/subdomény a publikovanej verzie obsahu,
- CDN a optimalizácia obrázkov pre rýchle načítanie,
- vlastné domény mapované na príslušný projekt kandidáta.

### Platby a e-maily

- **Stripe Checkout** ako odporúčaný štart pre jednorazové platby a prípadné neskoršie predplatné,
- overovanie platieb cez webhooky; publikovanie sa nesmie spoliehať iba na návrat používateľa z platobnej stránky,
- transakčný e-mail cez Resend, Postmark alebo podobnú službu,
- fakturačný proces treba pred ostrým predajom zosúladiť so slovenskými účtovnými a daňovými požiadavkami SZČO.

### Základný dátový model

- `users` — účty a roly,
- `sites` — projekt kandidáta, stav, subdoména a dizajn,
- `candidate_profiles` — kandidatúra, lokalita, bio a kontakty,
- `program_items` — oblasti programu a priority,
- `media` — fotografie a ďalšie súbory,
- `posts` — aktuality v neskoršej fáze,
- `site_versions` — koncept a publikované verzie,
- `domains` — hostname, overenie a SSL stav,
- `orders` / `subscriptions` — platby a nárok na prevádzku,
- `ai_generations` — typ požiadavky, stav, spotreba a audit bez zbytočného ukladania citlivých vstupov.

### Bezpečnosť a prevádzka

- serverová kontrola oprávnení pri každej zmene obsahu,
- rate limiting pre AI a prihlasovanie,
- validácia uploadov, obmedzenie veľkosti a podporovaných formátov,
- pravidelné zálohy databázy,
- monitoring chýb a dostupnosti,
- audit základných administrátorských operácií,
- jasné pravidlá pre zakázaný obsah a nahlasovanie zneužitia,
- súhlas s podmienkami, zásady ochrany súkromia a spracovateľské zmluvy s dodávateľmi.

## 8. AI funkcie

AI má odstraňovať problém prázdnej stránky, nie rozhodovať o politickom obsahu za kandidáta.

### Odporúčané použitie v MVP

- krátke interview s otázkami o motivácii, skúsenostiach a prioritách,
- vytvorenie prvého návrhu sekcie „O mne“,
- transformácia bodových poznámok na zrozumiteľný volebný program,
- skrátenie, rozšírenie alebo zmena tónu existujúceho textu,
- jazyková korektúra a zjednotenie štýlu,
- návrh titulnej vety a krátkeho popisu pre vyhľadávače.

### Zásady

- generovaný text je vždy návrh a pred publikovaním ho schvaľuje kandidát,
- systém nesmie vymýšľať životopisné fakty, úspechy, čísla ani sľuby,
- AI má vychádzať iba z údajov, ktoré poskytol kandidát,
- pri neistote sa má opýtať alebo ponechať miesto na doplnenie,
- treba limitovať počet generovaní podľa balíka alebo primeraného fair-use pravidla,
- citlivé osobné údaje sa do AI neposielajú, ak nie sú potrebné,
- uchovávať sa majú najmä výsledné schválené texty, nie nekonečná história promptov.

### Odporúčaný AI onboarding

1. Prečo kandidujete?
2. Aké skúsenosti prinášate?
3. Ktoré tri problémy v obci alebo meste chcete riešiť?
4. Aké konkrétne kroky navrhujete?
5. Akým tónom chcete komunikovať: vecne, osobne alebo energicky?
6. Čo o vás určite nesmie v texte chýbať?

AI z odpovedí vytvorí návrh, ktorý používateľ upraví a explicitne schváli.

## 9. Cenotvorba

Pre MVP sú potvrdené dva jednorazové balíky na obdobie kampane:

### Basic — 49,99 €

- web na subdoméne WebPreKandidata.sk,
- editor a všetky základné sekcie,
- AI pomoc s prvotným obsahom,
- správa aktualít,
- kontaktný formulár,
- základné SEO, zdieľanie a štandardná podpora.

### Plus — 89,99 €

- všetko z Basic,
- pripojenie jednej existujúcej vlastnej domény,
- AI pomoc s tvorbou článkov,
- prioritná e-mailová podpora.

Registrácia novej domény nie je automaticky zahrnutá. Presný dátum skončenia prevádzky a pravidlá predĺženia zatiaľ nie sú určené. Pred ostrým predajom treba s účtovníkom potvrdiť fakturačný proces a správne znenie cien.

## 10. Distribúcia a predaj

Hlavná konkurenčná výhoda môže vzniknúť v distribúcii. Produkt je sezónny, cieľová skupina sa dá identifikovať a osloviť priamo.

### Primárne kanály

1. **Cielený cold outreach**
   - verejne oznámení kandidáti,
   - personalizovaný e-mail s konkrétnou ukážkou hodnoty,
   - následný telefonát,
   - jednoduché vysvetlenie: „Na WebPreKandidata.sk si vytvoríte hotový volebný web bez agentúry.“

2. **Partnerstvá**
   - lokálni marketéri, fotografi, tlačiarne a správcovia sociálnych sietí,
   - regionálne volebné tímy a nezávislé kandidátne platformy,
   - provízny alebo odporúčací program.

3. **Vyhľadávanie a obsah**
   - stránky a články pre dopyty ako „web pre kandidáta“, „volebná webstránka“ a „stránka pre kandidáta na starostu“,
   - praktické checklisty pre online komunikáciu kandidáta,
   - ukážkové weby a prípadové štúdie.

4. **Platená distribúcia**
   - Google Search na vysoko relevantné dopyty,
   - remarketing iba pri právne a platformovo povolenom nastavení,
   - opatrnosť pri pravidlách platforiem pre politickú reklamu.

### Predajný experiment pred plným vývojom

- vytvoriť landing page a 2–3 realistické demo weby,
- osloviť prvých 30–50 kandidátov,
- ponúknuť skorý prístup za validačnú cenu,
- zmerať reakcie, rezervácie dema a ochotu zaplatiť,
- manuálne dokončiť prvých pár webov za scénou, ak to urýchli učenie,
- automatizovať až kroky, ktoré sa pri reálnych zákazníkoch opakujú.

Pri cold outreach treba dodržať pravidlá ochrany osobných údajov a elektronickej komunikácie a evidovať námietky proti ďalšiemu oslovovaniu.

## 11. Development plán

Odhad predpokladá jedného skúseného frontend/full-stack developera, použitie hotových služieb a jednu kvalitnú šablónu.

### Fáza 0 — validácia a rozhodnutia (3–5 dní)

- potvrdiť cieľový segment pre prvú kampaň,
- preveriť doménu, značku a právne minimum,
- urobiť krátky benchmark konkurencie,
- pripraviť wireflow a obsahový model,
- potvrdiť presný rozsah Basic a Plus vrátane obdobia prevádzky,
- vytvoriť klikateľné demo dashboardu a kandidátskeho webu pre rozhovory.

**Výstup:** jasný scope, ponuka, 5–10 rozhovorov a signál ochoty zaplatiť.

### Fáza 1 — jadro produktu (1.–2. týždeň)

- základ projektu, databáza, autentifikácia a používateľské účty,
- dátový model kandidáta a webu,
- onboarding s autosave,
- upload a optimalizácia fotografie,
- prvá verejná šablóna,
- subdoménové routovanie.

**Výstup:** používateľ vyplní údaje a zobrazí sa funkčný súkromný náhľad.

### Fáza 2 — editor a AI (3. týždeň)

- editor sekcií a live preview,
- koncept verzus publikovaný obsah,
- AI interview a generovanie textov,
- validácie, limity a stavy chýb,
- mobilný náhľad.

**Výstup:** kandidát si vie samostatne pripraviť finálny obsah.

### Fáza 3 — platba a publikovanie (4. týždeň)

- checkout, webhooky a evidencia objednávok,
- automatické odomknutie a publikovanie,
- transakčné e-maily,
- jednoduchý interný admin,
- základné SEO, Open Graph, sitemap a robots pravidlá.

**Výstup:** kompletný platený flow od registrácie po verejný web.

### Fáza 4 — stabilizácia a pilot (5. týždeň)

- testy kritických tokov,
- bezpečnostná a GDPR kontrola,
- monitoring, zálohy a analytika produktu,
- optimalizácia výkonu a prístupnosti,
- pilot s 5–10 kandidátmi,
- opravy podľa pozorovaného správania.

**Výstup:** predajné MVP pripravené na obmedzené verejné spustenie.

### Fáza 5 — rast podľa dát

- vlastné domény,
- aktuality, QR a jednoduchá analytika,
- ďalšie šablóny iba pri reálnom dopyte,
- referral program,
- optimalizácia onboardingu a ceny podľa konverzií.

## 12. Metriky pre validáciu

Na začiatku stačí sledovať niekoľko metrík:

- podiel návštevníkov, ktorí začnú onboarding,
- podiel používateľov, ktorí vytvoria náhľad,
- podiel náhľadov, ktoré skončia platbou,
- čas od začiatku onboardingu po prvý náhľad,
- počet zásahov podpory na jeden platený web,
- náklady na AI, hosting a platby na jedného zákazníka,
- odpovede a konverzie z cold outreach,
- najčastejšie miesto, kde používateľ onboarding opustí.

Pracovný cieľ MVP: používateľ by mal bez pomoci vytvoriť prvý kvalitný náhľad do **15–30 minút**.

## 13. Hlavné riziká

- sezónnosť a krátke predajné okno pred voľbami,
- malý slovenský trh a cenová citlivosť lokálnych kandidátov,
- vysoké nároky na podporu pri doménach, fotkách a textoch,
- nekvalitný alebo fakticky chybný AI obsah,
- zneužitie platformy na protiprávny alebo klamlivý obsah,
- reputačné riziko pri práci s politickými kandidátmi,
- závislosť od pravidiel poskytovateľov platieb, hostingu a AI,
- prehnaný scope pred potvrdením ochoty zákazníkov zaplatiť.

Najlepšia obrana je úzky prvý produkt, riadený dizajn, transparentné pravidlá, schválenie AI textu kandidátom a pilot s reálnymi používateľmi pred masovým oslovením.

## 14. Najbližšie kroky

1. Overiť a zaregistrovať doménu `webprekandidata.sk` a relevantné varianty, ak sú dostupné.
2. Potvrdiť detaily balíkov Basic a Plus, najmä obdobie prevádzky a pravidlá predĺženia.
3. Urobiť aktuálny benchmark Volebka.sk a 3–5 zahraničných riešení bez kopírovania ich dizajnu či textov.
4. Spraviť rozhovory aspoň s 5–10 potenciálnymi kandidátmi.
5. Navrhnúť obsahový model a celý onboarding na jednej mape obrazoviek.
6. Vytvoriť jednu špičkovú kandidátsku šablónu a 2–3 demo profily.
7. Po dokončení jadra postaviť samostatnú landing page so zberom kontaktov alebo predobjednávkou.
8. Osloviť prvých 30–50 kandidátov a merať reakcie aj ochotu zaplatiť.
9. Až po validačnom signále implementovať plný self-service flow, platbu a automatické publikovanie.
10. Pred spustením skontrolovať obchodné podmienky, súkromie, cookies, fakturáciu a pravidlá pre politický obsah s príslušným odborníkom.

## 15. Odporúčané rozhodnutie pre prvú verziu

Prvé MVP má mať:

- jednu doménu a jednu hlavnú značku: **WebPreKandidata.sk**,
- dva platené balíky Basic a Plus,
- jednu kvalitnú šablónu s farebnými variantmi,
- subdoménu v cene,
- AI interview a jednoduchý editor,
- kontaktný formulár a aktuality,
- vlastnú doménu a AI články v balíku Plus,
- platbu pred verejným publikovaním,
- čo najmenej manuálnych operácií,
- analytiku, QR a ďalšie šablóny až po prvých platiacich zákazníkoch.

Prioritou nie je maximálny počet funkcií. Prioritou je overiť, že kandidát rozumie ponuke, dokáže si web pripraviť bez pomoci a je ochotný zaň zaplatiť.
