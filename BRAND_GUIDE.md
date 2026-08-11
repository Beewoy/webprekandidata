# WebPreKandidata.sk — pracovná identita

> Verzia 0.1. Identita je pripravená na vývoj produktu a môže sa neskôr vizuálne doladiť bez zmeny informačnej architektúry.

## Značka

- Oficiálny pracovný názov: **WebPreKandidata.sk**
- Doména: **webprekandidata.sk**
- Písanie v texte: `WebPreKandidata.sk`
- Písanie v URL a technických identifikátoroch: `webprekandidata.sk`

Značka má pôsobiť neutrálne, profesionálne a dostupne. Platforma nesmie vizuálne pripomínať konkrétnu politickú stranu ani vytvárať dojem, že podporuje určitý politický smer.

## Pracovné logo

- [Horizontálne logo](public/brand/logo-horizontal.svg)
- [Samostatný symbol](public/brand/logo-mark.svg)

Symbol spája okno webovej stránky a potvrdenie. Komunikuje hlavný výsledok produktu: kandidát si pripraví a zverejní hotový web.

### Použitie

- horizontálne logo v sidebare, e-mailoch a hlavičkách,
- samostatný symbol pre favicon, mobilnú navigáciu a kompaktné plochy,
- okolo loga ponechať voľný priestor aspoň vo veľkosti jednej štvrtiny výšky symbolu,
- logo nenaťahovať, neotáčať a nemeniť jeho farby podľa kandidátskej témy.

## Farby platformy

| Rola | Hodnota | Použitie |
|---|---:|---|
| Primary navy | `#163B65` | logo, navigácia, hlavné tlačidlá |
| Primary hover | `#102F52` | hover a pressed stav |
| Accent teal | `#0F766E` | aktívny stav, odkazy, zvýraznenie |
| Accent soft | `#CCFBF1` | jemné aktívne pozadie |
| Foreground | `#0F172A` | hlavný text |
| Muted foreground | `#64748B` | sekundárny text |
| Background | `#F5F8FB` | pozadie aplikácie |
| Surface | `#FFFFFF` | karty, formuláre, modaly |
| Border | `#DCE5EE` | deliace čiary a okraje |
| Success | `#15803D` | úspešné stavy |
| Warning | `#B45309` | upozornenia |
| Destructive | `#B91C1C` | mazanie a závažné chyby |

Biela na primary, accent, warning a destructive farbe spĺňa kontrast WCAG AA pre bežný text. Stav sa nikdy nesmie komunikovať iba farbou; vždy sa pridá text alebo ikona.

Farba zvolená kandidátom patrí iba do jeho verejného webu a jeho náhľadu. Nesmie meniť ovládacie prvky platformy, aby zostalo rozhranie konzistentné.

## Typografia

### Platforma

- rodina: **Inter**,
- fallback: `Arial, sans-serif`,
- nadpisy: 600–700,
- text: 400,
- labely a tlačidlá: 500–600,
- číselné údaje a ceny: tabular numerals.

Inter používame pre celý dashboard aj pracovné logo. Má vysokú čitateľnosť, podporuje slovenskú diakritiku a znižuje počet fontov potrebných na načítanie.

### Verejné kandidátske weby

Prvý template môže ponúknuť dva kontrolované typografické varianty:

1. **Inter** — moderný a vecný,
2. **Source Serif 4 + Inter** — tradičnejší nadpis a moderný text.

Typografia kandidátskeho webu je theme token a nemení typografiu dashboardu.

## Tvarový jazyk

- radius ovládacích prvkov: 8–10 px,
- radius kariet: 14–16 px,
- tieň iba jemný, primárne sa používa border,
- žiadny dekoratívny glassmorphism,
- modálne pozadie môže použiť mierny blur iba na vyjadrenie vrstvy,
- jedna konzistentná sada outline SVG ikon,
- animácie 150–250 ms a iba pre zmenu stavu.

## Tone of voice

- stručný a zrozumiteľný,
- odborný bez technického žargónu,
- neutrálny voči politickému názoru,
- podporujúci, nie manipulatívny,
- pri chybe vždy vysvetliť, čo sa stalo a ako pokračovať.

Príklady:

- „Všetky zmeny sú uložené.“
- „Doplňte portrét, aby bol web pripravený na publikovanie.“
- „AI pripravila návrh. Pred použitím si skontrolujte všetky fakty.“
- „Web sme dočasne skryli. Dôvod a možnosť odvolania nájdete nižšie.“

## Otvorené položky pred finálnym brandingom

- overiť čitateľnosť loga v 16 px favicon variante,
- vytvoriť monochromatickú a inverznú verziu,
- previesť text horizontálneho loga na krivky pre tlačové použitie,
- overiť prípadnú ochrannú známku a kolízie názvu,
- pripraviť finálny favicon a social brand asset.
