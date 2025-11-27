import { InteractionResponseType } from 'discord-interactions'
import { JsonResponse } from '../../utils/jsonResponse'
import { APIChatInputApplicationCommandInteraction } from 'discord-api-types/v10'
import { extractInteractionData } from '../../utils/getInteractionOptions'
import { EmbedBuilder } from '../../utils/embedBuilder'
import { JoinOriginService } from '../../services/joinOriginService'
import { DBTransaction } from '../../types/transactionType'
import { NewJoinOrigin } from '../../models/joinOriginModel'

export async function createJoinOrigin(
  transaction: DBTransaction,
  interaction: APIChatInputApplicationCommandInteraction,
): Promise<Response> {
  const originService = new JoinOriginService()
  const inputData = extractInteractionData<{ origem: string, grupo: string }>(interaction)
  
  if (!inputData.grupo || !inputData.origem) {
    return new JsonResponse({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: { content: '⚠️ Por favor, informe **grupo** e **origem**.' },
    })
  }
  
  const joinOrigin: NewJoinOrigin = {
    origin: inputData.origem,
    group_name: inputData.grupo,
  }

  const alreadyExists = await originService.existsOrigin(transaction, joinOrigin)
  if (alreadyExists) {
    const embed = EmbedBuilder({
      title: '⚠️ Origem já registrada',
      description: `A origem **${inputData.origem}** no grupo **${inputData.grupo}** já existe no banco de dados.`,
    })

    return new JsonResponse({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: { embeds: [embed] },
    })
  }

  const newOriginUid = await originService.createOrigin(transaction, joinOrigin)

  const embed = EmbedBuilder({
    title: '🆕 Nova Origem Cadastrada!',
    fields: [
      { name: '🌐 Origem', value: inputData.origem, inline: true },
      { name: '🏰 Grupo', value: inputData.grupo, inline: true },
    ],
    footer: { text: `🆔 UID: ${newOriginUid}` },
  })

  console.log('✅ Origem criada no banco:', joinOrigin)

  return new JsonResponse({
    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: { embeds: [embed] },
  })
}
