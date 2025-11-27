import { APIInteraction } from 'discord-api-types/v10'
import { verifyKey } from 'discord-interactions'

export interface Env {
  DISCORD_PUBLIC_KEY: string
}

export interface ValidateRequestResult {
  isValid: boolean
  interaction?: APIInteraction
}

export async function validateRequest(
  request: Request,
  env: Env,
): Promise<ValidateRequestResult> {
  const signature = request.headers.get('x-signature-ed25519')
  const timestamp = request.headers.get('x-signature-timestamp')
  const body = await request.text()

  const isValidRequest =
    !!signature &&
    !!timestamp &&
    (await verifyKey(body, signature, timestamp, env.DISCORD_PUBLIC_KEY))

  if (!isValidRequest) {
    return { isValid: false }
  }

  const interaction = JSON.parse(body) as APIInteraction
  return { interaction, isValid: true }
}
