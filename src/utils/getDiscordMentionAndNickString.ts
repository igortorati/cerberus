import { PlayerOnTable } from "../interfaces/playerOnTableInterface"
import { formatFieldsToDiscordFormat } from "./formatFieldsToDiscordFormat"

export function getDiscordMentionAndNickString(user: PlayerOnTable): string {
  const displayName = user.nickname || user.globalName || "Usuário Desconhecido"
  const alert = user.discordUserId.length < 6 ? " ⚠️ Este usuário não está associado a um usuário real" : ""
  return `${formatFieldsToDiscordFormat(user.discordUserId, "discordUser")}${user.isStaffPlayer ? " ⭐" : ""} - ${displayName} (${"@" + user.username})${alert}`
}