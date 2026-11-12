/** Rounds to cents, the way a shop displays money: 3.1984 -> 3.2 */
export function roundToCents(value: number): number {
  return Math.round(value * 100) / 100;
}

/** Formats a number the way saucedemo shows it: 3.2 -> "$3.20" */
export function formatPrice(value: number): string {
  return `$${value.toFixed(2)}`;
}
