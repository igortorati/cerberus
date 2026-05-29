import { APIInteractionGuildMember, PermissionFlagsBits } from "discord-api-types/v10";
import { Env } from "../interfaces/envInterface";

export function checkMemberHasTablePermissions(member: APIInteractionGuildMember | undefined, env : Env) {
  const isAdmin = hasPermission(member?.permissions, PermissionFlagsBits.Administrator);
  const generalRoleIds = env.GENERAL_ROLE_IDS?.split(',') ?? []
  const guardianRoleIds = env.GUARDIAN_ROLE_IDS?.split(',') ?? []

  const hasGeneralRole = generalRoleIds.some(roleId =>
    member?.roles.includes(roleId)
  )

  const hasGuardianRole = guardianRoleIds.some(roleId =>
    member?.roles.includes(roleId)
  )

  return hasGeneralRole || hasGuardianRole || isAdmin;
}

function hasPermission(
  permissions: string | bigint | null | undefined,
  flag: bigint
): boolean {
  if (!permissions) return false;

  const perms = typeof permissions === 'bigint'
    ? permissions
    : BigInt(permissions);

  return (perms & flag) === flag;
}