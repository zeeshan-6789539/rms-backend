import type { IWeightedOption } from '../interfaces/i-weighted-option.js';

// Inclusive on both ends
export const randomInt = (min: number, max: number): number =>
  Math.floor(Math.random() * (max - min + 1)) + min;

export const randomItem = <T>(items: readonly T[]): T =>
  items[randomInt(0, items.length - 1)];

export const randomDate = (from: Date, to: Date): Date =>
  new Date(randomInt(from.getTime(), to.getTime()));

export const addDays = (date: Date, days: number): Date =>
  new Date(date.getTime() + days * 24 * 60 * 60 * 1000);

// Picks one value, weighted by each option's relative `weight`
export const weightedPick = <T>(options: readonly IWeightedOption<T>[]): T => {
  const totalWeight = options.reduce((sum, option) => sum + option.weight, 0);
  let roll = Math.random() * totalWeight;

  for (const option of options) {
    if (roll < option.weight) {
      return option.value;
    }

    roll -= option.weight;
  }

  // Floating-point rounding can skip every branch above — fall back to the last option
  return options[options.length - 1].value;
};
