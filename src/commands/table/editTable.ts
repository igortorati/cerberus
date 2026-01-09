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
import { addRoleToUser } from '../../utils/addRoleToUser'
import { CurrentPlayerService } from '../../services/currentPlayerService'
import { removeRoleFromUser } from '../../utils/removeRoleFromUser'
import { WarningMessage } from '../../interfaces/warningInterface'

export async function editTable(
  transaction: DBTransaction,
  interaction: APIChatInputApplicationCommandInteraction,
  env: Env
): Promise<Response> {
  const discordUserService = new DiscordUserService()
  const gameService = new GameService()
  const updateData = buildEditGameDataFromCreateGameInteraction(interaction)
  const currentPlayerService = new CurrentPlayerService()
  let addedRoleWarning;
  let removedRoleWarning;

  if (updateData.dm_discord_id)
    await discordUserService.createOrUpdateUser(
      transaction,
      updateData.dm_discord_id,
      interaction.guild_id,
      env
    )

  const oldTable = await gameService.getGameById(transaction, updateData.id)
  await gameService.updateGame(transaction, updateData.id, updateData)
  
  const currentPlayers = await currentPlayerService.getByGame(transaction, updateData.id)
  if (updateData.role_id && oldTable.current_players > 0) {
    for(const player of currentPlayers) {
      const addedRoleReturn = await addRoleToUser(interaction.guild_id, updateData.role_id, player.discord_player_id, env.DISCORD_TOKEN)
      const removedRoleReturn = await removeRoleFromUser(interaction.guild_id, oldTable.role_id, player.discord_player_id, env.DISCORD_TOKEN)
      if(addedRoleReturn.hasWarning) {
        addedRoleWarning = addedRoleReturn
      }
      if(removedRoleReturn.hasWarning) {
        removedRoleWarning = removedRoleReturn
      }
    }
  }

  const updatedTable = await gameService.getGameById(transaction, updateData.id)

  const embed = buildUpdateEmbed(oldTable, updatedTable, updateData.id, addedRoleWarning, removedRoleWarning, currentPlayers)
  return new JsonResponse({
    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: { embeds: [embed] },
  })
}

function buildUpdateEmbed(
oldTable: Partial<NewGame>, updatedTable: Partial<NewGame>, gameId: number, addedRoleWarning: WarningMessage | undefined, removedRoleWarning: WarningMessage | undefined, currentPlayers: { id: number; game_id: number; discord_player_id: string; is_staff_player: boolean} []) {
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

  if (oldTable.role_id !== updatedTable.role_id) {
    const playersString = currentPlayers.map(player => `<@${player.discord_player_id}>`).join(', ')
    if (removedRoleWarning && removedRoleWarning.hasWarning && removedRoleWarning.warningMessage) {
      updatedFields.push({ name: '❗❗ Aviso', value: `Falha ao remover a role anterior <@&${oldTable.role_id}> dos jogadores: ${playersString}. **A operação deve ser feita manualmente**.`, inline: false})
    } else {
      updatedFields.push({ name: 'Roles removidas', value: 'A role anterior foi removida dos seguintes jogadores: ' + playersString, inline: false})
    }

    if (addedRoleWarning && addedRoleWarning.hasWarning && addedRoleWarning.warningMessage) {
      updatedFields.push({ name: '❗❗ Aviso', value: `Falha ao adicionar a nova role <@&${updatedTable.role_id}> aos jogadores: ${playersString}. **A operação deve ser feita manualmente**.`, inline: false})
    } else {
      updatedFields.push({ name: 'Roles adicionadas', value: 'A nova role foi adicionada aos seguintes jogadores: ' + playersString, inline: false})
    }
  }

  return EmbedBuilder({
    title: ' ✏️ Mesa Atualizada!',
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