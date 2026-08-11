# WebPreKandidata.sk — návrh uchovávania AI údajov

> Privacy-first produktový návrh, nie finálne právne posúdenie. Politické názory patria podľa GDPR medzi osobitné kategórie osobných údajov, preto má byť AI audit zámerne minimálny.

## 1. Základné rozhodnutie

Úspešné AI požiadavky nebudú mať v našej databáze trvalo uložený celý prompt ani celý neupravený výsledok.

Budeme rozlišovať:

1. obsah, ktorý kandidát vedome prijal do webu,
2. technické metadata AI operácie,
3. dočasné diagnostické údaje,
4. bezpečnostné incidenty.

## 2. Retenčná matica

| Údaj | Predvolená retencia | Dôvod |
|---|---:|---|
| Prijatý text vložený do konceptu | počas existencie projektu | je súčasťou obsahu webu, nie AI auditu |
| Odmietnutý AI výsledok | neukladať | po zobrazení nie je potrebný |
| Celý prompt úspešnej požiadavky | neukladať | minimalizácia politicky citlivých údajov |
| Celý neupravený výsledok | neukladať | nie je potrebný po prijatí alebo odmietnutí |
| Typ akcie, provider, model, stav, tokeny, cena, čas | 12 mesiacov | limity, náklady, prevádzka a riešenie zneužitia |
| Pseudonymizovaný HMAC fingerprint požiadavky | 90 dní | detekcia opakovania a technických incidentov |
| Sanitizovaná technická chyba bez obsahu | 30 dní | diagnostika |
| Obsah sprístupnený podpore so súhlasom používateľa | najviac 7 dní po uzavretí prípadu | konkrétna diagnostika |
| Bezpečnostný incident alebo právny spor | do uzavretia prípadu a podľa zákonnej potreby | ochrana práv a bezpečnosti |
| Fakturačné a účtovné údaje | podľa samostatnej zákonnej lehoty | nejde o AI audit |

Lehoty sa majú implementovať ako konfigurovateľné politiky s poľom `retention_expires_at` a automatickým mazacím procesom.

## 3. Čo sa uloží do `ai_generations`

- `id`, `site_id`, `user_id`,
- účel: about, reasons, program, rewrite, seo alebo article,
- provider a model,
- stav a chybový kód,
- počet vstupných a výstupných tokenov,
- odhad ceny,
- čas vytvorenia a dokončenia,
- boolean `accepted`,
- HMAC fingerprint bez možnosti spätne získať prompt,
- bezpečnostná kategória, iba ak bola aktivovaná,
- `retention_expires_at`.

Pri prvotnom onboardingu ešte pred vytvorením projektu sa do `audit_logs` uloží iba čas, používateľ, typ požiadavky, provider a model na vynútenie frekvenčného limitu. Po explicitnom prijatí a vytvorení projektu sa štandardné technické metadata doplnia do `ai_generations`. Ani tento prechodný audit neobsahuje prompt alebo výsledok.

Tabuľka nebude mať všeobecné stĺpce `prompt` a `response`.

## 4. Prijatý obsah

Ak kandidát prijme návrh:

- výsledný text sa uloží do `site_drafts` ako bežný editovateľný obsah,
- nebude sa označovať ako nemenný AI výstup,
- kandidát ho môže upraviť alebo zmazať,
- audit uchová iba informáciu, že návrh bol prijatý,
- publikovanie stále predstavuje samostatné schválenie kandidáta.

## 5. Logovanie

Do aplikačných a chybových logov sa nesmú zapisovať:

- prompty,
- celé AI odpovede,
- obsah rich-text polí,
- politické názory a programové priority,
- e-mail, telefón alebo fakturačné údaje,
- autentifikačné tokeny a API kľúče.

Logy môžu obsahovať korelačné ID, typ operácie, dĺžku vstupu, stav, trvanie a sanitizovaný chybový kód.

## 6. Poskytovateľ AI

Pred produkčným zapojením sa overí:

- spracovateľská zmluva a subprocesori,
- región spracovania a medzinárodné prenosy,
- retenčné nastavenia poskytovateľa,
- možnosť vypnúť použitie vstupov na trénovanie,
- dostupnosť zero-data-retention alebo obdobného režimu,
- proces riešenia incidentov a vymazania.

Predvolená konfigurácia nesmie povoľovať použitie kandidátskych vstupov na trénovanie modelov nami ani poskytovateľom, pokiaľ kandidát nedá samostatný, dobrovoľný a odvolateľný súhlas. Takýto súhlas nebude podmienkou služby.

## 7. Prístup a podpora

- bežný administrátor nevidí prompty ani výsledky,
- podpora môže dostať obsah iba po aktívnom súhlase používateľa v konkrétnom prípade,
- sprístupnenie sa auditne zaznamená,
- dočasná diagnostická kópia sa šifruje a automaticky zmaže,
- export osobných údajov obsahuje relevantné AI metadata a prijatý obsah.

## 8. Mazanie

- používateľ môže zmazať konceptový obsah vrátane prijatého AI textu,
- pri zmazaní projektu sa obsah označí na odstránenie podľa ochrannej lehoty,
- metadata s neuplynutou bezpečnostnou alebo právnou potrebou sa oddelia a obmedzia,
- automatická úloha denne odstráni záznamy po `retention_expires_at`,
- výsledok mazania sa zaznamená iba agregovane, bez obnovy vymazaného obsahu.

## 9. Právny základ a transparentnosť

Presný právny základ pre jednotlivé operácie musí byť uvedený v zázname spracovateľských činností a zásadách ochrany súkromia. Kandidát má ešte pred prvým AI použitím dostať stručnú informáciu:

- aké údaje sa odosielajú,
- komu sa odosielajú,
- na aký účel,
- ako dlho sa uchovávajú,
- že AI môže urobiť chybu,
- že výsledok musí pred publikovaním skontrolovať.

## 10. Dôvod návrhu

GDPR vyžaduje minimalizáciu údajov a uchovávanie identifikovateľných údajov iba nevyhnutný čas. Zároveň výslovne zaraďuje politické názory medzi osobitné kategórie osobných údajov. Preto je bezpečnejšie auditovať technickú operáciu, nie vytvárať druhú trvalú databázu politických textov.

Oficiálny podklad: <https://eur-lex.europa.eu/eli/reg/2016/679/oj>
