export const parseCsv = (value: string): string[] =>
  value
    .split(',')
    .map((item) => item.trim())
    .filter((item) => item.length > 0);

const toLowerTrimmed = (value: string): string => value.trim().toLowerCase();

export const normalizeEmail = (value: string): string => toLowerTrimmed(value);

// Prefix plus a zero-padded sequence value, e.g. ('P', 7) -> "P-0007"; never truncates past the width
export const formatSequenceCode = (prefix: string, value: number, width = 4): string =>
  `${prefix}-${String(value).padStart(width, '0')}`;

// Escapes the LIKE/ILIKE wildcards so user input cannot widen a search
export const escapeLikePattern = (value: string): string =>
  value.replace(/[\\%_]/g, (match) => `\\${match}`);
