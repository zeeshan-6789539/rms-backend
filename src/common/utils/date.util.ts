// Swaps the day of a YYYY-MM-DD date string, e.g. ('2026-09-01', 5) -> '2026-09-05'
export const withDayOfMonth = (date: string, day: number): string =>
  `${date.slice(0, 8)}${String(day).padStart(2, '0')}`;
