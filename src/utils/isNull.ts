export function isNull(value: unknown): value is null | undefined {
  return value === null || value === undefined;
}
