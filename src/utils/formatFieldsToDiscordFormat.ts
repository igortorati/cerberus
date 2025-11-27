import { getDateString } from "./getDateString"
import { isNull } from "./isNull"

export function formatFieldsToDiscordFormat(
  val: string | number | Date | null | undefined | boolean,
  key: string
): string {
  if (isNull(val) || val === undefined) return '—'

  switch (key) {
    case 'discordUser':
    case 'dm_discord_id':
      return `<@${val}>`

    case 'text_channel_id':
    case 'voice_channel_id':
      return `<#${val}>`

    case 'role_id':
      return `<@&${val}>`

    case 'date':
    case 'start_date':
    case 'closed_date':
      return val instanceof Date ? getDateString(val) : String(val)

    case 'price':
      return `R$${val}`

    case 'max_players':
    case 'max_staff_players':
    default:
      return String(val)
  }
}
