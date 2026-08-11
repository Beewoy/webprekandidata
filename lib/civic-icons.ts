import type { LucideIcon } from "lucide-react";
import {
  Accessibility,
  BadgeEuro,
  BriefcaseBusiness,
  BusFront,
  GraduationCap,
  Handshake,
  HeartPulse,
  House,
  Landmark,
  Leaf,
  Lightbulb,
  MessageCircleMore,
  Scale,
  ShieldCheck,
  Sparkles,
  Trees,
  UsersRound,
  Wifi,
  Wrench,
} from "lucide-react";

export type CivicIconName =
  | "accessibility"
  | "economy"
  | "education"
  | "environment"
  | "fairness"
  | "families"
  | "finance"
  | "governance"
  | "health"
  | "housing"
  | "ideas"
  | "infrastructure"
  | "innovation"
  | "jobs"
  | "safety"
  | "services"
  | "transport"
  | "trees"
  | "together";

export type CivicIconOption = {
  Icon: LucideIcon;
  key: CivicIconName;
  label: string;
};

// Neutrálna občianska sada: témy komunálnej politiky bez straníckych symbolov.
export const civicIconOptions: CivicIconOption[] = [
  { key: "safety", label: "Bezpečnosť", Icon: ShieldCheck },
  { key: "families", label: "Rodiny a komunita", Icon: UsersRound },
  { key: "governance", label: "Samospráva", Icon: Landmark },
  { key: "fairness", label: "Férovosť", Icon: Scale },
  { key: "together", label: "Spolupráca", Icon: Handshake },
  { key: "services", label: "Komunikácia a služby", Icon: MessageCircleMore },
  { key: "transport", label: "Doprava", Icon: BusFront },
  { key: "infrastructure", label: "Infraštruktúra", Icon: Wrench },
  { key: "environment", label: "Životné prostredie", Icon: Leaf },
  { key: "trees", label: "Zeleň a parky", Icon: Trees },
  { key: "education", label: "Školstvo", Icon: GraduationCap },
  { key: "health", label: "Zdravie", Icon: HeartPulse },
  { key: "housing", label: "Bývanie", Icon: House },
  { key: "jobs", label: "Práca a podnikanie", Icon: BriefcaseBusiness },
  { key: "finance", label: "Verejné financie", Icon: BadgeEuro },
  { key: "accessibility", label: "Dostupnosť", Icon: Accessibility },
  { key: "innovation", label: "Digitalizácia", Icon: Wifi },
  { key: "ideas", label: "Nové riešenia", Icon: Lightbulb },
  { key: "economy", label: "Čistota a poriadok", Icon: Sparkles },
];

export const defaultCivicIcon: CivicIconName = "governance";

export function isCivicIconName(value: unknown): value is CivicIconName {
  return typeof value === "string" && civicIconOptions.some((option) => option.key === value);
}

export function normalizeCivicIcon(value: unknown, fallback: CivicIconName = defaultCivicIcon): CivicIconName {
  return isCivicIconName(value) ? value : fallback;
}

export function getCivicIconOption(value: unknown, fallback: CivicIconName = defaultCivicIcon): CivicIconOption {
  const key = normalizeCivicIcon(value, fallback);
  return civicIconOptions.find((option) => option.key === key) ?? civicIconOptions[0];
}
