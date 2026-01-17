import { isNull } from './isNull'
import { inputGameDataValidator, ValidatedNewGameInput } from './validators/inputNewGameDataValidator'
import { CommandError } from '../errors/commandError'
import { APIChatInputApplicationCommandInteraction } from 'discord.js'
import { NewGame } from '../models'
import { INewGameInputData } from '../interfaces/newGameInputDataInterface'
import { extractInteractionData } from './getInteractionOptions'

export function buildNewGameDataFromCreateGameInteraction(
  interaction: APIChatInputApplicationCommandInteraction
): NewGame {
  const inputValues = extractInteractionData<INewGameInputData>(interaction)
  const validated = inputGameDataValidator.safeParse(inputValues)

  if (!validated.success) {
    const message = validated.error.issues[0]?.message ?? 'Dados inválidos.'
    throw new CommandError(message)
  }

  const data: ValidatedNewGameInput = validated.data
  const createdByUser = interaction.member?.user.id || data.mestre

  const isDdal = !isNull(data.ddal) ? Boolean(data.ddal) : false;
  const newGameData: NewGame = {
    name: data.nome_mesa,
    dm_discord_id: data.mestre,
    max_players: Number(data.vagas_totais),
    text_channel_id: data.canal_texto,
    voice_channel_id: data.canal_voz,
    role_id: data.role,
    frequency: data.frequencia,
    day_of_week: data.dia_da_semana,
    time: data.horario,
    price: data.valor.toString(),
    current_players: 0,
    current_staff_players: 0,
    max_staff_players: !isNull(data.vagas_staff) ? Number(data.vagas_staff) : 0,
    start_date: data.data_primeira_sessao,
    closed_date: null,
    is_active: true,
    generate_calendar: true,
    created_by_discord_id: createdByUser ?? null,
    is_one_shot: isDdal || (!isNull(data.one_shot) ? data.one_shot : false),
    is_ongoing: !isNull(data.em_andamento) ? data.em_andamento : false,
    is_being_promoted: !isNull(data.em_divulgacao) ? data.em_divulgacao : false,
    is_ddal: isDdal,
  }

  return newGameData
}