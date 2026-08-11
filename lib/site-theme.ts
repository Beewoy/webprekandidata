export const campaignTemplates = [
  {
    id: "modern",
    name: "Horizont",
    description: "Vzdušná a univerzálna šablóna s portrétom vedľa hlavnej myšlienky.",
    bestFor: "Vhodná pre väčšinu kampaní",
  },
  {
    id: "bold",
    name: "Impulz",
    description: "Výrazná šablóna so silným nadpisom a energickým farebným blokom.",
    bestFor: "Pre odvážnu a dynamickú kampaň",
  },
  {
    id: "classic",
    name: "Dôvera",
    description: "Pokojná, elegantná šablóna s tradičnejším typografickým charakterom.",
    bestFor: "Pre vecnú a reprezentatívnu kampaň",
  },
] as const;

export type CampaignTemplateId = (typeof campaignTemplates)[number]["id"];

export function isCampaignTemplateId(value: unknown): value is CampaignTemplateId {
  return campaignTemplates.some((template) => template.id === value);
}

export const campaignColors = [
  { value: "#163B65", name: "Námornícka modrá" },
  { value: "#0F766E", name: "Petrolejová" },
  { value: "#6D3FA0", name: "Fialová" },
  { value: "#A04E0D", name: "Medená" },
  { value: "#A51C48", name: "Bordová" },
] as const;

export const defaultCampaignTheme = {
  template: "modern" as CampaignTemplateId,
  color: campaignColors[0].value,
};

export function normalizeCampaignColor(value: string) {
  return /^#[0-9a-f]{6}$/i.test(value) ? value.toUpperCase() : defaultCampaignTheme.color;
}

export function getReadableCampaignTextColor(hex: string) {
  const normalized = normalizeCampaignColor(hex);
  const channels = [normalized.slice(1, 3), normalized.slice(3, 5), normalized.slice(5, 7)].map((channel) => {
    const value = Number.parseInt(channel, 16) / 255;
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  const luminance = channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
  return luminance > 0.179 ? "#0B1F35" : "#FFFFFF";
}
