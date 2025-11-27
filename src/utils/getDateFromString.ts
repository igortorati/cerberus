export function parseDate(dateStr: string): Date | null {
  const [day, month, year] = dateStr.split('/').map(Number)
  if (!day || !month || !year) return null
  return new Date(year, month - 1, day)
}
