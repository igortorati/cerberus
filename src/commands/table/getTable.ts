import { InteractionResponseType } from 'discord-interactions'
import { JsonResponse } from '../../utils/jsonResponse'
import { APIChatInputApplicationCommandInteraction } from 'discord-api-types/v10'
import { extractInteractionData,  } from '../../utils/getInteractionOptions'
import { EmbedBuilder, tableDataEmbedBuilder } from '../../utils/embedBuilder'
import { GameService } from '../../services/gameService'
import { DBTransaction } from '../../types/transactionType'
import { CurrentPlayerService } from '../../services/currentPlayerService'

export async function getTable(
  transaction: DBTransaction,
  interaction: APIChatInputApplicationCommandInteraction
): Promise<Response> {
  const inputData = extractInteractionData<{ mesa: number }>(interaction)
  const gameId = inputData.mesa
  const gameService = new GameService()
  const currentPlayerService = new CurrentPlayerService()

  const retrievedGame = await gameService.getGameById(transaction, gameId)

  let tableEmbed = tableDataEmbedBuilder(
    retrievedGame,
    `🎲 Dados da Mesa:`,
  )

  const embeds = [tableEmbed]
  if(retrievedGame.current_players > 0) {
    const currentPlayers = await currentPlayerService.getByGame(transaction, gameId)
    const playerFields = currentPlayers.map((entry) => {
      return {
        name: `Jogador${entry.is_staff_player ? " (Staff)" : ""}`,
        value: `<@${entry.discord_player_id}>${entry.is_staff_player ? " ⭐" : ""}`,
        inline: false,
      }
    })
    embeds.push(EmbedBuilder({
      title: `Jogadores da mesa "${retrievedGame.name}"`,
      fields: playerFields
    }))
  }
  

  if (!retrievedGame.is_active)
    tableEmbed = EmbedBuilder({
            title: `❌ Mesa **${retrievedGame.name}** foi encerrada em ${retrievedGame.closed_date || "--"}.`,
          })

  return new JsonResponse({
    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: { embeds },
  })
}
