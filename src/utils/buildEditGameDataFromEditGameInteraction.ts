import { CommandError } from '../errors/commandError'
import { APIChatInputApplicationCommandInteraction } from 'discord.js'
import { NewGame } from '../models'
import { extractInteractionData } from './getInteractionOptions'
import { IEditGameInputData } from '../interfaces/editGameInputDataInterface'
import { inputEditGameDataValidator, ValidatedEditGameInput } from './validators/inputEditGameDataValidator'

export function buildEditGameDataFromCreateGameInteraction(
  interaction: APIChatInputApplicationCommandInteraction
): Omit<Partial<NewGame>, 'id'> & { id: number } {
  const inputValues = extractInteractionData<IEditGameInputData>(interaction)
  const validated = inputEditGameDataValidator.safeParse(inputValues)

  if (!validated.success) {
    const message = validated.error.issues[0]?.message ?? 'Dados inválidos.'
    throw new CommandError(message)
  }

  const data: ValidatedEditGameInput = validated.data

  const editGameData: Omit<Partial<NewGame>, 'id'> & { id: number } = {
    id: data.mesa,
    name: data.nome_mesa,
    dm_discord_id: data.mestre,
    max_players: data.vagas_totais,
    max_staff_players: data.vagas_staff,
    text_channel_id: data.canal_texto,
    voice_channel_id: data.canal_voz,
    role_id: data.role,
    frequency: data.frequencia,
    day_of_week: data.dia_da_semana,
    time: data.horario,
    price: data.valor?.toString(),
    start_date: data.data_primeira_sessao,
    is_one_shot: data.one_shot
  }

  return editGameData
}