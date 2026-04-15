// Utility functions for NEXA app

export function formatNumber(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return n.toLocaleString();
}

export function formatOdds(odds: number): string {
  return odds.toFixed(2);
}

export function formatCurrency(amount: number): string {
  return `R$ ${amount.toFixed(2)}`;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
