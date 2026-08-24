export type Testimonial = {
  rating: number;
  text: string;
  author: string;
  role: string;
  municipality?: string;
  image?: string;
  featured: boolean;
};

export const TESTIMONIALS: Testimonial[] = [
  {
    rating: 5,
    text: "Rýchle spustenie a jednoduchý editor.\nNa bežnú stránku to úplne stačí a nemusel som riešiť žiadne technické veci.",
    author: "Michal Baran",
    role: "Kandidát",
    image: "/images/testimonials/michal-baran.jpg",
    featured: true,
  },
  {
    rating: 5,
    text: "Náhľad som mal hotový za večer. Nemusel som čakať na programátora a hneď som videl, ako bude web vyzerať na mobile aj na počítači.",
    author: "Pilotný používateľ",
    role: "Kandidát do zastupiteľstva",
    featured: false,
  },
  {
    rating: 5,
    text: "Najväčšia úľava bola, že rozpracovaný web ostal súkromný. Zverejnil som ho až vtedy, keď som bol spokojný s textami aj fotkami.",
    author: "Pilotný používateľ",
    role: "Kandidát na starostu",
    featured: false,
  },
];
