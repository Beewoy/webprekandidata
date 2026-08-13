# Prompt pre Cursor

K tejto úlohe prikladám súbor `LEGAL_IMPLEMENTATION.md`. Považuj ho za záväznú produktovú a implementačnú špecifikáciu pre projekt WebPreKandidata.sk. Právne závery svojvoľne neupravuj ani nezjednodušuj. Ak sa požiadavka nedá bezpečne implementovať bez právneho alebo produktového rozhodnutia, označ ju ako blocker a nevymýšľaj chýbajúci údaj.

## Zadanie

Analyzuj existujúci repozitár a priprav následne implementuj zmeny potrebné na splnenie `LEGAL_IMPLEMENTATION.md`, najmä:

- spotrebiteľský checkout a uzavretie zmluvy;
- samostatný súhlas so skorším začatím služby;
- dvojkrokové online odstúpenie a refund workflow;
- digitálnu službu, reklamácie, export a ukončenie;
- GDPR roly, DPA, kontaktné formuláre, retenciu a práva dotknutých osôb;
- politickú reklamu podľa nariadenia (EÚ) 2024/900;
- označenie a transparentné oznámenie;
- evidenciu a odosielanie do európskeho úložiska;
- AI návrhy s povinnou ľudskou kontrolou;
- DSA notice-and-action a moderovanie;
- verzie právnych dokumentov, auditné udalosti, monitoring a acceptance criteria.

## Zásady práce

1. Najprv si celý `LEGAL_IMPLEMENTATION.md` prečítaj a zmapuj každú požiadavku na konkrétne časti repozitára.
2. Skontroluj použité frameworky, databázu, autentifikáciu, platobnú bránu, e-mail, hosting, AI integráciu, job queue, monitoring a testovaciu infraštruktúru.
3. Rešpektuj existujúcu architektúru a konvencie projektu. Nevykonávaj rozsiahly refaktor, ak nie je potrebný na splnenie požiadavky.
4. Nevkladaj vymyslené právne údaje. Telefón, register, číslo zápisu, status DPH, kontakty orgánov a právne rozhodnutia ponechaj ako typované konfiguračné blockery s jasným validačným zlyhaním pred produkciou.
5. Každú operáciu s právnym významom verzuj a audituj. Existujúce záznamy VOP, súhlasov, publikovaného obsahu a politickej reklamy sa nesmú spätne prepísať.
6. Používaj bezpečné serverové validácie. Povinnosť nesmie byť vynútená iba JavaScriptom v prehliadači.
7. Nevkladaj citlivý obsah, heslá, celé platobné údaje ani tajné kľúče do logov.
8. Nezapínaj politické cielenie. AI nesmie automaticky publikovať.
9. Ak externé API európskeho úložiska nie je dostupné alebo nie sú známe produkčné poverenia, vytvor čisté rozhranie, outbox, retry, monitoring a testovací adaptér. Produkčný publishing gate musí bez funkčného produkčného adaptéra zostať zatvorený.
10. Zachovaj súčasné používateľské dáta a priprav spätné migrácie alebo bezpečný rollback tam, kde je to primerané.

## Požadovaný postup

### 1. Audit repozitára

Najskôr vráť stručný audit:

- aktuálna architektúra a relevantné moduly;
- existujúce pokrytie jednotlivých LB-01 až LB-09;
- chýbajúce databázové entity, endpointy, obrazovky, joby a testy;
- bezpečnostné alebo dátové riziká;
- externé závislosti a údaje, ktoré musí dodať vlastník projektu;
- navrhované poradie zmien.

Vytvor maticu:

| Requirement ID | Stav | Existujúca implementácia | Medzera | Súbory/moduly | Navrhovaná zmena | Test |
|---|---|---|---|---|---|---|

Stav musí byť jeden z: `splnené`, `čiastočne`, `chýba`, `blokované rozhodnutím`.

### 2. Implementačný plán

Rozdeľ prácu na malé, kontrolovateľné fázy v poradí dokumentu:

1. právne konfigurácie, verzie dokumentov a audit;
2. checkout, potvrdenie zmluvy a skoré plnenie;
3. odstúpenie, refund, reklamácie a export;
4. GDPR/DPA, kontaktný inbox, retencia a bezpečnosť;
5. politická reklama, publishing gate a transparentné oznámenia;
6. repository outbox/API, hlásenia a DSA moderovanie;
7. AI schvaľovanie a evidencia;
8. end-to-end testy, monitoring a produkčná launch brána.

Pri každej fáze uveď:

- databázové migrácie;
- backend zmeny;
- frontend/UI zmeny;
- background joby a externé integrácie;
- auditné udalosti;
- unit, integration a end-to-end testy;
- riziko nasadenia a rollback;
- konkrétne acceptance criteria z `LEGAL_IMPLEMENTATION.md`.

### 3. Implementácia

Po audite a pláne začni implementovať v uvedenom poradí. Pri každej fáze:

1. vykonaj čo najmenšiu úplnú vertikálnu zmenu;
2. pridaj migrácie a bezpečné predvolené hodnoty;
3. pridaj serverové validácie a oprávnenia;
4. pridaj testy pred označením fázy za dokončenú;
5. spusti relevantný formatter, type-check, testy a build;
6. oprav regresie spôsobené zmenou;
7. aktualizuj maticu pokrytia a stručný changelog.

Nevydávaj neimplementovanú maketu alebo iba frontendový formulár za hotovú povinnosť. Flow je dokončený až vtedy, keď funguje UI, server, databáza, audit, e-mail/notifikácia a príslušné testy.

## Povinné technické vlastnosti

### Verzie a dôkazy

- nemenné verzie VOP, DPA, cenníka, poučenia a vyhlásení;
- hash obsahu a čas účinnosti;
- objednávka naviazaná na konkrétne verzie;
- append-only audit s UTC časom, aktérom, akciou, entitou, výsledkom a korelačným ID;
- oprava vytvorí novú verziu, nikdy neprepíše právne významnú históriu.

### Checkout

- rozlíšenie B2C/B2B bez automatického odobratia spotrebiteľských práv iba podľa IČO;
- konečná cena, presné trvanie a hlavné vlastnosti bezprostredne pri objednávke;
- tlačidlo „Objednávka s povinnosťou platby“;
- samostatný, nezaškrtnutý súhlas so skorým plnením;
- odloženie verejnej aktivácie, ak spotrebiteľ skoré plnenie nežiada;
- idempotentné spracovanie podpísaného webhooku platby;
- nemenné potvrdenie zmluvy na trvanlivom médiu.

### Odstúpenie a reklamácie

- verejne dostupné aj prihlásené „Odstúpiť od zmluvy tu“;
- dvojkrokový flow s „Potvrdiť odstúpenie od zmluvy“;
- okamžité potvrdenie obsahu, dátumu a času;
- spoločný backend workflow aj pre odstúpenie prijaté e-mailom;
- refund deadline, export a následná retencia/likvidácia;
- reklamačné ID, potvrdenie, deadline, rozhodnutie, ARS a audit.

### GDPR

- jasne oddelené dáta, kde je platforma prevádzkovateľom a sprostredkovateľom;
- DPA acceptance a verzovaný zoznam ďalších sprostredkovateľov;
- kontaktný formulár nemožno publikovať bez vyplnenej privacy konfigurácie kandidáta;
- tenant isolation, minimálne oprávnenia, retencia, export, vymazanie a incident flow;
- obsah kontaktných správ sa neposiela do AI ani analytiky.

### Politická reklama

- kandidátsky projekt má bezpečný default `political_ad = true`;
- výnimka vyžaduje oprávnené manuálne právne schválenie s auditom;
- publishing gate kontroluje sponzora, platiteľa, financovanie, proces, obdobie a vyhlásenia;
- podpora samostatných reklám/verzií na úrovni projektu, stránky a aktuality;
- označenie nemožno odstrániť editorom ani vlastným CSS;
- transparentné oznámenie je verzované, jazykové a strojovo čitateľné;
- outbox vzniká atómovo s publikovaním;
- repository deadline 72 hodín, retry, alarm, reconciliácia a verejný odkaz;
- dátumy volieb riadia trojmesačnú oprávnenosť a jednomesačnú prioritu hlásení;
- zákonné záznamy sa uchovávajú sedem rokov;
- personalizované politické cielenie je technicky vypnuté.

### AI

- AI vytvára iba koncept;
- publikovanie vyžaduje ľudské schválenie a redakčné vyhlásenie;
- zmena schváleného obsahu zneplatní schválenie;
- eviduje sa dodávateľ, model/verzia, výstup, schvaľovateľ a čas;
- generovanie obrázkov, audia a videa zostane vypnuté, kým nebude implementovaný osobitný transparentný režim.

## Launch gate

Vytvor centrálne vyhodnotenie pripravenosti projektu na produkčné publikovanie. Gate má vrátiť štruktúrovaný zoznam blokujúcich dôvodov a musí byť použitý serverom pri každom publikovaní, nielen zobrazený v administrácii.

Minimálne blokuje pri:

- chýbajúcej právnej konfigurácii prevádzkovateľa;
- neplatnej alebo chýbajúcej akceptácii dokumentov;
- chýbajúcej DPA/privacy konfigurácii pri kontaktnom formulári;
- chýbajúcich politických vyhláseniach alebo transparentných údajoch;
- nefunkčnom produkčnom repository adaptéri;
- nezapísateľnom povinnom audite;
- neplatnom redakčnom schválení AI obsahu.

Gate nesmie obsahovať univerzálny administrátorský bypass. Každá právne prípustná výnimka musí byť úzka, časovo ohraničená, odôvodnená a auditovaná.

## Výstupy

Na konci odovzdaj:

1. zmenený funkčný kód a databázové migrácie;
2. testy naviazané na AC-A až AC-H;
3. aktualizovanú maticu pokrytia LB-01 až LB-09;
4. zoznam nevyriešených právnych/produktových blockerov;
5. zoznam potrebných environment variables a externých poverení bez ich hodnôt;
6. migračný a rollback postup;
7. krátky manuálny QA scenár pre checkout, odstúpenie, reklamáciu, GDPR, politickú reklamu, repository submission, hlásenie a AI schválenie;
8. dôkaz o výsledku formattera, type-checku, testov a buildu.

Za hotové označ iba to, čo je implementované a overené. Ak niečo závisí od telefónu, registra, DPH, právneho stanoviska, API prístupu alebo produkčných poverení, uveď presný blocker, miesto konfigurácie a správanie systému, ktoré do jeho vyriešenia bezpečne zabráni launchu.

