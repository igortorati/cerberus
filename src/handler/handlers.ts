import {
  APIApplicationCommandAutocompleteInteraction,
  APIChatInputApplicationCommandInteraction,
  APIInteraction,
  InteractionType,
} from 'discord-api-types/v10'
import {
  INVITE_COMMAND,
  CREATE_TABLE_COMMAND,
  EDIT_TABLE_COMMAND,
  DELETE_TABLE_COMMAND,
  GET_TABLE_COMMAND,
  CREATE_JOIN_ORIGIN_COMMAND,
  PLAYER_ENTRY_COMMAND,
  PLAYER_LEAVE_COMMAND,
} from '../discord/commandsMetadata'
import type { Env } from '../interfaces/envInterface'
import { createTable } from '../commands/table/createTable'
import { pong } from '../commands/pong'
import { generateInviteUrl } from '../commands/inviteCommand'
import { editTable } from '../commands/table/editTable'
import { tableDataAutocomplete } from '../utils/tableDataAutocomplete'
import { deleteTable } from '../commands/table/deleteTable'
import { getTable } from '../commands/table/getTable'
import { createJoinOrigin } from '../commands/joinOrigin/joinOrigin'
import { playerEntry } from '../commands/log/playerEntry'
import { playerExit } from '../commands/log/playerExit'
import { initDB } from '../database/db'
import { JsonResponse } from '../utils/jsonResponse'
import { InteractionResponseType } from 'discord-interactions'
import { CommandError } from '../errors/commandError'

export async function handleInteraction(
  interaction: APIInteraction,
  env: Env,
): Promise<Response> {
  const db = await initDB(env)

  try {
    return await db.transaction(async (tx) => {
      switch (interaction.type) {
        case InteractionType.Ping:
          return pong()

        case InteractionType.ApplicationCommand: {
          const commandInteraction =
            interaction as APIChatInputApplicationCommandInteraction
          const commandName = commandInteraction.data?.name?.toLowerCase()

          switch (commandName) {
            case INVITE_COMMAND.name.toLowerCase():
              return generateInviteUrl(env)

            case CREATE_TABLE_COMMAND.name.toLowerCase(): {
              return await createTable(tx, commandInteraction, env)
            }

            case EDIT_TABLE_COMMAND.name.toLowerCase(): {
              return await editTable(tx, commandInteraction, env)
            }

            case DELETE_TABLE_COMMAND.name.toLowerCase(): {
              return await deleteTable(tx, commandInteraction)
            }

            case GET_TABLE_COMMAND.name.toLowerCase():
              return await getTable(tx, commandInteraction)

            case CREATE_JOIN_ORIGIN_COMMAND.name.toLowerCase():
              return await createJoinOrigin(tx, commandInteraction)

            case PLAYER_ENTRY_COMMAND.name.toLowerCase():
              return await playerEntry(tx, commandInteraction, env)

            case PLAYER_LEAVE_COMMAND.name.toLowerCase():
              return await playerExit(tx, commandInteraction, env)

            default:
              throw new CommandError('Comando desconhecido.')
          }
        }

        case InteractionType.ApplicationCommandAutocomplete:
          return await tableDataAutocomplete(
            tx,
            interaction as APIApplicationCommandAutocompleteInteraction,
          )

        default:
          throw new CommandError('Tipo de interação não suportado.')
      }
    })
  } catch (error) {
    console.error('❌ Transaction failed:', error)

    let message = 'Ocorreu um erro interno ao processar o comando.'
    if (error instanceof CommandError) {
      message = error.message
    }

    // Always return status 200 for discord.
    return new JsonResponse({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: { content: message },
    })
  }
}