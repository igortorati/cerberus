import { APIGuildMember } from "discord.js"
import { CommandError } from "../errors/commandError"

export async function fetchGuildUser(
  guildId: string | undefined,
  userId: string,
  botToken: string,
): Promise<APIGuildMember> {
  try {
    const res = await fetch(
      `https://discord.com/api/v10/guilds/${guildId}/members/${userId}`,
      {
        headers: { Authorization: `Bot ${botToken}` },
      },
    )

    if (!res.ok) {
      console.warn(`Failed to fetch user ${userId}:`, res.status)
      throw new CommandError(`Falha ao recuperar usuário do discord <@${userId}>.`)
    }

    const data = await res.json()
    return data
  } catch (err) {
    console.error(`Error fetching user ${userId}:`, err)
    throw new CommandError(`Falha ao recuperar usuário do discord <@${userId}>.`)
  }
}
