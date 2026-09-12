import { InteractionResponseType } from 'discord-interactions'
import { JsonResponse } from '../../utils/jsonResponse'
import { APIChatInputApplicationCommandInteraction } from 'discord-api-types/v10'
import { EmbedBuilder } from '../../utils/embedBuilder'
import { GameService } from '../../services/gameService'
import { DBTransaction } from '../../types/transactionType'
import { extractInteractionData } from '../../utils/getInteractionOptions'
import { checkGameGuildAndInteractionGuild } from '../../utils/checkGameGuildAndInteractionGuild'

export async function deleteTable(
  transaction: DBTransaction,
  interaction: APIChatInputApplicationCommandInteraction
): Promise<Response> {
  const inputData = extractInteractionData<{ mesa: number; mesa_terminada?: boolean }>(interaction)
  const gameId = inputData.mesa
  const mesaTerminada = Boolean(inputData.mesa_terminada)
  const gameService = new GameService()

  const game = await gameService.getGameById(transaction, gameId, interaction.guild_id)

  await gameService.updateGame(transaction, gameId, { finished: mesaTerminada })
  await gameService.deleteGame(transaction, gameId)

  const embed = EmbedBuilder({
    title: `🗑 Mesa "${game.name}" ${mesaTerminada ? 'Finalizada' : 'Deletada'}!`,
    footer: { text: `🆔 ID da Mesa: ${gameId}` },
  })
  return new JsonResponse({
    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: { embeds: [embed] },
  })
}
