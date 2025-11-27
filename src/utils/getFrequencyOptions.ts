import { FREQUENCY } from '../enums/frequency'

export function frequencyOptions(
  valueToSearch: string,
): { name: string; value: string }[] {
  return Object.values(FREQUENCY).filter((f) => f.toLowerCase().startsWith(valueToSearch)).map(
    (f) => ({ name: f, value: f }),
  )
}
