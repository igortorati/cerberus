export function hasPermission(
  permissions: string | bigint | null | undefined,
  flag: bigint
): boolean {
  if (!permissions) return false;

  const perms = typeof permissions === 'bigint'
    ? permissions
    : BigInt(permissions);

  return (perms & flag) === flag;
}