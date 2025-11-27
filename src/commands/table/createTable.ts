import { InteractionResponseType } from 'discord-interactions'
import { JsonResponse } from '../../utils/jsonResponse'
import { APIChatInputApplicationCommandInteraction } from 'discord-api-types/v10'
import { tableDataEmbedBuilder } from '../../utils/embedBuilder'
import { GameService } from '../../services/gameService'
import { DBTransaction } from '../../types/transactionType'
import { DiscordUserService } from '../../services/discordUserService'
import { Env } from '../../interfaces/envInterface'
import { buildNewGameDataFromCreateGameInteraction } from '../../utils/buildNewGameFromInput'

export async function createTable(
  transaction: DBTransaction,
  interaction: APIChatInputApplicationCommandInteraction,
  env: Env
): Promise<Response> {
  const gameService = new GameService()
  const discordUserService = new DiscordUserService()

  const newGameData = buildNewGameDataFromCreateGameInteraction(interaction)
  
  await discordUserService.createOrUpdateUser(transaction, newGameData.dm_discord_id, interaction.guild_id, env)
  if(newGameData.created_by_discord_id && newGameData.created_by_discord_id != newGameData.dm_discord_id) await discordUserService.createOrUpdateUser(transaction, newGameData.created_by_discord_id, interaction.guild_id, env)

  const newGameId = await gameService.createGame(transaction, newGameData)

  const createdGame = await gameService.getGameById(transaction, newGameId);
  const embed = tableDataEmbedBuilder(
    createdGame!,
    `🎲 Nova Mesa Criada!`,
  );

  console.log('✅ Mesa criada no banco:', newGameId)

  return new JsonResponse({
    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: { embeds: [embed] },
  })
}