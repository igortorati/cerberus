import { DAY_OF_WEEK } from "../enums/daysOfWeek"
import { FREQUENCY } from "../enums/frequency"
import { SESSION_TYPE } from "../enums/sessionType"

export const ERROR_DURING_TABLE_CREATION = 'Ocorreu um erro ao criar a mesa.'
export const ERROR_DURING_TABLE_RETRIEVAL = 'Ocorreu um erro ao recuperar a mesa.'
export const ERROR_DURING_TABLE_UPDATE = 'Ocorreu um erro ao atualizar a mesa.'
export const ERROR_DURING_TABLE_DELETION = 'Ocorreu um erro ao deletar a mesa.'
export const ERROR_TABLE_NOT_FOUND = 'Mesa não encontrada ou inativa.'
export const ERROR_SESSION_ALREADY_SCHEDULED = 'Sessão já está agendada para essa mesa nessa data.'
export const ERROR_ORIGIN_NOT_FOUND = 'A Origem selecionada não foi encontrada.'



export const INVALID_ID_MESSAGE = 'ID da mesa inválido.'
export const INVALID_SESSION_TYPE = `Tipo de agendamento invalido, deve seguir o formato adequado (${Object.values(SESSION_TYPE).join(", ")}).`
export const INVALID_REASON_TOO_LONG = 'O motivo deve ter no máximo 150 caracteres.'
export const INVALID_DATE_FORMAT = 'Formato de data de início inválido. Use dd/mm/aaaa e insira uma data válida.'
export const INVALID_TIME_FORMAT = 'Formato de horário inválido. Use HH:mm.'
export const INVALID_MAX_PLAYERS_VALUE = 'O número total de vagas deve ser um inteiro.'
export const INVALID_TABLE_NAME_TOO_SHORT = 'O nome da mesa deve ter pelo menos 3 caracteres.'
export const INVALID_TABLE_NAME_TOO_LONG = 'O nome da mesa deve ter no máximo 150 caracteres.'
export const INVALID_DM_ID = 'ID do mestre inválido.'
export const INVALID_MAX_PLAYER_TOO_FEW = 'A mesa deve ter pelo menos 1 vaga.'
export const INVALID_MAX_STAFF_PLAYERS_NEGATIVE = 'Não pode haver menos de 0 vagas de Staff.'
export const INVALID_TEXT_CHANNEL_ID = 'ID do canal de texto inválido.'
export const INVALID_VOICE_CHANNEL_ID = 'ID do canal de voz inválido.'
export const INVALID_ROLE_ID = 'ID do cargo inválido.'
export const INVALID_FREQUENCY = `Frequência da mesa é obrigatória e deve seguir o formato adequado (${Object.values(FREQUENCY).join(", ")}).`
export const INVALID_DAY_OF_WEEK = `Dia da semana é obrigatório e deve seguir o formato adequado (${Object.values(DAY_OF_WEEK).join(", ")}).`
export const INVALID_PRICE_NEGATIVE = 'O valor não pode ser negativo.'
export const INVALID_COMMAND_EXECUTOR_ID = 'ID do criador inválido.'