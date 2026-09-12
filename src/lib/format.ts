import type { TariffUnit } from './content/schema'

/**
 * Dutch formatting helpers.
 *
 * All user-facing output here is Dutch, in nl-NL conventions: a comma as the
 * decimal separator, a non-breaking space after the euro sign, and 24-hour
 * clock times written with a full stop.
 */

const euroFormatter = new Intl.NumberFormat('nl-NL', {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

const euroWholeFormatter = new Intl.NumberFormat('nl-NL', {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})

/**
 * Money is stored as integer cents and only becomes a decimal here.
 *
 * In running text a whole number of euros drops the ",00", because Dutch copy
 * writes "een dagkaart van € 15", not "€ 15,00".
 */
export function formatEuros(amountCents: number): string {
  const formatter = amountCents % 100 === 0 ? euroWholeFormatter : euroFormatter
  return formatter.format(amountCents / 100)
}

/**
 * Always two decimals. Used in the tariff table, where a column reading
 * "€ 2 / € 12,50 / € 15" looks like three different kinds of number and
 * quietly costs the reader confidence in the prices.
 */
export function formatEurosExact(amountCents: number): string {
  return euroFormatter.format(amountCents / 100)
}

const UNIT_LABELS: Readonly<Record<TariffUnit, string>> = {
  per_30_min: 'per 30 minuten',
  per_hour: 'per uur',
  per_day: 'per dag',
  per_month: 'per maand',
  per_pass: 'per pas',
}

export function formatTariffUnit(unit: TariffUnit): string {
  return UNIT_LABELS[unit]
}

const DAY_NAMES: readonly string[] = [
  'maandag',
  'dinsdag',
  'woensdag',
  'donderdag',
  'vrijdag',
  'zaterdag',
  'zondag',
]

/** `day` is ISO 8601: 1 is Monday, 7 is Sunday. */
export function formatDayName(day: number): string {
  return DAY_NAMES[day - 1] ?? String(day)
}

/**
 * Opening hours. The content model's convention is that `closed: false` with no
 * times means the location is open around the clock, so say that in words
 * rather than printing "00.00 - 00.00".
 */
export function formatOpeningHours(hours: {
  closed: boolean
  opensAt?: string | undefined
  closesAt?: string | undefined
}): string {
  if (hours.closed) return 'Gesloten'
  if (hours.opensAt === undefined || hours.closesAt === undefined) return 'Hele dag open'
  return `${hours.opensAt.replace(':', '.')} tot ${hours.closesAt.replace(':', '.')} uur`
}

/** Metres with a Dutch decimal comma: 2.7 becomes "2,70 m". */
export function formatMeters(meters: number): string {
  return `${meters.toFixed(2).replace('.', ',')} m`
}

const dateFormatter = new Intl.DateTimeFormat('nl-NL', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

export function formatDate(iso: string): string {
  return dateFormatter.format(new Date(iso))
}
