import { JsonResponse } from '../utils/jsonResponse'
import { InteractionResponseType } from 'discord-interactions'

interface Env {
  DISCORD_APPLICATION_ID: string
}

export function generateInviteUrl(env: Env): Response {
  const applicationId = env.DISCORD_APPLICATION_ID

  const inviteUrl = `https://discord.com/oauth2/authorize?client_id=${applicationId}&permissions=2415921152&integration_type=0&scope=bot+applications.commands`

  return new JsonResponse({
    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: {
      content: `Link do convite: ${inviteUrl}`,
    },
  })
}
