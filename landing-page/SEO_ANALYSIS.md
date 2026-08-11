# SEO analýza landing page WebPreKandidata.sk

Aktualizované: 11. august 2026

## Cieľ a vyhľadávací zámer

Landing page má osloviť slovenského kandidáta, ktorý potrebuje rýchlo vytvoriť dôveryhodnú volebnú webstránku bez agentúry alebo programátora. Primárny konverzný cieľ je registrácia a vytvorenie bezplatného súkromného náhľadu.

Odporúčané tematické pokrytie:

- primárne: `web pre kandidáta`,
- sekundárne: `volebný web`, `webstránka pre kandidáta`,
- sezónne: `komunálne voľby 2026`, `župné voľby 2026`,
- long-tail: `web pre kandidáta na starostu`, `web pre kandidáta na primátora`, `web pre kandidáta na poslanca`, `web pre kandidáta do VÚC`.

Výrazy sa majú používať prirodzene. Samostatné `meta keywords` neprináša moderným vyhľadávačom hodnotu a bolo odstránené.

## Stav po úprave

### Samostatné kampanové stránky

- `/kampanovy-web-pre-starostu` cieli na predstavenie vízie obce, skúseností a programu kandidáta na starostu,
- `/kampanovy-web-pre-primatora` rozvíja mestské témy a rozsiahlejší program kandidáta na primátora,
- `/kampanovy-web-pre-poslanca` vysvetľuje odbornosť, hodnoty a priority kandidáta do miestneho zastupiteľstva,
- `/komunalne-volby-2026` pokrýva sezónny zámer komunálnych volieb a prepája všetky tri komunálne funkcie,
- `/volby-do-vuc-2026` pokrýva kandidáta na predsedu samosprávneho kraja aj poslanca VÚC.

Stránky zdieľajú technický komponent, ceny a konverzný tok, ale nie sú iba mechanickou zámenou názvu funkcie. Každá má samostatnú argumentáciu, FAQ, meta popis a interné odkazy zodpovedajúce odlišnému vyhľadávaciemu zámeru.

### On-page SEO

- Title začína hlavnou frázou a obsahuje aktuálny rok volieb.
- Meta description pomenúva produkt, cieľové voľby, absenciu potreby programátora a model platby až pri publikovaní.
- Stránka má jednu H1 s jasným produktovým významom.
- H2 a H3 pokrývajú postup, funkcie, AI, ceny a otázky používateľov.
- Text zahŕňa relevantné typy kandidatúry bez mechanického opakovania kľúčových slov.
- CTA smerujú priamo na `/registracia`; e-mail zostáva iba ako podporný kontakt.

### Dôveryhodnosť a konverzia

- Hodnotová ponuka vysvetľuje konkrétny výsledok: predstavenie kandidáta, program, aktuality, galériu a kontakt.
- Bezplatný účet a súkromný náhľad sú oddelené od platenej publikácie.
- Ceny Basic 49,99 € a Plus 89,99 € sú uvedené ako konečné jednorazové ceny.
- AI je prezentovaná ako kontrolovaný návrh z údajov kandidáta, nie ako autor politických postojov alebo faktov.
- Odstránené bolo neoverené mobilné skóre 100 a neurčitý prísľub dokončenia „za desiatky minút“.
- Vlastná doména je označená ako pripravovaná funkcia Plus, kým nemá produkčný backend.

### Technické SEO

- Nastavené sú `lang="sk"`, UTF-8, viewport, canonical, robots a konzistentné Open Graph/Twitter texty.
- Duplicitná Open Graph značka a odkazy na neexistujúci obrázok boli odstránené.
- JSON-LD opisuje organizáciu, web, aplikáciu, obe cenové ponuky a viditeľné FAQ.
- FAQ v štruktúrovaných dátach sa presne zhoduje s obsahom na stránke.

## SERP a obsahová príležitosť

Výsledky pre všeobecné volebné frázy tvoria najmä weby jednotlivých kandidátov. Priamy slovenský self-service produkt pre tvorbu volebných webov nemá vo výsledkoch výraznú viditeľnosť. Landing page preto môže obsadiť úzky transakčný zámer kombináciou presného názvu služby, typov kandidatúry a aktuálneho roku volieb.

Pre dlhodobejší organický rast majú zmysel samostatné užitočné stránky:

1. ako vytvoriť web kandidáta na starostu,
2. čo má obsahovať volebný web,
3. kontrolný zoznam online komunikácie pre komunálne voľby 2026,
4. vzory štruktúry predstavenia a programu bez vymýšľania politického obsahu,
5. technické vysvetlenie vlastnej domény, SEO a zdieľania.

Každá stránka má odpovedať na samostatný zámer a prirodzene odkazovať na registráciu. Nemajú vznikať takmer identické stránky iba so zameneným názvom funkcie alebo mesta.

## Zostávajúce úlohy pred ostrým spustením

1. Právne skontrolovať pracovné stránky „Ochrana súkromia“ a „Obchodné podmienky“, doplniť identifikačné údaje a až potom nastaviť `LEGAL_DOCUMENTS_APPROVED=true`.
2. Po nasadení skontrolovať URL v Google Search Console, odoslať sitemapu a otestovať rich results.
3. Zmerať reálne Core Web Vitals na mobile. Marketingové skóre nezverejňovať bez opakovateľného merania.
4. Merať registrácie z organického vyhľadávania, dokončené náhľady a prechod k platenej publikácii; samotná návštevnosť nie je hlavný KPI.

Open Graph obrázok 1200 × 630 px, právne routy, `robots.txt`, sitemap a aktualizovaná komunikácia vlastnej domény sú implementované v Next.js deployi.

## Časová aktuálnosť

Komunálne a župné voľby sa konajú 24. októbra 2026. Sezónny rok a volebné formulácie treba po kampani prehodnotiť, aby landing page nepôsobila zastaralo. Zdroj termínu: [Ministerstvo vnútra SR](https://www.minv.sk/?volby-selfgov26=).
