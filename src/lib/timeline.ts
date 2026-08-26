export function toDateStr(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function parseDateStr(dateStr: string): Date {
  return new Date(`${dateStr}T00:00:00`)
}

export function addDays(dateStr: string, days: number): string {
  const date = parseDateStr(dateStr)
  date.setDate(date.getDate() + days)
  return toDateStr(date)
}

export function buildDateRange(startStr: string, endStr: string): string[] {
  const dates: string[] = []
  const cursor = parseDateStr(startStr)
  const end = parseDateStr(endStr)
  while (cursor <= end) {
    dates.push(toDateStr(cursor))
    cursor.setDate(cursor.getDate() + 1)
  }
  return dates
}

export function weekRange(dateStr: string): [string, string] {
  const end = parseDateStr(dateStr)
  end.setDate(end.getDate() + 6)
  return [dateStr, toDateStr(end)]
}

export function monthRange(dateStr: string): [string, string] {
  const date = parseDateStr(dateStr)
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0)
  return [dateStr, toDateStr(end)]
}

export function yearRange(dateStr: string): [string, string] {
  const date = parseDateStr(dateStr)
  const end = new Date(date.getFullYear(), 11, 31)
  return [dateStr, toDateStr(end)]
}

export function formatDayHeading(dateStr: string): string {
  return parseDateStr(dateStr).toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })
}

export function formatDayMonth(dateStr: string): string {
  const date = parseDateStr(dateStr)
  return `${date.getDate()}/${date.getMonth() + 1}`
}

export function formatMonthYear(dateStr: string): string {
  return parseDateStr(dateStr).toLocaleDateString(undefined, {
    month: 'long',
    year: 'numeric',
  })
}

export function formatYear(dateStr: string): string {
  return String(parseDateStr(dateStr).getFullYear())
}

export function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1)
}
