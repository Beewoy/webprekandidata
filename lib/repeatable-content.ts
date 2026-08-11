import type { CivicIconName } from "./civic-icons";

export type RepeatableContentConfig = {
  defaultIcon: CivicIconName;
  label: string;
  supportsDetails?: boolean;
  items: Array<{ detail?: string; icon: CivicIconName; title: string; text: string }>;
};

export const repeatableContent: Record<string, RepeatableContentConfig> = {
  "o-mne": {
    defaultIcon: "together",
    label: "Moje hodnoty",
    items: [
      { icon: "fairness", title: "Zodpovednosť", text: "Sľubujem len to, čo vieme reálne splniť." },
      { icon: "services", title: "Otvorenosť", text: "Rozhodnutia mesta majú byť zrozumiteľné a verejné." },
      { icon: "together", title: "Spolupráca", text: "Dobré riešenia vznikajú v rozhovore s obyvateľmi." },
    ],
  },
  "preco-kandidujem": {
    defaultIcon: "safety",
    label: "Hlavné dôvody",
    items: [
      { icon: "safety", title: "Bezpečné ulice", text: "Lepšie osvetlenie a pokojné verejné priestory." },
      { icon: "families", title: "Mesto pre rodiny", text: "Dostupné služby, školy a miesta pre voľný čas." },
      { icon: "governance", title: "Férová samospráva", text: "Transparentné hospodárenie a otvorená komunikácia." },
    ],
  },
  program: {
    defaultIcon: "ideas",
    label: "Body programu",
    supportsDetails: true,
    items: [
      { icon: "transport", title: "Bezpečná doprava", text: "Opravy ciest, prehľadné značenie a lepšie spojenia MHD." },
      { icon: "trees", title: "Viac zelene", text: "Nové stromy, čisté parky a oddychové zóny vo všetkých štvrtiach." },
      { icon: "innovation", title: "Služby bez čakania", text: "Viac vybavovania online a jasné lehoty mestského úradu." },
    ],
  },
};
