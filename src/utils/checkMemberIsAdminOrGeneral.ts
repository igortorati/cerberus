import { APIInteractionGuildMember, PermissionFlagsBits } from "discord-api-types/v10";
import { Env } from "../interfaces/envInterface";
import { isNull } from "./isNull";

export function checkMemberIsAdminOrGeneral(member: APIInteractionGuildMember | undefined, env : Env) {
  const isAdmin = hasPermission(member?.permissions, PermissionFlagsBits.Administrator);
  const hasGeneralRole = !isNull(env.GENERAL_ROLE_ID) && member?.roles.includes(env.GENERAL_ROLE_ID);

  return hasGeneralRole || isAdmin;
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