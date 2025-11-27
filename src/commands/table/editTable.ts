import { InteractionResponseType } from 'discord-interactions'
import { JsonResponse } from '../../utils/jsonResponse'
import { APIChatInputApplicationCommandInteraction } from 'discord-api-types/v10'
import { EmbedBuilder } from '../../utils/embedBuilder'
import { GameService } from '../../services/gameService'
import { DBTransaction } from '../../types/transactionType'
import { formatFieldsToDiscordFormat } from '../../utils/formatFieldsToDiscordFormat'
import { DiscordUserService } from '../../services/discordUserService'
import { Env } from '../../interfaces/envInterface'
import { buildEditGameDataFromCreateGameInteraction } from '../../utils/buildEditGameDataFromEditGameInteraction'
import { NewGame } from '../../models'
import { FIELD_LABELS } from '../../constants/fieldLabelsConstants'

export async function editTable(
  transaction: DBTransaction,
  interaction: APIChatInputApplicationCommandInteraction,
  env: Env
): Promise<Response> {
  const discordUserService = new DiscordUserService()
  const gameService = new GameService()
  const updateData = buildEditGameDataFromCreateGameInteraction(interaction)

  if (updateData.dm_discord_id)
    await discordUserService.createOrUpdateUser(
      transaction,
      updateData.dm_discord_id,
      interaction.guild_id,
      env
    )

  const oldTable = await gameService.getGameById(transaction, updateData.id)
  await gameService.updateGame(transaction, updateData.id, updateData)
  const updatedTable = await gameService.getGameById(transaction, updateData.id)

  const embed = buildUpdateEmbed(oldTable, updatedTable, updateData.id)
  return new JsonResponse({
    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: { embeds: [embed] },
  })
}

function buildUpdateEmbed(
  oldTable: Partial<NewGame>,
  updatedTable: Partial<NewGame>,
  gameId: number
) {
  const updatedFields = (Object.entries(FIELD_LABELS) as Array<
    [keyof NewGame, string]
  >)
    .map(([key, label]) => {
      const oldValue = oldTable[key]
      const newValue = updatedTable[key]

      if (areEqual(oldValue, newValue)) return null
      return {
        name: label,
        value: `~~${formatFieldsToDiscordFormat(
          oldValue,
          key
        )}~~ → ${formatFieldsToDiscordFormat(newValue, key)}`,
        inline: false,
      }
    })
    .filter(
      (field): field is { name: string; value: string; inline: boolean } =>
        field !== null
    )

  if (updatedFields.length === 0) {
    updatedFields.push({
      name: 'Sem alterações',
      value: 'Nenhum campo foi modificado.',
      inline: false,
    })
  }

  return EmbedBuilder({
    title: '✏️ Mesa Atualizada!',
    fields: updatedFields,
    footer: { text: `🆔 ID da Mesa: ${gameId}` },
  })
}

function areEqual(
  oldValue: unknown,
  newValue: unknown
): boolean {
  if (oldValue == null && newValue == null) return true

  if (oldValue instanceof Date && newValue instanceof Date) {
    return oldValue.getTime() === newValue.getTime()
  }

  if (
    typeof oldValue === 'string' &&
    typeof newValue === 'string' &&
    !isNaN(Date.parse(oldValue)) &&
    !isNaN(Date.parse(newValue))
  ) {
    return new Date(oldValue).getTime() === new Date(newValue).getTime()
  }

  return oldValue === newValue
}