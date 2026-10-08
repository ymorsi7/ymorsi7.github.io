export const ANNUAL_EUR = 31500
export const WORK_HOURS = 1840

export const HOURLY_EUR = ANNUAL_EUR / WORK_HOURS

export function costEur(seconds: number): number {
  return (seconds / 3600) * HOURLY_EUR
}

export function moneyChars(value: number): string[] {
  const safe = Math.max(0, value)
  const [whole, frac] = safe.toFixed(2).split('.')
  const body = whole.length > 6 ? whole : whole.padStart(6, '0')
  return ['€', ...body, '.', ...frac]
}
