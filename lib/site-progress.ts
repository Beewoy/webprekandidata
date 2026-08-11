import type { SectionStatus } from "./site-sections";

export function calculateProgress(statuses: SectionStatus[]) {
  if (statuses.length === 0) return 0;

  const points = statuses.reduce((total, status) => {
    if (status === "complete") return total + 1;
    if (status === "started") return total + 0.5;
    return total;
  }, 0);

  return Math.round((points / statuses.length) * 100);
}

export function getProgressLabel(progress: number) {
  if (progress === 100) return "Pripravené na publikovanie";
  if (progress >= 70) return "Už len pár krokov";
  if (progress >= 35) return "Dobré základy";
  return "Začíname";
}
