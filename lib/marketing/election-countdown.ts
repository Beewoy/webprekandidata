const DAY_IN_MILLISECONDS = 86_400_000;
const ELECTION_TIME_ZONE = "Europe/Bratislava";

export const ELECTION_DATE = "2026-10-24";
export const ELECTION_DATE_ISO = "2026-10-24T07:00:00+02:00";

function getCalendarDate(date: Date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: ELECTION_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));

  return {
    year: Number(values.year),
    month: Number(values.month),
    day: Number(values.day),
  };
}

export function getDaysUntilElection(
  now = new Date(),
  electionDate = ELECTION_DATE,
): number | null {
  const [year, month, day] = electionDate.split("-").map(Number);
  const current = getCalendarDate(now);
  const difference =
    Date.UTC(year, month - 1, day) -
    Date.UTC(current.year, current.month - 1, current.day);
  const daysRemaining = Math.round(difference / DAY_IN_MILLISECONDS);

  return daysRemaining >= 0 ? daysRemaining : null;
}
