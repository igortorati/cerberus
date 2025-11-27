import { AutoRouter } from 'itty-router'
import { APIInteraction } from 'discord-api-types/v10'
import { validateRequest } from './utils/validators/validateRequest'
import { handleInteraction } from './handler/handlers'
import { Env } from './interfaces/envInterface'

const router = AutoRouter()

router.get('/', (request: Request, env: Env) => {
  return new Response(`👋 Bot running - ${env.DISCORD_APPLICATION_ID}`)
})

router.post('/', async (request: Request, env: Env) => {
  const { isValid, interaction } = await validateRequest(request, env)

  if (!isValid || !interaction) {
    return new Response('Invalid request signature.', { status: 401 })
  }

  return handleInteraction(interaction as APIInteraction, env)
})

router.all('*', () => new Response('Not Found.', { status: 404 }))

const server = {
  validateRequest,
  fetch: router.fetch,
}

export default server
