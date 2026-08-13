# Cursor prompt — právne minimum pred spustením

Pokračuj v projekte WebPreKandidata.sk podľa `AGENTS.md`, `docs/IMPLEMENTATION_STATUS.md`, `docs/ARCHITECTURE.md` a `docs/LEGAL_IMPLEMENTATION.md`. Implementuj iba zostávajúce právne minimum pre platené spustenie. Zachovaj demo režim, RLS, oddelenie konceptu od publikovanej verzie a neprepisuj už aplikované migrácie.

## Produktové vymedzenie

WebPreKandidata.sk je samoobslužný editor a hosting vlastného webu kandidáta. Kandidát:

- sám zadáva a kontroluje obsah;
- sám spúšťa organické zverejnenie;
- nekupuje cez platformu reklamný priestor ani dosah;
- nepoužíva cez platformu boosting, personalizované cielenie ani distribúciu do publika WebPreKandidata.sk.

V tomto rozsahu **neimplementuj**:

- formulár sponzora alebo financovania politickej reklamy;
- vyhlásenia podľa čl. 5 ods. 2 nariadenia (EÚ) 2024/900;
- verejný banner „Politická reklama“;
- transparentné oznámenie ani JSON politickej reklamy;
- sedemročné politicko-reklamné snapshoty;
- európske úložisko, exportér, adaptér, worker ani stav odoslania;
- osobitný formulár na hlásenie politickej reklamy alebo moderátorský dashboard iba z tohto dôvodu;
- publishing gate založený na politicko-reklamných údajoch.

Neobnovuj odstránené migrácie `0029`, `0030` a `0031` ani odstránené routy a komponenty politickej reklamy. Ak sa má produkt rozšíriť o platený dosah, nákup médií, boosting, cielenie, automatické publikovanie alebo distribúciu cez vlastné kanály platformy, najprv zastav implementáciu a vyžiadaj nové právne posúdenie.

## Zachovaj hotovú funkcionalitu

- spotrebiteľský/B2B checkout s jasnou konečnou jednorazovou cenou;
- verzovanie VOP a právnych akceptácií;
- pravidlá skorého začatia poskytovania služby;
- potvrdenie objednávky e-mailom s balíkom, cenou, obdobím a právnymi odkazmi;
- online odstúpenie, refund a reklamácie;
- samostatné sekcie `Objednávky` a `Publikovanie` s priamym tokom po úhrade;
- kontaktný údaj kandidáta cez `mailto:`; hosted kontaktný formulár zostáva vypnutý;
- AI iba ako návrhový nástroj bez automatického publikovania.

## Zostávajúce právne minimum

1. Overiť úplné identifikačné údaje prevádzkovateľa a schváliť finálne právne texty.
2. Udržať rovnaký rozsah a cenu balíkov na landing page, v aplikácii, checkoute, VOP a potvrdení objednávky.
3. Serverovo vynucovať vlastníctvo projektu, platný nárok a právne podmienky pri publikovaní.
4. Udržať funkčný proces odstúpenia, refundu a reklamácie vrátane auditných dôkazov.
5. Potvrdiť právnu kvalifikáciu podľa DSA. Do rozhodnutia zachovať primeraný elektronický kontakt na podnety k nezákonnému obsahu a interný manuálny postup; nevytvárať bez rozhodnutia rozsiahly portál.
6. Udržať AI návrhy pod ľudskou kontrolou. AI nesmie automaticky publikovať a Plus musí zostať použiteľný aj bez AI.
7. VOP a produktovú dokumentáciu formulovať v súlade so skutočným správaním aplikácie.

## Implementačné pravidlá

- Nepridávaj nové tabuľky, obrazovky ani environment premenné bez preukázanej potreby.
- Produkčná mutácia musí validovať vstup, autentifikovať používateľa a používať RLS alebo vlastnícky chránenú RPC.
- Verejný web nesmie čítať koncept priamo.
- `campaign_ends_at` a `orders.valid_until` zostávajú nullable.
- Používateľský text je po slovensky; ceny sú Basic 49,99 € a Plus 89,99 €, konečné a jednorazové.
- Dokumentáciu aktualizuj spolu so zmenou správania, schémy alebo dátového toku.

## Overenie

Pred odovzdaním spusti:

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

Pri UI zmene over 375 px aj desktop bez horizontálneho posunu. V závere uveď iba vykonané zmeny, zostávajúce právne rozhodnutia a výsledky kontrol.
