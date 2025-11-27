import { JsonResponse } from '../utils/jsonResponse'
import { InteractionResponseType } from 'discord-interactions'

export async function pong(): Promise<Response> {
  return new JsonResponse({
    type: InteractionResponseType.PONG,
  })
}
