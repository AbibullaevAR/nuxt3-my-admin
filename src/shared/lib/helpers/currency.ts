const RUB_FORMATTER = new Intl.NumberFormat('ru-RU', {
  style: 'currency',
  currency: 'RUB',
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
})

const RUB_COMPACT_FORMATTER = new Intl.NumberFormat('ru-RU', {
  style: 'currency',
  currency: 'RUB',
  notation: 'compact',
  compactDisplay: 'short',
  minimumFractionDigits: 0,
  maximumFractionDigits: 1,
})

export function formatCurrency(amount: number): string {
  return RUB_FORMATTER.format(amount)
}

export function formatCurrencyCompact(amount: number): string {
  return RUB_COMPACT_FORMATTER.format(amount)
}

export function calculateChange(
  current: number,
  previous: number,
): { value: number; formatted: string; isPositive: boolean } {
  if (previous === 0) {
    return { value: 0, formatted: '—', isPositive: true }
  }

  const change = ((current - previous) / previous) * 100
  const isPositive = change >= 0

  return {
    value: change,
    formatted: `${isPositive ? '+' : ''}${change.toFixed(1)}%`,
    isPositive,
  }
}
