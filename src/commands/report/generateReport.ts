import { JsonResponse } from '../../utils/jsonResponse'
import { DiscordFileResponse } from '../../utils/discordFileResponse'
import { InteractionResponseType } from 'discord-interactions'
import { APIChatInputApplicationCommandInteraction, APIInteractionGuildMember, PermissionFlagsBits } from 'discord-api-types/v10'
import { DBTransaction } from '../../types/transactionType'
import { ReportService } from '../../services/report/reportService'
import { hasPermission } from '../../utils/checkMemberHasTablePermissions'
import { Env } from '../../interfaces/envInterface'

export async function generateReport(
  transaction: DBTransaction,
  interaction: APIChatInputApplicationCommandInteraction,
  env: Env,
): Promise<Response> {
  const member = interaction.member as APIInteractionGuildMember | undefined

  if (!hasPermission(member?.permissions, PermissionFlagsBits.Administrator as unknown as bigint)) {
    return new JsonResponse({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: { content: 'Apenas administradores podem gerar este relatório.', flags: 64 },
    })
  }

  const service = new ReportService()

  const cached = await service.getCachedReport(transaction)
  const oneHour = 1000 * 60 * 60

  let reportJson
  let generatedAt
  let messageContent = ''

  if (cached && Date.now() - new Date(cached.created_at).getTime() < oneHour) {
    reportJson = cached.report_json
    generatedAt = new Date(cached.created_at)
    messageContent = `Relatório em cache encontrado, gerado em ${generatedAt.toISOString()}.`
  } else {
    reportJson = await service.computeReport(transaction)
    console.log('Generated report JSON:', reportJson) // Log para depuração
    await service.saveReport(transaction, reportJson)
    generatedAt = new Date()
    messageContent = `Relatório gerado e salvo em ${generatedAt.toISOString()}.`
  }

  const pdfBuffer = await service.generatePdfBuffer(reportJson, generatedAt)
  const timestamp = new Date().toISOString().split('T')[0]
  const fileName = `relatorio-mesas-${timestamp}.pdf`

  // Retornar resposta com PDF como arquivo
  return new DiscordFileResponse(
    {
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content: messageContent,
        flags: 64,
      },
    },
    {
      name: fileName,
      data: new Uint8Array(pdfBuffer),
      contentType: 'application/pdf',
    },
  )
}
