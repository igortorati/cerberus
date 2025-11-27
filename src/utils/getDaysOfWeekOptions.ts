import { DAY_OF_WEEK } from '../enums/daysOfWeek'

export function daysOfWeekOptions(
  valueToSearch: string,
): { name: string; value: string }[] {
  return Object.values(DAY_OF_WEEK).filter((d) =>
    d.toLowerCase().startsWith(valueToSearch),
  ).map((d) => ({ name: d, value: d }))
}
