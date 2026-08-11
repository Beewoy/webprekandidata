# WebPreKandidata.sk — návrh pravidiel moderácie a pozastavenia

> Produktový a prevádzkový návrh, nie finálne právne znenie obchodných podmienok. Pred ostrým spustením ho musí skontrolovať právnik so znalosťou DSA, ochrany osobných údajov, volebného práva a pravidiel politickej reklamy.

## 1. Princípy

1. **Politická neutralita:** služba neposudzuje, či je politický názor populárny alebo správny. Zasahuje podľa zákona, bezpečnosti a vopred zverejnených podmienok.
2. **Zodpovednosť kandidáta:** kandidát zodpovedá za pravdivosť údajov, práva k médiám a zákonnosť publikovaného obsahu.
3. **Primeranosť zásahu:** ak je možné odstrániť konkrétny problém, nepozastaví sa automaticky celý web.
4. **Rýchlosť pri závažnom riziku:** bezprostredná hrozba, podvod, phishing alebo právne záväzný príkaz môžu viesť k okamžitému dočasnému obmedzeniu.
5. **Vysvetlenie a odvolanie:** kandidát dostane konkrétny dôvod, rozsah zásahu a spôsob, ako požiadať o preskúmanie.
6. **Auditovateľnosť:** hlásenia, rozhodnutia a administrátorské zásahy sa evidujú.

## 2. Zakázaný obsah a správanie

Zakázané bude najmä:

- obsah nezákonný podľa práva EÚ alebo Slovenskej republiky,
- dôveryhodné vyhrážky, podnecovanie násilia alebo oslava konkrétneho násilného činu,
- nezákonné nenávistné prejavy a podnecovanie diskriminácie,
- obťažovanie, doxxing alebo zverejnenie neverejných osobných údajov bez právneho základu,
- ohováračský alebo vedome podvodný obsah, pri ktorom existuje dostatočne konkrétny a dôveryhodný podklad na zásah,
- vydávanie sa za inú osobu alebo kandidáta,
- phishing, malware, podvodné platby, spam a zneužívanie kontaktnej funkcionality,
- neoprávnené použitie fotografií, log, erbov, hudby alebo iného chráneného obsahu,
- sexuálne zneužívanie detí alebo iný obsah, pri ktorom zákon vyžaduje bezodkladný postup,
- technické obchádzanie limitov, neoprávnený prístup alebo útok na službu,
- chýbajúce povinné označenia a transparentné údaje, ak sa web alebo jeho časť právne kvalifikuje ako politická reklama.

Samotná kritika osoby, politickej strany, rozhodnutia samosprávy alebo verejnej politiky nie je dôvodom na zásah, pokiaľ neporušuje zákon alebo tieto pravidlá.

## 3. Povinnosti kandidáta

Kandidát pri registrácii potvrdí, že:

- vytvára web pre seba alebo má preukázateľné oprávnenie konať za kandidáta,
- zadané biografické údaje a tvrdenia skontroloval,
- má právo používať všetky nahrané médiá,
- nebude zverejňovať údaje tretích osôb bez právneho základu,
- zodpovedá za finálne schválenie AI návrhov,
- poskytne údaje potrebné pre zákonné označenie politickej reklamy, ak sa na službu vzťahuje,
- bude udržiavať funkčný kontaktný e-mail.

## 4. Nahlásenie obsahu

Verejný web bude obsahovať odkaz „Nahlásiť nezákonný obsah“. Formulár umožní uviesť:

- presnú URL,
- konkrétnu časť obsahu,
- vysvetlenie, prečo je obsah podľa oznamovateľa nezákonný,
- prípadný právny základ alebo podporné dokumenty,
- kontaktný e-mail,
- vyhlásenie, že hlásenie bolo podané v dobrej viere.

Systém potvrdí prijatie a pridelí identifikátor prípadu. Hlásenie nesmie vyžadovať technické alebo právnické znalosti.

## 5. Stavy moderátorského prípadu

- `received` — prijaté,
- `triage` — prvotné posúdenie,
- `awaiting_information` — potrebné doplnenie,
- `candidate_response` — čaká sa na stanovisko kandidáta,
- `action_required` — kandidát má obsah opraviť,
- `restricted` — konkrétny obsah alebo web je dočasne obmedzený,
- `no_action` — zásah nie je odôvodnený,
- `removed` — obsah bol odstránený,
- `appealed` — podané odvolanie,
- `closed` — prípad uzavretý.

## 6. Stupne zásahu

Od najmiernejšieho:

1. upozornenie bez obmedzenia,
2. žiadosť o doplnenie alebo opravu,
3. skrytie konkrétneho prvku,
4. dočasné znepublikovanie webu,
5. pozastavenie účtu alebo možnosti publikovať,
6. trvalé ukončenie služby pri závažnom alebo opakovanom porušení.

Pri bežnom odstrániteľnom probléme dostane kandidát primeranú lehotu na opravu. Okamžité obmedzenie je vyhradené najmä pre:

- dôveryhodnú bezprostrednú hrozbu ujmy,
- phishing, malware alebo aktívny podvod,
- obsah sexuálneho zneužívania detí,
- platný príkaz súdu alebo oprávneného orgánu,
- závažné neoprávnené zverejnenie osobných údajov,
- opakované vedomé porušovanie po predchádzajúcich upozorneniach.

## 7. Rozhodnutie a odvolanie

Rozhodnutie kandidátovi oznámi:

- aký obsah alebo funkcia bola obmedzená,
- či je dôvodom nezákonnosť alebo porušenie podmienok,
- konkrétne skutkové okolnosti a použité pravidlo,
- či sa pri rozhodnutí použila automatizácia,
- trvanie obmedzenia,
- spôsob nápravy,
- spôsob a lehotu odvolania.

Odvolanie posúdi človek, ktorý nebol jediným autorom pôvodného rozhodnutia, ak to personálne možnosti dovolia. Obnovenie obsahu je možné ihneď po úspešnej náprave alebo rozhodnutí o odvolaní.

## 8. Interné cieľové lehoty

Tieto lehoty sú prevádzkové ciele, nie zmluvná garancia:

- potvrdenie prijatia: automaticky,
- bezprostredné bezpečnostné riziko: začiatok posúdenia čo najskôr, cieľ do 24 hodín,
- bežné hlásenie: prvé posúdenie do 3 pracovných dní,
- lehota kandidáta na bežnú opravu: spravidla 3–5 pracovných dní,
- odvolanie: cieľ do 7 pracovných dní.

## 9. Rozlíšenie moderácie a obchodného stavu

Web môže byť neverejný aj z iného dôvodu než moderácia:

- nezaplatený balík,
- skončený alebo neurčený nárok na prevádzku,
- technická chyba,
- dobrovoľné znepublikovanie kandidátom,
- zmazanie projektu.

Tieto stavy musia byť v databáze aj komunikácii oddelené od sankcie za obsah.

## 10. Politická reklama

Keďže platforma za odplatu pripravuje a verejne sprístupňuje politické posolstvá kandidátov, pred spustením treba právne posúdiť jej postavenie podľa nariadenia (EÚ) 2024/900. Produkt má byť pripravený evidovať minimálne:

- identitu sponzora,
- voľby alebo proces, ku ktorému sa obsah viaže,
- obdobie publikovania,
- cenu a relevantné platobné údaje,
- označenie politickej reklamy,
- transparentné oznámenie a jeho verzie,
- informáciu o použití cielenia; WebPreKandidata.sk v MVP žiadne cielenie neposkytuje.

Nariadenie obsahuje aj povinnosti uchovávania niektorých transparentných údajov. Presný rozsah a prípadné výnimky pre mikropodnik musí potvrdiť právnik pred ostrým predajom.

## 11. Implementačný model

Odporúčané tabuľky:

- `content_reports`,
- `moderation_cases`,
- `moderation_actions`,
- `moderation_appeals`,
- `political_ad_disclosures`,
- `audit_logs`.

Administrátorské tlačidlo „Pozastaviť web“ musí vyžadovať dôvod, kategóriu, rozsah, trvanie a náhľad správy, ktorá sa odošle kandidátovi.

## 12. Oficiálne podklady

- DSA zavádza používateľsky jednoduchý mechanizmus na nahlasovanie nezákonného obsahu a informovanie oznamovateľa o výsledku: <https://digital-strategy.ec.europa.eu/en/policies/dsa-notice-and-action-mechanism>
- Hostingové služby majú pri obmedzení obsahu poskytovať jasné a konkrétne odôvodnenie: <https://digital-strategy.ec.europa.eu/en/faqs/dsa-transparency-database-questions-and-answers>
- Transparentnosť politickej reklamy upravuje nariadenie (EÚ) 2024/900: <https://eur-lex.europa.eu/eli/reg/2024/900/oj>

