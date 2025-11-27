import { InteractionResponseType } from 'discord-interactions'
import { JsonResponse } from '../../utils/jsonResponse'
import { APIChatInputApplicationCommandInteraction } from 'discord-api-types/v10'
import { EmbedBuilder } from '../../utils/embedBuilder'
import { GameService } from '../../services/gameService'
import { DBTransaction } from '../../types/transactionType'
import { extractInteractionData } from '../../utils/getInteractionOptions'

export async function deleteTable(
  transaction: DBTransaction,
  interaction: APIChatInputApplicationCommandInteraction
): Promise<Response> {
  const inputData = extractInteractionData<{ mesa: number }>(interaction)
  const gameId = inputData.mesa
  const gameService = new GameService()

  const game = await gameService.getGameById(transaction, gameId)
  await gameService.deleteGame(transaction, gameId)

  const embed = EmbedBuilder({
    title: `🗑 Mesa "${game.name}" Deletada!`,
    footer: { text: `🆔 ID da Mesa: ${gameId}` },
  })
  return new JsonResponse({
    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: { embeds: [embed] },
  })
}
