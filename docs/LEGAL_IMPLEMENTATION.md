# WebPreKandidata.sk — právne a implementačné pokyny

**Stav k:** 13. augustu 2026  
**Účel:** podklad pre úpravu VOP, produktu, databázy, checkoutu a prevádzkových procesov pred spustením  
**Prevádzkovateľ:** Ing. Tibor Antal, IČO 50640259  
**Verzia dokumentu:** 1.0

> Tento dokument je praktický implementačný podklad, nie individuálne právne stanovisko. Pracovné produktové rozhodnutie vychádza z toho, že WebPreKandidata.sk je samoobslužný editor a hosting vlastného webu kandidáta bez plateného dosahu, boostingu alebo cielenia. Rozsah nariadenia o politickej reklame sa musí znovu posúdiť pred rozšírením služby za túto hranicu.

## 1. Rozhodnutie pre launch

WebPreKandidata.sk nemožno bezpečne spustiť iba zverejnením súčasných VOP. Časť povinností musí byť priamo súčasťou produktu a musí po nej zostať preukázateľná auditná stopa.

### Legenda

- **🔴 BLOCKER:** pred verejným launchom musí byť vyriešené; príslušnú funkciu alebo celý platený produkt dovtedy nezapínať.
- **🟠 FEATURE BLOCKER:** nemusí blokovať celý produkt, ak sa daná funkcia úplne vypne.
- **🟡 PRED LAUNCHOM OVERIŤ:** právne alebo prevádzkové rozhodnutie, ktoré treba uzavrieť a zdokumentovať.
- **🟢 ODPORÚČANIE:** silná ochrana dôkazov, bezpečnosti alebo používateľskej skúsenosti.

### Launch blockers

| ID | Stav | Požiadavka | Minimálna podmienka splnenia |
|---|---|---|---|
| LB-01 | 🔴 | Úplné identifikačné údaje obchodníka | Doplnený telefón, presný register a číslo zápisu, status DPH/IČ DPH a príslušný orgán dohľadu; údaje sú trvalo dostupné na webe, v checkout-e, VOP a potvrdení objednávky. |
| LB-02 | 🔴 | Spotrebiteľský checkout | Konečná cena, trvanie služby, hlavné vlastnosti, tlačidlo s povinnosťou platby, oprava chýb, samostatný voliteľný súhlas so skorším začatím služby a potvrdenie na trvanlivom médiu. |
| LB-03 | 🔴 | Online odstúpenie | Počas lehoty je v účte stále viditeľná dvojkroková funkcia **„Odstúpiť od zmluvy tu“**, okamžité potvrdenie obsahuje údaje žiadosti aj dátum a čas; funguje aj bežné odstúpenie e-mailom/formulárom. |
| LB-04 | 🔴 | Režim digitálnej služby a reklamácií | Určené trvanie, parametre balíkov, podpora/aktualizácie, reklamačný proces, potvrdenie reklamácie, lehota odstránenia vady, zmenový proces, ukončenie a export dát. |
| LB-05 | 🟢 MVP | GDPR a kontakt kandidáta | Hosted kontaktný formulár je pre launch globálne vypnutý na UI aj serveri; verejný web používa iba `mailto:`, telefón a sociálne siete. Preto sa neimplementuje osobitný DPA/privacy/retention workflow pre kontaktné správy. Všeobecná ochrana súkromia platformy a prípadná DPA pre hosting zákazníckeho obsahu zostávajú zachované. |
| LB-06 | 🟢 | Hranica služby voči politickej reklame | Produkt zostáva samoobslužným editorom a hostingom vlastného webu kandidáta. Bez nového právneho posúdenia nepridáva platený dosah, boosting, cielenie, nákup médií ani distribúciu kampane cez vlastné kanály platformy. |
| LB-07 | 🟠 | AI návrhy | Ak nie je implementovaná ľudská kontrola, redakčná zodpovednosť, evidencia schválenia a primeraná transparentnosť, balík Plus môže fungovať iba s vypnutým AI generovaním. |
| LB-08 | 🟡 | DSA scope a notice-and-action | Potvrdiť postavenie hostingu/online platformy a zaviesť primeraný elektronický kontakt a interný postup pre podnety k nezákonnému obsahu. Samostatný politicko-reklamný formulár ani moderátorský dashboard nie sú súčasťou aktuálneho MVP. |
| LB-09 | 🔴 | Verzie dokumentov a dôkazy | Každá objednávka a publikovanie sú naviazané na nemennú verziu VOP, DPA, cenníka a povinných vyhlásení; audit sa nedá bežným administrátorským úkonom prepísať. |

**Launch brána:** produkčné publikovanie musí zostať zablokované, kým nie sú LB-01 až LB-04, LB-08 a LB-09 technicky splnené a písomne akceptované vlastníkom produktu. LB-06 je produktová hranica, nie formulár alebo technický publishing gate. AI môže zostať vypnuté a LB-07 sa dokončí neskôr.

## 2. Právna kvalifikácia služby

### 2.1 Digitálna služba

Editor, hosting, publikovanie, správa aktualít a kontaktný formulár sú podľa § 119a ods. 3 Občianskeho zákonníka digitálnou službou: umožňujú vytvárať, spracúvať, uchovávať alebo sprístupňovať údaje v digitálnej forme. Pri spotrebiteľovi preto nestačí všeobecná veta, že služba sa poskytuje „tak ako je“. Uplatní sa osobitný režim zmluvy s digitálnym plnením vrátane súladu služby, aktualizácií, dôkazného bremena a nápravy vady.

### 2.2 Vlastný web kandidáta a politická reklama

Usmernenia Komisie rozlišujú politickú komunikáciu publikovanú vlastnými prostriedkami od platenej politickej reklamnej služby. Organické zverejnenie na vlastnom webe alebo vlastnom účte môže byť internou činnosťou bez povinností označenia a transparentného oznámenia. Bežný poplatok za hosting alebo platformu sa automaticky nepovažuje za odplatu za umiestnenie konkrétnej správy; dizajn webu pre politického aktéra môže byť doplnkovou službou podľa miery vplyvu poskytovateľa.

**Implementačné pravidlo:** WebPreKandidata.sk poskytuje editor, technické publikovanie a hosting. Kandidát určuje obsah, kontroluje ho a sám spúšťa publikovanie. Platforma neposkytuje platený dosah, boosting, nákup mediálneho priestoru, personalizované cielenie ani distribúciu kampane cez vlastné publikum. Preto sa v aktuálnom produkte neimplementuje sponzorský profil, označenie „Politická reklama“, transparentné oznámenie, sedemročný politický snapshot ani európske úložisko.

Ak sa zmení čo i len jedna z uvedených hraníc, treba ešte pred návrhom databázy a UI vykonať nové právne posúdenie konkrétneho toku podľa nariadenia (EÚ) 2024/900.

### 2.3 GDPR roly

- **WebPreKandidata ako samostatný prevádzkovateľ:** registrácia, autentifikácia, objednávky, fakturácia, podpora, bezpečnosť, prevencia zneužitia a vlastná analytika.
- **Kandidát/zákazník ako prevádzkovateľ a WebPreKandidata ako sprostredkovateľ:** údaje návštevníkov cez kontaktný formulár, importované kontakty a ďalší obsah, ktorý platforma spracúva len podľa pokynov kandidáta.
- **Možné ďalšie spoločné alebo samostatné roly:** iba po konkrétnom posúdení účelov a rozhodovania. Roly sa neurčujú názvom vo VOP, ale skutočným správaním.

Kontaktná správa kandidátovi môže priamo alebo nepriamo odhaliť politický názor, čo je osobitná kategória údajov podľa čl. 9 GDPR. Platforma nesmie tvrdiť, že všeobecný súhlas s formulárom automaticky rieši každý prípad. Zákazník musí určiť právny základ podľa čl. 6 a, ak je to potrebné, výnimku podľa čl. 9.

### 2.4 DSA

Keďže platforma ukladá obsah zákazníka a na jeho žiadosť ho sprístupňuje verejnosti, pravdepodobne poskytuje hostingovú službu a môže byť aj online platformou podľa nariadenia o digitálnych službách. Výnimka pre mikro a malé podniky môže odstrániť niektoré povinnosti online platforiem, nie však základné hostingové povinnosti. Presnú kvalifikáciu musí potvrdiť právnik; produkt má zatiaľ použiť prísnejší režim.

## 3. Povinné právne dokumenty

Pred launchom pripraviť, schváliť a verzovať:

1. **Všeobecné obchodné podmienky** pre B2C aj B2B s jasne oddelenými ustanoveniami.
2. **Predzmluvný súhrn balíka** zobrazovaný bezprostredne pred objednávkou.
3. **Poučenie o odstúpení a vzorový formulár**, vrátane odkazu na online funkciu.
4. **Reklamačný poriadok pre digitálnu službu** alebo úplnú reklamačnú časť vo VOP.
5. **Ochranu súkromia platformy** pre účty, objednávky, podporu, bezpečnosť a zákonné záznamy.
6. **Sprostredkovateľskú zmluvu (DPA)** podľa čl. 28 GDPR, elektronicky prijatú zákazníkom pred zapnutím formulára.
7. **Aktuálny zoznam ďalších sprostredkovateľov**, ich funkciu, krajinu spracúvania a mechanizmus prenosu mimo EHP.
8. **Šablónu informačného oznámenia kandidáta** pri kontaktnom formulári. Kandidát ju musí doplniť a potvrdiť; platforma ju nesmie vydávať za univerzálne právne poradenstvo.
9. **Pravidlá prijateľného obsahu a moderovania** vrátane DSA notice-and-action.
10. **Pravidlá AI návrhov** vrátane zákazu automatického publikovania, povinnosti kontroly a redakčnej zodpovednosti zákazníka.
11. **Zásady uchovávania a mazania údajov** s konkrétnymi lehotami pre každú kategóriu.

VOP musia minimálne doplniť:

- presnú dobu poskytovania služby pre každý balík a okamih začatia;
- čo sa stane po skončení doby, lehotu na export a následné vymazanie;
- presné funkčné limity balíkov, AI limit a podmienky podpory;
- kompatibilitu, interoperabilitu, technické predpoklady a obmedzenia vlastnej domény;
- režim aktualizácií vrátane bezpečnostných aktualizácií;
- reklamačné práva pri digitálnej službe a spôsob podania reklamácie;
- podmienky zmien služby počas trvania zmluvy;
- právo na odstúpenie, skoršie začatie služby a pomernú úhradu;
- vymedzenie, že balík nezahŕňa platený dosah, mediálny nákup, boosting ani personalizované cielenie;
- spracúvanie osobných údajov v roliach prevádzkovateľa a sprostredkovateľa;
- moderovanie, pozastavenie a nápravu obsahu, nie však neprimeranú jednostrannú možnosť meniť zmluvu;
- mimosúdne riešenie spotrebiteľského sporu a odkaz na aktuálny zoznam subjektov ARS. Neuvádzať zrušenú platformu EÚ ODR.

## 4. Identifikačné údaje prevádzkovateľa

### 4.1 Overené zo zadania

| Pole | Hodnota |
|---|---|
| Obchodné meno/meno | Ing. Tibor Antal |
| Miesto podnikania | Jána Stanislava 3085/37, 841 05 Bratislava – Karlova Ves, Slovensko |
| IČO | 50640259 |
| DIČ | 1075966881 |
| E-mail | ahoj@beewoy.sk |

### 4.2 🔴 Doplniť a úradne overiť

| Pole | Požadovaná akcia |
|---|---|
| Telefónne číslo | Doplniť funkčné číslo pre spotrebiteľský kontakt. |
| Register | Uviesť presný register a registračný orgán podľa oficiálneho výpisu. |
| Číslo zápisu | Uviesť presné číslo živnostenského registra alebo iného registra. |
| DPH | Overiť, či je prevádzkovateľ platiteľ DPH. Podľa výsledku uviesť IČ DPH alebo zrozumiteľné „nie je platiteľ DPH“ a správne nastaviť konečné ceny. Samotné DIČ túto otázku nerieši. |
| Orgán dohľadu | Overiť aktuálnu príslušnosť a kontakt Slovenskej obchodnej inšpekcie; uviesť ho v právnych informáciách. |

Oficiálny živnostenský register vyžadoval pri overovaní IČO interaktívnu CAPTCHA, preto sa presný zápis nesmie doplniť odhadom. Prevádzkovateľ má vložiť údaje z aktuálneho úradného výpisu a právnik ich má porovnať s VOP.

Údaje musia byť ľahko, priamo a trvalo dostupné v pätičke, na kontaktnej stránke, v checkout-e, VOP, ochrane súkromia a v potvrdení zmluvy. Nesmú byť ukryté iba v obrázku alebo za prihlásením.

## 5. Checkout a uzavretie zmluvy

### 5.1 Rozdelenie zákazníkov

Checkout sa musí hneď na začiatku opýtať:

- nakupujem ako spotrebiteľ; alebo
- nakupujem v súvislosti s podnikaním/povolaním alebo za právnickú osobu.

Pri B2B vyžiadať obchodné meno, sídlo, IČO a prípadne IČ DPH. Samotné vyplnenie IČO však nie je dôvodom automaticky odobrať spotrebiteľské práva, ak skutočný účel nákupu nie je podnikateľský. Záznam musí obsahovať výslovné vyhlásenie zákazníka a jeho znenie/verziu.

### 5.2 Informácie viditeľné pred objednávkou

Bezprostredne nad tlačidlom objednávky, nie iba cez odkaz vo VOP, zobraziť:

- názov balíka a hlavné funkcie;
- jednorazovú konečnú cenu vrátane všetkých daní a povinných poplatkov;
- že nejde o automatické obnovenie;
- presnú dobu služby, dátum alebo pravidlo začiatku a konca;
- pri Plus, že registrácia/obnova domény ani poplatky registrátora nie sú zahrnuté;
- technické predpoklady, významné obmedzenia a kompatibilitu;
- najkratšie trvanie záväzku;
- spôsob a lehotu aktivácie;
- odkaz na VOP, odstúpenie, reklamácie, ochranu súkromia a pri kontakte DPA;
- dostupné platobné metódy a obmedzenia dodania najneskôr na začiatku checkoutu.

### 5.3 Ovládacie prvky

Povinné checkboxy nesmú byť vopred zaškrtnuté. Odporúčaný model:

1. **Povinný:** „Oboznámil(a) som sa s VOP vo verzii [ID] a beriem na vedomie informácie o ochrane súkromia.“ Ochrana súkromia sa neformuluje ako súhlas, ak sa spracúvanie neopiera o súhlas.
2. **Samostatný a voliteľný pri spotrebiteľovi:**
   „Žiadam, aby sa platená služba začala poskytovať pred uplynutím 14-dňovej lehoty na odstúpenie. Bol(a) som poučený(á), že po úplnom poskytnutí služby strácam právo na odstúpenie; ak odstúpim pred úplným poskytnutím, uhradím pomernú cenu za skutočne poskytnuté plnenie.“

Ak spotrebiteľ tretí checkbox nezaškrtne, objednávku musí byť možné dokončiť, ale verejná aktivácia platených funkcií sa naplánuje až po uplynutí lehoty. Bezplatný súkromný editor môže zostať dostupný.

Keďže hosting je priebežná služba, samotná skorá aktivácia spravidla neznamená úplné poskytnutie služby a okamžitú stratu práva na odstúpenie.

### 5.4 Tlačidlo a platba

- Finálne tlačidlo označiť **„Objednávka s povinnosťou platby“** alebo rovnako jednoznačným výrazom.
- Pred odoslaním umožniť zistiť a opraviť chyby.
- Zmluva nevzniká iba načítaním stránky úspechu. Backend musí overiť podpísaný webhook platobnej brány a idempotentne priradiť platbu k objednávke.
- Uchovať sumu, menu, daňový režim, presnú verziu balíka/cenníka a identifikátor transakcie. Neukladať celé údaje platobnej karty.
- Bezodkladne elektronicky potvrdiť prijatie objednávky.

### 5.5 Potvrdenie na trvanlivom médiu

Po uzavretí zmluvy poslať e-mail a sprístupniť stiahnuteľný nemenný súbor obsahujúci:

- identifikáciu strán a objednávky;
- balík, cenu, trvanie a dátum aktivácie;
- VOP platné v okamihu objednávky;
- poučenie a vzorový formulár na odstúpenie;
- stav voliteľného súhlasu so skorším začatím služby a presné znenie vyhlásenia;
- reklamačný kontakt a odkaz na ARS;
- odkaz na DPA a jeho verziu.

Nestačí odkaz na živú webovú stránku, ktorej obsah možno spätne zmeniť.

## 6. Odstúpenie od zmluvy

### 6.1 Základný režim

Spotrebiteľ môže pri zmluve o službe uzavretej na diaľku spravidla odstúpiť do 14 dní od uzavretia zmluvy. Ak nedostane riadne poučenie, lehota sa môže predĺžiť až o 12 mesiacov. Odstúpenie možno urobiť aj jednoznačným e-mailom alebo iným vyhlásením; online funkcia nie je jediná prípustná cesta.

Ak spotrebiteľ výslovne požiadal o skoršie poskytovanie a neskôr odstúpi, možno žiadať iba pomernú cenu skutočne poskytnutého plnenia, ak boli splnené zákonné informačné a súhlasové podmienky. Bez nich sa platba za poskytnutie počas lehoty nežiada.

### 6.2 Povinné online rozhranie od 19. júna 2026

Pre zmluvy uzavreté po 18. júni 2026 musí online rozhranie počas celej lehoty obsahovať ľahko nájditeľnú, jasnú a nepretržite dostupnú funkciu:

1. tlačidlo/odkaz **„Odstúpiť od zmluvy tu“**;
2. formulár predvyplnený známymi údajmi, ktorý umožní uviesť meno, identifikátor zmluvy/objednávky a elektronický kontakt;
3. finálne tlačidlo **„Potvrdiť odstúpenie od zmluvy“**;
4. okamžité potvrdenie na trvanlivom médiu s obsahom podania a presným dátumom a časom.

Funkcia musí byť dostupná aj z verejnej stránky pre prípad, že sa spotrebiteľ nevie prihlásiť. Môže použiť bezpečný jednorazový odkaz zaslaný na e-mail objednávky. Nesmie vyžadovať telefonát, vysvetlenie dôvodu, nahratie dokladu, potvrdenie cez podporu ani zbytočné retenčné obrazovky.

### 6.3 Backend workflow

1. Prijať podanie a okamžite vytvoriť nemenný záznam `withdrawal_request` v UTC.
2. Zastaviť budúce plnenie a automatické publikovanie; projekt nezmazať okamžite.
3. Vypočítať vratnú sumu podľa právne schválenej metodiky. Pomerná cena sa nesmie počítať svojvoľne podľa už spotrebovaných interných nákladov.
4. Refundovať do 14 dní rovnakým platobným prostriedkom, ak spotrebiteľ výslovne nesúhlasí s iným bezplatným spôsobom.
5. Umožniť export zákazníckeho obsahu podľa režimu digitálnej služby a GDPR.
6. Po uplynutí exportnej lehoty odstrániť alebo anonymizovať údaje, ktoré sa nemusia ďalej uchovávať.
7. Zaznamenať všetky kroky, sumy, čas a aktéra do auditu.

## 7. Digitálna služba, zmeny a reklamácie

### 7.1 Parametre, ktoré nesmú zostať neurčité

Pred predajom musí produktový katalóg obsahovať a VOP odkazovať na konkrétne:

- trvanie Basic a Plus;
- maximálny počet projektov, domén a používateľov;
- obsah a limity editoru, aktualít, formulárov, SEO a AI;
- úroveň podpory a obvyklé reakčné časy bez zavádzajúcej garancie;
- dostupnosť/export formátu;
- technické a bezpečnostné aktualizácie počas celého dohodnutého obdobia;
- podporované prehliadače, DNS/domain podmienky a závislosti;
- objektívne podmienky pozastavenia a ukončenia.

Veta „presná doba sa zobrazí pred objednávkou“ je prípustná len vtedy, ak je údaj skutočne zobrazený, uložený v objednávke a priložený k potvrdeniu. Produkčné správanie nesmie byť v rozpore s potvrdeným parametrom.

### 7.2 Súlad a aktualizácie

Služba musí zodpovedať dohodnutému účelu a verejným tvrdeniam, fungovať s primeranou kontinuitou a bezpečnosťou a dostávať potrebné aktualizácie počas dohodnutého obdobia. Marketingové tvrdenie je preto verzovaná právne významná informácia. Pred zverejnením kampane skontrolovať, či sľuby ako „bez výpadkov“, „najbezpečnejší“ alebo „okamžitá podpora“ možno preukázať.

Zmenu počas trvania služby urobiť iba ak:

- ju zmluva umožňuje z objektívneho dôvodu;
- nevznikne dodatočný náklad spotrebiteľovi;
- zákazník je zrozumiteľne informovaný;
- pri negatívnom vplyve dostane vopred informáciu na trvanlivom médiu a zákonné možnosti vrátane ukončenia, ak sa uplatnia.

### 7.3 Reklamačný flow

V účte pridať **„Nahlásiť problém/reklamáciu“** a ponechať e-mailový kanál. Po prijatí:

1. okamžite priradiť identifikátor a poslať písomné potvrdenie;
2. uložiť opis, dotknutý projekt, čas, prílohy a požadovanú nápravu;
3. uviesť lehotu odstránenia vady; tá nesmie byť dlhšia ako 30 dní, okrem objektívneho dôvodu mimo kontroly prevádzkovateľa;
4. odstrániť vadu bezplatne, v primeranom čase a bez závažných ťažkostí;
5. ak sa reklamácia odmietne, uviesť písomné dôvody a poučenie o ďalších možnostiach;
6. podporiť primeranú zľavu alebo odstúpenie v zákonných prípadoch a refundáciu zľavy do 14 dní;
7. uchovať dôkazy dostupnosti a verzie služby počas celého trvania, pretože pri priebežnej službe nesie obchodník významné dôkazné bremeno.

Ak obchodník zamietne žiadosť spotrebiteľa o nápravu alebo na ňu neodpovie do 30 dní, spotrebiteľ musí dostať informáciu o možnosti alternatívneho riešenia sporu a odkaz na príslušný subjekt/zoznam ARS.

### 7.4 Ukončenie a obsah zákazníka

- Pri skončení nevymazať projekt okamžite bez možnosti exportu.
- Poskytnúť obsah vytvorený/dodaný zákazníkom bezplatne, v bežne používanom strojovo čitateľnom formáte, ak nejde o zákonnú výnimku.
- Export má zahŕňať stránky, aktuality, médiá v dostupnom formáte, konfiguráciu a kontaktné správy, ku ktorým má zákazník právo.
- Oddeliť export zákazníckych dát od interných bezpečnostných záznamov a cudzích osobných údajov.

## 8. GDPR a DPA

### 8.1 Povinnosti platformy ako prevádzkovateľa

Informačné oznámenie podľa čl. 13/14 musí pre každý účel uvádzať prevádzkovateľa, kontakt, účel, právny základ, príjemcov, prenosy, dobu uchovania, práva, zdroj údajov a automatizované rozhodovanie, ak existuje. Samostatne opísať aspoň:

- účet a autentifikáciu;
- zmluvu, platbu a fakturáciu;
- podporu a komunikáciu;
- bezpečnostné logy a prevenciu zneužitia;
- analytiku/cookies podľa skutočného nasadenia;
- AI vstupy a výstupy podľa skutočného dodávateľa a nastavenia.

Viesť záznamy o spracovateľských činnostiach. Výnimka pre subjekty pod 250 osôb sa pravdepodobne nedá použiť na všetko, pretože spracúvanie účtov a hostingu nie je príležitostné a môže zahŕňať osobitné kategórie.

### 8.2 DPA podľa čl. 28

DPA musí konkrétne obsahovať:

- predmet, dobu, povahu a účel spracúvania;
- typy údajov a kategórie dotknutých osôb;
- práva a povinnosti zákazníka-prevádzkovateľa;
- spracúvanie iba podľa zdokumentovaných pokynov;
- mlčanlivosť oprávnených osôb;
- primerané technické a organizačné opatrenia;
- pravidlá ďalších sprostredkovateľov, predchádzajúce oznámenie zmeny a možnosť námietky;
- pomoc s právami dotknutých osôb, bezpečnosťou, incidentmi, DPIA a konzultáciami;
- oznamovanie porušenia ochrany údajov zákazníkovi bez zbytočného odkladu, interné SLA a povinný obsah hlásenia;
- vrátenie alebo vymazanie po skončení podľa voľby zákazníka, okrem zákonnej povinnosti uchovať údaje;
- audity, informácie o súlade a postup pri nezákonnom pokyne;
- miesta spracúvania a mechanizmy prenosov mimo EHP.

### 8.3 Kontaktný formulár kandidáta — odložené mimo MVP

Pre launch sa používa iba priamy `mailto:` odkaz. Správa sa neodosiela ani neukladá prostredníctvom WebPreKandidata. Hosted formulár musí zostať globálne vypnutý a serverová akcia musí zlyhať ešte pred validáciou, databázovým zápisom alebo e-mailovým doručením. Nasledujúce požiadavky sa uplatnia až pred jeho budúcim opätovným zapnutím.

Pred aktiváciou musí kandidát vyplniť konfiguráciu ochrany súkromia:

- svoju identitu a kontakt prevádzkovateľa;
- účel spracúvania;
- zvolený právny základ podľa čl. 6;
- prípadnú výnimku podľa čl. 9, ak správy môžu odhaliť politické názory;
- príjemcov a dobu uchovania;
- informáciu o právach a dozornom orgáne;
- či a ako odpovedá na žiadosti dotknutých osôb.

Platforma vygeneruje náhľad, ale kandidát musí potvrdiť správnosť. Pri formulári:

- zbierať iba nevyhnutné polia; telefón a ďalšie údaje majú byť voliteľné, ak nie sú potrebné;
- zobraziť informačné oznámenie pred odoslaním;
- pridať upozornenie, aby návštevník neposielal zbytočné citlivé údaje;
- nepoužívať všeobecný marketingový súhlas ako podmienku odoslania správy;
- neposielať obsah správy do AI ani analytiky ako predvolené správanie;
- chrániť formulár proti spamu spôsobom primeraným súkromiu;
- umožniť kandidátovi nastaviť retenciu, export a vymazanie;
- neposielať celý citlivý obsah do bežného e-mailu, ak postačí upozornenie a bezpečné zobrazenie po prihlásení.

### 8.4 Bezpečnostné minimum

- TLS, bezpečné heslovanie, MFA minimálne pre administrátorov a odporúčane zákazníkov;
- oddelenie tenantov a autorizačné testy pri každom prístupe k projektu;
- šifrovanie záloh a citlivých dát v úložisku podľa rizika;
- obmedzený prístup podpory, časovo ohraničené oprávnenia a audit;
- ochrana webhookov, CSRF/XSS/SSRF, rate limiting a bezpečný upload;
- pravidelné zálohy a overená obnova;
- proces incidentu s evidenciou, posúdením rizika a eskaláciou včas pre 72-hodinovú lehotu prevádzkovateľa;
- pravidelná kontrola prístupov a dodávateľov;
- zákaz zapisovať heslá, platobné údaje, celé kontaktné správy alebo tajné kľúče do aplikačných logov.

### 8.5 Dodávatelia a prenosy

Pred launchom inventarizovať minimálne hosting, databázu, objektové úložisko, e-mail, platbu, monitoring, podporu, analytiku a AI. Pre každého uložiť zmluvu/DPA, účel, dátové kategórie, lokality, ďalších sprostredkovateľov, prenosový mechanizmus a dátum kontroly. Značka dodávateľa ani údaj „EU region“ sám osebe nepotvrdzuje, že žiadny prenos mimo EHP nenastáva.

## 9. Hranica služby podľa nariadenia (EÚ) 2024/900

Aktuálny produkt neimplementuje režim vydavateľa politickej reklamy. Kandidát používa samoobslužný editor vlastného webu, sám určuje a kontroluje obsah a sám spúšťa jeho organické publikovanie. Cena Basic/Plus je cenou za editor, technické vytvorenie a hosting, nie za umiestnenie alebo dosah konkrétnej politickej správy.

Preto sa nevyžaduje:

- sponzorský a finančný formulár pred publikovaním;
- označenie „Politická reklama“ na kandidátskom webe;
- transparentné oznámenie a jeho verejný JSON;
- sedemročný politicko-reklamný snapshot;
- hlásenie politickej reklamy alebo integrácia európskeho úložiska.

Produkt bez nového právneho posúdenia nesmie pridať platený boosting, nákup mediálneho priestoru, personalizované cielenie, distribúciu cez vlastné publikum platformy ani službu, pri ktorej WebPreKandidata.sk rozhoduje o politickom posolstve alebo jeho dosahu. Bežné publikačné snapshoty zostávajú kvôli oddeleniu konceptu a verejnej verzie, nie ako politicko-reklamná evidencia.

## 10. AI Act a AI návrhy

Čl. 4 AI Act o AI gramotnosti sa uplatňuje od 2. februára 2025. Transparentnostné povinnosti čl. 50 sa uplatňujú od 2. augusta 2026. Obmedzené prechodné obdobie podľa nariadenia (EÚ) 2026/1744 sa týka označovacej povinnosti určitých poskytovateľov systémov podľa čl. 50 ods. 2; nie je všeobecným odkladom povinností zákazníka/platformy pri publikovaní textu.

### 10.1 Bezpečný model pre textové návrhy

- AI vytvára iba koncept, nikdy ho sama nepublikuje.
- Editor jasne označí AI návrh a vyžaduje aktívne **„Skontrolovať a schváliť na publikovanie“**.
- Zákazník potvrdí vecnú správnosť, zákonnosť a vlastnú redakčnú zodpovednosť.
- Uloží sa model/dodávateľ, čas, verzia výstupu, následné zmeny, schvaľovateľ a čas schválenia; prompt sa neuchováva dlhšie, než je potrebné, ak obsahuje osobné údaje.
- AI nesmie automaticky vytvárať tvrdenia o protikandidátoch, citácie, štatistiky alebo fakty bez upozornenia na overenie.
- AI nespracúva správy z kontaktného formulára ani osobitné kategórie ako predvolené správanie.
- Zákazníka informovať, ktorému dodávateľovi sa údaje odosielajú a či dochádza k prenosu mimo EHP.

Čl. 50 ods. 4 umožňuje pri AI texte o veciach verejného záujmu výnimku z verejného označenia, ak prebehla ľudská kontrola alebo redakčná kontrola a fyzická či právnická osoba nesie redakčnú zodpovednosť. Nespoliehať sa na výnimku bez vyššie uvedeného workflow a dôkazov. Právnik má potvrdiť, ako sa redakčná zodpovednosť premietne do VOP a UI.

### 10.2 Obrázky, audio a video

Generovanie alebo manipulácia obrázkov, audia či videa môže spustiť osobitné povinnosti pri deepfake obsahu. Takú funkciu nezapínať bez strojovo čitateľného označenia poskytovateľa, viditeľného oznámenia používateľovi/publiku a osobitného právneho posúdenia. Pri priamom AI chatbote musí byť používateľ informovaný, že komunikuje so systémom AI, ak to nie je zjavné.

### 10.3 Prevádzka

- určiť zodpovednú osobu za AI;
- vyškoliť support, marketing a administrátorov podľa rizika ich práce;
- viesť záznam školenia a revízie;
- uchovať karty/modelové informácie a zmluvné podmienky dodávateľa;
- mať proces na nahlásenie nesprávneho alebo škodlivého výstupu;
- pred každou zmenou modelu skontrolovať ochranu údajov, výstupy a zmluvné podmienky.

## 11. DSA: minimálny implementačný režim

Kým nie je právne potvrdená presná kvalifikácia, zverejniť elektronický kontakt na podnety k nezákonnému obsahu a zaviesť interný postup, ktorý:

- umožní presne označiť obsah/URL;
- prijme vysvetlenie nezákonnosti a kontaktné údaje;
- umožní vyhlásenie v dobrej viere;
- okamžite potvrdí prijatie;
- odlíši podnet k obsahu od spotrebiteľskej reklamácie;
- vedie k rozhodnutiu, nie k automatickému odstráneniu bez posúdenia.

Ak sa obsah obmedzí, zákazník dostane zrozumiteľné odôvodnenie: čo bolo obmedzené, skutkový a zmluvný/právny základ, úloha automatizácie a dostupná náprava. VOP musia opísať moderovanie vrátane algoritmických nástrojov. Zriadiť elektronické kontaktné miesto pre orgány a používateľov. Právnik má overiť aj povinnosť právneho zástupcu, reportovania a prípadnú mikro/malú výnimku podľa aktuálnej veľkosti podniku.

## 12. Databázový návrh

Názvy sú orientačné. Dôležitá je oddelenosť domén, verzovanie a dôkazy.

### 12.1 Zmluvy a spotrebiteľ

| Entita | Kľúčové polia |
|---|---|
| `legal_document_versions` | `id`, `type`, `version`, `locale`, `content_hash`, `published_at`, `effective_from`, nemenný súbor/obsah |
| `plans` / `plan_versions` | názov, konečná cena, mena, daňový režim, trvanie, limity, funkcie, podpora, `effective_from/to` |
| `orders` | zákazník, B2C/B2B vyhlásenie, plan version, cena, daň, mena, vznik zmluvy, začiatok/koniec, payment ref, stav |
| `order_legal_acceptances` | order, document version, presné znenie vyhlásenia, boolean, UTC čas, používateľ, IP/user-agent primerane a s retenciou |
| `early_performance_requests` | order, vyžiadané/nevyžiadané, text/version, čas, plánovaný a skutočný štart |
| `withdrawal_requests` | order, meno, elektronický kontakt, prijaté o, kanál, obsah podania, confirmation o, stav, výpočet/refund |
| `complaints` | order/project, typ vady, prijaté/potvrdené, deadline, dôkazy, rozhodnutie, dôvod, náprava/refund |

### 12.2 Projekty a ochrana údajov

| Entita | Kľúčové polia |
|---|---|
| `projects` | owner, status, plan version, publication gate, publikované od/do, domain, locale |
| `project_versions` | immutable snapshot/hash stránok, autor, čas, published flag |
| `controller_privacy_configs` | identita kandidáta, účely, čl. 6 základ, čl. 9 výnimka, retencia, príjemcovia, notice version, potvrdenie |
| `dpa_acceptances` | customer, DPA version, subprocessor-list version, accepted_by/at |
| `contact_submissions` | project, údaje po poliach, prijaté, retention deadline, export/delete state; oddelené šifrovanie a oprávnenia |
| `subprocessor_versions` | dodávateľ, služba, lokality, prenosový mechanizmus, DPA review, effective dates |
| `data_subject_requests` | rola platformy, typ práva, identita, termín, kroky, export/delete dôkaz |
| `security_incidents` | zistenie, rozsah, dotknuté roly, riziko, notifikácie, časy, nápravné kroky |

### 12.3 Vlastný web kandidáta

Nevytvárať tabuľky pre sponzorov politickej reklamy, transparentné oznámenia, politické snapshoty ani európske úložisko. Existujúci `site_publications` zostáva nemennou verejnou verziou obsahu z produktových a bezpečnostných dôvodov.

Do produktovej dokumentácie a code review checklistu zapísať hraničné funkcie, ktoré vyžadujú nové právne posúdenie: platený dosah, boosting, nákup médií, personalizované cielenie a distribúcia cez vlastné kanály platformy.

### 12.4 AI a audit

| Entita | Kľúčové polia |
|---|---|
| `ai_generations` | project/content, provider/model/version, input hash alebo minimalizovaný prompt, output version, generated_at, privacy flag |
| `editorial_approvals` | content version, reviewer, statement version, approved_at, subsequent edit invalidates approval |
| `audit_events` | UTC čas, actor/service, action, entity/id/version, request/correlation ID, result, legal basis tag, before/after hash, metadata bez tajomstiev |

### 12.5 Vlastnosti auditu

- append-only na aplikačnej úrovni; oprava vytvorí novú udalosť;
- oddelené oprávnenie na čítanie a export;
- čas synchronizovaný a uložený v UTC, v UI zobrazený aj v lokálnej zóne;
- integritný hash alebo iný mechanizmus odhalenia manipulácie;
- korelačné ID naprieč checkoutom, platbou a publikovaním;
- žiadne heslá, tajné kľúče, celé platobné údaje ani zbytočný obsah osobných správ;
- monitorovanie výpadku auditu — kritická operácia sa nemá tváriť ako úspešná bez požadovaného záznamu.

## 13. Retencia

Pred launchom schváliť konkrétnu tabuľku retencie. Minimálne pravidlá:

- verzie zmluvných dokumentov, objednávky, súhlasy, odstúpenia, reklamácie a platby: podľa konkrétnych premlčacích, účtovných a daňových lehôt potvrdených účtovníkom/právnikom;
- kontaktné správy: lehota určená kandidátom podľa účelu, s technicky vynúteným automatickým vymazaním;
- bezpečnostné logy: krátka, odôvodnená lehota podľa rizika, nie „navždy“;
- AI vstupy/výstupy: iba po dobu potrebnú na editor, audit a riešenie incidentov; dodávateľ nesmie trénovať na obsahu bez osobitného právneho základu a transparentnosti;
- zálohy: zdokumentovaný cyklus prepisu a obnovenia; vymazané dáta sa nesmú bežne obnoviť do produkcie.

Každý záznam má mať `retention_rule_id`, vypočítaný `delete_after`, výnimku `legal_hold` s dôvodom a auditovanú likvidáciu.

## 14. Acceptance criteria

### AC-A — identita a dokumenty

- [ ] V každej verejnej právnej stránke sú zhodné a overené meno, adresa, IČO, DIČ/IČ DPH, telefón, e-mail, register a číslo zápisu.
- [ ] Cena sa používateľovi vždy zobrazuje ako konečná a zodpovedá reálnemu statusu DPH.
- [ ] Každá objednávka odkazuje na nemenné verzie VOP, cenníka, odstúpenia a DPA.
- [ ] Starú verziu možno spätne stiahnuť, ale nie upraviť.

### AC-B — checkout

- [ ] Bezprostredne pred tlačidlom sú hlavné vlastnosti, konečná cena a presné trvanie.
- [ ] Tlačidlo znie „Objednávka s povinnosťou platby“ alebo jednoznačne rovnako.
- [ ] Žiadny platený doplnok ani skoré plnenie nie sú predvolene zaškrtnuté.
- [ ] Spotrebiteľ môže objednať bez skorého plnenia; verejná aktivácia sa vtedy odloží.
- [ ] Skorá aktivácia bez evidovaného výslovného súhlasu je technicky nemožná.
- [ ] Duplicitný platobný webhook nevytvorí druhú zmluvu ani druhú aktiváciu.
- [ ] Potvrdenie obsahuje všetky zmluvné informácie na trvanlivom médiu.

### AC-C — odstúpenie

- [ ] Odkaz „Odstúpiť od zmluvy tu“ je dostupný počas celej zákonnej lehoty v účte aj pri probléme s prihlásením.
- [ ] Flow má požadované dva kroky a finálne tlačidlo „Potvrdiť odstúpenie od zmluvy“.
- [ ] Potvrdenie s obsahom, dátumom a časom príde bezodkladne.
- [ ] Systém prijme aj e-mailové odstúpenie a používa rovnaký workflow.
- [ ] Refund má deadline 14 dní a alarm pri omeškaní.
- [ ] Odstúpenie nevymaže obsah skôr, než prebehne zákonný export.

### AC-D — digitálna služba

- [ ] Každý balík má testovateľné trvanie a limity zhodné v UI, databáze, VOP a potvrdení.
- [ ] Reklamácia okamžite dostane ID a písomné potvrdenie.
- [ ] Deadline odstránenia vady je najviac 30 dní, ak nie je zdokumentovaný objektívny dôvod.
- [ ] Zamietnutie obsahuje dôvod a informáciu o náprave/ARS.
- [ ] Zákazník vie exportovať vlastný obsah v bežne používanom strojovo čitateľnom formáte.
- [ ] Negatívna zmena služby spustí právne schválenú notifikáciu a príslušné práva.

### AC-E — GDPR a vypnutý hosted formulár

- [ ] Role prevádzkovateľa a sprostredkovateľa sú zhodné v architektúre, DPA a ochrane súkromia.
- [ ] Verejný kandidátsky web zobrazuje iba `mailto:`, telefón a podporované sociálne siete; hosted formulár sa nevykreslí.
- [ ] Stored content ani priamy server-action request nedokážu obísť globálne vypnutie hosted formulára.
- [ ] Vypnutá serverová cesta nevykoná validáciu osobných údajov, databázový zápis, AI/analytiku ani e-mailové doručenie.
- [ ] Každý dodávateľ má evidovanú DPA, lokalitu a prenosový mechanizmus.
- [ ] Ochrana súkromia presne rozlišuje priamy e-mail kandidátovi od formulárov samotnej platformy.
- [ ] Ak sa hosted formulár v budúcnosti zapne, release gate znovu vyžaduje DPA, informačné oznámenie, retenciu, bezpečné doručovanie a tenant-isolation testy.

### AC-F — hranica služby

- [ ] Verejný web neobsahuje systémové označenie politickej reklamy ani formulár sponzora.
- [ ] Checkout a VOP opisujú cenu ako editor, technické vytvorenie a hosting, nie platený dosah konkrétnej správy.
- [ ] Platforma neposkytuje boosting, nákup mediálneho priestoru, personalizované cielenie ani distribúciu cez vlastné publikum.
- [ ] AI obsah zostáva návrhom, ktorý kandidát kontroluje a publikuje sám.
- [ ] Produktový checklist vyžaduje nové právne posúdenie pred pridaním ktorejkoľvek hraničnej reklamnej funkcie.

### AC-G — AI

- [ ] AI nikdy nepublikuje bez ľudského schválenia.
- [ ] Každá publikovaná AI verzia má evidovaného schvaľovateľa a redakčné vyhlásenie.
- [ ] Zmena obsahu po schválení schválenie zneplatní.
- [ ] Používateľ vidí, že ide o AI koncept, pozná dodávateľa a povinnosť overiť fakty.
- [ ] AI obrázky/audio/video sú vypnuté, kým nemajú osobitný transparentný režim.
- [ ] Relevantné osoby absolvovali zdokumentované AI školenie.

### AC-H — DSA a moderovanie

- [ ] Pri každom verejnom obsahu je dostupné hlásenie nezákonného obsahu.
- [ ] Rozhodnutie o obmedzení má faktický a právny/zmluvný dôvod a informáciu o náprave.
- [ ] Zákazník je o zásahu informovaný a zásah je auditovaný.
- [ ] Kontaktné miesto pre používateľov a orgány je funkčné.

## 15. Poradie implementácie

### Fáza 0 — právne rozhodnutia a inventúra

1. Doplniť LB-01 z úradného výpisu a potvrdiť DPH.
2. Určiť presné trvanie a parametre Basic/Plus.
3. Zdokumentovať hranicu samoobslužného editora/hostingu voči platenému dosahu, boostingu a cieleniu; samostatne posúdiť DSA.
4. Inventarizovať všetkých dodávateľov, dáta a prenosy.

**Výstup:** vlastníkom podpísaný decision log vrátane prijatého zostatkového rizika; bez neho sa nezačína verejné publikovanie.

### Fáza 1 — právny a dátový základ

1. Finalizovať VOP, odstúpenie, reklamácie, ochranu súkromia, DPA a primeraný postup pre podnety k obsahu.
2. Zaviesť verzie dokumentov, plan versions a append-only audit.
3. Zaviesť roly/oprávnenia, subprocessor register a retenciu.

### Fáza 2 — spotrebiteľský predaj

1. Prebudovať checkout a potvrdenie na trvanlivom médiu.
2. Implementovať odložené/skoré plnenie.
3. Implementovať online odstúpenie, refund a export.
4. Implementovať reklamácie a ARS eskaláciu.

Platený checkout sa zapne až po prechode AC-A až AC-D.

### Fáza 3 — GDPR a kontakt kandidáta (MVP uzavreté)

1. Zachovať hosted kontaktný formulár globálne vypnutý na UI aj serveri.
2. Používať iba `mailto:`, telefón a podporované sociálne siete.
3. Udržiavať regresné testy fail-closed správania a presný text ochrany súkromia.

DPA acceptance, candidate privacy config, inbox a retencia kontaktných správ sa vrátia do plánu iba pred budúcim zapnutím hosted formulára.

### Fáza 4 — hranica služby a DSA

1. Zachovať samoobslužné publikovanie bez plateného dosahu, boostingu a personalizovaného cielenia.
2. Neimplementovať politicko-reklamný formulár, označenie, transparentnú stránku ani európske úložisko.
3. Potvrdiť DSA kvalifikáciu a podľa výsledku zaviesť najmenší primeraný elektronický kontakt a interný postup pre podnety k nezákonnému obsahu.

Verejné kandidátske weby sa zapnú po prechode AC-F a po uzavretí primeraného rozsahu AC-H.

### Fáza 5 — AI

1. Ľudské schválenie, redakčná zodpovednosť a audit.
2. Transparentnosť, dodávateľská/GDPR kontrola a AI gramotnosť.
3. Samostatné testy na faktické tvrdenia, osobné údaje a prompt injection.

AI návrhy sa zapnú až po prechode AC-G. Generovanie obrazov, audia a videa riešiť ako samostatný projekt.

### Fáza 6 — predprodukčný audit

- vlastník podpíše checklist blockerov a prijaté zostatkové právne riziká; externá právna kontrola zostáva odporúčaná;
- ochrana údajov/DPA prejde kontrolou rolí a dodávateľov;
- účtovník potvrdí ceny, DPH a retenčné lehoty účtovných dokladov;
- vykoná sa end-to-end test B2C objednávky, odstúpenia, refundu, reklamácie a publikovania;
- uloží sa dôkazný balík testu s časmi, screenshotmi a hashmi dokumentov;
- nastaví sa pravidelný právny a dodávateľský review, najmä pred každými voľbami.

## 16. Otázky, ktoré musí právnik uzavrieť

1. Potvrdzuje konkrétny samoobslužný model bez plateného dosahu, boostingu a cielenia pracovný záver mimo povinností vydavateľa politickej reklamy?
2. Ktorá budúca funkcia by už túto hranicu prekročila a vyžadovala nový režim podľa nariadenia (EÚ) 2024/900?
3. Je platforma hostingovou službou a online platformou podľa DSA; na ktoré mikro/malé výnimky sa môže spoľahnúť a ako sa veľkosť pravidelne overí?
4. Aká metodika pomernej ceny je primeraná pri odstúpení po skoršej aktivácii?
5. Aké presné trvanie, update policy, exportná lehota a následné mazanie budú v zmluve?
6. Ktorý právny základ a výnimku čl. 9 môže typický kandidát použiť pri kontaktných správach a aké varianty šablóny sú prípustné?
7. Spĺňa AI editorial workflow výnimku čl. 50 ods. 4 a aké verejné označenie zostáva potrebné?
8. Ktoré orgány dohľadu a kontakty treba uviesť a aké retenčné lehoty platia pre objednávky, reklamácie a účtovné doklady?

## 17. Oficiálne zdroje overené k 13. 8. 2026

### Slovenské predpisy a orgány

- [Zákon č. 108/2024 Z. z. o ochrane spotrebiteľa — Slov-Lex](https://www.slov-lex.sk/ezbierky/pravne-predpisy/SK/ZZ/2024/108/) — najmä § 5, § 15, § 17, § 20, § 20a, § 21 a § 22; časové znenie účinné k 13. 8. 2026.
- [Občiansky zákonník č. 40/1964 Zb. — Slov-Lex](https://www.slov-lex.sk/ezbierky/pravne-predpisy/SK/ZZ/1964/40/) — § 119a a § 852a až § 852m o digitálnom plnení.
- [Zákon č. 22/2004 Z. z. o elektronickom obchode — Slov-Lex](https://www.slov-lex.sk/ezbierky/pravne-predpisy/SK/ZZ/2004/22/) — identifikačné údaje, oprava chýb, zmluvné kroky a potvrdenie objednávky.
- [Zákon č. 181/2014 Z. z. o volebnej kampani — Slov-Lex](https://www.slov-lex.sk/ezbierky/pravne-predpisy/SK/ZZ/2014/181/) — najmä § 15, označenie objednávateľa a dodávateľa.
- [Ministerstvo vnútra SR — informácie ku kampani kandidátov](https://www.minv.sk/?oso18_kampanneka3=) — úradné vysvetlenie označovania kampane.
- [Slovenská obchodná inšpekcia — pravidlá ARS](https://www.soi.sk/alternativne-riesenie-spotrebitelskych-sporov/pravidla-ars) a [Ministerstvo hospodárstva SR — alternatívne riešenie spotrebiteľských sporov](https://www.economy.gov.sk/obchod/ochrana-spotrebitela/alternativne-riesenie-spotrebitelskych-sporov-1/alternativne-riesenie-spotrebitelskych-sporov).
- [Úrad na ochranu osobných údajov SR — štandardné doložky sprostredkovateľskej zmluvy](https://dataprotection.gov.sk/sk/ine/vzory-formulare-stiahnutie/standardne-zmluvne-dolozky-sprostredkovatelska-zmluva/).
- [Živnostenský register SR](https://www.zrsr.sk/) — presné identifikačné údaje treba manuálne overiť z aktuálneho výpisu.

### Európska únia

- [Nariadenie (EÚ) 2024/900 o transparentnosti a cielení politickej reklamy — EUR-Lex](https://eur-lex.europa.eu/eli/reg/2024/900/oj).
- [Usmernenia Komisie k nariadeniu 2024/900 — Ú. v. EÚ C/2025/5514](https://eur-lex.europa.eu/eli/C/2025/5514/oj/eng).
- [Vykonávacie nariadenie (EÚ) 2025/1410 o formáte označenia a transparentného oznámenia](https://eur-lex.europa.eu/eli/reg_impl/2025/1410/oj).
- [Vykonávacie nariadenie (EÚ) 2026/818 o európskom úložisku online politickej reklamy](https://eur-lex.europa.eu/eli/reg_impl/2026/818/oj/eng).
- [Európska komisia — transparentnosť a cielenie politickej reklamy](https://commission.europa.eu/strategy-and-policy/policies/justice-and-fundamental-rights/democracy-eu-citizenship-anti-corruption/democracy-and-electoral-rights/transparency-and-targeting-political-advertising_en) — aktuálny stav zriaďovania európskeho úložiska.
- [GDPR — nariadenie (EÚ) 2016/679](https://eur-lex.europa.eu/eli/reg/2016/679/oj) — najmä čl. 9, 13, 14, 28, 30, 32, 33 a kapitola V.
- [EDPB Guidelines 07/2020 o pojmoch prevádzkovateľ a sprostredkovateľ](https://www.edpb.europa.eu/documents/guideline/guidelines-072020-on-the-concepts-controller-and-processor-in-the-gdpr_en).
- [AI Act — nariadenie (EÚ) 2024/1689](https://eur-lex.europa.eu/eli/reg/2024/1689/oj) — najmä čl. 4 a čl. 50.
- [Nariadenie (EÚ) 2026/1744, zmeny AI Act](https://eur-lex.europa.eu/legal-content/EN/ALL/?uri=CELEX:32026R1744).
- [Európska komisia — FAQ k transparentnosti podľa čl. 50 AI Act](https://digital-strategy.ec.europa.eu/en/faqs/transparency-obligations-under-article-50-ai-act) a [usmernenia k transparentnosti AI](https://digital-strategy.ec.europa.eu/en/library/guidelines-transparency-obligations-providers-and-deployers-ai-systems).
- [Digital Services Act — nariadenie (EÚ) 2022/2065](https://eur-lex.europa.eu/eli/reg/2022/2065/oj).

## 18. Definition of done

Projekt je právne pripravený na launch až vtedy, keď:

1. všetky červené blockery majú vlastníka, dôkaz a písomné schválenie;
2. produkčný systém technicky vynucuje povinnosti, nespolieha sa iba na text VOP;
3. testovací dôkaz preukáže checkout, odstúpenie, refund, reklamáciu, primerané GDPR flowy a serverovo vynútené publikovanie; produktové testy zároveň potvrdia, že platforma neposkytuje platený dosah, boosting ani personalizované cielenie;
4. verejné tvrdenia, VOP, databáza a skutočné správanie produktu sú zhodné;
5. existuje incidentný kontakt a primeraný interný postup pre podnety k nezákonnému obsahu;
6. každá budúca zmena balíka, dodávateľa, AI modelu alebo publikačného flow prejde právnym, privacy a bezpečnostným change review.
