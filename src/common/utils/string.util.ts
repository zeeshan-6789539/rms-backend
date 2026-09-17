export const parseCsv = (value: string): string[] =>
  value
    .split(',')
    .map((item) => item.trim())
    .filter((item) => item.length > 0);

const toLowerTrimmed = (value: string): string => value.trim().toLowerCase();

export const normalizeEmail = (value: string): string => toLowerTrimmed(value);

// Usernames are matched case-insensitively, so they are stored folded
export const normalizeUsername = (value: string): string =>
  toLowerTrimmed(value);

// Escapes the LIKE/ILIKE wildcards so user input cannot widen a search
export const escapeLikePattern = (value: string): string =>
  value.replace(/[\\%_]/g, (match) => `\\${match}`);
